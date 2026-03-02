import { TimelineStep, ArmyState, UnitData, TechData } from './types';
import { CombatSim } from './CombatSim';

export interface ProductionEvent {
  time: number;
  msg: string;
}

export interface EconomyPoint {
  time: number;
  gathered: number;
  spent: number;
  spentOnVillagers: number;
  spentOnUnits: number;
  spentOnBuildings: number;
  spentOnTechs: number;
}

export interface ProductionResult {
  count: number;
  cost: { f: number; w: number; g: number };
  events: ProductionEvent[];
  unitsPerSecond: number;
  economyHistory: EconomyPoint[];
}

export interface ProductionAnalysisResult {
  labels: string[];
  countA: number[];
  countB: number[];
  advantage: number[];
  economyA: EconomyPoint[];
  economyB: EconomyPoint[];
  finalResA: ProductionResult;
  finalResB: ProductionResult;
  tideTurnsAt: number | null;
  winnerAtTideTurn: string | null;
  countAtTideTurnA: number | null;
  countAtTideTurnB: number | null;
}

export function analyzeProduction(
  stateA: ArmyState,
  stateB: ArmyState,
  unitA: UnitData,
  unitB: UnitData,
  techsById: Record<number, TechData>,
  allUnits: Record<string, UnitData>,
  maxTime: number = 1800,
  step: number = 15
): ProductionAnalysisResult {
  const result: any = { 
    labels: [], countA: [], countB: [], advantage: [], 
    economyA: [], economyB: [], 
    finalResA: null, finalResB: null,
    tideTurnsAt: null,
    winnerAtTideTurn: null,
    countAtTideTurnA: null,
    countAtTideTurnB: null
  };

  const baseCostA = { f: unitA.f, w: unitA.w, g: unitA.g };
  const baseCostB = { f: unitB.f, w: unitB.w, g: unitB.g };

  let currentWinner: 'a' | 'b' | null = null;

  for (let t = 0; t <= maxTime; t += step) {
    const resA = calculateCount(t, stateA.tl || [], baseCostA, stateA.cont, stateA.sv);
    const resB = calculateCount(t, stateB.tl || [], baseCostB, stateB.cont, stateB.sv);
    
    result.labels.push(Math.floor(t / 60) + 'm' + (t % 60 ? (t % 60) + 's' : ''));
    result.countA.push(resA.count);
    result.countB.push(resB.count);
    result.economyA.push(resA.economyHistory[resA.economyHistory.length - 1]);
    result.economyB.push(resB.economyHistory[resB.economyHistory.length - 1]);

    let adv = 0;
    if (resA.count > 0 || resB.count > 0) {
      if (resA.count > 0 && resB.count > 0) {
        const sim = new CombatSim(unitA, unitB, { ...stateA, c: resA.count }, { ...stateB, c: resB.count }, techsById, allUnits);
        const combatRes = sim.run();
        adv = combatRes.armyA.totalHp > combatRes.armyB.totalHp 
          ? (combatRes.armyA.totalHp / combatRes.armyA.initialTotalHp) * 100 
          : -(combatRes.armyB.totalHp / combatRes.armyB.initialTotalHp) * 100;
      } else if (resA.count > 0) {
        adv = 100;
      } else {
        adv = -100;
      }
    }
    result.advantage.push(adv);

    const winner = adv > 0 ? 'a' : (adv < 0 ? 'b' : null);
    if (winner && currentWinner && winner !== currentWinner && result.tideTurnsAt === null) {
      result.tideTurnsAt = t;
      result.winnerAtTideTurn = winner === 'a' ? unitA.name : unitB.name;
      result.countAtTideTurnA = resA.count;
      result.countAtTideTurnB = resB.count;
    }
    if (winner && !currentWinner) currentWinner = winner;

    if (t + step > maxTime) {
      result.finalResA = resA;
      result.finalResB = resB;
    }
  }

  return result;
}

export function calculateCount(
  t: number,
  timelineSteps: TimelineStep[],
  unitBaseCost: { f: number; w: number; g: number } = { f: 0, w: 0, g: 0 },
  initialContinuousVillagers: boolean = false,
  initialVillagers: number = 3
): ProductionResult {
  let unitsCount = 0;
  let villagers = initialVillagers || 3;
  
  // Starting state
  let militaryCapacity = 0;
  let tcCapacity = 1;
  let tcContinuous = initialContinuousVillagers;
  let militaryContinuous = false;
  let trainTime = 30;
  let currentUnitCost = { ...unitBaseCost };

  // If no timeline, assume 1 facility producing infinite
  if (timelineSteps.length === 0) {
    militaryCapacity = 1;
    militaryContinuous = true;
  }

  // Resource Tracking
  let gatheredTotal = 0;
  let spentTotal = 0;
  let spentOnVillagers = 0;
  let spentOnUnits = 0;
  let spentOnBuildings = 0;
  let spentOnTechs = 0;
  const gatheringRate = 0.35;
  const economyHistory: EconomyPoint[] = [];

  // TC and Military production progress
  let tcProgress = 0;
  let milProgress = 0;

  const steps = JSON.parse(JSON.stringify(timelineSteps)) as (TimelineStep & { started?: boolean; startTime?: number; finished?: boolean })[];
  let currentStepIdx = 0;
  const events: ProductionEvent[] = [];

  for (let s = 0; s <= t; s++) {
    // 1. Gather resources
    gatheredTotal += villagers * gatheringRate;

    // 2. Process Build Order
    if (currentStepIdx < steps.length) {
      const step = steps[currentStepIdx];
      
      if (!step.started) {
        if (step.t === 'units' || step.t === 'wait') {
          if (unitsCount >= (step.c || 0)) {
            events.push({ time: s, msg: `Goal reached: ${step.c} units. [${unitsCount} units]` });
            currentStepIdx++;
          }
        } else {
          const count = step.c || 1;
          const cost = ((step.f || 0) + (step.w || 0) + (step.g || 0) + (step.co || 0)) * count;
          if (gatheredTotal - spentTotal >= cost) {
            step.started = true;
            step.startTime = s;
            spentTotal += cost;
            if (step.t === 'villagers') spentOnVillagers += cost;
            else if (step.t === 'building') spentOnBuildings += cost;
            else if (step.t === 'tech') spentOnTechs += cost;
            else if (step.t === 'production') spentOnUnits += cost;
            
            const blockingMsg = step.b ? ` (Blocking ${step.bt === 109 ? 'Vills' : 'Units'})` : '';
            events.push({ time: s, msg: `Started: ${step.n || step.t}${blockingMsg} [${unitsCount} units]` });
          }
        }
      }

      // Check for finish
      if (step && step.started && !step.finished) {
        const count = step.c || 1;
        const duration = (step.d || 0) * count;
        if (s >= (step.startTime || 0) + duration) {
          step.finished = true;
          events.push({ time: s, msg: `Finished: ${step.n || step.t} [${unitsCount} units]` });
          if (step.t === 'building') {
            if (step.prod) militaryCapacity += count;
            if (step.bt === 109) tcCapacity += count;
          } else if (step.t === 'villagers') {
            villagers += count;
            if (step.inf) tcContinuous = true;
          } else if (step.t === 'production') {
            trainTime = step.tr || trainTime;
            militaryCapacity += (step.v || 0);
            if (step.inf) militaryContinuous = true;
          }
          currentStepIdx++;
        }
      }
    }

    // 3. Determine active capacity (taking blocking into account)
    let activeTCs = tcCapacity;
    let activeMilitary = militaryCapacity;
    const runningStep = steps[currentStepIdx];
    if (runningStep && runningStep.started && !runningStep.finished && runningStep.b) {
      if (runningStep.bt === 109) activeTCs = Math.max(0, activeTCs - 1);
      else activeMilitary = Math.max(0, activeMilitary - 1);
    }

    // 4. Production execution
    if (activeTCs > 0 && tcContinuous) {
      tcProgress += activeTCs * (1 / 25); 
      while (tcProgress >= 0.9999) {
        villagers++;
        tcProgress -= 1;
        const cost = 50;
        spentTotal += cost;
        spentOnVillagers += cost;
      }
    }

    if (activeMilitary > 0 && militaryContinuous && trainTime > 0) {
      milProgress += activeMilitary * (1 / trainTime);
      while (milProgress >= 0.9999) {
        unitsCount++;
        milProgress -= 1;
        const unitCost = currentUnitCost.f + currentUnitCost.w + currentUnitCost.g;
        const cost = (unitCost || 100);
        spentTotal += cost;
        spentOnUnits += cost;
      }
    }

    if (s % 10 === 0) {
      economyHistory.push({
        time: s,
        gathered: gatheredTotal,
        spent: spentTotal,
        spentOnVillagers,
        spentOnUnits,
        spentOnBuildings,
        spentOnTechs
      });
    }
  }

  const unitsPerSecond = trainTime > 0 ? (militaryCapacity * (militaryContinuous ? 1 : 0)) / trainTime : 0;
  return { count: unitsCount, cost: currentUnitCost, events, unitsPerSecond, economyHistory };
}

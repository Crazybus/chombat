import { TimelineStep } from './types';

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

import { CombatSim } from './CombatSim';
import { ArmyState, UnitData, TechData } from './types';

export interface ProductionAnalysisResult {
  labels: string[];
  countA: number[];
  countB: number[];
  advantage: number[];
  economyA: EconomyPoint[];
  economyB: EconomyPoint[];
  finalResA: ProductionResult;
  finalResB: ProductionResult;
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
    finalResA: null, finalResB: null 
  };

  const baseCostA = { f: unitA.f, w: unitA.w, g: unitA.g };
  const baseCostB = { f: unitB.f, w: unitB.w, g: unitB.g };

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
  initialCost: { f: number; w: number; g: number } = { f: 0, w: 0, g: 0 },
  continuousVillagers: boolean = false,
  initialVillagers: number = 3
): ProductionResult {
  let unitsCount = 0;
  let currentBuild = 0;
  let productionDebt = 0;
  let currentTrain = 30;
  let currentCost = { ...initialCost };

  // Economy tracking
  let villagers = initialVillagers; // Start with specified vills
  let gatheredTotal = 0;
  let spentTotal = 0;
  let spentOnVillagers = 0;
  let spentOnUnits = 0;
  let spentOnBuildings = 0;
  let spentOnTechs = 0;
  const gatheringRate = 0.35; // Rough average res/sec/vill
  const economyHistory: EconomyPoint[] = [];

  // TC management
  let tcBlockedUntil = -1;
  let villagerProgress = 0;

  const steps = JSON.parse(JSON.stringify(timelineSteps)) as (TimelineStep & { started?: boolean; startTime?: number; wasActuallyBlocking?: boolean; unblockTime?: number })[];
  let stepIdx = 0;
  const events: ProductionEvent[] = [];

  for (let s = 0; s <= t; s++) {
    // 1. Gather resources
    gatheredTotal += villagers * gatheringRate;

    // 2. Continuous Villagers logic
    if (continuousVillagers && s >= tcBlockedUntil) {
      villagerProgress += 1 / 25; // 25s train time
      if (villagerProgress >= 1) {
        villagers++;
        villagerProgress -= 1;
        spentTotal += 50; // Cost of a villager
        spentOnVillagers += 50;
      }
    }

    // 3. Process Timeline Steps
    while (stepIdx < steps.length) {
      const step = steps[stepIdx];
      const count = step.c || 1;
      const delay = (step.d || 0) * count;

      if (!step.started) {
        step.started = true;
        step.startTime = s;
        events.push({ time: s, msg: `Started: ${step.n || step.t} (at ${unitsCount} units)` });

        // Cost application
        const unitCost = (step.f || 0) + (step.w || 0) + (step.g || 0);
        const stepCost = (unitCost || step.co || 0) * count;
        spentTotal += stepCost;

        // Categorize spending
        if (step.t === 'villagers') {
          spentOnVillagers += stepCost;
        } else if (step.t === 'building') {
          spentOnBuildings += stepCost;
        } else if (step.t === 'tech') {
          spentOnTechs += stepCost;
        } else if (step.t === 'production') {
          spentOnUnits += stepCost;
        }

        if (step.b) {
          if (step.t === 'age' || (step.t === 'tech' && step.bt === 109)) {
            tcBlockedUntil = s + delay;
          }
          if (currentBuild > 0) {
            step.unblockTime = s + delay;
            currentBuild = Math.max(0, currentBuild - 1);
            step.wasActuallyBlocking = true;
          }
        }
      }

      if (s >= (step.startTime || 0) + delay) {
        if (step.wasActuallyBlocking) {
          currentBuild++;
          step.wasActuallyBlocking = false;
        }
        events.push({ time: s, msg: `Finished: ${step.n || step.t}` });

        if (step.t === 'building' || step.t === 'prod' || step.t === 'villagers') {
          if (step.t === 'villagers') {
            villagers += (step.v || 0);
          } else if (step.t === 'building') {
            // Count buildings with production checkbox enabled
            if (step.prod) {
              currentBuild++;
              events.push({ time: s, msg: `Production Capacity +1` });
            }
          } else if (step.t === 'prod') {
            if (step.prod) {
              currentBuild++;
              events.push({ time: s, msg: `Production Capacity +1` });
            }
          }
        } else if (step.t === 'production') {
          // Production step just sets the train time and immediately provides production capacity
          currentBuild += (step.v || 0);
          currentTrain = step.tr || currentTrain;
          events.push({ time: s, msg: `Production speed set to ${currentTrain}s` });
        } else if (step.t === 'cost') {
          currentCost = { f: step.f || 0, w: step.w || 0, g: step.g || 0 };
        }
        stepIdx++;
      } else break;
    }

    // 4. Military Production
    if (currentBuild > 0 && currentTrain > 0) {
      const rate = currentBuild / currentTrain;
      productionDebt += rate;
      if (productionDebt >= 1) {
        const n = Math.floor(productionDebt);
        unitsCount += n;
        productionDebt -= n;
        // Cost for produced units
        const c = currentCost.f + currentCost.w + currentCost.g;
        const unitCostTotal = n * (c || 100);
        spentTotal += unitCostTotal;
        spentOnUnits += unitCostTotal;
      }
    }

    // 5. Record economy
    if (s % 10 === 0) {
      economyHistory.push({
        time: s,
        gathered: gatheredTotal,
        spent: spentTotal,
        spentOnVillagers: spentOnVillagers,
        spentOnUnits: spentOnUnits,
        spentOnBuildings: spentOnBuildings,
        spentOnTechs: spentOnTechs
      });
    }
  }

  const unitsPerSecond = currentTrain > 0 ? currentBuild / currentTrain : 0;
  return { count: unitsCount, cost: currentCost, events, unitsPerSecond, economyHistory };
}

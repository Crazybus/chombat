import { TimelineStep, ArmyState, UnitData, TechData } from './types';
import { CombatSim } from './CombatSim';

export interface ProductionEvent {
  time: number;
  msg: string;
  army: 'a' | 'b' | 'system';
  villsA: number;
  unitsA: number;
  villsB: number;
  unitsB: number;
  important?: boolean;
}

export interface EconomyTick {
  time: number;
  gathered: number;
  spent: number;
  spentOnVillagers: number;
  spentOnUnits: number;
  spentOnBuildings: number;
  spentOnTechs: number;
  vills: number;
}

export interface ProductionResult {
  count: number;
  villagers: number;
  cost: { f: number; w: number; g: number };
  events: { time: number; msg: string; vills: number; units: number; important?: boolean }[];
  unitsPerSecond: number;
  economyHistory: EconomyTick[];
  stateAtTime: { vills: number; units: number }[];
}

export interface ProductionAnalysisResult {
  labels: string[];
  countA: number[];
  countB: number[];
  advantage: number[];
  economyA: EconomyTick[];
  economyB: EconomyTick[];
  finalResA: ProductionResult;
  finalResB: ProductionResult;
  tideTurnsAt: number | null;
  winnerAtTideTurn: string | null;
  countAtTideTurnA: number | null;
  countAtTideTurnB: number | null;
  firstUnitsAt: number | null;
  countAtFirstA: number | null;
  countAtFirstB: number | null;
  mergedEvents: ProductionEvent[];
}

export function smooth(arr: number[], windowSize: number = 5): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += arr[j];
      count++;
    }
    result.push(sum / count);
  }
  return result;
}

export function analyzeProduction(
  stateA: ArmyState,
  stateB: ArmyState,
  unitA: UnitData,
  unitB: UnitData,
  techsById: Record<number, TechData>,
  allUnits: Record<string, UnitData>,
  maxTime: number = 1800,
  step: number = 15,
): ProductionAnalysisResult {
  const baseCostA = {
    f: stateA.af !== undefined ? stateA.af : unitA.f || 0,
    w: stateA.aw !== undefined ? stateA.aw : unitA.w || 0,
    g: stateA.ag !== undefined ? stateA.ag : unitA.g || 0,
  };
  const baseCostB = {
    f: stateB.af !== undefined ? stateB.af : unitB.f || 0,
    w: stateB.aw !== undefined ? stateB.aw : unitB.w || 0,
    g: stateB.ag !== undefined ? stateB.ag : unitB.g || 0,
  };

  const resA = calculateCount(maxTime, stateA.tl || [], baseCostA, stateA.sv);
  const resB = calculateCount(maxTime, stateB.tl || [], baseCostB, stateB.sv);

  const result: any = {
    labels: [],
    countA: [],
    countB: [],
    advantage: [],
    economyA: [],
    economyB: [],
    finalResA: resA,
    finalResB: resB,
    tideTurnsAt: null,
    winnerAtTideTurn: null,
    countAtTideTurnA: null,
    countAtTideTurnB: null,
    firstUnitsAt: null,
    countAtFirstA: null,
    countAtFirstB: null,
    mergedEvents: [],
  };

  let currentWinner: 'a' | 'b' | null = null;

  for (let t = 0; t <= maxTime; t += step) {
    const sA = resA.stateAtTime[t] || { vills: resA.villagers, units: resA.count };
    const sB = resB.stateAtTime[t] || { vills: resB.villagers, units: resB.count };
    const ecoA = resA.economyHistory.find((e) => e.time >= t) || resA.economyHistory[resA.economyHistory.length - 1];
    const ecoB = resB.economyHistory.find((e) => e.time >= t) || resB.economyHistory[resB.economyHistory.length - 1];

    result.labels.push(Math.floor(t / 60) + 'm' + (t % 60 ? (t % 60) + 's' : ''));
    result.countA.push(sA.units);
    result.countB.push(sB.units);
    result.economyA.push(ecoA);
    result.economyB.push(ecoB);

    if (result.firstUnitsAt === null && sA.units > 0 && sB.units > 0) {
      result.firstUnitsAt = t;
      result.countAtFirstA = sA.units;
      result.countAtFirstB = sB.units;
    }

    let adv = 0;
    if (sA.units > 0 || sB.units > 0) {
      if (sA.units > 0 && sB.units > 0) {
        const sim = new CombatSim(
          unitA,
          unitB,
          { ...stateA, c: sA.units },
          { ...stateB, c: sB.units },
          techsById,
          allUnits,
        );
        const combatRes = sim.run();
        adv =
          combatRes.armyA.totalHp > combatRes.armyB.totalHp
            ? (combatRes.armyA.totalHp / combatRes.armyA.initialTotalHp) * 100
            : -(combatRes.armyB.totalHp / combatRes.armyB.initialTotalHp) * 100;
      } else if (sA.units > 0) adv = 100;
      else adv = -100;
    }
    result.advantage.push(adv);

    const winner = adv > 0 ? 'a' : adv < 0 ? 'b' : null;
    if (winner && currentWinner && winner !== currentWinner && result.tideTurnsAt === null) {
      result.tideTurnsAt = t;
      result.winnerAtTideTurn = winner === 'a' ? unitA.name : unitB.name;
      result.countAtTideTurnA = sA.units;
      result.countAtTideTurnB = sB.units;
    }
    if (winner && !currentWinner) currentWinner = winner;
  }

  if (result.winnerAtTideTurn === null && currentWinner) {
    result.winnerAtTideTurn = currentWinner === 'a' ? unitA.name : unitB.name;
  }

  const allEvents: ProductionEvent[] = [];
  resA.events.forEach((e) => {
    const sB = resB.stateAtTime[e.time] || { vills: resB.villagers, units: resB.count };
    allEvents.push({
      time: e.time,
      msg: e.msg,
      army: 'a',
      villsA: e.vills,
      unitsA: e.units,
      villsB: sB.vills,
      unitsB: sB.units,
      important: e.important,
    });
  });
  resB.events.forEach((e) => {
    const sA = resA.stateAtTime[e.time] || { vills: resA.villagers, units: resA.count };
    allEvents.push({
      time: e.time,
      msg: e.msg,
      army: 'b',
      villsB: e.vills,
      unitsB: e.units,
      villsA: sA.vills,
      unitsA: sA.units,
      important: e.important,
    });
  });

  if (result.tideTurnsAt !== null) {
    const t = result.tideTurnsAt;
    const sA = resA.stateAtTime[t] || { vills: resA.villagers, units: resA.count };
    const sB = resB.stateAtTime[t] || { vills: resB.villagers, units: resB.count };
    allEvents.push({
      time: t,
      msg: `The tide turns! ${result.winnerAtTideTurn} takes the lead.`,
      army: 'system',
      villsA: sA.vills,
      unitsA: sA.units,
      villsB: sB.vills,
      unitsB: sB.units,
      important: true,
    });
  }

  // Add Final Status event
  const sAFinal = resA.stateAtTime[maxTime] || { vills: resA.villagers, units: resA.count };
  const sBFinal = resB.stateAtTime[maxTime] || { vills: resB.villagers, units: resB.count };
  allEvents.push({
    time: maxTime,
    msg: result.tideTurnsAt === null ? 'Final Standings' : 'End of simulation',
    army: 'system',
    villsA: sAFinal.vills,
    unitsA: sAFinal.units,
    villsB: sBFinal.vills,
    unitsB: sBFinal.units,
    important: result.tideTurnsAt === null,
  });

  let lastEventTime = 0;
  const sorted = allEvents.sort((a, b) => a.time - b.time || (a.army === 'system' ? 1 : a.army === 'a' ? -1 : 1));
  const withPeriodic: ProductionEvent[] = [];

  for (let t = 0; t <= maxTime; t++) {
    const eventsAtT = sorted.filter((e) => e.time === t);
    if (eventsAtT.length > 0) {
      eventsAtT.forEach((e) => withPeriodic.push(e));
      lastEventTime = t;
    } else if (t - lastEventTime >= 300) {
      const sA = resA.stateAtTime[t] || { vills: resA.villagers, units: resA.count };
      const sB = resB.stateAtTime[t] || { vills: resB.villagers, units: resB.count };
      withPeriodic.push({
        time: t,
        msg: 'Status Update',
        army: 'system',
        villsA: sA.vills,
        unitsA: sA.units,
        villsB: sB.vills,
        unitsB: sB.units,
      });
      lastEventTime = t;
    }
  }

  result.mergedEvents = withPeriodic;

  return result;
}

export function calculateCount(
  t: number,
  timelineSteps: TimelineStep[],
  unitBaseCost: { f: number; w: number; g: number } = { f: 0, w: 0, g: 0 },
  initialVillagers: number = 3,
): ProductionResult {
  let unitsCount = 0;
  const hasVillProduction = timelineSteps.some((s) => s.t === 'villagers');
  let villagers = hasVillProduction ? initialVillagers || 3 : 0;

  let militaryCapacity = 0;
  let tcCapacity = 1;
  let tcContinuous = false;
  let militaryContinuous = false;
  let trainTime = 30;
  let currentUnitCost = { ...unitBaseCost };

  if (timelineSteps.length === 0) {
    militaryCapacity = 1;
    militaryContinuous = true;
  }

  const gatheringRate = 0.35;
  let gatheredTotal = villagers * gatheringRate;
  let spentTotal = 0;
  let spentOnVillagers = 0;
  let spentOnUnits = 0;
  let spentOnBuildings = 0;
  let spentOnTechs = 0;
  const economyHistory: EconomyTick[] = [];
  const stateAtTime: { vills: number; units: number }[] = [];

  let tcProgress = 0;
  let milProgress = 0;

  const steps = JSON.parse(JSON.stringify(timelineSteps)) as (TimelineStep & {
    started?: boolean;
    startTime?: number;
    finished?: boolean;
  })[];
  let currentStepIdx = 0;
  const events: { time: number; msg: string; vills: number; units: number; important?: boolean }[] = [];

  let firstUnitProduced = false;

  for (let s = 0; s <= t; s++) {
    stateAtTime[s] = { vills: villagers, units: unitsCount };

    let processing = true;
    while (processing) {
      processing = false;
      const step = steps[currentStepIdx];
      if (!step) break;

      if (!step.started) {
        if (step.t === 'units' || step.t === 'wait') {
          if (unitsCount >= (step.c || 0)) {
            events.push({ time: s, msg: `Goal reached: ${step.c} units.`, vills: villagers, units: unitsCount });
            currentStepIdx++;
            processing = true;
            continue;
          }
        } else {
          // Buildings and Techs spend upfront. Villagers and Production spend per-unit in the loop.
          const count = step.t === 'building' ? step.c || 1 : 1;
          const isUpfront = step.t === 'building' || step.t === 'tech';
          const cost = isUpfront ? ((step.f || 0) + (step.w || 0) + (step.g || 0) + (step.co || 0)) * count : 0;

          if (gatheredTotal - spentTotal >= cost) {
            step.started = true;
            step.startTime = s;
            spentTotal += cost;
            if (step.t === 'building') spentOnBuildings += cost;
            else if (step.t === 'tech') spentOnTechs += cost;

            if (step.lim || step.b) {
              let msg = '';
              if (step.t === 'villagers') msg = `Creating ${count} villagers`;
              else if (step.t === 'building') msg = `Building ${count} ${step.n || step.t}`;
              else if (step.t === 'tech') msg = `Started researching ${step.n}`;
              else if (step.t === 'production') msg = `Producing ${count} ${step.n}`;
              else msg = `Started: ${step.n || step.t}`;

              const important = step.t === 'tech' && (step.n || '').toLowerCase().includes('age');
              events.push({ time: s, msg, vills: villagers, units: unitsCount, important });
            } else if (step.t === 'production') {
              events.push({
                time: s,
                msg: `${step.n || 'Unit production'} started`,
                vills: villagers,
                units: unitsCount,
              });
            }

            const duration = step.lim ? (step.d || 0) * count : 0;
            if (duration !== 0) break;
          } else break;
        }
      }

      if (step.started && !step.finished) {
        const count = step.c || 1;
        const duration = step.lim ? (step.d || 0) * count : 0;
        if (s >= (step.startTime || 0) + duration) {
          step.finished = true;
          if (step.lim || step.b || step.t === 'tech') {
            let msg = '';
            if (step.t === 'building') msg = `Built ${count} ${step.n || step.t}`;
            else if (step.t === 'tech') msg = `Researched ${step.n}`;
            else if (step.t === 'villagers') msg = `Created ${count} villagers`;
            else msg = `Finished: ${step.n || step.t}`;

            const important = step.t === 'tech' && (step.n || '').toLowerCase().includes('age');
            events.push({ time: s, msg, vills: villagers, units: unitsCount, important });
          }

          if (step.t === 'building') {
            if (step.prod) militaryCapacity += count;
            if (step.bt === 109) tcCapacity += count;
          } else if (step.t === 'villagers') {
            if (!step.lim) tcContinuous = true;
          } else if (step.t === 'production') {
            trainTime = step.tr || trainTime;
            militaryCapacity += step.v || 0;
            if (!step.lim) militaryContinuous = true;
            if (step.f !== undefined) currentUnitCost.f = step.f;
            if (step.w !== undefined) currentUnitCost.w = step.w;
            if (step.g !== undefined) currentUnitCost.g = step.g;
            if (step.co !== undefined && step.co > 0) {
              const total = (currentUnitCost.f || 0) + (currentUnitCost.w || 0) + (currentUnitCost.g || 0);
              if (total > 0) {
                const ratio = step.co / total;
                currentUnitCost.f *= ratio;
                currentUnitCost.w *= ratio;
                currentUnitCost.g *= ratio;
              } else currentUnitCost.g = step.co;
            }
          }
          currentStepIdx++;
          processing = true;
        }
      }
    }

    let activeTCs = tcCapacity;
    let activeMilitary = militaryCapacity;
    const runningStep = steps[currentStepIdx];
    if (runningStep && runningStep.started && !runningStep.finished && runningStep.b) {
      // Production/Villager steps shouldn't block themselves from using the capacity they need
      if (runningStep.bt === 109) {
        if (runningStep.t !== 'villagers') activeTCs = Math.max(0, activeTCs - 1);
      } else {
        if (runningStep.t !== 'production') activeMilitary = Math.max(0, activeMilitary - 1);
      }
    }

    if (activeTCs > 0) {
      const isActiveStep = runningStep?.started && !runningStep.finished && runningStep.t === 'villagers';
      if (tcContinuous || isActiveStep) {
        tcProgress += activeTCs * (1 / 25);
      }
    }
    while (tcProgress >= 0.99) {
      villagers++;
      tcProgress -= 1;
      const vCost = runningStep?.t === 'villagers' && runningStep.co !== undefined ? runningStep.co : 50;
      spentTotal += vCost;
      spentOnVillagers += vCost;
    }

    if (activeMilitary > 0 && trainTime > 0) {
      const isActiveStep = runningStep?.started && !runningStep.finished && runningStep.t === 'production';
      if (militaryContinuous || isActiveStep) {
        milProgress += activeMilitary * (1 / trainTime);
      }
    }
    while (milProgress >= 0.99) {
      unitsCount++;
      milProgress -= 1;
      const cost = (currentUnitCost.f || 0) + (currentUnitCost.w || 0) + (currentUnitCost.g || 0);
      spentTotal += cost;
      spentOnUnits += cost;

      if (!firstUnitProduced && unitsCount > 0) {
        firstUnitProduced = true;
        events.push({ time: s, msg: 'First unit produced!', vills: villagers, units: unitsCount, important: true });
      }
    }

    if (s % 10 === 0 || s === t) {
      economyHistory.push({
        time: s,
        gathered: gatheredTotal,
        spent: spentTotal,
        spentOnVillagers,
        spentOnUnits,
        spentOnBuildings,
        spentOnTechs,
        vills: villagers,
      });
    }
    gatheredTotal += villagers * gatheringRate;
  }

  const unitsPerSecond = trainTime > 0 ? (militaryCapacity * (militaryContinuous ? 1 : 0)) / trainTime : 0;
  return { count: unitsCount, villagers, cost: currentUnitCost, events, unitsPerSecond, economyHistory, stateAtTime };
}

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
  cost: { food: number; wood: number; gold: number };
  events: { time: number; msg: string; vills: number; units: number; important?: boolean }[];
  unitsPerSecond: number;
  economyHistory: EconomyTick[];
  stateAtTime: { vills: number; units: number }[];
  spentOnVillagers: number;
  spentOnBuildings: number;
  spentOnTechs: number;
  spentOnUnits: number;
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
    food: stateA.overrides?.cost?.food !== undefined ? stateA.overrides.cost.food : unitA.food || 0,
    wood: stateA.overrides?.cost?.wood !== undefined ? stateA.overrides.cost.wood : unitA.wood || 0,
    gold: stateA.overrides?.cost?.gold !== undefined ? stateA.overrides.cost.gold : unitA.gold || 0,
  };
  const baseCostB = {
    food: stateB.overrides?.cost?.food !== undefined ? stateB.overrides.cost.food : unitB.food || 0,
    wood: stateB.overrides?.cost?.wood !== undefined ? stateB.overrides.cost.wood : unitB.wood || 0,
    gold: stateB.overrides?.cost?.gold !== undefined ? stateB.overrides.cost.gold : unitB.gold || 0,
  };

  const resA = calculateCount(maxTime, stateA.timeline || [], baseCostA, stateA.startVillagers);
  const resB = calculateCount(maxTime, stateB.timeline || [], baseCostB, stateB.startVillagers);

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
          { ...stateA, count: sA.units },
          { ...stateB, count: sB.units },
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
  unitBaseCost: { food: number; wood: number; gold: number } = { food: 0, wood: 0, gold: 0 },
  initialVillagers: number = 3,
): ProductionResult {
  let unitsCount = 0;
  const hasVillProduction = timelineSteps.some((s) => s.type === 'villagers');
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
        if (step.type === 'units' || step.type === 'wait') {
          if (unitsCount >= (step.count || 0)) {
            events.push({ time: s, msg: `Goal reached: ${step.count} units.`, vills: villagers, units: unitsCount });
            currentStepIdx++;
            processing = true;
            continue;
          }
        } else {
          // Buildings and Techs spend upfront. Villagers and Production spend per-unit in the loop.
          const count = step.count || 1;
          const isUpfront = step.type === 'building' || step.type === 'tech';
          const cost = isUpfront
            ? ((step.food || 0) + (step.wood || 0) + (step.gold || 0) + (step.cost || 0)) * count
            : 0;

          if (gatheredTotal - spentTotal >= cost) {
            step.started = true;
            step.startTime = s;
            spentTotal += cost;
            if (step.type === 'building') spentOnBuildings += cost;
            else if (step.type === 'tech') spentOnTechs += cost;

            if (step.limitedProduction || step.isBlocking) {
              let msg = '';
              if (step.type === 'villagers') msg = `Creating ${count} villagers`;
              else if (step.type === 'building') msg = `Building ${count} ${step.name || step.type}`;
              else if (step.type === 'tech') msg = `Started researching ${step.name}`;
              else if (step.type === 'production') msg = `Producing ${count} ${step.name}`;
              else msg = `Started: ${step.name || step.type}`;

              const important = step.type === 'tech' && (step.name || '').toLowerCase().includes('age');
              events.push({ time: s, msg, vills: villagers, units: unitsCount, important });
            } else if (step.type === 'production') {
              events.push({
                time: s,
                msg: `${step.name || 'Unit production'} started`,
                vills: villagers,
                units: unitsCount,
              });
            }

            const duration = step.limitedProduction ? (step.delay || 0) * count : 0;
            if (duration !== 0) break;
          } else break;
        }
      }

      if (step.started && !step.finished) {
        const count = step.count || 1;
        const duration = step.limitedProduction ? (step.delay || 0) * count : 0;
        if (s >= (step.startTime || 0) + duration) {
          step.finished = true;
          if (step.limitedProduction || step.isBlocking || step.type === 'tech') {
            let msg = '';
            if (step.type === 'building') msg = `Built ${count} ${step.name || step.type}`;
            else if (step.type === 'tech') msg = `Researched ${step.name}`;
            else if (step.type === 'villagers') msg = `Created ${count} villagers`;
            else msg = `Finished: ${step.name || step.type}`;

            const important = step.type === 'tech' && (step.name || '').toLowerCase().includes('age');
            events.push({ time: s, msg, vills: villagers, units: unitsCount, important });
          }

          if (step.type === 'building') {
            if (step.producesUnits) militaryCapacity += count;
            if (step.buildingTarget === 109) tcCapacity += count;
          } else if (step.type === 'villagers') {
            if (!step.limitedProduction) tcContinuous = true;
          } else if (step.type === 'production') {
            trainTime = step.trainSpeed || trainTime;
            militaryCapacity += step.value || 0;
            if (!step.limitedProduction) militaryContinuous = true;
            if (step.food !== undefined) currentUnitCost.food = step.food;
            if (step.wood !== undefined) currentUnitCost.wood = step.wood;
            if (step.gold !== undefined) currentUnitCost.gold = step.gold;
            if (step.cost !== undefined && step.cost > 0) {
              const total = (currentUnitCost.food || 0) + (currentUnitCost.wood || 0) + (currentUnitCost.gold || 0);
              if (total > 0) {
                const ratio = step.cost / total;
                currentUnitCost.food *= ratio;
                currentUnitCost.wood *= ratio;
                currentUnitCost.gold *= ratio;
              } else currentUnitCost.gold = step.cost;
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
    if (runningStep && runningStep.started && !runningStep.finished && runningStep.isBlocking) {
      // Production/Villager steps shouldn't block themselves from using the capacity they need
      if (runningStep.buildingTarget === 109) {
        if (runningStep.type !== 'villagers') activeTCs = Math.max(0, activeTCs - 1);
      } else {
        if (runningStep.type !== 'production') activeMilitary = Math.max(0, activeMilitary - 1);
      }
    }

    if (activeTCs > 0) {
      const isActiveStep = runningStep?.started && !runningStep.finished && runningStep.type === 'villagers';
      if (tcContinuous || isActiveStep) {
        tcProgress += activeTCs * (1 / 25);
      }
    }
    while (tcProgress >= 0.99) {
      villagers++;
      tcProgress -= 1;
      const vCost = runningStep?.type === 'villagers' && runningStep.cost !== undefined ? runningStep.cost : 50;
      spentTotal += vCost;
      spentOnVillagers += vCost;
    }

    if (activeMilitary > 0 && trainTime > 0) {
      const isActiveStep = runningStep?.started && !runningStep.finished && runningStep.type === 'production';
      if (militaryContinuous || isActiveStep) {
        milProgress += activeMilitary * (1 / trainTime);
      }
    }
    while (milProgress >= 0.99) {
      unitsCount++;
      milProgress -= 1;
      const cost = (currentUnitCost.food || 0) + (currentUnitCost.wood || 0) + (currentUnitCost.gold || 0);
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
  return {
    count: unitsCount,
    villagers,
    cost: currentUnitCost,
    events,
    unitsPerSecond,
    economyHistory,
    stateAtTime,
    spentOnVillagers,
    spentOnBuildings,
    spentOnTechs,
    spentOnUnits,
  };
}

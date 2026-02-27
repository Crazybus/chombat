import { TimelineStep } from './types';

export interface ProductionEvent {
  time: number;
  msg: string;
}

export interface EconomyPoint {
  time: number;
  gathered: number;
  spent: number;
}

export interface ProductionResult {
  count: number;
  cost: { f: number; w: number; g: number };
  events: ProductionEvent[];
  unitsPerSecond: number;
  economyHistory: EconomyPoint[];
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
        spentTotal += (unitCost || step.co || 0) * count;

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
          } else {
            currentBuild += step.v || 0;
            if (step.t === 'building' && (step.v || 0) > 0)
              events.push({ time: s, msg: `Production Capacity +${step.v}` });
          }
        } else if (step.t === 'production') {
          currentBuild = step.v || currentBuild;
          currentTrain = step.tr || currentTrain;
          events.push({ time: s, msg: `Production set to ${currentBuild}x at ${currentTrain}s` });
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
        // Cost for produced units? 
        // Note: TimelineStep 'cost' usually overrides the unit cost for the sim.
        // We'll use currentCost if set, otherwise assume 100 for a placeholder if not in a step.
        const c = currentCost.f + currentCost.w + currentCost.g;
        spentTotal += n * (c || 100);
      }
    }

    // 5. Record economy
    if (s % 10 === 0) {
      economyHistory.push({ time: s, gathered: gatheredTotal, spent: spentTotal });
    }
  }

  const unitsPerSecond = currentTrain > 0 ? currentBuild / currentTrain : 0;
  return { count: unitsCount, cost: currentCost, events, unitsPerSecond, economyHistory };
}

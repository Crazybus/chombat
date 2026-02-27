import { TimelineStep } from './types';

export interface ProductionEvent {
  time: number;
  msg: string;
}

export interface ProductionResult {
  count: number;
  cost: { f: number; w: number; g: number };
  events: ProductionEvent[];
  unitsPerSecond: number;
}

export function calculateCount(
  t: number,
  timelineSteps: TimelineStep[],
  initialCost: { f: number; w: number; g: number } = { f: 0, w: 0, g: 0 }
): ProductionResult {
  let unitsCount = 0;
  let currentBuild = 0;
  let productionDebt = 0;
  let currentTrain = 30;
  let currentCost = { ...initialCost };
  const steps = JSON.parse(JSON.stringify(timelineSteps)) as (TimelineStep & { started?: boolean; startTime?: number; wasActuallyBlocking?: boolean; unblockTime?: number })[];
  let stepIdx = 0;
  const events: ProductionEvent[] = [];

  for (let s = 0; s <= t; s++) {
    while (stepIdx < steps.length) {
      const step = steps[stepIdx];
      const delay = (step.d || 0) * (step.c || 1);
      
      if (!step.started) {
        step.started = true;
        step.startTime = s;
        events.push({ time: s, msg: `Started: ${step.n || step.t} (at ${unitsCount} units)` });
        if (step.b && currentBuild > 0) {
          step.unblockTime = s + delay;
          currentBuild = Math.max(0, currentBuild - 1);
          step.wasActuallyBlocking = true;
        }
      }

      if (s >= (step.startTime || 0) + delay) {
        if (step.wasActuallyBlocking) {
          currentBuild++;
          step.wasActuallyBlocking = false;
        }
        events.push({ time: s, msg: `Finished: ${step.n || step.t}` });
        
        if (step.t === 'building' || step.t === 'prod' || step.t === 'villagers') {
          currentBuild += step.v || 0;
          if (step.t === 'building' && (step.v || 0) > 0)
            events.push({ time: s, msg: `Production Capacity +${step.v}` });
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

    if (currentBuild > 0 && currentTrain > 0) {
      productionDebt += currentBuild / currentTrain;
      if (productionDebt >= 1) {
        const n = Math.floor(productionDebt);
        unitsCount += n;
        productionDebt -= n;
      }
    }
  }

  const unitsPerSecond = currentTrain > 0 ? currentBuild / currentTrain : 0;
  return { count: unitsCount, cost: currentCost, events, unitsPerSecond };
}

import { describe, it, expect } from 'vitest';
import { calculateCount } from '../src/sim/ProductionSim';
import { TimelineStep } from '../src/sim/types';

describe('ProductionSim', () => {
  it('should start with zero units and increase based on capacity', () => {
    const steps: TimelineStep[] = [
      { t: 'production', v: 1, tr: 30 } // 1x building at 30s train speed
    ];

    // At 30s, we should have exactly 1 unit (1 * 30/30)
    const res30 = calculateCount(30, steps);
    expect(res30.count).toBe(1);

    // At 60s, we should have 2 units
    const res60 = calculateCount(60, steps);
    expect(res60.count).toBe(2);
  });

  it('should handle sequential steps correctly', () => {
    const steps: TimelineStep[] = [
      { t: 'building', d: 50, v: 1 }, // Build 1st barracks (50s)
      { t: 'production', v: 1, tr: 30 } // Start production (30s train)
    ];

    // At 50s, 0 units (building just finished)
    expect(calculateCount(50, steps).count).toBe(0);
    // At 80s, 1 unit (50s building + 30s training)
    expect(calculateCount(80, steps).count).toBe(1);
  });

  it('should calculate resource requirements per second', () => {
    const steps: TimelineStep[] = [
      { t: 'production', v: 2, tr: 20 } // 2x buildings at 20s train speed
    ];
    const initialCost = { f: 50, w: 0, g: 0 };

    // 2 units every 20s = 0.1 units/sec
    // 0.1 units/sec * 50 food/unit = 5 food/sec
    const res = calculateCount(100, steps, initialCost);
    expect(res.unitsPerSecond).toBe(0.1);
    expect(res.cost.f * res.unitsPerSecond).toBe(5);
  });

  it('should track economy with continuous villagers', () => {
    // 100 seconds
    const res = calculateCount(100, [], { f: 0, w: 0, g: 0 }, true);

    // Starts with 3 vills. 
    // Trains 1st vill at 25s (total 4), 2nd at 50s (total 5), 3rd at 75s (total 6), 4th at 100s (total 7)
    // Gather rate 0.35/s/vill
    // Resources gathered should roughly be:
    // 0-25: 25 * 3 * 0.35 = 26.25
    // 25-50: 25 * 4 * 0.35 = 35
    // 50-75: 25 * 5 * 0.35 = 43.75
    // 75-100: 25 * 6 * 0.35 = 52.5
    // Total approx: 157.5

    expect(res.economyHistory.length).toBeGreaterThan(0);
    const lastPoint = res.economyHistory[res.economyHistory.length - 1];
    expect(lastPoint.gathered).toBeCloseTo(159.95, 0.1);
    // 4 vills trained @ 50 food each = 200 spent
    expect(lastPoint.spent).toBe(200);
  });

  it('should pause villager production during Age research', () => {
    const steps: TimelineStep[] = [
      { t: 'tech', n: 'Feudal Age', d: 130, b: true, bt: 109 } // Age research (130s) at TC
    ];
    // Start at 0s. 3 vills initially.
    // 0-130: No vills trained (TC blocked)
    // 130: Tech finished.
    // 130-155: Train 1st vill (25s)

    const res130 = calculateCount(130, steps, { f: 0, w: 0, g: 0 }, true);
    // 0-130 is 131 seconds: 131 * 3 * 0.35 = 137.55
    expect(res130.economyHistory[res130.economyHistory.length - 1].gathered).toBeCloseTo(137.55, 0.1);

    const res155 = calculateCount(155, steps, { f: 0, w: 0, g: 0 }, true);
    // Last history point is at 150s (151 iterations): 151 * 3 * 0.35 = 158.55
    expect(res155.economyHistory[res155.economyHistory.length - 1].gathered).toBeCloseTo(158.55, 0.1);
  });
});

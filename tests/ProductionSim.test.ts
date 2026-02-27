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
});

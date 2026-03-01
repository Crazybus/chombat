import { describe, it, expect } from 'vitest';
import { calculateEqualResources, calculateEqualProductionTime } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';

describe('Army Parity Logic', () => {
  const knight = units['knight']; // Cost: 60f, 75g (135 total)
  const pikeman = units['pikeman']; // Cost: 35f, 25w (60 total)

  it('should calculate equal resources correctly', () => {
    // 10 Knights = 1350 resources. 
    // 1350 / 60 = 22.5 -> 23 Pikemen
    const count = calculateEqualResources(10, knight, { age: '3' }, pikeman, { age: '3' });
    expect(count).toBe(23);
  });

  it('should calculate equal production time correctly', () => {
    // Knight train time: 30s. Pikeman train time: 22s.
    // 10 Knights = 300s.
    // 300 / 22 = 13.6 -> 14 Pikemen
    const count = calculateEqualProductionTime(10, knight, { age: '3' }, pikeman, { age: '3' });
    expect(count).toBe(14);
  });
});

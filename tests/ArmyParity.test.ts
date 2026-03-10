import { describe, it, expect } from 'vitest';
import { calculateEqualResources, calculateEqualProductionTime } from '../src/sim/ArmyAnalyzer';
import { ArmyState } from '../src/sim/types';
import { units } from '../src/data/units';

describe('Army Parity Logic', () => {
  const knight = units['knight']; // Cost: 60f, 75g (135 total)
  const pikeman = units['pikeman']; // Cost: 35f, 25w (60 total)

  it('should calculate equal resources correctly', () => {
    // 10 Knights = 1350 resources.
    // 1350 / 60 = 22.5 -> 23 Pikemen
    const count = calculateEqualResources(10, knight, { age: '3' }, pikeman, { age: '3' }, {}, units);
    expect(count).toBe(23);
  });

  it('should calculate equal resources correctly with cost discounts (Byzantines)', () => {
    const skirm = units['skirmisher']; // Cost: 25f, 35w (60 total)
    // 10 Generic Skirmishers = 600 resources.
    // Byzantine Skirmisher = 60 * 0.75 = 45 resources.
    // 600 / 45 = 13.33 -> 13 Skirmishers
    const stateByz: ArmyState = {
      age: '2',
      civ: 'BYZANTINES',
      bonuses: [
        {
          id: 'BYZANTINES',
          effects: [{ type: 5, attribute: 100, value: 0.75, unitId: -1, class: 0, age: 1 }] as any,
        },
      ],
    };
    const count = calculateEqualResources(10, skirm, { age: '2' }, skirm, stateByz, {}, units);
    expect(count).toBe(13);
  });

  it('should calculate equal resources correctly with cost discounts (Incas)', () => {
    const runner = units['champi_runner']; // Cost: 45f, 25g (70 total)
    // 10 Generic Runners = 700 resources.
    // Inca Runner (Feudal) = 45 * 0.9 food, 25 gold = 40.5 + 25 = 65.5.
    // 700 / 65.5 = 10.68 -> 11 Runners
    const stateInca: ArmyState = {
      age: '2',
      civ: 'INCAS',
      bonuses: [
        {
          id: 'INCAS',
          effects: [
            // Collapse logic means we only need the Feudal one
            { type: 5, attribute: 103, value: 0.9, unitId: -1, class: 6, age: 2 },
          ] as any,
        },
      ],
    };
    const count = calculateEqualResources(10, runner, { age: '2' }, runner, stateInca, {}, units);
    expect(count).toBe(11);
  });

  it('should calculate equal production time correctly', () => {
    // Knight train time: 30s. Pikeman train time: 22s.
    // 10 Knights = 300s.
    // 300 / 22 = 13.6 -> 14 Pikemen
    const count = calculateEqualProductionTime(10, knight, { age: '3' }, pikeman, { age: '3' }, {}, units);
    expect(count).toBe(14);
  });
});

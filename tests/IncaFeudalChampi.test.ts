import { describe, it, expect } from 'vitest';
import { analyzeArmy, calculateEqualResources } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { bonuses as allBonuses } from '../src/data/bonuses';
import { TechData } from '../src/sim/types';

describe('Inca Feudal Champi Runner', () => {
  const runner = units['champi_runner'];

  const techsById: Record<number | string, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));
  Object.entries(allBonuses).forEach(([civKey, bonus]) => {
    (techsById as any)[civKey] = bonus;
  });

  it('INCAS: Champi Runner should have exactly 10% food discount in Feudal Age', () => {
    const civKey = 'INCAS';
    const bonus = techsById[civKey];
    const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

    const analysis = analyzeArmy(
      { preset: 'champi_runner', age: '2', civ: civKey, bonuses },
      { champi_runner: runner },
      techsById,
    );

    // Champi Runner base: 50 Food, 25 Gold.
    // Expected: ~10.2% food discount (approx 44.89 in dat file)
    expect(analysis?.effectiveStats.food).toBeCloseTo(44.89, 1);
    expect(analysis?.effectiveStats.gold).toBe(25);

    // Check that there is only one food discount source if possible
    const miscSources = analysis?.groups.other.sources || [];
    const foodDiscountSources = miscSources.filter((s) => s.label.includes('Food Cost'));

    // User said "and nothing else", implying they only want the 10% discount to show up.
    expect(foodDiscountSources.length).toBe(1);
    expect(foodDiscountSources[0].label).toContain('x0.9');
  });

  it('INCAS: calculateEqualResources should correctly equalize with a larger army for Incas', () => {
    const civKeyIncas = 'INCAS';
    const bonusIncas = techsById[civKeyIncas];
    const stateIncas: any = {
      preset: 'champi_runner',
      age: '2',
      civ: civKeyIncas,
      bonuses: [{ id: civKeyIncas, effects: bonusIncas.effects.map(() => true) }],
      count: 100,
    };

    const stateGeneric: any = {
      preset: 'champi_runner',
      age: '2',
      civ: 'GENERIC',
      bonuses: [],
      count: 100,
    };

    const countB = calculateEqualResources(100, runner, stateGeneric, runner, stateIncas, techsById as any, units);

    // Generic: 45 Food, 25 Gold = 70. Total = 7000.
    // Incas: 40.5 Food, 25 Gold = 65.5.
    // 7000 / 65.5 = 106.87 -> 107.
    expect(countB).toBe(107);
  });
});

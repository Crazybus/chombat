import { describe, it, expect } from 'vitest';
import { analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { bonuses as allBonuses } from '../src/data/bonuses';
import { TechData } from '../src/sim/types';

describe('Inca Champi Runner Discount', () => {
  const runner = units['champi_runner'];

  const techsById: Record<number | string, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));
  Object.entries(allBonuses).forEach(([civKey, bonus]) => {
    (techsById as any)[civKey] = bonus;
  });

  it('INCAS: should have discounted FOOD cost in Dark Age (-5%)', () => {
    const civKey = 'INCAS';

    const bonus = techsById[civKey];
    const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

    const analysis = analyzeArmy(
      { preset: 'champi_runner', age: '1', civ: civKey, bonuses },
      { champi_runner: runner },
      techsById,
    );

    // Champi Runner base: 50 Food, 25 Gold.
    // Dark Age: -5% Food
    expect(analysis?.effectiveStats.food).toBeCloseTo(47.5, 2);
    expect(analysis?.effectiveStats.gold).toBe(25);

    // Check if it appears in Misc (other) group
    const miscSources = analysis?.groups.other.sources || [];
    const discountSource = miscSources.find((s) => s.label.includes('Food Cost'));
    expect(discountSource).toBeDefined();
  });

  it('INCAS: should have discounted FOOD cost in Imperial Age (-20%)', () => {
    const civKey = 'INCAS';

    const bonus = techsById[civKey];
    const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

    const analysis = analyzeArmy(
      { preset: 'champi_runner', age: '4', civ: civKey, bonuses },
      { champi_runner: runner },
      techsById,
    );

    // Imperial Age: -20.7% Food
    // 50 * 0.7932 = 39.66 (Approx 39.66 in dat file)
    expect(analysis?.effectiveStats.food).toBeCloseTo(39.66, 1);
    expect(analysis?.effectiveStats.gold).toBe(25);
  });
});

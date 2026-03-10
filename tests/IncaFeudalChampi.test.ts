import { describe, it, expect } from 'vitest';
import { analyzeArmy } from '../src/sim/ArmyAnalyzer';
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

    // Champi Runner base: 45 Food, 25 Gold.
    // Expected: 10% food discount -> 45 * 0.9 = 40.5
    expect(analysis?.effectiveStats.food).toBeCloseTo(40.5, 2);
    expect(analysis?.effectiveStats.gold).toBe(25);

    // Check that there is only one food discount source if possible
    const miscSources = analysis?.groups.other.sources || [];
    const foodDiscountSources = miscSources.filter((s) => s.label.includes('Food Cost'));
    
    // User said "and nothing else", implying they only want the 10% discount to show up.
    expect(foodDiscountSources.length).toBe(1);
    expect(foodDiscountSources[0].label).toContain('x0.9');
  });
});

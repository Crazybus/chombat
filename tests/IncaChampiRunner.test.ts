import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Inca Champi Runner Discount', () => {
  const runner = units['champi_runner'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('INCAS: should have discounted GOLD cost in Dark Age (-5%)', () => {
    const ageId = 1;
    const civKey = 'INCAS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(runner, ageId, civKey, techsById, availableTechs);
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

    const analysis = analyzeArmy(
      { preset: 'champi_runner', age: '1', civ: civKey, bonuses },
      { champi_runner: runner },
      techsById,
    );

    // Champi Runner base: 45 Food, 25 Gold.
    // Dark Age (Tech 152): -5% Gold
    expect(analysis?.effectiveStats.food).toBe(45);
    expect(analysis?.effectiveStats.gold).toBeCloseTo(23.75, 2);

    // Check if it appears in Misc (other) group
    const miscSources = analysis?.groups.other.sources || [];
    const discountSource = miscSources.find((s) => s.label.includes('Gold Cost'));
    expect(discountSource).toBeDefined();
  });

  it('INCAS: should have discounted GOLD cost in Imperial Age (~ -20%)', () => {
    const ageId = 4;
    const civKey = 'INCAS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(runner, ageId, civKey, techsById, availableTechs);
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

    const analysis = analyzeArmy(
      { preset: 'champi_runner', age: '4', civ: civKey, bonuses },
      { champi_runner: runner },
      techsById,
    );

    // Imperial Age (Techs 152, 153, 154, 155): Cumulative result
    // 25 * 0.95 * (1.05 * 0.90) * (1.105 * 0.85) * (1.176 * 0.80) = 19.83...
    expect(analysis?.effectiveStats.gold).toBeCloseTo(19.83, 2);
  });
});

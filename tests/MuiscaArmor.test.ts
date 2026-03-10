import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Muisca Armor Bonus', () => {
  const champi = units['champi_scout'];
  const archer = units['archer'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('MUISCA: Archer should have +1/2/3 melee armor in Feudal/Castle/Imperial', () => {
    const civKey = 'MUISCA';
    const availableTechs = civs[civKey] || {};

    [
      { ageId: 2, expected: 2 }, // 0 + 1 (Padded) + 1 (Muisca)
      { ageId: 3, expected: 4 }, // 0 + 2 (Leather) + 2 (Muisca)
      { ageId: 4, expected: 5 }, // 0 + 2 (No Ring) + 3 (Muisca)
    ].forEach(({ ageId, expected }) => {
      const recommended = getRecommendedTechs(archer, ageId, civKey, techsById, availableTechs);
      const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

      const analysis = analyzeArmy(
        { preset: 'archer', age: ageId.toString(), civ: civKey, bonuses },
        { archer: archer },
        techsById,
      );

      expect(analysis?.effectiveStats.marm).toBe(expected);
    });
  });

  it('MUISCA: Champi Scout line should have +1/2/3 melee armor in Feudal/Castle/Imperial', () => {
    const civKey = 'MUISCA';
    const availableTechs = civs[civKey] || {};

    [
      { ageId: 2, expected: 2 }, // 0 + 1 (Scale) + 1 (Muisca)
      { ageId: 3, expected: 4 }, // 0 + 2 (Chain) + 2 (Muisca)
      { ageId: 4, expected: 6 }, // 0 + 3 (Plate) + 3 (Muisca)
    ].forEach(({ ageId, expected }) => {
      const recommended = getRecommendedTechs(champi, ageId, civKey, techsById, availableTechs);
      const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

      const analysis = analyzeArmy(
        { preset: 'champi_scout', age: ageId.toString(), civ: civKey, bonuses },
        { champi_scout: champi },
        techsById,
      );

      expect(analysis?.effectiveStats.marm).toBe(expected);
    });
  });
});

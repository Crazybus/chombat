import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Bulgarians Castle Age Knight (Unique Tech)', () => {
  const knight = units['knight'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('BULGARIANS: should only automatically apply standard upgrades (Stirrups is manual)', () => {
    const ageId = 3;
    const civKey = 'BULGARIANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(knight, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    // Standard Knight upgrades (Castle Age (82) techs are excluded from auto-recommend)
    const expected = [
      'Bloodlines',
      'Chain Barding Armor',
      'Forging',
      'Husbandry',
      'Iron Casting',
      'Scale Barding Armor',
    ].sort();

    expect(names).toEqual(expected);
  });

  it('BULGARIANS: should have 33% faster attack when Stirrups is MANUALLY applied', () => {
    const ageId = 3;
    const civKey = 'BULGARIANS';

    // Manually add Stirrups (ID 685)
    const stirrupsId = '685';
    const stirrups = techsById[685];

    const bonuses = [{ id: stirrupsId, effects: stirrups.effects.map(() => true) }];

    const analysis = analyzeArmy(
      { preset: 'knight', age: ageId.toString(), civ: civKey, bonuses },
      { knight: knight },
      techsById,
    );

    // Knight base reload: 1.8.
    // Stirrups: Attack speed x1.33 (In dataset this is reload * 0.75)
    // 1.8 * 0.75 = 1.35
    expect(analysis?.effectiveStats.reload).toBeCloseTo(1.35, 2);
  });
});

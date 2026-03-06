import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { GENERIC_CIV } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Knight Bonuses (Real Data)', () => {
  const knight = units['knight'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('GENERIC: should apply expected techs to a Castle Age Knight', () => {
    const ageId = 3;
    const civKey = GENERIC_CIV;

    const recommended = getRecommendedTechs(knight, ageId, civKey, techsById, {});
    const names = recommended.map((t) => t.name).sort();

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

  it('GENERIC: should result in 120 HP, 12 melee attack, and 4/4 armor', () => {
    // Knight Base: 100 HP, 10 Matk, 2 Marm, 2 Parm
    // Bloodlines: +20 HP
    // Forging: +1 Matk
    // Iron Casting: +1 Matk
    // Scale Barding: +1 Marm, +1 Parm
    // Chain Barding: +1 Marm, +1 Parm
    // Total Matk: 10 + 1 + 1 = 12
    // Total Arm: 2 + 1 + 1 = 4

    const recommended = getRecommendedTechs(knight, 3, GENERIC_CIV, techsById, {});
    const bn = recommended.map((t) => ({ i: t.id.toString(), e: t.effects.map(() => true) }));

    const analysis = analyzeArmy({ ps: 'knight', age: '3', bn }, { knight: knight }, techsById);

    expect(analysis).not.toBeNull();
    expect(analysis?.effectiveStats.hp).toBe(120);
    expect(analysis?.effectiveStats.matk).toBe(12);
    expect(analysis?.effectiveStats.marm).toBe(4);
    expect(analysis?.effectiveStats.parm).toBe(4);
  });
});

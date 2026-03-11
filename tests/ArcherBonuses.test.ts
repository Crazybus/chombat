import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { TechData } from '../src/sim/types';
import { GENERIC_CIV } from '../src/data/civs';

describe('Castle Age Archer Bonuses (Real Data)', () => {
  const archer = units['archer'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should apply exactly 6 expected techs to a Castle Age Generic Archer', () => {
    const ageId = 3;
    const civKey = GENERIC_CIV;

    const recommended = getRecommendedTechs(archer, ageId, civKey, techsById, {});
    const names = recommended.map((t) => t.name).sort();

    // EXPLICIT CHECK: We expect exactly these 6 technologies
    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      'Thumb Ring',
    ];

    expect(names).toEqual(expected);
  });

  it('should result in exactly 6 pierce attack and 6 range', () => {
    // Current Archer Base: 4 Patk, 4 Range
    // Fletching: +1 Patk, +1 Range
    // Bodkin: +1 Patk, +1 Range
    // Thumb Ring: Fire rate and accuracy (no flat atk/range)

    const recommended = getRecommendedTechs(archer, 3, GENERIC_CIV, techsById, {});
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

    const analysis = analyzeArmy({ preset: 'archer', age: '3', bonuses }, { archer: archer }, techsById);

    expect(analysis).not.toBeNull();
    // Archer (4) + Fletching (1) + Bodkin (1) = 6
    expect(analysis?.effectiveStats.patk).toBe(6);
    expect(analysis?.effectiveStats.range).toBe(6);

    // Armors: Base (0) + Padded (1) + Leather (1) = 2
    expect(analysis?.effectiveStats.parm).toBe(2);
    expect(analysis?.effectiveStats.marm).toBe(2);
  });
});

describe('Imperial Age Arbalester (Real Data)', () => {
  const arbalester = units['arbalester'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should apply exactly 9 expected techs to an Imperial Age Generic Arbalester', () => {
    const ageId = 4;
    const civKey = GENERIC_CIV;

    const recommended = getRecommendedTechs(arbalester, ageId, civKey, techsById, {});
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Bracer',
      'Chemistry',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      'Ring Archer Armor',
      'Thumb Ring',
    ].sort();

    expect(names).toEqual(expected);
  });

  it('should have 40 HP and correct attack/range stats', () => {
    const ageId = 4;
    const civKey = GENERIC_CIV;

    const recommended = getRecommendedTechs(arbalester, ageId, civKey, techsById, {});
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

    const analysis = analyzeArmy({ preset: 'arbalester', age: '4', bonuses }, { arbalester: arbalester }, techsById);

    expect(analysis).not.toBeNull();
    // THE BUG WE FIXED: Should stay 40 HP
    expect(analysis?.effectiveStats.hp).toBe(40);

    // Arbalester Base: 6 Patk, 5 Range
    // Fletching/Bodkin/Bracer: +3 Patk, +3 Range
    // Chemistry: +1 Patk
    // Total: 10 Patk, 8 Range
    expect(analysis?.effectiveStats.patk).toBe(10);
    expect(analysis?.effectiveStats.range).toBe(8);

    // Armors: Base (0) + Padded (1) + Leather (1) + Ring (2) = 4
    // Wait, Ring Archer Armor is +1/+2 normally, but let's check what it gives here.
    // In AoE2: Padded (+1/+1), Leather (+1/+1), Ring (+1/+2). Total: +3/+4.
    expect(analysis?.effectiveStats.parm).toBe(4);
    expect(analysis?.effectiveStats.marm).toBe(3);
  });
});

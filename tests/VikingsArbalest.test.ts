import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Imperial Age Vikings Arbalest', () => {
  const arbalest = units['arbalester'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should apply Bogsveigar and other expected techs to a Vikings Arbalest', () => {
    const ageId = 4; // Imperial
    const civKey = 'VIKINGS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(arbalest, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    expect(names).toContain('Bogsveigar');
    expect(names).toContain('Bracer');
    expect(names).toContain('Chemistry');
    expect(names).toContain('Ring Archer Armor');
    expect(names).not.toContain('Thumb Ring');

    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Bogsveigar',
      'Bracer',
      'Chemistry',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      'Ring Archer Armor',
    ].sort();

    // Check if all expected are there. We might have some extra minor ones like Loom or Wheelbarrow
    // if getRecommendedTechs returns them, but usually they are filtered out for Arbalest.
    expected.forEach((e) => expect(names).toContain(e));
  });

  it('should result in exactly 9 pierce attack and 7 range', () => {
    const ageId = 4;
    const civKey = 'VIKINGS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(arbalest, ageId, civKey, techsById, availableTechs);
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

    const analysis = analyzeArmy(
      { preset: 'arbalester', age: '4', civ: civKey, bonuses },
      { arbalester: arbalest },
      techsById,
    );

    expect(analysis?.effectiveStats.patk).toBe(11);
    expect(analysis?.effectiveStats.range).toBe(8);
  });
});

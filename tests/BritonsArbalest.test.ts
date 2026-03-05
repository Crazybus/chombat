import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Imperial Age Britons Arbalest (Real Data)', () => {
  const arbalest = units['arbalester_492'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should apply exactly expected techs to a Britons Arbalest', () => {
    const ageId = 4; // Imperial
    const civKey = 'BRITONS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(arbalest, ageId, civKey, techsById, availableTechs);
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
      // Yeomen is manual-only now
    ].sort();

    expect(names).toEqual(expected);
  });

  it('should result in exactly 10 pierce attack and 8 range (with techs only)', () => {
    const ageId = 4;
    const civKey = 'BRITONS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(arbalest, ageId, civKey, techsById, availableTechs);
    const bn = recommended.map((t) => ({ i: t.id.toString(), e: t.effects.map(() => true) }));

    const analysis = analyzeArmy({ ps: 'arbalester', age: '4', cv: civKey, bn }, { arbalester: arbalest }, techsById);

    expect(analysis?.effectiveStats.patk).toBe(10);
    expect(analysis?.effectiveStats.range).toBe(8);
  });
});

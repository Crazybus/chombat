import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { TechData } from '../src/sim/types';
import { GENERIC_CIV } from '../src/data/civs';

describe('Castle Age Archer Bonuses (Real Data)', () => {
  const archer = units['archer'];
  
  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach(t => techsById[t.id] = t);

  it('should apply exactly 6 expected techs to a Castle Age Generic Archer', () => {
    const ageId = 3;
    const civKey = GENERIC_CIV;
    
    const recommended = getRecommendedTechs(archer, ageId, civKey, techsById, {});
    const names = recommended.map(t => t.name).sort();

    // EXPLICIT CHECK: We expect exactly these 6 technologies
    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      'Thumb Ring'
    ];

    expect(names).toEqual(expected);
  });

  it('should result in exactly 6 pierce attack and 6 range', () => {
    // Current Archer Base: 4 Patk, 4 Range
    // Fletching: +1 Patk, +1 Range
    // Bodkin: +1 Patk, +1 Range
    // Thumb Ring: Fire rate and accuracy (no flat atk/range)
    
    const recommended = getRecommendedTechs(archer, 3, GENERIC_CIV, techsById, {});
    const bn = recommended.map(t => ({ i: t.id.toString(), e: t.effects.map(() => true) }));
    
    const analysis = analyzeArmy({ ps: 'archer', age: '3', bn }, { 'archer': archer }, techsById);
    
    expect(analysis).not.toBeNull();
    // Archer (4) + Fletching (1) + Bodkin (1) = 6
    expect(analysis?.effectiveStats.patk).toBe(6);
    expect(analysis?.effectiveStats.range).toBe(6);
    
    // Armors: Base (0) + Padded (1) + Leather (1) = 2
    expect(analysis?.effectiveStats.parm).toBe(2);
    expect(analysis?.effectiveStats.marm).toBe(2);
  });
});

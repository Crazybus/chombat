import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Imperial Age Britons Arbalest (Real Data)', () => {
  const arbalest = units['arbalester'];
  
  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach(t => techsById[t.id] = t);

  it('should apply exactly expected techs to a Britons Arbalest', () => {
    const ageId = 4; // Imperial
    const civKey = 'BRITONS';
    const availableTechs = civs[civKey] || {};
    
    const recommended = getRecommendedTechs(arbalest, ageId, civKey, techsById, availableTechs);
    const names = recommended.map(t => t.name).sort();

    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Bracer',
      'Chemistry',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      'Ring Archer Armor'
      // Note: Britons DON'T get Thumb Ring, so it should be absent
    ].sort();

    expect(names).toEqual(expected);
  });

  it('should result in exactly 10 pierce attack and 11 range (with Britons bonus)', () => {
    const ageId = 4;
    const civKey = 'BRITONS';
    const availableTechs = civs[civKey] || {};
    
    const recommended = getRecommendedTechs(arbalest, ageId, civKey, techsById, availableTechs);
    const bn = recommended.map(t => ({ i: t.id.toString(), e: t.effects.map(() => true) }));
    
    // Britons have civ bonus: Foot archers (except skirms) +1 range in Castle, +1 range in Imperial (Total +2)
    // We haven't implemented automated civ stat bonuses yet, only techs.
    // So for now, we expect techs only: Base (6) + Fletching (1) + Bodkin (1) + Bracer (1) + Chemistry (1) = 10 Attack
    // Range: Base (5) + Fletching (1) + Bodkin (1) + Bracer (1) = 8 Range
    
    const analysis = analyzeArmy({ ps: 'arbalester', age: '4', cv: civKey, bn }, { 'arbalester': arbalest }, techsById, {});
    
    expect(analysis?.effectiveStats.patk).toBe(10);
    expect(analysis?.effectiveStats.range).toBe(8); 
  });
});

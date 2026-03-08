import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs, GENERIC_CIV } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Civilization-Specific Tech Filtering (Explicit)', () => {
  const crossbow = units['crossbowman'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('BOHEMIANS: should apply exactly 6 techs including early Chemistry', () => {
    const ageId = 3;
    const civKey = 'BOHEMIANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(crossbow, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Chemistry', // EARLY (Age 3)
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      // Thumb Ring is NOT available for Bohemians
    ];

    expect(names).toEqual(expected);

    // Stats: Base (5) + Fletching (1) + Bodkin (1) + Chemistry (1) = 8
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));
    const analysis = analyzeArmy(
      { preset: 'crossbowman', age: '3', civ: civKey, bonuses },
      { crossbowman: crossbow },
      techsById,
    );
    expect(analysis?.effectiveStats.patk).toBe(8);
  });

  it('AZTECS: should apply exactly 5 techs (No Thumb Ring, No early Chemistry)', () => {
    const ageId = 3;
    const civKey = 'AZTECS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(crossbow, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      // No Thumb Ring for Aztecs
      // No early Chemistry
    ];

    expect(names).toEqual(expected);

    // Stats: Base (5) + Fletching (1) + Bodkin (1) = 7
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));
    const analysis = analyzeArmy(
      { preset: 'crossbowman', age: '3', civ: civKey, bonuses },
      { crossbowman: crossbow },
      techsById,
    );
    expect(analysis?.effectiveStats.patk).toBe(7);
  });

  it('GENERIC: should apply exactly 6 techs (No early Chemistry)', () => {
    const ageId = 3;
    const civKey = GENERIC_CIV;

    const recommended = getRecommendedTechs(crossbow, ageId, civKey, techsById, {});
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'Ballistics',
      'Bodkin Arrow',
      'Fletching',
      'Leather Archer Armor',
      'Padded Archer Armor',
      'Thumb Ring',
    ];

    expect(names).toEqual(expected);

    // Stats: Base (5) + Fletching (1) + Bodkin (1) = 7
    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));
    const analysis = analyzeArmy(
      { preset: 'crossbowman', age: '3', civ: civKey, bonuses },
      { crossbowman: crossbow },
      techsById,
    );
    expect(analysis?.effectiveStats.patk).toBe(7);
  });
});

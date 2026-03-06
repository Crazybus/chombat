import { describe, it, expect } from 'vitest';
import { getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Franks Fuedal Age Scout (Unique Tech)', () => {
  const knight = units['scout_cavalry'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('FRANKS: should apply HP increase to Feudal Age Scout Cavalry)', () => {
    const ageId = 2;
    const civKey = 'FRANKS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(knight, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = ['C-Bonus, Cavalry +20% HP', 'Forging', 'Scale Barding Armor'].sort();

    expect(names).toEqual(expected);
  });

  it('FRANKS: should apply HP bonus Castle Age Knight', () => {
    const ageId = 3;
    const civKey = 'FRANKS';

    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(knight, ageId, civKey, {}, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'C-Bonus, Cavalry +20% HP',
      'Chain Barding Armor',
      'Forging',
      'Husbandry',
      'Iron Casting',
      'Scale Barding Armor',
    ].sort();

    expect(names).toEqual(expected);
  });
});

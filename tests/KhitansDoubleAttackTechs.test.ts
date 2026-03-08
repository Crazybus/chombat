import { describe, it, expect } from 'vitest';
import { getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Khitans Double Attack Techs', () => {
  const militia = units['militia'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('KHITANS: should not apply double Forging in dark age', () => {
    const ageId = 1;
    const civKey = 'KHITANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(militia, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [].sort();

    expect(names).toEqual(expected);
  });

  it('KHITANS: should apply double Forging in feudal', () => {
    const ageId = 2;
    const civKey = 'KHITANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(militia, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = ['C-Bonus, Double Forging', 'Forging', 'Scale Mail Armor'].sort();

    expect(names).toEqual(expected);
  });

  it('KHITANS: should apply double Blast Furnace in castle age', () => {
    const ageId = 3;
    const civKey = 'KHITANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(militia, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'C-Bonus, Double Forging',
      'C-Bonus, Double Iron Casting',
      'Chain Mail Armor',
      'Forging',
      'Gambesons',
      'Iron Casting',
      'Scale Mail Armor',
      'Squires',
    ].sort();

    expect(names).toEqual(expected);
  });

  it('KHITANS: should apply double Blast Furnace in imperial age', () => {
    const ageId = 4;
    const civKey = 'KHITANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(militia, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'C-Bonus, Double Forging',
      'C-Bonus, Double Iron Casting',
      'Chain Mail Armor',
      'Forging',
      'Gambesons',
      'Iron Casting',
      'Plate Mail Armor',
      'Scale Mail Armor',
      'Squires',
    ].sort();

    expect(names).toEqual(expected);
  });
});

import { describe, it, expect } from 'vitest';
import { getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Mapuche Health Unique Techs', () => {
  const champi = units['champi_scout'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('MAPUCHE: should not apply health tech in dark age', () => {
    const ageId = 1;
    const civKey = 'MAPUCHE';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(champi, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [].sort();

    expect(names).toEqual(expected);
  });

  it('MAPUCHE: should apply double Forging in feudal', () => {
    const ageId = 2;
    const civKey = 'MAPUCHE';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(champi, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = ['C-Bonus, Skirm Spear +5 HP Feudal', 'Forging', 'Scale Mail Armor'].sort();

    expect(names).toEqual(expected);
  });

  it('MAPUCHE: should apply double Blast Furnace in castle age', () => {
    const ageId = 3;
    const civKey = 'MAPUCHE';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(champi, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'C-Bonus, Skirm Spear +5 HP Feudal',
      'C-Bonus, Skirm Spear +5 HP Castle',
      'Chain Mail Armor',
      'Forging',
      'Iron Casting',
      'Scale Mail Armor',
    ].sort();

    expect(names).toEqual(expected);
  });

  it('MAPUCHE: should apply double Blast Furnace in imperial age', () => {
    const ageId = 4;
    const civKey = 'MAPUCHE';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(champi, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = [
      'Blast Furnace',
      'C-Bonus, Skirm Spear +5 HP Feudal',
      'C-Bonus, Skirm Spear +5 HP Castle',
      'C-Bonus, Skirm Spear +5 HP Imperial',
      'Chain Mail Armor',
      'Forging',
      'Iron Casting',
      'Plate Mail Armor',
      'Scale Mail Armor',
    ].sort();

    expect(names).toEqual(expected);
  });
});

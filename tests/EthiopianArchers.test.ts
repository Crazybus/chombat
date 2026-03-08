import { describe, it, expect } from 'vitest';
import { getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Ethiopian Archers (Unique Tech)', () => {
  const archer = units['archer'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('ETHIOPIANS: should apply fire rate increase to Dark Age Archer', () => {
    const ageId = 1;
    const civKey = 'ETHIOPIANS';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(archer, ageId, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name).sort();

    const expected = ['C-Bonus, Archers fire +15% fas'].sort();

    expect(names).toEqual(expected);
  });
});

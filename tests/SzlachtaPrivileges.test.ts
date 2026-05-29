import { describe, it, expect } from 'vitest';
import { analyzeArmy, getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { civs } from '../src/data/civs';
import { TechData } from '../src/sim/types';

describe('Szlachta Privileges (Poles)', () => {
  const knight = units['knight'];

  const techsById: Record<number | string, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('POLES: Szlachta should be available in Castle Age', () => {
    const civKey = 'POLES';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(knight, 3, civKey, techsById, availableTechs);
    const names = recommended.map((t) => t.name);

    expect(names).toContain('Szlachta Privileges');
  });

  it('POLES: Knight should have 60% gold discount with Szlachta', () => {
    const civKey = 'POLES';
    const availableTechs = civs[civKey] || {};

    const recommended = getRecommendedTechs(knight, 3, civKey, techsById, availableTechs);

    const bonuses = recommended.map((t) => ({ id: t.id.toString(), effects: t.effects.map(() => true) }));

    const analysis = analyzeArmy({ preset: 'knight', age: '3', civ: civKey, bonuses }, { knight: knight }, techsById);

    expect(analysis).not.toBeNull();
    // Knight base gold is 75, 60% discount = 75 * 0.4 = 30
    expect(analysis?.effectiveStats.gold).toBeCloseTo(30, 1);
  });
});

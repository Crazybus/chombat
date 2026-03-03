import { describe, it, expect } from 'vitest';
import { getRecommendedTechs } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { TechData } from '../src/sim/types';
import { CombatSim } from '../src/sim/CombatSim';

describe('Villager Loom Recommendation', () => {
  const villager = units['villager'];
  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should recommend Loom for Villagers in Dark Age', () => {
    // Age 1 is Dark Age
    const recommended = getRecommendedTechs(villager, 1, 'GENERIC', techsById, {});
    const hasLoom = recommended.some((t) => t.name === 'Loom' || t.id === 22);
    expect(hasLoom).toBe(true);
  });

  it('should recommend Hand Cart for Villagers and apply speed bonus', () => {
    // Age 4 is Imperial Age
    const recommended = getRecommendedTechs(villager, 4, 'GENERIC', techsById, {});
    const handCart = recommended.find((t) => t.id === 249);
    expect(handCart).toBeDefined();

    const bonuses = [{ i: '249', e: [true, true, true, true] }]; // Hand Cart
    const sim = new CombatSim(villager, villager, { age: '4', bn: bonuses }, { age: '4' }, techsById, {});

    // Base speed is 1.0, Hand Cart is usually 1.1x speed (depends on dataset, but should be > 1.0)
    // Actually Hand Cart is often t: 2, a: 5, v: 1.1
    expect(sim.dataA.speed).toBeGreaterThan(1.0);
  });

  it('should recommend Wheelbarrow for Villagers and apply speed bonus', () => {
    // Age 2 is Feudal Age
    const recommended = getRecommendedTechs(villager, 2, 'GENERIC', techsById, {});
    const wheelbarrow = recommended.find((t) => t.id === 213);
    expect(wheelbarrow).toBeDefined();

    const bonuses = [{ i: '213', e: [true, true, true, true] }]; // Wheelbarrow
    const sim = new CombatSim(villager, villager, { age: '2', bn: bonuses }, { age: '2' }, techsById, {});

    // Base speed is 1.0, Wheelbarrow is usually 1.1x speed
    expect(sim.dataA.speed).toBeGreaterThan(1.0);
  });
});

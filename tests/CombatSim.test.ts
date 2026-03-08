import { describe, it, expect } from 'vitest';
import { CombatSim } from '../src/sim/CombatSim';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { TechData } from '../src/sim/types';

describe('Battle Simulation', () => {
  const archer = units['archer'];
  const skirm = units['skirmisher'];

  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should simulate a battle and produce a result with history', () => {
    // 10 Archers vs 10 Skirmishers
    const configA = { preset: 'archer', count: 10, age: '2' };
    const configB = { preset: 'skirmisher', count: 10, age: '2' };

    const sim = new CombatSim(archer, skirm, configA, configB, techsById, units);
    const result = sim.run();

    expect(result).not.toBeNull();
    expect(result.duration).toBeGreaterThan(0);
    expect(result.history.length).toBeGreaterThan(0);

    // In a base 10v10, skirms should win due to bonus damage
    expect(result.armyB.totalHp).toBeGreaterThan(result.armyA.totalHp);
    expect(result.armyA.remaining).toBe(0);
  });

  it('should handle large armies without crashing', () => {
    const configA = { preset: 'archer', count: 60, age: '4' };
    const configB = { preset: 'skirmisher', count: 60, age: '4' };

    const sim = new CombatSim(archer, skirm, configA, configB, techsById, units);
    const result = sim.run();

    expect(result.duration).toBeGreaterThan(0);
    expect(result.history.length).toBeGreaterThan(0);
  });

  it('should respect engagement efficiency', () => {
    // 100% efficiency vs 10% efficiency
    const configA = { preset: 'archer', count: 20, age: '2', overrides: { engagement: 100 } };
    const configB = { preset: 'archer', count: 20, age: '2', overrides: { engagement: 10 } };

    const sim = new CombatSim(archer, archer, configA as any, configB as any, techsById, units);
    const result = sim.run();

    // Army A should win decisively
    expect(result.armyA.remaining).toBeGreaterThan(result.armyB.remaining);
  });

  it('should respect micro settings (Target Fire)', () => {
    // 40 Archers vs 40 Archers
    // Perfect Micro (5) vs Poor Micro (1)
    const configA = { preset: 'archer', count: 40, age: '2', overrides: { micro: 5 } };
    const configB = { preset: 'archer', count: 40, age: '2', overrides: { micro: 1 } };

    const sim = new CombatSim(archer, archer, configA as any, configB as any, techsById, units);
    const result = sim.run();

    // Army A (better micro) should win
    expect(result.armyA.remaining).toBeGreaterThan(result.armyB.remaining);
    expect(result.armyB.remaining).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { CombatSim } from '../src/sim/CombatSim';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
const TUPI_CIV = 'TUPI';
import { TechData } from '../src/sim/types';

describe('Curare Poison (Tupi)', () => {
  const techsById: Record<number | string, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('TUPI: Curare tech should have poison effects for archer line', () => {
    const curare = techs['curare'];
    expect(curare).toBeDefined();
    expect(curare!.id).toBe(1393);
    expect(curare!.effects.length).toBe(5);
  });

  it('TUPI: Curare poison values should decode correctly', () => {
    const curare = techs['curare']!;

    // Archer line: +5/tick, 6s -> (6 << 8) | 5 = 1541
    const archerEffects = curare.effects.filter((e) => e.unitId === 4 || e.unitId === 2579 || e.unitId === 464);
    expect(archerEffects.length).toBe(3);
    for (const e of archerEffects) {
      expect(e.value).toBe(1541);
      const damage = e.value & 0xFF;
      const duration = (e.value >> 8) & 0xFF;
      expect(damage).toBe(5);
      expect(duration).toBe(6);
    }

    // Elite Archer line: +2/tick, 6s -> (6 << 8) | 2 = 1538
    const eliteEffects = curare.effects.filter((e) => e.unitId === 2581 || e.unitId === 1896);
    expect(eliteEffects.length).toBe(2);
    for (const e of eliteEffects) {
      expect(e.value).toBe(1538);
      const damage = e.value & 0xFF;
      const duration = (e.value >> 8) & 0xFF;
      expect(damage).toBe(2);
      expect(duration).toBe(6);
    }
  });

  it('TUPI: Poison should apply to Archer unit via Curare', () => {
    const archer = units['archer'];
    // Build Curare bonus with all effects enabled
    const curare = techs['curare']!;
    const bonuses = [{ id: curare.id.toString(), effects: curare.effects.map(() => true) }];

    const analysis = analyzeArmy(
      { preset: 'archer', age: '4', civ: TUPI_CIV, bonuses },
      { archer },
      techsById,
    );

    expect(analysis).not.toBeNull();
    const effective = analysis!.effectiveStats;
    expect(effective.poisonDamage).toBe(5);
    expect(effective.poisonDuration).toBe(6);
  });

  it('TUPI: Poison DOT should deal damage in combat sim', () => {
    const archer = units['archer'];
    const longbowman = units['longbowman'];

    // Tupi archer with Curare vs English longbowman
    const curare = techs['curare']!;
    const bonusesA = [{ id: curare.id.toString(), effects: curare.effects.map(() => true) }];

    const sim = new CombatSim(
      archer,
      longbowman,
      { preset: 'archer', age: '4', civ: 'TUPI', bonuses: bonusesA, count: 1 },
      { preset: 'longbowman', age: '4', civ: 'ENGLISH', count: 1 },
      techsById,
      units,
    );

    const result = sim.run();

    // The Tupi archer should have poison stats
    expect(sim.dataA.poisonDamage).toBe(5);
    expect(sim.dataA.poisonDuration).toBe(6);

    // The sim should complete without error
    expect(result.duration).toBeGreaterThan(0);
  });

  it('TUPI: Curare should use attribute 25 (poison_damage)', () => {
    const curare = techs['curare']!;
    for (const e of curare.effects) {
      expect(e.attribute).toBe(25); // poison_damage
    }
  });
});

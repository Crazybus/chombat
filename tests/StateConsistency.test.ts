import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSim } from '../src/sim/CombatSim';
import { UnitData, ArmyState } from '../src/sim/types';

describe('State Consistency', () => {
  const baseScout: UnitData = {
    name: 'Scout Cavalry',
    hp: 45,
    matk: 3,
    patk: 0,
    marm: 0,
    parm: 2,
    reload: 2.04,
    range: 0,
    f: 80, w: 0, g: 0,
    trainTime: 30,
    id: '448',
    class: 12,
    bonuses: {},
    armors: { '12': 0, '3': 2, '4': 0 }
  };

  const techs = {
    102: { id: 102, name: 'Castle Age', building: 109, effects: [], age: 3 },
    101: { id: 101, name: 'Feudal Age', building: 109, effects: [], age: 2 },
    435: { id: 435, name: 'Bloodlines', building: 101, effects: [{ t: 0, a: 0, v: 20, u: -1, c: -1 }], age: 2 }
  };

  it('should be idempotent when switching between ages', () => {
    // 1. Dark Age
    let config: ArmyState = { age: '1', bn: [] };
    let sim = new CombatSim(baseScout, baseScout, config, config, techs as any, { '448': baseScout });
    expect(sim.dataA.matk).toBe(3);
    expect(sim.dataA.hp).toBe(45);

    // 2. Switch to Feudal (should get +2 attack auto-upgrade)
    config = { age: '2', bn: [] };
    sim = new CombatSim(baseScout, baseScout, config, config, techs as any, { '448': baseScout });
    expect(sim.dataA.matk).toBe(5);
    expect(sim.dataA.hp).toBe(45);

    // 3. Switch back to Dark (should return to 3 attack)
    config = { age: '1', bn: [] };
    sim = new CombatSim(baseScout, baseScout, config, config, techs as any, { '448': baseScout });
    expect(sim.dataA.matk).toBe(3);
    expect(sim.dataA.hp).toBe(45);
  });

  it('should not accumulate manual overrides', () => {
    // 1. Set manual HP override
    let config: ArmyState = { age: '1', h: 100, bn: [] };
    let sim = new CombatSim(baseScout, baseScout, config, config, techs as any, { '448': baseScout });
    expect(sim.dataA.hp).toBe(100);

    // 2. Remove manual HP override (set to undefined in a real scenario where it's cleared)
    config = { age: '1', bn: [] };
    sim = new CombatSim(baseScout, baseScout, config, config, techs as any, { '448': baseScout });
    expect(sim.dataA.hp).toBe(45);
  });

  it('should apply Bloodlines correctly every time', () => {
    const config: ArmyState = { age: '2', bn: [{ i: '435', e: [true] }] };
    
    // Run multiple times with same config
    for(let i=0; i<3; i++) {
      const sim = new CombatSim(baseScout, baseScout, config, config, techs as any, { '448': baseScout });
      expect(sim.dataA.hp).toBe(65); // 45 + 20
      expect(sim.dataA.matk).toBe(5); // Auto-upgrade for scout
    }
  });
});

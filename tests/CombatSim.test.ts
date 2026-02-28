import { describe, it, expect } from 'vitest';
import { CombatSim } from '../src/sim/CombatSim';
import { Unit } from '../src/sim/Unit';
import { UnitData, ArmyState } from '../src/sim/types';

const archerData: UnitData = {
  name: 'Archer', hp: 30, matk: 0, patk: 4, marm: 0, parm: 0, reload: 2.0, range: 4, 
  frame_delay: 0, f: 0, w: 25, g: 45, trainTime: 35, building: 87, id: '4', class: 0, 
  bonuses: { '11': 3 }, // +3 vs Spearmen (class 11)
  armors: { '0': 0, '3': 0, '15': 0 }, // Archer, Pierce, Foot Archer
  requires: { techs: [], buildings: [] }
};

const skirmData: UnitData = {
  name: 'Skirmisher', hp: 30, matk: 0, patk: 2, marm: 0, parm: 3, reload: 3.0, range: 4, 
  frame_delay: 0, f: 25, w: 35, g: 0, trainTime: 22, building: 87, id: '6', class: 1, 
  bonuses: { '0': 3, '15': 3 }, // +3 vs Archer, +3 vs Foot Archer
  armors: { '1': 0, '3': 3 }, // Skirm, Pierce
  requires: { techs: [], buildings: [] }
};

describe('CombatSim', () => {
  it('should calculate simultaneous damage correctly (mirror match)', () => {
    const config: ArmyState = { c: 1, bn: [] };
    const sim = new CombatSim(archerData, archerData, config, config, {}, {});
    const res = sim.run();
    
    // In mirror match, both should have same remaining HP/count
    expect(res.armyA.remaining).toBe(res.armyB.remaining);
    expect(res.armyA.totalHp).toBe(res.armyB.totalHp);
  });

  it('should correctly handle bonus damage (Archer vs Skirmisher)', () => {
    // Archer (4 atk) vs Skirm (3 p.arm) = 1 dmg (base) + 0 bonus = 1
    // Skirm (2 atk) vs Archer (0 p.arm) = 2 dmg (base) + 3 bonus (class 0) + 3 bonus (class 15) = 8
    const configA: ArmyState = { c: 1, bn: [] };
    const configB: ArmyState = { c: 1, bn: [] };
    const sim = new CombatSim(archerData, skirmData, configA, configB, {}, {});
    
    const uA = new Unit(sim.dataA);
    const uB = new Unit(sim.dataB);
    
    const dmgAtoB = sim.calculateDamage(uA, uB);
    const dmgBtoA = sim.calculateDamage(uB, uA);
    
    expect(dmgAtoB).toBe(1);
    expect(dmgBtoA).toBe(8);
  });
});

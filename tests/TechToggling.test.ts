import { describe, it, expect } from 'vitest';
import { analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { CombatSim } from '../src/sim/CombatSim';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { ArmyState, TechData } from '../src/sim/types';

describe('Technology Toggling', () => {
  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should reflect consistent isActive state for all effects of a tech', () => {
    // Archer with Padded Archer Armor (id 211)
    // We simulate the "half-on" state that was previously possible
    const armyState: ArmyState = {
      preset: 'archer',
      name: 'Archer',
      count: 10,
      age: '2',
      bonuses: [
        {
          id: '211',
          effects: [false, false, true, true, true, true], // Melee Armor (0, 1) OFF, Pierce Armor (2, 3) ON
        },
      ],
    };

    const analysis = analyzeArmy(armyState, units, techsById);
    expect(analysis).not.toBeNull();
    if (!analysis) return;

    // With the fix, isActive should be based on .every((x) => x)
    // So both marm and parm sources should be marked as INACTIVE (false)
    const marmSources = analysis.groups['marm'].sources.filter((s) => s.techId === '211');
    const parmSources = analysis.groups['parm'].sources.filter((s) => s.techId === '211');

    expect(marmSources.length).toBeGreaterThan(0);
    expect(parmSources.length).toBeGreaterThan(0);

    marmSources.forEach((s) => expect(s.isActive).toBe(false));
    parmSources.forEach((s) => expect(s.isActive).toBe(false));
  });

  it('should correctly calculate stats in CombatSim even with short effects arrays', () => {
    const archer = units['archer'];
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach((t) => (techsById[t.id] = t));

    // Case 1: Padded Archer Armor (id 211) is OFF (effects: [false])
    // Base Archer has 0/0 armor. Padded adds +1/+1.
    const configOff = {
      preset: 'archer',
      age: '2',
      bonuses: [{ id: '211', effects: [false] }],
    };

    // Case 2: Padded Archer Armor is ON (effects: [true])
    const configOn = {
      preset: 'archer',
      age: '2',
      bonuses: [{ id: '211', effects: [true] }],
    };

    const simOff = new CombatSim(archer, archer, configOff as any, configOff as any, techsById, units);
    const simOn = new CombatSim(archer, archer, configOn as any, configOn as any, techsById, units);

    // Armor should be 0/0 when OFF, even though the array only had 1 element for a 6-effect tech
    expect(simOff.dataA.marm).toBe(0);
    expect(simOff.dataA.parm).toBe(0);

    // Armor should be 1/1 when ON
    expect(simOn.dataA.marm).toBe(1);
    expect(simOn.dataA.parm).toBe(1);
  });

  it('should correctly expand effects array during a toggle operation', () => {
    const techId = '211'; // Padded Archer Armor
    const techDef = techsById[211];
    const numEffects = techDef.effects.length; // 6

    // Initial state with a "broken" [true] array
    const originalBonus = { id: techId, effects: [true] };

    // Simulating the logic from SimulationContext.toggleBonus:
    const allActive = originalBonus.effects.every((x) => x) && originalBonus.effects.length >= numEffects;
    const newBonus = { ...originalBonus, effects: Array(numEffects).fill(!allActive) };

    expect(allActive).toBe(false); // Should be false because length is short
    expect(newBonus.effects.length).toBe(numEffects);
    expect(newBonus.effects.every((x) => x)).toBe(true); // Should toggle TO true

    // Second toggle (turning it OFF)
    const secondAllActive = newBonus.effects.every((x) => x) && newBonus.effects.length >= numEffects;
    const finalBonus = { ...newBonus, effects: Array(numEffects).fill(!secondAllActive) };

    expect(secondAllActive).toBe(true);
    expect(finalBonus.effects.every((x) => x)).toBe(false);
  });

  it('should reflect active state when all effects are true', () => {
    const armyState: ArmyState = {
      preset: 'archer',
      name: 'Archer',
      count: 10,
      age: '2',
      bonuses: [
        {
          id: '211',
          effects: [true, true, true, true, true, true],
        },
      ],
    };

    const analysis = analyzeArmy(armyState, units, techsById);
    expect(analysis).not.toBeNull();
    if (!analysis) return;

    const marmSources = analysis.groups['marm'].sources.filter((s) => s.techId === '211');
    const parmSources = analysis.groups['parm'].sources.filter((s) => s.techId === '211');

    marmSources.forEach((s) => expect(s.isActive).toBe(true));
    parmSources.forEach((s) => expect(s.isActive).toBe(true));
  });
});

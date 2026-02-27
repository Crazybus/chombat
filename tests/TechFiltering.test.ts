import { describe, it, expect } from 'vitest';
import { shouldApplyTech, getEffectLabel, shouldApplyEffect } from '../src/sim/TechLogic';
import { TechData, UnitData } from '../src/sim/types';

const archer: UnitData = {
    name: 'Archer', hp: 30, matk: 0, patk: 4, marm: 0, parm: 0, reload: 2.0, range: 4,
    id: '4', class: 0,
    armors: { '4': 0, '3': 0, '15': 0, '0': 0 }, // Realistic: has Melee(4) and Pierce(3) and Archer(0)
    f: 0, w: 25, g: 45, trainTime: 35
};

const militia: UnitData = {
    name: 'Militia', hp: 40, matk: 4, patk: 0, marm: 0, parm: 1, reload: 2.0, range: 0,
    id: '74', class: 6,
    armors: { '6': 0, '1': 0, '4': 0, '3': 1 },
    f: 50, w: 0, g: 20, trainTime: 21
};

const scout: UnitData = {
    name: 'Scout Cav', hp: 45, matk: 3, patk: 0, marm: 0, parm: 2, reload: 2.0, range: 0,
    id: '448', class: 47,
    armors: { '47': 0, '8': 0, '3': 2, '4': 0 }, // REAL: has Scout Cav(47), Cav(8)
    f: 80, w: 0, g: 0, trainTime: 30
};

const cav_archer: UnitData = {
    name: 'Cav Archer', hp: 50, matk: 0, patk: 6, marm: 0, parm: 0, reload: 2.0, range: 4.0,
    id: '39', class: 36,
    armors: { '36': 0, '15': 0, '8': 0, '3': 0, '4': 0 },
    f: 0, w: 40, g: 60, trainTime: 37
};

const eagle: UnitData = {
    name: 'Eagle Scout', hp: 50, matk: 4, patk: 0, marm: 0, parm: 2, reload: 2.0, range: 0,
    id: '751', class: 6,
    armors: { '6': 0, '1': 0, '4': 0, '3': 2 },
    f: 20, w: 0, g: 50, trainTime: 50
};

describe('TechFiltering', () => {
    it('should include Fletching for Archers', () => {
        const fletching: TechData = {
            name: 'Fletching', building: 103, id: 199, age: 2,
            effects: [
                { t: 9, a: 0, v: 769, u: -1, c: -1 }, // Pierce Atk +1 (cls 3) for targeted class 0
                { t: 1, a: 0, v: 1.0, u: -1, c: -1 }, // Atk +1
                { t: 12, a: 0, v: 1.0, u: -1, c: -1 } // Range +1
            ]
        } as any;
        expect(shouldApplyTech(fletching, archer)).toBe(true);
    });

    it('should exclude Fletching for Militia', () => {
        const fletching: TechData = {
            name: 'Fletching', building: 103, id: 199, age: 2,
            effects: [
                { t: 9, a: 0, v: 769, u: -1, c: -1 }, // Targets class 0 (Archer)
                { t: 1, a: 0, v: 1.0, u: -1, c: -1 }, // Targets class 0
                { t: 12, a: 0, v: 1.0, u: -1, c: -1 } // Targets class 0
            ]
        } as any;
        expect(shouldApplyTech(fletching, militia)).toBe(false);
    });

    it('should exclude Forging for Archers', () => {
        const forging: TechData = {
            name: 'Forging', building: 103, id: 67, age: 2,
            effects: [
                { t: 9, a: 6, v: 1025, u: -1, c: -1 }, // Melee Atk +1 for Inf (6)
                { t: 9, a: 12, v: 1025, u: -1, c: -1 } // Melee Atk +1 for Cav (12)
            ]
        } as any;
        expect(shouldApplyTech(forging, archer)).toBe(false);
    });

    it('should include Forging for Scouts', () => {
        const forging: TechData = {
            name: 'Forging', building: 103, id: 67, age: 2,
            effects: [
                { t: 9, a: 6, v: 1025, u: -1, c: -1 }, // Melee Atk +1 for Inf (6)
                { t: 9, a: 12, v: 1025, u: -1, c: -1 } // Melee Atk +1 for Cav (12)
            ]
        } as any;
        // This will fail currently because scout is class 47 and tech targets 12
        expect(shouldApplyTech(forging, scout)).toBe(true);
    });

    it('should exclude Bloodlines for Archers', () => {
        const bloodlines: TechData = {
            name: 'Bloodlines', building: 101, id: 435, age: 2,
            effects: [
                { t: 0, a: 12, v: 20.0, u: -1, c: -1 } // HP +20 (generic but building is Stable)
            ]
        } as any;
        expect(shouldApplyTech(bloodlines, archer)).toBe(false);
    });

    it('should include Bloodlines for Scouts', () => {
        const bloodlines: TechData = {
            name: 'Bloodlines', building: 101, id: 435, age: 2,
            effects: [
                { t: 0, a: 12, v: 20.0, u: -1, c: -1 }
            ]
        } as any;
        expect(shouldApplyTech(bloodlines, scout)).toBe(true);
    });

    it('should exclude Bloodlines for Archers', () => {
        const bloodlines: TechData = {
            name: 'Bloodlines', building: 101, id: 435, age: 2,
            effects: [
                { t: 0, a: 12, v: 20.0, u: -1, c: 12 } // HP +20 for class 12 (Cavalry)
            ]
        } as any;
        expect(shouldApplyTech(bloodlines, archer)).toBe(false);
    });

    it('should correctly format labels for encoded effects', () => {
        expect(getEffectLabel({ t: 9, a: 0, v: 769 })).toBe('Pierce Atk +1');
        expect(getEffectLabel({ t: 8, a: 0, v: 1025 })).toBe('Melee Arm +1');
    });

    it('should deduplicate generic attack if specific attack is present', () => {
        const effects = [
            { t: 9, a: 0, v: 769, u: -1, c: -1 }, // Pierce Atk +1
            { t: 1, a: 0, v: 1.0, u: -1, c: -1 }  // Generic Atk +1
        ];
        // The first effect (specific) should be applied
        expect(shouldApplyEffect(effects[0], archer, effects)).toBe(true);
        // The second effect (generic) should be skipped
        expect(shouldApplyEffect(effects[1], archer, effects)).toBe(false);
    });
});

import { CombatSim } from '../src/sim/CombatSim';

describe('CombatSim Stats', () => {
    it('should apply Bloodlines HP correctly', () => {
        const config = { bn: [{ i: '435', e: [true] }] } as any; // Bloodlines
        const sim = new CombatSim(scout, archer, config, {} as any, { 435: { building: 101, effects: [{ t: 0, a: 12, v: 20, u: -1, c: -1 }] } } as any, { '448': scout });
        expect(sim.dataA.hp).toBe(65);
    });

    it('should apply Scout auto-upgrade in Feudal Age', () => {
        const config = { bn: [{ i: '102', e: [true] }] } as any; // Feudal Age
        const sim = new CombatSim(scout, archer, config, {} as any, { 102: { building: 109, effects: [] } } as any, { '448': scout });
        expect(sim.dataA.matk).toBe(5);
    });

    it('should apply Eagle auto-upgrade in Feudal Age', () => {
        const config = { bn: [{ i: '102', e: [true] }] } as any; // Feudal Age
        const sim = new CombatSim(eagle, archer, config, {} as any, { 102: { building: 109, effects: [] } } as any, { '751': eagle });
        expect(sim.dataA.matk).toBe(7);
    });

    it('should apply Fletching to Cav Archer', () => {
        const config = { bn: [{ i: '199', e: [true, true, true] }] } as any; // Fletching
        const fletching = {
            building: 103, effects: [
                { t: 9, a: 0, v: 769, u: -1, c: -1 }, // P-Atk +1
                { t: 1, a: 0, v: 1, u: -1, c: -1 },   // Generic Atk +1 (will be hidden by dedupe if classes match)
                { t: 12, a: 0, v: 1, u: -1, c: -1 }   // Range +1
            ]
        };
        const sim = new CombatSim(cav_archer, archer, config, {} as any, { 199: fletching } as any, { '39': cav_archer });
        // Cav Archer has patk 6, range 4. Should go to 7 and 5.
        expect(sim.dataA.patk).toBe(7);
        expect(sim.dataA.range).toBe(5);
    });

    it('should apply Bloodlines and Husbandry to Cav Archer', () => {
        const config = { bn: [{ i: '435', e: [true] }, { i: '39', e: [true] }] } as any;
        const techs = {
            435: { building: 101, effects: [{ t: 0, a: 12, v: 20, u: -1, c: -1 }] }, // Bloodlines
            39: { building: 101, effects: [{ t: 5, a: 12, v: 1.1, u: -1, c: -1 }] }  // Husbandry
        };
        const cav_archer_with_speed = { ...cav_archer, speed: 1.4 };
        const sim = new CombatSim(cav_archer_with_speed, archer, config, {} as any, techs as any, { '39': cav_archer_with_speed });
        expect(sim.dataA.hp).toBe(70);
        expect(sim.dataA.speed).toBeCloseTo(1.54);
    });

    it('should NOT apply Barding Armor to Cav Archer', () => {
        const config = { bn: [{ i: '81', e: [true, true] }] } as any; // Scale Barding
        const barding = {
            building: 103, effects: [
                { t: 8, a: 12, v: 1025, u: -1, c: -1 }, // Melee +1 for Cav
                { t: 8, a: 12, v: 769, u: -1, c: -1 }   // Pierce +1 for Cav
            ]
        };
        const sim = new CombatSim(cav_archer, archer, config, {} as any, { 81: barding } as any, { '39': cav_archer });
        expect(sim.dataA.parm).toBe(0);
        expect(sim.dataA.marm).toBe(0);
    });

    it('should apply Barding Armor to Scout Cavalry', () => {
        const config = { bn: [{ i: '81', e: [true, true] }] } as any; // Scale Barding
        const barding = {
            building: 103, effects: [
                { t: 8, a: 12, v: 1025, u: -1, c: -1 }, // Melee +1 for Cav
                { t: 8, a: 12, v: 769, u: -1, c: -1 }   // Pierce +1 for Cav
            ]
        };
        const sim = new CombatSim(scout, archer, config, {} as any, { 81: barding } as any, { '448': scout });
        expect(sim.dataA.parm).toBe(3);
        expect(sim.dataA.marm).toBe(1);
    });
});

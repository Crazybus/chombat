import { describe, it, expect } from 'vitest';
import { shouldApplyTech, getEffectLabel, shouldApplyEffect } from '../src/sim/TechLogic';
import { TechData, UnitData } from '../src/sim/types';

const archer: UnitData = {
  name: 'Archer',
  hp: 30,
  matk: 0,
  patk: 4,
  marm: 0,
  parm: 0,
  reload: 2.0,
  range: 4,
  id: '4',
  class: 0,
  armors: { '4': 0, '3': 0, '15': 0, '0': 0 }, // Realistic: has Melee(4) and Pierce(3) and Archer(0)
  food: 0,
  wood: 25,
  gold: 45,
  trainTime: 35,
};

const militia: UnitData = {
  name: 'Militia',
  hp: 40,
  matk: 4,
  patk: 0,
  marm: 0,
  parm: 1,
  reload: 2.0,
  range: 0,
  id: '74',
  class: 6,
  armors: { '6': 0, '1': 0, '4': 0, '3': 1 },
  food: 50,
  wood: 0,
  gold: 20,
  trainTime: 21,
};

const scout: UnitData = {
  name: 'Scout Cav',
  hp: 45,
  matk: 3,
  patk: 0,
  marm: 0,
  parm: 2,
  reload: 2.0,
  range: 0,
  id: '448',
  class: 47,
  armors: { '47': 0, '8': 0, '3': 2, '4': 0 }, // REAL: has Scout Cav(47), Cav(8)
  food: 80,
  wood: 0,
  gold: 0,
  trainTime: 30,
};

const cav_archer: UnitData = {
  name: 'Cav Archer',
  hp: 50,
  matk: 0,
  patk: 6,
  marm: 0,
  parm: 0,
  reload: 2.0,
  range: 4.0,
  id: '39',
  class: 36,
  armors: { '36': 0, '15': 0, '8': 0, '3': 0, '4': 0 },
  food: 0,
  wood: 40,
  gold: 60,
  trainTime: 37,
};

const eagle: UnitData = {
  name: 'Eagle Scout',
  hp: 50,
  matk: 4,
  patk: 0,
  marm: 0,
  parm: 2,
  reload: 2.0,
  range: 0,
  id: '751',
  class: 6,
  armors: { '6': 0, '1': 0, '4': 0, '3': 2 },
  food: 20,
  wood: 0,
  gold: 50,
  trainTime: 50,
};

const fletchingEffects = [
  { type: 4, attribute: 9, value: 769.0, unitId: -1, class: 0 },
  { type: 4, attribute: 9, value: 769.0, unitId: -1, class: 36 },
  { type: 4, attribute: 12, value: 1.0, unitId: -1, class: 0 },
  { type: 4, attribute: 12, value: 1.0, unitId: -1, class: 36 },
  { type: 4, attribute: 9, value: 769.0, unitId: 54, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: -1, class: 52 },
  { type: 4, attribute: 9, value: 769.0, unitId: 328, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: -1, class: 52 },
  { type: 4, attribute: 9, value: 769.0, unitId: 109, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 71, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 141, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 142, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 82, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 82, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 539, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 539, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 21, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 21, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 442, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 442, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 250, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 250, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 533, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 533, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 505, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 518, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 746, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 747, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 885, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 885, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1004, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 1004, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1006, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 1006, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1251, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 1251, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 778, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 778, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 786, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 787, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1750, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 1750, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1830, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2130, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 2130, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2131, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 2131, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2132, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 2132, class: -1 },
  { type: 4, attribute: 12, v: -1.0, unitId: 2328, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2275, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2276, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2277, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1983, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1982, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1936, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1937, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1931, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1971, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1879, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2415, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 2415, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2417, class: -1 },
  { type: 4, attribute: 12, value: 1.0, unitId: 2417, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2631, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2632, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 133, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1189, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 45, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 47, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 51, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2574, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 2575, class: -1 },
  { type: 4, attribute: 9, value: 769.0, unitId: 1548, class: -1 },
];

const forgingEffects = [
  { type: 4, attribute: 9, value: 1025.0, unitId: -1, class: 6 },
  { type: 4, attribute: 9, value: 1025.0, unitId: -1, class: 45 },
  { type: 4, attribute: 9, value: 1025.0, unitId: -1, class: 12 },
  { type: 4, attribute: 9, value: 1025.0, unitId: -1, class: 46 },
  { type: 4, attribute: 9, value: 1025.0, unitId: -1, class: 50 },
  { type: 4, attribute: 9, value: 1025.0, unitId: -1, class: 47 },
  { type: 4, attribute: 9, v: -1025.0, unitId: 1923, class: -1 },
  { type: 4, attribute: 9, value: 1025.0, unitId: 1831, class: -1 },
  { type: 4, attribute: 9, value: 1025.0, unitId: 2626, class: -1 },
  { type: 4, attribute: 9, value: 1025.0, unitId: 2627, class: -1 },
  { type: 4, attribute: 9, value: 1025.0, unitId: 2628, class: -1 },
];

const bloodlinesEffects = [
  { type: 4, attribute: 0, value: 20.0, unitId: -1, class: 47 },
  { type: 4, attribute: 0, value: 20.0, unitId: -1, class: 12 },
  { type: 4, attribute: 0, value: 20.0, unitId: -1, class: 36 },
  { type: 4, attribute: 0, value: 20.0, unitId: -1, class: 23 },
  { type: 4, attribute: 0, value: 20.0, unitId: 775, class: -1 },
  { type: 4, attribute: 0, value: 20.0, unitId: 1263, class: -1 },
  { type: 4, attribute: 0, value: 20.0, unitId: 1715, class: -1 },
  { type: 4, attribute: 0, value: 20.0, unitId: 1822, class: -1 },
  { type: 4, attribute: 0, value: 20.0, unitId: 2557, class: -1 },
];

const husbandryEffects = [
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: -1, class: 47 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: -1, class: 36 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: -1, class: 12 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: -1, class: 23 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: 775, class: -1 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: 1263, class: -1 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: 1715, class: -1 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: 1822, class: -1 },
  { type: 5, attribute: 5, value: 1.100000023841858, unitId: 2557, class: -1 },
];

const scaleBardingEfects = [
  { type: 4, attribute: 8, value: 1025.0, unitId: -1, class: 12 },
  { type: 4, attribute: 8, value: 769.0, unitId: -1, class: 12 },
  { type: 4, attribute: 8, value: 1025.0, unitId: -1, class: 47 },
  { type: 4, attribute: 8, value: 769.0, unitId: -1, class: 47 },
  { type: 4, attribute: 8, v: -1025.0, unitId: 1738, class: -1 },
  { type: 4, attribute: 8, v: -769.0, unitId: 1738, class: -1 },
  { type: 4, attribute: 8, v: -1025.0, unitId: 1740, class: -1 },
  { type: 4, attribute: 8, v: -769.0, unitId: 1740, class: -1 },
  { type: 4, attribute: 8, value: 1025.0, unitId: 775, class: -1 },
  { type: 4, attribute: 8, value: 769.0, unitId: 775, class: -1 },
  { type: 4, attribute: 8, value: 1025.0, unitId: 2557, class: -1 },
  { type: 4, attribute: 8, value: 769.0, unitId: 2557, class: -1 },
];

describe('TechFiltering', () => {
  it('should include Fletching for Archers', () => {
    const fletching: TechData = {
      name: 'Fletching',
      building: 103,
      id: 199,
      age: 2,
      effects: fletchingEffects,
    } as any;
    expect(shouldApplyTech(fletching, archer)).toBe(true);
  });

  it('should exclude Fletching for Militia', () => {
    const fletching: TechData = {
      name: 'Fletching',
      building: 103,
      id: 199,
      age: 2,
      effects: fletchingEffects,
    } as any;
    expect(shouldApplyTech(fletching, militia)).toBe(false);
  });

  it('should exclude Forging for Archers', () => {
    const forging: TechData = {
      name: 'Forging',
      building: 103,
      id: 67,
      age: 2,
      effects: forgingEffects,
    } as any;
    expect(shouldApplyTech(forging, archer)).toBe(false);
  });

  it('should include Forging for Scouts', () => {
    const forging: TechData = {
      name: 'Forging',
      building: 103,
      id: 67,
      age: 2,
      effects: forgingEffects,
    } as any;
    // This will fail currently because scout is class 47 and tech targets 12
    expect(shouldApplyTech(forging, scout)).toBe(true);
  });

  it('should exclude Bloodlines for Archers', () => {
    const bloodlines: TechData = {
      name: 'Bloodlines',
      building: 101,
      id: 435,
      age: 2,
      effects: bloodlinesEffects,
    } as any;
    expect(shouldApplyTech(bloodlines, archer)).toBe(false);
  });

  it('should include Bloodlines for Scouts', () => {
    const bloodlines: TechData = {
      name: 'Bloodlines',
      building: 101,
      id: 435,
      age: 2,
      effects: bloodlinesEffects,
    } as any;
    expect(shouldApplyTech(bloodlines, scout)).toBe(true);
  });

  it('should exclude Bloodlines for Archers', () => {
    const bloodlines: TechData = {
      name: 'Bloodlines',
      building: 101,
      id: 435,
      age: 2,
      effects: bloodlinesEffects,
    } as any;
    expect(shouldApplyTech(bloodlines, archer)).toBe(false);
  });

  it('should correctly format labels for encoded effects', () => {
    expect(getEffectLabel({ type: 0, attribute: 9, value: 769 })).toBe('Pierce Atk +1');
    expect(getEffectLabel({ type: 0, attribute: 8, value: 1025 })).toBe('Melee Arm +1');
    expect(getEffectLabel({ type: 4, attribute: 9, value: 769 })).toBe('Pierce Atk +1');
    expect(getEffectLabel({ type: 4, attribute: 8, value: 1025 })).toBe('Melee Arm +1');
    expect(getEffectLabel({ type: 5, attribute: 9, value: 769 })).toBe('Pierce Atk x1');
    expect(getEffectLabel({ type: 5, attribute: 8, value: 1025 })).toBe('Melee Arm x1');
  });

  it('should deduplicate generic attack if specific attack is present', () => {
    const effects = [
      { type: 4, attribute: 9, value: 769, unitId: -1, class: 0 }, // Pierce Atk +1 (specific class 0)
      { type: 4, attribute: 9, value: 1.0, unitId: -1, class: -1 }, // Generic Atk +1 (generic)
    ];
    // The first effect (specific) should be applied
    expect(shouldApplyEffect(effects[0], archer, effects)).toBe(true);
    // The second effect (generic) should be skipped because a specific one exists
    expect(shouldApplyEffect(effects[1], archer, effects)).toBe(false);
  });
});

import { CombatSim } from '../src/sim/CombatSim';

describe('CombatSim Stats', () => {
  it('should apply Bloodlines HP correctly', () => {
    const config = { bonuses: [{ id: '435', effects: [true] }] } as any; // Bloodlines
    const sim = new CombatSim(
      scout,
      archer,
      config,
      {} as any,
      { 435: { building: 101, effects: bloodlinesEffects } } as any,
      { '448': scout },
    );
    expect(sim.dataA.hp).toBe(65);
  });

  it('should apply Scout auto-upgrade in Feudal Age', () => {
    const config = { age: '2', bonuses: [{ id: '102', effects: [true] }] } as any; // Feudal Age
    const sim = new CombatSim(
      scout,
      archer,
      config,
      { age: '1' } as any,
      { 102: { building: 109, effects: [] } } as any,
      { '448': scout },
    );
    expect(sim.dataA.matk).toBe(5);
  });

  it('should apply Eagle auto-upgrade in Feudal Age', () => {
    const config = { age: '2', bonuses: [{ id: '102', effects: [true] }] } as any; // Feudal Age
    const sim = new CombatSim(
      eagle,
      archer,
      config,
      { age: '1' } as any,
      { 102: { building: 109, effects: [] } } as any,
      { '751': eagle },
    );
    expect(sim.dataA.matk).toBe(7);
  });

  it('should apply Fletching to Cav Archer', () => {
    const config = { bonuses: [{ id: '199', effects: [true, true, true] }] } as any; // Fletching
    const fletching = {
      building: 103,
      effects: fletchingEffects,
    };
    const sim = new CombatSim(cav_archer, archer, config, {} as any, { 199: fletching } as any, { '39': cav_archer });
    // Cav Archer has patk 6, range 4. Should go to 7 and 5.
    expect(sim.dataA.patk).toBe(7);
    expect(sim.dataA.range).toBe(5);
  });

  it('should apply Bloodlines and Husbandry to Cav Archer', () => {
    const config = {
      bonuses: [
        { id: '435', effects: [true] },
        { id: '39', effects: [true] },
      ],
    } as any;
    const techs = {
      435: { building: 101, effects: bloodlinesEffects }, // Bloodlines
      39: { building: 101, effects: husbandryEffects }, // Husbandry
    };
    const cav_archer_with_speed = { ...cav_archer, speed: 1.4 };
    const sim = new CombatSim(cav_archer_with_speed, archer, config, {} as any, techs as any, {
      '39': cav_archer_with_speed,
    });
    expect(sim.dataA.hp).toBe(70);
    expect(sim.dataA.speed).toBeCloseTo(1.54);
  });

  it('should NOT apply Barding Armor to Cav Archer', () => {
    const config = { bonuses: [{ id: '81', effects: [true, true] }] } as any; // Scale Barding
    const barding = {
      building: 103,
      effects: scaleBardingEfects,
    };
    const sim = new CombatSim(cav_archer, archer, config, {} as any, { 81: barding } as any, { '39': cav_archer });
    expect(sim.dataA.parm).toBe(0);
    expect(sim.dataA.marm).toBe(0);
  });

  it('should apply Barding Armor to Scout Cavalry', () => {
    const config = { bonuses: [{ id: '81', effects: [true, true] }] } as any; // Scale Barding
    const barding = {
      building: 103,
      effects: scaleBardingEfects,
    };
    const sim = new CombatSim(scout, archer, config, {} as any, { 81: barding } as any, { '448': scout });
    expect(sim.dataA.parm).toBe(3);
    expect(sim.dataA.marm).toBe(1);
  });
});

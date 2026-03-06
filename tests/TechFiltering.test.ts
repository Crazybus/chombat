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
  f: 0,
  w: 25,
  g: 45,
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
  f: 50,
  w: 0,
  g: 20,
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
  f: 80,
  w: 0,
  g: 0,
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
  f: 0,
  w: 40,
  g: 60,
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
  f: 20,
  w: 0,
  g: 50,
  trainTime: 50,
};

const fletchingEffects = [
  { t: 4, a: 9, v: 769.0, u: -1, c: 0 },
  { t: 4, a: 9, v: 769.0, u: -1, c: 36 },
  { t: 4, a: 12, v: 1.0, u: -1, c: 0 },
  { t: 4, a: 12, v: 1.0, u: -1, c: 36 },
  { t: 4, a: 9, v: 769.0, u: 54, c: -1 },
  { t: 4, a: 9, v: 769.0, u: -1, c: 52 },
  { t: 4, a: 9, v: 769.0, u: 328, c: -1 },
  { t: 4, a: 12, v: 1.0, u: -1, c: 52 },
  { t: 4, a: 9, v: 769.0, u: 109, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 71, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 141, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 142, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 82, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 82, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 539, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 539, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 21, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 21, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 442, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 442, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 250, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 250, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 533, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 533, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 505, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 518, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 746, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 747, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 885, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 885, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1004, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 1004, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1006, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 1006, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1251, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 1251, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 778, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 778, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 786, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 787, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1750, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 1750, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1830, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2130, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 2130, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2131, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 2131, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2132, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 2132, c: -1 },
  { t: 4, a: 12, v: -1.0, u: 2328, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2275, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2276, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2277, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1983, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1982, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1936, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1937, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1931, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1971, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1879, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2415, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 2415, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2417, c: -1 },
  { t: 4, a: 12, v: 1.0, u: 2417, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2631, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2632, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 133, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1189, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 45, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 47, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 51, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2574, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 2575, c: -1 },
  { t: 4, a: 9, v: 769.0, u: 1548, c: -1 },
];

const forgingEffects = [
  { t: 4, a: 9, v: 1025.0, u: -1, c: 6 },
  { t: 4, a: 9, v: 1025.0, u: -1, c: 45 },
  { t: 4, a: 9, v: 1025.0, u: -1, c: 12 },
  { t: 4, a: 9, v: 1025.0, u: -1, c: 46 },
  { t: 4, a: 9, v: 1025.0, u: -1, c: 50 },
  { t: 4, a: 9, v: 1025.0, u: -1, c: 47 },
  { t: 4, a: 9, v: -1025.0, u: 1923, c: -1 },
  { t: 4, a: 9, v: 1025.0, u: 1831, c: -1 },
  { t: 4, a: 9, v: 1025.0, u: 2626, c: -1 },
  { t: 4, a: 9, v: 1025.0, u: 2627, c: -1 },
  { t: 4, a: 9, v: 1025.0, u: 2628, c: -1 },
];

const bloodlinesEffects = [
  { t: 4, a: 0, v: 20.0, u: -1, c: 47 },
  { t: 4, a: 0, v: 20.0, u: -1, c: 12 },
  { t: 4, a: 0, v: 20.0, u: -1, c: 36 },
  { t: 4, a: 0, v: 20.0, u: -1, c: 23 },
  { t: 4, a: 0, v: 20.0, u: 775, c: -1 },
  { t: 4, a: 0, v: 20.0, u: 1263, c: -1 },
  { t: 4, a: 0, v: 20.0, u: 1715, c: -1 },
  { t: 4, a: 0, v: 20.0, u: 1822, c: -1 },
  { t: 4, a: 0, v: 20.0, u: 2557, c: -1 },
];

const husbandryEffects = [
  { t: 5, a: 5, v: 1.100000023841858, u: -1, c: 47 },
  { t: 5, a: 5, v: 1.100000023841858, u: -1, c: 36 },
  { t: 5, a: 5, v: 1.100000023841858, u: -1, c: 12 },
  { t: 5, a: 5, v: 1.100000023841858, u: -1, c: 23 },
  { t: 5, a: 5, v: 1.100000023841858, u: 775, c: -1 },
  { t: 5, a: 5, v: 1.100000023841858, u: 1263, c: -1 },
  { t: 5, a: 5, v: 1.100000023841858, u: 1715, c: -1 },
  { t: 5, a: 5, v: 1.100000023841858, u: 1822, c: -1 },
  { t: 5, a: 5, v: 1.100000023841858, u: 2557, c: -1 },
];

const scaleBardingEfects = [
  { t: 4, a: 8, v: 1025.0, u: -1, c: 12 },
  { t: 4, a: 8, v: 769.0, u: -1, c: 12 },
  { t: 4, a: 8, v: 1025.0, u: -1, c: 47 },
  { t: 4, a: 8, v: 769.0, u: -1, c: 47 },
  { t: 4, a: 8, v: -1025.0, u: 1738, c: -1 },
  { t: 4, a: 8, v: -769.0, u: 1738, c: -1 },
  { t: 4, a: 8, v: -1025.0, u: 1740, c: -1 },
  { t: 4, a: 8, v: -769.0, u: 1740, c: -1 },
  { t: 4, a: 8, v: 1025.0, u: 775, c: -1 },
  { t: 4, a: 8, v: 769.0, u: 775, c: -1 },
  { t: 4, a: 8, v: 1025.0, u: 2557, c: -1 },
  { t: 4, a: 8, v: 769.0, u: 2557, c: -1 },
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
    expect(getEffectLabel({ t: 0, a: 9, v: 769 })).toBe('Pierce Atk +1');
    expect(getEffectLabel({ t: 0, a: 8, v: 1025 })).toBe('Melee Arm +1');
    expect(getEffectLabel({ t: 4, a: 9, v: 769 })).toBe('Pierce Atk +1');
    expect(getEffectLabel({ t: 4, a: 8, v: 1025 })).toBe('Melee Arm +1');
    expect(getEffectLabel({ t: 5, a: 9, v: 769 })).toBe('Pierce Atk x1');
    expect(getEffectLabel({ t: 5, a: 8, v: 1025 })).toBe('Melee Arm x1');
  });

  it('should deduplicate generic attack if specific attack is present', () => {
    const effects = [
      { t: 9, a: 0, v: 769, u: -1, c: -1 }, // Pierce Atk +1
      { t: 1, a: 0, v: 1.0, u: -1, c: -1 }, // Generic Atk +1
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
    const config = { age: '2', bn: [{ i: '102', e: [true] }] } as any; // Feudal Age
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
    const config = { age: '2', bn: [{ i: '102', e: [true] }] } as any; // Feudal Age
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
    const config = { bn: [{ i: '199', e: [true, true, true] }] } as any; // Fletching
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
      bn: [
        { i: '435', e: [true] },
        { i: '39', e: [true] },
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
    const config = { bn: [{ i: '81', e: [true, true] }] } as any; // Scale Barding
    const barding = {
      building: 103,
      effects: scaleBardingEfects,
    };
    const sim = new CombatSim(cav_archer, archer, config, {} as any, { 81: barding } as any, { '39': cav_archer });
    expect(sim.dataA.parm).toBe(0);
    expect(sim.dataA.marm).toBe(0);
  });

  it('should apply Barding Armor to Scout Cavalry', () => {
    const config = { bn: [{ i: '81', e: [true, true] }] } as any; // Scale Barding
    const barding = {
      building: 103,
      effects: scaleBardingEfects,
    };
    const sim = new CombatSim(scout, archer, config, {} as any, { 81: barding } as any, { '448': scout });
    expect(sim.dataA.parm).toBe(3);
    expect(sim.dataA.marm).toBe(1);
  });
});

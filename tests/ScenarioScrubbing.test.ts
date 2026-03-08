import { describe, it, expect } from 'vitest';
import { scrubArmy } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { ArmyState, TechData } from '../src/sim/types';

describe('Scenario Scrubbing', () => {
  const allUnits = units;
  const techsById: Record<number, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));

  it('should scrub redundant overrides for a Dark Age Champi Scout', () => {
    // A scenario might have been saved with manual overrides that match the base stats
    const champiBase = units['champi_scout'];
    const rawScenarioArmy: ArmyState = {
      name: 'Champi Scout',
      age: '1',
      overrides: {
        hp: champiBase.hp, // Matches base
        meleeAttack: champiBase.matk, // Matches base
        pierceAttack: champiBase.patk, // Matches base
        meleeArmor: champiBase.marm, // Matches base
        pierceArmor: champiBase.parm, // Matches base
      },
      bonuses: [],
    };

    const scrubbed = scrubArmy(rawScenarioArmy, allUnits, techsById);

    // After scrubbing, it should have NO manual stat overrides
    expect(scrubbed.overrides?.hp).toBeUndefined();
    expect(scrubbed.overrides?.meleeAttack).toBeUndefined();
    expect(scrubbed.overrides?.pierceAttack).toBeUndefined();
    expect(scrubbed.overrides?.meleeArmor).toBeUndefined();
    expect(scrubbed.overrides?.pierceArmor).toBeUndefined();
  });

  it('should scrub redundant overrides for a fully upgraded Feudal Scout', () => {
    // Full Feudal upgrades: Forging (+1 Atk), Scale Barding (+1/+1 Arm), Bloodlines (+20 HP)
    // Plus Scout auto-upgrade in Feudal (+2 Atk)
    // Total should effects: HP 65, Atk 6, Arm 1/3

    const rawScenarioArmy: ArmyState = {
      preset: 'scout_cavalry',
      age: '2',
      overrides: {
        hp: 65, // Base 45 + 20
        meleeAttack: 6, // Base 3 + 2 (auto) + 1 (forging)
        meleeArmor: 1, // Base 0 + 1
        pierceArmor: 3, // Base 2 + 1
      },
      bonuses: [
        { id: '67', effects: [true, true] }, // Forging
        { id: '81', effects: [true, true] }, // Scale Barding
        { id: '435', effects: [true] }, // Bloodlines
      ],
    };

    const scrubbed = scrubArmy(rawScenarioArmy, allUnits, techsById);

    // It should identify that all these stats are correctly derived from the tech/age
    // and thus the manual overrides are redundant and should be removed.
    expect(scrubbed.overrides?.hp).toBeUndefined();
    expect(scrubbed.overrides?.meleeAttack).toBeUndefined();
    expect(scrubbed.overrides?.meleeArmor).toBeUndefined();
    expect(scrubbed.overrides?.pierceArmor).toBeUndefined();
  });

  it('should KEEP meaningful overrides', () => {
    const champiBase = units['champi_scout'];
    const rawScenarioArmy: ArmyState = {
      preset: 'champi_scout_2550',
      age: '1',
      overrides: {
        hp: champiBase.hp + 10, // INTENTIONAL OVERRIDE
      },
      bonuses: [],
    };

    const scrubbed = scrubArmy(rawScenarioArmy, allUnits, techsById);

    expect(scrubbed.overrides?.hp).toBe(champiBase.hp + 10);
  });
});

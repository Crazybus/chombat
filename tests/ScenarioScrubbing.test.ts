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
    const champiBase = units['champi_scout_2550'];
    const rawScenarioArmy: ArmyState = {
      nm: 'Champi Scout',
      age: '1',
      h: champiBase.hp, // Matches base
      am: champiBase.matk, // Matches base
      ap: champiBase.patk, // Matches base
      aa: champiBase.marm, // Matches base
      ar: champiBase.parm, // Matches base
      bn: [],
    };

    const scrubbed = scrubArmy(rawScenarioArmy, allUnits, techsById);

    // After scrubbing, it should have NO manual stat overrides
    expect(scrubbed.h).toBeUndefined();
    expect(scrubbed.am).toBeUndefined();
    expect(scrubbed.ap).toBeUndefined();
    expect(scrubbed.aa).toBeUndefined();
    expect(scrubbed.ar).toBeUndefined();
  });

  it('should scrub redundant overrides for a fully upgraded Feudal Scout', () => {
    // Full Feudal upgrades: Forging (+1 Atk), Scale Barding (+1/+1 Arm), Bloodlines (+20 HP)
    // Plus Scout auto-upgrade in Feudal (+2 Atk)
    // Total should be: HP 65, Atk 6, Arm 1/3

    const rawScenarioArmy: ArmyState = {
      ps: 'scout_cavalry_448',
      age: '2',
      h: 65, // Base 45 + 20
      am: 6, // Base 3 + 2 (auto) + 1 (forging)
      aa: 1, // Base 0 + 1
      ar: 3, // Base 2 + 1
      bn: [
        { i: '67', e: [true, true] }, // Forging
        { i: '81', e: [true, true] }, // Scale Barding
        { i: '435', e: [true] }, // Bloodlines
      ],
    };

    const scrubbed = scrubArmy(rawScenarioArmy, allUnits, techsById);

    // It should identify that all these stats are correctly derived from the tech/age
    // and thus the manual overrides are redundant and should be removed.
    expect(scrubbed.h).toBeUndefined();
    expect(scrubbed.am).toBeUndefined();
    expect(scrubbed.aa).toBeUndefined();
    expect(scrubbed.ar).toBeUndefined();
  });

  it('should KEEP meaningful overrides', () => {
    const champiBase = units['champi_scout_2550'];
    const rawScenarioArmy: ArmyState = {
      ps: 'champi_scout_2550',
      age: '1',
      h: champiBase.hp + 10, // INTENTIONAL OVERRIDE
      bn: [],
    };

    const scrubbed = scrubArmy(rawScenarioArmy, allUnits, techsById);

    expect(scrubbed.h).toBe(champiBase.hp + 10);
  });
});

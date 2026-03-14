import { describe, it, expect } from 'vitest';
import { analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { bonuses as allBonuses } from '../src/data/bonuses';
import { TechData } from '../src/sim/types';

describe('Inca Villager Blacksmith Upgrades', () => {
  const villager = units['villager'];

  const techsById: Record<number | string, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));
  Object.entries(allBonuses).forEach(([civKey, bonus]) => {
    (techsById as any)[civKey] = bonus;
  });

  it('INCAS: Villager should receive all blacksmith infantry upgrades in Imperial Age', () => {
    const civKey = 'INCAS';
    const bonus = techsById[civKey];

    // Techs: Forging (67), Iron Casting (68), Blast Furnace (75),
    // Scale Mail Armor (74), Chain Mail Armor (76), Plate Mail Armor (77)
    const techIds = [67, 68, 75, 74, 76, 77];
    const bonuses = [
      { id: civKey, effects: bonus.effects.map(() => true) },
      ...techIds.map((id) => ({ id: String(id), effects: techsById[id].effects.map(() => true) })),
    ];

    const analysis = analyzeArmy(
      { preset: 'villager', age: '4', civ: civKey, bonuses },
      { villager: villager },
      techsById,
    );

    if (!analysis) {
      throw new Error('Analysis failed');
    }

    // Villager base: matk 3, marm 0, parm 0
    // + Forging (+1), Iron Casting (+1), Blast Furnace (+2) = matk 7
    // + Scale Mail Armor (+1/+1), Chain Mail Armor (+1/+1), Plate Mail Armor (+1/+2) = marm 3, parm 4

    expect(analysis.effectiveStats.matk).toBe(7);
    expect(analysis.effectiveStats.marm).toBe(3);
    expect(analysis.effectiveStats.parm).toBe(4);
  });

  it('INCAS: Villager should NOT receive blacksmith infantry upgrades in Feudal Age', () => {
    const civKey = 'INCAS';
    const bonus = techsById[civKey];

    // Techs: Forging (67), Scale Mail Armor (74)
    const techIds = [67, 74];
    const bonuses = [
      { id: civKey, effects: bonus.effects.map(() => true) },
      ...techIds.map((id) => ({ id: String(id), effects: techsById[id].effects.map(() => true) })),
    ];

    const analysis = analyzeArmy(
      { preset: 'villager', age: '2', civ: civKey, bonuses },
      { villager: villager },
      techsById,
    );

    if (!analysis) {
      throw new Error('Analysis failed');
    }

    // Villager base: matk 3, marm 0, parm 0
    // In Feudal Age (Age 2), the bonus shouldn't apply yet.

    expect(analysis.effectiveStats.matk).toBe(3);
    expect(analysis.effectiveStats.marm).toBe(0);
    expect(analysis.effectiveStats.parm).toBe(0);
  });
});

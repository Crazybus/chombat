import { describe, it, expect } from 'vitest';
import { analyzeDuel, analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { UnitData, ArmyState } from '../src/sim/types';

describe('Duel Analysis Logic', () => {
  const baseArcher: UnitData = {
    name: 'Archer',
    hp: 30,
    matk: 0,
    patk: 4,
    marm: 0,
    parm: 0,
    reload: 2,
    range: 4,
    food: 0,
    wood: 25,
    gold: 45,
    trainTime: 35,
    id: '4',
    class: 0,
    bonuses: {},
    armors: { '4': 0, '3': 0 },
  };

  const baseSpear: UnitData = {
    name: 'Spearman',
    hp: 45,
    matk: 3,
    patk: 0,
    marm: 0,
    parm: 0,
    reload: 3,
    range: 0,
    food: 35,
    wood: 25,
    gold: 0,
    trainTime: 22,
    id: '93',
    class: 0,
    bonuses: {},
    armors: { '4': 0, '3': 0 },
  };

  const allUnits = { archer: baseArcher, spear: baseSpear };

  it('should correctly identify the winner in a simple 1v1', () => {
    const stateA: ArmyState = { preset: 'archer', age: '2' };
    const stateB: ArmyState = { preset: 'spear', age: '2' };

    const analysisA = analyzeArmy(stateA, allUnits, {})!;
    const analysisB = analyzeArmy(stateB, allUnits, {})!;

    const result = analyzeDuel(stateA, stateB, analysisA, analysisB, {}, allUnits);

    // Archer should win because it has range and spearman has no range
    expect(result.winner).toBe('Archer');
    expect(parseFloat(result.remainingInfo)).toBeGreaterThan(0);
  });

  it('should provide formatted rows for stat comparison', () => {
    const stateA: ArmyState = { preset: 'archer', age: '2' };
    const stateB: ArmyState = { preset: 'spear', age: '2' };

    const analysisA = analyzeArmy(stateA, allUnits, {})!;
    const analysisB = analyzeArmy(stateB, allUnits, {})!;

    const result = analyzeDuel(stateA, stateB, analysisA, analysisB, {}, allUnits);

    expect(result.rows.length).toBeGreaterThan(5);
    expect(result.rows.some((r) => r.label.includes('HP'))).toBe(true);
    expect(result.rows.some((r) => r.label.includes('Attack'))).toBe(true);
  });

  it('should show discounted costs in comparison rows', () => {
    const stateA: ArmyState = {
      preset: 'spear',
      age: '2',
      civ: 'BYZANTINES',
      bonuses: [
        {
          id: 'BYZANTINES',
          effects: [
            { type: 5, attribute: 100, value: 0.75, unitId: 93, class: -1, age: 1 }, // Spearman (93) 25% cheaper
          ],
        },
      ],
    };
    const stateB: ArmyState = { preset: 'spear', age: '2' }; // Generic Spearman

    const analysisA = analyzeArmy(stateA, allUnits, {})!;
    const analysisB = analyzeArmy(stateB, allUnits, {})!;

    const result = analyzeDuel(stateA, stateB, analysisA, analysisB, {}, allUnits);

    const foodRow = result.rows.find((r) => r.label === 'Food Cost')!;
    const woodRow = result.rows.find((r) => r.label === 'Wood Cost')!;

    // Base Spearman: 35 Food, 25 Wood
    // Byzantine: 26 (35 -9), 19 (25 -6)
    // formatWithBase(26.25, 35) -> "26 (35 -9)"
    expect(foodRow.a).toContain('(35 -9)');
    expect(woodRow.a).toContain('(25 -6)');
    expect(foodRow.valA).toBeCloseTo(26.25, 2);
    expect(woodRow.valA).toBeCloseTo(18.75, 2);

    const totalRow = result.rows.find((r) => r.label === 'Total Cost')!;
    // Base Spearman: 35 + 25 = 60. Byzantine: 26.25 + 18.75 = 45.
    expect(totalRow.a).toBe('45');
    expect(totalRow.b).toBe('60');
  });
});

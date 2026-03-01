import { describe, it, expect } from 'vitest';
import { analyzeDuel, analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { UnitData, ArmyState } from '../src/sim/types';

describe('Duel Analysis Logic', () => {
  const baseArcher: UnitData = {
    name: 'Archer',
    hp: 30, matk: 0, patk: 4, marm: 0, parm: 0, reload: 2, range: 4,
    f: 0, w: 25, g: 45, trainTime: 35, id: '4', class: 0,
    bonuses: {}, armors: { '4': 0, '3': 0 }
  };

  const baseSpear: UnitData = {
    name: 'Spearman',
    hp: 45, matk: 3, patk: 0, marm: 0, parm: 0, reload: 3, range: 0,
    f: 35, w: 25, g: 0, trainTime: 22, id: '93', class: 0,
    bonuses: {}, armors: { '4': 0, '3': 0 }
  };

  const allUnits = { 'archer': baseArcher, 'spear': baseSpear };

  it('should correctly identify the winner in a simple 1v1', () => {
    const stateA: ArmyState = { ps: 'archer', age: '2' };
    const stateB: ArmyState = { ps: 'spear', age: '2' };
    
    const analysisA = analyzeArmy(stateA, allUnits, {})!;
    const analysisB = analyzeArmy(stateB, allUnits, {})!;

    const result = analyzeDuel(stateA, stateB, analysisA, analysisB, {}, allUnits);

    // Archer should win because it has range and spearman has no range
    expect(result.winner).toBe('Archer');
    expect(parseFloat(result.remainingInfo)).toBeGreaterThan(0);
  });

  it('should provide formatted rows for stat comparison', () => {
    const stateA: ArmyState = { ps: 'archer', age: '2' };
    const stateB: ArmyState = { ps: 'spear', age: '2' };
    
    const analysisA = analyzeArmy(stateA, allUnits, {})!;
    const analysisB = analyzeArmy(stateB, allUnits, {})!;

    const result = analyzeDuel(stateA, stateB, analysisA, analysisB, {}, allUnits);

    expect(result.rows.length).toBeGreaterThan(5);
    expect(result.rows.some(r => r.label.includes('HP'))).toBe(true);
    expect(result.rows.some(r => r.label.includes('Attack'))).toBe(true);
  });
});

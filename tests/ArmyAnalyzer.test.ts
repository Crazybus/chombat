import { describe, it, expect } from 'vitest';
import { analyzeArmy, resolveBaseUnit, applyManualOverrides, getManualOverrideSources } from '../src/sim/ArmyAnalyzer';
import { UnitData, ArmyState } from '../src/sim/types';

describe('ArmyAnalyzer', () => {
  const baseArcher: UnitData = {
    name: 'Archer',
    hp: 30,
    matk: 0,
    patk: 4,
    marm: 0,
    parm: 0,
    reload: 2,
    range: 4,
    f: 0, w: 25, g: 45,
    trainTime: 35,
    id: '4',
    class: 0,
    bonuses: { '27': 3 },
    armors: { '4': 0, '15': 0, '3': 0, '31': 0 }
  };

  const techs = {
    199: { id: 199, name: 'Fletching', building: 103, effects: [
      { t: 9, a: 0, v: 769, u: -1, c: -1 }, // P-Atk +1
      { t: 12, a: 0, v: 1, u: -1, c: -1 }   // Range +1
    ], age: 2 }
  };

  describe('resolveBaseUnit', () => {
    it('should resolve by ps ID', () => {
      const unit = resolveBaseUnit({ ps: 'archer' }, { 'archer': baseArcher });
      expect(unit.name).toBe('Archer');
    });

    it('should resolve by name', () => {
      const unit = resolveBaseUnit({ nm: 'Archer' }, { 'some_id': baseArcher });
      expect(unit.id).toBe('4');
    });

    it('should return custom unit if not found', () => {
      const unit = resolveBaseUnit({ nm: 'Ghost' }, {});
      expect(unit.id).toBe('custom');
      expect(unit.name).toBe('Ghost');
    });
  });

  describe('applyManualOverrides', () => {
    it('should apply HP override', () => {
      const modified = applyManualOverrides(baseArcher, { h: 99 });
      expect(modified.hp).toBe(99);
      expect(modified.patk).toBe(4); // remains same
    });
  });

  describe('getManualOverrideSources', () => {
    it('should detect differences from base', () => {
      const sources = getManualOverrideSources(baseArcher, { h: 35, am: 1 });
      expect(sources.hp[0].label).toContain('Base stat changed: +5');
      expect(sources.atk[0].label).toContain('Base stat changed: +1');
    });

    it('should NOT detect if value matches base', () => {
      const sources = getManualOverrideSources(baseArcher, { h: 30 });
      expect(sources.hp).toBeUndefined();
    });
  });

  describe('analyzeArmy (Integration)', () => {
    it('should correctly resolve and analyze a standard unit', () => {
      const state: ArmyState = { ps: 'archer', age: '2', bn: [{ i: '199', e: [true, true] }] };
      const analysis = analyzeArmy(state, { 'archer': baseArcher }, techs as any, {});

      expect(analysis).not.toBeNull();
      expect(analysis?.unitName).toBe('Archer');
      expect(analysis?.effectiveStats.hp).toBe(30);
      expect(analysis?.effectiveStats.patk).toBe(5); // 4 + 1
      expect(analysis?.effectiveStats.range).toBe(5); // 4 + 1
      
      // Check group categorization
      expect(analysis?.groups.atk.sources.some(s => s.name === 'Fletching')).toBe(true);
      expect(analysis?.groups.range.sources.some(s => s.name === 'Fletching')).toBe(true);
    });

    it('should handle scout auto-upgrades in Feudal Age', () => {
      const scout: UnitData = { ...baseArcher, name: 'Scout Cavalry', id: '448', matk: 3, class: 12 };
      const state: ArmyState = { ps: 'scout', age: '2' };
      const analysis = analyzeArmy(state, { 'scout': scout }, {}, {});

      expect(analysis?.effectiveStats.matk).toBe(5); // 3 + 2
    });
  });
});

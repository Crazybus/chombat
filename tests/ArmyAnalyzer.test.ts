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
    food: 0,
    wood: 25,
    gold: 45,
    trainTime: 35,
    id: '4',
    class: 0,
    bonuses: { '27': 3 },
    armors: { '4': 0, '15': 0, '3': 0, '31': 0 },
  };

  const techs = {
    199: {
      id: 192,
      name: 'Fletching',
      building: 103,
      effects: [
        { type: 4, attribute: 9, value: 769, unitId: -1, class: 0 }, // P-Atk +1
        { type: 4, attribute: 12, value: 1, unitId: -1, class: 0 }, // Range +1
      ],
      age: 2,
    },
  };

  describe('resolveBaseUnit', () => {
    it('should resolve by preset ID', () => {
      const unit = resolveBaseUnit({ preset: 'archer' }, { archer: baseArcher });
      expect(unit.name).toBe('Archer');
    });

    it('should resolve by name', () => {
      const unit = resolveBaseUnit({ name: 'Archer' }, { some_id: baseArcher });
      expect(unit.id).toBe('4');
    });

    it('should return custom unit if not found', () => {
      const unit = resolveBaseUnit({ name: 'Ghost' }, {});
      expect(unit.id).toBe('custom');
      expect(unit.name).toBe('Ghost');
    });
  });

  describe('applyManualOverrides', () => {
    it('should apply HP override', () => {
      const modified = applyManualOverrides(baseArcher, { overrides: { hp: 99 } });
      expect(modified.hp).toBe(99);
      expect(modified.patk).toBe(4); // remains same
    });
  });

  describe('getManualOverrideSources', () => {
    it('should detect differences from base', () => {
      const sources = getManualOverrideSources(baseArcher, { overrides: { hp: 35, meleeAttack: 1 } });
      expect(sources.hp?.[0].label).toContain('+5');
      expect(sources.atk?.[0].label).toContain('+1');
    });

    it('should NOT detect if value matches base', () => {
      const sources = getManualOverrideSources(baseArcher, { overrides: { hp: 30 } });
      expect(sources.hp).toBeUndefined();
    });
  });

  describe('analyzeArmy (Integration)', () => {
    it('should correctly resolve and analyze a standard unit', () => {
      const state: ArmyState = { preset: 'archer', age: '2', bonuses: [{ id: '199', effects: [true, true] }] };
      const analysis = analyzeArmy(state, { archer: baseArcher }, techs as any);

      expect(analysis).not.toBeNull();
      expect(analysis?.unitName).toBe('Archer');
      expect(analysis?.effectiveStats.hp).toBe(30);
      expect(analysis?.effectiveStats.patk).toBe(5); // 4 + 1
      expect(analysis?.effectiveStats.range).toBe(5); // 4 + 1

      // Check group categorization
      expect(analysis?.groups.atk.sources.some((s) => s.name === 'Fletching')).toBe(true);
      expect(analysis?.groups.range.sources.some((s) => s.name === 'Fletching')).toBe(true);
    });

    it('should handle scout auto-upgrades in Feudal Age', () => {
      const scout: UnitData = { ...baseArcher, name: 'Scout Cavalry', id: '448', matk: 3, class: 47 };
      const state: ArmyState = { preset: 'scout', age: '2' };
      const analysis = analyzeArmy(state, { scout: scout }, {});

      expect(analysis?.effectiveStats.matk).toBe(5); // 3 + 2
    });
  });
});

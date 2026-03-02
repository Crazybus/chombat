import { describe, it, expect } from 'vitest';
import { calculateCount, analyzeProduction } from '../src/sim/ProductionSim';
import { TimelineStep, UnitData } from '../src/sim/types';

describe('ProductionSim', () => {
  const baseArcher: UnitData = {
    name: 'Archer', hp: 30, matk: 0, patk: 4, marm: 0, parm: 0,
    reload: 2, range: 4, f: 0, w: 25, g: 45, trainTime: 35,
    id: '4', class: 0
  };

  const baseSkirm: UnitData = {
    name: 'Skirmisher', hp: 30, matk: 0, patk: 2, marm: 0, parm: 3,
    reload: 3, range: 4, f: 25, w: 35, g: 0, trainTime: 22,
    id: '6', class: 1
  };

  describe('calculateCount', () => {
    it('should handle an empty timeline by defaulting to 1 military slot producing infinite', () => {
      const res = calculateCount(300, [], baseArcher);
      expect(res.count).toBeGreaterThan(0);
    });

    it('should produce units when infinite production is started (lim: false)', () => {
      const steps: TimelineStep[] = [
        { t: 'production', n: 'Start Archers', v: 1, tr: 30, lim: false, d: 0 }
      ];
      const res = calculateCount(35, steps, baseArcher);
      expect(res.count).toBeGreaterThan(0);
    });

    it('should handle sequential steps and blocking (lim: true)', () => {
      const steps: TimelineStep[] = [
        { t: 'building', n: 'Barracks', d: 50, v: 1, prod: true, lim: true }, 
        { t: 'tech', n: 'Blocking Tech', d: 30, b: true, lim: true }, 
        { t: 'production', n: 'Production', v: 1, tr: 30, lim: false, d: 0 }
      ];
      
      expect(calculateCount(50, steps, baseArcher).count).toBe(0);
      expect(calculateCount(120, steps, baseArcher).count).toBeGreaterThan(0);
    });

    it('should track unit costs in economy history', () => {
      const steps: TimelineStep[] = [
        { t: 'production', n: 'Start Archers', v: 1, tr: 30, lim: false, d: 0 }
      ];
      // 30s per unit. At 65s, 2 units should be produced.
      const res = calculateCount(65, steps, baseArcher);
      expect(res.count).toBe(2);
      const lastPoint = res.economyHistory[res.economyHistory.length - 1];
      // Archer cost: 70 resources. 2 units = 140 spent on units.
      expect(lastPoint.spentOnUnits).toBe(140);
    });
  });

  describe('analyzeProduction', () => {
    it('should generate a full analysis for a simple matchup', () => {
      const stateA = { tl: [{ t: 'production', n: 'Archers', v: 1, tr: 35, lim: false, d: 0 }] } as any;
      const stateB = { tl: [{ t: 'production', n: 'Skirms', v: 1, tr: 22, lim: false, d: 0 }] } as any;
      
      const analysis = analyzeProduction(stateA, stateB, baseArcher, baseSkirm, {}, {}, 600, 60);
      
      expect(analysis.labels.length).toBeGreaterThan(0);
      expect(analysis.countA.length).toBe(analysis.labels.length);
      expect(analysis.finalResA.count).toBeGreaterThan(0);
      expect(analysis.finalResB.count).toBeGreaterThan(0);
      expect(analysis.advantage.length).toBe(analysis.labels.length);
    });
  });
});

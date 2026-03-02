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

    it('should produce units when infinite production is started', () => {
      const steps: TimelineStep[] = [
        { t: 'production', n: 'Start Archers', v: 1, tr: 30, inf: true, d: 0 }
      ];
      // At 30s, we should have at least 1 unit (actually finished at 29s if starting at 0)
      const res30 = calculateCount(30, steps, baseArcher);
      expect(res30.count).toBeGreaterThanOrEqual(1);
    });

    it('should handle sequential steps and blocking', () => {
      const steps: TimelineStep[] = [
        { t: 'building', n: 'Barracks', d: 50, v: 1, prod: true }, 
        { t: 'tech', n: 'Blocking Tech', d: 30, b: true }, 
        { t: 'production', n: 'Production', v: 1, tr: 30, inf: true, d: 0 }
      ];
      
      expect(calculateCount(50, steps, baseArcher).count).toBe(0);
      // 50s build + 30s tech + 30s train = 110s for first unit
      expect(calculateCount(110, steps, baseArcher).count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('analyzeProduction', () => {
    it('should generate a full analysis for a simple matchup', () => {
      const stateA = { tl: [{ t: 'production', n: 'Archers', v: 1, tr: 35, inf: true, d: 0 }] } as any;
      const stateB = { tl: [{ t: 'production', n: 'Skirms', v: 1, tr: 22, inf: true, d: 0 }] } as any;
      
      const analysis = analyzeProduction(stateA, stateB, baseArcher, baseSkirm, {}, {}, 300, 60);
      
      expect(analysis.labels.length).toBeGreaterThan(0);
      expect(analysis.countA.length).toBe(analysis.labels.length);
      expect(analysis.finalResA.count).toBeGreaterThan(0);
      expect(analysis.finalResB.count).toBeGreaterThan(0);
      expect(analysis.advantage.length).toBe(analysis.labels.length);
    });
  });
});

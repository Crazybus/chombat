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
    it('should start with zero units and increase based on capacity', () => {
      const steps: TimelineStep[] = [
        { t: 'production', v: 1, tr: 30 }
      ];
      expect(calculateCount(30, steps).count).toBe(1);
      expect(calculateCount(60, steps).count).toBe(2);
    });

    it('should handle sequential steps correctly', () => {
      const steps: TimelineStep[] = [
        { t: 'building', d: 50, v: 1 },
        { t: 'production', v: 1, tr: 30 }
      ];
      expect(calculateCount(50, steps).count).toBe(0);
      expect(calculateCount(80, steps).count).toBe(1);
    });
  });

  describe('analyzeProduction', () => {
    it('should generate a full analysis for a simple matchup', () => {
      const stateA = { tl: [{ t: 'production', n: 'Archers', v: 1, tr: 35 }] } as any;
      const stateB = { tl: [{ t: 'production', n: 'Skirms', v: 1, tr: 22 }] } as any;
      
      const analysis = analyzeProduction(stateA, stateB, baseArcher, baseSkirm, {}, {}, 300, 60);
      
      expect(analysis.labels.length).toBeGreaterThan(0);
      expect(analysis.countA.length).toBe(analysis.labels.length);
      expect(analysis.finalResA.count).toBeGreaterThan(0);
      expect(analysis.finalResB.count).toBeGreaterThan(0);
      expect(analysis.advantage.length).toBe(analysis.labels.length);
    });
  });
});

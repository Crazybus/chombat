import { describe, it, expect } from 'vitest';
import { smooth } from '../src/sim/ProductionSim';

describe('ProductionSim Library', () => {
  describe('smooth function', () => {
    it('should return an empty array for an empty input', () => {
      expect(smooth([])).toEqual([]);
    });

    it('should handle a single element', () => {
      expect(smooth([10])).toEqual([10]);
    });

    it('should apply a moving average with window size 3', () => {
      const input = [10, 20, 30, 40, 50];
      // i=0: [10]/1 = 10
      // i=1: [10, 20]/2 = 15
      // i=2: [10, 20, 30]/3 = 20
      // i=3: [20, 30, 40]/3 = 30
      // i=4: [30, 40, 50]/3 = 40
      expect(smooth(input, 3)).toEqual([10, 15, 20, 30, 40]);
    });

    it('should handle window size larger than array', () => {
      const input = [10, 20];
      expect(smooth(input, 5)).toEqual([10, 15]);
    });

    it('should handle window size 1 (no change)', () => {
      const input = [1, 2, 3];
      expect(smooth(input, 1)).toEqual([1, 2, 3]);
    });
  });
});

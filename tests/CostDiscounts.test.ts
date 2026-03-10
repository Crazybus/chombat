import { describe, it, expect } from 'vitest';
import { analyzeArmy } from '../src/sim/ArmyAnalyzer';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';
import { bonuses as allBonuses } from '../src/data/bonuses';
import { TechData } from '../src/sim/types';

describe('Resource Cost Discounts', () => {
  const techsById: Record<number | string, TechData> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));
  Object.entries(allBonuses).forEach(([civKey, bonus]) => {
    (techsById as any)[civKey] = bonus;
  });

  describe('Inca Military Food Discount', () => {
    const runner = units['champi_warrior'];
    const eliteRunner = units['elite_champi_warrior'];

    it('INCAS: Champi Warrior should have 15% food discount in Castle Age', () => {
      const civKey = 'INCAS';
      const bonus = techsById[civKey];
      const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

      const analysis = analyzeArmy(
        { preset: 'champi_warrior', age: '3', civ: civKey, bonuses },
        { champi_warrior: runner },
        techsById,
      );

      // Base Food: 45. Discount: 15% (Approx 37.94 in dat file)
      expect(analysis?.effectiveStats.food).toBeCloseTo(37.94, 1);
      expect(analysis?.effectiveStats.gold).toBe(25);
    });

    it('INCAS: Elite Champi Warrior should have 20% food discount in Imperial Age', () => {
      const civKey = 'INCAS';
      const bonus = techsById[civKey];
      const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

      const analysis = analyzeArmy(
        { preset: 'elite_champi_warrior', age: '4', civ: civKey, bonuses },
        { elite_champi_warrior: eliteRunner },
        techsById,
      );

      // Base Food: 45. Discount: 20% (Approx 35.70 in dat file)
      expect(analysis?.effectiveStats.food).toBeCloseTo(35.7, 1);
      expect(analysis?.effectiveStats.gold).toBe(25);
    });
  });

  describe('Korean Skirmisher Wood Discount', () => {
    const skirm = units['elite_skirmisher'];

    it('KOREANS: Elite Skirmisher should have 50% wood discount in Imperial Age', () => {
      const civKey = 'KOREANS';
      const bonus = techsById[civKey];
      const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

      const analysis = analyzeArmy(
        { preset: 'elite_skirmisher', age: '4', civ: civKey, bonuses },
        { elite_skirmisher: skirm },
        techsById,
      );

      // Base Wood: 35. Discount: 50% -> 35 * 0.5 = 17.5
      expect(analysis?.effectiveStats.wood).toBeCloseTo(17.5, 2);
    });
  });

  describe('Portuguese Knight Gold Discount', () => {
    const knight = units['knight'];

    it('PORTUGUESE: Knight should have 20% gold discount in Castle Age', () => {
      const civKey = 'PORTUGUESE';
      const bonus = techsById[civKey];
      const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

      const analysis = analyzeArmy({ preset: 'knight', age: '3', civ: civKey, bonuses }, { knight: knight }, techsById);

      // Base Gold: 75. Discount: 20% -> 75 * 0.8 = 60.0
      expect(analysis?.effectiveStats.gold).toBeCloseTo(60.0, 2);
    });
  });

  describe('Byzantine Skirmisher Food Discount', () => {
    const skirm = units['skirmisher'];

    it('BYZANTINES: Skirmisher should have 25% food discount in Feudal Age', () => {
      const civKey = 'BYZANTINES';
      const bonus = techsById[civKey];
      const bonuses = [{ id: civKey, effects: bonus.effects.map(() => true) }];

      const analysis = analyzeArmy(
        { preset: 'skirmisher', age: '2', civ: civKey, bonuses },
        { skirmisher: skirm },
        techsById,
      );

      // Base Food: 25. Base Wood: 35.
      // Byzantine bonus is Attr 100 (Total Cost) x0.75.
      // Expected: Food 25*0.75 = 18.75, Wood 35*0.75 = 26.25
      expect(analysis?.effectiveStats.food).toBeCloseTo(18.75, 2);
      expect(analysis?.effectiveStats.wood).toBeCloseTo(26.25, 2);
    });
  });
});

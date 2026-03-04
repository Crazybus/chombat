import { describe, it, expect } from 'vitest';
import { units } from '../src/data/units';

describe('Unit Availability', () => {
  it('should include the Warrior Priest', () => {
    const warriorPriest = Object.values(units).find((u) => u.name === 'Warrior Priest');
    expect(warriorPriest).toBeDefined();
    expect(warriorPriest?.name).toBe('Warrior Priest');
  });

  it('should include the Monaspa', () => {
    const monaspa = Object.values(units).find((u) => u.name === 'Monaspa' || u.name === 'Elite Monaspa');
    expect(monaspa).toBeDefined();
  });
});

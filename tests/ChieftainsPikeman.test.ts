import { describe, it, expect } from 'vitest';
import { shouldApplyEffect, decodeEncoded } from '../src/sim/TechLogic';
import { units } from '../src/data/units';
import { techs } from '../src/data/techs';

describe('Chieftains +5 bonus vs Cavalry for Pikemen', () => {
  const pikeman = units['pikeman'];
  const chieftains = techs['chieftains'];

  it('should apply Chieftains +5 attack vs cavalry to Pikeman', () => {
    const cavAttackEffect = chieftains.effects.find((e) => e.attribute === 9 && e.class === 6 && e.unitId === -1);
    expect(cavAttackEffect).toBeDefined();
    const { cls, amt } = decodeEncoded(cavAttackEffect!.value);
    expect(cls).toBe(8); // Cavalry
    expect(amt).toBe(5);

    const applied = shouldApplyEffect(cavAttackEffect!, pikeman, chieftains.effects, 3);
    expect(applied).toBe(true);
  });

  it('should apply Chieftains +4 attack vs camel to Pikeman', () => {
    const camelAttackEffect = chieftains.effects.find(
      (e) => e.attribute === 9 && e.class === 6 && e.unitId === -1 && e !== chieftains.effects[0],
    );
    expect(camelAttackEffect).toBeDefined();
    const { cls, amt } = decodeEncoded(camelAttackEffect!.value);
    expect(cls).toBe(30); // Camel
    expect(amt).toBe(4);

    const applied = shouldApplyEffect(camelAttackEffect!, pikeman, chieftains.effects, 3);
    expect(applied).toBe(true);
  });
});

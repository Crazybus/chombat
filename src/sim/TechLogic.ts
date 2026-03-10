import { EFFECT_ATTRIBUTES } from '../data/effect_constants';
import { TechData, UnitData } from './types';

export function decodeEncoded(val: number): { cls: number; amt: number } {
  const iv = Math.floor(val);
  let amt = iv & 0xff;
  if (amt >= 128) amt -= 256;
  const cls = iv >> 8;
  return { cls, amt };
}

export const CLASS_NAMES: Record<number, string> = {
  0: 'Arc',
  1: 'Skirm',
  6: 'Inf',
  12: 'Cav',
  3: 'Pierce',
  4: 'Melee',
  11: 'Bldg',
  13: 'Ram',
  19: 'Siege',
  20: 'Ship',
  21: 'Wall',
  27: 'Castle',
  28: 'Elephant',
  32: 'Unique',
};

export const CLASS_ALIASES: Record<number, number[]> = {
  12: [47], // Category 12 (Cavalry) includes Scouts (47). NOT CA (36).
  0: [36, 1, 44], // Category 0 (Archer) includes CA (36), Skirmishers (1), and HC (44)
};

export function getEffectLabel(e: any): string {
  const { type, attribute, value } = e;
  // Armor (a=8) and Attack (a=9): value is encoded as cls|amt
  if (attribute === EFFECT_ATTRIBUTES.attack || attribute === EFFECT_ATTRIBUTES.armor) {
    const { cls, amt } = decodeEncoded(value);
    if (amt === 0 || cls < 0) return '';
    const prefix = attribute === EFFECT_ATTRIBUTES.attack ? 'Atk' : 'Arm';
    if (type == 5) return `${CLASS_NAMES[cls] || `Cls${cls}`} ${prefix} ${amt >= 0 ? 'x' : ''}${amt}`;
    return `${CLASS_NAMES[cls] || `Cls${cls}`} ${prefix} ${amt >= 0 ? '+' : ''}${amt}`;
  }
  const attrMap: Record<number, string> = {
    [EFFECT_ATTRIBUTES.hp]: 'HP',
    [EFFECT_ATTRIBUTES.attack]: 'Atk',
    [EFFECT_ATTRIBUTES.reload]: 'Reload',
    [EFFECT_ATTRIBUTES.max_range]: 'Range',
    [EFFECT_ATTRIBUTES.speed]: 'Speed',
    [EFFECT_ATTRIBUTES.accuracy]: 'Accuracy',
    [EFFECT_ATTRIBUTES.food_cost]: 'Food',
    [EFFECT_ATTRIBUTES.wood_cost]: 'Wood',
    [EFFECT_ATTRIBUTES.stone_cost]: 'Stone',
    [EFFECT_ATTRIBUTES.gold_cost]: 'Gold',
  };
  if (attribute === EFFECT_ATTRIBUTES.accuracy) return ''; // Hide accuracy effects
  if (e.unitId !== -1 && value < 0) return ''; // Hide negative unit-specific undo effects

  const name = attrMap[attribute] || 'Stat';
  if (type === 5) return `${name} x${value}`; // Multiplier Attribute Modifier
  return `${name} +${value}`; // Set or Add Attribute Modifiers
}

export function matchesUnit(e: any, u: UnitData): boolean {
  return e.unitId === -1 || String(e.unitId) === u.id;
}

export function matchesClass(e: any, u: UnitData): boolean {
  const cls = e.class !== undefined ? e.class : -1;
  if (String(cls) === '-1') return true;
  if (String(cls) === String(u.class)) return true;

  // Check category aliases
  if (CLASS_ALIASES[Number(cls)]) {
    return CLASS_ALIASES[Number(cls)].some((alias) => String(alias) === String(u.class));
  }

  return false;
}

export function shouldApplyEffect(e: any, u: UnitData, allEffects: any[] = [], currentAgeId: number = 1): boolean {
  // 0. Age check
  const effectAge = e.age !== undefined ? Number(e.age) : 1;
  if (effectAge > currentAgeId) return false;

  // 1. Latest Age wins: if there's another matching effect in the same tech with a higher age (but still <= current age), skip this one.
  if (
    allEffects.some(
      (other) =>
        other !== e &&
        other.attribute === e.attribute &&
        other.type === e.type &&
        other.unitId === e.unitId &&
        other.class === e.class &&
        (other.age !== undefined ? Number(other.age) : 1) > effectAge &&
        (other.age !== undefined ? Number(other.age) : 1) <= currentAgeId,
    )
  ) {
    return false;
  }

  // 2. Basic matching
  if (!matchesUnit(e, u)) return false;
  if (!matchesClass(e, u)) return false;

  const val = e.value;
  const attribute = e.attribute;
  const type = e.type;

  // 2. Range/Accuracy check: don't apply these bonuses to melee units
  if (attribute === 3 || attribute === 130 || type === 12 || type === 130) {
    if ((u.range || 0) <= 1) return false;
  }

  // 3. Cost check: don't apply if unit doesn't have that cost
  if (attribute === EFFECT_ATTRIBUTES.food_cost && (u.food || 0) === 0) return false;
  if (attribute === EFFECT_ATTRIBUTES.wood_cost && (u.wood || 0) === 0) return false;
  if (attribute === EFFECT_ATTRIBUTES.stone_cost && (u.stone || 0) === 0) return false;
  if (attribute === EFFECT_ATTRIBUTES.gold_cost && (u.gold || 0) === 0) return false;

  // 4. Armor/Attack specific class check (Genie format uses encoded value)
  if (attribute === EFFECT_ATTRIBUTES.armor || attribute === EFFECT_ATTRIBUTES.attack) {
    const { cls: encodedCls } = decodeEncoded(val);
    const hasArmorClass = u.armors && String(encodedCls) in u.armors;
    const matchesBaseClass = encodedCls === u.class;
    if (!hasArmorClass && !matchesBaseClass) return false;

    if (attribute === EFFECT_ATTRIBUTES.attack) {
      if (encodedCls === 3 && (u.patk || 0) === 0) return false;
      if (encodedCls === 4 && (u.matk || 0) === 0) return false;
    }
  }

  const cls = e.class !== undefined ? e.class : -1;

  // 5. Deduplication: if we are a generic +Atk effect, hide it if specific (+Pierce) is present
  if ((type === 0 || type === 1 || type === 2 || type === 4) && attribute === EFFECT_ATTRIBUTES.attack && cls === -1) {
    if (
      allEffects.some(
        (other) =>
          other !== e &&
          other.attribute === EFFECT_ATTRIBUTES.attack &&
          (other.class !== undefined ? other.class : -1) !== -1,
      )
    ) {
      return false;
    }
  }

  return true;
}

export function shouldApplyTech(t: TechData, u: UnitData, ageId: number = 1): boolean {
  // Essential combat techs still need to be relevant to the unit type
  if (t.id === 93) {
    // Ballistics
    // Only for units with range > 1
    return (u.range || 0) > 1;
  }
  if (t.id === 47) {
    // Chemistry
    // Usually for ranged units, but technically applies to many things.
    // In our sim, we only show it if the unit has some base attack it could add to.
    return (u.range || 0) > 1 || u.class === 20; // Ranged or Ship
  }

  if (!t.effects || t.effects.length === 0) return false;
  const effs = t.effects;

  // Building-specific safety filters
  // 1. Stable techs (101) only for Cavalry (12), Elephants (28), or units with Cavalry class (8)
  if (t.building === 101) {
    const CAV_CLASSES = ['8', '12', '28'];
    const armors = u.armors || {};
    if (
      u.class !== 12 &&
      u.class !== 8 &&
      u.class !== 28 &&
      !Object.keys(armors).some((c) => CAV_CLASSES.includes(c))
    ) {
      return false;
    }
  }

  // 2. Barracks techs (12) only for Infantry (6)
  if (t.building === 12) {
    if (u.class !== 6) {
      return false;
    }
  }

  // 3. Thumb Ring (437) specific safety: strictly only for units with range > 1.
  if (t.id === 437 && (u.range || 0) <= 1) return false;

  // 4. Town Center techs (except Age-ups) should only apply to Villagers
  const AGE_UP_TECHS = [101, 102, 103];
  if (t.building === 109 && !AGE_UP_TECHS.includes(t.id) && u.id !== '83') return false;

  // 5. Loom (22) should only apply to Villagers
  if (t.id === 22 && u.id !== '83') return false;

  return effs.some((e) => shouldApplyEffect(e, u, effs, ageId));
}

export const COMBAT_BUILDINGS = [12, 87, 101, 49, 82, 103, 209, 45, 104, 1806, 109];

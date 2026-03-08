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
  const attrMap: Record<number, string> = { 0: 'HP', 9: 'Atk', 10: 'Reload', 12: 'Range', 5: 'Speed', 11: 'Accuracy' };
  if (attribute === 11) return ''; // Hide accuracy effects
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
  if (cls === -1) return true;
  if (cls === u.class) return true;

  // Check category aliases
  if (CLASS_ALIASES[cls]) {
    return CLASS_ALIASES[cls].some((alias) => alias == u.class);
  }

  return false;
}

export function shouldApplyEffect(e: any, u: UnitData, allEffects: any[] = []): boolean {
  if (!matchesUnit(e, u) || !matchesClass(e, u)) return false;

  // Range/Accuracy check: don't apply these bonuses to melee units
  // Attribute 3 is Range, 130 is Accuracy, 12 is also Range in some contexts
  if (e.attribute === 3 || e.attribute === 130 || e.type === 12 || e.type === 130) {
    if ((u.range || 0) <= 1) return false;
  }

  if (e.attribute === 8 || e.attribute === 9) {
    const { cls } = decodeEncoded(e.value);
    const hasArmorClass = u.armors && String(cls) in u.armors;
    const matchesBaseClass = cls === u.class;
    if (!hasArmorClass && !matchesBaseClass) return false;

    if (e.attribute === 9) {
      if (cls === 3 && (u.patk || 0) === 0) return false;
      if (cls === 4 && (u.matk || 0) === 0) return false;
    }
  }

  const cls = e.class !== undefined ? e.class : -1;

  // Deduplication: if we are a generic +Atk effect, hide it if specific (+Pierce) is present
  if ((e.type === 0 || e.type === 1 || e.type === 2 || e.type === 4) && e.attribute === 9 && cls === -1) {
    if (
      allEffects.some(
        (other) => other !== e && other.attribute === 9 && (other.class !== undefined ? other.class : -1) !== -1,
      )
    ) {
      return false;
    }
  }

  // If has class and not same as unit
  if (cls !== -1 && cls !== u.class) return false;

  return true;
}

export function shouldApplyTech(t: TechData, u: UnitData): boolean {
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
  // Strict Filtering: If a tech has ANY class-constrained effects,
  // the unit MUST match at least one of the intended targets.
  // Generic effects (class: -1) in a tech with filters shouldn't force-apply it to everyone.
  const constrained = effs.filter((e) => {
    let target = e.class !== undefined ? e.class : -1;
    if ((e.type === 8 || e.type === 9) && target === -1) target = e.attribute;
    return target !== -1;
  });

  if (constrained.length > 0) {
    const hasMatch = constrained.some((e) => matchesClass(e, u) && shouldApplyEffect(e, u, effs));
    if (!hasMatch) return false;
  }

  return effs.some((e) => shouldApplyEffect(e, u, effs));
}

export const COMBAT_BUILDINGS = [12, 87, 101, 49, 82, 103, 209, 45, 104, 1806, 109];

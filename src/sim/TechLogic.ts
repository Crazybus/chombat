import { TechData, UnitData } from './types';

export function decodeEncoded(val: number): { cls: number; amt: number } {
    const iv = Math.floor(val);
    let amt = iv & 0xFF;
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
    32: 'Unique'
};

export const CLASS_ALIASES: Record<number, number[]> = {
    12: [47], // Category 12 (Cavalry) includes Scouts (47). NOT CA (36).
    0: [36, 1, 44], // Category 0 (Archer) includes CA (36), Skirmishers (1), and HC (44)
};

export function getEffectLabel(e: any): string {
    const { t, a, v } = e;
    if (t === 8 || t === 9) {
        const { cls, amt } = decodeEncoded(v);
        const prefix = t === 9 ? 'Atk' : 'Arm';
        return `${CLASS_NAMES[cls] || `Cls${cls}`} ${prefix} ${amt >= 0 ? '+' : ''}${amt}`;
    }
    const attrMap: Record<number, string> = { 0: 'Atk', 3: 'Range', 12: 'HP', 10: 'Reload' };
    if (t === 130 || t === 23) return ''; // Hide internal accuracy/projectile speed effects
    if (t === 12) return `Range +${v}`;
    const name = attrMap[a] || 'Stat';
    if (t === 5 || t === 2) return `${name} x${v}`;
    return `${name} +${v}`;
}

export function matchesUnit(e: any, u: UnitData): boolean {
    return e.u === -1 || String(e.u) === u.id;
}

export function matchesClass(e: any, u: UnitData): boolean {
    const isArmorAttackEffect = e.t === 8 || e.t === 9;

    // If 'c' is not -1, it's the primary unit class filter.
    // If 'c' is -1 AND it's a combat effect (Type 8/9), 'a' is used as the filter.
    let targetClass = e.c;
    if (targetClass === -1 && isArmorAttackEffect) {
        targetClass = e.a;
    }

    // c: -1 for non-combat effects means 'Global' (e.g. Bloodlines HP)
    if (targetClass === -1) return true;

    const hasArmorClass = u.armors && (String(targetClass) in u.armors);
    const matchesBaseClass = targetClass == u.class;
    if (hasArmorClass || matchesBaseClass) return true;

    // Check category aliases
    if (CLASS_ALIASES[targetClass]) {
        return CLASS_ALIASES[targetClass].some(alias => alias == u.class);
    }

    return false;
}

export function shouldApplyEffect(e: any, u: UnitData, allEffects: any[] = []): boolean {
    if (!matchesUnit(e, u) || !matchesClass(e, u)) return false;

    // Range/Accuracy/Reload check: don't apply these bonuses to melee units
    if (e.t === 12 || e.a === 3 || e.a === 130 || e.t === 130 || e.a === 10) {
        if ((u.range || 0) <= 1) return false;
    }

    if (e.t === 8 || e.t === 9) {
        const { cls } = decodeEncoded(e.v);
        const hasArmorClass = u.armors && (String(cls) in u.armors);
        const matchesBaseClass = cls === u.class;
        if (!hasArmorClass && !matchesBaseClass) return false;

        if (e.t === 9) {
            if (cls === 3 && (u.patk || 0) === 0) return false;
            if (cls === 4 && (u.matk || 0) === 0) return false;
        }
    }

    // Deduplication: if we are a generic +Atk effect, hide it if specific (+Pierce) is present
    if ((e.t === 0 || e.t === 1 || e.t === 2) && e.a === 0) {
        if (allEffects.some(other => other !== e && other.t === 9)) return false;
    }

    return true;
}

export function shouldApplyTech(t: TechData, u: UnitData): boolean {
    // Essential combat techs still need to be relevant to the unit type
    if (t.id === 93) { // Ballistics
        // Only for units with range > 1
        return (u.range || 0) > 1;
    }
    if (t.id === 47) { // Chemistry
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
        if (u.class !== 12 && u.class !== 8 && u.class !== 28 && !Object.keys(armors).some(c => CAV_CLASSES.includes(c))) {
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

    // Strict Filtering: If a tech has ANY class-constrained effects, 
    // the unit MUST match at least one of the intended targets.
    // Generic effects (c: -1) in a tech with filters shouldn't force-apply it to everyone.
    const constrained = effs.filter(e => {
        let target = e.c;
        if ((e.t === 8 || e.t === 9) && target === -1) target = e.a;
        return target !== -1;
    });

    if (constrained.length > 0) {
        const hasMatch = constrained.some(e => matchesClass(e, u) && shouldApplyEffect(e, u, effs));
        if (!hasMatch) return false;
    }

    return effs.some(e => shouldApplyEffect(e, u, effs));
}

export const COMBAT_BUILDINGS = [12, 87, 101, 49, 82, 103, 209, 45];

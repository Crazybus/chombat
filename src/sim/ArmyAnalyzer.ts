import { ArmyState, UnitData, TechData } from './types';
import { CombatSim } from './CombatSim';
import { getEffectLabel, shouldApplyEffect, decodeEncoded, COMBAT_BUILDINGS, shouldApplyTech } from './TechLogic';

export interface StatSource {
  name: string;
  label: string;
  isBonus: boolean;
  type: 'tech' | 'override' | 'auto';
}

export interface StatGroup {
  label: string;
  icon: string;
  sources: StatSource[];
}

export interface ArmyAnalysis {
  baseUnit: UnitData;
  modifiedBase: any;
  effectiveStats: any;
  groups: Record<string, StatGroup>;
  unitName: string;
  ageName: string;
}

const fieldLabelMap: Record<string, string> = {
  h: 'HP', am: 'Melee Atk', ap: 'Pierce Atk', aa: 'Melee Arm', ar: 'Pierce Arm',
  rl: 'Reload', n: 'Range', as: 'Atk Speed', ab: 'Bonus Red'
};

const fieldToGroupMap: Record<string, string> = {
  h: 'hp', am: 'atk', ap: 'atk', aa: 'marm', ar: 'parm',
  rl: 'atk', n: 'range', as: 'atk', ab: 'other'
};

const unitKeyMap: Record<string, string> = {
  h: 'hp', am: 'matk', ap: 'patk', aa: 'marm', ar: 'parm',
  rl: 'reload', n: 'range', as: 'atk_speed', ab: 'bonus_red'
};

export function getAgeName(age: string) {
  switch (age) {
    case '1': return 'Dark Age';
    case '2': return 'Feudal Age';
    case '3': return 'Castle Age';
    case '4': return 'Imperial Age';
    default: return 'Dark Age';
  }
}

export function resolveBaseUnit(armyState: ArmyState, allUnits: Record<string, UnitData>): UnitData {
  let baseUnit = armyState.ps ? allUnits[armyState.ps] : null;
  if (!baseUnit && armyState.nm) {
    baseUnit = Object.values(allUnits).find(u => u.name === armyState.nm) || null;
  }

  if (baseUnit) return { ...baseUnit };

  return {
    name: armyState.nm || 'Custom Unit',
    hp: armyState.h || 0,
    matk: armyState.am || 0,
    patk: armyState.ap || 0,
    marm: armyState.aa || 0,
    parm: armyState.ar || 0,
    reload: armyState.rl || 2,
    range: armyState.n || 0,
    id: 'custom',
    class: -1,
    f: armyState.af || 0, w: armyState.aw || 0, g: armyState.ag || 0,
    trainTime: 30
  };
}

export function applyManualOverrides(baseUnit: UnitData, armyState: ArmyState): any {
  const modified = { ...baseUnit };
  modified.bonuses = { ...(baseUnit.bonuses || {}) };
  modified.armors = { ...(baseUnit.armors || {}) };

  Object.entries(unitKeyMap).forEach(([configKey, unitKey]) => {
    if ((armyState as any)[configKey] !== undefined) {
      (modified as any)[unitKey] = (armyState as any)[configKey];
    }
  });
  return modified;
}

export function getManualOverrideSources(baseUnit: UnitData, armyState: ArmyState): Record<string, StatSource[]> {
  const sources: Record<string, StatSource[]> = {};
  
  Object.entries(fieldLabelMap).forEach(([configKey, label]) => {
    const val = (armyState as any)[configKey];
    if (val !== undefined) {
      const unitKey = unitKeyMap[configKey];
      const baseVal = (baseUnit as any)[unitKey];
      
      if (baseVal === undefined || parseFloat(String(val)) !== parseFloat(String(baseVal))) {
        const group = fieldToGroupMap[configKey];
        const diff = parseFloat(String(val)) - parseFloat(String(baseVal || 0));
        const diffLabel = diff >= 0 ? `+${diff}` : `${diff}`;
        
        if (!sources[group]) sources[group] = [];
        sources[group].push({
          name: 'Manual Override',
          label: `Base stat changed: ${diffLabel}`,
          isBonus: diff > 0,
          type: 'override'
        });
      }
    }
  });
  return sources;
}

export function getTechBonusSources(
  baseUnit: UnitData, 
  armyState: ArmyState, 
  techsById: Record<number, TechData>,
  bonuses: Record<string, any>
): Record<string, StatSource[]> {
  const sources: Record<string, StatSource[]> = {};

  armyState.bn?.forEach(bState => {
    const tech = techsById[parseInt(bState.i)] || (bonuses as any)[bState.i];
    if (!tech || !tech.effects) return;
    
    const seenGroupLabels = new Set<string>();
    
    const techEffects = tech.effects.map((e: any, idx: number) => {
      if (!bState.e || !bState.e[idx]) return null;
      let label = getEffectLabel(e);
      if (!label) return null;
      
      label = label.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));
      
      let group = 'other';
      if (e.t === 0) group = 'hp';
      else if (e.t === 1 || e.t === 9) group = 'atk';
      else if (e.t === 8) {
        const { cls } = decodeEncoded(e.v);
        if (cls === 4) group = 'marm';
        else if (cls === 3) group = 'parm';
      } else if (e.t === 12 || e.a === 3) group = 'range';

      return { e, label, group };
    }).filter(x => x !== null) as { e: any, label: string, group: string }[];

    techEffects.forEach(({ e, label, group }) => {
      if (e.t === 1 && techEffects.some(other => other.e.t === 9 && other.group === group)) {
        return;
      }

      const attrStripRegex = /^(Pierce|Melee|Arc|Skirm|Inf|Cav|Bldg|Ram|Siege|Ship|Wall|Castle|Elephant|Unique)?\s?(Atk|Arm|HP|Range|Stat|Reload)\s?/i;
      const cleanLabel = label.replace(attrStripRegex, '').trim();

      let finalLabel = cleanLabel;
      if (group === 'other') {
        const attrNames: Record<number, string> = {
          130: 'Accuracy',
          10: 'Fire Rate',
          5: 'Speed',
          1: 'Speed',
          2: 'Speed',
          23: 'Projectile Speed'
        };
        const attrName = attrNames[e.a] || attrNames[e.t] || 'Stat';
        finalLabel = `${attrName} ${cleanLabel}`;
      }
      
      const groupLabel = `${group}-${finalLabel}`;
      if (seenGroupLabels.has(groupLabel)) return;
      seenGroupLabels.add(groupLabel);

      if (!sources[group]) sources[group] = [];
      sources[group].push({
        name: tech.name,
        label: finalLabel,
        isBonus: !finalLabel.includes('-'),
        type: 'tech'
      });
    });
  });
  return sources;
}

export function getAutoUpgradeSources(baseUnit: UnitData, age: string): Record<string, StatSource[]> {
  const sources: Record<string, StatSource[]> = {};
  const ageId = parseInt(age || '1');
  
  if (ageId >= 2) {
    const isScout = baseUnit.id === '448' || baseUnit.id === 'scout_cavalry';
    const isEagle = baseUnit.id === '751' || baseUnit.id === 'eagle_scout';
    if (isScout && baseUnit.matk === 3) {
      if (!sources.atk) sources.atk = [];
      sources.atk.push({ name: 'Unit Auto-upgrade', label: '+2 Melee Attack', isBonus: true, type: 'auto' });
    }
    if (isEagle && baseUnit.matk === 4) {
      if (!sources.atk) sources.atk = [];
      sources.atk.push({ name: 'Unit Auto-upgrade', label: '+3 Melee Attack', isBonus: true, type: 'auto' });
    }
  }
  return sources;
}

import { civs, GENERIC_CIV } from '../data/civs';

// ... (existing interfaces)

import { buildings } from '../data/buildings';

const buildingsById: Record<string, any> = {};
Object.values(buildings).forEach(b => buildingsById[b.id] = b);

function getTrueAge(t: TechData): number {
  // Base age from tech data (generic)
  const overrides: Record<number, number> = {
    47: 4,  // Chemistry is standardly Imperial (4)
    93: 3,  // Ballistics is standardly Castle (3)
  };
  return overrides[t.id] || t.age;
}

function isCombatTech(t: TechData): boolean {
  // Explicitly allow known essential combat techs that might have no effects in dataset
  const essentialCombatTechIds = [
    93, // Ballistics
    47, // Chemistry
  ];
  if (essentialCombatTechIds.includes(t.id)) return true;

  // Explicitly exclude known building-only techs
  const buildingOnlyIds = [
    50,  // Masonry
    194, // Architecture
    322, // Murder Holes
    608, // Hoardings
    602, // Stronghold
    213, // Fortified Wall
    221, // Guard Tower
    203, // Keep
    48,  // Bombard Tower
  ];
  if (buildingOnlyIds.includes(t.id)) return false;

  // Filter out technologies that apply to building-related armor classes.
  // Class 11 = Building, 21 = Wall, 27 = Castle
  const buildingRelatedClasses = [11, 21, 27];
  
  if (t.effects && t.effects.length > 0) {
    // If ANY effect targets a building class, exclude it from unit recommendations
    const hasBuildingEffect = t.effects.some(e => {
      const { cls } = decodeEncoded(e.v);
      const targetClass = e.c !== -1 ? e.c : (e.t === 8 || e.t === 9 ? e.a : -1);
      return buildingRelatedClasses.includes(targetClass) || buildingRelatedClasses.includes(cls);
    });

    if (hasBuildingEffect) return false;

    // Must also have at least one combat-related attribute target
    return t.effects.some(e => [0, 3, 4, 5, 6, 8, 9, 12].includes(e.a));
  }

  return false;
}

export function getRecommendedTechs(
  unit: UnitData,
  ageId: number,
  civKey: string | undefined,
  techsById: Record<number, TechData>,
  availableCivTechs: Record<number, number> // tech_id -> age_id
): TechData[] {
  return Object.values(techsById).filter((t) => {
    if (!COMBAT_BUILDINGS.includes(t.building)) return false;
    if (!isCombatTech(t)) return false;

    // 1. GLOBAL STRICT FILTERING:
    // Castle (82): Exclude from generic recommended unit techs to avoid clutter.
    // If a civ is selected, we allow it (it will be filtered by civ tree availability later).
    if (t.building === 82 && (!civKey || civKey === GENERIC_CIV)) return false;

    // University (209/49): only Ballistics (93) and Chemistry (47) are relevant for standard units
    if (t.building === 209 || t.building === 49) {
      if (t.id !== 93 && t.id !== 47) return false;
    }
    
    // 2. Resolve Tech Age for this civ
    let effectiveTechAge = getTrueAge(t);
    if (civKey && civKey !== GENERIC_CIV) {
      if (availableCivTechs[t.id] !== undefined) {
        effectiveTechAge = availableCivTechs[t.id];
      } else {
        return false; // Not in civ tree
      }
    } else {
      // ADDITIONAL filtering for Generic mode:
      if (t.id > 1000) return false;
    }

    // 3. Resolve Building Age
    // University (209) is Castle Age (3), Blacksmith (103) is Feudal (2), etc.
    const b = buildingsById[t.building.toString()];
    const buildingAge = b ? (b.age || 1) : 
                       (t.building === 209 || t.building === 49 ? 3 : // University fallback
                        t.building === 103 ? 2 : // Blacksmith fallback
                        t.building === 101 ? 3 : // Stable fallback
                        t.building === 87 ? 2 : // Archery Range fallback
                        t.building === 12 ? 1 : // Barracks fallback
                        1);

    // 4. Logic: Both tech and building must be available
    if (effectiveTechAge > ageId) return false;
    if (buildingAge > ageId) return false;

    // 5. Unit-specific applicability
    // shouldApplyTech checks if ANY of the tech's effects match the unit
    return shouldApplyTech(t, unit);
  });
}

export function analyzeArmy(
  armyState: ArmyState,
  allUnits: Record<string, UnitData>,
  techsById: Record<number, TechData>,
  bonuses: Record<string, any>
): ArmyAnalysis | null {
  const baseUnit = resolveBaseUnit(armyState, allUnits);
  const modifiedBase = applyManualOverrides(baseUnit, armyState);
  
  const sim = new CombatSim(baseUnit, baseUnit, armyState, armyState, techsById, allUnits);
  const effectiveStats = sim.dataA;

  const groups: Record<string, StatGroup> = {
    hp: { label: 'HP', icon: '❤️', sources: [] },
    atk: { label: 'Attack', icon: '⚔️', sources: [] },
    marm: { label: 'Melee Armor', icon: '🛡️', sources: [] },
    parm: { label: 'Pierce Armor', icon: '🛡️', sources: [] },
    range: { label: 'Range', icon: '🎯', sources: [] },
    other: { label: 'Misc', icon: '⚙️', sources: [] },
  };

  const overrideSources = getManualOverrideSources(baseUnit, armyState);
  const techSources = getTechBonusSources(baseUnit, armyState, techsById, bonuses);
  const autoSources = getAutoUpgradeSources(baseUnit, armyState.age || '1');

  [overrideSources, techSources, autoSources].forEach(sourceSet => {
    Object.entries(sourceSet).forEach(([group, items]) => {
      if (groups[group]) {
        groups[group].sources.push(...items);
      }
    });
  });

  return {
    baseUnit,
    modifiedBase,
    effectiveStats,
    groups,
    unitName: baseUnit.name,
    ageName: getAgeName(armyState.age || '1')
  };
}

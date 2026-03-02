import { ArmyState, UnitData, TechData } from './types';
import { CombatSim } from './CombatSim';
import { getEffectLabel, shouldApplyEffect, decodeEncoded, COMBAT_BUILDINGS, shouldApplyTech } from './TechLogic';
import { GENERIC_CIV } from '../data/civs';
import { buildings } from '../data/buildings';
import { techs } from '../data/techs';
import { bonuses as allBonuses } from '../data/bonuses';

// --- Interfaces ---

export interface StatSource {
  name: string;
  label: string;
  isBonus: boolean;
  type: 'tech' | 'override' | 'auto';
  techId?: string;
  isActive?: boolean;
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

// --- Maps & Helpers ---

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

const buildingsById: Record<string, any> = {};
Object.values(buildings).forEach(b => buildingsById[b.id] = b);

const techsByIdGlobal: Record<number, TechData> = {};
Object.values(techs).forEach(t => techsByIdGlobal[t.id] = t);

export function getAgeName(age: string) {
  switch (age) {
    case '1': return 'Dark Age';
    case '2': return 'Feudal Age';
    case '3': return 'Castle Age';
    case '4': return 'Imperial Age';
    default: return 'Dark Age';
  }
}

function getTrueAge(t: TechData): number {
  const overrides: Record<number, number> = {
    47: 4,  // Chemistry is standardly Imperial (4)
    93: 3,  // Ballistics is standardly Castle (3)
  };
  return overrides[t.id] || t.age;
}

function isCombatTech(t: TechData): boolean {
  const essentialCombatTechIds = [93, 47];
  if (essentialCombatTechIds.includes(t.id)) return true;

  const buildingOnlyIds = [50, 194, 322, 608, 602, 213, 221, 203, 48];
  if (buildingOnlyIds.includes(t.id)) return false;

  const buildingRelatedClasses = [11, 21, 27];
  if (t.effects && t.effects.length > 0) {
    const hasBuildingEffect = t.effects.some(e => {
      const { cls } = decodeEncoded(e.v);
      const targetClass = e.c !== -1 ? e.c : (e.t === 8 || e.t === 9 ? e.a : -1);
      return buildingRelatedClasses.includes(targetClass) || buildingRelatedClasses.includes(cls);
    });
    if (hasBuildingEffect) return false;
    return t.effects.some(e => [0, 3, 4, 5, 6, 8, 9, 12].includes(e.a));
  }
  return false;
}

// --- Main Library Functions ---

export function resolveBaseUnit(armyState: ArmyState, allUnits: Record<string, UnitData>): UnitData {
  let baseUnit = armyState.ps ? allUnits[armyState.ps] : null;
  if (!baseUnit && armyState.nm) {
    baseUnit = Object.values(allUnits).find(u => u.name === armyState.nm) || null;
  }
  if (!baseUnit) {
    return {
      name: armyState.nm || 'Custom Unit',
      hp: armyState.h || 0, matk: armyState.am || 0, patk: armyState.ap || 0,
      marm: armyState.aa || 0, parm: armyState.ar || 0, reload: armyState.rl || 2,
      range: armyState.n || 0, id: 'custom', class: -1,
      f: armyState.af || 0, w: armyState.aw || 0, g: armyState.ag || 0, trainTime: 30
    };
  }

  let resolved = { ...baseUnit };
  resolved.bonuses = { ...(baseUnit.bonuses || {}) };
  resolved.armors = { ...(baseUnit.armors || {}) };

  const ageId = parseInt(armyState.age || '1');
  if (ageId >= 2) {
    const isScout = resolved.id === '448' || resolved.id === 'scout_cavalry';
    const isEagle = resolved.id === '751' || resolved.id === 'eagle_scout';
    if (isScout && resolved.matk === 3) resolved.matk = 5;
    if (isEagle && resolved.matk === 4) resolved.matk = 7;
  }
  return resolved;
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
        sources[group].push({ name: 'Manual Override', label: `Base stat changed: ${diffLabel}`, isBonus: diff > 0, type: 'override' });
      }
    }
  });
  return sources;
}

export function getTechBonusSources(baseUnit: UnitData, armyState: ArmyState, techsById: Record<number, TechData>, bonuses: Record<string, any>): Record<string, StatSource[]> {
  const sources: Record<string, StatSource[]> = {};
  armyState.bn?.forEach(bState => {
    const tech = techsById[parseInt(bState.i)] || (bonuses as any)[bState.i];
    if (!tech || !tech.effects) return;
    const seenLabels = new Set<string>();
    const techEffects = tech.effects.map((e: any, idx: number) => {
      let label = getEffectLabel(e);
      if (!label) return null;
      label = label.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));
      let group = 'other';
      if (e.t === 0) group = 'hp';
      else if (e.t === 1 || e.t === 9) group = 'atk';
      else if (e.t === 8) {
        const { cls } = decodeEncoded(e.v);
        if (cls === 4) group = 'marm'; else if (cls === 3) group = 'parm';
      } else if (e.t === 12 || e.a === 3) group = 'range';
      return { e, label, group, idx };
    }).filter(x => x !== null) as { e: any, label: string, group: string, idx: number }[];

    techEffects.forEach(({ e, label, group, idx }) => {
      if (e.t === 1 && techEffects.some(other => other.e.t === 9 && other.group === group)) return;
      const attrStripRegex = /^(Pierce|Melee|Arc|Skirm|Inf|Cav|Bldg|Ram|Siege|Ship|Wall|Castle|Elephant|Unique)?\s?(Atk|Arm|HP|Range|Stat|Reload)\s?/i;
      const cleanLabel = label.replace(attrStripRegex, '').trim();
      let finalLabel = cleanLabel;
      if (group === 'other') {
        const attrNames: Record<number, string> = { 130: 'Accuracy', 10: 'Fire Rate', 5: 'Speed', 1: 'Speed', 2: 'Speed', 23: 'Projectile Speed' };
        const attrName = attrNames[e.a] || attrNames[e.t] || 'Stat';
        finalLabel = `${attrName} ${cleanLabel}`;
      }
      const groupLabel = `${group}-${finalLabel}`;
      if (seenLabels.has(groupLabel)) return;
      seenLabels.add(groupLabel);
      if (!sources[group]) sources[group] = [];
      sources[group].push({ 
        name: tech.name, 
        label: finalLabel, 
        isBonus: !finalLabel.includes('-'), 
        type: 'tech',
        techId: bState.i,
        isActive: bState.e[idx] !== false
      });
    });
  });
  return sources;
}

export function getAutoUpgradeSources(baseUnit: UnitData, age: string, originalStaticBase: UnitData): Record<string, StatSource[]> {
  return {};
}

export function getRecommendedTechs(unit: UnitData, ageId: number, civKey: string | undefined, techsById: Record<number, TechData>, availableCivTechs: Record<number, number>): TechData[] {
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;
  return Object.values(activeTechs).filter((t) => {
    if (!COMBAT_BUILDINGS.includes(t.building)) return false;
    if (!isCombatTech(t)) return false;
    if (t.building === 82 && (!civKey || civKey === GENERIC_CIV)) return false;
    if (t.building === 209 || t.building === 49) {
      if (t.id !== 93 && t.id !== 47) return false;
    }
    let effectiveTechAge = getTrueAge(t);
    if (civKey && civKey !== GENERIC_CIV) {
      if (availableCivTechs[t.id] !== undefined) effectiveTechAge = availableCivTechs[t.id];
      else return false;
    } else {
      if (t.id > 1000) return false;
    }
    const b = buildingsById[t.building.toString()];
    const buildingAge = b ? (b.age || 1) : (t.building === 209 || t.building === 49 ? 3 : t.building === 103 ? 2 : t.building === 101 ? 3 : t.building === 87 ? 2 : t.building === 12 ? 1 : 1);
    if (effectiveTechAge > ageId) return false;
    if (buildingAge > ageId) return false;
    return shouldApplyTech(t, unit);
  });
}

export function analyzeArmy(armyState: ArmyState, allUnits: Record<string, UnitData>, techsById: Record<number, TechData>): ArmyAnalysis | null {
  const staticBase = armyState.ps ? allUnits[armyState.ps] : (armyState.nm ? Object.values(allUnits).find(u => u.name === armyState.nm) : null);
  const resolvedBase = resolveBaseUnit(armyState, allUnits);
  const modifiedBase = applyManualOverrides(resolvedBase, armyState);
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;
  const sim = new CombatSim(resolvedBase, resolvedBase, armyState, armyState, activeTechs, allUnits);
  const effectiveStats = sim.dataA;
  const groups: Record<string, StatGroup> = {
    hp: { label: 'HP', icon: '❤️', sources: [] },
    atk: { label: 'Attack', icon: '⚔️', sources: [] },
    marm: { label: 'Melee Armor', icon: '🛡️', sources: [] },
    parm: { label: 'Pierce Armor', icon: '🛡️', sources: [] },
    range: { label: 'Range', icon: '🎯', sources: [] },
    other: { label: 'Misc', icon: '⚙️', sources: [] },
  };
  const overrideSources = getManualOverrideSources(resolvedBase, armyState);
  const techSources = getTechBonusSources(resolvedBase, armyState, activeTechs, allBonuses);
  const autoSources = getAutoUpgradeSources(resolvedBase, armyState.age || '1', staticBase || resolvedBase);
  [overrideSources, techSources, autoSources].forEach(sourceSet => {
    Object.entries(sourceSet).forEach(([group, items]) => {
      if (groups[group]) groups[group].sources.push(...items);
    });
  });
  const finalEffective = { ...effectiveStats, count: armyState.c !== undefined ? armyState.c : 1 };
  return { baseUnit: resolvedBase, modifiedBase, effectiveStats: finalEffective, groups, unitName: resolvedBase.name, ageName: getAgeName(armyState.age || '1') };
}

export function scrubArmy(army: ArmyState, allUnits: Record<string, UnitData>, techsById: Record<number, TechData>): ArmyState {
  const normalized = { ...army };
  const numericFields: (keyof ArmyState)[] = ['c', 'h', 'am', 'ap', 'aa', 'ar', 'rl', 'n', 'as', 'ab', 'ad', 'af', 'aw', 'ag', 'da', 'df', 'dw', 'dg', 'e', 'mc', 'sv'];
  numericFields.forEach(field => {
    const val = normalized[field];
    if (val !== undefined && val !== null && val !== '') {
      const parsed = parseFloat(String(val));
      if (!isNaN(parsed)) (normalized as any)[field] = parsed;
    }
  });
  const u = normalized.ps ? allUnits[normalized.ps] : (normalized.nm ? Object.values(allUnits).find(x => x.name === normalized.nm) : null);
  if (!u) return normalized;
  const cleanState: ArmyState = { ps: normalized.ps, nm: normalized.nm, age: normalized.age, cv: normalized.cv, bn: normalized.bn };
  const analysis = analyzeArmy(cleanState, allUnits, techsById);
  if (!analysis) return normalized;
  const { effectiveStats } = analysis;
  const scrubbed = { ...normalized };
  const mapping: Record<string, string> = { h: 'hp', am: 'matk', ap: 'patk', aa: 'marm', ar: 'parm', rl: 'reload', n: 'range', as: 'atk_speed', ab: 'bonus_red' };
  Object.entries(mapping).forEach(([configKey, statKey]) => {
    const overrideVal = (normalized as any)[configKey];
    const naturalVal = effectiveStats[statKey];
    if (overrideVal !== undefined && Math.abs(parseFloat(String(overrideVal)) - parseFloat(String(naturalVal || 0))) < 0.01) delete (scrubbed as any)[configKey];
  });
  return scrubbed;
}

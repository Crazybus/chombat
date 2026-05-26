import { ArmyState, UnitData, TechData } from './types';
import { CombatSim } from './CombatSim';
import { Unit } from './Unit';
import { getEffectLabel, decodeEncoded, COMBAT_BUILDINGS, shouldApplyTech, shouldApplyEffect } from './TechLogic';
import { EFFECT_ATTRIBUTES } from '../data/effect_constants';
import { GENERIC_CIV } from '../data/civs';
import { buildings } from '../data/buildings';
import { techs } from '../data/techs';
import { bonuses as allBonuses } from '../data/bonuses';
import { techTargetExceptions } from '../rules/tech_target_exceptions';

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
  naturalBase: any; // Stats with current age (auto-upgrades) but NO techs or manual overrides
  modifiedBase: any; // Stats with current age + manual overrides but NO techs
  effectiveStats: any; // Final stats with everything applied
  groups: Record<string, StatGroup>;
  unitName: string;
  ageName: string;
}

// --- Maps & Helpers ---

const fieldLabelMap: Record<string, string> = {
  hp: 'HP',
  meleeAttack: 'Melee Atk',
  pierceAttack: 'Pierce Atk',
  meleeArmor: 'Melee Arm',
  pierceArmor: 'Pierce Arm',
  reload: 'Reload',
  range: 'Range',
  attackSpeed: 'Atk Speed',
  bonusReduction: 'Bonus Red',
};

const fieldToGroupMap: Record<string, string> = {
  hp: 'hp',
  meleeAttack: 'atk',
  pierceAttack: 'atk',
  meleeArmor: 'marm',
  pierceArmor: 'parm',
  reload: 'atk',
  range: 'range',
  attackSpeed: 'atk',
  bonusReduction: 'other',
};

const unitKeyMap: Record<string, string> = {
  hp: 'hp',
  meleeAttack: 'matk',
  pierceAttack: 'patk',
  meleeArmor: 'marm',
  pierceArmor: 'parm',
  reload: 'reload',
  range: 'range',
  attackSpeed: 'attackSpeed',
  bonusReduction: 'bonusReduction',
  speed: 'speed',
};

const buildingsById: Record<string, any> = {};
Object.values(buildings).forEach((b) => (buildingsById[b.id] = b));

const techsByIdGlobal: Record<number | string, TechData> = {};
Object.values(techs).forEach((t) => (techsByIdGlobal[t.id] = t));
Object.entries(allBonuses).forEach(([civKey, bonus]) => {
  (techsByIdGlobal as any)[civKey] = bonus;
});

export function getAgeName(age: string) {
  switch (age) {
    case '1':
      return 'Dark Age';
    case '2':
      return 'Feudal Age';
    case '3':
      return 'Castle Age';
    case '4':
      return 'Imperial Age';
    default:
      return 'Dark Age';
  }
}

const AGE_OVERRIDES: Record<number, number> = {
  47: 4, // Chemistry is standardly Imperial (4)
  93: 3, // Ballistics is standardly Castle (3)
};

function getTrueAge(t: TechData): number {
  return AGE_OVERRIDES[t.id] ?? t.age;
}

function isCombatTech(t: TechData): boolean {
  const essentialCombatTechIds = [93, 47, 22, 249, 213]; // Ballistics, Chemistry, Loom, Hand Cart, Wheelbarrow
  if (essentialCombatTechIds.includes(t.id)) return true;

  const buildingOnlyIds = [50, 194, 322, 608, 602, 221, 203, 48, 8, 280, 441, 101, 102, 103]; // Removed 249, 213, added age ups
  if (buildingOnlyIds.includes(t.id)) return false;

  const buildingRelatedClasses = [11, 21, 27];
  if (t.effects && t.effects.length > 0) {
    const hasBuildingEffect = t.effects.some((e) => {
      const { cls } = decodeEncoded(e.value);
      const targetClass = e.class !== -1 ? e.class : e.attribute === 8 || e.attribute === 9 ? e.attribute : -1;
      return buildingRelatedClasses.includes(targetClass) || buildingRelatedClasses.includes(cls);
    });
    if (hasBuildingEffect) return false;
    return t.effects.some((e) => [0, 5, 8, 9, 10, 11, 12, 15, 20, 24, 25, 100, 101, 102, 103, 105].includes(e.attribute));
  }
  return false;
}

// --- Main Library Functions ---

export function resolveBaseUnit(armyState: ArmyState, allUnits: Record<string, UnitData>): UnitData {
  let baseUnit = armyState.preset ? allUnits[armyState.preset] : null;
  if (!baseUnit && armyState.name) {
    baseUnit = Object.values(allUnits).find((u) => u.name === armyState.name) || null;
  }
  if (!baseUnit) {
    return {
      name: armyState.name || 'Custom Unit',
      hp: armyState.overrides?.hp || 0,
      matk: armyState.overrides?.meleeAttack || 0,
      patk: armyState.overrides?.pierceAttack || 0,
      marm: armyState.overrides?.meleeArmor || 0,
      parm: armyState.overrides?.pierceArmor || 0,
      reload: armyState.overrides?.reload || 2,
      range: armyState.overrides?.range || 0,
      id: 'custom',
      class: -1,
      food: armyState.overrides?.cost?.food || 0,
      wood: armyState.overrides?.cost?.wood || 0,
      gold: armyState.overrides?.cost?.gold || 0,
      trainTime: 30,
    };
  }
  return { ...baseUnit };
}

export function applyManualOverrides(baseUnit: UnitData, armyState: ArmyState): any {
  const modified = { ...baseUnit };
  modified.bonuses = { ...(baseUnit.bonuses || {}) };
  modified.armors = { ...(baseUnit.armors || {}) };
  if (armyState.overrides) {
    Object.entries(unitKeyMap).forEach(([configKey, unitKey]) => {
      if ((armyState.overrides as any)[configKey] !== undefined) {
        (modified as any)[unitKey] = (armyState.overrides as any)[configKey];
      }
    });
    if (armyState.overrides.cost) {
      if (armyState.overrides.cost.food !== undefined) modified.food = armyState.overrides.cost.food;
      if (armyState.overrides.cost.wood !== undefined) modified.wood = armyState.overrides.cost.wood;
      if (armyState.overrides.cost.gold !== undefined) modified.gold = armyState.overrides.cost.gold;
    }
    if (armyState.overrides.trainingTime !== undefined) modified.trainTime = armyState.overrides.trainingTime;
  }
  return modified;
}

export function getManualOverrideSources(
  ageResolvedBase: UnitData,
  armyState: ArmyState,
): Record<string, StatSource[]> {
  const sources: Record<string, StatSource[]> = {};
  if (!armyState.overrides) return sources;

  Object.entries(fieldLabelMap).forEach(([configKey]) => {
    const val = (armyState.overrides as any)[configKey];
    if (val !== undefined) {
      const unitKey = unitKeyMap[configKey];
      const baseVal = (ageResolvedBase as any)[unitKey];
      if (baseVal === undefined || parseFloat(String(val)) !== parseFloat(String(baseVal))) {
        const group = fieldToGroupMap[configKey];
        const diff = parseFloat(String(val)) - parseFloat(String(baseVal || 0));
        const diffLabel = diff >= 0 ? `+${diff}` : `${diff}`;
        if (!sources[group]) sources[group] = [];
        sources[group].push({ name: 'Manual Override', label: diffLabel, isBonus: diff > 0, type: 'override' });
      }
    }
  });
  return sources;
}

export function getTechBonusSources(
  armyState: ArmyState,
  techsById: Record<number | string, TechData>,
  bonuses: Record<string, any>,
  allUnits: Record<string, UnitData>,
): Record<string, StatSource[]> {
  const sources: Record<string, StatSource[]> = {};
  const baseUnit = resolveBaseUnit(armyState, allUnits);
  const ageId = parseInt(armyState.age || '1');
  const civExceptions = armyState.civ ? techTargetExceptions[armyState.civ] : undefined;

  armyState.bonuses?.forEach((bState) => {
    const tech = techsById[bState.id] || (bonuses as any)[bState.id];
    if (!tech || !tech.effects) return;
    const seenLabels = new Set<string>();
    const techEffects = tech.effects
      .map((e: any, idx: number) => {
        if (!shouldApplyEffect(e, baseUnit, tech.effects, ageId, bState.id, tech.building, civExceptions)) return null;
        let label = getEffectLabel(e);
        if (!label) return null;
        label = label.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));
        // Route group by attribute (e.attribute), matching applyBonuses logic
        let group = 'other';
        if (e.attribute === EFFECT_ATTRIBUTES.hp) {
          group = 'hp';
        } else if (e.attribute === EFFECT_ATTRIBUTES.armor) {
          const { cls } = decodeEncoded(e.value);
          if (cls === 4) group = 'marm';
          else if (cls === 3) group = 'parm';
        } else if (e.attribute === EFFECT_ATTRIBUTES.attack || e.attribute === EFFECT_ATTRIBUTES.reload) {
          group = 'atk';
        } else if (e.attribute === EFFECT_ATTRIBUTES.max_range) {
          group = 'range';
        } else if (
          e.attribute === EFFECT_ATTRIBUTES.food_cost ||
          e.attribute === EFFECT_ATTRIBUTES.wood_cost ||
          e.attribute === EFFECT_ATTRIBUTES.stone_cost ||
          e.attribute === EFFECT_ATTRIBUTES.gold_cost ||
          e.attribute === EFFECT_ATTRIBUTES.total_cost
        ) {
          group = 'other';
        }
        return { e, label, group, idx };
      })
      .filter((x) => x !== null) as { e: any; label: string; group: string; idx: number }[];

    techEffects.forEach(({ e, label, group }) => {
      const attrStripRegex =
        /^(Pierce|Melee|Arc|Skirm|Inf|Cav|Bldg|Ram|Siege|Ship|Wall|Castle|Elephant|Unique)?\s?(Atk|Arm|HP|Range|Stat|Reload|Food|Wood|Stone|Gold|Cost)\s?/i;
      const cleanLabel = label.replace(attrStripRegex, '').trim();
      let finalLabel = cleanLabel;
      if (group === 'other') {
        const attrNames: Record<number, string> = {
          [EFFECT_ATTRIBUTES.accuracy]: 'Accuracy',
          [EFFECT_ATTRIBUTES.reload]: 'Fire Rate',
          [EFFECT_ATTRIBUTES.speed]: 'Speed',
          [EFFECT_ATTRIBUTES.food_cost]: 'Food Cost',
          [EFFECT_ATTRIBUTES.wood_cost]: 'Wood Cost',
          [EFFECT_ATTRIBUTES.stone_cost]: 'Stone Cost',
          [EFFECT_ATTRIBUTES.gold_cost]: 'Gold Cost',
          [EFFECT_ATTRIBUTES.total_cost]: 'Cost',
        };
        const attrName = attrNames[e.attribute] || 'Stat';
        finalLabel = `${attrName} ${cleanLabel}`;
      }
      const allActive = bState.effects.every((x) => x);
      const groupLabel = `${group}-${finalLabel}`;
      if (seenLabels.has(groupLabel)) return;
      seenLabels.add(groupLabel);
      if (!sources[group]) sources[group] = [];
      sources[group].push({
        name: tech.name,
        label: finalLabel,
        isBonus: !finalLabel.includes('-'),
        type: 'tech',
        techId: bState.id,
        isActive: allActive,
      });
    });
  });
  return sources;
}

export function getRecommendedTechs(
  unit: UnitData,
  ageId: number,
  civKey: string | undefined,
  techsById: Record<number, TechData>,
  availableCivTechs: Record<number, number>,
): TechData[] {
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;
  return Object.values(activeTechs).filter((t) => {
    if (!COMBAT_BUILDINGS.includes(t.building) && !t.civ) return false;
    if (!isCombatTech(t)) return false;
    if (t.building === 209 || t.building === 49) {
      if (t.id !== 93 && t.id !== 47) return false;
    }

    // If civ tech but no civ provided
    if (t.civ > 0 && (!civKey || civKey == GENERIC_CIV)) return false;

    let effectiveTechAge = getTrueAge(t);
    if (civKey && civKey !== GENERIC_CIV) {
      if (availableCivTechs[t.id] !== undefined) effectiveTechAge = availableCivTechs[t.id];
      else return false;
    } else {
      if (t.id > 1000) return false;
    }

    // Get minimum age from required techs and exclude if a required tech isn't available to the civ.
    for (const reqId of t.requires?.techs ?? []) {
      const req = activeTechs[reqId];
      if (!req || req.building === -1) continue;
      if (civKey && civKey !== GENERIC_CIV && availableCivTechs[reqId] === undefined) return false;
      effectiveTechAge = Math.max(effectiveTechAge, getTrueAge(req));
    }
    if (effectiveTechAge > ageId) return false;
    const b = buildingsById[t.building.toString()];
    const buildingAge = b
      ? b.age || 1
      : t.building === 209 || t.building === 49
        ? 3
        : t.building === 103
          ? 2
          : t.building === 101
            ? 3
            : t.building === 87
              ? 2
              : t.building === 12
                ? 1
                : 1;

    if (buildingAge > ageId) return false;
    const civExceptions = civKey ? techTargetExceptions[civKey] : undefined;
    return shouldApplyTech(t, unit, ageId, civExceptions);
  });
}

export function calculateEqualResources(
  countA: number,
  unitA: UnitData,
  stateA: ArmyState,
  unitB: UnitData,
  stateB: ArmyState,
  techsById: Record<number | string, TechData>,
  allUnits: Record<string, UnitData>,
): number {
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;
  const simA = new CombatSim(unitA, unitA, stateA, stateA, activeTechs, allUnits);
  const uA = simA.dataA;
  const simB = new CombatSim(unitB, unitB, stateB, stateB, activeTechs, allUnits);
  const uB = simB.dataB;

  // Use the Unit class with the FULLY RESOLVED data from applyBonuses.
  // uA already contains overrides AND tech discounts applied to the base fields.
  const costA = new Unit(uA).getParsedCost().total;
  const costB = new Unit(uB).getParsedCost().total;

  if (costB <= 0) return countA;
  return Math.round((countA * costA) / costB);
}

export function calculateEqualProductionTime(
  countA: number,
  unitA: UnitData,
  stateA: ArmyState,
  unitB: UnitData,
  stateB: ArmyState,
  techsById: Record<number | string, TechData>,
  allUnits: Record<string, UnitData>,
): number {
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;
  const simA = new CombatSim(unitA, unitA, stateA, stateA, activeTechs, allUnits);
  const timeA = simA.dataA.trainTime || 30;
  const simB = new CombatSim(unitB, unitB, stateB, stateB, activeTechs, allUnits);
  const timeB = simB.dataB.trainTime || 30;

  if (timeB <= 0) return countA;
  return Math.round((countA * timeA) / timeB);
}

export function calculateEqualFight(
  countA: number,
  unitA: UnitData,
  stateA: ArmyState,
  unitB: UnitData,
  stateB: ArmyState,
  techsById: Record<number, TechData>,
  allUnits: Record<string, UnitData>,
): number {
  let bestB = 1;
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;

  // Simple linear search to find the "tipping point"
  for (let b = 1; b <= 200; b++) {
    const sim = new CombatSim(
      unitA,
      unitB,
      { ...stateA, count: countA },
      { ...stateB, count: b },
      activeTechs,
      allUnits,
    );
    const res = sim.run();
    if (res.armyA.totalHp > res.armyB.totalHp) {
      bestB = b;
    } else {
      break; // B won, so previous B was the limit
    }
  }
  return bestB;
}

export function analyzeArmy(
  armyState: ArmyState,
  allUnits: Record<string, UnitData>,
  techsById: Record<number | string, TechData>,
): ArmyAnalysis | null {
  const baseUnit = resolveBaseUnit(armyState, allUnits);
  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;

  // 1. Natural Base (Current Age auto-upgrades but NO techs/overrides)
  const configNatural: ArmyState = { age: armyState.age };
  const simNatural = new CombatSim(baseUnit, baseUnit, configNatural, configNatural, activeTechs, allUnits);
  const naturalBase = simNatural.dataA;

  // 2. Modified Base (Resolved Base + Overrides)
  const modifiedBase = applyManualOverrides(naturalBase, armyState);

  // 3. Final Effective (Everything)
  const simFinal = new CombatSim(baseUnit, baseUnit, armyState, armyState, activeTechs, allUnits);

  const finalEffective = { ...simFinal.dataA, count: armyState.count !== undefined ? armyState.count : 1 };

  const isMelee = (finalEffective.range || 0) <= 1;
  const groups: Record<string, StatGroup> = {
    hp: { label: 'HP', icon: '❤️', sources: [] },
    atk: { label: 'Attack', icon: isMelee ? '⚔️' : '🏹', sources: [] },
    marm: { label: 'Melee Armor', icon: '🛡️', sources: [] },
    parm: { label: 'Pierce Armor', icon: '🛡️', sources: [] },
    range: { label: 'Range', icon: '🎯', sources: [] },
    other: { label: 'Misc', icon: '⚙️', sources: [] },
  };
  const overrideSources = getManualOverrideSources(naturalBase, armyState);
  const techSources = getTechBonusSources(armyState, activeTechs, allBonuses, allUnits);

  [overrideSources, techSources].forEach((sourceSet) => {
    Object.entries(sourceSet).forEach(([group, items]) => {
      if (groups[group]) groups[group].sources.push(...items);
    });
  });
  return {
    baseUnit,
    naturalBase,
    modifiedBase,
    effectiveStats: finalEffective,
    groups,
    unitName: baseUnit.name,
    ageName: getAgeName(armyState.age || '1'),
  };
}

// --- Duel Analysis ---

export interface DuelAnalysisRow {
  label: string;
  a: string;
  b: string;
  valA: number;
  valB: number;
}

export interface DuelAnalysis {
  winner: string;
  winnerColor: string;
  remainingInfo: string;
  rows: DuelAnalysisRow[];
  nameA: string;
  nameB: string;
}

export function analyzeDuel(
  stateA: ArmyState,
  stateB: ArmyState,
  analysisA: ArmyAnalysis,
  analysisB: ArmyAnalysis,
  techsById: Record<number | string, TechData>,
  allUnits: Record<string, UnitData>,
): DuelAnalysis {
  const configA = { ...stateA, count: 1 };
  const configB = { ...stateB, count: 1 };

  const activeTechs = techsById && Object.keys(techsById).length > 0 ? techsById : techsByIdGlobal;
  const sim = new CombatSim(analysisA.baseUnit, analysisB.baseUnit, configA, configB, activeTechs, allUnits);
  const res = sim.run();

  const uA = new Unit(sim.dataA);
  const uB = new Unit(sim.dataB);
  const baseA = analysisA.naturalBase;
  const baseB = analysisB.naturalBase;
  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const formatWithBase = (total: number, base: number) => {
    const diff = total - base;
    if (Math.abs(diff) < 0.01) return total.toFixed(0);
    return `${total.toFixed(0)} (${base.toFixed(0)}${diff > 0 ? ' +' : ' '}${diff.toFixed(0)})`;
  };

  const getNetDmg = (atk: Unit, def: Unit) => {
    const isMelee = atk.isMelee();
    const baseAtk = isMelee ? atk.matk : atk.patk;
    const baseArm = isMelee ? def.marm : def.parm;

    let bonus = 0;
    const attBonuses = atk.bonuses || {};
    const defArmors = def.armors || {};

    for (const [cls, amt] of Object.entries(attBonuses)) {
      if (defArmors[cls] !== undefined) {
        const defArm = defArmors[cls] || 0;
        bonus += Math.max(0, amt - defArm);
      }
    }

    return { base: baseAtk, arm: baseArm, bonus, net: Math.max(1, baseAtk - baseArm + bonus) };
  };

  const nA = getNetDmg(uA, uB);
  const nB = getNetDmg(uB, uA);

  const getBaseAtk = (u: Unit, b: any) => (u.isMelee() ? b.matk : b.patk);
  const getBaseArm = (atk: Unit, defBase: any) => (atk.isMelee() ? defBase.marm : defBase.parm);

  const hitsToKillA = Math.ceil(uB.hpPerUnit / nA.net);
  const hitsToKillB = Math.ceil(uA.hpPerUnit / nB.net);
  const timeToKillA = hitsToKillA * uA.reload;
  const timeToKillB = hitsToKillB * uB.reload;
  const duration = res.duration;

  let winner = 'Draw';
  let winnerColor = 'var(--text-color)';
  let remainingInfo = '';

  if (res.armyA.totalHp > res.armyB.totalHp) {
    winner = nameA;
    winnerColor = 'var(--army-a-color)';
    remainingInfo = `${res.armyA.totalHp.toFixed(0)} HP remaining`;
  } else if (res.armyB.totalHp > res.armyA.totalHp) {
    winner = nameB;
    winnerColor = 'var(--army-b-color)';
    remainingInfo = `${res.armyB.totalHp.toFixed(0)} HP remaining`;
  }

  const rows: DuelAnalysisRow[] = [
    {
      label: 'HP (base + upgrades)',
      a: formatWithBase(uA.hpPerUnit, baseA?.hp || uA.hpPerUnit),
      b: formatWithBase(uB.hpPerUnit, baseB?.hp || uB.hpPerUnit),
      valA: uA.hpPerUnit,
      valB: uB.hpPerUnit,
    },
    {
      label: 'Attack (base + upgrades)',
      a: formatWithBase(nA.base, getBaseAtk(uA, baseA)),
      b: formatWithBase(nB.base, getBaseAtk(uB, baseB)),
      valA: nA.base,
      valB: nB.base,
    },
    { label: 'Bonus Dmg', a: nA.bonus.toFixed(0), b: nB.bonus.toFixed(0), valA: nA.bonus, valB: nB.bonus },
    {
      label: 'Armor',
      a: formatWithBase(nB.arm, getBaseArm(uB, baseA)),
      b: formatWithBase(nA.arm, getBaseArm(uA, baseB)),
      valA: nB.arm,
      valB: nA.arm,
    },
    {
      label: 'Damage Per Hit',
      a: `${nA.net.toFixed(0)} (${nA.base.toFixed(0)} - ${nA.arm.toFixed(0)} + ${nA.bonus.toFixed(0)})`,
      b: `${nB.net.toFixed(0)} (${nB.base.toFixed(0)} - ${nB.arm.toFixed(0)} + ${nB.bonus.toFixed(0)})`,
      valA: nA.net,
      valB: nB.net,
    },
    {
      label: 'Hits to Kill',
      a: hitsToKillA.toString(),
      b: hitsToKillB.toString(),
      valA: hitsToKillA,
      valB: hitsToKillB,
    },
    {
      label: 'Hits Performed',
      a: (winner === nameA ? hitsToKillA : Math.floor(duration / uA.reload)).toString(),
      b: (winner === nameB ? hitsToKillB : Math.floor(duration / uB.reload)).toString(),
      valA: winner === nameA ? hitsToKillA : Math.floor(duration / uA.reload),
      valB: winner === nameB ? hitsToKillB : Math.floor(duration / uB.reload),
    },
    {
      label: 'Time to Kill',
      a: timeToKillA.toFixed(1) + 's',
      b: timeToKillB.toFixed(1) + 's',
      valA: timeToKillA,
      valB: timeToKillB,
    },
    { label: 'Attack Reload Time', a: uA.reload.toFixed(2), b: uB.reload.toFixed(2), valA: uA.reload, valB: uB.reload },
    {
      label: 'Damage Per Second',
      a: (nA.net / uA.reload).toFixed(2),
      b: (nB.net / uB.reload).toFixed(2),
      valA: nA.net / uA.reload,
      valB: nB.net / uB.reload,
    },
    {
      label: 'Food Cost',
      a: formatWithBase(uA.food, baseA?.food || 0),
      b: formatWithBase(uB.food, baseB?.food || 0),
      valA: uA.food,
      valB: uB.food,
    },
    {
      label: 'Wood Cost',
      a: formatWithBase(uA.wood, baseA?.wood || 0),
      b: formatWithBase(uB.wood, baseB?.wood || 0),
      valA: uA.wood,
      valB: uB.wood,
    },
    {
      label: 'Gold Cost',
      a: formatWithBase(uA.gold, baseA?.gold || 0),
      b: formatWithBase(uB.gold, baseB?.gold || 0),
      valA: uA.gold,
      valB: uB.gold,
    },
    {
      label: 'Total Cost',
      a: (uA.food + uA.wood + uA.gold).toFixed(0),
      b: (uB.food + uB.wood + uB.gold).toFixed(0),
      valA: uA.food + uA.wood + uA.gold,
      valB: uB.food + uB.wood + uB.gold,
    },
    {
      label: 'Production Time',
      a: (analysisA.modifiedBase.trainTime || 30).toFixed(1) + 's',
      b: (analysisB.modifiedBase.trainTime || 30).toFixed(1) + 's',
      valA: analysisA.modifiedBase.trainTime || 30,
      valB: analysisB.modifiedBase.trainTime || 30,
    },
  ];

  return { winner, winnerColor, remainingInfo, rows, nameA, nameB };
}

export function scrubArmy(
  army: ArmyState,
  allUnits: Record<string, UnitData>,
  techsById: Record<number, TechData>,
): ArmyState {
  const normalized = { ...army };
  if (normalized.overrides) {
    const numericFields = [
      'hp',
      'meleeAttack',
      'pierceAttack',
      'meleeArmor',
      'pierceArmor',
      'reload',
      'range',
      'attackSpeed',
      'bonusReduction',
      'accuracy',
      'engagement',
      'micro',
      'trainingTime',
    ];
    numericFields.forEach((field) => {
      const val = (normalized.overrides as any)[field];
      if (val !== undefined && val !== null && val !== '') {
        const parsed = parseFloat(String(val));
        if (!isNaN(parsed)) (normalized.overrides as any)[field] = parsed;
      }
    });

    if (normalized.overrides.cost) {
      ['food', 'wood', 'gold'].forEach((field) => {
        const val = (normalized.overrides!.cost as any)[field];
        if (val !== undefined && val !== null && val !== '') {
          const parsed = parseFloat(String(val));
          if (!isNaN(parsed)) (normalized.overrides!.cost as any)[field] = parsed;
        }
      });
    }

    if (normalized.overrides.discount) {
      ['all', 'food', 'wood', 'gold'].forEach((field) => {
        const val = (normalized.overrides!.discount as any)[field];
        if (val !== undefined && val !== null && val !== '') {
          const parsed = parseFloat(String(val));
          if (!isNaN(parsed)) (normalized.overrides!.discount as any)[field] = parsed;
        }
      });
    }
  }

  // count and startVillagers are top-level
  ['count', 'startVillagers'].forEach((field) => {
    const val = (normalized as any)[field];
    if (val !== undefined && val !== null && val !== '') {
      const parsed = parseFloat(String(val));
      if (!isNaN(parsed)) (normalized as any)[field] = parsed;
    }
  });

  const u = normalized.preset
    ? allUnits[normalized.preset]
    : normalized.name
      ? Object.values(allUnits).find((x) => x.name === normalized.name)
      : null;
  if (!u) return normalized;
  const cleanState: ArmyState = {
    preset: normalized.preset,
    name: normalized.name,
    age: normalized.age,
    civ: normalized.civ,
    bonuses: normalized.bonuses,
  };
  const analysis = analyzeArmy(cleanState, allUnits, techsById);
  if (!analysis) return normalized;
  const { effectiveStats } = analysis;
  const scrubbed = { ...normalized };
  const mapping: Record<string, string> = {
    hp: 'hp',
    meleeAttack: 'matk',
    pierceAttack: 'patk',
    meleeArmor: 'marm',
    pierceArmor: 'parm',
    reload: 'reload',
    range: 'range',
    attackSpeed: 'attackSpeed',
    bonusReduction: 'bonusReduction',
  };
  if (scrubbed.overrides) {
    Object.entries(mapping).forEach(([configKey, statKey]) => {
      const overrideVal = (scrubbed.overrides as any)[configKey];
      const naturalVal = effectiveStats[statKey];
      if (
        overrideVal !== undefined &&
        Math.abs(parseFloat(String(overrideVal)) - parseFloat(String(naturalVal || 0))) < 0.01
      )
        delete (scrubbed.overrides as any)[configKey];
    });
    if (Object.keys(scrubbed.overrides).length === 0) delete scrubbed.overrides;
  }
  return scrubbed;
}

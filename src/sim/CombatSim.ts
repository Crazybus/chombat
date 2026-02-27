import { Unit } from './Unit';
import { UnitData, ArmyState, TechData } from './types';
import { decodeEncoded, shouldApplyEffect } from './TechLogic';

export interface BattleTick {
  time: number;
  countA: number;
  countB: number;
  hpA: number;
  hpB: number;
  valRemainingA: number;
  valRemainingB: number;
  valLostA: number;
  valLostB: number;
}

export interface CombatResult {
  armyA: { remaining: number; totalHp: number; initialTotalHp: number };
  armyB: { remaining: number; totalHp: number; initialTotalHp: number };
  history: BattleTick[];
  duration: number;
  dataA: any; // Effective stats for display
  dataB: any;
}

export class CombatSim {
  time: number = 0;
  tick: number = 0.05;
  history: BattleTick[] = [];
  dataA: any;
  dataB: any;

  constructor(
    armyA: UnitData,
    armyB: UnitData,
    configA: ArmyState,
    configB: ArmyState,
    allTechs: Record<number, TechData>,
    allUnits: Record<string, UnitData>
  ) {
    this.dataA = this.applyBonuses({ ...armyA, ...configA }, configA.bn || [], 'a', allTechs, allUnits);
    this.dataB = this.applyBonuses({ ...armyB, ...configB }, configB.bn || [], 'b', allTechs, allUnits);

    // Ensure bonuses and armors are preserved
    if (!this.dataA.bonuses && armyA.bonuses) this.dataA.bonuses = armyA.bonuses;
    if (!this.dataA.armors && armyA.armors) this.dataA.armors = armyA.armors;
    if (!this.dataB.bonuses && armyB.bonuses) this.dataB.bonuses = armyB.bonuses;
    if (!this.dataB.armors && armyB.armors) this.dataB.armors = armyB.armors;
  }



  applyBonuses(
    unitData: any,
    bonusesState: { i: string; e: boolean[] }[],
    armyLetter: string,
    allTechs: Record<number, TechData>,
    allUnits: Record<string, UnitData>
  ): any {
    let newUnit = { ...unitData };
    const uBase = allUnits[unitData.id] || unitData;

    bonusesState.forEach((state) => {
      const b = allTechs[parseInt(state.i)];
      if (!b) return;

      // If we are in browser, we check the checkboxes. If not (tests), we assume true.
      const isEffectActive = (idx: number) => {
        if (typeof document === 'undefined') return state.e[idx] !== false;
        const cb = document.querySelector(
          `#${armyLetter}-applied-bonuses .applied-bonus[data-id="${state.i}"] .applied-bonus-effect:nth-child(${idx + 1}) input`
        ) as HTMLInputElement;
        return cb ? cb.checked : state.e[idx] !== false;
      };

      const effs = b.effects || [];
      effs.forEach((e, idx) => {
        if (!isEffectActive(idx)) return;

        if (shouldApplyEffect(e, uBase, effs)) {
          const val = e.v;

          // Type-based mapping for this dataset:
          // t: 0 -> Add HP
          // t: 1 -> Add Attack
          // t: 5 -> Mult Speed
          // t: 10 -> Mult Reload (Rate of Fire)
          // t: 12 -> Add Range
          // t: 8/9 -> Class Armor/Attack (Encoded)

          if (e.t === 0) { // Add HP
            newUnit.hp += val;
            if (newUnit.h !== undefined) newUnit.h += val;
          } else if (e.t === 1) { // Add Attack (Generic)
            if (newUnit.matk > 0) {
              newUnit.matk += val;
              if (newUnit.am !== undefined) newUnit.am += val;
            }
            if (newUnit.patk > 0) {
              newUnit.patk += val;
              if (newUnit.ap !== undefined) newUnit.ap += val;
            }
          } else if (e.t === 5) { // Mult Speed
            if (newUnit.speed !== undefined) newUnit.speed *= val;
            if (newUnit.s !== undefined) newUnit.s *= val;
          } else if (e.t === 10) { // Mult Reload
            newUnit.reload *= val;
            if (newUnit.rl !== undefined) newUnit.rl *= val;
          } else if (e.t === 12) { // Add Range
            newUnit.range += val;
            if (newUnit.n !== undefined) newUnit.n += val;
          } else if (e.t === 8 || e.t === 9) {
            const { cls, amt } = decodeEncoded(val);
            if (e.t === 9) { // Class Attack
              if (cls === 3) { // Pierce
                if (newUnit.patk > 0) {
                  newUnit.patk += amt;
                  if (newUnit.ap !== undefined) newUnit.ap += amt;
                }
              } else if (cls === 4) { // Melee
                if (newUnit.matk > 0) {
                  newUnit.matk += amt;
                  if (newUnit.am !== undefined) newUnit.am += amt;
                }
              } else {
                if (!newUnit.bonuses) newUnit.bonuses = { ...uBase.bonuses };
                newUnit.bonuses[cls] = (newUnit.bonuses[cls] || 0) + amt;
              }
            } else { // Class Armor
              if (cls === 3) { // Pierce
                newUnit.parm += amt;
                if (newUnit.ar !== undefined) newUnit.ar += amt;
              } else if (cls === 4) { // Melee
                newUnit.marm += amt;
                if (newUnit.aa !== undefined) newUnit.aa += amt;
              } else {
                if (!newUnit.armors) newUnit.armors = { ...uBase.armors };
                newUnit.armors[cls] = (newUnit.armors[cls] || 0) + amt;
              }
            }
          }
        }
      });
    });

    // Handle hidden auto-upgrades for Scouts and Eagles in Feudal Age+
    const researchedIds = new Set(bonusesState.map(s => parseInt(s.i)));
    let ageId = 1;
    if (researchedIds.has(103)) ageId = 4; // Imperial
    else if (researchedIds.has(101)) ageId = 3; // Castle
    else if (researchedIds.has(102)) ageId = 2; // Feudal

    if (ageId >= 2) {
      const isScout = newUnit.id === '448' || newUnit.id === 'scout_cavalry';
      const isEagle = newUnit.id === '751' || newUnit.id === 'eagle_scout';

      if (isScout && uBase.matk === 3) {
        newUnit.matk += 2; // 3 -> 5
        if (newUnit.am !== undefined) newUnit.am += 2;
      }
      if (isEagle && uBase.matk === 4) {
        newUnit.matk += 3; // 4 -> 7
        if (newUnit.am !== undefined) newUnit.am += 3;
      }
    }

    return newUnit;
  }

  calculateDamage(attacker: Unit, defender: Unit): number {
    const isMelee = attacker.range <= 1;
    const baseArm = isMelee ? defender.marm : defender.parm;
    const baseAtk = isMelee ? attacker.matk : attacker.patk;
    let totalDmg = Math.max(1, baseAtk - baseArm);

    const attBonuses = attacker.bonuses || {};
    const defArmors = defender.armors || {};
    for (const [cls, amt] of Object.entries(attBonuses)) {
      if (defArmors[cls] !== undefined) {
        const defArm = defArmors[cls] || 0;
        totalDmg += Math.max(0, amt - defArm);
      }
    }

    const reduction = 1 - (defender.bonus_red || 0) / 100;
    const bonusOnly = totalDmg - Math.max(1, baseAtk - baseArm);
    return Math.max(1, Math.max(1, baseAtk - baseArm) + bonusOnly * reduction);
  }

  run(): CombatResult {
    const eA = new Unit(this.dataA);
    const eB = new Unit(this.dataB);
    const costA = eA.getParsedCost().total;
    const costB = eB.getParsedCost().total;
    const initialValA = (this.dataA.count || 0) * costA;
    const initialValB = (this.dataB.count || 0) * costB;

    const record = () => {
      const hpRatioA = eA.getTotalHp() / (eA.initialCount * eA.hpPerUnit) || 0;
      const hpRatioB = eB.getTotalHp() / (eB.initialCount * eB.hpPerUnit) || 0;
      this.history.push({
        time: this.time,
        countA: eA.currentCount,
        countB: eB.currentCount,
        hpA: eA.getTotalHp(),
        hpB: eB.getTotalHp(),
        valRemainingA: hpRatioA * initialValA,
        valRemainingB: hpRatioB * initialValB,
        valLostA: initialValA - hpRatioA * initialValA,
        valLostB: initialValB - hpRatioB * initialValB,
      });
    };

    record();
    while (eA.currentCount > 0 && eB.currentCount > 0 && this.time < 300) {
      let dmgAtoB = 0;
      let dmgBtoA = 0;

      if (eA.attackCooldown <= 0) {
        const attackers = Math.min(eA.currentCount, Math.max(1, eA.initialCount * (eA.eng / 100)));
        dmgAtoB = this.calculateDamage(eA, eB) * attackers;
      }

      if (eB.attackCooldown <= 0) {
        const attackers = Math.min(eB.currentCount, Math.max(1, eB.initialCount * (eB.eng / 100)));
        dmgBtoA = this.calculateDamage(eB, eA) * attackers;
      }

      if (dmgAtoB > 0) this.applyDamage(eB, dmgAtoB, eA.micro);
      if (dmgBtoA > 0) this.applyDamage(eA, dmgBtoA, eB.micro);

      if (eA.attackCooldown <= 0) eA.attackCooldown = eA.reload;
      else eA.attackCooldown -= this.tick;

      if (eB.attackCooldown <= 0) eB.attackCooldown = eB.reload;
      else eB.attackCooldown -= this.tick;

      this.time += this.tick;
      if (Math.round(this.time * 100) % 25 === 0) record();
    }
    record();

    return {
      armyA: { remaining: eA.currentCount, totalHp: eA.getTotalHp(), initialTotalHp: eA.initialCount * eA.hpPerUnit },
      armyB: { remaining: eB.currentCount, totalHp: eB.getTotalHp(), initialTotalHp: eB.initialCount * eB.hpPerUnit },
      history: this.history,
      duration: this.time,
      dataA: this.dataA,
      dataB: this.dataB
    };
  }

  applyDamage(target: Unit, damage: number, micro: number) {
    const totalHp = target.getTotalHp();
    let effectiveDmg = damage;
    if (micro < 5) effectiveDmg *= 0.7 + (micro / 5) * 0.3;
    const i = Math.max(0, totalHp - effectiveDmg);
    target.currentCount = Math.ceil(i / target.hpPerUnit);
    target.currentUnitHp = i % target.hpPerUnit || (target.currentCount > 0 ? target.hpPerUnit : 0);
  }
}

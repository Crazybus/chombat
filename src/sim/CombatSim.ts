import { Unit } from './Unit';
import { UnitData, ArmyState, TechData } from './types';

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

  decodeEncoded(val: number) {
    const iv = Math.floor(val);
    let amt = iv & 0xFF;
    if (amt >= 128) amt -= 256;
    const cls = iv >> 8;
    return { cls, amt };
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

        if ((e.u === -1 || e.u == uBase.id) && (e.c === -1 || e.c == uBase.class)) {
          let attr = e.a;
          let val = e.v;

          if (attr === 8 || attr === 9) {
            const { cls, amt } = this.decodeEncoded(val);
            val = amt;
            if (cls === 3) attr = 6; // Pierce Arm
            else if (cls === 4) attr = 5; // Melee Arm
            else if (attr === 9) { // Bonus Attack
              if (!newUnit.bonuses) newUnit.bonuses = { ...uBase.bonuses };
              newUnit.bonuses[cls] = (newUnit.bonuses[cls] || 0) + amt;
              return;
            } else if (attr === 8) { // Bonus Armor
              if (!newUnit.armors) newUnit.armors = { ...uBase.armors };
              newUnit.armors[cls] = (newUnit.armors[cls] || 0) + amt;
              return;
            }
          }

          if (e.t === 1 || e.t === 4) { // Add
            if (attr === 0) newUnit.hp += val;
            if (attr === 3 || attr === 12) newUnit.range += val;
            if (attr === 4) { 
              if (newUnit.matk > 0) newUnit.matk += val; 
              if (newUnit.patk > 0) newUnit.patk += val; 
            }
            if (attr === 5) newUnit.marm += val;
            if (attr === 6) newUnit.parm += val;
            if (attr === 9) newUnit.reload += val;
          } else if (e.t === 2 || e.t === 5) { // Mult
            if (attr === 0) newUnit.hp *= val;
            if (attr === 3 || attr === 12) newUnit.range *= val;
            if (attr === 4) { 
              if (newUnit.matk > 0) newUnit.matk *= val; 
              if (newUnit.patk > 0) newUnit.patk *= val; 
            }
            if (attr === 5) newUnit.marm *= val;
            if (attr === 6) newUnit.parm *= val;
            if (attr === 9) newUnit.reload *= val;
          }
        }
      });
    });
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
      const hpRatioA = eA.getTotalHp() / (this.dataA.count * eA.hpPerUnit) || 0;
      const hpRatioB = eB.getTotalHp() / (this.dataB.count * eB.hpPerUnit) || 0;
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
      armyA: { remaining: eA.currentCount, totalHp: eA.getTotalHp(), initialTotalHp: this.dataA.count * eA.hpPerUnit },
      armyB: { remaining: eB.currentCount, totalHp: eB.getTotalHp(), initialTotalHp: this.dataB.count * eB.hpPerUnit },
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

import { Unit } from './Unit';
import { UnitData, ArmyState, TechData } from './types';
import { decodeEncoded, shouldApplyEffect } from './TechLogic';
import { EFFECT_ATTRIBUTES, EFFECT_COMMAND_TYPES } from '../data/effect_constants';

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
  dpsA: number;
  dpsB: number;
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
    _allUnits: Record<string, UnitData>,
  ) {
    this.dataA = this.applyBonuses(armyA, configA, parseInt(configA.age || '1'), allTechs, _allUnits);
    this.dataB = this.applyBonuses(armyB, configB, parseInt(configB.age || '1'), allTechs, _allUnits);
  }

  applyBonuses(
    baseUnit: UnitData,
    config: ArmyState,
    ageId: number,
    allTechs: Record<number, TechData>,
    _allUnits: Record<string, UnitData>,
  ): any {
    // 1. Start with a FRESH copy of base unit data
    let newUnit = { ...baseUnit };

    // 2. Ensure we don't modify shared objects
    newUnit.bonuses = { ...(baseUnit.bonuses || {}) };
    newUnit.armors = { ...(baseUnit.armors || {}) };

    // Initialize with standard names
    newUnit.hp = baseUnit.hp;
    newUnit.matk = baseUnit.matk;
    newUnit.patk = baseUnit.patk;
    newUnit.marm = baseUnit.marm;
    newUnit.parm = baseUnit.parm;
    newUnit.reload = baseUnit.reload;
    newUnit.range = baseUnit.range;
    newUnit.speed = baseUnit.speed || 1.0;
    newUnit.reloadBase = baseUnit.reload;
    newUnit.accuracy_percent = baseUnit.accuracy_percent;

    // 3. Apply manual overrides from config
    const overrides: Record<string, keyof ArmyState> = {
      hp: 'h',
      matk: 'am',
      patk: 'ap',
      marm: 'aa',
      parm: 'ar',
      reload: 'rl',
      range: 'n',
      atk_speed: 'as',
      bonus_red: 'ab',
      speed: 'speed',
      f: 'af',
      w: 'aw',
      g: 'ag',
      disc_all: 'da',
      disc_f: 'df',
      disc_w: 'dw',
      disc_g: 'dg',
      eng: 'e',
      micro: 'mc',
    };

    for (const [unitKey, configKey] of Object.entries(overrides)) {
      if ((config as any)[configKey] !== undefined) {
        (newUnit as any)[unitKey] = (config as any)[configKey];
        if (unitKey === 'reload') newUnit.reloadBase = (config as any)[configKey];
      }
    }

    // 4. Apply tech bonuses from scratch
    const bonusesState = config.bn || [];
    let reloadMult = 1.0;

    bonusesState.forEach((state) => {
      const b = allTechs[parseInt(state.i)];
      if (!b) return;

      const effs = b.effects || [];
      effs.forEach((e, idx) => {
        const isActive = state.e && state.e[idx] !== undefined ? state.e[idx] : true;
        if (!isActive) return;

        if (shouldApplyEffect(e, baseUnit, effs)) {
          const val = e.v;
          if (e.t === EFFECT_COMMAND_TYPES.attribute_modifier_set) {
            // Command type 0
            if (e.a == EFFECT_ATTRIBUTES.hp) {
              newUnit.hp = val;
            }
            if (e.a == EFFECT_ATTRIBUTES.accuracy) {
              newUnit.accuracy_percent = val;
            }
            if (e.a == EFFECT_ATTRIBUTES.min_range) {
              newUnit.hp = val;
            }
          } else if (e.t == EFFECT_COMMAND_TYPES.attribute_modifier_add) {
            // Command type 4
            if (e.a == EFFECT_ATTRIBUTES.hp) {
              newUnit.hp += val;
            } else if (e.a == EFFECT_ATTRIBUTES.speed) {
              if (newUnit.speed !== undefined) newUnit.speed += val;
            } else if (e.a == EFFECT_ATTRIBUTES.armor) {
              const { cls, amt } = decodeEncoded(val);
              // Class Armor
              if (cls === 3) {
                newUnit.parm += amt;
              } else if (cls === 4) {
                newUnit.marm += amt;
              } else {
                newUnit.armors![cls] = (newUnit.armors![cls] || 0) + amt;
              }
            } else if (e.a == EFFECT_ATTRIBUTES.attack) {
              const { cls, amt } = decodeEncoded(val);
              // Class Attack
              if (cls === 3) {
                if (newUnit.patk > 0) newUnit.patk += amt;
              } else if (cls === 4) {
                if (newUnit.matk > 0) newUnit.matk += amt;
              } else {
                newUnit.bonuses![cls] = (newUnit.bonuses![cls] || 0) + amt;
              }
            } else if (e.a == EFFECT_ATTRIBUTES.accuracy) {
              if (newUnit.accuracy_percent !== undefined) newUnit.accuracy_percent += val;
            } else if (e.a == EFFECT_ATTRIBUTES.max_range) {
              if (newUnit.range !== undefined) newUnit.range += val;
            }
          } else if (e.t == EFFECT_COMMAND_TYPES.attribute_modifier_multiply) {
            // Command type 5
            // Add Attack (Generic)
            if (e.a == EFFECT_ATTRIBUTES.hp) {
              // eg. Effect 285 - C-Bonus, Cavalry +20% HP
              newUnit.hp *= val;
            } else if (e.a == EFFECT_ATTRIBUTES.speed) {
              // eg. Effect 204 - Squires
              if (newUnit.speed !== undefined) newUnit.speed *= val;
            } else if (e.a == EFFECT_ATTRIBUTES.attack) {
              const { cls, amt } = decodeEncoded(val);
              // Class Attack
              if (cls === 3) {
                if (newUnit.patk > 0) newUnit.patk *= amt;
              } else if (cls === 4) {
                if (newUnit.matk > 0) newUnit.matk *= amt;
              } else {
                newUnit.bonuses![cls] = (newUnit.bonuses![cls] || 0) + amt;
              }
            } else if (e.a == EFFECT_ATTRIBUTES.reload) {
              // eg. Effect 612 - Archers fire 15% faster
              reloadMult *= val;
            }
          }
        }
      });
    });

    // Apply the accumulated reload multiplier
    newUnit.reload *= reloadMult;
    newUnit.reloadBase = (newUnit.reloadBase || baseUnit.reload) * reloadMult;

    // 5. Handle hidden auto-upgrades for Scouts and Eagles in Feudal Age+
    if (ageId >= 2) {
      const isScout = newUnit.id === '448' || newUnit.id === 'scout_cavalry';
      const isEagle = newUnit.id === '751' || newUnit.id === 'eagle_scout';

      if (isScout && baseUnit.matk === 3) {
        newUnit.matk += 2; // 3 -> 5
      }
      if (isEagle && baseUnit.matk === 4) {
        newUnit.matk += 3; // 4 -> 7
      }
    }

    // Ensure we keep the ID and Count
    newUnit.id = baseUnit.id;
    (newUnit as any).count = config.c;

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

      const attackersA = Math.min(eA.currentCount, Math.max(1, eA.initialCount * (eA.eng / 100)));
      const attackersB = Math.min(eB.currentCount, Math.max(1, eB.initialCount * (eB.eng / 100)));
      const damagePerHitA = this.calculateDamage(eA, eB) * attackersA;
      const damagePerHitB = this.calculateDamage(eB, eA) * attackersB;

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
        dpsA: damagePerHitA,
        dpsB: damagePerHitB,
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
      dataB: this.dataB,
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

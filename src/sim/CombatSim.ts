import { Unit } from './Unit';
import { UnitData, ArmyState, TechData } from './types';
import { decodeEncoded, shouldApplyEffect } from './TechLogic';
import { EFFECT_ATTRIBUTES, EFFECT_COMMAND_TYPES } from '../data/effect_constants';
import { techTargetExceptions } from '../rules/tech_target_exceptions';

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

    // Initialize with standard names (resetting to baseUnit values)
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
    newUnit.food = baseUnit.food || 0;
    newUnit.wood = baseUnit.wood || 0;
    newUnit.gold = baseUnit.gold || 0;

    // 3. Apply manual overrides from config
    if (config.overrides) {
      const simpleOverrides: Record<string, keyof NonNullable<ArmyState['overrides']>> = {
        hp: 'hp',
        matk: 'meleeAttack',
        patk: 'pierceAttack',
        marm: 'meleeArmor',
        parm: 'pierceArmor',
        reload: 'reload',
        range: 'range',
        attackSpeed: 'attackSpeed',
        bonusReduction: 'bonusReduction',
        speed: 'speed',
        engagement: 'engagement',
        micro: 'micro',
      };

      for (const [unitKey, overrideKey] of Object.entries(simpleOverrides)) {
        if ((config.overrides as any)[overrideKey] !== undefined) {
          (newUnit as any)[unitKey] = (config.overrides as any)[overrideKey];
          if (unitKey === 'reload') newUnit.reloadBase = (config.overrides as any)[overrideKey];
        }
      }

      if (config.overrides.cost) {
        if (config.overrides.cost.food !== undefined) newUnit.food = config.overrides.cost.food;
        if (config.overrides.cost.wood !== undefined) newUnit.wood = config.overrides.cost.wood;
        if (config.overrides.cost.gold !== undefined) newUnit.gold = config.overrides.cost.gold;
      }

      if (config.overrides.discount) {
        const e = 1 - (config.overrides.discount.all || 0) / 100;
        if (newUnit.food !== undefined) newUnit.food *= (1 - (config.overrides.discount.food || 0) / 100) * e;
        if (newUnit.wood !== undefined) newUnit.wood *= (1 - (config.overrides.discount.wood || 0) / 100) * e;
        if (newUnit.gold !== undefined) newUnit.gold *= (1 - (config.overrides.discount.gold || 0) / 100) * e;
      }
    }

    // 4. Apply tech bonuses from scratch
    const bonusesState = config.bonuses || [];
    let reloadMult = 1.0;
    const civExceptions = config.civ ? techTargetExceptions[config.civ] : undefined;

    bonusesState.forEach((state) => {
      const b = allTechs[state.id as any] || allTechs[parseInt(state.id)];
      if (!b) return;

      const effs = b.effects || [];
      const appliedAttrs = new Set<string>();

      effs.forEach((e, idx) => {
        const isActive =
          state.effects && state.effects[idx] !== undefined
            ? state.effects[idx]
            : state.effects && state.effects.length > 0
              ? state.effects[0]
              : false;
        if (!isActive) return;

        if (shouldApplyEffect(e, baseUnit, effs, ageId, state.id, b.building, civExceptions)) {
          // Prevent double-application of same attribute/type within one tech
          // (eg. Bloodlines matching both Cavalry and Scout Cav classes)
          const attrKey = `${e.attribute}_${e.type}_${e.value}`;
          if (appliedAttrs.has(attrKey)) return;
          appliedAttrs.add(attrKey);

          const val = e.value;
          if (e.type === EFFECT_COMMAND_TYPES.attribute_modifier_set) {
            // Command type 0
            if (e.attribute == EFFECT_ATTRIBUTES.hp) {
              newUnit.hp = val;
            }
            if (e.attribute == EFFECT_ATTRIBUTES.accuracy) {
              newUnit.accuracy_percent = val;
            }
            if (e.attribute === EFFECT_ATTRIBUTES.food_cost) {
              newUnit.food = val;
            }
            if (e.attribute === EFFECT_ATTRIBUTES.wood_cost) {
              newUnit.wood = val;
            }
            if (e.attribute === EFFECT_ATTRIBUTES.gold_cost) {
              newUnit.gold = val;
            }
            if (e.attribute === EFFECT_ATTRIBUTES.total_cost) {
              newUnit.food = val;
              newUnit.wood = val;
              newUnit.gold = val;
            }
          } else if (e.type == EFFECT_COMMAND_TYPES.attribute_modifier_add) {
            // Command type 4
            if (e.attribute == EFFECT_ATTRIBUTES.hp) {
              newUnit.hp += val;
            } else if (e.attribute == EFFECT_ATTRIBUTES.speed) {
              if (newUnit.speed !== undefined) newUnit.speed += val;
            } else if (e.attribute === EFFECT_ATTRIBUTES.food_cost) {
              if (newUnit.food !== undefined) newUnit.food += val;
            } else if (e.attribute === EFFECT_ATTRIBUTES.wood_cost) {
              if (newUnit.wood !== undefined) newUnit.wood += val;
            } else if (e.attribute === EFFECT_ATTRIBUTES.gold_cost) {
              if (newUnit.gold !== undefined) newUnit.gold += val;
            } else if (e.attribute === EFFECT_ATTRIBUTES.total_cost) {
              if (newUnit.food !== undefined) newUnit.food += val;
              if (newUnit.wood !== undefined) newUnit.wood += val;
              if (newUnit.gold !== undefined) newUnit.gold += val;
            } else if (e.attribute == EFFECT_ATTRIBUTES.armor) {
              const { cls, amt } = decodeEncoded(val);
              // Class Armor
              if (cls === 3) {
                newUnit.parm += amt;
              } else if (cls === 4) {
                newUnit.marm += amt;
              } else {
                newUnit.armors![cls] = (newUnit.armors![cls] || 0) + amt;
              }
            } else if (e.attribute == EFFECT_ATTRIBUTES.attack) {
              const { cls, amt } = decodeEncoded(val);
              // Class Attack
              if (cls === 3) {
                if (newUnit.patk > 0) newUnit.patk += amt;
              } else if (cls === 4) {
                if (newUnit.matk > 0) newUnit.matk += amt;
              } else {
                newUnit.bonuses![cls] = (newUnit.bonuses![cls] || 0) + amt;
              }
            } else if (e.attribute == EFFECT_ATTRIBUTES.accuracy) {
              if (newUnit.accuracy_percent !== undefined) newUnit.accuracy_percent += val;
            } else if (e.attribute == EFFECT_ATTRIBUTES.max_range) {
              if (newUnit.range !== undefined) newUnit.range += val;
            } else if (e.attribute == EFFECT_ATTRIBUTES.poison_damage) {
              // Poison damage: encoded as (duration_seconds << 8) | damage_per_tick
              const damage = val & 0xff;
              const duration = (val >> 8) & 0xff;
              newUnit.poisonDamage = damage;
              newUnit.poisonDuration = duration;
            }
          } else if (e.type == EFFECT_COMMAND_TYPES.attribute_modifier_multiply) {
            // Command type 5
            // Add Attack (Generic)
            if (e.attribute == EFFECT_ATTRIBUTES.hp) {
              // eg. Effect 285 - C-Bonus, Cavalry +20% HP
              newUnit.hp *= val;
            } else if (e.attribute == EFFECT_ATTRIBUTES.speed) {
              // eg. Effect 204 - Squires
              if (newUnit.speed !== undefined) newUnit.speed *= val;
            } else if (e.attribute === EFFECT_ATTRIBUTES.food_cost) {
              if (newUnit.food !== undefined) {
                newUnit.food *= val;
              }
            } else if (e.attribute === EFFECT_ATTRIBUTES.wood_cost) {
              if (newUnit.wood !== undefined) {
                newUnit.wood *= val;
              }
            } else if (e.attribute === EFFECT_ATTRIBUTES.gold_cost) {
              if (newUnit.gold !== undefined) {
                newUnit.gold *= val;
              }
            } else if (e.attribute === EFFECT_ATTRIBUTES.total_cost) {
              if (newUnit.food !== undefined) newUnit.food *= val;
              if (newUnit.wood !== undefined) newUnit.wood *= val;
              if (newUnit.gold !== undefined) newUnit.gold *= val;
            } else if (e.attribute == EFFECT_ATTRIBUTES.attack) {
              const { cls, amt } = decodeEncoded(val);
              // Class Attack
              if (cls === 3) {
                if (newUnit.patk > 0) newUnit.patk *= amt;
              } else if (cls === 4) {
                if (newUnit.matk > 0) newUnit.matk *= amt;
              } else {
                newUnit.bonuses![cls] = (newUnit.bonuses![cls] || 0) + amt;
              }
            } else if (e.attribute == EFFECT_ATTRIBUTES.reload) {
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
    (newUnit as any).count = config.count;

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

    const reduction = 1 - (defender.bonusReduction || 0) / 100;
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

    // DOT (Damage Over Time) tracking
    // Each entry: { damage: number, remaining: number } (remaining seconds)
    const dotsOnB: Array<{ damage: number; remaining: number }> = [];
    const dotsOnA: Array<{ damage: number; remaining: number }> = [];
    let dotAccumulator = 0; // accumulates tick time for 1-second DOT intervals

    const record = () => {
      const hpRatioA = eA.getTotalHp() / (eA.initialCount * eA.hpPerUnit) || 0;
      const hpRatioB = eB.getTotalHp() / (eB.initialCount * eB.hpPerUnit) || 0;

      const attackersA = Math.min(eA.currentCount, Math.max(1, eA.initialCount * (eA.engagement / 100)));
      const attackersB = Math.min(eB.currentCount, Math.max(1, eB.initialCount * (eB.engagement / 100)));
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
        const attackers = Math.min(eA.currentCount, Math.max(1, eA.initialCount * (eA.engagement / 100)));
        dmgAtoB = this.calculateDamage(eA, eB) * attackers;
      }

      if (eB.attackCooldown <= 0) {
        const attackers = Math.min(eB.currentCount, Math.max(1, eB.initialCount * (eB.engagement / 100)));
        dmgBtoA = this.calculateDamage(eB, eA) * attackers;
      }

      if (dmgAtoB > 0) {
        this.applyDamage(eB, dmgAtoB, eA.micro);
        // Apply poison DOT from A's attack onto B
        if (eA.poisonDamage > 0 && eA.poisonDuration > 0) {
          dotsOnB.push({ damage: eA.poisonDamage, remaining: eA.poisonDuration });
        }
      }
      if (dmgBtoA > 0) {
        this.applyDamage(eA, dmgBtoA, eB.micro);
        // Apply poison DOT from B's attack onto A
        if (eB.poisonDamage > 0 && eB.poisonDuration > 0) {
          dotsOnA.push({ damage: eB.poisonDamage, remaining: eB.poisonDuration });
        }
      }

      if (eA.attackCooldown <= 0) eA.attackCooldown = eA.reload;
      else eA.attackCooldown -= this.tick;

      if (eB.attackCooldown <= 0) eB.attackCooldown = eB.reload;
      else eB.attackCooldown -= this.tick;

      this.time += this.tick;

      // Process DOT ticks (every 1 second)
      dotAccumulator += this.tick;
      if (dotAccumulator >= 1.0) {
        dotAccumulator -= 1.0;
        // Tick DOTs on B (from A's poison)
        for (const dot of dotsOnB) {
          if (dot.remaining > 0 && eB.currentCount > 0) {
            this.applyDamage(eB, dot.damage, 5); // DOT uses default micro
            dot.remaining -= 1;
          }
        }
        // Tick DOTs on A (from B's poison)
        for (const dot of dotsOnA) {
          if (dot.remaining > 0 && eA.currentCount > 0) {
            this.applyDamage(eA, dot.damage, 5);
            dot.remaining -= 1;
          }
        }
      }

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

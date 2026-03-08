import { UnitData, ArmyState } from './types';

export const parseStat = (val: any, def: number) => {
  if (val === undefined || val === null || val === '') return def;
  const p = parseFloat(String(val));
  return isNaN(p) ? def : p;
};

export class Unit {
  name: string;
  id: string;
  initialCount: number;
  currentCount: number;
  hpPerUnit: number;
  currentUnitHp: number;
  matk: number;
  patk: number;
  marm: number;
  parm: number;
  reloadBase: number;
  range: number;
  attackSpeed: number;
  bonusReduction: number;
  speed: number;
  reload: number;
  attackCooldown: number;
  food: number;
  wood: number;
  gold: number;
  discountAll: number;
  discountFood: number;
  discountWood: number;
  discountGold: number;
  engagement: number;
  class: number;
  bonuses: Record<string, number>;
  armors: Record<string, number>;
  micro: number;

  constructor(data: UnitData & ArmyState) {
    const d = data as any;

    const parse = parseStat;

    this.name = d.name || 'Unit';
    this.id = d.id;
    this.initialCount = parse(d.count !== undefined ? d.count : d.initialCount, 1);
    this.currentCount = this.initialCount;
    this.hpPerUnit = parse(d.overrides?.hp !== undefined ? d.overrides.hp : d.hp, 1);
    this.currentUnitHp = this.hpPerUnit;

    // Prioritize long-names if available (e.g. from applyBonuses result)
    this.matk = parse(d.matk !== undefined ? d.matk : d.overrides?.meleeAttack, 0);
    this.patk = parse(d.patk !== undefined ? d.patk : d.overrides?.pierceAttack, 0);
    this.marm = parse(d.marm !== undefined ? d.marm : d.overrides?.meleeArmor, 0);
    this.parm = parse(d.parm !== undefined ? d.parm : d.overrides?.pierceArmor, 0);
    this.reloadBase = parse(d.reloadBase !== undefined ? d.reloadBase : d.overrides?.reload, 2);
    this.range = parse(d.range !== undefined ? d.range : d.overrides?.range, 0);
    this.attackSpeed = parse(d.attackSpeed !== undefined ? d.attackSpeed : d.overrides?.attackSpeed, 0);
    this.bonusReduction = parse(d.bonusReduction !== undefined ? d.bonusReduction : d.overrides?.bonusReduction, 0);
    this.speed = parse(d.speed !== undefined ? d.speed : d.overrides?.speed, 1.0);

    // If reload was pre-calculated (e.g. by applyBonuses), use it.
    // Otherwise calculate from base and speed.
    if (d.reload !== undefined) {
      this.reload = parse(d.reload, 2);
    } else if (d.overrides?.reload !== undefined) {
      this.reload = parse(d.overrides.reload, 2);
    } else {
      this.reload = this.reloadBase / (1 + this.attackSpeed / 100);
    }
    this.attackCooldown = 0;

    this.food = parse(d.food !== undefined ? d.food : d.overrides?.cost?.food, 0);
    this.wood = parse(d.wood !== undefined ? d.wood : d.overrides?.cost?.wood, 0);
    this.gold = parse(d.gold !== undefined ? d.gold : d.overrides?.cost?.gold, 0);
    this.discountAll = parse(d.discountAll !== undefined ? d.discountAll : d.overrides?.discount?.all, 0);
    this.discountFood = parse(d.discountFood !== undefined ? d.discountFood : d.overrides?.discount?.food, 0);
    this.discountWood = parse(d.discountWood !== undefined ? d.discountWood : d.overrides?.discount?.wood, 0);
    this.discountGold = parse(d.discountGold !== undefined ? d.discountGold : d.overrides?.discount?.gold, 0);
    this.engagement = parse(d.engagement !== undefined ? d.engagement : d.overrides?.engagement, 100);
    this.class = d.class;
    this.bonuses = d.bonuses || {};
    this.armors = d.armors || {};
    this.micro = parse(d.micro !== undefined ? d.micro : d.overrides?.micro, 5);
  }

  isMelee(): boolean {
    return this.range <= 1;
  }

  getTotalHp(): number {
    return Math.max(0, (this.currentCount - 1) * this.hpPerUnit + this.currentUnitHp);
  }

  getParsedCost() {
    const e = 1 - (this.discountAll || 0) / 100;
    const f = (this.food || 0) * (1 - (this.discountFood || 0) / 100) * e;
    const w = (this.wood || 0) * (1 - (this.discountWood || 0) / 100) * e;
    const g = (this.gold || 0) * (1 - (this.discountGold || 0) / 100) * e;
    return { f, w, g, total: f + w + g };
  }
}

import { UnitData, ArmyState } from './types';

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
  atk_speed: number;
  bonus_red: number;
  reload: number;
  attackCooldown: number;
  f: number;
  w: number;
  g: number;
  disc_all: number;
  disc_f: number;
  disc_w: number;
  disc_g: number;
  eng: number;
  class: number;
  bonuses: Record<string, number>;
  armors: Record<string, number>;
  micro: number;

  constructor(data: UnitData & ArmyState) {
    const d = data as any;
    
    const parse = (val: any, def: number) => {
      if (val === undefined || val === null || val === '') return def;
      const p = parseFloat(String(val));
      return isNaN(p) ? def : p;
    };

    this.name = d.nm || d.name || 'Unit';
    this.id = d.id;
    this.initialCount = parse(d.count !== undefined ? d.count : (d.c !== undefined ? d.c : d.initialCount), 1);
    this.currentCount = this.initialCount;
    this.hpPerUnit = parse(d.hp !== undefined ? d.hp : d.h, 1);
    this.currentUnitHp = this.hpPerUnit;

    // Prioritize long-names if available (e.g. from applyBonuses result)
    this.matk = parse(d.matk !== undefined ? d.matk : d.am, 0);
    this.patk = parse(d.patk !== undefined ? d.patk : d.ap, 0);
    this.marm = parse(d.marm !== undefined ? d.marm : d.aa, 0);
    this.parm = parse(d.parm !== undefined ? d.parm : d.ar, 0);
    this.reloadBase = parse(d.reloadBase !== undefined ? d.reloadBase : d.rl, 2);
    this.range = parse(d.range !== undefined ? d.range : d.n, 0);
    this.atk_speed = parse(d.atk_speed !== undefined ? d.atk_speed : d.as, 0);
    this.bonus_red = parse(d.bonus_red !== undefined ? d.bonus_red : d.ab, 0);

    // If reload was pre-calculated (e.g. by applyBonuses), use it. 
    // Otherwise calculate from base and speed.
    if (d.reload !== undefined) {
      this.reload = parse(d.reload, 2);
    } else {
      this.reload = this.reloadBase / (1 + this.atk_speed / 100);
    }
    this.attackCooldown = 0;

    this.f = parse(d.f !== undefined ? d.f : d.af, 0);
    this.w = parse(d.w !== undefined ? d.w : d.aw, 0);
    this.g = parse(d.g !== undefined ? d.g : d.ag, 0);
    this.disc_all = parse(d.disc_all !== undefined ? d.disc_all : d.da, 0);
    this.disc_f = parse(d.disc_f !== undefined ? d.disc_f : d.df, 0);
    this.disc_w = parse(d.disc_w !== undefined ? d.disc_w : d.dw, 0);
    this.disc_g = parse(d.disc_g !== undefined ? d.disc_g : d.dg, 0);
    this.eng = parse(d.eng !== undefined ? d.eng : d.e, 100);
    this.class = d.class;
    this.bonuses = d.bonuses || {};
    this.armors = d.armors || {};
    this.micro = parse(d.micro !== undefined ? d.micro : (d.mc !== undefined ? d.mc : 5), 5);
  }

  isMelee(): boolean {
    return this.range <= 1;
  }

  getTotalHp(): number {
    return Math.max(0, (this.currentCount - 1) * this.hpPerUnit + this.currentUnitHp);
  }

  getParsedCost() {
    const e = 1 - (this.disc_all || 0) / 100;
    const f = (this.f || 0) * (1 - (this.disc_f || 0) / 100) * e;
    const w = (this.w || 0) * (1 - (this.disc_w || 0) / 100) * e;
    const g = (this.g || 0) * (1 - (this.disc_g || 0) / 100) * e;
    return { f, w, g, total: f + w + g };
  }
}

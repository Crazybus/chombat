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
    this.name = data.nm || data.name || 'Unit';
    this.id = data.id;
    this.initialCount = parseFloat(String(data.c || data.initialCount || 0));
    this.currentCount = this.initialCount;
    this.hpPerUnit = parseFloat(String(data.h || data.hp || 1));
    this.currentUnitHp = this.hpPerUnit;
    
    // We expect these to be applied before Unit construction in CombatSim
    // but we support them as fallbacks
    this.matk = parseFloat(String(data.am || data.matk || 0));
    this.patk = parseFloat(String(data.ap || data.patk || 0));
    this.marm = parseFloat(String(data.aa || data.marm || 0));
    this.parm = parseFloat(String(data.ar || data.parm || 0));
    this.reloadBase = parseFloat(String(data.rl || data.reload || 2));
    this.range = parseFloat(String(data.n || data.range || 0));
    this.atk_speed = parseFloat(String(data.as || 0));
    this.bonus_red = parseFloat(String(data.ab || 0));
    
    this.reload = this.reloadBase / (1 + this.atk_speed / 100);
    this.attackCooldown = 0;
    
    this.f = parseFloat(String(data.af || data.f || 0));
    this.w = parseFloat(String(data.aw || data.w || 0));
    this.g = parseFloat(String(data.ag || data.g || 0));
    this.disc_all = parseFloat(String(data.da || 0));
    this.disc_f = parseFloat(String(data.df || 0));
    this.disc_w = parseFloat(String(data.dw || 0));
    this.disc_g = parseFloat(String(data.dg || 0));
    this.eng = parseFloat(String(data.e || 100));
    this.class = data.class;
    this.bonuses = data.bonuses || {};
    this.armors = data.armors || {};
    this.micro = parseFloat(String(data.mc || 5));
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

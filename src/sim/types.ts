export interface UnitData {
  name: string;
  hp: number;
  matk: number;
  patk: number;
  marm: number;
  parm: number;
  reload: number;
  reloadBase?: number; // base reload before tech multipliers
  range: number;
  frame_delay?: number;
  accuracy_percent?: number;
  f: number;
  w: number;
  g: number;
  trainTime: number;
  building?: number;
  id?: string;
  class: number;
  bonuses?: Record<string, number>;
  armors?: Record<string, number>;
  speed?: number;
  requires?: {
    techs: number[];
    buildings: number[];
  };
}

export interface TechEffect {
  t: number; // type: 0=Set, 1=Add, 2=Mult, 4=ClassAdd, 5=ClassMult
  a: number; // attr: 0=HP, 3=Range, 4=Atk, 5=MeleeArm, 6=PierceArm, 8=ArmorEncoded, 9=AttackEncoded, 12=RangeSimple
  v: number; // value
  u: number; // unit_id (-1 for all)
  c: number; // class (-1 for all)
}

export interface TechData {
  name: string;
  f: number;
  w: number;
  g: number;
  time: number;
  building: number;
  id: number;
  requires: {
    techs: number[];
    buildings: number[];
  };
  effects: TechEffect[];
  age: number;
  civ: number;
}

export interface BuildingData {
  name: string;
  f: number;
  w: number;
  g: number;
  s: number;
  time: number;
  id: string;
  age?: number;
  requires: {
    techs: number[];
    buildings: number[];
  };
}

export interface TimelineStep {
  t: string; // type: villagers, building, production, tech, cost
  n?: string; // name
  d?: number; // delay
  c?: number; // count
  co?: number; // cost (lump sum)
  b?: boolean; // isBlocking
  v?: number; // value (capacity)
  i?: string; // id (tech or building)
  tr?: number; // train speed
  f?: number; // food cost override
  w?: number; // wood cost override
  g?: number; // gold cost override
  bt?: number; // building target (e.g. 109 for TC)
  prod?: boolean; // produces units
  lim?: boolean; // limited production (exact count)
  bi?: number; // block index (which facility to block)
}

export interface ArmyState {
  nm?: string; // name override
  c?: number; // count
  ps?: string; // preset id
  cv?: string; // civ id
  age?: string; // age id
  tl?: TimelineStep[];
  bn?: { i: string; e: boolean[] }[]; // bonus tech states
  sv?: number; // start villagers
  tr?: number; // training time override
  // Individual stat overrides
  h?: number;
  am?: number;
  ap?: number;
  aa?: number;
  ar?: number;
  rl?: number;
  n?: number;
  as?: number;
  ab?: number;
  ad?: number;
  af?: number;
  aw?: number;
  ag?: number;
  da?: number;
  df?: number;
  dw?: number;
  dg?: number;
  e?: number;
  mc?: number;
  speed?: number;
}

export interface CivBonusEffect extends TechEffect {
  age: number;
}

export interface CivBonus {
  name: string;
  effects: CivBonusEffect[];
}

export interface SimulationState {
  a: ArmyState;
  b: ArmyState;
  desc: string;
  name?: string;
  sid?: string; // current scenario id
}

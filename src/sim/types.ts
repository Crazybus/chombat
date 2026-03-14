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
  food: number;
  wood: number;
  gold: number;
  stone?: number;
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
  type: number; // type: 0=Set, 1=Add, 2=Mult, 4=ClassAdd, 5=ClassMult
  attribute: number; // attr: 0=HP, 3=Range, 4=Atk, 5=MeleeArm, 6=PierceArm, 8=ArmorEncoded, 9=AttackEncoded, 12=RangeSimple
  value: number; // value
  unitId: number; // unit_id (-1 for all)
  class: number; // class (-1 for all)
}

export interface TechData {
  name: string;
  food: number;
  wood: number;
  gold: number;
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
  food: number;
  wood: number;
  gold: number;
  stone: number;
  time: number;
  id: string;
  age?: number;
  requires: {
    techs: number[];
    buildings: number[];
  };
}

export interface TimelineStep {
  type: string; // type: villagers, building, production, tech, cost
  name?: string; // name
  delay?: number; // delay
  count?: number; // count
  cost?: number; // cost (lump sum)
  isBlocking?: boolean; // isBlocking
  value?: number; // value (capacity)
  id?: string; // id (tech or building)
  trainSpeed?: number; // train speed
  food?: number; // food cost override
  wood?: number; // wood cost override
  gold?: number; // gold cost override
  buildingTarget?: number; // building target (e.g. 109 for TC)
  producesUnits?: boolean; // produces units
  limitedProduction?: boolean; // limited production (exact count)
  blockIndex?: number; // block index (which facility to block)
}

export interface ArmyState {
  name?: string;
  count?: number;
  preset?: string;
  civ?: string;
  age?: string;
  timeline?: TimelineStep[];
  bonuses?: { id: string; effects: boolean[] }[];
  startVillagers?: number;
  overrides?: {
    trainingTime?: number;
    hp?: number;
    meleeAttack?: number;
    pierceAttack?: number;
    meleeArmor?: number;
    pierceArmor?: number;
    reload?: number;
    range?: number;
    attackSpeed?: number;
    bonusReduction?: number;
    accuracy?: number;
    cost?: {
      food?: number;
      wood?: number;
      gold?: number;
    };
    discount?: {
      all?: number;
      food?: number;
      wood?: number;
      gold?: number;
    };
    engagement?: number;
    micro?: number;
    speed?: number;
  };
}

export interface CivBonusEffect extends TechEffect {
  age: number;
}

export interface CivBonus {
  name: string;
  effects: CivBonusEffect[];
}

export interface TechTargetException {
  unitId: number; // which unit gets the exception (e.g., 83 for Villager)
  building: number; // which building's techs (e.g., 103 for Blacksmith)
  targetClass: number; // which class the tech targets (e.g., 6 for Infantry)
  minAge: number; // minimum age for the exception (e.g., 3 for Castle Age)
}

export interface SimulationState {
  armyA: ArmyState;
  armyB: ArmyState;
  description: string;
  name?: string;
  scenarioId?: string; // current scenario id
}

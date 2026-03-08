export const EFFECT_COMMAND_TYPES: Record<string, number> = {
  attribute_modifier_set: 0,
  attribute_modifier_add: 4,
  attribute_modifier_multiply: 5,
};

export const EFFECT_ATTRIBUTES: Record<string, number> = {
  hp: 0,
  speed: 5,
  armor: 8,
  attack: 9,
  reload: 10,
  accuracy: 11,
  max_range: 12,
  base_armor: 15,
  min_range: 20,
  damage_resistance: 24,
  food_cost: 100,
  wood_cost: 101,
  stone_cost: 102,
  gold_cost: 103,
};

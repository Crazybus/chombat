const bonuses = {
  japanese_infantry_atk_speed: {
    name: 'Japanese Infantry Attack Speed',
    description: 'Infantry attacks 33% faster starting in Feudal Age.',
    effects: [{ age: 2, type: 'atk_speed', value: 0.33, class: 6 }],
  },
  britons_archer_range: {
    name: 'Britons Archer Range',
    description: '+1 range for Foot Archers in Castle Age, +1 in Imperial Age.',
    effects: [
      { age: 3, type: 'range', value: 1, class: 0 },
      { age: 4, type: 'range', value: 1, class: 0 },
    ],
  },
  vikings_infantry_hp: {
    name: 'Vikings Infantry HP',
    description: 'Infantry have +10% HP in Feudal, +15% in Castle, +20% in Imperial Age.',
    effects: [
      { age: 2, type: 'hp', value: 0.1, class: 6 },
      { age: 3, type: 'hp', value: 0.15, class: 6 },
      { age: 4, type: 'hp', value: 0.2, class: 6 },
    ],
  },
};

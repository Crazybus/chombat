export const champi_vs_scouts = {
  name: 'Champi Scout vs FU Scouts',
  desc: 'All in dark age champi scout rush vs a theoretical perfect 18 pop constant scout production into fully upgraded feudal scouts.',
  a: {
    ps: 'champi_scout',
    nm: 'Champi Scout',
    c: 11,
    age: '1',
    tl: [
      { t: 'villagers', n: 'Villagers', v: 1, d: 25, lim: false },
      { t: 'building', n: 'Barracks', d: 50, c: 1, co: 175, prod: true, i: '87' },
      { t: 'production', n: 'Champi Scout Production', v: 0, tr: 30, lim: false },
    ],
    bn: [],
  },
  b: {
    ps: 'scout_cavalry',
    nm: 'Scout Cavalry',
    c: 5,
    age: '2',
    tl: [
      { t: 'villagers', n: 'Villagers', v: 1, d: 25, lim: false },
      { t: 'tech', n: 'Feudal Age', d: 130, c: 1, co: 500, i: '101', bt: 109, b: true, lim: true },
      { t: 'building', n: 'Stable', d: 50, c: 1, co: 175, prod: true, i: '101', b: true },
      { t: 'tech', n: 'Bloodlines', d: 50, c: 1, co: 250, i: '435', bt: 101, b: true, lim: true },
      { t: 'tech', n: 'Forging', d: 50, c: 1, co: 150, i: '67', bt: 103, b: false, lim: false },
      { t: 'tech', n: 'Scale Barding Armor', d: 45, c: 1, co: 150, i: '81', bt: 103, b: false, lim: false },
      { t: 'production', n: 'Scout Production', v: 0, tr: 30, lim: false },
    ],
    bn: [
      { i: '67', e: [true] },
      { i: '81', e: [true] },
      { i: '435', e: [true] },
    ],
  },
};

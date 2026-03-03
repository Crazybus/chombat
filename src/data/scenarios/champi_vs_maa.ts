export const champi_vs_maa = {
  name: 'Champi scout vs MAA',
  desc: 'All in dark age champi scout rush vs 19 pop no loom Man-at-arms',
  a: {
    ps: 'champi_scout',
    nm: 'Champi Scout',
    c: 10,
    age: '1',
    tl: [
      { t: 'villagers', n: 'Villagers', v: 1, d: 25, lim: false },
      { t: 'building', n: 'Barracks', d: 50, c: 1, co: 175, prod: true, i: '87' },
      { t: 'production', n: 'Champi Scout Production', v: 0, tr: 30, lim: false },
    ],
  },
  b: {
    ps: 'man_at_arms',
    nm: 'Man-at-Arms',
    c: 7,
    age: '2',
    tl: [
      { t: 'villagers', n: 'Villagers', v: 1, d: 25, lim: false },
      { t: 'tech', n: 'Feudal Age', d: 130, c: 1, co: 500, i: '101', bt: 109, b: true, lim: true },
      { t: 'building', n: 'Barracks', d: 50, c: 1, co: 175, prod: true, i: '87' },
      { t: 'tech', n: 'Man-At-Arms', d: 40, c: 1, co: 140, i: '222', bt: 12, b: true, lim: true },
      { t: 'production', n: 'MAA Production', v: 0, tr: 21, lim: false },
    ],
  },
};

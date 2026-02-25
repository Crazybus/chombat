const scenarios = {
  militia_vs_scouts: {
    name: 'Militia vs Scouts',
    desc: 'All in dark age militia rush vs fully upgraded bloodline scouts.',
    a: { preset: 'militia', count: 10, delay: 0, tech: 0, pre: 0 },
    b: { preset: 'scout_fu', count: 5, delay: 165, tech: 50, pre: 0, hp: 65 },
  },
  maa_vs_scouts: {
    name: 'MAA vs Scouts',
    desc: '3 Militia trained first, then MAA upgrade (40s), then constant production. Scouts player has to wait for feudal, stable before starting production',
    a: { preset: 'maa_fu_feudal', count: 7, delay: 0, tech: 40, pre: 3 },
    b: { preset: 'scout_fu_feudal', count: 5, delay: 165, tech: 50, pre: 0, hp: 65 },
  },
  archers_vs_skirms: {
    name: 'Archers vs Skirms',
    desc: 'Overcoming an archer mass with a tech switch into skirms',
    a: { preset: 'archer_fu_feudal', count: 10, delay: 0, tech: 0, pre: 0 },
    b: { preset: 'skirm_fu_feudal', count: 5, delay: 35 * 6, tech: 0, pre: 0, bbn: 3 },
  },
  champi_vs_scouts: {
    name: 'Champi Scout vs Scouts',
    desc: 'Dark Age champi rush vs fully upgraded bloodline scouts. Champi production starts at the same time that the scouts player clicks up to feudal.',
    a: { preset: 'champi_scout', count: 10, delay: 0, tech: 0, pre: 0 },
    b: { preset: 'scout_fu_feudal', count: 5, delay: 165, tech: 50, pre: 0, hp: 65 },
  },
  knights_vs_halbs: {
    name: 'Castle Knights vs Imp Halberdiers',
    desc: 'Castle Knights vs Imperial Halberdiers. Bonus damage trade-off.',
    a: { preset: 'knight', count: 10, delay: 0, tech: 0, pre: 0, hp: 120, marm: 4, parm: 4 },
    b: { preset: 'halb', count: 20, delay: 0, tech: 0, pre: 0, bbn: 32 },
  },
  archer_vs_skirm_mass: {
    name: 'Target Fire 60 vs 60 Archer vs Skirm',
    desc: "60 Archers vs 60 Skirmishers. Demonstrates how target fire and overkill avoidance change the outcome. When both use Focus Fire (1), Archers can win by 'one-shotting' units, while switching to Perfect micro (5) would favor Skirmishers by reducing wasted damage.",
    a: { preset: 'archer_fu_feudal', count: 60, delay: 0, tech: 0, pre: 0, amc: 1 },
    b: { preset: 'skirm_fu_feudal', count: 60, delay: 0, tech: 0, pre: 0, bbn: 3, bmc: 1 },
  },
};

const featuredScenarios = ['champi_vs_scouts', 'maa_vs_scouts', 'archers_vs_skirms'];

/*
  Chombat - AoE2 Combat Simulator
  Main script
*/

let charts = {},
  defaults = {},
  activeScenario = null;

const stateMap = {
  'a-count': 'ac',
  'a-hp': 'ah',
  'a-matk': 'am',
  'a-patk': 'ap',
  'a-marm': 'aa',
  'a-parm': 'ar',
  'a-range': 'an',
  'a-atk-speed': 'as',
  'a-bonus-red': 'ab',
  'a-bonus': 'ad',
  'a-food': 'af',
  'a-wood': 'aw',
  'a-gold': 'ag',
  'a-disc-all': 'da',
  'a-disc-f': 'df',
  'a-disc-w': 'dw',
  'a-disc-g': 'dg',
  'a-eng': 'ae',
  'a-groups-slider': 'amc',
  'b-count': 'bc',
  'b-hp': 'bh',
  'b-matk': 'bm',
  'b-patk': 'bp',
  'b-marm': 'ba',
  'b-parm': 'br',
  'b-range': 'bn',
  'b-atk-speed': 'bs',
  'b-bonus-red': 'bb',
  'b-bonus': 'bd',
  'b-food': 'bf',
  'b-wood': 'bw',
  'b-gold': 'bg',
  'b-disc-all': 'ca',
  'b-disc-f': 'cf',
  'b-disc-w': 'cw',
  'b-disc-g': 'cg',
  'b-eng': 'be',
  'b-micro': 'bmc',
  'pa-train': 'pt',
  'pa-build': 'pc',
  'pb-train': 'qt',
  'pb-build': 'qc',
};

// Combined unit/preset data - initialized later to ensure scripts are loaded
let allUnits = {};

class Unit {
  constructor(data) {
    this.name = data.name || 'Unit';
    this.id = data.id;
    this.initialCount = parseFloat(data.count) || 0;
    this.currentCount = this.initialCount;
    this.hpPerUnit = parseFloat(data.hp) || 1;
    this.currentUnitHp = this.hpPerUnit;
    this.matk = parseFloat(data.matk) || 0;
    this.patk = parseFloat(data.patk) || 0;
    this.marm = parseFloat(data.marm) || 0;
    this.parm = parseFloat(data.parm) || 0;
    this.reloadBase = parseFloat(data.reload) || 2;
    this.range = parseFloat(data.range) || 0;
    this.atk_speed = parseFloat(data.atk_speed) || 0;
    this.reload = this.reloadBase / (1 + this.atk_speed / 100);
    this.attackCooldown = 0;
    this.f = parseFloat(data.f) || 0;
    this.w = parseFloat(data.w) || 0;
    this.g = parseFloat(data.g) || 0;
    this.disc_all = parseFloat(data.disc_all) || 0;
    this.disc_f = parseFloat(data.disc_f) || 0;
    this.disc_w = parseFloat(data.disc_w) || 0;
    this.disc_g = parseFloat(data.disc_g) || 0;
    this.eng = parseFloat(data.eng) || 100;
    this.class = data.class;
    this.micro = parseFloat(data.micro) || 5;
  }
  isMelee() {
    return this.range <= 1;
  }
  getTotalHp() {
    return Math.max(0, (this.currentCount - 1) * this.hpPerUnit + this.currentUnitHp);
  }
  getParsedCost() {
    const e = 1 - this.disc_all / 100;
    const f = (this.f || 0) * (1 - this.disc_f / 100) * e;
    const w = (this.w || 0) * (1 - this.disc_w / 100) * e;
    const g = (this.g || 0) * (1 - this.disc_g / 100) * e;
    return { f, w, g, total: f + w + g };
  }
}

class CombatSim {
  constructor(armyA, armyB, configA, configB) {
    const idA = armyA.id,
      idB = armyB.id;
    armyA = this.applyBonuses(armyA, configA.bonuses, 'a');
    armyB = this.applyBonuses(armyB, configB.bonuses, 'b');

    this.dataA = { ...armyA, ...configA, id: idA };
    this.dataB = { ...armyB, ...configB, id: idB };
    this.time = 0;
    this.tick = 0.05;
    this.history = [];
  }
  applyBonuses(army, bonusIds, armyLetter) {
    if (!bonusIds) return army;
    let newArmy = { ...army };
    bonusIds.forEach((id) => {
      const b = bonuses[id];
      if (!b) return;
      const active = document.querySelectorAll(
        `#${armyLetter}-applied-bonuses .applied-bonus[data-id="${id}"] input:checked`,
      );
      active.forEach((cb) => {
        const e = b.effects[parseInt(cb.dataset.effectIndex)];
        const uData = allUnits[army.id];
        if (uData && (uData.class === e.class || e.class === 'all')) {
          if (e.type === 'hp') newArmy.hp *= 1 + e.value;
          if (e.type === 'range') newArmy.range += e.value;
          if (e.type === 'atk_speed') newArmy.reload /= 1 + e.value;
        }
      });
    });
    return newArmy;
  }
  calculateDamage(attacker, defender) {
    const isMelee = attacker.range <= 1;
    const arm = isMelee ? defender.marm : defender.parm;
    const atk = isMelee ? attacker.matk : attacker.patk;
    return Math.max(1, atk - arm);
  }
  run() {
    const eA = new Unit(this.dataA),
      eB = new Unit(this.dataB);
    const costA = eA.getParsedCost().total,
      costB = eB.getParsedCost().total;
    const initialValA = (this.dataA.count || 0) * costA,
      initialValB = (this.dataB.count || 0) * costB;
    const record = () => {
      const hpRatioA = eA.getTotalHp() / (this.dataA.count * eA.hpPerUnit) || 0;
      const hpRatioB = eB.getTotalHp() / (this.dataB.count * eB.hpPerUnit) || 0;
      this.history.push({
        time: this.time,
        countA: eA.currentCount,
        countB: eB.currentCount,
        hpA: eA.getTotalHp(),
        hpB: eB.getTotalHp(),
        valRemainingA: hpRatioA * initialValA,
        valRemainingB: hpRatioB * initialValB,
        valLostA: initialValA - hpRatioA * initialValA,
        valLostB: initialValB - hpRatioB * initialValB,
      });
    };
    record();
    while (eA.currentCount > 0 && eB.currentCount > 0 && this.time < 300) {
      const pA = Math.ceil(eA.currentCount),
        pB = Math.ceil(eB.currentCount);
      if (eA.attackCooldown <= 0) {
        const attackers = Math.min(eA.currentCount, Math.max(1, eA.initialCount * (eA.eng / 100)));
        this.applyDamage(eB, this.calculateDamage(eA, eB) * attackers, this.dataA.micro || 5);
        eA.attackCooldown = eA.reload;
      } else eA.attackCooldown -= this.tick;
      if (eB.attackCooldown <= 0) {
        const attackers = Math.min(eB.currentCount, Math.max(1, eB.initialCount * (eB.eng / 100)));
        this.applyDamage(eA, this.calculateDamage(eB, eA) * attackers, this.dataB.micro || 5);
        eB.attackCooldown = eB.reload;
      } else eB.attackCooldown -= this.tick;
      this.time += this.tick;
      if (
        Math.ceil(eA.currentCount) !== pA ||
        Math.ceil(eB.currentCount) !== pB ||
        Math.round(this.time * 100) % 25 === 0
      )
        record();
    }
    record();
    return {
      armyA: { remaining: eA.currentCount, totalHp: eA.getTotalHp(), initialTotalHp: this.dataA.count * eA.hpPerUnit },
      armyB: { remaining: eB.currentCount, totalHp: eB.getTotalHp(), initialTotalHp: this.dataB.count * eB.hpPerUnit },
      history: this.history,
      duration: this.time,
    };
  }
  applyDamage(target, damage, micro) {
    const totalHp = target.getTotalHp();
    let effectiveDmg = damage;
    if (micro < 5) effectiveDmg *= 0.7 + (micro / 5) * 0.3;
    const i = Math.max(0, totalHp - effectiveDmg);
    target.currentCount = Math.ceil(i / target.hpPerUnit);
    target.currentUnitHp = i % target.hpPerUnit || (target.currentCount > 0 ? target.hpPerUnit : 0);
  }
}

// --- Main Functions ---

function getThemeColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
function onInputChange(manualChange = true) {
  if (manualChange) activeScenario = null;
  updateCharts();
  syncURL();
}

function getArmyData(army) {
  const el = document.querySelector(`.preset-search[data-army="${army}"]`);
  const id = el ? el.dataset.value : null;
  if (!id || !allUnits[id]) return null;
  return { ...allUnits[id], id: id };
}

function getArmyConfig(army) {
  const config = {};
  document.querySelectorAll(`[id^="${army}-"]`).forEach((el) => {
    const key = el.id.substring(2);
    config[key] = el.type === 'number' || el.type === 'range' ? parseFloat(el.value) : el.value;
  });
  const slider = document.getElementById(`${army}-groups-slider`);
  if (slider) config.micro = parseInt(slider.value);
  config.bonuses = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map(
    (el) => el.dataset.id,
  );
  return config;
}

function updateCharts() {
  const dA = getArmyData('a'),
    dB = getArmyData('b');
  const cA = getArmyConfig('a'),
    cB = getArmyConfig('b');
  if (!dA || !dB) return;
  const res = new CombatSim(dA, dB, cA, cB).run();
  updateResultCard(res, dA.name, dB.name);
  updateStatComparison(dA, dB, cA, cB);
  updateTimeCharts(res.history, dA.name, dB.name);
  updateProductionAnalysis(dA, dB, cA, cB);
  updateScalingAnalysis(dA, dB, cA, cB);
}

function updateResultCard(res, nameA, nameB) {
  const el = document.getElementById('overall-result');
  if (!el) return;
  const winA = res.armyA.totalHp > res.armyB.totalHp;
  const color = winA ? getThemeColor('--army-a-color') : getThemeColor('--army-b-color');
  el.innerHTML = `Winner: <span style="color:${color}">${winA ? nameA : nameB}</span> (${res.duration.toFixed(1)}s)`;
  const summary = document.getElementById('stat-summary');
  if (summary) {
    const ratioA = ((res.armyA.totalHp / res.armyA.initialTotalHp) * 100).toFixed(1);
    const ratioB = ((res.armyB.totalHp / res.armyB.initialTotalHp) * 100).toFixed(1);
    summary.innerHTML = `<p>${nameA} survivors: <strong>${Math.ceil(res.armyA.remaining)}</strong> (${ratioA}%) | ${nameB} survivors: <strong>${Math.ceil(res.armyB.remaining)}</strong> (${ratioB}%)</p>`;
  }
}

function updateStatComparison(dA, dB, cA, cB) {
  const el = document.getElementById('comparison-body');
  if (!el) return;
  const uA = new Unit({ ...dA, ...cA }),
    uB = new Unit({ ...dB, ...cB });
  const sim = new CombatSim({ ...dA, count: 1 }, { ...dB, count: 1 }, { ...cA, count: 1 }, { ...cB, count: 1 });
  const dmgA = sim.calculateDamage(uA, uB),
    dmgB = sim.calculateDamage(uB, uA);
  const rows = [
    { label: 'HP', a: uA.hpPerUnit, b: uB.hpPerUnit },
    {
      label: 'Attack',
      a: `${uA.matk}/${uA.patk}`,
      b: `${uB.matk}/${uB.patk}`,
      rawA: uA.matk + uA.patk,
      rawB: uB.matk + uB.patk,
    },
    {
      label: 'Armor',
      a: `${uA.marm}/${uA.parm}`,
      b: `${uB.marm}/${uB.parm}`,
      rawA: uA.marm + uA.parm,
      rawB: uB.marm + uB.parm,
    },
    { label: 'Dmg/Hit (Eff)', a: dmgA, b: dmgB },
    { label: 'DPS (Eff)', a: (dmgA / uA.reload).toFixed(2), b: (dmgB / uB.reload).toFixed(2) },
    { label: 'Total Cost', a: uA.getParsedCost().total.toFixed(0), b: uB.getParsedCost().total.toFixed(0), inv: true },
  ];
  el.innerHTML = rows
    .map((r) => {
      const vA = r.rawA !== undefined ? r.rawA : parseFloat(r.a),
        vB = r.rawB !== undefined ? r.rawB : parseFloat(r.b);
      const diff = vA - vB,
        dClass = diff === 0 ? 'diff-neutral' : diff > 0 !== r.inv ? 'diff-pos' : 'diff-neg';
      return `<tr><td>${r.label}</td><td>${r.a}</td><td>${r.b}</td><td class="${dClass}">${diff === 0 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(r.label.includes('DPS') ? 2 : 0)}</td></tr>`;
    })
    .join('');
}

function updateTimeCharts(history, nameA, nameB) {
  const labels = history.map((h) => h.time.toFixed(1) + 's');
  const colorA = getThemeColor('--army-a-color'),
    colorB = getThemeColor('--army-b-color'),
    accent = getThemeColor('--accent-color');
  const cData = [
    {
      id: 'countChart',
      datasets: [
        { label: nameA, data: history.map((h) => h.countA), borderColor: colorA },
        { label: nameB, data: history.map((h) => h.countB), borderColor: colorB },
      ],
    },
    {
      id: 'hpChart',
      datasets: [
        { label: nameA, data: history.map((h) => h.hpA), borderColor: colorA },
        { label: nameB, data: history.map((h) => h.hpB), borderColor: colorB },
      ],
    },
    {
      id: 'valueChart',
      datasets: [
        { label: nameA, data: history.map((h) => h.valRemainingA), borderColor: colorA },
        { label: nameB, data: history.map((h) => h.valRemainingB), borderColor: colorB },
      ],
    },
    {
      id: 'efficiencyChart',
      datasets: [
        {
          label: 'Cost Efficiency Ratio',
          data: history.map((h) => (h.valLostA === 0 ? 1 : h.valLostB / h.valLostA)),
          borderColor: accent,
        },
      ],
    },
  ];
  cData.forEach((c) => {
    const ctx = document.getElementById(c.id)?.getContext('2d');
    if (!ctx) return;
    if (charts[c.id]) charts[c.id].destroy();
    charts[c.id] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: c.datasets.map((d) => ({ ...d, tension: 0, pointRadius: 0, fill: false })) },
      options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' } },
    });
  });
}

function calculateCount(t, train, initialBuild, timelineSteps) {
  let unitsCount = 0,
    currentBuild = initialBuild,
    productionDebt = 0,
    techQueue = [];
  const steps = JSON.parse(JSON.stringify(timelineSteps));
  for (let s = 0; s <= t; s++) {
    techQueue.forEach((tech) => {
      tech.remainingTime--;
      if (tech.remainingTime <= 0) currentBuild++;
    });
    techQueue = techQueue.filter((tech) => tech.remainingTime > 0);
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      let met = false;
      const triggerVal = parseFloat(step.triggerVal) || 0;
      if (step.triggerType === 'time') {
        if (s >= triggerVal) met = true;
      } else if (step.triggerType === 'units') {
        if (unitsCount >= triggerVal) met = true;
      }
      if (met) {
        if (step.type === 'building') currentBuild += parseFloat(step.value) || 0;
        else if (step.type === 'tech') {
          const tech = techs[step.techId];
          if (tech && currentBuild > 0) {
            techQueue.push({ id: step.techId, remainingTime: tech.time });
            currentBuild--;
          }
        }
        steps.splice(i, 1);
      }
    }
    if (currentBuild > 0 && train > 0) {
      productionDebt += currentBuild / train;
      if (productionDebt >= 1) {
        const n = Math.floor(productionDebt);
        unitsCount += n;
        productionDebt -= n;
      }
    }
  }
  return unitsCount;
}

function updateProductionAnalysis(dA, dB, cA, cB) {
  const searchMax = 1800,
    step = 10;
  const getTimeline = (army) =>
    Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el) => ({
      type: el.dataset.type,
      triggerType: el.querySelector('.step-trigger-type')?.value || 'time',
      triggerVal: el.querySelector('.step-trigger-val')?.value || 0,
      value: el.querySelector('.step-value')?.value || 0,
      techId: el.querySelector('.step-tech-select')?.value,
    }));
  const timelineA = getTimeline('a'),
    timelineB = getTimeline('b');
  const bA = parseInt(document.getElementById('pa-build').value) || 1,
    bB = parseInt(document.getElementById('pb-build').value) || 1;
  const tA = parseFloat(document.getElementById('pa-train').value) || 30,
    tB = parseFloat(document.getElementById('pb-train').value) || 30;
  const data = { labels: [], countA: [], countB: [], advantage: [] };
  for (let t = 0; t <= searchMax; t += step) {
    const cA_t = calculateCount(t, tA, bA, timelineA),
      cB_t = calculateCount(t, tB, bB, timelineB);
    data.labels.push(t + 's');
    data.countA.push(cA_t);
    data.countB.push(cB_t);
    let adv = 0;
    if (cA_t > 0 && cB_t > 0) {
      const sim = new CombatSim({ ...dA, count: cA_t }, { ...dB, count: cB_t }, cA, cB).run();
      adv =
        sim.armyA.totalHp > sim.armyB.totalHp
          ? (sim.armyA.totalHp / sim.armyA.initialTotalHp) * 100
          : -((sim.armyB.totalHp / sim.armyB.initialTotalHp) * 100);
    } else if (cA_t > 0) adv = 100;
    else if (cB_t > 0) adv = -100;
    data.advantage.push(adv);
  }
  renderProductionCharts(data, dA.name, dB.name);
}

function renderProductionCharts(data, nA, nB) {
  const ctxGrowth = document.getElementById('prodGrowthChart')?.getContext('2d'),
    ctxAdv = document.getElementById('prodAdvantageChart')?.getContext('2d');
  const colorA = getThemeColor('--army-a-color'),
    colorB = getThemeColor('--army-b-color'),
    accent = getThemeColor('--accent-color');
  if (ctxGrowth) {
    if (charts['prodGrowth']) charts['prodGrowth'].destroy();
    charts['prodGrowth'] = new Chart(ctxGrowth, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          { label: nA, data: data.countA, borderColor: colorA },
          { label: nB, data: data.countB, borderColor: colorB },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, datasets: { line: { tension: 0, pointRadius: 0 } } },
    });
  }
  if (ctxAdv) {
    if (charts['prodAdv']) charts['prodAdv'].destroy();
    charts['prodAdv'] = new Chart(ctxAdv, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Advantage (+A / -B)',
            data: data.advantage,
            borderColor: accent,
            fill: { target: 'origin', above: 'rgba(52, 152, 219, 0.2)', below: 'rgba(231, 76, 60, 0.2)' },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: -100, max: 100 } },
        datasets: { line: { tension: 0.2, pointRadius: 0 } },
      },
    });
  }
}

function updateScalingAnalysis(dA, dB, cA, cB) {
  const scales = [1, 2, 3, 5, 8, 10, 15, 20, 30, 40, 50];
  const r = (mode) => {
    const results = { labels: scales, hpA: [], hpB: [], winPoint: -1 };
    scales.forEach((s) => {
      const curA = { ...dA, count: mode === '1vX' ? 1 : s },
        curB = { ...dB, count: mode === 'Xv1' ? 1 : s };
      const sim = new CombatSim(curA, curB, cA, cB).run();
      results.hpA.push((sim.armyA.totalHp / sim.armyA.initialTotalHp) * 100);
      results.hpB.push((sim.armyB.totalHp / sim.armyB.initialTotalHp) * 100);
      if (
        results.winPoint === -1 &&
        ((mode === '1vX' && sim.armyB.totalHp > 0) || (mode === 'Xv1' && sim.armyA.totalHp > 0))
      )
        results.winPoint = s;
    });
    return results;
  };
  const m1vX = r('1vX'),
    mXv1 = r('Xv1');
  renderScalingChart('scale1vXChart', m1vX, dA.name, dB.name);
  renderScalingChart('scaleXv1Chart', mXv1, dB.name, dA.name);
}

function renderScalingChart(id, data, nA, nB) {
  const ctx = document.getElementById(id)?.getContext('2d');
  if (!ctx) return;
  const colorA = getThemeColor('--army-a-color'),
    colorB = getThemeColor('--army-b-color');
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        { label: nA + ' % HP', data: data.hpA, borderColor: colorA },
        { label: nB + ' % HP', data: data.hpB, borderColor: colorB },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } },
  });
}

function addProductionStep(army, type, data = {}) {
  const timeline = document.getElementById(`p${army}-timeline`);
  if (!timeline) return;
  const step = document.createElement('div');
  step.className = 'timeline-step';
  step.dataset.type = type;
  const triggerType = data.triggerType || 'time',
    triggerVal = data.triggerVal || 0;
  const triggerHtml = `<select class="step-trigger-type"><option value="time" ${triggerType === 'time' ? 'selected' : ''}>At Time</option><option value="units" ${triggerType === 'units' ? 'selected' : ''}>After Units</option></select><input type="number" class="step-trigger-val" value="${triggerVal}" style="width:60px;">`;
  let controls = '';
  if (type === 'building')
    controls = `${triggerHtml}<div class="field"><label>Add</label><input type="number" class="step-value" value="${data.value || 1}" style="width:40px;"></div>`;
  else if (type === 'tech') {
    const options = Object.entries(techs)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([id, t]) => `<option value="${id}" ${data.techId === id ? 'selected' : ''}>${t.name}</option>`)
      .join('');
    controls = `${triggerHtml}<div class="field" style="min-width: 120px;"><label>Tech</label><select class="step-tech-select">${options}</select></div>`;
  } else if (type === 'train')
    controls = `<div class="field"><label>Units</label><input type="number" class="step-value" value="${data.value || 10}" style="width:50px;"></div>`;
  step.innerHTML = `<span class="timeline-step-label" style="width:60px;">${type}</span><div class="timeline-step-controls" style="display:flex; gap:5px; align-items:center;">${controls}</div><button class="remove-step-btn">&times;</button>`;
  step.querySelector('.remove-step-btn').addEventListener('click', () => {
    step.remove();
    onInputChange(true);
  });
  step.querySelectorAll('input, select').forEach((el) => el.addEventListener('change', () => onInputChange(true)));
  timeline.appendChild(step);
}

function renderBonusList(list, items, army) {
  list.innerHTML = '';
  if (items.length > 0) list.classList.remove('hidden');
  else list.classList.add('hidden');
  items.forEach(([id, b]) => {
    const item = document.createElement('div');
    item.className = 'bonus-item';
    item.textContent = b.name;
    item.addEventListener('click', () => {
      addBonus(army, id);
      list.classList.add('hidden');
      document.querySelector(`.bonus-search[data-army="${army}"]`).value = '';
    });
    list.appendChild(item);
  });
}

function addBonus(army, id, effectsState = null) {
  const b = bonuses[id];
  if (!b) return;
  const container = document.getElementById(`${army}-applied-bonuses`);
  if (container.querySelector(`.applied-bonus[data-id="${id}"]`)) return;
  const div = document.createElement('div');
  div.className = 'applied-bonus';
  div.dataset.id = id;
  let html = '';
  b.effects.forEach((e, i) => {
    const checked = effectsState ? effectsState[i] : true;
    html += `<div class="applied-bonus-effect"><input type="checkbox" data-effect-index="${i}" ${checked ? 'checked' : ''}><label>${e.type} +${e.value * 100}%</label></div>`;
  });
  div.innerHTML = `<div style="display:flex; flex-direction:column; gap:2px;"><span class="applied-bonus-name">${b.name}</span><div style="display:flex; gap:10px;">${html}</div></div><button class="remove-bonus-btn">&times;</button>`;
  div.querySelector('.remove-bonus-btn').addEventListener('click', () => {
    div.remove();
    onInputChange(true);
  });
  div.querySelectorAll('input').forEach((el) => el.addEventListener('change', () => onInputChange(true)));
  container.appendChild(div);
  onInputChange(true);
}

function applyAgeUpgrades(army) {
  const data = getArmyData(army);
  if (!data) return;
  const group = document.querySelector(`.age-upgrades[data-army="${army}"]`);
  const active = group.querySelectorAll('.age-upgrade-btn.active');
  let tAtk = 0,
    tArm = 0;
  const isI = data.class === 6,
    isA = data.class === 0,
    isC = data.class === 4 || data.class === 2;
  active.forEach((btn) => {
    const age = parseInt(btn.dataset.age),
      type = btn.closest('.age-upgrades').dataset.type;
    if (type === 'atk') {
      if (age === 2) tAtk += 1;
      if (age === 3) tAtk += 1;
      if (age === 4) tAtk += isI || isC ? 2 : 1;
    } else {
      if (age === 2 || age === 3 || age === 4) tArm += 1;
    }
  });
  if (data.matk > 0) document.getElementById(`${army}-matk`).value = data.matk + tAtk;
  if (data.patk > 0) document.getElementById(`${army}-patk`).value = data.patk + tAtk;
  document.getElementById(`${army}-marm`).value = data.marm + tArm;
  document.getElementById(`${army}-parm`).value = data.parm + tArm;
  onInputChange(true);
}

function loadPreset(army, id) {
  const u = allUnits[id];
  if (!u) return;
  const input = document.querySelector(`.preset-search[data-army="${army}"]`);
  input.value = u.name;
  input.dataset.value = id;
  const nameEl = document.getElementById(`${army}-name`);
  if (nameEl) nameEl.value = u.name;
  ['hp', 'matk', 'patk', 'marm', 'parm', 'range', 'food', 'wood', 'gold'].forEach((k) => {
    const el = document.getElementById(`${army}-${k}`);
    if (el) el.value = u[k === 'food' ? 'f' : k === 'wood' ? 'w' : k === 'gold' ? 'g' : k];
  });
  onInputChange(false);
}

function loadScenario(id) {
  const s = scenarios[id];
  if (!s) return;
  activeScenario = id;
  document.getElementById('scenario-desc').value = s.desc || '';
  ['a', 'b'].forEach((army) => {
    const config = s[army];
    document.getElementById(`p${army}-timeline`).innerHTML = '';
    document.getElementById(`${army}-applied-bonuses`).innerHTML = '';
    if (config.preset) loadPreset(army, config.preset);
    for (const [key, val] of Object.entries(config)) {
      const el = document.getElementById(`${army}-${key}`);
      if (el) el.value = val;
      // Handle production delay conversion
      if (key === 'delay' && val > 0)
        addProductionStep(army, 'building', { triggerType: 'time', triggerVal: val, value: 0 });
      if (key === 'tech' && val > 0)
        addProductionStep(army, 'tech', {
          triggerType: 'units',
          triggerVal: config.pre || 0,
          techId: 'fake_delay',
          value: val,
        });
    }
  });
  onInputChange(false);
}

function renderScenarioBar() {
  const container = document.getElementById('featured-scenarios-container');
  if (container) {
    container.innerHTML = '';
    featuredScenarios.forEach((id) => {
      const s = scenarios[id];
      if (!s) return;
      const btn = document.createElement('button');
      btn.className = 'scenario-btn';
      btn.textContent = s.name;
      btn.addEventListener('click', () => loadScenario(id));
      container.appendChild(btn);
    });
  }
  const searchInput = document.querySelector('.scenario-search');
  const list = document.querySelector('.scenario-list');
  if (searchInput && list) {
    const render = () => {
      const term = searchInput.value.toLowerCase();
      list.innerHTML = '';
      Object.entries(scenarios).forEach(([id, s]) => {
        if (s.name.toLowerCase().includes(term)) {
          const item = document.createElement('div');
          item.className = 'scenario-item';
          item.textContent = s.name;
          item.addEventListener('click', () => {
            loadScenario(id);
            list.classList.add('hidden');
          });
          list.appendChild(item);
        }
      });
      if (list.children.length > 0) list.classList.remove('hidden');
      else list.classList.add('hidden');
    };
    searchInput.addEventListener('click', render);
    searchInput.addEventListener('keyup', render);
    searchInput.addEventListener('blur', () => setTimeout(() => list.classList.add('hidden'), 200));
  }
}

function getState() {
  const s = {};
  for (const [id, key] of Object.entries(stateMap)) {
    const el = document.getElementById(id);
    if (el && el.value !== defaults[id]) s[key] = el.value;
  }
  ['a', 'b'].forEach((army) => {
    const timeline = Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el) => ({
      type: el.dataset.type,
      triggerType: el.querySelector('.step-trigger-type')?.value,
      triggerVal: el.querySelector('.step-trigger-val')?.value,
      value: el.querySelector('.step-value')?.value,
      techId: el.querySelector('.step-tech-select')?.value,
    }));
    if (timeline.length > 0) s[`p${army}_timeline`] = timeline;
    const bData = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map((el) => ({
      id: el.dataset.id,
      effects: Array.from(el.querySelectorAll('input')).map((cb) => cb.checked),
    }));
    if (bData.length > 0) s[`${army}_bonuses`] = bData;
  });
  return s;
}

function loadState() {
  const p = new URLSearchParams(window.location.search);

  if (p.has('scenario')) {
    loadScenario(p.get('scenario'));
  }

  p.forEach((v, k) => {
    const id = Object.keys(stateMap).find((x) => stateMap[x] === k);
    const el = document.getElementById(id);
    if (el) el.value = v;
  });

  ['a', 'b'].forEach((army) => {
    if (p.has(`p${army}_timeline`))
      try {
        const timeline = JSON.parse(p.get(`p${army}_timeline`));
        document.getElementById(`p${army}-timeline`).innerHTML = '';
        timeline.forEach((s) => addProductionStep(army, s.type, s));
      } catch (e) {}
    if (p.has(`${army}_bonuses`))
      try {
        const bData = JSON.parse(p.get(`${army}_bonuses`));
        document.getElementById(`${army}-applied-bonuses`).innerHTML = '';
        bData.forEach((b) => addBonus(army, b.id, b.effects));
      } catch (e) {}
  });
  updateCharts();
}

function syncURL() {
  const s = getState(),
    p = new URLSearchParams();
  ['a', 'b'].forEach((army) => {
    const id = document.querySelector(`.preset-search[data-army="${army}"]`)?.dataset.value;
    if (id) p.set(`ps${army}`, id);
  });
  if (activeScenario) p.set('scenario', activeScenario);
  Object.entries(s).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      if (v.length > 0) p.set(k, JSON.stringify(v));
    } else p.set(k, v);
  });
  history.replaceState(null, '', '?' + p.toString());
}

window.onload = () => {
  allUnits = { ...units, ...presets };
  document.querySelectorAll('input, select, textarea').forEach((t) => {
    if (t.id) defaults[t.id] = t.value;
  });
  renderScenarioBar();
  document.querySelectorAll('input, select').forEach((el) => {
    el.addEventListener('change', () => onInputChange(true));
    el.addEventListener('keyup', () => onInputChange(true));
  });
  document.querySelectorAll('.step-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.id);
      if (el) {
        el.value = Math.max(0, (parseFloat(el.value) || 0) + parseFloat(btn.dataset.val)).toFixed(
          btn.dataset.id.includes('reload') ? 1 : 0,
        );
        onInputChange(true);
      }
    }),
  );
  document.querySelectorAll('.preset-search').forEach((input) => {
    const render = () => {
      const army = input.dataset.army,
        list = document.getElementById(`${army}-preset-list`),
        term = input.value.toLowerCase();
      list.innerHTML = '';
      Object.entries(allUnits).forEach(([id, u]) => {
        if (u.name.toLowerCase().includes(term)) {
          const item = document.createElement('div');
          item.className = 'preset-item';
          item.textContent = u.name;
          item.addEventListener('click', () => {
            loadPreset(army, id);
            list.classList.add('hidden');
          });
          list.appendChild(item);
        }
      });
      if (list.children.length > 0) list.classList.remove('hidden');
      else list.classList.add('hidden');
    };
    input.addEventListener('click', render);
    input.addEventListener('keyup', render);
    input.addEventListener('blur', () =>
      setTimeout(() => document.getElementById(`${input.dataset.army}-preset-list`).classList.add('hidden'), 200),
    );
  });
  document.querySelectorAll('.toggle-stats-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const t = document.getElementById(btn.dataset.target);
      if (t) {
        t.classList.toggle('collapsed');
        btn.textContent = t.classList.contains('collapsed') ? 'Edit' : 'Hide Stats';
      }
    }),
  );
  document.querySelectorAll('.bonus-search').forEach((input) => {
    input.addEventListener('keyup', () => {
      const army = input.dataset.army,
        list = document.querySelector(`.bonus-list[data-army="${army}"]`),
        term = input.value.toLowerCase();
      renderBonusList(
        list,
        Object.entries(bonuses).filter(([, b]) => b.name.toLowerCase().includes(term)),
        army,
      );
    });
    input.addEventListener('blur', () =>
      setTimeout(
        () => document.querySelector(`.bonus-list[data-army="${input.dataset.army}"]`)?.classList.add('hidden'),
        200,
      ),
    );
  });
  document.querySelectorAll('.age-upgrade-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      applyAgeUpgrades(btn.dataset.army);
    }),
  );
  document
    .querySelectorAll('.add-step-btn')
    .forEach((btn) =>
      btn.addEventListener('click', () =>
        addProductionStep(
          btn.dataset.army,
          document.querySelector(`.step-type-select[data-army="${btn.dataset.army}"]`).value,
        ),
      ),
    );
  document.querySelectorAll('.count-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const el = document.getElementById(`${btn.dataset.army}-count`);
      if (el) {
        el.value = Math.max(1, (parseInt(el.value) || 1) + parseInt(btn.dataset.delta));
        onInputChange(true);
      }
    }),
  );
  const p = new URLSearchParams(window.location.search);
  if (p.has('psa')) loadPreset('a', p.get('psa'));
  if (p.has('psb')) loadPreset('b', p.get('psb'));
  if (p.has('scenario')) {
    loadScenario(p.get('scenario'));
  } else {
    loadState();
  }
};

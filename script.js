/*
  Chombat - AoE2 Combat Simulator
  Main script
*/

let charts = {},
  defaults = {},
  activeScenario = null;

const fieldMap = {
  name: 'nm',
  count: 'c',
  hp: 'h',
  reload: 'rl',
  matk: 'am',
  patk: 'ap',
  marm: 'aa',
  parm: 'ar',
  range: 'n',
  'atk-speed': 'as',
  'bonus-red': 'ab',
  bonus: 'ad',
  food: 'af',
  wood: 'aw',
  gold: 'ag',
  'disc-all': 'da',
  'disc-f': 'df',
  'disc-w': 'dw',
  'disc-g': 'dg',
  eng: 'e',
  'groups-slider': 'mc',
};

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
    this.bonus = parseFloat(data.bonus) || 0;
    this.bonus_red = parseFloat(data.bonus_red) || 0;
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
    const e = 1 - (this.disc_all || 0) / 100;
    const f = (this.f || 0) * (1 - (this.disc_f || 0) / 100) * e;
    const w = (this.w || 0) * (1 - (this.disc_w || 0) / 100) * e;
    const g = (this.g || 0) * (1 - (this.disc_g || 0) / 100) * e;
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
    const bDmg = Math.max(1, atk - arm);
    const bonusDmg = (attacker.bonus || 0) * (1 - (defender.bonus_red || 0) / 100);
    return bDmg + bonusDmg;
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
    const key = el.id.substring(2).replace(/-/g, '_');
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

// --- Production Simulation ---

function calculateCount(t, timelineSteps) {
  let unitsCount = 0,
    currentBuild = 0,
    productionDebt = 0,
    currentTrain = 30;
  let currentCost = { f: 0, w: 0, g: 0 };
  const steps = JSON.parse(JSON.stringify(timelineSteps));
  let stepIdx = 0;
  const events = [];

  for (let s = 0; s <= t; s++) {
    while (stepIdx < steps.length) {
      const step = steps[stepIdx];
      const delay = (parseFloat(step.delay) || 0) * (parseInt(step.count) || 1);
      if (!step.started) {
        step.started = true;
        step.startTime = s;
        events.push({ time: s, msg: `Started: ${step.name || step.type} (at ${unitsCount} units)` });
        if (step.isBlocking && currentBuild > 0) {
          step.unblockTime = s + delay;
          currentBuild = Math.max(0, currentBuild - 1);
          step.wasActuallyBlocking = true;
        }
      }
      if (s >= step.startTime + delay) {
        if (step.wasActuallyBlocking) {
          currentBuild++;
          step.wasActuallyBlocking = false;
        }
        events.push({ time: s, msg: `Finished: ${step.name || step.type}` });
        if (step.type === 'building' || step.type === 'prod' || step.type === 'villagers') {
          currentBuild += parseFloat(step.value) || 0;
          if (step.type === 'building' && step.value > 0)
            events.push({ time: s, msg: `Production Capacity +${step.value}` });
        } else if (step.type === 'production') {
          currentBuild = parseFloat(step.value) || currentBuild;
          currentTrain = parseFloat(step.train) || currentTrain;
          events.push({ time: s, msg: `Production set to ${currentBuild}x at ${currentTrain}s` });
        } else if (step.type === 'cost') {
          currentCost = { f: parseFloat(step.f) || 0, w: parseFloat(step.w) || 0, g: parseFloat(step.g) || 0 };
        }
        stepIdx++;
      } else break;
    }
    if (currentBuild > 0 && currentTrain > 0) {
      productionDebt += currentBuild / currentTrain;
      if (productionDebt >= 1) {
        const n = Math.floor(productionDebt);
        unitsCount += n;
        productionDebt -= n;
      }
    }
  }
  return { count: unitsCount, cost: currentCost, events: events };
}

function updateProductionAnalysis(dA, dB, cA, cB) {
  const searchMax = 1800,
    step = 10;
  const getTimeline = (army) =>
    Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el) => ({
      type: el.dataset.type,
      name: el.querySelector('.step-name')?.value,
      delay: parseFloat(el.querySelector('.step-delay')?.value) || 0,
      count: parseInt(el.querySelector('.step-count')?.value) || 1,
      cost: parseFloat(el.querySelector('.step-cost')?.value) || 0,
      isBlocking: el.querySelector('.step-blocking')?.checked,
      value: parseFloat(el.querySelector('.step-value')?.value) || 0,
      train: el.querySelector('.step-train')?.value,
      f: el.querySelector('.step-f')?.value,
      w: el.querySelector('.step-w')?.value,
      g: el.querySelector('.step-g')?.value,
    }));
  const timelineA = getTimeline('a'),
    timelineB = getTimeline('b');

  const data = { labels: [], countA: [], countB: [], advantage: [] };
  let contact = null,
    cross = null,
    finalCostA = { f: 0, w: 0, g: 0 },
    finalCostB = { f: 0, w: 0, g: 0 };

  for (let t = 0; t <= searchMax; t += step) {
    const resA = calculateCount(t, timelineA),
      resB = calculateCount(t, timelineB);
    data.labels.push(t + 's');
    data.countA.push(resA.count);
    data.countB.push(resB.count);
    if (t === searchMax) {
      finalCostA = resA.cost;
      finalCostB = resB.cost;
    }
    let adv = 0;
    if (resA.count > 0 && resB.count > 0) {
      if (!contact) contact = { time: t, cA: resA.count, cB: resB.count };
      const sim = new CombatSim({ ...dA, count: resA.count }, { ...dB, count: resB.count }, cA, cB).run();
      adv =
        sim.armyA.totalHp > sim.armyB.totalHp
          ? (sim.armyA.totalHp / sim.armyA.initialTotalHp) * 100
          : -(sim.armyB.totalHp / sim.armyB.initialTotalHp) * 100;
      if (!cross && data.advantage.length > 0) {
        const prev = data.advantage[data.advantage.length - 1];
        if ((prev < 0 && adv > 0) || (prev > 0 && adv < 0))
          cross = { time: t, cA: resA.count, cB: resB.count, win: adv > 0 ? dA.name : dB.name };
      }
    } else if (resA.count > 0) adv = 100;
    else if (resB.count > 0) adv = -100;
    data.advantage.push(adv);
  }
  renderProductionCharts(data, dA.name, dB.name);

  const resA_final = calculateCount(searchMax, timelineA);
  const resB_final = calculateCount(searchMax, timelineB);

  const report = document.getElementById('production-report-text');
  if (report) {
    let msg = contact
      ? `<p>First units arrive at ${contact.time}s: <strong>${contact.cA} ${dA.name}</strong> vs <strong>${contact.cB} ${dB.name}</strong>.</p>`
      : '';
    if (cross)
      msg += `<p><span style="color:var(--accent-color); font-weight:bold;">Tide Turns at ${cross.time}s!</span><br>The <strong>${cross.win}</strong> catches up once they have massed <strong>${cross.win === dA.name ? cross.cA : cross.cB} units</strong>.</p>`;
    else
      msg += `<p><strong>Dominance:</strong> ${data.advantage[data.advantage.length - 1] > 0 ? dA.name : dB.name} maintains the lead.</p>`;

    msg += `<h4>Event Log</h4><div class="event-log-container">`;
    const combinedEvents = [
      ...resA_final.events.map((e) => ({ ...e, army: 'A', color: getThemeColor('--army-a-color') })),
      ...resB_final.events.map((e) => ({ ...e, army: 'B', color: getThemeColor('--army-b-color') })),
    ]
      .filter((e) => e.time > 0)
      .sort((a, b) => a.time - b.time);

    combinedEvents.forEach((e) => {
      msg += `<div class="event-row"><span class="event-time">${e.time}s</span> <span style="color:${e.color}; font-weight:bold">[${e.army}]</span> ${e.msg}</div>`;
    });
    msg += `</div>`;
    report.innerHTML = msg;
  }

  const renderReqs = (army, cost) => {
    const el = document.getElementById(`p${army}-req`);
    if (!el) return;
    el.innerHTML = `<span style="font-size:0.7rem; color:var(--text-muted)">Current Cost: F:${cost.f} W:${cost.w} G:${cost.g}</span>`;
  };
  renderReqs('a', finalCostA);
  renderReqs('b', finalCostB);
}

function renderProductionCharts(data, nA, nB) {
  const ctxG = document.getElementById('prodGrowthChart')?.getContext('2d'),
    ctxA = document.getElementById('prodAdvantageChart')?.getContext('2d');
  const colorA = getThemeColor('--army-a-color'),
    colorB = getThemeColor('--army-b-color'),
    accent = getThemeColor('--accent-color');
  if (ctxG) {
    if (charts['prodGrowth']) charts['prodGrowth'].destroy();
    charts['prodGrowth'] = new Chart(ctxG, {
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
  if (ctxA) {
    if (charts['prodAdv']) charts['prodAdv'].destroy();
    charts['prodAdv'] = new Chart(ctxA, {
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

// --- UI Functions ---

function addProductionStep(army, type, data = {}) {
  const timeline = document.getElementById(`p${army}-timeline`);
  if (!timeline) return;
  const step = document.createElement('div');
  step.className = 'timeline-step';
  step.dataset.type = type;

  if (type === 'villagers' && !data.name) {
    data.name = 'Villager';
    data.delay = 25;
    data.count = 18;
    data.cost = 50;
    data.isBlocking = true;
    data.value = 0;
  }
  if (type === 'age' && !data.name) {
    const ageMap = { 2: 'Feudal Age', 3: 'Castle Age', 4: 'Imperial Age' };
    const ageName = ageMap[data.ageVal] || 'Feudal Age';
    const techId = TECH_MAP[ageName],
      tData = techs[techId];
    if (tData) {
      data.id = techId.toString();
      data.name = tData.name;
      data.delay = tData.time;
      data.count = 1;
      data.cost = (tData.f || 0) + (tData.w || 0) + (tData.g || 0);
      data.isBlocking = true;
    }
    type = 'tech';
    step.dataset.type = 'tech';
  }

  let optionsHtml = '';
  if (type === 'tech')
    optionsHtml = Object.entries(techs)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([id, t]) => `<option value="${id}" ${String(data.id) === String(id) ? 'selected' : ''}>${t.name}</option>`)
      .join('');
  else if (type === 'building')
    optionsHtml = Object.entries(buildings)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([id, b]) => `<option value="${id}" ${String(data.id) === String(id) ? 'selected' : ''}>${b.name}</option>`)
      .join('');
  const select =
    type === 'tech' || type === 'building'
      ? `<select class="step-select"><option value="">Custom...</option>${optionsHtml}</select>`
      : '';

  let bodyHtml;
  if (type === 'cost') {
    bodyHtml = `
        <div class="step-field"><label>Food</label><input type="number" class="step-f" value="${data.f || 0}" style="width:40px;"></div>
        <div class="step-field"><label>Wood</label><input type="number" class="step-w" value="${data.w || 0}" style="width:40px;"></div>
        <div class="step-field"><label>Gold</label><input type="number" class="step-g" value="${data.g || 0}" style="width:40px;"></div>
      `;
  } else {
    bodyHtml = `
        <div class="step-field"><label>Name</label><input type="text" class="step-name" value="${data.name || ''}" style="width:100px;"></div>
        <div class="step-field"><label>Delay</label><input type="number" class="step-delay" value="${data.delay || 0}" style="width:45px;"></div>
        <div class="step-field"><label>x</label><input type="number" class="step-count" value="${data.count || 1}" style="width:35px;"></div>
        <div class="step-field"><label>Cost</label><input type="number" class="step-cost" value="${data.cost || 0}" style="width:45px;"></div>
        <div class="step-field"><label>Block</label><input type="checkbox" class="step-blocking" ${data.isBlocking ? 'checked' : ''}></div>
        <div class="step-field"><label>Value</label><input type="number" class="step-value" value="${data.value || 0}" style="width:40px;"></div>
        ${type === 'production' ? `<div class="step-field"><label>Speed</label><input type="number" class="step-train" value="${data.train || 30}" style="width:40px;"></div>` : ''}
      `;
  }

  step.innerHTML = `
    <div class="step-header">
      <div class="step-drag-handle">::</div><span class="timeline-step-label">${type}</span><button class="remove-step-btn">&times;</button>
    </div>
    <div class="step-body">
      ${select} ${bodyHtml}
    </div>
  `;

  const updateFromSelect = () => {
    const sel = step.querySelector('.step-select');
    if (!sel) return;
    const val = sel.value,
      src = type === 'tech' ? techs : buildings;
    if (val && src[val]) {
      const item = src[val];
      step.querySelector('.step-name').value = item.name;
      step.querySelector('.step-delay').value = item.time || 0;
      step.querySelector('.step-cost').value = (item.f || 0) + (item.w || 0) + (item.g || 0) + (item.s || 0);
      if (type === 'tech') step.querySelector('.step-blocking').checked = true;
      if (type === 'building') step.querySelector('.step-value').value = 1;
    }
    onInputChange(true);
  };

  if (select) step.querySelector('.step-select').addEventListener('change', updateFromSelect);
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
  const timeline = document.getElementById(`p${army}-timeline`);
  if (timeline) {
    timeline.innerHTML = '';
    addProductionStep(army, 'production', { name: 'Initial Production', value: 1, train: u.trainTime });
    addProductionStep(army, 'cost', { f: u.f, w: u.w, g: u.g });
  }
  onInputChange(false);
}

function loadScenario(id) {
  const s = scenarios[id];
  if (!s) return;
  activeScenario = id;
  const descEl = document.getElementById('scenario-desc');
  if (descEl) descEl.value = s.desc || '';
  ['a', 'b'].forEach((army) => {
    const config = s[army];
    document.getElementById(`p${army}-timeline`).innerHTML = '';
    document.getElementById(`${army}-applied-bonuses`).innerHTML = '';
    if (config.preset) loadPreset(army, config.preset);
    const smap = {
      as: 'atk-speed',
      abr: 'bonus-red',
      bbn: 'bonus',
      da: 'disc-all',
      df: 'disc-f',
      dw: 'disc-w',
      dg: 'disc-g',
    };
    for (const [key, val] of Object.entries(config)) {
      const el = document.getElementById(`${army}-${smap[key] || key}`);
      if (el) el.value = val;
      if (key === 'name') {
        const h = document.getElementById(`name-header-${army}`);
        if (h) h.textContent = val;
      }
    }
    if (config['train-time'] || config.buildings || config.delay || config.tech) {
      document.getElementById(`p${army}-timeline`).innerHTML = '';
      if (config['train-time'] || config.buildings)
        addProductionStep(army, 'production', {
          name: 'Initial Production',
          value: config.buildings || 1,
          train: config['train-time'] || 30,
        });
      if (config.delay) addProductionStep(army, 'building', { name: 'Initial Delay', delay: config.delay, value: 0 });
      if (config.tech)
        addProductionStep(army, 'tech', { name: 'Initial Research', delay: config.tech, isBlocking: true });
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
  const s = { a: {}, b: {}, desc: '' };
  const descEl = document.getElementById('scenario-desc');
  if (descEl) s.desc = descEl.value;

  ['a', 'b'].forEach((army) => {
    for (const [field, key] of Object.entries(fieldMap)) {
      const id = `${army}-${field}`;
      const el = document.getElementById(id);
      if (el && el.value !== defaults[id]) s[army][key] = el.value;
    }
    const presetEl = document.querySelector(`.preset-search[data-army="${army}"]`);
    if (presetEl && presetEl.dataset.value) s[army].ps = presetEl.dataset.value;

    const timeline = Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el) => ({
      t: el.dataset.type,
      n: el.querySelector('.step-name')?.value,
      d: el.querySelector('.step-delay')?.value,
      c: el.querySelector('.step-count')?.value,
      co: el.querySelector('.step-cost')?.value,
      b: el.querySelector('.step-blocking')?.checked,
      v: el.querySelector('.step-value')?.value,
      i: el.querySelector('.step-select')?.value,
      tr: el.querySelector('.step-train')?.value,
      f: el.querySelector('.step-f')?.value,
      w: el.querySelector('.step-w')?.value,
      g: el.querySelector('.step-g')?.value,
    }));
    if (timeline.length > 0) s[army].tl = timeline;

    const bData = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map((el) => ({
      i: el.dataset.id,
      e: Array.from(el.querySelectorAll('input')).map((cb) => cb.checked),
    }));
    if (bData.length > 0) s[army].bn = bData;
  });
  return s;
}

function loadState() {
  const p = new URLSearchParams(window.location.search);
  const dataParam = p.get('data');
  if (dataParam) {
    try {
      const state = JSON.parse(dataParam);
      if (state.desc) {
        const el = document.getElementById('scenario-desc');
        if (el) el.value = state.desc;
      }
      ['a', 'b'].forEach((army) => {
        const armyState = state[army];
        if (!armyState) return;

        if (armyState.ps) loadPreset(army, armyState.ps);

        for (const [field, key] of Object.entries(fieldMap)) {
          if (armyState[key] !== undefined) {
            const id = `${army}-${field}`;
            const el = document.getElementById(id);
            if (el) el.value = armyState[key];
          }
        }

        if (armyState.tl) {
          const container = document.getElementById(`p${army}-timeline`);
          if (container) {
            container.innerHTML = '';
            armyState.tl.forEach((s) => {
              const data = {
                type: s.t,
                name: s.n,
                delay: s.d,
                count: s.c,
                cost: s.co,
                isBlocking: s.b,
                value: s.v,
                id: s.i,
                train: s.tr,
                f: s.f,
                w: s.w,
                g: s.g,
              };
              addProductionStep(army, s.t, data);
            });
          }
        }

        if (armyState.bn) {
          const container = document.getElementById(`${army}-applied-bonuses`);
          if (container) {
            container.innerHTML = '';
            armyState.bn.forEach((b) => addBonus(army, b.i, b.e));
          }
        }
      });
      updateCharts();
      return;
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }
  if (p.has('scenario')) loadScenario(p.get('scenario'));
  updateCharts();
}

function syncURL() {
  const s = getState(),
    p = new URLSearchParams();
  if (activeScenario) p.set('scenario', activeScenario);
  const json = JSON.stringify(s);
  const encoded = p.toString() + (p.toString() ? '&' : '') + 'data=' + encodeURIComponent(json);
  const clean = encoded
    .replace(/%22/g, '"')
    .replace(/%7B/g, '{')
    .replace(/%7D/g, '}')
    .replace(/%3A/g, ':')
    .replace(/%2C/g, ',')
    .replace(/%5B/g, '[')
    .replace(/%5D/g, ']');
  history.replaceState(null, '', '?' + clean);
}

function exportScenario() {
  const s = getState();
  const json = JSON.stringify(s, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    const btn = document.getElementById('export-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = 'var(--color-pos)';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.color = '';
    }, 2000);
  });
}

window.onload = () => {
  allUnits = { ...units, ...presets };
  document.querySelectorAll('input, select, textarea').forEach((t) => {
    if (t.id) defaults[t.id] = t.value;
  });
  renderScenarioBar();
  document.getElementById('scenario-desc')?.addEventListener('input', () => onInputChange(true));
  document.getElementById('export-btn')?.addEventListener('click', exportScenario);
  document.getElementById('share-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('share-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Link Copied!';
      btn.style.color = 'var(--color-pos)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.color = '';
      }, 2000);
    });
  });
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
        addProductionStep(btn.dataset.army, btn.dataset.type, { ageVal: btn.dataset.val }),
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
  ['a', 'b'].forEach((army) => {
    new Sortable(document.getElementById(`p${army}-timeline`), {
      animation: 150,
      handle: '.step-drag-handle',
      onEnd: () => onInputChange(true),
    });
  });
  loadState();
};

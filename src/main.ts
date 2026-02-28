import { UnitData, TechData, BuildingData, ArmyState, SimulationState, TimelineStep } from './sim/types';
import { units } from './data/units';
import { techs, TECH_MAP } from './data/techs';
import { buildings } from './data/buildings';
import { civs } from './data/civs';
import { presets } from './data/presets';
import { scenarios, featuredScenarios } from './data/scenarios';
import { bonuses } from './data/bonuses';
import { CombatSim, CombatResult } from './sim/CombatSim';
import { calculateCount } from './sim/ProductionSim';
import { Unit } from './sim/Unit';
import { decodeEncoded, getEffectLabel, shouldApplyTech, shouldApplyEffect, COMBAT_BUILDINGS } from './sim/TechLogic';

// Global state
let charts: Record<string, any> = {};
let defaults: Record<string, string> = {};
let activeScenario: string | null = null;
let allUnits: Record<string, UnitData> = {};
let techsById: Record<number, TechData> = {};

// Rate limiting for share functionality
const SHARE_RATE_LIMIT = {
  perMinute: 3,      // Allow 3 shares per minute (for active editing)
  perDay: 1000,      // 1000 shares per day
  lastShareTime: 0,
  dailyCount: 0,
  dailyResetTime: 0,
};

/**
 * Check if share action is rate limited
 * Returns { allowed: boolean, reason?: string, retryAfter?: number }
 */
function checkShareRateLimit(): { allowed: boolean; reason?: string; retryAfter?: number } {
  const now = Date.now();
  const minuteMs = 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  // Reset daily counter if needed
  if (now - SHARE_RATE_LIMIT.dailyResetTime > dayMs) {
    SHARE_RATE_LIMIT.dailyCount = 0;
    SHARE_RATE_LIMIT.dailyResetTime = now;
  }

  // Check per-minute limit
  if (now - SHARE_RATE_LIMIT.lastShareTime < minuteMs) {
    const retryAfter = Math.ceil((minuteMs - (now - SHARE_RATE_LIMIT.lastShareTime)) / 1000);
    return {
      allowed: false,
      retryAfter,
    };
  }

  // Check per-day limit
  if (SHARE_RATE_LIMIT.dailyCount >= SHARE_RATE_LIMIT.perDay) {
    const retryAfter = Math.ceil((dayMs - (now - SHARE_RATE_LIMIT.dailyResetTime)) / (60 * 1000));
    return {
      allowed: false,
      retryAfter,
    };
  }

  return { allowed: true };
}

/**
 * Record a successful share action
 */
function recordShare() {
  const now = Date.now();
  SHARE_RATE_LIMIT.lastShareTime = now;
  SHARE_RATE_LIMIT.dailyCount++;

  // Persist to localStorage
  localStorage.setItem('shareRateLimit', JSON.stringify({
    lastShareTime: SHARE_RATE_LIMIT.lastShareTime,
    dailyCount: SHARE_RATE_LIMIT.dailyCount,
    dailyResetTime: SHARE_RATE_LIMIT.dailyResetTime,
  }));
}

/**
 * Load rate limit state from localStorage
 */
function loadRateLimitState() {
  try {
    const stored = localStorage.getItem('shareRateLimit');
    if (stored) {
      const parsed = JSON.parse(stored);
      SHARE_RATE_LIMIT.lastShareTime = parsed.lastShareTime || 0;
      SHARE_RATE_LIMIT.dailyCount = parsed.dailyCount || 0;
      SHARE_RATE_LIMIT.dailyResetTime = parsed.dailyResetTime || 0;
    }
  } catch (e) {
    console.error('Failed to load rate limit state:', e);
  }
}

const fieldMap: Record<string, string> = {
  name: 'nm', count: 'c', hp: 'h', reload: 'rl', matk: 'am', patk: 'ap', marm: 'aa', parm: 'ar',
  range: 'n', 'atk-speed': 'as', 'bonus-red': 'ab', bonus: 'ad', food: 'af', wood: 'aw', gold: 'ag',
  'disc-all': 'da', 'disc-f': 'df', 'disc-w': 'dw', 'disc-g': 'dg', eng: 'e', 'groups-slider': 'mc',
};

function getThemeColor(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function onInputChange(manualChange: boolean = true) {
  if (manualChange) activeScenario = null;

  const updateLabel = (army: 'a' | 'b') => {
    const name = (document.getElementById(`${army}-name`) as HTMLInputElement)?.value || `Unit ${army.toUpperCase()}`;
    const header = document.getElementById(`name-header-${army}`);
    if (header) header.textContent = name;

    const compHeader = document.getElementById(`comp-name-${army}`);
    if (compHeader) compHeader.textContent = name;

    const ratioLabel = document.getElementById(`ratio-label-${army}`);
    if (ratioLabel) ratioLabel.textContent = `${name} Count`;

    const prodLabel = document.getElementById(`prod-name-${army}`);
    if (prodLabel) prodLabel.textContent = `${name} Production`;
  };

  updateLabel('a');
  updateLabel('b');
  updateCharts();
  syncURL();
}

function getArmyData(army: 'a' | 'b'): UnitData | null {
  const el = document.querySelector(`.preset-search[data-army="${army}"]`) as HTMLInputElement;
  const id = el ? el.dataset.value : null;
  if (!id || !allUnits[id]) return null;
  return { ...allUnits[id], id: id };
}

function getArmyConfig(army: 'a' | 'b'): ArmyState {
  const config: any = {};
  for (const [field, key] of Object.entries(fieldMap)) {
    const el = document.getElementById(`${army}-${field}`) as HTMLInputElement;
    if (el) config[key] = el.type === 'number' || el.type === 'range' ? parseFloat(el.value) : el.value;
  }

  const slider = document.getElementById(`${army}-groups-slider`) as HTMLInputElement;
  if (slider) config.mc = parseInt(slider.value);

  config.bn = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map((el: any) => ({
    i: el.dataset.id,
    e: Array.from(el.querySelectorAll('input')).map((cb: any) => cb.checked)
  }));

  return config;
}

function updateCharts() {
  const dA = getArmyData('a'), dB = getArmyData('b');
  const cA = getArmyConfig('a'), cB = getArmyConfig('b');
  if (!dA || !dB) return;

  const sim = new CombatSim(dA, dB, cA, cB, techsById, allUnits);
  const res = sim.run();

  const nameA = (cA as any).nm || dA.name;
  const nameB = (cB as any).nm || dB.name;

  updateResultCard(res, nameA, nameB);
  updateStatComparison(dA, dB, cA, cB, sim);
  updateUnitStatsSummary('a', { ...dA, ...cA } as any, res.dataA);
  updateUnitStatsSummary('b', { ...dB, ...cB } as any, res.dataB);
  updateTimeCharts(res.history, nameA, nameB);
  updateProductionAnalysis(dA, dB, cA, cB);
  updateScalingAnalysis(dA, dB, cA, cB);
}

function updateUnitStatsSummary(army: 'a' | 'b', baseObj: any, finalObj: any) {
  const container = document.getElementById(`${army}-stats-summary`);
  if (!container) return;

  const formatStat = (base: number, total: number) => {
    const diff = Math.round(total - base);
    let html = `<span>${Math.round(base)}</span>`;
    if (Math.abs(diff) >= 1) {
      const cls = diff > 0 ? 'stat-bonus' : 'stat-penalty';
      html += `<span class="${cls}"> ${diff > 0 ? '+' : ''}${diff}</span>`;
    }
    return html;
  };

  const isMelee = (finalObj.range || 0) <= 1;
  const stats = [
    { icon: '❤️', label: 'HP', base: baseObj.h !== undefined ? baseObj.h : baseObj.hp, total: finalObj.hp },
    {
      icon: isMelee ? '⚔️' : '🏹',
      label: isMelee ? 'Melee Attack' : 'Pierce Attack',
      base: isMelee ? (baseObj.am !== undefined ? baseObj.am : (baseObj.matk || 0)) : (baseObj.ap !== undefined ? baseObj.ap : (baseObj.patk || 0)),
      total: isMelee ? (finalObj.matk || 0) : (finalObj.patk || 0)
    },
    { icon: '🛡️', label: 'Melee Armor', base: baseObj.aa !== undefined ? baseObj.aa : (baseObj.marm || 0), total: finalObj.marm },
    { icon: '🛡️', label: 'Pierce Armor', base: baseObj.ar !== undefined ? baseObj.ar : (baseObj.parm || 0), total: finalObj.parm },
  ];

  if (finalObj.range > 1) {
    stats.push({ icon: '🎯', label: 'Range', base: baseObj.n !== undefined ? baseObj.n : (baseObj.range || 0), total: finalObj.range });
  }

  container.innerHTML = stats.map(s => `
    <div class="stat-badge" title="${s.label}">
      <span class="stat-icon">${s.icon}</span>
      <span class="stat-text">${formatStat(s.base, s.total)}</span>
    </div>
  `).join('');
}

function updateResultCard(res: CombatResult, nameA: string, nameB: string) {
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

function updateStatComparison(dA: UnitData, dB: UnitData, cA: ArmyState, cB: ArmyState, simRef: CombatSim) {
  const el = document.getElementById('comparison-body');
  if (!el) return;

  const uA = new Unit(simRef.dataA);
  const uB = new Unit(simRef.dataB);
  const baseA = allUnits[simRef.dataA.id];
  const baseB = allUnits[simRef.dataB.id];

  const formatWithBase = (total: number, base: number) => {
    const diff = total - base;
    if (Math.abs(diff) < 0.01) return total.toFixed(0);
    return `${total.toFixed(0)} (${base.toFixed(0)} + ${diff.toFixed(0)})`;
  };

  // Simple damage breakdown calculation
  const getNetDmg = (atk: Unit, def: Unit) => {
    const isMelee = atk.range <= 1;
    const baseAtk = isMelee ? atk.matk : atk.patk;
    const baseArm = isMelee ? def.marm : def.parm;
    let bonus = 0;
    for (const [cls, amt] of Object.entries(atk.bonuses || {})) {
      bonus += Math.max(0, amt - (def.armors[cls] || 0));
    }
    return { base: baseAtk, arm: baseArm, bonus, net: Math.max(1, baseAtk - baseArm + bonus) };
  };

  const nA = getNetDmg(uA, uB);
  const nB = getNetDmg(uB, uA);

  const getBaseAtk = (u: Unit, baseData: UnitData | undefined) => {
    if (!baseData) return u.isMelee() ? u.matk : u.patk;
    return u.isMelee() ? (baseData.matk || 0) : (baseData.patk || 0);
  };
  const getBaseArm = (u: Unit, baseData: UnitData | undefined) => {
    if (!baseData) return u.isMelee() ? u.marm : u.parm;
    return u.isMelee() ? (baseData.marm || 0) : (baseData.parm || 0);
  };

  const rows = [
    { label: 'HP', a: formatWithBase(uA.hpPerUnit, baseA?.hp || uA.hpPerUnit), b: formatWithBase(uB.hpPerUnit, baseB?.hp || uB.hpPerUnit) },
    { label: 'Attack (Base)', a: formatWithBase(nA.base, getBaseAtk(uA, baseA)), b: formatWithBase(nB.base, getBaseAtk(uB, baseB)) },
    { label: 'Bonus Dmg', a: nA.bonus.toFixed(0), b: nB.bonus.toFixed(0) },
    { label: 'Opponent Arm', a: formatWithBase(nA.arm, getBaseArm(uB, baseB)), b: formatWithBase(nB.arm, getBaseArm(uA, baseA)), inv: true },
    { label: 'Net Dmg/Hit', a: nA.net.toFixed(0), b: nB.net.toFixed(0) },
    { label: 'Hits to Kill', a: Math.ceil(uB.hpPerUnit / nA.net).toString(), b: Math.ceil(uA.hpPerUnit / nB.net).toString(), inv: true },
    { label: 'Reload', a: uA.reload.toFixed(2), b: uB.reload.toFixed(2), inv: true },
    { label: 'DPS (Eff)', a: (nA.net / uA.reload).toFixed(2), b: (nB.net / uB.reload).toFixed(2) },
  ] as { label: string; a: string; b: string; inv?: boolean }[];

  el.innerHTML = rows.map((r) => {
    const vA = parseFloat(r.a), vB = parseFloat(r.b);
    const diff = vA - vB;
    let dClass = 'diff-neutral';
    if (diff > 0) dClass = r.inv ? 'diff-neg' : 'diff-pos';
    else if (diff < 0) dClass = r.inv ? 'diff-pos' : 'diff-neg';
    return `<tr><td>${r.label}</td><td>${r.a}</td><td>${r.b}</td><td class="${dClass}">${diff === 0 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(r.label.includes('.') || r.label.includes('DPS') ? 2 : 0)}</td></tr>`;
  }).join('');
}

function updateTimeCharts(history: any[], nameA: string, nameB: string) {
  const labels = history.map((h) => h.time.toFixed(1) + 's');
  const colorA = getThemeColor('--army-a-color'), colorB = getThemeColor('--army-b-color'), accent = getThemeColor('--accent-color');

  const renderLineChart = (id: string, datasets: any[]) => {
    const ctx = (document.getElementById(id) as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;
    if (charts[id]) charts[id].destroy();
    // @ts-ignore
    charts[id] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasets.map(d => ({ ...d, tension: 0, pointRadius: 0, fill: false })) },
      options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' } }
    });
  };

  renderLineChart('countChart', [{ label: nameA, data: history.map(h => h.countA), borderColor: colorA }, { label: nameB, data: history.map(h => h.countB), borderColor: colorB }]);
  renderLineChart('hpChart', [{ label: nameA, data: history.map(h => h.hpA), borderColor: colorA }, { label: nameB, data: history.map(h => h.hpB), borderColor: colorB }]);
  renderLineChart('valueChart', [{ label: nameA, data: history.map(h => h.valRemainingA), borderColor: colorA }, { label: nameB, data: history.map(h => h.valRemainingB), borderColor: colorB }]);
  renderLineChart('efficiencyChart', [{ label: 'Cost Efficiency Ratio', data: history.map(h => (h.valLostA === 0 ? 1 : h.valLostB / h.valLostA)), borderColor: accent }]);
}

function updateProductionAnalysis(dA: UnitData, dB: UnitData, cA: ArmyState, cB: ArmyState) {
  const searchMax = 1800, step = 10;
  const getTimeline = (army: 'a' | 'b'): TimelineStep[] => Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el: any) => ({
    t: el.dataset.type, n: el.querySelector('.step-name')?.value,
    d: parseFloat(el.querySelector('.step-delay')?.value) || 0,
    c: parseInt(el.querySelector('.step-count')?.value) || 1,
    co: parseFloat(el.querySelector('.step-cost')?.value) || 0,
    b: el.querySelector('.step-blocking')?.checked,
    v: parseFloat(el.querySelector('.step-value')?.value) || 0,
    tr: parseFloat(el.querySelector('.step-train')?.value),
    f: parseFloat(el.querySelector('.step-f')?.value),
    w: parseFloat(el.querySelector('.step-w')?.value),
    g: parseFloat(el.querySelector('.step-g')?.value),
    i: el.querySelector('.step-select')?.value,
    bt: parseInt(el.dataset.bt || '0')
  }));

  const tlA = getTimeline('a'), tlB = getTimeline('b');
  const contA = (document.getElementById('a-prod-cont') as HTMLInputElement)?.checked ?? true;
  const contB = (document.getElementById('b-prod-cont') as HTMLInputElement)?.checked ?? true;
  const startVillsA = parseInt((document.getElementById('a-prod-start-vills') as HTMLInputElement)?.value) || 3;
  const startVillsB = parseInt((document.getElementById('b-prod-start-vills') as HTMLInputElement)?.value) || 3;

  const uA_unit = new Unit(dA as any), uB_unit = new Unit(dB as any);
  const baseCostA = uA_unit.getParsedCost(), baseCostB = uB_unit.getParsedCost();

  const nameA = (cA as any).nm || dA.name, nameB = (cB as any).nm || dB.name;
  const data: any = { labels: [], countA: [], countB: [], advantage: [] };
  let contact: any = null, cross: any = null;
  let finalCostA = { f: 0, w: 0, g: 0 }, finalCostB = { f: 0, w: 0, g: 0 };
  let finalUPSA = 0, finalUPSB = 0;

  for (let t = 0; t <= searchMax; t += step) {
    const resA = calculateCount(t, tlA, baseCostA, contA, startVillsA);
    const resB = calculateCount(t, tlB, baseCostB, contB, startVillsB);
    data.labels.push(t + 's'); data.countA.push(resA.count); data.countB.push(resB.count);

    if (t === searchMax) {
      finalCostA = resA.cost; finalCostB = resB.cost;
      finalUPSA = resA.unitsPerSecond; finalUPSB = resB.unitsPerSecond;
      renderEconomyChart(resA.economyHistory, resB.economyHistory);
    }

    let adv = 0;
    if (resA.count > 0 && resB.count > 0) {
      if (!contact) contact = { time: t, cA: resA.count, cB: resB.count };
      const cleanCA = Object.assign({}, cA); delete (cleanCA as any).c;
      const cleanCB = Object.assign({}, cB); delete (cleanCB as any).c;
      const sim = new CombatSim(dA, dB, { ...cleanCA, c: resA.count }, { ...cleanCB, c: resB.count }, techsById, allUnits);
      const res = sim.run();
      adv = res.armyA.totalHp > res.armyB.totalHp ? (res.armyA.totalHp / res.armyA.initialTotalHp) * 100 : -(res.armyB.totalHp / res.armyB.initialTotalHp) * 100;

      if (!cross && data.advantage.length > 0) {
        const prev = data.advantage[data.advantage.length - 1];
        if ((prev < 0 && adv > 0) || (prev > 0 && adv < 0))
          cross = { time: t, cA: resA.count, cB: resB.count, win: adv > 0 ? nameA : nameB };
      }
    } else if (resA.count > 0) adv = 100; else if (resB.count > 0) adv = -100;
    data.advantage.push(adv);
  }

  renderProductionCharts(data, nameA, nameB);

  const report = document.getElementById('production-report-text');
  if (report) {
    let msg = contact ? `<p>First units arrive at ${contact.time}s: <strong>${contact.cA} ${nameA}</strong> vs <strong>${contact.cB} ${nameB}</strong>.</p>` : '';
    if (cross) {
      msg += `<p><span style="color:var(--accent-color); font-weight:bold;">Tide Turns at ${cross.time}s!</span><br>The <strong>${cross.win}</strong> player starts winning once they have massed <strong>${cross.win === nameA ? cross.cA : cross.cB} units</strong> vs the opponent's <strong>${cross.win === nameA ? cross.cB : cross.cA}</strong>.</p>`;
    } else {
      msg += `<p><strong>Dominance:</strong> ${data.advantage[data.advantage.length - 1] > 0 ? nameA : nameB} maintains the lead.</p>`;
    }

    msg += `<h4>Event Log</h4><div class="event-log-container">`;
    const resA_final = calculateCount(searchMax, tlA, baseCostA, contA);
    const resB_final = calculateCount(searchMax, tlB, baseCostB, contB);
    const combinedEvents = [
      ...resA_final.events.map(e => ({ ...e, army: 'A', color: getThemeColor('--army-a-color') })),
      ...resB_final.events.map(e => ({ ...e, army: 'B', color: getThemeColor('--army-b-color') }))
    ].filter(e => e.time > 0).sort((a, b) => a.time - b.time);

    combinedEvents.forEach(e => {
      msg += `<div class="event-row"><span class="event-time">${e.time}s</span> <span style="color:${e.color}; font-weight:bold">[${e.army}]</span> ${e.msg}</div>`;
    });
    msg += `</div>`;
    report.innerHTML = msg;
  }

  const renderReqs = (army: 'a' | 'b', cost: any, ups: number) => {
    const el = document.getElementById(`p${army}-req`);
    if (!el) return;
    el.innerHTML = `<div style="font-size:0.75rem; color:var(--text-color); display:flex; flex-direction:column; gap:4px; padding: 10px; background: var(--panel-bg-alt); border-radius: 4px; border: 1px solid var(--border-dim);"><span style="font-weight:bold; color:var(--accent-color); text-transform:uppercase; font-size:0.65rem;">Resource Requirements (Per Second)</span><div style="display:flex; gap:15px;"><span><strong style="color:#f1c40f">Food:</strong> ${(cost.f * ups).toFixed(1)}</span><span><strong style="color:#e67e22">Wood:</strong> ${(cost.w * ups).toFixed(1)}</span><span><strong style="color:#f1c40f">Gold:</strong> ${(cost.g * ups).toFixed(1)}</span></div></div>`;
  };
  renderReqs('a', finalCostA, finalUPSA);
  renderReqs('b', finalCostB, finalUPSB);
}

function renderProductionCharts(data: any, nA: string, nB: string) {
  const colorA = getThemeColor('--army-a-color'), colorB = getThemeColor('--army-b-color'), accent = getThemeColor('--accent-color');

  const ctxG = (document.getElementById('prodGrowthChart') as HTMLCanvasElement)?.getContext('2d');
  if (ctxG) {
    if (charts['prodGrowth']) charts['prodGrowth'].destroy();
    // @ts-ignore
    charts['prodGrowth'] = new Chart(ctxG, {
      type: 'line',
      data: { labels: data.labels, datasets: [{ label: nA, data: data.countA, borderColor: colorA }, { label: nB, data: data.countB, borderColor: colorB }] },
      options: { responsive: true, maintainAspectRatio: false, datasets: { line: { tension: 0, pointRadius: 0 } } }
    });
  }

  const ctxA = (document.getElementById('prodAdvantageChart') as HTMLCanvasElement)?.getContext('2d');
  if (ctxA) {
    if (charts['prodAdv']) charts['prodAdv'].destroy();
    // @ts-ignore
    charts['prodAdv'] = new Chart(ctxA, {
      type: 'line',
      data: { labels: data.labels, datasets: [{ label: 'Advantage (+A / -B)', data: data.advantage, borderColor: accent, fill: { target: 'origin', above: 'rgba(52, 152, 219, 0.2)', below: 'rgba(231, 76, 60, 0.2)' } }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: -100, max: 100 } }, datasets: { line: { tension: 0.2, pointRadius: 0 } } }
    });
  }
}

function renderEconomyChart(historyA: any[], historyB: any[]) {
  const ctx = (document.getElementById('economyChart') as HTMLCanvasElement)?.getContext('2d');
  const ctxBal = (document.getElementById('economyBalanceChart') as HTMLCanvasElement)?.getContext('2d');
  if (!ctx || !ctxBal) return;

  if (charts['economy']) charts['economy'].destroy();
  if (charts['economyBalance']) charts['economyBalance'].destroy();

  const labels = historyA.map(h => h.time + 's');
  const colorA = getThemeColor('--army-a-color');
  const colorB = getThemeColor('--army-b-color');

  // @ts-ignore
  charts['economy'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'A: Gathered', data: historyA.map(h => h.gathered), borderColor: colorA, borderDash: [5, 5] },
        { label: 'A: Spent', data: historyA.map(h => h.spent), borderColor: colorA },
        { label: 'B: Gathered', data: historyB.map(h => h.gathered), borderColor: colorB, borderDash: [5, 5] },
        { label: 'B: Spent', data: historyB.map(h => h.spent), borderColor: colorB }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      datasets: { line: { tension: 0, pointRadius: 0 } }
    }
  });

  // Balance Chart (Gathered - Spent)
  // @ts-ignore
  charts['economyBalance'] = new Chart(ctxBal, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'A: Balance', data: historyA.map(h => h.gathered - h.spent), borderColor: colorA },
        { label: 'B: Balance', data: historyB.map(h => h.gathered - h.spent), borderColor: colorB }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: (context: any) => context.tick.value === 0 ? '#ff0000' : 'rgba(255,255,255,0.1)' }
        }
      },
      datasets: { line: { tension: 0, pointRadius: 0, fill: { target: 'origin' } } }
    }
  });
}

function updateScalingAnalysis(dA: UnitData, dB: UnitData, cA: ArmyState, cB: ArmyState) {
  const nameA = (cA as any).nm || dA.name, nameB = (cB as any).nm || dB.name;
  const scales = [1, 2, 3, 4, 5, 8, 10, 15, 20];

  const updateTitle = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  updateTitle('table-a-title', `1 ${nameA} vs X ${nameB}`);
  updateTitle('scale1vX-title', `1 ${nameA} vs X ${nameB} Scaling`);
  updateTitle('table-b-title', `1 ${nameB} vs X ${nameA}`);
  updateTitle('scaleXv1-title', `1 ${nameB} vs X ${nameA} Scaling`);

  const runScaling = (mode: '1vX' | 'Xv1') => {
    const results: any = { labels: scales, hpA: [], hpB: [] };
    const tableId = mode === '1vX' ? 'matchups-a' : 'matchups-b';
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (tbody) tbody.innerHTML = '';

    scales.forEach((s) => {
      const cntA = mode === '1vX' ? 1 : s;
      const cntB = mode === 'Xv1' ? 1 : s;
      const sim = new CombatSim(dA, dB, { ...cA, c: cntA }, { ...cB, c: cntB }, techs, allUnits);
      const res = sim.run();

      const hA = (res.armyA.totalHp / res.armyA.initialTotalHp) * 100;
      const hB = (res.armyB.totalHp / res.armyB.initialTotalHp) * 100;
      results.hpA.push(hA); results.hpB.push(hB);

      if (tbody) {
        const winner = res.armyA.totalHp > res.armyB.totalHp ? (mode === '1vX' ? `1 ${nameA}` : `${s} ${nameA}`) : (mode === '1vX' ? `${s} ${nameB}` : `1 ${nameB}`);
        const color = res.armyA.totalHp > res.armyB.totalHp ? getThemeColor('--army-a-color') : getThemeColor('--army-b-color');
        const row = document.createElement('tr');
        row.innerHTML = `<td>1 vs ${s}</td><td style="color:${color}; font-weight:bold;">${winner} (${Math.max(hA, hB).toFixed(0)}% HP)</td>`;
        tbody.appendChild(row);
      }
    });
    return results;
  };

  const res1vX = runScaling('1vX');
  const resXv1 = runScaling('Xv1');

  renderScalingChart('scale1vXChart', res1vX, nameA, nameB);
  renderScalingChart('scaleXv1Chart', resXv1, nameA, nameB);
}

function renderScalingChart(id: string, data: any, nameA: string, nameB: string) {
  const ctx = (document.getElementById(id) as HTMLCanvasElement)?.getContext('2d');
  if (!ctx) return;
  const colorA = getThemeColor('--army-a-color'), colorB = getThemeColor('--army-b-color');
  if (charts[id]) charts[id].destroy();
  // @ts-ignore
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: { labels: data.labels, datasets: [{ label: nameA + ' % HP', data: data.hpA, borderColor: colorA }, { label: nameB + ' % HP', data: data.hpB, borderColor: colorB }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } }, datasets: { line: { tension: 0.2, pointRadius: 2 } } }
  });
}

// --- UI Functions ---

function addProductionStep(army: 'a' | 'b', type: string, data: any = {}) {
  const timeline = document.getElementById(`p${army}-timeline`);
  if (!timeline) return;
  const step = document.createElement('div');
  step.className = 'timeline-step';
  step.dataset.type = type;
  if (data.bt) step.dataset.bt = data.bt.toString();

  if (type === 'villagers' && !data.name) {
    data.name = 'Villager'; data.delay = 25; data.count = 18; data.cost = 50; data.isBlocking = true; data.value = 0;
  }

  if (type === 'age' && !data.name) {
    const ageMap: Record<number, string> = { 2: 'Feudal Age', 3: 'Castle Age', 4: 'Imperial Age' };
    const ageName = ageMap[data.ageVal] || 'Feudal Age';
    const techId = TECH_MAP[ageName];
    const tData = techsById[techId];
    if (tData) {
      data.id = techId.toString(); data.name = tData.name; data.delay = tData.time; data.count = 1;
      data.cost = (tData.f || 0) + (tData.w || 0) + (tData.g || 0); data.isBlocking = true;
      step.dataset.bt = tData.building.toString();
    }
    type = 'tech'; step.dataset.type = 'tech';
  }

  let optionsHtml = '';
  if (type === 'tech') optionsHtml = Object.values(techsById).sort((a, b) => a.name.localeCompare(b.name)).map((t) => `<option value="${t.id}" ${String(data.id) === String(t.id) ? 'selected' : ''}>${t.name}</option>`).join('');
  else if (type === 'building') optionsHtml = Object.entries(buildings).sort(([, a], [, b]) => (a as BuildingData).name.localeCompare((b as BuildingData).name)).map(([id, b]) => `<option value="${id}" ${String(data.id) === String(id) ? 'selected' : ''}>${(b as BuildingData).name}</option>`).join('');

  const select = type === 'tech' || type === 'building' ? `<select class="step-select"><option value="">Custom...</option>${optionsHtml}</select>` : '';

  let bodyHtml = '';
  if (type === 'cost') {
    bodyHtml = `<div class="step-field"><label>Food</label><input type="number" class="step-f" value="${data.f || 0}" style="width:40px;"></div><div class="step-field"><label>Wood</label><input type="number" class="step-w" value="${data.w || 0}" style="width:40px;"></div><div class="step-field"><label>Gold</label><input type="number" class="step-g" value="${data.g || 0}" style="width:40px;"></div>`;
  } else {
    bodyHtml = `<div class="step-field"><label>Name</label><input type="text" class="step-name" value="${data.name || ''}" style="width:100px;"></div><div class="step-field"><label>Delay</label><input type="number" class="step-delay" value="${data.delay || 0}" style="width:45px;"></div><div class="step-field"><label>x</label><input type="number" class="step-count" value="${data.count || 1}" style="width:35px;"></div><div class="step-field"><label>Cost</label><input type="number" class="step-cost" value="${data.cost || 0}" style="width:45px;"></div><div class="step-field"><label>Block</label><input type="checkbox" class="step-blocking" ${data.isBlocking ? 'checked' : ''}></div><div class="step-field"><label>Value</label><input type="number" class="step-value" value="${data.value || 0}" style="width:40px;"></div>${type === 'production' ? `<div class="step-field"><label>Speed</label><input type="number" class="step-train" value="${data.train || 30}" style="width:40px;"></div>` : ''}`;
  }

  step.innerHTML = `<div class="step-header"><div class="step-drag-handle">::</div><span class="timeline-step-label">${type}</span><button class="remove-step-btn">&times;</button></div><div class="step-body">${select} ${bodyHtml}</div>`;

  const updateFromSelect = () => {
    const sel = step.querySelector('.step-select') as HTMLSelectElement;
    if (!sel) return;
    const val = sel.value;
    if (val) {
      if (type === 'tech') {
        const item = techsById[parseInt(val)];
        if (item) {
          (step.querySelector('.step-name') as HTMLInputElement).value = item.name;
          (step.querySelector('.step-delay') as HTMLInputElement).value = String(item.time || 0);
          (step.querySelector('.step-cost') as HTMLInputElement).value = String((item.f || 0) + (item.w || 0) + (item.g || 0));
          (step.querySelector('.step-blocking') as HTMLInputElement).checked = true;
          step.dataset.bt = item.building.toString();
        }
      } else if (type === 'building') {
        const item = (buildings as Record<string, BuildingData>)[val];
        if (item) {
          (step.querySelector('.step-name') as HTMLInputElement).value = item.name;
          (step.querySelector('.step-delay') as HTMLInputElement).value = String(item.time || 0);
          (step.querySelector('.step-cost') as HTMLInputElement).value = String((item.f || 0) + (item.w || 0) + (item.g || 0) + (item.s || 0));
          (step.querySelector('.step-value') as HTMLInputElement).value = '1';
        }
      }
    }
    onInputChange(true);
  };

  if (select) step.querySelector('.step-select')?.addEventListener('change', updateFromSelect);
  step.querySelector('.remove-step-btn')?.addEventListener('click', () => { step.remove(); onInputChange(true); });
  step.querySelectorAll('input, select').forEach(el => el.addEventListener('change', () => onInputChange(true)));
  timeline.appendChild(step);
}

function renderBonusList(list: HTMLElement, items: [string, any][], army: 'a' | 'b') {
  list.innerHTML = '';
  if (items.length > 0) list.classList.remove('hidden'); else list.classList.add('hidden');
  items.forEach(([id, b]) => {
    const item = document.createElement('div');
    item.className = 'preset-item';
    item.textContent = b.name;
    item.addEventListener('click', () => {
      addBonus(army, id);
      list.classList.add('hidden');
      const searchInput = document.querySelector(`.bonus-search[data-army="${army}"]`) as HTMLInputElement;
      if (searchInput) searchInput.value = '';
    });
    list.appendChild(item);
  });
}

function addBonus(army: 'a' | 'b', id: string, effectsState: boolean[] | null = null) {
  const b = techsById[parseInt(id)] || (bonuses as any)[id];
  if (!b) return;
  const container = document.getElementById(`${army}-applied-bonuses`);
  if (!container || container.querySelector(`.applied-bonus[data-id="${id}"]`)) return;

  const div = document.createElement('div');
  div.className = 'applied-bonus';
  div.dataset.id = id;
  let html = '';
  const effs = b.effects || [];
  const seenLabels = new Set<string>();
  const uData = getArmyData(army);
  effs.forEach((e: any, i: number) => {
    const checked = effectsState ? effectsState[i] : true;
    const label = getEffectLabel(e);
    if (!label) return; // Skip internal/empty labels entirely

    const applies = uData ? shouldApplyEffect(e, uData, effs) : true;

    if (!applies) {
      html += `<div class="applied-bonus-effect hidden"><input type="checkbox" data-effect-index="${i}" ${effectsState ? (checked ? 'checked' : '') : ''}><label>${label}</label></div>`;
    } else if (seenLabels.has(label)) {
      html += `<div class="applied-bonus-effect hidden"><input type="checkbox" data-effect-index="${i}" ${effectsState ? (checked ? 'checked' : '') : ''}><label>${label}</label></div>`;
    } else {
      html += `<div class="applied-bonus-effect"><input type="checkbox" data-effect-index="${i}" ${checked ? 'checked' : ''}><label>${label}</label></div>`;
      seenLabels.add(label);
    }
  });

  div.innerHTML = `<div style="display:flex; flex-direction:column; gap:2px;"><span class="applied-bonus-name">${b.name}</span><div style="display:flex; gap:10px;">${html}</div></div><button class="remove-bonus-btn">&times;</button>`;
  div.querySelector('.remove-bonus-btn')?.addEventListener('click', () => { div.remove(); onInputChange(true); });
  div.querySelectorAll('input').forEach(el => el.addEventListener('change', () => onInputChange(true)));
  container.appendChild(div);
  onInputChange(true);
}

function applyAge(army: 'a' | 'b', age: string) {
  const data = getArmyData(army);
  if (!data) return;
  const ageId = parseInt(age);
  const controls = document.querySelector(`.army-age-controls[data-army="${army}"]`);
  controls?.querySelectorAll('.age-btn').forEach((btn: any) => {
    if (parseInt(btn.dataset.age) === ageId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const civInput = document.querySelector(`.civ-search[data-army="${army}"]`) as HTMLInputElement;
  const civKey = civInput ? civInput.dataset.value : null;
  const availableTechs = civKey ? (civs as any)[civKey] || [] : [];

  const container = document.getElementById(`${army}-applied-bonuses`);
  if (container) container.innerHTML = '';

  if (ageId > 1) {
    const relevantTechs = Object.values(techsById).filter((t) => {
      // Filter by military buildings
      if (!COMBAT_BUILDINGS.includes(t.building)) return false;
      // Filter by civ availability
      if (civKey && !availableTechs.includes(t.id)) return false;
      // Filter by age
      if (t.age > ageId) return false;
      // Filter by relevance to the specific unit
      return shouldApplyTech(t, data);
    });
    relevantTechs.sort((a, b) => (a.age - b.age) || (a.id - b.id)).forEach((t) => addBonus(army, t.id.toString()));
  }
  onInputChange(true);
}

function loadPreset(army: 'a' | 'b', id: string) {
  const u = allUnits[id];
  if (!u) return;
  const input = document.querySelector(`.preset-search[data-army="${army}"]`) as HTMLInputElement;
  input.value = u.name; input.dataset.value = id;
  const nameEl = document.getElementById(`${army}-name`) as HTMLInputElement;
  if (nameEl) nameEl.value = u.name;

  ['hp', 'matk', 'patk', 'marm', 'parm', 'range', 'food', 'wood', 'gold', 'reload'].forEach((k) => {
    const el = document.getElementById(`${army}-${k}`) as HTMLInputElement;
    if (el) {
      // @ts-ignore
      el.value = u[k === 'food' ? 'f' : k === 'wood' ? 'w' : k === 'gold' ? 'g' : k];
    }
  });

  const timeline = document.getElementById(`p${army}-timeline`);
  if (timeline) {
    timeline.innerHTML = '';
    addProductionStep(army, 'production', { name: 'Initial Production', value: 1, train: u.trainTime });
  }
  onInputChange(false);
}

function loadScenario(id: string) {
  const s = (scenarios as any)[id];
  if (!s) return;
  activeScenario = id;
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) descEl.value = s.desc || '';

  (['a', 'b'] as const).forEach((army) => {
    const config = s[army];
    const tl = document.getElementById(`p${army}-timeline`);
    if (tl) tl.innerHTML = '';
    const bn = document.getElementById(`${army}-applied-bonuses`);
    if (bn) bn.innerHTML = '';

    if (config.preset) loadPreset(army, config.preset);
    const smap: any = { as: 'atk-speed', abr: 'bonus-red', bbn: 'bonus', da: 'disc-all', df: 'disc-f', dw: 'disc-w', dg: 'disc-g' };
    for (const [key, val] of Object.entries(config)) {
      const el = document.getElementById(`${army}-${smap[key] || key}`) as HTMLInputElement;
      if (el) el.value = val as string;
      if (key === 'name') {
        const h = document.getElementById(`name-header-${army}`);
        if (h) h.textContent = val as string;
      }
    }

    if (config['train-time'] || config.buildings || config.delay || config.tech) {
      if (config['train-time'] || config.buildings) addProductionStep(army, 'production', { name: 'Initial Production', value: config.buildings || 1, train: config['train-time'] || 30 });
      if (config.delay) addProductionStep(army, 'building', { name: 'Initial Delay', delay: config.delay, value: 0 });
      if (config.tech) addProductionStep(army, 'tech', { name: 'Initial Research', delay: config.tech, isBlocking: true });
    }
  });
  onInputChange(false);
}

/**
 * Show a temporary toast notification
 */
function showToast(message: string, duration: number = 2000) {
  const existing = document.querySelector('.share-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

function exportScenario() {
  const s = getState();
  navigator.clipboard.writeText(JSON.stringify(s, null, 2)).then(() => {
    const btn = document.getElementById('export-btn') as HTMLElement;
    const original = btn.textContent;
    btn.textContent = 'Copied!'; btn.style.color = 'var(--color-pos)';
    setTimeout(() => { btn.textContent = original; btn.style.color = ''; }, 2000);
  });
}

async function syncURL(forceShorten: boolean = false): Promise<string | null> {
  const s = getState();
  const p = new URLSearchParams();
  if (activeScenario) p.set('scenario', activeScenario);
  const json = JSON.stringify(s);

  // Only use KV when explicitly forced (share button)
  if (forceShorten) {
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: s }),
      });

      if (response.ok) {
        const result = await response.json();
        const shortUrl = window.location.origin + window.location.pathname + '#' + result.id;
        return shortUrl;
      }
      
      // Handle specific error cases
      if (response.status === 429) {
        console.warn('KV write rate limit exceeded');
        showToast('Share limit reached, using long URL', 3000);
      } else if (response.status === 507) {
        console.warn('KV storage limit exceeded');
        showToast('Storage limit reached, using long URL', 3000);
      } else {
        console.warn('KV error:', response.status);
        showToast('Creating long URL instead', 2500);
      }
    } catch (e) {
      console.error('Failed to shorten URL:', e);
      showToast('Creating long URL instead', 2500);
    }
    
    // Fallback: return long URL
    const encoded = p.toString() + (p.toString() ? '&' : '') + 'data=' + encodeURIComponent(json);
    const clean = encoded.replace(/%22/g, '"').replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/%3A/g, ':').replace(/%2C/g, ',').replace(/%5B/g, '[').replace(/%5D/g, ']');
    return window.location.origin + window.location.pathname + '?' + clean;
  }
  
  // Normal changes: use long URL
  const encoded = p.toString() + (p.toString() ? '&' : '') + 'data=' + encodeURIComponent(json);
  const clean = encoded.replace(/%22/g, '"').replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/%3A/g, ':').replace(/%2C/g, ',').replace(/%5B/g, '[').replace(/%5D/g, ']');
  history.replaceState(null, '', '?' + clean);
  return null;
}

function getState(): SimulationState {
  const s: any = { a: {}, b: {}, desc: '' };
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) s.desc = descEl.value;

  (['a', 'b'] as const).forEach((army) => {
    for (const [field, key] of Object.entries(fieldMap)) {
      const id = `${army}-${field}`;
      const el = document.getElementById(id) as HTMLInputElement;
      if (el && el.value !== defaults[id]) s[army][key] = el.value;
    }
    const pEl = document.querySelector(`.preset-search[data-army="${army}"]`) as HTMLElement;
    if (pEl && pEl.dataset.value) s[army].ps = pEl.dataset.value;
    const cEl = document.querySelector(`.civ-search[data-army="${army}"]`) as HTMLElement;
    if (cEl && cEl.dataset.value) s[army].cv = cEl.dataset.value;

    const timeline = Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el: any) => ({
      t: el.dataset.type, n: el.querySelector('.step-name')?.value, d: el.querySelector('.step-delay')?.value,
      c: el.querySelector('.step-count')?.value, co: el.querySelector('.step-cost')?.value,
      b: el.querySelector('.step-blocking')?.checked, v: el.querySelector('.step-value')?.value,
      i: el.querySelector('.step-select')?.value, tr: el.querySelector('.step-train')?.value,
      f: el.querySelector('.step-f')?.value, w: el.querySelector('.step-w')?.value, g: el.querySelector('.step-g')?.value,
      bt: el.dataset.bt
    }));
    if (timeline.length > 0) s[army].tl = timeline;

    const contEl = document.getElementById(`${army}-prod-cont`) as HTMLInputElement;
    if (contEl) s[army].cont = contEl.checked;

    const bData = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map((el: any) => ({
      i: el.dataset.id, e: Array.from(el.querySelectorAll('input')).map((cb: any) => cb.checked)
    }));
    if (bData.length > 0) s[army].bn = bData;

    const startVillsEl = document.getElementById(`${army}-prod-start-vills`) as HTMLInputElement;
    if (startVillsEl) s[army].sv = parseInt(startVillsEl.value) || 3;

    const ageBtn = document.querySelector(`.army-age-controls[data-army="${army}"] .age-btn.active`) as HTMLElement;
    if (ageBtn) s[army].age = ageBtn.dataset.age;
  });
  return s;
}

async function loadState() {
  // Check for short ID in hash first
  const hash = window.location.hash;
  if (hash && hash.length > 1 && !hash.startsWith('?')) {
    const shortId = hash.substring(1);
    // Only treat as short ID if it looks like one (6-7 alphanumeric chars)
    if (/^[a-zA-Z0-9]{6,8}$/.test(shortId)) {
      try {
        const response = await fetch(`/api/resolve/${shortId}`);
        if (response.ok) {
          const result = await response.json();
          applyState(result.data, result.expiresAt);
          const daysUntilExpiry = Math.round((result.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry > 7) {
            showToast(`Matchup loaded! Expires in ${daysUntilExpiry} days`, 3000);
          } else if (daysUntilExpiry > 0) {
            showToast(`Matchup loaded! Expires in ${daysUntilExpiry} days (view soon!)`, 4000);
          }
          return;
        } else if (response.status === 404) {
          console.warn('Matchup not found or expired');
          showToast('This matchup has expired or was not found', 4000);
        }
      } catch (e) {
        console.error('Failed to load matchup from KV:', e);
        showToast('Failed to load shared matchup', 3000);
      }
    }
  }

  // Fall back to query parameter loading
  const p = new URLSearchParams(window.location.search);
  const dataParam = p.get('data');
  if (dataParam) {
    try {
      const state = JSON.parse(dataParam);
      applyState(state);
      return;
    } catch (e) { console.error('Failed to load state:', e); }
  }
  if (p.has('scenario')) loadScenario(p.get('scenario')!);
  updateCharts();
}

function applyState(state: any, expiresAt?: number) {
  if (state.desc) {
    const el = document.getElementById('scenario-desc') as HTMLTextAreaElement;
    if (el) el.value = state.desc;
  }
  (['a', 'b'] as const).forEach((army) => {
    const armyState = state[army];
    if (!armyState) return;
    if (armyState.ps) loadPreset(army, armyState.ps);
    if (armyState.cv) {
      const el = document.querySelector(`.civ-search[data-army="${army}"]`) as HTMLInputElement;
      if (el) { el.value = armyState.cv; el.dataset.value = armyState.cv; }
    }
    for (const [field, key] of Object.entries(fieldMap)) {
      if (armyState[key] !== undefined) {
        const el = document.getElementById(`${army}-${field}`) as HTMLInputElement;
        if (el) el.value = armyState[key];
      }
    }
    if (armyState.tl) {
      const container = document.getElementById(`p${army}-timeline`);
      if (container) {
        container.innerHTML = '';
        armyState.tl.forEach((step: any) => addProductionStep(army, step.t, {
          type: step.t, name: step.n, delay: step.d, count: step.c, cost: step.co,
          isBlocking: step.b, value: step.v, id: step.i, train: step.tr, f: step.f, w: step.w, g: step.g,
          bt: step.bt
        }));
      }
    }
    if (armyState.bn) {
      const container = document.getElementById(`${army}-applied-bonuses`);
      if (container) {
        container.innerHTML = '';
        armyState.bn.forEach((b: any) => addBonus(army, b.i, b.e));
      }
    }
    if (armyState.cont !== undefined) {
      const el = document.getElementById(`${army}-prod-cont`) as HTMLInputElement;
      if (el) el.checked = armyState.cont;
    }
    if (armyState.sv !== undefined) {
      const el = document.getElementById(`${army}-prod-start-vills`) as HTMLInputElement;
      if (el) el.value = armyState.sv;
    }
    if (armyState.age !== undefined) {
      const parent = document.querySelector(`.army-age-controls[data-army="${army}"]`);
      if (parent) {
        parent.querySelectorAll('.age-btn').forEach((btn: any) => {
          if (btn.dataset.age === String(armyState.age)) btn.classList.add('active');
          else btn.classList.remove('active');
        });
      }
    }
  });
  updateCharts();
}

window.onload = async () => {
  allUnits = { ...units, ...presets };
  Object.values(techs).forEach(t => techsById[t.id] = t);
  document.querySelectorAll('input, select, textarea').forEach((t: any) => { if (t.id) defaults[t.id] = t.value; });

  // Load rate limit state from localStorage
  loadRateLimitState();

  // Load state from URL (hash or query params)
  await loadState();

  // Render featured scenarios
  const scnContainer = document.getElementById('featured-scenarios-container');
  if (scnContainer) {
    (featuredScenarios as string[]).forEach(id => {
      const s = (scenarios as any)[id]; if (!s) return;
      const btn = document.createElement('button'); btn.className = 'scenario-btn'; btn.textContent = s.name;
      btn.addEventListener('click', () => loadScenario(id)); scnContainer.appendChild(btn);
    });
  }

  const scnSearch = document.querySelector('.scenario-search') as HTMLInputElement;
  const scnList = document.querySelector('.scenario-list') as HTMLElement;
  if (scnSearch && scnList) {
    const render = () => {
      const term = scnSearch.value.toLowerCase(); scnList.innerHTML = '';
      Object.entries(scenarios as any).forEach(([id, s]: [string, any]) => {
        if (s.name.toLowerCase().includes(term)) {
          const item = document.createElement('div'); item.className = 'scenario-item'; item.textContent = s.name;
          item.addEventListener('click', () => { loadScenario(id); scnList.classList.add('hidden'); }); scnList.appendChild(item);
        }
      });
      if (scnList.children.length > 0) scnList.classList.remove('hidden'); else scnList.classList.add('hidden');
    };
    scnSearch.addEventListener('click', render); scnSearch.addEventListener('keyup', render);
    scnSearch.addEventListener('blur', () => setTimeout(() => scnList.classList.add('hidden'), 200));
  }

  document.getElementById('scenario-desc')?.addEventListener('input', () => onInputChange(true));

  document.querySelectorAll('.preset-search').forEach((input: any) => {
    const render = () => {
      const army = input.dataset.army, list = document.getElementById(`${army}-preset-list`) as HTMLElement, term = input.value.toLowerCase();
      list.innerHTML = '';
      Object.entries(allUnits).forEach(([id, u]) => {
        if (u.name.toLowerCase().includes(term)) {
          const item = document.createElement('div'); item.className = 'preset-item'; item.textContent = u.name;
          item.addEventListener('click', () => { loadPreset(army, id); list.classList.add('hidden'); }); list.appendChild(item);
        }
      });
      if (list.children.length > 0) list.classList.remove('hidden'); else list.classList.add('hidden');
    };
    input.addEventListener('click', render); input.addEventListener('keyup', render);
    input.addEventListener('blur', () => setTimeout(() => (document.getElementById(`${input.dataset.army}-preset-list`) as HTMLElement).classList.add('hidden'), 200));
  });

  document.querySelectorAll('.civ-search').forEach((input: any) => {
    const render = () => {
      const army = input.dataset.army, list = document.getElementById(`${army}-civ-list`) as HTMLElement, term = input.value.toLowerCase();
      list.innerHTML = '';
      Object.keys(civs).forEach(c => {
        if (c.toLowerCase().includes(term)) {
          const item = document.createElement('div'); item.className = 'preset-item'; item.textContent = c;
          item.addEventListener('click', () => { input.value = c; input.dataset.value = c; list.classList.add('hidden'); onInputChange(true); }); list.appendChild(item);
        }
      });
      if (list.children.length > 0) list.classList.remove('hidden'); else list.classList.add('hidden');
    };
    input.addEventListener('click', render); input.addEventListener('keyup', render);
    input.addEventListener('blur', () => setTimeout(() => (document.getElementById(`${input.dataset.army}-civ-list`) as HTMLElement).classList.add('hidden'), 200));
  });

  document.querySelectorAll('.age-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const controls = btn.closest('.army-age-controls');
    if (controls) applyAge(controls.dataset.army, btn.dataset.age);
  }));

  document.querySelectorAll('.add-step-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const army = btn.dataset.army, type = btn.dataset.type;
    const data: any = {};
    if (type === 'age') data.ageVal = parseInt(btn.dataset.val);
    addProductionStep(army, type, data);
  }));

  document.querySelectorAll('.step-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const el = document.getElementById(btn.dataset.id) as HTMLInputElement;
    if (el) { el.value = Math.max(0, (parseFloat(el.value) || 0) + parseFloat(btn.dataset.val)).toFixed(btn.dataset.id.includes('reload') ? 1 : 0); onInputChange(true); }
  }));

  document.querySelectorAll('.toggle-stats-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const t = document.getElementById(btn.dataset.target);
    if (t) { t.classList.toggle('collapsed'); btn.textContent = t.classList.contains('collapsed') ? 'Edit' : 'Hide Stats'; }
  }));

  document.querySelectorAll('.bonus-search').forEach((input: any) => {
    input.addEventListener('keyup', () => {
      const army = input.dataset.army, list = document.querySelector(`.bonus-list[data-army="${army}"]`) as HTMLElement, term = input.value.toLowerCase();
      const allPossible = { ...techs, ...bonuses };
      renderBonusList(list, Object.entries(allPossible).filter(([, b]) => (b as any).name && (b as any).name.toLowerCase().includes(term)) as [string, any][], army);
    });
    input.addEventListener('blur', () => setTimeout(() => (document.querySelector(`.bonus-list[data-army="${input.dataset.army}"]`) as HTMLElement)?.classList.add('hidden'), 200));
  });

  document.getElementById('export-btn')?.addEventListener('click', exportScenario);

  document.getElementById('share-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('share-btn') as HTMLElement;
    const original = btn.textContent;

    // Check rate limits first
    const rateCheck = checkShareRateLimit();
    if (!rateCheck.allowed) {
      // Rate limited - copy long URL instead
      const s = getState();
      const p = new URLSearchParams();
      if (activeScenario) p.set('scenario', activeScenario);
      const json = JSON.stringify(s);
      const encoded = p.toString() + (p.toString() ? '&' : '') + 'data=' + encodeURIComponent(json);
      const clean = encoded.replace(/%22/g, '"').replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/%3A/g, ':').replace(/%2C/g, ',').replace(/%5B/g, '[').replace(/%5D/g, ']');
      const longUrl = window.location.origin + window.location.pathname + '?' + clean;

      navigator.clipboard.writeText(longUrl).then(() => {
        const waitSeconds = rateCheck.retryAfter ? `${Math.ceil(rateCheck.retryAfter)}s` : 'later';
        showToast('Rate limit reached. Try again in ' + waitSeconds + '. Copied long URL.', 5000);
      });
      return;
    }

    // Show loading state
    btn.classList.add('loading');
    btn.textContent = 'Creating Link...';

    try {
      // Create short URL without changing current page
      const shortUrl = await syncURL(true);

      if (shortUrl) {
        // Record successful share for rate limiting
        recordShare();
      }

      const urlToCopy = shortUrl || window.location.href;

      navigator.clipboard.writeText(urlToCopy).then(() => {
        showToast('Link copied to clipboard!', 2500);
        btn.classList.remove('loading');
        btn.textContent = original;
        btn.style.color = 'var(--color-pos)';
        setTimeout(() => { btn.style.color = ''; }, 2000);
      }).catch(() => {
        showToast('Failed to copy link', 2500);
        btn.classList.remove('loading');
        btn.textContent = original;
        btn.style.color = 'var(--color-neg)';
        setTimeout(() => { btn.style.color = ''; }, 2000);
      });
    } catch (e) {
      showToast('Failed to create share link', 3000);
      btn.classList.remove('loading');
      btn.textContent = original;
      btn.style.color = 'var(--color-neg)';
      setTimeout(() => { btn.style.color = ''; }, 2000);
    }
  });

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => onInputChange(true));
    el.addEventListener('keyup', () => onInputChange(true));
  });

  document.querySelectorAll('.count-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const el = document.getElementById(`${btn.dataset.army}-count`) as HTMLInputElement;
    if (el) { el.value = String(Math.max(1, (parseInt(el.value) || 1) + parseInt(btn.dataset.delta))); onInputChange(true); }
  }));

  // Engagement/Micro slider live display
  (['a', 'b'] as const).forEach((army) => {
    const engSlider = document.getElementById(`${army}-eng`) as HTMLInputElement;
    const engVal = document.getElementById(`${army}-eng-val`);
    if (engSlider && engVal) {
      engVal.textContent = engSlider.value + '%';
      engSlider.addEventListener('input', () => { engVal.textContent = engSlider.value + '%'; });
    }

    const microSlider = document.getElementById(`${army}-groups-slider`) as HTMLInputElement;
    const microVal = document.getElementById(`${army}-micro-val`);
    const microLabels: Record<string, string> = { '1': 'Focus Fire', '2': 'High', '3': 'Medium', '4': 'Low', '5': 'Perfect' };
    if (microSlider && microVal) {
      microVal.textContent = microLabels[microSlider.value] || microSlider.value;
      microSlider.addEventListener('input', () => { microVal.textContent = microLabels[microSlider.value] || microSlider.value; });
    }

    // @ts-ignore
    new Sortable(document.getElementById(`p${army}-timeline`), {
      animation: 150, handle: '.step-drag-handle', onEnd: () => onInputChange(true)
    });
  });

  loadState();
};

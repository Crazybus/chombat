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
let isLoadingScenario = false; // Flag to prevent clearing scenario during load

// Rate limiting for share functionality
const SHARE_RATE_LIMIT = {
  perHour: 10,       // Allow 10 shares per hour (sliding window)
  lastShareTimes: [] as number[], // Track timestamps of recent shares
};

/**
 * Check if share action is rate limited
 * Returns { allowed: boolean, reason?: string, retryAfter?: number }
 * 
 * Rate limiting is disabled for localhost development.
 * Uses sliding window: max 10 shares per hour.
 */
function checkShareRateLimit(): { allowed: boolean; reason?: string; retryAfter?: number } {
  // Disable rate limiting for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return { allowed: true };
  }
  
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  // Remove shares older than 1 hour (sliding window)
  SHARE_RATE_LIMIT.lastShareTimes = SHARE_RATE_LIMIT.lastShareTimes.filter(
    time => now - time < hourMs
  );
  
  // Check if we've exceeded the hourly limit
  if (SHARE_RATE_LIMIT.lastShareTimes.length >= SHARE_RATE_LIMIT.perHour) {
    const oldestShare = SHARE_RATE_LIMIT.lastShareTimes[0];
    const retryAfter = Math.ceil((hourMs - (now - oldestShare)) / (60 * 1000)); // minutes
    return {
      allowed: false,
      reason: `Hourly share limit reached (${SHARE_RATE_LIMIT.perHour}/hour). Try again in ${retryAfter} minute(s).`,
      retryAfter: retryAfter * 60, // return in seconds
    };
  }

  return { allowed: true };
}

/**
 * Record a successful share action
 */
function recordShare() {
  const now = Date.now();
  SHARE_RATE_LIMIT.lastShareTimes.push(now);
  
  // Persist to localStorage
  localStorage.setItem('shareRateLimit', JSON.stringify({
    lastShareTimes: SHARE_RATE_LIMIT.lastShareTimes,
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
      SHARE_RATE_LIMIT.lastShareTimes = parsed.lastShareTimes || [];
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
  if (manualChange && !isLoadingScenario) {
    // Clear scenario when user makes changes (custom scenario)
    if (activeScenario) {
      activeScenario = null;
      updateFeaturedScenarioButtons();
      history.replaceState(null, '', window.location.pathname);
    }
  }

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
  // Get unit ID from the name header's dataset
  const nameHeader = document.getElementById(`name-header-${army}`);
  const id = nameHeader ? nameHeader.dataset.value : null;
  
  // If we have a preset ID, use it
  if (id && allUnits[id]) {
    return { ...allUnits[id], id: id };
  }
  
  // Otherwise, try to find by unit name from the header
  const unitName = nameHeader ? nameHeader.textContent : '';
  if (unitName) {
    // Search for unit by name
    const found = Object.entries(allUnits).find(([, u]) => u.name === unitName);
    if (found) {
      console.log(`Found unit "${unitName}" by name: ${found[0]}`);
      return { ...found[1], id: found[0] };
    }
  }
  
  // Last resort: try the hidden name input
  const nameInput = document.getElementById(`${army}-name`) as HTMLInputElement;
  if (nameInput && nameInput.value) {
    const found = Object.entries(allUnits).find(([, u]) => u.name === nameInput.value);
    if (found) {
      console.log(`Found unit "${nameInput.value}" by input: ${found[0]}`);
      return { ...found[1], id: found[0] };
    }
  }
  
  console.warn(`Could not find unit data for army ${army} (name="${unitName}")`);
  return null;
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
  const summaryEl = document.getElementById('comparison-summary');
  if (!el || !summaryEl) return;

  const uA = new Unit(simRef.dataA);
  const uB = new Unit(simRef.dataB);
  const baseA = allUnits[simRef.dataA.id];
  const baseB = allUnits[simRef.dataB.id];
  const nameA = (cA as any).nm || dA.name;
  const nameB = (cB as any).nm || dB.name;
  
  // Update table headers with actual unit names
  const headerA = document.getElementById('comp-name-a');
  const headerB = document.getElementById('comp-name-b');
  if (headerA) headerA.textContent = nameA;
  if (headerB) headerB.textContent = nameB;

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
    
    // Calculate bonus damage against defender's class
    let bonus = 0;
    const defClass = String(def.class);
    if (atk.bonuses && atk.bonuses[defClass]) {
      bonus = atk.bonuses[defClass];
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

  // Calculate winner and remaining HP
  const hitsToKillA = Math.ceil(uB.hpPerUnit / nA.net);
  const hitsToKillB = Math.ceil(uA.hpPerUnit / nB.net);
  const timeToKillA = hitsToKillA * uA.reload;
  const timeToKillB = hitsToKillB * uB.reload;
  
  // Calculate remaining HP for winner
  let winner = 'Draw';
  let winnerColor = 'var(--text-color)';
  let remainingInfo = '';
  
  if (timeToKillA < timeToKillB) {
    // Army A wins (kills faster)
    winner = nameA;
    winnerColor = getThemeColor('--army-a-color');
    // Army A only takes damage for the time it takes to kill Army B
    const shotsBCanFire = Math.ceil(timeToKillA / uB.reload);
    const damageTaken = shotsBCanFire * nB.net;
    const remainingHp = Math.max(0, uA.hpPerUnit - damageTaken);
    remainingInfo = `${remainingHp.toFixed(0)} HP remaining`;
  } else if (timeToKillB < timeToKillA) {
    // Army B wins (kills faster)
    winner = nameB;
    winnerColor = getThemeColor('--army-b-color');
    // Army B only takes damage for the time it takes to kill Army A
    const shotsACanFire = Math.ceil(timeToKillB / uA.reload);
    const damageTaken = shotsACanFire * nA.net;
    const remainingHp = Math.max(0, uB.hpPerUnit - damageTaken);
    remainingInfo = `${remainingHp.toFixed(0)} HP remaining`;
  }

  // Update summary above table (same format as battle sim)
  if (winner !== 'Draw') {
    summaryEl.innerHTML = `<div style="text-align: center; padding: 15px; background: var(--panel-bg-alt); border-radius: 4px; margin-bottom: 15px;">
      <span style="font-size: 1.3rem;">Winner: <span style="color: ${winnerColor}; font-weight: bold;">${winner}</span> with ${remainingInfo}</span>
    </div>`;
  } else {
    summaryEl.innerHTML = `<div style="text-align: center; padding: 15px; background: var(--panel-bg-alt); border-radius: 4px; margin-bottom: 15px;">
      <span style="font-size: 1.3rem;">Winner: <span style="color: var(--text-color); font-weight: bold;">Even fight</span></span>
    </div>`;
  }

  const rows = [
    { label: 'HP (base + upgrades)', a: formatWithBase(uA.hpPerUnit, baseA?.hp || uA.hpPerUnit), b: formatWithBase(uB.hpPerUnit, baseB?.hp || uB.hpPerUnit) },
    { label: 'Attack (base + upgrades)', a: formatWithBase(nA.base, getBaseAtk(uA, baseA)), b: formatWithBase(nB.base, getBaseAtk(uB, baseB)) },
    { label: 'Bonus Dmg', a: nA.bonus.toFixed(0), b: nB.bonus.toFixed(0) },
    { label: 'Armor', a: formatWithBase(nA.arm, getBaseArm(uA, baseA)), b: formatWithBase(nB.arm, getBaseArm(uB, baseB)), inv: true },
    { label: `Damage Per Hit`, a: `${nA.net.toFixed(0)} (${nA.base.toFixed(0)} - ${getBaseArm(uB, baseB).toFixed(0)} + ${nA.bonus.toFixed(0)})`, b: `${nB.net.toFixed(0)} (${nB.base.toFixed(0)} - ${getBaseArm(uA, baseA).toFixed(0)} + ${nB.bonus.toFixed(0)})` },
    { label: 'Hits to Kill', a: Math.ceil(uB.hpPerUnit / nA.net).toString(), b: Math.ceil(uA.hpPerUnit / nB.net).toString(), inv: true },
    { label: 'Time to Kill', a: timeToKillA.toFixed(1) + 's', b: timeToKillB.toFixed(1) + 's', inv: true },
    { label: 'Attack Reload Time', a: uA.reload.toFixed(2), b: uB.reload.toFixed(2), inv: true },
    { label: 'Damage Per Second', a: (nA.net / uA.reload).toFixed(2), b: (nB.net / uB.reload).toFixed(2) },
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

  // Get unit costs for value calculation
  const unitA = Object.values(allUnits).find(u => u.name === nameA);
  const unitB = Object.values(allUnits).find(u => u.name === nameB);
  const costA = unitA ? (unitA.f + unitA.w + unitA.g) : 0;
  const costB = unitB ? (unitB.f + unitB.w + unitB.g) : 0;

  renderLineChart('countChart', [{ label: nameA, data: history.map(h => h.countA), borderColor: colorA }, { label: nameB, data: history.map(h => h.countB), borderColor: colorB }]);
  renderLineChart('hpChart', [{ label: nameA, data: history.map(h => h.hpA), borderColor: colorA }, { label: nameB, data: history.map(h => h.hpB), borderColor: colorB }]);
  // Resource Value = unit count × resource cost
  renderLineChart('valueChart', [{ label: nameA, data: history.map(h => h.countA * costA), borderColor: colorA }, { label: nameB, data: history.map(h => h.countB * costB), borderColor: colorB }]);
  // Damage Per Hit = remaining units × damage per hit to enemy
  renderLineChart('dpsChart', [{ label: nameA, data: history.map(h => h.dpsA), borderColor: colorA }, { label: nameB, data: history.map(h => h.dpsB), borderColor: colorB }]);
}

function updateProductionAnalysis(dA: UnitData, dB: UnitData, cA: ArmyState, cB: ArmyState) {
  const searchMax = 1800, step = 10;
  const getTimeline = (army: 'a' | 'b'): TimelineStep[] => Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el: any) => ({
    t: el.dataset.type, n: el.querySelector('.step-name')?.value,
    d: parseFloat(el.querySelector('.step-delay')?.value) || 0,
    c: parseInt(el.querySelector('.step-count')?.value) || 1,
    co: parseFloat(el.querySelector('.step-cost')?.value) || 0,
    b: el.querySelector('.step-blocking')?.checked,
    prod: el.querySelector('.step-production')?.checked,
    tr: parseFloat(el.querySelector('.step-train')?.value) || 30,
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
        if ((prev < 0 && adv > 0) || (prev > 0 && adv < 0)) {
          // Save economy data for breakdown
          const economyA = resA.economyHistory[resA.economyHistory.length - 1];
          const economyB = resB.economyHistory[resB.economyHistory.length - 1];
          cross = { 
            time: t, 
            cA: resA.count, 
            cB: resB.count, 
            win: adv > 0 ? nameA : nameB,
            economyA: economyA,
            economyB: economyB
          };
        }
      }
    } else if (resA.count > 0) adv = 100; else if (resB.count > 0) adv = -100;
    data.advantage.push(adv);
  }

  renderProductionCharts(data, nameA, nameB);

  const report = document.getElementById('production-report-text');
  const eventLogContainer = document.querySelector('.event-log-container');
  if (report && eventLogContainer) {
    let msg = contact ? `<p>First units arrive at ${contact.time}s: <strong>${contact.cA} ${nameA}</strong> vs <strong>${contact.cB} ${nameB}</strong>.</p>` : '';
    if (cross) {
      const formatCost = (cost: number) => Math.round(cost).toLocaleString();
      const winnerUnits = cross.win === nameA ? cross.cA : cross.cB;
      const loserUnits = cross.win === nameA ? cross.cB : cross.cA;
      const winnerName = cross.win;
      const loserName = cross.win === nameA ? nameB : nameA;
      
      msg += `<p><span style="color:var(--accent-color); font-weight:bold;">Tide Turns at ${cross.time}s!</span></p>`;
      msg += `<p style="margin: 10px 0;">The <strong>${winnerName}</strong> player starts winning once they have massed <strong>${winnerUnits} ${winnerName}</strong> to beat the <strong>${loserUnits} ${loserName}</strong>.</p>`;
      
      // Resource investment breakdown table
      const winnerEconomy = cross.win === nameA ? cross.economyA : cross.economyB;
      const loserEconomy = cross.win === nameA ? cross.economyB : cross.economyA;
      
      msg += `<div style="margin: 15px 0;">`;
      msg += `<h4 style="color: var(--accent-color); margin-bottom: 10px;">Resource Investment at ${cross.time}s</h4>`;
      msg += `<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">`;
      msg += `<thead><tr style="background: var(--panel-bg-alt);">`;
      msg += `<th style="padding: 8px; text-align: left; border: 1px solid var(--border-dim);">Category</th>`;
      msg += `<th style="padding: 8px; text-align: right; border: 1px solid var(--border-dim); color: ${getThemeColor('--army-a-color')};">${winnerName}</th>`;
      msg += `<th style="padding: 8px; text-align: right; border: 1px solid var(--border-dim); color: ${getThemeColor('--army-b-color')};">${loserName}</th>`;
      msg += `</tr></thead>`;
      msg += `<tbody>`;
      msg += `<tr><td style="padding: 8px; border: 1px solid var(--border-dim);">Villagers</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(winnerEconomy?.spentOnVillagers || 0)}</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(loserEconomy?.spentOnVillagers || 0)}</td></tr>`;
      msg += `<tr><td style="padding: 8px; border: 1px solid var(--border-dim);">Units</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(winnerEconomy?.spentOnUnits || 0)}</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(loserEconomy?.spentOnUnits || 0)}</td></tr>`;
      msg += `<tr><td style="padding: 8px; border: 1px solid var(--border-dim);">Buildings</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(winnerEconomy?.spentOnBuildings || 0)}</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(loserEconomy?.spentOnBuildings || 0)}</td></tr>`;
      msg += `<tr><td style="padding: 8px; border: 1px solid var(--border-dim);">Technologies</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(winnerEconomy?.spentOnTechs || 0)}</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(loserEconomy?.spentOnTechs || 0)}</td></tr>`;
      msg += `<tr style="background: var(--panel-bg-alt); font-weight: bold;">`;
      msg += `<td style="padding: 8px; border: 1px solid var(--border-dim);">Total Investment</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(winnerEconomy?.spent || 0)}</td>`;
      msg += `<td style="padding: 8px; text-align: right; border: 1px solid var(--border-dim);">${formatCost(loserEconomy?.spent || 0)}</td></tr>`;
      msg += `</tbody></table>`;
      msg += `</div>`;
    } else {
      msg += `<p><strong>Dominance:</strong> ${data.advantage[data.advantage.length - 1] > 0 ? nameA : nameB} maintains the lead.</p>`;
    }
    report.innerHTML = msg;

    // Build event log separately
    const resA_final = calculateCount(searchMax, tlA, baseCostA, contA);
    const resB_final = calculateCount(searchMax, tlB, baseCostB, contB);
    const combinedEvents = [
      ...resA_final.events.map(e => ({ ...e, army: 'A', color: getThemeColor('--army-a-color') })),
      ...resB_final.events.map(e => ({ ...e, army: 'B', color: getThemeColor('--army-b-color') }))
    ].filter(e => e.time > 0).sort((a, b) => a.time - b.time);

    if (combinedEvents.length > 0) {
      let eventHtml = '';
      combinedEvents.forEach(e => {
        eventHtml += `<div class="event-row"><span class="event-time">${e.time}s</span> <span style="color:${e.color}; font-weight:bold">[${e.army}]</span> ${e.msg}</div>`;
      });
      eventLogContainer.innerHTML = eventHtml;
    } else {
      eventLogContainer.innerHTML = '<p style="color: var(--text-dim); font-size: 0.85rem;">No events recorded</p>';
    }
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
    bodyHtml = `<div class="step-field"><label>Name</label><input type="text" class="step-name" value="${data.name || ''}" style="width:100px;"></div><div class="step-field"><label>Delay</label><input type="number" class="step-delay" value="${data.delay || 0}" style="width:45px;"></div><div class="step-field"><label>x</label><input type="number" class="step-count" value="${data.count || 1}" style="width:35px;"></div><div class="step-field"><label>Cost</label><input type="number" class="step-cost" value="${data.cost || 0}" style="width:45px;"></div><div class="step-field"><label>Block</label><input type="checkbox" class="step-blocking" ${data.isBlocking ? 'checked' : ''}></div><div class="step-field"><label>Production</label><input type="checkbox" class="step-production" ${data.production ? 'checked' : ''}></div>${type === 'production' ? `<div class="step-field"><label>Speed</label><input type="number" class="step-train" value="${data.train || 30}" style="width:40px;"></div>` : ''}`;
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
  
  // Special case: Scout Cavalry gets +2 attack in Feudal Age+
  if (data.id === '448') {
    const matkEl = document.getElementById(`${army}-matk`) as HTMLInputElement;
    if (matkEl) {
      matkEl.value = ageId >= 2 ? '5' : '3';
    }
  }
  
  onInputChange(true);
}

function loadPreset(army: 'a' | 'b', id: string) {
  const u = allUnits[id];
  if (!u) return;
  
  // Update the unit name header
  const nameHeader = document.getElementById(`name-header-${army}`);
  if (nameHeader) {
    nameHeader.textContent = u.name;
    nameHeader.dataset.value = id;
  }
  
  const nameEl = document.getElementById(`${army}-name`) as HTMLInputElement;
  if (nameEl) nameEl.value = u.name;

  // Get current age to apply age-based adjustments
  const ageBtns = document.querySelectorAll(`.army-age-controls[data-army="${army}"] .age-btn.active`);
  const currentAge = ageBtns.length > 0 ? parseInt(ageBtns[0].dataset.age) : 1;

  ['hp', 'matk', 'patk', 'marm', 'parm', 'range', 'food', 'wood', 'gold', 'reload'].forEach((k) => {
    const el = document.getElementById(`${army}-${k}`) as HTMLInputElement;
    if (el) {
      // @ts-ignore
      let value = u[k === 'food' ? 'f' : k === 'wood' ? 'w' : k === 'gold' ? 'g' : k];
      
      // Special case: Scout Cavalry gets +2 attack in Feudal Age+
      if (id === '448' && k === 'matk' && currentAge >= 2) {
        value = 5; // Feudal Age+ Scout Cavalry has 5 attack
      }
      
      el.value = value;
    }
  });

  const timeline = document.getElementById(`p${army}-timeline`);
  if (timeline) {
    timeline.innerHTML = '';
    addProductionStep(army, 'production', { name: 'Initial Production', value: 1, train: u.trainTime });
  }
  onInputChange(false);
}

/**
 * Update featured scenario buttons to highlight active scenario
 */
function updateFeaturedScenarioButtons() {
  document.querySelectorAll('.scenario-btn').forEach((btn: any) => {
    if (btn.dataset.scenarioId === activeScenario) {
      btn.classList.add('active');
      btn.style.background = 'var(--accent-color)';
      btn.style.color = 'black';
    } else {
      btn.classList.remove('active');
      btn.style.background = '';
      btn.style.color = '';
    }
  });
}

function loadScenario(id: string) {
  isLoadingScenario = true; // Prevent clearing scenario during load
  
  const s = (scenarios as any)[id];
  console.log(`Loading scenario "${id}":`, s ? 'FOUND' : 'NOT FOUND');

  if (!s) {
    console.error(`Scenario "${id}" not found! Available:`, Object.keys(scenarios));
    showToast(`Scenario "${id}" not found!`, 3000);
    isLoadingScenario = false;
    return;
  }
  activeScenario = id;
  console.log(`Scenario "${id}" loaded successfully`);

  // Update URL with scenario (clean URL, no data)
  history.replaceState(null, '', '?scenario=' + id);

  // Update featured scenario buttons to highlight active one
  updateFeaturedScenarioButtons();

  // Update scenario name header
  const scenarioNameHeader = document.getElementById('scenario-name-header');
  if (scenarioNameHeader) {
    scenarioNameHeader.textContent = s.name || '';
    scenarioNameHeader.style.display = s.name ? 'block' : 'none';
    scenarioNameHeader.title = 'Click to edit scenario name';
    
    // Make scenario name editable on click
    scenarioNameHeader.onclick = () => {
      const currentName = scenarioNameHeader.textContent || '';
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentName;
      input.className = 'scenario-name-input';
      input.style.cssText = 'width: 100%; font-size: 1.3rem; font-weight: bold; text-align: center; padding: 10px; background: var(--panel-bg); color: var(--text-color); border: 2px solid var(--accent-color); border-radius: var(--border-radius);';
      
      scenarioNameHeader.innerHTML = '';
      scenarioNameHeader.appendChild(input);
      input.focus();
      input.select();
      
      const saveName = () => {
        const newName = input.value.trim() || currentName;
        scenarioNameHeader.textContent = newName;
        scenarioNameHeader.style.display = newName ? 'block' : 'none';

        // Update description if it matches the old name
        const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
        if (descEl && (descEl.value === currentName || !descEl.value)) {
          descEl.value = newName;
        }

        onInputChange(false); // Update charts and URL
      };
      
      input.addEventListener('blur', saveName);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          input.blur();
        } else if (e.key === 'Escape') {
          scenarioNameHeader.textContent = currentName;
          scenarioNameHeader.style.display = currentName ? 'block' : 'none';
        }
      });
    };
  }
  
  // Load description (or name if desc doesn't exist)
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) descEl.value = s.desc || s.name || '';

  (['a', 'b'] as const).forEach((army) => {
    const config = s[army];
    console.log(`Loading army ${army}:`, config ? 'OK' : 'MISSING');
    
    if (!config) {
      console.error(`Scenario "${id}" missing army ${army} config!`);
      return;
    }
    
    const tl = document.getElementById(`p${army}-timeline`);
    if (tl) {
      tl.innerHTML = '';
      console.log(`Cleared timeline for army ${army}`);
    }
    const bn = document.getElementById(`${army}-applied-bonuses`);
    if (bn) {
      bn.innerHTML = '';
      console.log(`Cleared bonuses for army ${army}`);
    }

    // Load preset if specified
    if (config.ps) {
      console.log(`Loading preset ${config.ps} for army ${army}`);
      loadPreset(army, config.ps);
    }

    // Apply config overrides
    const smap: any = {
      // Special mappings
      as: 'atk-speed', abr: 'bonus-red', bbn: 'bonus', da: 'disc-all', df: 'disc-f', dw: 'disc-w', dg: 'disc-g',
      // Stat mappings
      h: 'hp', am: 'matk', ap: 'patk', aa: 'marm', ar: 'parm', n: 'range', rl: 'reload',
      af: 'food', aw: 'wood', ag: 'gold',
      e: 'eng', mc: 'groups-slider'
    };
    for (const [key, val] of Object.entries(config)) {
      // Skip timeline and bonus fields - handled separately
      if (key === 'tl' || key === 'bn' || key === 'name') continue;

      const fieldId = smap[key] || key;
      const el = document.getElementById(`${army}-${fieldId}`) as HTMLInputElement;
      if (el) {
        el.value = val as string;
        console.log(`Set ${army}-${fieldId} = ${val}`);
      } else if (key === 'c') {
        // Count field - needs special handling
        const countEl = document.getElementById(`${army}-count`) as HTMLInputElement;
        if (countEl) {
          countEl.value = val as string;
          console.log(`Set count ${army} = ${val}`);
        } else {
          console.warn(`Could not find count element for ${army}`);
        }
      } else if (key === 'nm') {
        const h = document.getElementById(`name-header-${army}`);
        const nameInput = document.getElementById(`${army}-name`) as HTMLInputElement;
        if (h) {
          h.textContent = val as string;
          console.log(`Set name header ${army} = ${val}`);
        }
        if (nameInput) {
          nameInput.value = val as string;
          console.log(`Set name input ${army} = ${val}`);
        }
      } else if (key === 'cv') {
        const civEl = document.querySelector(`.civ-selector[data-army="${army}"]`) as HTMLElement;
        const civNameEl = document.getElementById(`${army}-civ-name`);
        if (civEl) civEl.dataset.value = val as string;
        if (civNameEl) civNameEl.textContent = val as string;
        console.log(`Set civ ${army} = ${val}`);
      } else if (key === 'age') {
        const ageBtns = document.querySelectorAll(`.army-age-controls[data-army="${army}"] .age-btn`);
        ageBtns.forEach((btn: any) => {
          btn.classList.toggle('active', parseInt(btn.dataset.age) === parseInt(val as string));
        });
        console.log(`Set age ${army} = ${val}`);
      } else {
        console.warn(`Could not find element for ${army}-${fieldId} (key=${key})`);
      }
    }

    // Load timeline steps
    if (config.tl && Array.isArray(config.tl)) {
      console.log(`Loading ${config.tl.length} timeline steps for army ${army}`);
      config.tl.forEach((step: any, idx: number) => {
        console.log(`  Step ${idx}: ${step.t} - ${step.n}`);
        addProductionStep(army, step.t, {
          type: step.t,
          name: step.n,
          delay: step.d,
          count: step.c,
          cost: step.co,
          isBlocking: step.b,
          production: step.prod,
          id: step.i,
          train: step.tr,
          f: step.f,
          w: step.w,
          g: step.g,
          bt: step.bt
        });
      });
    }

    // Load bonus tech states
    if (config.bn && Array.isArray(config.bn)) {
      console.log(`Loading ${config.bn.length} bonuses for army ${army}`);
      config.bn.forEach((b: any) => addBonus(army, b.i, b.e));
    }
  });

  // Force a full update after loading scenario
  console.log('=== Calling updateCharts to refresh display ===');
  updateCharts();
  console.log('=== updateCharts complete ===');
  
  isLoadingScenario = false; // Re-enable scenario clearing
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

  // Generate a scenario ID from the scenario name or description
  const scenarioId = (s.name || s.desc || 'new_scenario')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);

  // Use scenario name from state (already includes header text)
  const scenarioName = s.name || 'New Scenario';
  
  // Helper to convert timeline steps to export format
  const convertTimeline = (army: string) => {
    const timeline = Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el: any) => {
      const step: any = {
        t: el.dataset.type,
        n: el.querySelector('.step-name')?.value,
        d: parseFloat(el.querySelector('.step-delay')?.value) || 0,
        c: parseInt(el.querySelector('.step-count')?.value) || 1,
        co: parseFloat(el.querySelector('.step-cost')?.value) || 0,
      };
      
      // Add blocking if checked
      const blocking = el.querySelector('.step-blocking')?.checked;
      if (blocking) step.b = true;
      
      // Add production checkbox if checked
      const production = el.querySelector('.step-production')?.checked;
      if (production) step.prod = true;
      
      // Add villager count for villager steps
      if (el.dataset.type === 'villagers') {
        step.v = parseInt(el.querySelector('.step-value')?.value) || 0;
      }
      
      // Add train time for production steps
      if (el.dataset.type === 'production') {
        step.tr = parseFloat(el.querySelector('.step-train')?.value) || 30;
      }
      
      // Add building/tech ID
      const id = el.querySelector('.step-select')?.value;
      if (id) step.i = id;
      
      // Add building target
      const bt = el.dataset.bt;
      if (bt) step.bt = parseInt(bt);
      
      return step;
    });
    return timeline;
  };
  
  // Helper to convert bonuses to export format
  const convertBonuses = (army: string) => {
    const bonuses = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map((el: any) => {
      const id = el.dataset.id;
      const checks = Array.from(el.querySelectorAll('input')).map((cb: any) => cb.checked);
      return { i: id, e: checks };
    });
    return bonuses;
  };
  
  // Create export format with scenario ID for direct paste into scenarios file
  const exportData: any = {
    [scenarioId]: {
      name: scenarioName,
      desc: s.desc || '',
      a: {
        nm: s.a.nm,
        c: s.a.c,
        age: s.a.age,
        h: s.a.h,
        am: s.a.am,
        ap: s.a.ap,
        aa: s.a.aa,
        ar: s.a.ar,
        rl: s.a.rl,
        n: s.a.n,
        af: s.a.af,
        aw: s.a.aw,
        ag: s.a.ag,
        tl: convertTimeline('a'),
        bn: convertBonuses('a'),
      },
      b: {
        nm: s.b.nm,
        c: s.b.c,
        age: s.b.age,
        h: s.b.h,
        am: s.b.am,
        ap: s.b.ap,
        aa: s.b.aa,
        ar: s.b.ar,
        rl: s.b.rl,
        n: s.b.n,
        af: s.b.af,
        aw: s.b.aw,
        ag: s.b.ag,
        tl: convertTimeline('b'),
        bn: convertBonuses('b'),
      },
    }
  };

  // Format as TypeScript export statement
  const exportText = `export const ${scenarioId} = ${JSON.stringify(exportData[scenarioId], null, 4)};`;
  
  navigator.clipboard.writeText(exportText).then(() => {
    const btn = document.getElementById('export-btn') as HTMLElement;
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = 'var(--color-pos)';
    showToast(`Scenario "${scenarioId}" copied! Paste into src/data/scenarios/`, 4000);
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = '';
    }, 2000);
  });
}

/**
 * Clean army state for export - removes undefined values and ensures proper types
 */
function cleanArmyState(state: any): any {
  const cleaned: any = {};

  // Copy defined values (as strings to match scenario format)
  if (state.nm) cleaned.nm = String(state.nm);
  if (state.c) cleaned.c = String(state.c);
  if (state.ps) cleaned.ps = String(state.ps);
  if (state.cv) cleaned.cv = String(state.cv);
  if (state.age) cleaned.age = String(state.age);

  // Clean numeric overrides (only include if defined and non-zero)
  const numericFields = ['h', 'am', 'ap', 'aa', 'ar', 'rl', 'n', 'as', 'ab', 'ad', 'af', 'aw', 'ag', 'da', 'df', 'dw', 'dg', 'e'];
  numericFields.forEach(field => {
    if (state[field] !== undefined && state[field] !== 0 && state[field] !== '') {
      cleaned[field] = String(state[field]);
    }
  });

  // Clean mc (micro control) - include even if 0
  if (state.mc !== undefined) cleaned.mc = String(state.mc);

  // Clean timeline
  if (state.tl && state.tl.length > 0) {
    cleaned.tl = state.tl.map((step: any) => {
      const cleanStep: any = { t: step.t };
      if (step.n) cleanStep.n = step.n;
      if (step.d !== undefined && step.d !== 0) cleanStep.d = step.d;
      if (step.c !== undefined && step.c !== 1) cleanStep.c = step.c;
      if (step.co !== undefined && step.co !== 0) cleanStep.co = step.co;
      if (step.b) cleanStep.b = step.b;
      if (step.v !== undefined) cleanStep.v = step.v;
      if (step.i) cleanStep.i = step.i;
      if (step.tr !== undefined) cleanStep.tr = step.tr;
      if (step.f !== undefined) cleanStep.f = step.f;
      if (step.w !== undefined) cleanStep.w = step.w;
      if (step.g !== undefined) cleanStep.g = step.g;
      if (step.bt !== undefined) cleanStep.bt = step.bt;
      return cleanStep;
    });
  }
  
  // Clean bonus tech states
  if (state.bn && state.bn.length > 0) {
    cleaned.bn = state.bn.map((b: any) => ({
      i: b.i,
      e: b.e || [],
    }));
  }
  
  return cleaned;
}

async function syncURL(forceShorten: boolean = false): Promise<string | null> {
  // Don't update URL during initial load
  if (isLoadingScenario) {
    return null;
  }
  
  const currentState = getState();
  const json = JSON.stringify(currentState);

  // Only use KV when explicitly forced (share button)
  if (forceShorten) {
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentState }),
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

    // Fallback: return long URL with full state
    const params = new URLSearchParams();
    params.set('data', json);
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  // Normal changes: clear scenario and use bare URL (custom scenario)
  if (activeScenario) {
    activeScenario = null;
    updateFeaturedScenarioButtons();
  }
  history.replaceState(null, '', window.location.pathname);
  return null;
}

function getState(): SimulationState {
  const s: any = { a: {}, b: {}, desc: '' };
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) s.desc = descEl.value;
  
  // Include scenario name from header
  const scenarioNameHeader = document.getElementById('scenario-name-header');
  if (scenarioNameHeader && scenarioNameHeader.textContent) {
    s.name = scenarioNameHeader.textContent.trim();
  }

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
      b: el.querySelector('.step-blocking')?.checked, prod: el.querySelector('.step-production')?.checked,
      v: el.querySelector('.step-value')?.value,
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
  const p = new URLSearchParams(window.location.search);

  // 1. Check for short ID in hash (shared URLs from KV) - highest priority
  const hash = window.location.hash;
  if (hash && hash.length > 1 && !hash.startsWith('?')) {
    const shortId = hash.substring(1);
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

  // 2. Load from data parameter (custom shared state) - second priority
  const dataParam = p.get('data');
  if (dataParam) {
    try {
      const state = JSON.parse(dataParam);
      applyState(state);
      // Keep the URL as-is with ?data=... for custom shared state
      return;
    } catch (e) { console.error('Failed to load state:', e); }
  }

  // 3. Load from scenario (built-in scenarios) - third priority
  const scenarioId = p.get('scenario');
  if (scenarioId && (scenarios as any)[scenarioId]) {
    console.log(`Loading scenario from scenario: ${scenarioId}`);
    loadScenario(scenarioId);
    return;
  }

  // 4. No URL params - redirect to first scenario (only on initial load)
  if (featuredScenarios.length > 0 && !activeScenario && !dataParam && !hash) {
    const firstScenario = featuredScenarios[0];
    console.log(`No scenario loaded, redirecting to: ${firstScenario}`);
    loadScenario(firstScenario);
    return;
  }
  
  updateCharts();
}

function applyState(state: any, expiresAt?: number) {
  isLoadingScenario = true; // Prevent clearing during load
  
  if (state.desc) {
    const el = document.getElementById('scenario-desc') as HTMLTextAreaElement;
    if (el) el.value = state.desc;
  }

  // Load scenario name
  if (state.name) {
    const scenarioNameHeader = document.getElementById('scenario-name-header');
    if (scenarioNameHeader) {
      scenarioNameHeader.textContent = state.name;
      scenarioNameHeader.style.display = state.name ? 'block' : 'none';
    }
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
          isBlocking: step.b, production: step.prod, id: step.i, train: step.tr, f: step.f, w: step.w, g: step.g,
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
        // Apply age bonuses
        applyAge(army, String(armyState.age));
      }
    }
  });
  updateCharts();
  
  isLoadingScenario = false; // Re-enable scenario clearing
}

window.onload = async () => {
  allUnits = { ...units, ...presets };
  Object.values(techs).forEach(t => techsById[t.id] = t);
  document.querySelectorAll('input, select, textarea').forEach((t: any) => { if (t.id) defaults[t.id] = t.value; });

  // Load rate limit state from localStorage
  loadRateLimitState();

  // Initialize unit name headers with default values
  (['a', 'b'] as const).forEach((army) => {
    const nameHeader = document.getElementById(`name-header-${army}`);
    const nameInput = document.getElementById(`${army}-name`) as HTMLInputElement;
    if (nameHeader && nameInput) {
      nameHeader.textContent = nameInput.value;
      nameHeader.dataset.value = ''; // No preset selected initially
    }
  });

  // Load state from URL (scenario, hash, or data params)
  await loadState();

  // Render featured scenarios
  const scnContainer = document.getElementById('featured-scenarios-container');
  if (scnContainer) {
    (featuredScenarios as string[]).forEach(id => {
      const s = (scenarios as any)[id]; if (!s) return;
      const btn = document.createElement('button'); btn.className = 'scenario-btn'; btn.textContent = s.name;
      btn.dataset.scenarioId = id;
      btn.addEventListener('click', () => {
        loadScenario(id);
      });
      scnContainer.appendChild(btn);
    });
    // Highlight active scenario (call again after buttons are rendered)
    updateFeaturedScenarioButtons();
  }

  const scnSearch = document.querySelector('.scenario-search') as HTMLInputElement;
  const scnList = document.querySelector('.scenario-list') as HTMLElement;
  if (scnSearch && scnList) {
    const render = () => {
      const term = scnSearch.value.toLowerCase(); scnList.innerHTML = '';
      Object.entries(scenarios as any).forEach(([id, s]: [string, any]) => {
        if (s.name.toLowerCase().includes(term)) {
          const item = document.createElement('div'); item.className = 'scenario-item'; item.textContent = s.name;
          item.addEventListener('click', () => {
            loadScenario(id, true); // Update URL with scenario
            scnList.classList.add('hidden');
          }); scnList.appendChild(item);
        }
      });
      if (scnList.children.length > 0) scnList.classList.remove('hidden'); else scnList.classList.add('hidden');
    };
    scnSearch.addEventListener('click', render); scnSearch.addEventListener('keyup', render);
    scnSearch.addEventListener('blur', () => setTimeout(() => scnList.classList.add('hidden'), 200));
  }

  document.getElementById('scenario-desc')?.addEventListener('input', () => onInputChange(true));

  // New scenario button
  document.getElementById('new-scenario-btn')?.addEventListener('click', () => {
    if (confirm('Create a new scenario? This will clear all current settings.')) {
      createNewScenario();
    }
  });

/**
 * Create a new blank scenario with default values
 */
function createNewScenario() {
  activeScenario = null;

  // Clear scenario name and description
  const scenarioNameHeader = document.getElementById('scenario-name-header');
  if (scenarioNameHeader) {
    scenarioNameHeader.textContent = 'New Scenario';
    scenarioNameHeader.style.display = 'block';
  }
  
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) descEl.value = 'Describe your scenario here...';
  
  // Reset both armies to defaults
  (['a', 'b'] as const).forEach((army) => {
    // Clear timeline
    const tl = document.getElementById(`p${army}-timeline`);
    if (tl) tl.innerHTML = '';
    
    // Clear bonuses
    const bn = document.getElementById(`${army}-applied-bonuses`);
    if (bn) bn.innerHTML = '';
    
    // Reset unit name
    const nameEl = document.getElementById(`${army}-name`) as HTMLInputElement;
    if (nameEl) nameEl.value = `Unit ${army.toUpperCase()}`;
    
    // Reset name header
    const header = document.getElementById(`name-header-${army}`);
    if (header) header.textContent = `Unit ${army.toUpperCase()}`;
    
    // Reset civ
    const civEl = document.querySelector(`.civ-selector[data-army="${army}"]`) as HTMLElement;
    const civNameEl = document.getElementById(`${army}-civ-name`);
    if (civEl) civEl.dataset.value = '';
    if (civNameEl) civNameEl.textContent = 'Select Civ';
    
    // Reset all stat inputs to defaults
    for (const [field, key] of Object.entries(fieldMap)) {
      const el = document.getElementById(`${army}-${field}`) as HTMLInputElement;
      if (el && defaults[`${army}-${field}`] !== undefined) {
        el.value = defaults[`${army}-${field}`];
      }
    }
    
    // Reset count
    const countEl = document.getElementById(`${army}-count`) as HTMLInputElement;
    if (countEl) countEl.value = '1';
    
    // Reset age buttons
    const ageBtns = document.querySelectorAll(`.army-age-controls[data-army="${army}"] .age-btn`);
    ageBtns.forEach((btn: any) => {
      btn.classList.toggle('active', btn.dataset.age === '1');
    });
    
    // Add default production step
    addProductionStep(army, 'production', { name: 'Initial Production', value: 1, train: 30 });
  });
  
  // Clear URL
  history.replaceState(null, '', window.location.pathname);
  
  // Update charts
  updateCharts();
  
  showToast('New scenario created!', 2000);
}

/**
 * Fuzzy match - checks if chars appear in order anywhere in the string
 */
function fuzzyMatch(text: string, pattern: string): boolean {
  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();
  let textIndex = 0;
  
  for (let i = 0; i < patternLower.length; i++) {
    const charIndex = textLower.indexOf(patternLower[i], textIndex);
    if (charIndex === -1) return false;
    textIndex = charIndex + 1;
  }
  return true;
}

/**
 * Setup autocomplete with fuzzy finding and keyboard navigation
 */
function setupAutocomplete(
  input: HTMLInputElement,
  items: Array<{ id: string; name: string }>,
  onSelect: (id: string) => void,
  listId: string
) {
  let hasCleared = false;
  let selectedIndex = 0;
  let filteredItems: Array<{ id: string; name: string }> = [];
  let ignoreNextKeyup = false;

  const list = document.getElementById(listId) as HTMLElement;

  const render = (showAll: boolean = false, clearInput: boolean = false) => {
    if (clearInput && !hasCleared) {
      input.value = '';
      hasCleared = true;
    }
    const term = showAll || clearInput ? '' : input.value.toLowerCase();
    selectedIndex = 0;

    // Filter with fuzzy matching
    filteredItems = items.filter(item => {
      if (!term) return true;
      return fuzzyMatch(item.name, term);
    });

    // Sort by relevance (exact match first, then starts with, then contains)
    if (term) {
      filteredItems.sort((a, b) => {
        const aLower = a.name.toLowerCase();
        const bLower = b.name.toLowerCase();
        if (aLower === term) return -1;
        if (bLower === term) return 1;
        if (aLower.startsWith(term)) return -1;
        if (bLower.startsWith(term)) return 1;
        return aLower.indexOf(term) - bLower.indexOf(term);
      });
    }

    list.innerHTML = '';
    filteredItems.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'preset-item' + (index === selectedIndex ? ' selected' : '');
      el.textContent = item.name;
      el.addEventListener('click', () => {
        onSelect(item.id);
        list.classList.add('hidden');
        hasCleared = false;
      });
      el.addEventListener('mouseenter', () => {
        selectedIndex = index;
        updateSelection();
      });
      list.appendChild(el);
    });

    if (filteredItems.length > 0) list.classList.remove('hidden');
    else list.classList.add('hidden');
  };

  const updateSelection = () => {
    Array.from(list.children).forEach((child, i) => {
      if (i === selectedIndex) child.classList.add('selected');
      else child.classList.remove('selected');
    });
    // Scroll selected into view
    const selected = list.children[selectedIndex] as HTMLElement;
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  };

  const selectCurrent = () => {
    if (filteredItems.length > 0 && selectedIndex >= 0 && selectedIndex < filteredItems.length) {
      onSelect(filteredItems[selectedIndex].id);
      list.classList.add('hidden');
      hasCleared = false;
      ignoreNextKeyup = true; // Prevent keyup from reopening
    }
  };

  input.addEventListener('click', () => render(true));
  input.addEventListener('focus', () => render(true));

  input.addEventListener('keydown', (e: KeyboardEvent) => {
    // Clear input once when typing starts
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && input.dataset.value) {
      render(true, true);
      return;
    }

    // Navigate with arrow keys or j/k
    if (e.key === 'ArrowDown' || (e.key === 'j' && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % filteredItems.length;
        updateSelection();
      }
    } else if (e.key === 'ArrowUp' || (e.key === 'k' && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
        updateSelection();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectCurrent();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      selectCurrent();
    }
  });

  input.addEventListener('keyup', () => {
    if (ignoreNextKeyup) {
      ignoreNextKeyup = false;
      return;
    }
    render(false);
  });

  input.addEventListener('blur', () => {
    hasCleared = false;
    setTimeout(() => list.classList.add('hidden'), 200);
  });
}

  // Setup unit name click handlers (opens unit selector)
  (['a', 'b'] as const).forEach((army) => {
    const nameHeader = document.getElementById(`name-header-${army}`);
    const list = document.getElementById(`${army}-preset-list`);
    if (nameHeader && list) {
      const units = Object.entries(allUnits).map(([id, u]) => ({ id, name: u.name }));
      let searchTerm = '';
      let isOpen = false;
      let selectedIndex = 0;
      
      const renderUnitList = () => {
        list.innerHTML = '';
        const filteredItems = units.filter(item => {
          if (!searchTerm) return true;
          return fuzzyMatch(item.name, searchTerm);
        });
        
        // Sort by relevance
        if (searchTerm) {
          filteredItems.sort((a, b) => {
            const aLower = a.name.toLowerCase();
            const bLower = b.name.toLowerCase();
            if (aLower === searchTerm.toLowerCase()) return -1;
            if (bLower === searchTerm.toLowerCase()) return 1;
            if (aLower.startsWith(searchTerm.toLowerCase())) return -1;
            if (bLower.startsWith(searchTerm.toLowerCase())) return 1;
            return aLower.indexOf(searchTerm.toLowerCase()) - bLower.indexOf(searchTerm.toLowerCase());
          });
        }
        
        selectedIndex = 0; // Reset selection on re-render
        
        filteredItems.forEach((item, index) => {
          const el = document.createElement('div');
          el.className = 'preset-item' + (index === selectedIndex ? ' selected' : '');
          el.textContent = item.name;
          el.dataset.index = index.toString();
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            loadPreset(army, item.id);
            list.classList.add('hidden');
            isOpen = false;
            searchTerm = '';
          });
          el.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateSelection();
          });
          list.appendChild(el);
        });
        
        if (filteredItems.length > 0) list.classList.remove('hidden');
        else list.classList.add('hidden');
      };
      
      const updateSelection = () => {
        Array.from(list.children).forEach((child, i) => {
          if (i === selectedIndex) child.classList.add('selected');
          else child.classList.remove('selected');
        });
        // Scroll selected into view
        const selected = list.children[selectedIndex] as HTMLElement;
        if (selected) {
          selected.scrollIntoView({ block: 'nearest' });
        }
      };
      
      const openList = () => {
        renderUnitList();
        updateSelection(); // Highlight first item
        
        // Position the list directly below the header
        const rect = nameHeader.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        list.style.position = 'absolute';
        list.style.top = (rect.height + 5) + 'px';
        list.style.left = '0';
        list.style.zIndex = '1000';
        list.style.maxHeight = '300px';
        list.style.overflowY = 'auto';
        list.style.minWidth = '200px';
        list.style.backgroundColor = 'var(--panel-bg)';
        list.style.border = '1px solid var(--border-color)';
        list.style.borderRadius = '4px';
        list.style.boxShadow = 'var(--shadow)';
        isOpen = true;
      };
      
      nameHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        searchTerm = '';
        openList();
      });
      
      // Global keyboard handler when list is open
      const handleKeydown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') {
          list.classList.add('hidden');
          isOpen = false;
          searchTerm = '';
          return;
        }
        
        if (e.key === 'Enter') {
          e.preventDefault();
          const selectedItem = list.querySelector('.preset-item.selected') as HTMLElement;
          if (selectedItem) {
            selectedItem.click();
          } else {
            const firstItem = list.querySelector('.preset-item') as HTMLElement;
            if (firstItem) firstItem.click();
          }
          return;
        }
        
        // Arrow navigation
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const items = list.querySelectorAll('.preset-item');
          if (items.length > 0) {
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
          }
          return;
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const items = list.querySelectorAll('.preset-item');
          if (items.length > 0) {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection();
          }
          return;
        }
        
        // Typing - filter list
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          searchTerm += e.key;
          renderUnitList();
          updateSelection();
          return;
        }
        
        if (e.key === 'Backspace') {
          searchTerm = searchTerm.slice(0, -1);
          renderUnitList();
          updateSelection();
          return;
        }
      };
      
      document.addEventListener('keydown', handleKeydown);
      
      // Close when clicking outside
      document.addEventListener('click', () => {
        if (isOpen) {
          list.classList.add('hidden');
          isOpen = false;
          searchTerm = '';
        }
      });
    }
  });

  // Setup civ selector click handlers
  (['a', 'b'] as const).forEach((army) => {
    const civSelector = document.querySelector(`.civ-selector[data-army="${army}"]`) as HTMLElement;
    const list = document.getElementById(`${army}-civ-list`);
    const civNameEl = document.getElementById(`${army}-civ-name`);
    
    if (civSelector && list && civNameEl) {
      const civsList = Object.keys(civs).map(c => ({ id: c, name: c }));
      let searchTerm = '';
      let isOpen = false;
      let selectedIndex = 0;
      
      // Set initial civ name
      const firstCiv = Object.keys(civs)[0];
      if (firstCiv) {
        civNameEl.textContent = firstCiv;
        civSelector.dataset.value = firstCiv;
      }
      
      const renderCivList = () => {
        list.innerHTML = '';
        const filteredItems = civsList.filter(item => {
          if (!searchTerm) return true;
          return fuzzyMatch(item.name, searchTerm);
        });
        
        // Sort by relevance
        if (searchTerm) {
          filteredItems.sort((a, b) => {
            const aLower = a.name.toLowerCase();
            const bLower = b.name.toLowerCase();
            if (aLower === searchTerm.toLowerCase()) return -1;
            if (bLower === searchTerm.toLowerCase()) return 1;
            if (aLower.startsWith(searchTerm.toLowerCase())) return -1;
            if (bLower.startsWith(searchTerm.toLowerCase())) return 1;
            return aLower.indexOf(searchTerm.toLowerCase()) - bLower.indexOf(searchTerm.toLowerCase());
          });
        }
        
        selectedIndex = 0; // Reset selection on re-render
        
        filteredItems.forEach((item, index) => {
          const el = document.createElement('div');
          el.className = 'preset-item' + (index === selectedIndex ? ' selected' : '');
          el.textContent = item.name;
          el.dataset.index = index.toString();
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            civNameEl.textContent = item.name;
            civSelector.dataset.value = item.id;
            list.classList.add('hidden');
            isOpen = false;
            searchTerm = '';
            onInputChange(true);
          });
          el.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateCivSelection();
          });
          list.appendChild(el);
        });
        
        if (filteredItems.length > 0) list.classList.remove('hidden');
        else list.classList.add('hidden');
      };
      
      const updateCivSelection = () => {
        Array.from(list.children).forEach((child, i) => {
          if (i === selectedIndex) child.classList.add('selected');
          else child.classList.remove('selected');
        });
        // Scroll selected into view
        const selected = list.children[selectedIndex] as HTMLElement;
        if (selected) {
          selected.scrollIntoView({ block: 'nearest' });
        }
      };
      
      const openCivList = () => {
        renderCivList();
        updateCivSelection(); // Highlight first item
        
        // Position the list directly below the selector
        const rect = civSelector.getBoundingClientRect();
        
        list.style.position = 'absolute';
        list.style.top = (rect.height + 5) + 'px';
        list.style.left = '0';
        list.style.zIndex = '1000';
        list.style.maxHeight = '300px';
        list.style.overflowY = 'auto';
        list.style.minWidth = '200px';
        list.style.backgroundColor = 'var(--panel-bg)';
        list.style.border = '1px solid var(--border-color)';
        list.style.borderRadius = '4px';
        list.style.boxShadow = 'var(--shadow)';
        isOpen = true;
      };
      
      civSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        searchTerm = '';
        openCivList();
      });
      
      // Global keyboard handler when list is open
      const handleCivKeydown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') {
          list.classList.add('hidden');
          isOpen = false;
          searchTerm = '';
          return;
        }
        
        if (e.key === 'Enter') {
          e.preventDefault();
          const selectedItem = list.querySelector('.preset-item.selected') as HTMLElement;
          if (selectedItem) {
            selectedItem.click();
          } else {
            const firstItem = list.querySelector('.preset-item') as HTMLElement;
            if (firstItem) firstItem.click();
          }
          return;
        }
        
        // Arrow navigation
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const items = list.querySelectorAll('.preset-item');
          if (items.length > 0) {
            selectedIndex = (selectedIndex + 1) % items.length;
            updateCivSelection();
          }
          return;
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const items = list.querySelectorAll('.preset-item');
          if (items.length > 0) {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateCivSelection();
          }
          return;
        }
        
        // Typing - filter list
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          searchTerm += e.key;
          renderCivList();
          updateCivSelection();
          return;
        }
        
        if (e.key === 'Backspace') {
          searchTerm = searchTerm.slice(0, -1);
          renderCivList();
          updateCivSelection();
          return;
        }
      };
      
      document.addEventListener('keydown', handleCivKeydown);
      
      // Close when clicking outside
      document.addEventListener('click', () => {
        if (isOpen) {
          list.classList.add('hidden');
          isOpen = false;
          searchTerm = '';
        }
      });
    }
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

  // Production section toggle
  document.querySelectorAll('.toggle-prod-section-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const targets = btn.dataset.target.split(',');
    targets.forEach((targetId: string) => {
      const el = document.getElementById(targetId.trim());
      if (el) {
        el.classList.toggle('collapsed');
      }
    });
    btn.textContent = btn.textContent === 'Edit Production Simulation' ? 'Hide Production Simulation' : 'Edit Production Simulation';
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

  // Submit button - creates GitHub issue with scenario
  document.getElementById('submit-btn')?.addEventListener('click', async () => {
    const s = getState();

    // Generate scenario ID from name or description
    const scenarioId = (s.name || s.desc || 'new_scenario')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 30);

    // Use scenario name from state
    const scenarioName = s.name || 'New Scenario';

    // Create scenario data for storage
    const scenarioData = {
      name: scenarioName,
      desc: s.desc || '',
      a: {
        nm: s.a.nm,
        c: s.a.c,
        age: s.a.age,
        h: s.a.h,
        am: s.a.am,
        ap: s.a.ap,
        aa: s.a.aa,
        ar: s.a.ar,
        rl: s.a.rl,
        n: s.a.n,
        af: s.a.af,
        aw: s.a.aw,
        ag: s.a.ag,
      },
      b: {
        nm: s.b.nm,
        c: s.b.c,
        age: s.b.age,
        h: s.b.h,
        am: s.b.am,
        ap: s.b.ap,
        aa: s.b.aa,
        ar: s.b.ar,
        rl: s.b.rl,
        n: s.b.n,
        af: s.b.af,
        aw: s.b.aw,
        ag: s.b.ag,
      },
    };

    // Generate short URL by calling the shorten API
    let shortUrl = '';
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: scenarioData }),
      });
      
      if (response.ok) {
        const result = await response.json();
        shortUrl = window.location.origin + '/#' + result.id;
      }
    } catch (e) {
      console.error('Failed to create short URL:', e);
      showToast('Failed to create shareable link', 3000);
      return;
    }

    const title = `Scenario Submission: ${scenarioName}`;

    // Create issue body with short URL
    const body = `## Scenario Submission

**Scenario Name:** ${scenarioName}

**Description:** ${scenarioData.desc || '_Add your description here_'}

**View Scenario:** ${shortUrl}

**Notes:**
- [ ] Balance issue
- [ ] Fun/interesting matchup
- [ ] Tournament scenario
- [ ] Other: _please specify_

---
*Submitted via Chombat Combat Simulator*
`;

    // Create GitHub issue URL
    const githubIssueUrl = `https://github.com/Crazybus/chombat/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

    // Open in new tab
    window.open(githubIssueUrl, '_blank');

    showToast('Opening GitHub issue with short URL...', 3000);
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  
  // Apply saved theme
  if (savedTheme === 'light-theme') {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  } else if (savedTheme === 'dark-theme') {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  }
  
  themeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark-theme');
    if (isDark) {
      // Switch to light
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light-theme');
    } else {
      // Switch to dark
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
    console.log(`Theme switched to: ${isDark ? 'light' : 'dark'}`);
  });

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

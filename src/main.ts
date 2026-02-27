import { UnitData, TechData, BuildingData, ArmyState, SimulationState } from './sim/types';
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

// Global Chart instances
let charts: Record<string, any> = {};
let defaults: Record<string, string> = {};
let activeScenario: string | null = null;

const fieldMap: Record<string, keyof ArmyState | any> = {
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
  const allPossibleUnits = { ...units, ...presets };
  if (!id || !allPossibleUnits[id]) return null;
  return { ...allPossibleUnits[id], id: id };
}

function getArmyConfig(army: 'a' | 'b'): ArmyState {
  const config: any = {};
  document.querySelectorAll(`[id^="${army}-"]`).forEach((el: any) => {
    const key = el.id.substring(2).replace(/-/g, '_');
    config[key] = el.type === 'number' || el.type === 'range' ? parseFloat(el.value) : el.value;
  });
  
  const slider = document.getElementById(`${army}-groups-slider`) as HTMLInputElement;
  if (slider) config.micro = parseInt(slider.value);
  
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

  const sim = new CombatSim(dA, dB, cA, cB, techs, { ...units, ...presets });
  const res = sim.run();
  
  updateResultCard(res, dA.name, dB.name);
  updateStatComparison(dA, dB, cA, cB, sim);
  updateTimeCharts(res.history, dA.name, dB.name);
  updateProductionAnalysis(dA, dB, cA, cB);
  updateScalingAnalysis(dA, dB, cA, cB);
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
  const dmgA = simRef.calculateDamage(uA, uB);
  const dmgB = simRef.calculateDamage(uB, uA);

  let bA = 0;
  for (const [cls, amt] of Object.entries(uA.bonuses || {})) {
    bA += Math.max(0, amt - (uB.armors[cls] || 0));
  }
  let bB = 0;
  for (const [cls, amt] of Object.entries(uB.bonuses || {})) {
    bB += Math.max(0, amt - (uA.armors[cls] || 0));
  }

  const rows = [
    { label: 'HP', a: uA.hpPerUnit.toFixed(0), b: uB.hpPerUnit.toFixed(0) },
    { label: 'Attack', a: `${uA.matk.toFixed(0)}/${uA.patk.toFixed(0)}`, b: `${uB.matk.toFixed(0)}/${uB.patk.toFixed(0)}`, rawA: uA.matk + uA.patk, rawB: uB.matk + uB.patk },
    { label: 'Bonus Dmg', a: bA.toFixed(0), b: bB.toFixed(0) },
    { label: 'Armor', a: `${uA.marm.toFixed(0)}/${uA.parm.toFixed(0)}`, b: `${uB.marm.toFixed(0)}/${uB.parm.toFixed(0)}`, rawA: uA.marm + uA.parm, rawB: uB.marm + uB.parm },
    { label: 'Dmg/Hit (Eff)', a: dmgA.toFixed(0), b: dmgB.toFixed(0) },
    { label: 'DPS (Eff)', a: (dmgA / uA.reload).toFixed(2), b: (dmgB / uB.reload).toFixed(2) },
    { label: 'Total Cost', a: uA.getParsedCost().total.toFixed(0), b: uB.getParsedCost().total.toFixed(0), inv: true },
  ];

  el.innerHTML = rows.map((r) => {
    const vA = r.rawA !== undefined ? r.rawA : parseFloat(r.a), vB = r.rawB !== undefined ? r.rawB : parseFloat(r.b);
    const diff = vA - vB;
    let dClass = 'diff-neutral';
    if (diff > 0) dClass = r.inv ? 'diff-neg' : 'diff-pos';
    else if (diff < 0) dClass = r.inv ? 'diff-pos' : 'diff-neg';
    return `<tr><td>${r.label}</td><td>${r.a}</td><td>${r.b}</td><td class="${dClass}">${diff === 0 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(r.label.includes('DPS') ? 2 : 0)}</td></tr>`;
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
  const getTimeline = (army: 'a' | 'b') => Array.from(document.querySelectorAll(`#p${army}-timeline .timeline-step`)).map((el: any) => ({
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
  }));

  const tlA = getTimeline('a'), tlB = getTimeline('b');
  const uA_unit = new Unit(dA), uB_unit = new Unit(dB);
  const baseCostA = uA_unit.getParsedCost(), baseCostB = uB_unit.getParsedCost();

  const data: any = { labels: [], countA: [], countB: [], advantage: [] };
  let contact = null, cross = null, finalCostA = { f: 0, w: 0, g: 0 }, finalCostB = { f: 0, w: 0, g: 0 }, finalUPSA = 0, finalUPSB = 0;

  for (let t = 0; t <= searchMax; t += step) {
    const resA = calculateCount(t, tlA, baseCostA);
    const resB = calculateCount(t, tlB, baseCostB);
    data.labels.push(t + 's'); data.countA.push(resA.count); data.countB.push(resB.count);
    
    if (t === searchMax) {
      finalCostA = resA.cost; finalCostB = resB.cost;
      finalUPSA = resA.unitsPerSecond; finalUPSB = resB.unitsPerSecond;
    }

    let adv = 0;
    if (resA.count > 0 && resB.count > 0) {
      if (!contact) contact = { time: t, cA: resA.count, cB: resB.count };
      const cleanCA = Object.assign({}, cA); delete cleanCA.c;
      const cleanCB = Object.assign({}, cB); delete cleanCB.c;
      const sim = new CombatSim(dA, dB, { ...cleanCA, c: resA.count }, { ...cleanCB, c: resB.count }, techs, { ...units, ...presets });
      const res = sim.run();
      adv = res.armyA.totalHp > res.armyB.totalHp ? (res.armyA.totalHp / res.armyA.initialTotalHp) * 100 : -(res.armyB.totalHp / res.armyB.initialTotalHp) * 100;
      
      if (!cross && data.advantage.length > 0) {
        const prev = data.advantage[data.advantage.length - 1];
        if ((prev < 0 && adv > 0) || (prev > 0 && adv < 0))
          cross = { time: t, cA: resA.count, cB: resB.count, win: adv > 0 ? dA.name : dB.name };
      }
    } else if (resA.count > 0) adv = 100; else if (resB.count > 0) adv = -100;
    data.advantage.push(adv);
  }

  renderProductionCharts(data, dA.name, dB.name);
  
  const report = document.getElementById('production-report-text');
  if (report) {
    let msg = contact ? `<p>First units arrive at ${contact.time}s: <strong>${contact.cA} ${dA.name}</strong> vs <strong>${contact.cB} ${dB.name}</strong>.</p>` : '';
    if (cross) msg += `<p><span style="color:var(--accent-color); font-weight:bold;">Tide Turns at ${cross.time}s!</span><br>The <strong>${cross.win}</strong> player starts winning once they have massed <strong>${cross.win === dA.name ? cross.cA : cross.cB} units</strong> vs the opponent's <strong>${cross.win === dA.name ? cross.cB : cross.cA}</strong>.</p>`;
    
    msg += `<h4>Event Log</h4><div class="event-log-container">`;
    const resA_final = calculateCount(searchMax, tlA, baseCostA);
    const resB_final = calculateCount(searchMax, tlB, baseCostB);
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

function updateScalingAnalysis(dA: UnitData, dB: UnitData, cA: ArmyState, cB: ArmyState) {
  const nameA = cA.nm || dA.name, nameB = cB.nm || dB.name, scales = [1, 2, 3, 4, 5, 8, 10, 15, 20];
  
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
      const curA = { ...dA, count: mode === '1vX' ? 1 : s };
      const curB = { ...dB, count: mode === 'Xv1' ? 1 : s };
      const sim = new CombatSim(dA, dB, { ...cA, c: curA.count }, { ...cB, c: curB.count }, techs, { ...units, ...presets });
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

  if (type === 'villagers' && !data.name) {
    data.name = 'Villager'; data.delay = 25; data.count = 18; data.cost = 50; data.isBlocking = true; data.value = 0;
  }
  
  if (type === 'age' && !data.name) {
    const ageMap: Record<number, string> = { 2: 'Feudal Age', 3: 'Castle Age', 4: 'Imperial Age' };
    const ageName = ageMap[data.ageVal] || 'Feudal Age';
    const techId = TECH_MAP[ageName];
    const tData = techs[techId];
    if (tData) {
      data.id = techId.toString(); data.name = tData.name; data.delay = tData.time; data.count = 1; data.cost = (tData.f || 0) + (tData.w || 0) + (tData.g || 0); data.isBlocking = true;
    }
    type = 'tech'; step.dataset.type = 'tech';
  }

  let optionsHtml = '';
  if (type === 'tech') optionsHtml = Object.entries(techs).sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, t]) => `<option value="${id}" ${String(data.id) === String(id) ? 'selected' : ''}>${t.name}</option>`).join('');
  else if (type === 'building') optionsHtml = Object.entries(buildings).sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, b]) => `<option value="${id}" ${String(data.id) === String(id) ? 'selected' : ''}>${b.name}</option>`).join('');
  
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
    const src: any = type === 'tech' ? techs : buildings;
    if (val && src[val]) {
      const item = src[val];
      (step.querySelector('.step-name') as HTMLInputElement).value = item.name;
      (step.querySelector('.step-delay') as HTMLInputElement).value = item.time || 0;
      (step.querySelector('.step-cost') as HTMLInputElement).value = (item.f || 0) + (item.w || 0) + (item.g || 0) + (item.s || 0);
      if (type === 'tech') (step.querySelector('.step-blocking') as HTMLInputElement).checked = true;
      if (type === 'building') (step.querySelector('.step-value') as HTMLInputElement).value = '1';
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
  const b = techs[parseInt(id)] || (bonuses as any)[id];
  if (!b) return;
  const container = document.getElementById(`${army}-applied-bonuses`);
  if (!container || container.querySelector(`.applied-bonus[data-id="${id}"]`)) return;
  
  const div = document.createElement('div');
  div.className = 'applied-bonus';
  div.dataset.id = id;
  let html = '';
  const effs = b.effects || [];
  effs.forEach((e: any, i: number) => {
    const checked = effectsState ? effectsState[i] : true;
    const attrMap: Record<number, string> = { 0: 'HP', 3: 'Range', 4: 'Atk', 5: 'MeleeArm', 6: 'PierceArm', 9: 'Reload' };
    html += `<div class="applied-bonus-effect"><input type="checkbox" data-effect-index="${i}" ${checked ? 'checked' : ''}><label>${attrMap[e.a] || 'Stat'} ${e.t === 2 || e.t === 5 ? 'x' : '+'}${e.v}</label></div>`;
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
  const availableTechs = civKey ? civs[civKey] || [] : [];

  const container = document.getElementById(`${army}-applied-bonuses`);
  if (container) container.innerHTML = '';

  if (ageId > 1) {
    const relevantTechs = Object.values(techs).filter((t) => {
      if (t.effects && t.effects.length > 0) {
        if (civKey && !availableTechs.includes(t.id)) return false;
        if (t.age > ageId) return false;
        return t.effects.some((e) => {
          const matchesUnit = e.u === -1 || e.u == parseInt(data.id);
          const matchesClass = e.c === -1 || e.c == data.class;
          return matchesUnit && matchesClass;
        });
      }
      return false;
    });
    relevantTechs.sort((a, b) => (a.age - b.age) || (a.id - b.id)).forEach((t) => addBonus(army, t.id.toString()));
  }
  onInputChange(true);
}

function loadPreset(army: 'a' | 'b', id: string) {
  const allPossible = { ...units, ...presets };
  const u = allPossible[id];
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
  const s = scenarios[id];
  if (!s) return;
  activeScenario = id;
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) descEl.value = s.desc || '';
  
  ['a', 'b'].forEach((army: any) => {
    const config = (s as any)[army];
    const tl = document.getElementById(`p${army}-timeline`);
    if (tl) tl.innerHTML = '';
    const bn = document.getElementById(`${army}-applied-bonuses`);
    if (bn) bn.innerHTML = '';
    
    if (config.preset) loadPreset(army, config.preset);
    const smap: any = { as: 'atk-speed', abr: 'bonus-red', bbn: 'bonus', da: 'disc-all', df: 'disc-f', dw: 'disc-w', dg: 'disc-g' };
    for (const [key, val] of Object.entries(config)) {
      const el = document.getElementById(`${army}-${smap[key] || key}`) as HTMLInputElement;
      if (el) el.value = val as string;
    }
    
    if (config['train-time'] || config.buildings || config.delay || config.tech) {
      if (config['train-time'] || config.buildings) addProductionStep(army, 'production', { name: 'Initial Production', value: config.buildings || 1, train: config['train-time'] || 30 });
      if (config.delay) addProductionStep(army, 'building', { name: 'Initial Delay', d: config.delay, v: 0 });
      if (config.tech) addProductionStep(army, 'tech', { name: 'Initial Research', d: config.tech, b: true });
    }
  });
  onInputChange(false);
}

function syncURL() {
  const s = getState();
  const p = new URLSearchParams();
  if (activeScenario) p.set('scenario', activeScenario);
  const json = JSON.stringify(s);
  const encoded = p.toString() + (p.toString() ? '&' : '') + 'data=' + encodeURIComponent(json);
  const clean = encoded.replace(/%22/g, '"').replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/%3A/g, ':').replace(/%2C/g, ',').replace(/%5B/g, '[').replace(/%5D/g, ']');
  history.replaceState(null, '', '?' + clean);
}

function getState(): SimulationState {
  const s: any = { a: {}, b: {}, desc: '' };
  const descEl = document.getElementById('scenario-desc') as HTMLTextAreaElement;
  if (descEl) s.desc = descEl.value;
  
  ['a', 'b'].forEach((army: any) => {
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
      f: el.querySelector('.step-f')?.value, w: el.querySelector('.step-w')?.value, g: el.querySelector('.step-g')?.value
    }));
    if (timeline.length > 0) s[army].tl = timeline;
    
    const bData = Array.from(document.querySelectorAll(`#${army}-applied-bonuses .applied-bonus`)).map((el: any) => ({
      i: el.dataset.id, e: Array.from(el.querySelectorAll('input')).map((cb: any) => cb.checked)
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
        const el = document.getElementById('scenario-desc') as HTMLTextAreaElement;
        if (el) el.value = state.desc;
      }
      ['a', 'b'].forEach((army: any) => {
        const armyState = state[army];
        if (!armyState) return;
        if (armyState.ps) loadPreset(army, armyState.ps);
        if (armyState.cv) {
          const el = document.querySelector(`.civ-search[data-army="${army}"]`) as HTMLInputElement;
          el.value = armyState.cv; el.dataset.value = armyState.cv;
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
            armyState.tl.forEach((s: any) => addProductionStep(army, s.t, { type: s.t, name: s.n, delay: s.d, count: s.c, cost: s.co, isBlocking: s.b, value: s.v, id: s.i, train: s.tr, f: s.f, w: s.w, g: s.g }));
          }
        }
        if (armyState.bn) {
          const container = document.getElementById(`${army}-applied-bonuses`);
          if (container) {
            container.innerHTML = '';
            armyState.bn.forEach((b: any) => addBonus(army, b.i, b.e));
          }
        }
      });
      updateCharts();
      return;
    } catch (e) { console.error('Failed to load state:', e); }
  }
  if (p.has('scenario')) loadScenario(p.get('scenario'));
  updateCharts();
}

window.onload = () => {
  allUnits = { ...units, ...presets };
  document.querySelectorAll('input, select, textarea').forEach((t: any) => { if (t.id) defaults[t.id] = t.value; });
  
  // Render featured scenarios
  const scnContainer = document.getElementById('featured-scenarios-container');
  if (scnContainer) {
    featuredScenarios.forEach(id => {
      const s = scenarios[id]; if (!s) return;
      const btn = document.createElement('button'); btn.className = 'scenario-btn'; btn.textContent = s.name;
      btn.addEventListener('click', () => loadScenario(id)); scnContainer.appendChild(btn);
    });
  }

  const scnSearch = document.querySelector('.scenario-search') as HTMLInputElement;
  const scnList = document.querySelector('.scenario-list') as HTMLElement;
  if (scnSearch && scnList) {
    const render = () => {
      const term = scnSearch.value.toLowerCase(); scnList.innerHTML = '';
      Object.entries(scenarios).forEach(([id, s]) => {
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

  document.querySelectorAll('.age-btn').forEach((btn: any) => btn.addEventListener('click', () => applyAge(btn.closest('.army-age-controls').dataset.army, btn.dataset.age)));
  
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
      renderBonusList(list, Object.entries(allPossible).filter(([, b]) => b.name && b.name.toLowerCase().includes(term)), army);
    });
    input.addEventListener('blur', () => setTimeout(() => (document.querySelector(`.bonus-list[data-army="${input.dataset.army}"]`) as HTMLElement)?.classList.add('hidden'), 200));
  });

  document.getElementById('export-btn')?.addEventListener('click', () => {
    const s = getState(); navigator.clipboard.writeText(JSON.stringify(s, null, 2)).then(() => {
      const btn = document.getElementById('export-btn') as HTMLElement; const original = btn.textContent;
      btn.textContent = 'Copied!'; btn.style.color = 'var(--color-pos)';
      setTimeout(() => { btn.textContent = original; btn.style.color = ''; }, 2000);
    });
  });

  document.getElementById('share-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('share-btn') as HTMLElement; const original = btn.textContent;
      btn.textContent = 'Link Copied!'; btn.style.color = 'var(--color-pos)';
      setTimeout(() => { btn.textContent = original; btn.style.color = ''; }, 2000);
    });
  });

  document.querySelectorAll('input, select').forEach(el => { el.addEventListener('change', () => onInputChange(true)); el.addEventListener('keyup', () => onInputChange(true)); });
  
  document.querySelectorAll('.count-btn').forEach((btn: any) => btn.addEventListener('click', () => {
    const el = document.getElementById(`${btn.dataset.army}-count`) as HTMLInputElement;
    if (el) { el.value = Math.max(1, (parseInt(el.value) || 1) + parseInt(btn.dataset.delta)); onInputChange(true); }
  }));

  ['a', 'b'].forEach((army) => {
    // @ts-ignore
    new Sortable(document.getElementById(`p${army}-timeline`), { animation: 150, handle: '.step-drag-handle', onEnd: () => onInputChange(true) });
  });

  loadState();
};

const presets = {
    militia: { name: 'Militia', hp: 40, matk: 4, patk: 0, marm: 0, parm: 1, reload: 2.0, range: 0, f: 50, w: 0, g: 20, trainTime: 21 },
    maa: { name: 'Man-at-Arms', hp: 45, matk: 6, patk: 0, marm: 0, parm: 1, reload: 2.0, range: 0, f: 50, w: 0, g: 20, trainTime: 21 },
    champi_scout: { name: 'Champi Scout', hp: 35, matk: 4, patk: 0, marm: 0, parm: 2, reload: 2.0, range: 0, f: 45, w: 0, g: 25, trainTime: 30 },
    champi_runner: { name: 'Champi Runner', hp: 40, matk: 5, patk: 0, marm: 0, parm: 2, reload: 2.0, range: 0, f: 45, w: 0, g: 25, trainTime: 30 },
    champi_warrior: { name: 'Champi Warrior', hp: 55, matk: 9, patk: 0, marm: 0, parm: 3, reload: 2.0, range: 0, f: 45, w: 0, g: 25, trainTime: 21 },
    elite_champi_warrior: { name: 'Elite Champi Runner', hp: 65, matk: 11, patk: 0, marm: 0, parm: 4, reload: 2.0, range: 0, f: 45, w: 0, g: 25, trainTime: 21 },
    scout: { name: 'Scout Cavalry', hp: 45, matk: 5, patk: 0, marm: 0, parm: 2, reload: 2.0, range: 0, f: 80, w: 0, g: 0, trainTime: 30 },
    scout_fu: { name: 'Scout Cavalry (FU Feudal)', hp: 65, matk: 6, patk: 0, marm: 1, parm: 3, reload: 2.0, range: 0, f: 80, w: 0, g: 0, trainTime: 30 },
    spear: { name: 'Spearman', hp: 45, matk: 3, patk: 0, marm: 0, parm: 0, reload: 3.0, range: 0, f: 35, w: 25, g: 0, trainTime: 25 },
    archer: { name: 'Archer', hp: 30, matk: 0, patk: 4, marm: 0, parm: 0, reload: 2.0, range: 4, f: 0, w: 25, g: 45, trainTime: 35 },
    skirm: { name: 'Skirmisher', hp: 30, matk: 0, patk: 2, marm: 0, parm: 3, reload: 3.0, range: 4, f: 25, w: 35, g: 0, trainTime: 22 },
    eagle: { name: 'Eagle Scout', hp: 50, matk: 4, patk: 0, marm: 0, parm: 2, reload: 1.9, range: 0, f: 20, w: 0, g: 50, trainTime: 35 },
    paladin: { name: 'Paladin', hp: 160, matk: 14, patk: 0, marm: 2, parm: 3, reload: 1.9, range: 0, f: 60, w: 0, g: 75, trainTime: 30 },
    knight: { name: 'Knight', hp: 100, matk: 10, patk: 0, marm: 2, parm: 2, reload: 1.8, range: 0, f: 60, w: 0, g: 75, trainTime: 30 },
    halb: { name: 'Halberdier', hp: 60, matk: 6, patk: 0, marm: 0, parm: 0, reload: 3.0, range: 0, f: 35, w: 25, g: 0, trainTime: 25 },
    arbalest: { name: 'Arbalest', hp: 40, matk: 0, patk: 6, marm: 0, parm: 0, reload: 2.0, range: 5, f: 0, w: 25, g: 45, trainTime: 27 }
};

const scenarios = {
    militia_vs_scouts: {
        name: "Militia vs Scouts",
        desc: "All in dark age militia rush vs fully upgraded bloodline scouts.",
        a: { preset: 'militia', count: 10, delay: 0, tech: 0, pre: 0 },
        b: { preset: 'scout_fu', count: 5, delay: 165, tech: 50, pre: 0, hp: 65 }
    },
    maa_vs_scouts: {
        name: "MAA vs Scouts",
        desc: "3 Militia trained first, then MAA upgrade (40s), then constant production. Scouts player has to wait for feudal, stable before starting production",
        a: { preset: 'maa', count: 7, delay: 0, tech: 40, pre: 3 },
        b: { preset: 'scout_fu', count: 5, delay: 165, tech: 50, pre: 0, hp: 65 }
    },
    archers_vs_skirms: {
        name: "Archers vs Skirms",
        desc: "Overcoming an archer mass with a tech switch into skirms",
        a: { preset: 'archer', count: 10, delay: 0, tech: 0, pre: 0 },
        b: { preset: 'skirm', count: 5, delay: 35 * 6, tech: 0, pre: 0, bbn: 3 }
    },
    champi_vs_scouts: {
        name: "Champi Scout vs Scouts",
        desc: "Dark Age champi rush vs fully upgraded bloodline scouts. Champi production starts at the same time that the scouts player clicks up to feudal.",
        a: { preset: 'champi_scout', count: 10, delay: 0, tech: 0, pre: 0 },
        b: { preset: 'scout_fu', count: 5, delay: 165, tech: 50, pre: 0, hp: 65 }
    },
    knights_vs_halbs: {
        name: "Castle Knights vs Imp Halberdiers",
        desc: "Castle Knights vs Imperial Halberdiers. Bonus damage trade-off.",
        a: { preset: 'knight', count: 10, delay: 0, tech: 0, pre: 0, hp: 120, marm: 4, parm: 4 },
        b: { preset: 'halb', count: 20, delay: 0, tech: 0, pre: 0, bbn: 32 }
    },
    archer_vs_skirm_mass: {
        name: "Target Fire 60 vs 60 Archer vs Skirm",
        desc: "60 Archers vs 60 Skirmishers. Demonstrates how target fire and overkill avoidance change the outcome. When both use Focus Fire (1), Archers can win by 'one-shotting' units, while switching to Perfect micro (5) would favor Skirmishers by reducing wasted damage.",
        a: { preset: 'archer', count: 60, delay: 0, tech: 0, pre: 0, amc: 1 },
        b: { preset: 'skirm', count: 60, delay: 0, tech: 0, pre: 0, bbn: 3, bmc: 1 }
    }
};

const featuredScenarios = ['champi_vs_scouts', 'maa_vs_scouts', 'archers_vs_skirms'];

let charts = {};
let defaults = {};
let activeScenario = null;

class Unit {
    constructor(data) {
        this.name = data.name || "Unit";
        this.initialCount = parseFloat(data.count) || 0;
        this.currentCount = this.initialCount;
        this.hpPerUnit = parseFloat(data.hp) || 1;
        this.currentUnitHp = this.hpPerUnit;
        this.matk = parseFloat(data.matk) || 0;
        this.patk = parseFloat(data.patk) || 0;
        this.marm = parseFloat(data.marm) || 0;
        this.parm = parseFloat(data.parm) || 0;
        this.reloadBase = parseFloat(data.reload) || 2.0;
        this.range = parseFloat(data.range) || 0;
        this.bonusAtk = parseFloat(data.bonusAtk) || 0;
        this.bonusReduction = (parseFloat(data.bonusReduct) || 0) / 100;
        this.atkSpeedBonus = (parseFloat(data.atkSpeed) || 0) / 100;
        this.reload = this.reloadBase / (1 + this.atkSpeedBonus);
        this.attackCooldown = 0;
        this.trainTime = parseFloat(data.trainTime) || 30;
        this.buildings = parseFloat(data.buildings) || 1;
        this.startDelay = parseFloat(data.delay) || 0;
        this.techDelay = parseFloat(data.techDelay) || 0;
        this.unitsBefore = parseFloat(data.unitsBefore) || 0;
        this.baseF = parseFloat(data.f) || 0;
        this.baseW = parseFloat(data.w) || 0;
        this.baseG = parseFloat(data.g) || 0;
        this.discAll = (parseFloat(data.discAll) || 0) / 100;
        this.discF = (parseFloat(data.discF) || 0) / 100;
        this.discW = (parseFloat(data.discW) || 0) / 100;
        this.discG = (parseFloat(data.discG) || 0) / 100;
    }
    isMelee() { return this.range <= 1; }
    getTotalHp() { return Math.max(0, (this.currentCount - 1) * this.hpPerUnit + this.currentUnitHp); }
    getParsedCost() {
        const m = (1 - this.discAll);
        const f = this.baseF * (1 - this.discF) * m, w = this.baseW * (1 - this.discW) * m, g = this.baseG * (1 - this.discG) * m;
        return { f, w, g, total: f + w + g };
    }
}

class CombatSim {
    constructor(dataA, dataB, configA, configB) {
        this.dataA = dataA; this.dataB = dataB; this.configA = configA; this.configB = configB;
        this.time = 0; this.tick = 0.05; this.history = [];
    }
    calculateDamage(attacker, defender) {
        const isMelee = attacker.isMelee();
        const armor = isMelee ? defender.marm : defender.parm;
        const atk = isMelee ? attacker.matk : attacker.patk;
        return Math.max(1, atk - armor) + (attacker.bonusAtk * (1 - defender.bonusReduction));
    }
    run() {
        const subA = new Unit({ ...this.dataA }), subB = new Unit({ ...this.dataB });
        const costA = subA.getParsedCost().total, costB = subB.getParsedCost().total;
        const initialValA = this.dataA.count * costA, initialValB = this.dataB.count * costB;
        const record = () => {
            const hpPctA = subA.getTotalHp() / (this.dataA.count * subA.hpPerUnit) || 0;
            const hpPctB = subB.getTotalHp() / (this.dataB.count * subB.hpPerUnit) || 0;
            this.history.push({ time: this.time, countA: subA.currentCount, countB: subB.currentCount, hpA: subA.getTotalHp(), hpB: subB.getTotalHp(), valRemainingA: hpPctA * initialValA, valRemainingB: hpPctB * initialValB, valLostA: initialValA - (hpPctA * initialValA), valLostB: initialValB - (hpPctB * initialValB) });
        };
        record();
        while (subA.currentCount > 0 && subB.currentCount > 0 && this.time < 300) {
            const prevA = Math.ceil(subA.currentCount), prevB = Math.ceil(subB.currentCount);
            if (subA.attackCooldown <= 0) {
                const eff = Math.min(subA.currentCount, Math.max(1, subA.initialCount * (this.configA.engagement / 100)));
                this.applyDamage(subB, this.calculateDamage(subA, subB) * eff, this.configA.targetMicro);
                subA.attackCooldown = subA.reload;
            } else subA.attackCooldown -= this.tick;
            if (subB.attackCooldown <= 0) {
                const eff = Math.min(subB.currentCount, Math.max(1, subB.initialCount * (this.configB.engagement / 100)));
                this.applyDamage(subA, this.calculateDamage(subB, subA) * eff, this.configB.targetMicro);
                subB.attackCooldown = subB.reload;
            } else subB.attackCooldown -= this.tick;
            this.time += this.tick;
            if (Math.ceil(subA.currentCount) !== prevA || Math.ceil(subB.currentCount) !== prevB || (Math.round(this.time * 100) % 25 === 0)) record();
        }
        record();
        return { armyA: { remaining: subA.currentCount, totalHp: subA.getTotalHp(), initialTotalHp: this.dataA.count * subA.hpPerUnit }, armyB: { remaining: subB.currentCount, totalHp: subB.getTotalHp(), initialTotalHp: this.dataB.count * subB.hpPerUnit }, history: this.history, duration: this.time };
    }
    applyDamage(unit, totalDmg, micro) {
        const poolHp = unit.getTotalHp();
        let effectiveDmg = totalDmg;
        if (micro !== 0) {
            const dmgPerChunk = totalDmg / micro;
            effectiveDmg = 0;
            const groups = Math.min(micro, Math.ceil(unit.currentCount));
            effectiveDmg += Math.min(unit.currentUnitHp, dmgPerChunk);
            if (groups > 1) effectiveDmg += (groups - 1) * Math.min(unit.hpPerUnit, dmgPerChunk);
        }
        const newPool = Math.max(0, poolHp - effectiveDmg);
        unit.currentCount = Math.ceil(newPool / unit.hpPerUnit);
        unit.currentUnitHp = newPool % unit.hpPerUnit || (unit.currentCount > 0 ? unit.hpPerUnit : 0);
    }
}

const stateMap = {
    'a-name': 'an', 'a-hp': 'ah', 'a-matk': 'at', 'a-patk': 'ap', 'a-marm': 'am', 'a-parm': 'apr', 'a-reload': 'ar', 'a-range': 'ara', 'a-atk-speed': 'as', 'a-bonus-red': 'abr', 'a-bonus': 'abn',
    'a-food': 'af', 'a-wood': 'aw', 'a-gold': 'ag', 'a-disc-all': 'ada', 'a-disc-f': 'adf', 'a-disc-w': 'adw', 'a-disc-g': 'adg',
    'pa-train': 'att', 'pa-build': 'ab', 'pa-delay': 'ad', 'pa-tech': 'atd', 'pa-pre': 'aub', 'a-count': 'acn', 'a-eng': 'ae', 'a-groups-slider': 'amc',
    'b-name': 'bn', 'b-hp': 'bh', 'b-matk': 'bt', 'b-patk': 'bp', 'b-marm': 'bm', 'b-parm': 'bpr', 'b-reload': 'br', 'b-range': 'bra', 'b-atk-speed': 'bs', 'b-bonus-red': 'bbr', 'b-bonus': 'bbn',
    'b-food': 'bf', 'b-wood': 'bw', 'b-gold': 'bg', 'b-disc-all': 'bda', 'b-disc-f': 'bdf', 'b-disc-w': 'bdw', 'b-disc-g': 'bdg',
    'pb-train': 'btt', 'pb-build': 'bb', 'pb-delay': 'bd', 'pb-tech': 'btd', 'pb-pre': 'bcn', 'b-count': 'bcnt', 'b-eng': 'be', 'b-groups-slider': 'bmc',
    'scenario-desc': 'sd'
};

function getInputs(p) {
    const safeGet = (id) => { const el = document.getElementById(id); return el ? el.value : (id.includes('build') ? 1 : 0); };
    return {
        name: safeGet(`${p}-name`), count: parseFloat(safeGet(`${p}-count`)) || 1, hp: parseFloat(safeGet(`${p}-hp`)) || 1,
        matk: parseFloat(safeGet(`${p}-matk`)) || 0, patk: parseFloat(safeGet(`${p}-patk`)) || 0,
        marm: parseFloat(safeGet(`${p}-marm`)) || 0, parm: parseFloat(safeGet(`${p}-parm`)) || 0, reload: parseFloat(safeGet(`${p}-reload`)) || 2.0, range: parseFloat(safeGet(`${p}-range`)) || 0, atkSpeed: parseFloat(safeGet(`${p}-atk-speed`)) || 0, bonusReduct: parseFloat(safeGet(`${p}-bonus-red`)) || 0, bonusAtk: parseFloat(safeGet(`${p}-bonus`)) || 0,
        f: parseFloat(safeGet(`${p}-food`)) || 0, w: parseFloat(safeGet(`${p}-wood`)) || 0, g: parseFloat(safeGet(`${p}-gold`)) || 0, discAll: parseFloat(safeGet(`${p}-disc-all`)) || 0, discF: parseFloat(safeGet(`${p}-disc-f`)) || 0, discW: parseFloat(safeGet(`${p}-disc-w`)) || 0, discG: parseFloat(safeGet(`${p}-disc-g`)) || 0,
        trainTime: parseFloat(safeGet(`p${p}-train`)) || 30, buildings: parseFloat(safeGet(`p${p}-build`)) || 1, delay: parseFloat(safeGet(`p${p}-delay`)) || 0, techDelay: parseFloat(safeGet(`p${p}-tech`)) || 0, unitsBefore: parseFloat(safeGet(`p${p}-pre`)) || 0
    };
}

function calculateCount(t, start, tech, train, build, pre) {
    if (t < start) return 0;
    const tPerU = train / build;
    const timeToPre = start + (pre * tPerU);
    if (t <= timeToPre) return Math.floor((t - start) / tPerU);
    if (t < timeToPre + tech) return pre;
    return pre + Math.floor((t - (timeToPre + tech)) / tPerU);
}

function syncURL() {
    const params = new URLSearchParams();
    if (activeScenario) {
        params.set('scenario_id', activeScenario);
    } else {
        const sA = document.querySelector('.searchable-preset[data-army="a"] .preset-search');
        const sB = document.querySelector('.searchable-preset[data-army="b"] .preset-search');
        if (sA?.dataset.value) params.set('psa', sA.dataset.value);
        if (sB?.dataset.value) params.set('psb', sB.dataset.value);
        for (const [id, key] of Object.entries(stateMap)) {
            const el = document.getElementById(id); if (!el) continue;
            const val = el.value; if (val != defaults[id]) params.set(key, val);
        }
    }
    window.history.replaceState({}, '', window.location.pathname + (params.toString() ? '?' + params.toString() : ''));
}

function loadState() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('scenario_id')) {
        applyScenario(params.get('scenario_id'));
        return;
    }
    
    // Default scenario if no params
    if (!window.location.search) {
        applyScenario('champi_vs_scouts');
        return;
    }

    if (params.has('psa')) applyPreset('a', params.get('psa'), false);
    if (params.has('psb')) applyPreset('b', params.get('psb'), false);
    for (const [id, key] of Object.entries(stateMap)) { if (params.has(key)) { const el = document.getElementById(id); if (el) el.value = params.get(key); } }
    onInputChange(false);
}

function simulate() {
    const dA = getInputs('a'), dB = getInputs('b');
    const cA = { engagement: parseFloat(document.getElementById('a-eng')?.value || 100), targetMicro: parseFloat(document.getElementById('a-groups')?.value || 0) };
    const cB = { engagement: parseFloat(document.getElementById('b-eng')?.value || 100), targetMicro: parseFloat(document.getElementById('b-groups')?.value || 0) };
    const mainSim = new CombatSim(dA, dB, cA, cB);
    const mainRes = mainSim.run();
    updateTimeCharts(mainRes.history, dA.name, dB.name); updateSummary(dA, dB, mainRes);
    updateMatchupTables(dA, dB, cA, cB); updateScalingAnalysis(dA, dB, cA, cB);
    updateProductionAnalysis(dA, dB, cA, cB);
}

function updateStatComparison(dA, dB) {
    const table = document.querySelector('#comparison-table tbody'); if (!table) return;
    document.getElementById('comp-name-a').textContent = dA.name;
    document.getElementById('comp-name-b').textContent = dB.name;

    const sim = new CombatSim({ ...dA, count: 1 }, { ...dB, count: 1 }, { engagement: 100, targetMicro: 0 }, { engagement: 100, targetMicro: 0 });
    const res = sim.run();
    const uA = new Unit(dA), uB = new Unit(dB);
    const dmgA = sim.calculateDamage(uA, uB), dmgB = sim.calculateDamage(uB, uA);
    const hitsA = Math.ceil(uB.hpPerUnit / dmgA), hitsB = Math.ceil(uA.hpPerUnit / dmgB);
    const dpsA = dmgA / uA.reload, dpsB = dmgB / uB.reload;

    const stats = [
        { label: 'HP', a: uA.hpPerUnit, b: uB.hpPerUnit, inv: false },
        { label: 'M. Attack', a: uA.matk, b: uB.matk, inv: false },
        { label: 'P. Attack', a: uA.patk, b: uB.patk, inv: false },
        { label: 'Dmg/Hit (Eff)', a: dmgA, b: dmgB, inv: false },
        { label: 'Hits to Kill', a: hitsA, b: hitsB, inv: true },
        { label: 'DPS (Eff)', a: dpsA, b: dpsB, inv: false },
        { label: 'Final 1v1 HP', a: res.armyA.totalHp, b: res.armyB.totalHp, inv: false },
        { label: 'Reload', a: uA.reloadBase, b: uB.reloadBase, inv: true },
        { label: 'Total Cost', a: uA.getParsedCost().total, b: uB.getParsedCost().total, inv: true },
        { label: 'Train Time', a: uA.trainTime, b: uB.trainTime, inv: true }
    ];
    table.innerHTML = stats.map(s => {
        const diff = s.a - s.b;
        let diffClass = diff === 0 ? 'diff-neutral' : ((diff > 0) !== s.inv ? 'diff-pos' : 'diff-neg');
        const diffTxt = diff === 0 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(s.label.includes('Reload') || s.label.includes('DPS') || s.label.includes('Hit') ? 1 : 0);
        return `<tr><td>${s.label}</td><td>${s.a.toFixed(s.label.includes('Reload') || s.label.includes('DPS') || s.label.includes('Hit') ? 1 : 0)}</td><td>${s.b.toFixed(s.label.includes('Reload') || s.label.includes('DPS') || s.label.includes('Hit') ? 1 : 0)}</td><td class="${diffClass}">${diffTxt}</td></tr>`;
    }).join('');

    const sumEl = document.getElementById('comparison-summary');
    if (sumEl) {
        const winA = res.armyA.totalHp > res.armyB.totalHp;
        const winner = winA ? dA.name : dB.name;
        const winHp = winA ? res.armyA.totalHp : res.armyB.totalHp;
        const maxHp = winA ? uA.hpPerUnit : uB.hpPerUnit;
        sumEl.innerHTML = `<h3 style="margin-top:0;">1v1 Result: <span style="color:${winA ? 'var(--army-a-color)' : 'var(--army-b-color)'}">${winner}</span> wins in ${res.duration.toFixed(1)}s with ${winHp.toFixed(0)}/${maxHp}hp remaining</h3>`;
    }
}

function onInputChange(shouldSyncURL = true, preserveScenario = false) {
    if (shouldSyncURL && !preserveScenario) activeScenario = null;
    const dA = getInputs('a'), dB = getInputs('b');
    const hA = document.getElementById('name-header-a'), hB = document.getElementById('name-header-b');
    if (hA) hA.textContent = dA.name; if (hB) hB.textContent = dB.name;
    const rlA = document.getElementById('ratio-label-a'), rlB = document.getElementById('ratio-label-b');
    if (rlA) rlA.textContent = `${dA.name} Count`; if (rlB) rlB.textContent = `${dB.name} Count`;
    const pnA = document.getElementById('prod-name-a'), pnB = document.getElementById('prod-name-b');
    if (pnA) pnA.textContent = `${dA.name} Production`; if (pnB) pnB.textContent = `${dB.name} Production`;

    const tA = document.getElementById('table-a-title'), s1X = document.getElementById('scale1vX-title');
    if (tA) tA.textContent = `1 ${dA.name} vs X ${dB.name}`; if (s1X) s1X.textContent = `1 ${dA.name} vs X ${dB.name} Scaling`;
    const tB = document.getElementById('table-b-title'), sX1 = document.getElementById('scaleXv1-title');
    if (tB) tB.textContent = `1 ${dB.name} vs X ${dA.name}`; if (sX1) sX1.textContent = `1 ${dB.name} vs X ${dA.name} Scaling`;

    const evA = document.getElementById('a-eng-val'), evB = document.getElementById('b-eng-val');
    const raA = document.getElementById('a-eng'), raB = document.getElementById('b-eng');
    if (evA && raA) evA.textContent = raA.value + '%';
    if (evB && raB) evB.textContent = raB.value + '%';
    const handleMicro = (p) => {
        const s = document.getElementById(`${p}-groups-slider`), h = document.getElementById(`${p}-groups`), v = parseInt(s?.value);
        if (s && h) {
            const disp = document.getElementById(`${p}-micro-val`);
            if (v === 5) { if (disp) disp.textContent = "Perfect"; h.value = 0; }
            else if (v === 1) { if (disp) disp.textContent = "Focus (1)"; h.value = 1; }
            else { if (disp) disp.textContent = `Split (${v})`; h.value = v; }
        }
    };
    handleMicro('a'); handleMicro('b');
    updateStatComparison(dA, dB); simulate();
    if (shouldSyncURL) syncURL();
}

function applyPreset(a, k, sSync = true) {
    const p = presets[k]; if (!p) return;
    const sI = document.querySelector(`.searchable-preset[data-army="${a}"] .preset-search`);
    if (sI) { sI.value = ""; sI.dataset.value = k; }
    ['name', 'hp', 'matk', 'patk', 'marm', 'parm', 'reload', 'range'].forEach(x => { const el = document.getElementById(`${a}-${x}`); if (el) el.value = p[x] || 0; });
    const f = document.getElementById(`${a}-food`), w = document.getElementById(`${a}-wood`), g = document.getElementById(`${a}-gold`);
    if (f) f.value = p.f; if (w) w.value = p.w; if (g) g.value = p.g;
    const pIds = { 'train': 'trainTime', 'build': 'buildings', 'delay': 'delay', 'tech': 'techDelay', 'pre': 'unitsBefore' };
    Object.entries(pIds).forEach(([id, key]) => {
        const el = document.getElementById(`p${a}-${id}`);
        if (el) el.value = (p[key] !== undefined) ? p[key] : (id === 'build' ? 1 : 0);
    });
    ['atk-speed', 'disc-all', 'disc-f', 'disc-w', 'disc-g', 'bonus-red', 'bonus'].forEach(x => { const el = document.getElementById(`${a}-${x}`); if (el) el.value = 0; });
    const gs = document.getElementById(`${a}-groups-slider`); if (gs) gs.value = 5;
    onInputChange(sSync);
}

function applyScenario(k) {
    const s = scenarios[k]; if (!s) return;
    activeScenario = k;
    const sI = document.querySelector('.scenario-search');
    if (sI) sI.value = "";
    applyPreset('a', s.a.preset, false); applyPreset('b', s.b.preset, false);
    ['a', 'b'].forEach(army => {
        const d = s[army];
        Object.keys(d).forEach(prop => {
            const pMap = { 
                'train-time': `p${army}-train`, 
                'buildings': `p${army}-build`, 
                'delay': `p${army}-delay`, 
                'tech-delay': `p${army}-tech`, 
                'pre': `p${army}-pre`, 
                'bbn': `${army}-bonus`,
                'amc': 'a-groups-slider',
                'bmc': 'b-groups-slider'
            };
            const elId = pMap[prop] || `${army}-${prop}`;
            const el = document.getElementById(elId); if (el) el.value = d[prop];
        });
    });
    const sd = document.getElementById('scenario-desc'); if (sd) sd.value = s.desc || "";
    onInputChange(true, true);
}

function initScenarioButtons() {
    const container = document.getElementById('featured-scenarios-container');
    if (!container) return;
    container.innerHTML = "";
    featuredScenarios.forEach(k => {
        const s = scenarios[k]; if (!s) return;
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        btn.dataset.scenario = k;
        btn.textContent = s.name;
        btn.addEventListener('click', () => applyScenario(k));
        container.appendChild(btn);
    });
}

function initSearchableScenarios() {
    const otherKeys = Object.keys(scenarios).filter(k => !featuredScenarios.includes(k))
        .sort((a, b) => (scenarios[a].name || a).localeCompare(scenarios[b].name || b));
    const sK = [...featuredScenarios.filter(k => scenarios[k]), ...otherKeys];

    const container = document.querySelector('.searchable-scenario');
    if (!container) return;
    const sI = container.querySelector('.scenario-search'), list = container.querySelector('.scenario-list');

    const render = (f = "") => {
        list.innerHTML = "";
        sK.forEach(k => {
            const name = scenarios[k].name || k;
            if (name.toLowerCase().includes(f.toLowerCase())) {
                const item = document.createElement('div'); item.className = 'scenario-item'; item.textContent = name;
                item.addEventListener('click', () => { applyScenario(k); list.classList.add('hidden'); });
                list.appendChild(item);
            }
        });
    };
    sI.addEventListener('focus', () => { sI.select(); list.classList.remove('hidden'); render(""); });
    sI.addEventListener('click', () => { list.classList.remove('hidden'); render(""); });
    sI.addEventListener('input', () => render(sI.value));
    document.addEventListener('click', (e) => { if (!container.contains(e.target)) list.classList.add('hidden'); });
}

function updateProductionAnalysis(dA, dB, cA, cB) {
    const searchMax = 1800, step = 5;
    let crossTime = -1, tempAdv = 0;
    for (let t = 0; t <= searchMax; t += step) {
        const cA_t = calculateCount(t, dA.delay, dA.techDelay, dA.trainTime, dA.buildings, dA.unitsBefore);
        const cB_t = calculateCount(t, dB.delay, dB.techDelay, dB.trainTime, dB.buildings, dB.unitsBefore);
        if (cA_t > 0 && cB_t > 0) {
            const res = (new CombatSim({ ...dA, count: cA_t }, { ...dB, count: cB_t }, cA, cB)).run();
            const adv = res.armyA.totalHp > res.armyB.totalHp ? 1 : -1;
            if (t > 0 && tempAdv !== 0 && adv !== tempAdv) { crossTime = t; break; }
            tempAdv = adv;
        } else if (cA_t > 0) tempAdv = 1; else if (cB_t > 0) tempAdv = -1;
    }
    const dMax = crossTime !== -1 ? Math.min(searchMax, crossTime + 300) : 600;
    const data = { labels: [], countA: [], countB: [], advantage: [] };
    let cross = null, contact = null;
    for (let t = 0; t <= dMax; t += step) {
        const cA_t = calculateCount(t, dA.delay, dA.techDelay, dA.trainTime, dA.buildings, dA.unitsBefore);
        const cB_t = calculateCount(t, dB.delay, dB.techDelay, dB.trainTime, dB.buildings, dB.unitsBefore);
        data.labels.push(t + 's'); data.countA.push(cA_t); data.countB.push(cB_t);
        let adv = 0;
        if (cA_t > 0 && cB_t > 0) {
            if (!contact) contact = { time: t, cA: cA_t, cB: cB_t };
            const res = (new CombatSim({ ...dA, count: cA_t }, { ...dB, count: cB_t }, cA, cB)).run();
            adv = res.armyA.totalHp > res.armyB.totalHp ? (res.armyA.totalHp / res.armyA.initialTotalHp * 100) : -(res.armyB.totalHp / res.armyB.initialTotalHp * 100);
            if (!cross && data.advantage.length > 0) {
                const prev = data.advantage[data.advantage.length - 1];
                if ((prev < 0 && adv > 0) || (prev > 0 && adv < 0)) cross = { time: t, cA: cA_t, cB: cB_t, win: adv > 0 ? dA.name : dB.name };
            }
        } else if (cA_t > 0) adv = 100; else if (cB_t > 0) adv = -100;
        data.advantage.push(adv);
    }
    renderProductionCharts(data, dA.name, dB.name);
    const r = document.getElementById('production-report-text'); if (!r) return;
    let msg = contact ? `<p>When the first <strong>${contact.cA > contact.cB ? dB.name : dA.name}</strong> arrives at ${contact.time}s, there will already be <strong>${Math.max(contact.cA, contact.cB)} ${contact.cA > contact.cB ? dA.name : dB.name}</strong>.</p>` : "";
    if (cross) {
        const winCount = cross.win === dA.name ? cross.cA : cross.cB;
        const loseCount = cross.win === dA.name ? cross.cB : cross.cA;
        const loseName = cross.win === dA.name ? dB.name : dA.name;
        msg += `<p><span style="color:var(--accent-color); font-weight:bold;">Tide Turns at ${cross.time}s!</span><br>The <strong>${cross.win}</strong> catches up once they have massed <strong>${winCount} units</strong> (vs <strong>${loseCount} ${loseName}</strong>).</p>`;
    } else {
        msg += `<p><strong>Dominance:</strong> ${data.advantage[data.advantage.length - 1] > 0 ? dA.name : dB.name} maintains the lead.</p>`;
    }
    r.innerHTML = msg;

    const renderReqs = (p, d) => {
        const el = document.getElementById(`p${p}-req`); if (!el) return;
        const u = new Unit(d); const cost = u.getParsedCost();
        const tPerU = u.trainTime / u.buildings;
        const f = cost.f / tPerU, w = cost.w / tPerU, g = cost.g / tPerU;
        el.innerHTML = `<div class="prod-req-item"><span class="prod-req-label">Food/s</span><span class="prod-req-val">${f.toFixed(1)}</span></div>` +
            `<div class="prod-req-item"><span class="prod-req-label">Wood/s</span><span class="prod-req-val">${w.toFixed(1)}</span></div>` +
            `<div class="prod-req-item"><span class="prod-req-label">Gold/s</span><span class="prod-req-val">${g.toFixed(1)}</span></div>` +
            `<div class="prod-req-item" style="margin-left:10px;"><span class="prod-req-label">Total/s</span><span class="prod-req-val" style="color:white;">${(f + w + g).toFixed(1)}</span></div>`;
    };
    renderReqs('a', dA); renderReqs('b', dB);
}

function renderProductionCharts(data, nA, nB) {
    const c1 = document.getElementById('prodGrowthChart'), c2 = document.getElementById('prodAdvantageChart');
    if (c1) {
        const ctx = c1.getContext('2d'); if (charts['prodGrowth']) charts['prodGrowth'].destroy();
        charts['prodGrowth'] = new Chart(ctx, { type: 'line', data: { labels: data.labels, datasets: [{ label: nA, data: data.countA, borderColor: '#3498db', tension: 0, pointRadius: 0 }, { label: nB, data: data.countB, borderColor: '#e74c3c', tension: 0, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false } });
    }
    if (c2) {
        const ctx = c2.getContext('2d'); if (charts['prodAdv']) charts['prodAdv'].destroy();
        charts['prodAdv'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Advantage (+A / -B)',
                    data: data.advantage,
                    borderColor: '#f39c12',
                    fill: {
                        target: 'origin',
                        above: 'rgba(52, 152, 219, 0.2)',
                        below: 'rgba(231, 76, 60, 0.2)'
                    },
                    tension: 0.2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: -100,
                        max: 100
                    }
                }
            }
        });
    }
}

function updateScalingAnalysis(dA, dB, cA, cB) {
    const scales = [1, 2, 3, 5, 8, 10, 15, 20, 30, 40, 50];
    const costA = (new Unit(dA)).getParsedCost().total, costB = (new Unit(dB)).getParsedCost().total;
    const runSet = (mode) => {
        const rS = { labels: scales, hpA: [], hpB: [], winPoint: -1, costPoint: -1 };
        scales.forEach(s => {
            let curA = { ...dA }, curB = { ...dB };
            if (mode === '1vX') { curA.count = 1; curB.count = s; } else if (mode === 'Xv1') { curA.count = s; curB.count = 1; } else { curA.count = s; curB.count = s; }
            const res = (new CombatSim(curA, curB, cA, cB)).run();
            rS.hpA.push(res.armyA.totalHp / res.armyA.initialTotalHp * 100); rS.hpB.push(res.armyB.totalHp / res.armyB.initialTotalHp * 100);
            const lostA = (curA.count - res.armyA.remaining) * costA, lostB = (curB.count - res.armyB.remaining) * costB;
            if (rS.winPoint === -1 && ((mode === '1vX' && res.armyB.totalHp > 0 && res.armyA.totalHp === 0) || (mode === 'Xv1' && res.armyA.totalHp > 0 && res.armyB.totalHp === 0))) rS.winPoint = s;
            if (rS.costPoint === -1) { if (mode === '1vX' && lostA > 0 && (lostB / lostA) < 1) rS.costPoint = s; if (mode === 'Xv1' && lostB > 0 && (lostA / lostB) < 1) rS.costPoint = s; }
        });
        return rS;
    };
    const s1vX = runSet('1vX'), sXv1 = runSet('Xv1');
    renderDecisivenessChart('scale1vXChart', s1vX, dA.name, dB.name);
    renderDecisivenessChart('scaleXv1Chart', sXv1, dA.name, dB.name);
    generateMatchupReport(dA, dB, s1vX, sXv1, costA, costB);
}

function updateSummary(dA, dB, res) {
    const el = document.getElementById('stat-summary'); if (!el) return;
    const winner = res.armyA.totalHp > res.armyB.totalHp ? dA.name : dB.name;
    const hpA = (res.armyA.totalHp / res.armyA.initialTotalHp * 100).toFixed(1);
    const hpB = (res.armyB.totalHp / res.armyB.initialTotalHp * 100).toFixed(1);
    const remA = Math.ceil(res.armyA.remaining), remB = Math.ceil(res.armyB.remaining);
    el.innerHTML = `<h3>Winner: <span style="color:${res.armyA.totalHp > res.armyB.totalHp ? 'var(--army-a-color)' : 'var(--army-b-color)'}">${winner}</span></h3><p>${dA.name} survivors: <strong>${remA}</strong> (${hpA}%) | ${dB.name} survivors: <strong>${remB}</strong> (${hpB}%)</p><p>Duration: ${res.duration.toFixed(1)}s</p>`;
}

function updateMatchupTables(dA, dB, cA, cB) {
    const scales = [1, 2, 3, 5, 8, 10, 15, 20];
    const updateTable = (id, mainUnit, oppUnit, isAvsX) => {
        const tbody = document.querySelector(`#${id} tbody`); if (!tbody) return;
        tbody.innerHTML = scales.map(s => {
            const curA = isAvsX ? { ...mainUnit, count: 1 } : { ...oppUnit, count: s };
            const curB = isAvsX ? { ...oppUnit, count: s } : { ...mainUnit, count: 1 };
            const res = (new CombatSim(curA, curB, cA, cB)).run();

            const mainRes = isAvsX ? res.armyA : res.armyB;
            const oppRes = isAvsX ? res.armyB : res.armyA;

            let resultHtml = "";
            if (mainRes.totalHp > 0) {
                const hp = mainRes.totalHp.toFixed(0);
                resultHtml = `<span class="diff-pos">Wins with ${hp}hp</span>`;
            } else {
                const oppHp = (oppRes.totalHp / oppRes.initialTotalHp * 100).toFixed(0);
                resultHtml = `<span class="diff-neg">Loses, enemy ${oppHp}% hp</span>`;
            }

            return `<tr><td>1 vs ${s}</td><td>${resultHtml}</td></tr>`;
        }).join('');
    };
    updateTable('matchups-a', dA, dB, true); updateTable('matchups-b', dB, dA, false);
}

function generateMatchupReport(dA, dB, s1vX, sXv1, costA, costB) {
    const el = document.getElementById('matchup-report'); if (!el) return;
    let msg = `<h3>Matchup Analysis: ${dA.name} vs ${dB.name}</h3>`;
    if (s1vX.winPoint !== -1) msg += `<p>1 ${dA.name} can defeat up to <strong>${s1vX.winPoint - 1}</strong> ${dB.name}.</p>`;
    if (sXv1.winPoint !== -1) msg += `<p>1 ${dB.name} can defeat up to <strong>${sXv1.winPoint - 1}</strong> ${dA.name}.</p>`;
    el.innerHTML = msg;
}

function renderDecisivenessChart(id, data, nA, nB) {
    const el = document.getElementById(id); if (!el) return;
    const ctx = el.getContext('2d'); if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, { type: 'line', data: { labels: data.labels, datasets: [{ label: `${nA} % HP`, data: data.hpA, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: true, tension: 0.1, pointRadius: 0 }, { label: `${nB} % HP`, data: data.hpB, borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true, tension: 0.1, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } } });
}

function updateTimeCharts(h, nA, nB) {
    const labels = h.map(x => x.time.toFixed(1) + 's');
    const cConfigs = [{ id: 'countChart', dA: h.map(x => x.countA), dB: h.map(x => x.countB), s: true }, { id: 'hpChart', dA: h.map(x => x.hpA), dB: h.map(x => x.hpB) }, { id: 'valueChart', dA: h.map(x => x.valRemainingA), dB: h.map(x => x.valRemainingB), s: false }, { id: 'efficiencyChart', l: 'Ratio', dA: h.map(x => x.valLostA === 0 ? (x.valLostB > 0 ? 5 : 1) : x.valLostB / x.valLostA), single: true }];
    cConfigs.forEach(conf => {
        const el = document.getElementById(conf.id); if (!el) return;
        const ctx = el.getContext('2d'); if (charts[conf.id]) charts[conf.id].destroy();
        const ds = conf.single ? [{ label: 'Ratio', data: conf.dA, borderColor: '#f39c12', tension: 0.1, pointRadius: 0 }] : [{ label: nA, data: conf.dA, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: true, tension: 0, stepped: conf.s, pointRadius: 0 }, { label: nB, data: conf.dB, borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true, tension: 0, stepped: conf.s, pointRadius: 0 }];
        charts[conf.id] = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: ds }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { y: { beginAtZero: true } } } });
    });
}

function resetApp() {
    window.location.search = '';
    applyScenario('champi_vs_scouts');
}

function initSearchablePresets() {
    const sK = Object.keys(presets).sort((a, b) => presets[a].name.localeCompare(presets[b].name));
    document.querySelectorAll('.searchable-preset').forEach(container => {
        const army = container.dataset.army, sI = container.querySelector('.preset-search'), list = container.querySelector('.preset-list');
        const render = (f = "") => {
            list.innerHTML = "";
            sK.forEach(k => {
                if (presets[k].name.toLowerCase().includes(f.toLowerCase())) {
                    const item = document.createElement('div'); item.className = 'preset-item'; item.textContent = presets[k].name;
                    item.addEventListener('click', () => { applyPreset(army, k); list.classList.add('hidden'); });
                    list.appendChild(item);
                }
            });
        };
        sI.addEventListener('focus', () => { sI.select(); list.classList.remove('hidden'); render(""); });
        sI.addEventListener('click', () => { list.classList.remove('hidden'); render(""); });
        sI.addEventListener('input', () => render(sI.value));
        document.addEventListener('click', (e) => { if (!container.contains(e.target)) list.classList.add('hidden'); });
    });
}

function loadDefaults() {
    document.querySelectorAll('input, select, textarea').forEach(el => { if (el.id) defaults[el.id] = el.value; });
}

function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const updateToggleIcon = () => {
        const isLight = document.body.classList.contains('light-theme') || 
                       (!document.body.classList.contains('dark-theme') && window.matchMedia('(prefers-color-scheme: light)').matches);
        toggle.textContent = isLight ? '🌙' : '☀️';
    };

    const setTheme = (theme) => {
        document.body.classList.remove('light-theme', 'dark-theme');
        if (theme) document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme || 'system');
        updateToggleIcon();
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'system') {
        setTheme(savedTheme);
    } else {
        updateToggleIcon();
    }

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
            updateToggleIcon();
        }
    });

    toggle.addEventListener('click', () => {
        const isCurrentlyLight = document.body.classList.contains('light-theme') || 
                                (!document.body.classList.contains('dark-theme') && window.matchMedia('(prefers-color-scheme: light)').matches);
        
        const newTheme = isCurrentlyLight ? 'dark' : 'light';
        const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        
        // If the new manual choice matches the system, just go back to system mode
        if (newTheme === systemTheme) {
            setTheme(null); // system
        } else {
            setTheme(newTheme);
        }
    });
}

window.onload = () => {
    loadDefaults(); initSearchablePresets(); initSearchableScenarios(); initScenarioButtons(); setupTheme();
    const navB = document.querySelector('.nav-brand'), headH = document.querySelector('header h1');
    if (navB) navB.addEventListener('click', resetApp); if (headH) headH.addEventListener('click', resetApp);
    document.querySelectorAll('.count-btn').forEach(b => b.addEventListener('click', () => { const i = document.getElementById(`${b.dataset.army}-count`); if (i) { i.value = Math.max(1, parseInt(i.value) + parseInt(b.dataset.delta)); onInputChange(); } }));
    document.querySelectorAll('.delay-btn').forEach(btn => btn.addEventListener('click', () => { const army = btn.dataset.army, add = parseInt(btn.dataset.add), input = document.getElementById(`p${army}-delay`); if (input) { input.value = parseInt(input.value || 0) + add; onInputChange(); } }));
    document.querySelectorAll('.tech-delay-btn').forEach(btn => btn.addEventListener('click', () => { const army = btn.dataset.army, add = parseInt(btn.dataset.add), input = document.getElementById(`p${army}-tech`); if (input) { input.value = parseInt(input.value || 0) + add; onInputChange(); } }));
    document.querySelectorAll('.step-btn').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.id, delta = parseFloat(btn.dataset.val), input = document.getElementById(id);
        if (input) { input.value = (parseFloat(input.value) + delta).toFixed(id.includes('reload') ? 1 : 0); onInputChange(); }
    }));
    document.querySelectorAll('input, select, textarea').forEach(el => { if (el.classList.contains('preset-search') || el.classList.contains('scenario-search')) return; el.addEventListener('input', () => onInputChange()); });
    const shareB = document.getElementById('share-btn'); if (shareB) shareB.addEventListener('click', () => { navigator.clipboard.writeText(window.location.href); const oT = shareB.textContent; shareB.textContent = "Copied!"; setTimeout(() => shareB.textContent = oT, 2000); });
    document.querySelectorAll('.toggle-stats-btn').forEach(btn => btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            const isCollapsed = targetEl.classList.toggle('collapsed');
            btn.textContent = isCollapsed ? 'Edit' : 'Hide Stats';
        }
    }));
    loadState();
};

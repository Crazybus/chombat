import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CombatSim } from '../sim/CombatSim';
import { Unit } from '../sim/Unit';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';

const StatComparison: React.FC = () => {
  const { state, analysisA, analysisB } = useSimulation();

  const result = useMemo(() => {
    if (!analysisA || !analysisB) return null;

    const configA = { ...state.a, c: 1 };
    const configB = { ...state.b, c: 1 };
    
    const techsById: Record<number, any> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    const allUnits = { ...units, ...presets };

    const sim = new CombatSim(analysisA.baseUnit, analysisB.baseUnit, configA, configB, techsById, allUnits);
    const res = sim.run();
    
    return {
      res,
      uA: new Unit(sim.dataA),
      uB: new Unit(sim.dataB),
      baseA: analysisA.naturalBase,
      baseB: analysisB.naturalBase,
      nameA: analysisA.unitName,
      nameB: analysisB.unitName,
    };
  }, [analysisA, analysisB, state.a, state.b]);

  if (!result || !analysisA || !analysisB) return null;
  const { res, uA, uB, nameA, nameB, baseA, baseB } = result;

  const formatWithBase = (total: number, base: number) => {
    const diff = total - base;
    if (Math.abs(diff) < 0.01) return total.toFixed(0);
    return `${total.toFixed(0)} (${base.toFixed(0)} + ${diff.toFixed(0)})`;
  };

  const getNetDmg = (atk: Unit, def: Unit) => {
    const isMelee = atk.isMelee();
    const baseAtk = isMelee ? atk.matk : atk.patk;
    const baseArm = isMelee ? def.marm : def.parm;

    let bonus = 0;
    const attBonuses = atk.bonuses || {};
    const defArmors = def.armors || {};

    for (const [cls, amt] of Object.entries(attBonuses)) {
      if (defArmors[cls] !== undefined) {
        const defArm = defArmors[cls] || 0;
        bonus += Math.max(0, amt - defArm);
      }
    }

    return { base: baseAtk, arm: baseArm, bonus, net: Math.max(1, baseAtk - baseArm + bonus) };
  };

  const nA = getNetDmg(uA, uB);
  const nB = getNetDmg(uB, uA);

  const getBaseAtk = (u: Unit, b: any) => u.isMelee() ? b.matk : b.patk;
  const getBaseArm = (u: Unit, b: any) => u.isMelee() ? b.marm : b.parm;

  const hitsToKillA = Math.ceil(uB.hpPerUnit / nA.net);
  const hitsToKillB = Math.ceil(uA.hpPerUnit / nB.net);
  const timeToKillA = hitsToKillA * uA.reload;
  const timeToKillB = hitsToKillB * uB.reload;
  const duration = res.duration;

  let winner = 'Draw';
  let winnerColor = 'var(--text-color)';
  let remainingInfo = '';

  if (res.armyA.totalHp > res.armyB.totalHp) {
    winner = nameA;
    winnerColor = 'var(--army-a-color)';
    remainingInfo = `${res.armyA.totalHp.toFixed(0)} HP remaining`;
  } else if (res.armyB.totalHp > res.armyA.totalHp) {
    winner = nameB;
    winnerColor = 'var(--army-b-color)';
    remainingInfo = `${res.armyB.totalHp.toFixed(0)} HP remaining`;
  }

  const rows = [
    { label: 'HP (base + upgrades)', a: formatWithBase(uA.hpPerUnit, baseA?.hp || uA.hpPerUnit), b: formatWithBase(uB.hpPerUnit, baseB?.hp || uB.hpPerUnit) },
    { label: 'Attack (base + upgrades)', a: formatWithBase(nA.base, getBaseAtk(uA, baseA)), b: formatWithBase(nB.base, getBaseAtk(uB, baseB)) },
    { label: 'Bonus Dmg', a: nA.bonus.toFixed(0), b: nB.bonus.toFixed(0) },
    { label: 'Armor', a: formatWithBase(nA.arm, getBaseArm(uA, baseA)), b: formatWithBase(nB.arm, getBaseArm(uB, baseB)) },
    { label: 'Damage Per Hit', a: `${nA.net.toFixed(0)} (${nA.base.toFixed(0)} - ${nA.arm.toFixed(0)} + ${nA.bonus.toFixed(0)})`, b: `${nB.net.toFixed(0)} (${nB.base.toFixed(0)} - ${nB.arm.toFixed(0)} + ${nB.bonus.toFixed(0)})` },
    { label: 'Hits to Kill', a: hitsToKillA.toString(), b: hitsToKillB.toString() },
    { label: 'Hits Performed', a: (winner === nameA ? hitsToKillA : Math.floor(duration / uA.reload)).toString(), b: (winner === nameB ? hitsToKillB : Math.floor(duration / uB.reload)).toString() },
    { label: 'Time to Kill', a: timeToKillA.toFixed(1) + 's', b: timeToKillB.toFixed(1) + 's' },
    { label: 'Attack Reload Time', a: uA.reload.toFixed(2), b: uB.reload.toFixed(2) },
    { label: 'Damage Per Second', a: (nA.net / uA.reload).toFixed(2), b: (nB.net / uB.reload).toFixed(2) },
  ];

  return (
    <div id="comparison" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Stat Comparison</h2>
        <p>Direct 1v1 comparison: <strong>{nameA}</strong> vs <strong>{nameB}</strong></p>
      </div>
      
      <div className="results-area" style={{ width: '100%' }}>
        <div id="comparison-summary">
           <div style={{ textAlign: 'center', padding: '15px', background: 'var(--panel-bg-alt)', borderRadius: '4px', marginBottom: '20px', border: '1px solid var(--border-dim)' }}>
            <span style={{ fontSize: '1.4rem' }}>
              Winner: <span style={{ color: winnerColor, fontWeight: 'bold' }}>{winner}</span> {remainingInfo && `(${remainingInfo})`}
            </span>
          </div>
        </div>

        <div className="stat-duel-table" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header */}
          <div className="duel-row duel-header" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr 120px', gap: '10px', padding: '10px', fontWeight: 'bold', borderBottom: '2px solid var(--border-dim)', textAlign: 'center' }}>
            <div style={{ textAlign: 'left' }}>Attribute</div>
            <div style={{ color: 'var(--army-a-color)' }}>{nameA}</div>
            <div>Difference</div>
            <div style={{ color: 'var(--army-b-color)' }}>{nameB}</div>
          </div>

          {/* Rows */}
          {rows.map((r, i) => {
            const vA = parseFloat(String(r.a));
            const vB = parseFloat(String(r.b));
            const diff = vA - vB;
            
            let diffColor = 'var(--text-dim)';
            if (diff > 0) diffColor = 'var(--success-color)';
            else if (diff < 0) diffColor = 'var(--danger-color)';

            const diffDisplay = diff === 0 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(r.label.includes('DPS') || r.label.includes('Time') || r.label.includes('Reload') ? 2 : 0);

            return (
              <div key={r.label} className="duel-row" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr 120px', gap: '10px', padding: '12px 10px', background: i % 2 === 0 ? 'var(--panel-bg)' : 'var(--panel-bg-alt)', borderRadius: '4px', borderBottom: '1px solid var(--border-dim)', alignItems: 'center' }}>
                <div style={{ textAlign: 'left', fontWeight: 'bold', color: 'var(--text-dim)' }}>{r.label}</div>
                <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>{r.a}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem', background: 'rgba(0,0,0,0.1)', color: diffColor }}>
                    {diffDisplay}
                  </span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>{r.b}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatComparison;

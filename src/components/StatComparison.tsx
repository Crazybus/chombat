import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CombatSim } from '../sim/CombatSim';
import { Unit } from '../sim/Unit';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';

const StatComparison: React.FC = () => {
  const { state } = useSimulation();
  
  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const result = useMemo(() => {
    const dA = allUnits[state.a.ps || ''] || allUnits['archer'];
    const dB = allUnits[state.b.ps || ''] || allUnits['skirmisher'];
    
    // Create configs for sim (without counts for 1v1 comparison)
    const configA = { ...state.a, c: 1 };
    const configB = { ...state.b, c: 1 };
    
    const sim = new CombatSim(dA, dB, configA, configB, techsById, allUnits);
    const res = sim.run();
    
    return {
      res,
      uA: new Unit(sim.dataA),
      uB: new Unit(sim.dataB),
      baseA: dA,
      baseB: dB,
      nameA: state.a.nm || dA.name,
      nameB: state.b.nm || dB.name,
    };
  }, [state.a, state.b, allUnits, techsById]);

  const { uA, uB, nameA, nameB, baseA, baseB } = result;

  const formatWithBase = (total: number, base: number) => {
    const diff = total - base;
    if (Math.abs(diff) < 0.01) return total.toFixed(0);
    return `${total.toFixed(0)} (${base.toFixed(0)} + ${diff.toFixed(0)})`;
  };

  const getNetDmg = (atk: Unit, def: Unit) => {
    const isMelee = atk.range <= 1;
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

  const getBaseAtk = (u: Unit, baseData: any) => {
    if (!baseData) return u.isMelee() ? u.matk : u.patk;
    return u.isMelee() ? (baseData.matk || 0) : (baseData.patk || 0);
  };
  const getBaseArm = (u: Unit, baseData: any) => {
    if (!baseData) return u.isMelee() ? u.marm : u.parm;
    return u.isMelee() ? (baseData.marm || 0) : (baseData.parm || 0);
  };

  const timeToKillA = Math.ceil(uB.hpPerUnit / nA.net) * uA.reload;
  const timeToKillB = Math.ceil(uA.hpPerUnit / nB.net) * uB.reload;

  let winner = 'Draw';
  let winnerColor = 'var(--text-color)';
  let remainingInfo = '';

  if (timeToKillA < timeToKillB) {
    winner = nameA;
    winnerColor = 'var(--army-a-color)';
    const shotsBCanFire = Math.ceil(timeToKillA / uB.reload);
    const remainingHp = Math.max(0, uA.hpPerUnit - shotsBCanFire * nB.net);
    remainingInfo = `${remainingHp.toFixed(0)} HP remaining`;
  } else if (timeToKillB < timeToKillA) {
    winner = nameB;
    winnerColor = 'var(--army-b-color)';
    const shotsACanFire = Math.ceil(timeToKillB / uA.reload);
    const remainingHp = Math.max(0, uB.hpPerUnit - shotsACanFire * nA.net);
    remainingInfo = `${remainingHp.toFixed(0)} HP remaining`;
  }

  const rows = [
    { label: 'HP (base + upgrades)', a: formatWithBase(uA.hpPerUnit, baseA?.hp || uA.hpPerUnit), b: formatWithBase(uB.hpPerUnit, baseB?.hp || uB.hpPerUnit) },
    { label: 'Attack (base + upgrades)', a: formatWithBase(nA.base, getBaseAtk(uA, baseA)), b: formatWithBase(nB.base, getBaseAtk(uB, baseB)) },
    { label: 'Bonus Dmg', a: nA.bonus.toFixed(0), b: nB.bonus.toFixed(0) },
    { label: 'Armor', a: formatWithBase(nA.arm, getBaseArm(uA, baseA)), b: formatWithBase(nB.arm, getBaseArm(uB, baseB)), inv: true },
    { label: 'Damage Per Hit', a: `${nA.net.toFixed(0)} (${nA.base.toFixed(0)} - ${getBaseArm(uB, baseB).toFixed(0)} + ${nA.bonus.toFixed(0)})`, b: `${nB.net.toFixed(0)} (${nB.base.toFixed(0)} - ${getBaseArm(uA, baseA).toFixed(0)} + ${nB.bonus.toFixed(0)})` },
    { label: 'Hits to Kill', a: Math.ceil(uB.hpPerUnit / nA.net).toString(), b: Math.ceil(uA.hpPerUnit / nB.net).toString(), inv: true },
    { label: 'Time to Kill', a: timeToKillA.toFixed(1) + 's', b: timeToKillB.toFixed(1) + 's', inv: true },
    { label: 'Attack Reload Time', a: uA.reload.toFixed(2), b: uB.reload.toFixed(2), inv: true },
    { label: 'Damage Per Second', a: (nA.net / uA.reload).toFixed(2), b: (nB.net / uB.reload).toFixed(2) },
  ];

  return (
    <div id="comparison" className="section-anchor">
      <div className="section-header">
        <h2>Stat Comparison</h2>
        <p>Direct 1v1 comparison of both units.</p>
      </div>
      <div className="results-area">
        <div id="comparison-summary">
           <div style={{ textAlign: 'center', padding: '15px', background: 'var(--panel-bg-alt)', borderRadius: '4px', marginBottom: '15px' }}>
            <span style={{ fontSize: '1.3rem' }}>
              Winner: <span style={{ color: winnerColor, fontWeight: 'bold' }}>{winner}</span> {remainingInfo && `with ${remainingInfo}`}
            </span>
          </div>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>{nameA}</th>
              <th>{nameB}</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const vA = parseFloat(String(r.a));
              const vB = parseFloat(String(r.b));
              const diff = vA - vB;
              let dClass = 'diff-neutral';
              if (diff > 0) dClass = r.inv ? 'diff-neg' : 'diff-pos';
              else if (diff < 0) dClass = r.inv ? 'diff-pos' : 'diff-neg';
              
              return (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.a}</td>
                  <td>{r.b}</td>
                  <td className={dClass}>{diff === 0 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(r.label.includes('DPS') || r.label.includes('Time') || r.label.includes('Reload') ? 2 : 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatComparison;

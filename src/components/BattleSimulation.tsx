import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CombatSim } from '../sim/CombatSim';
import { calculateEqualResources, calculateEqualProductionTime } from '../sim/ArmyAnalyzer';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import CombatCharts from './CombatCharts';
import StatsSummary from './StatsSummary';

const BattleSimulation: React.FC = () => {
  const { state, updateArmy, analysisA, analysisB } = useSimulation();
  
  const res = useMemo(() => {
    if (!analysisA || !analysisB) return null;

    const techsByIdMap: Record<number, any> = {};
    Object.values(techs).forEach(t => techsByIdMap[t.id] = t);
    const allUnits = { ...units, ...presets };

    const sim = new CombatSim(analysisA.baseUnit, analysisB.baseUnit, state.a, state.b, techsByIdMap, allUnits);
    return sim.run();
  }, [state.a, state.b, analysisA, analysisB]);

  if (!res || !analysisA || !analysisB) return null;

  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const winA = res.armyA.totalHp > res.armyB.totalHp;
  const color = winA ? 'var(--army-a-color)' : 'var(--army-b-color)';

  const ratioA = res.armyA.initialTotalHp > 0 ? ((res.armyA.totalHp / res.armyA.initialTotalHp) * 100).toFixed(1) : '0.0';
  const ratioB = res.armyB.initialTotalHp > 0 ? ((res.armyB.totalHp / res.armyB.initialTotalHp) * 100).toFixed(1) : '0.0';

  const survivorsA = isNaN(res.armyA.remaining) ? 0 : Math.ceil(res.armyA.remaining);
  const survivorsB = isNaN(res.armyB.remaining) ? 0 : Math.ceil(res.armyB.remaining);
  const duration = isNaN(res.duration) ? 0 : res.duration;

  const setEqualResources = () => {
    const newCountB = calculateEqualResources(state.a.c || 1, analysisA.baseUnit, state.a, analysisB.baseUnit, state.b);
    updateArmy('b', { c: Math.max(1, newCountB) });
  };

  const setEqualProduction = () => {
    const newCountB = calculateEqualProductionTime(state.a.c || 1, analysisA.baseUnit, state.a, analysisB.baseUnit, state.b);
    updateArmy('b', { c: Math.max(1, newCountB) });
  };

  return (
    <div id="battle" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Battle Simulation</h2>
        <p>Simulated combat results based on specific army sizes.</p>
      </div>

      <div className="ratio-bar">
        <div className="counter-group">
          <label>{nameA} Count</label>
          <div className="counter-controls">
            <button className="count-btn" onClick={() => updateArmy('a', { c: Math.max(1, (state.a.c || 1) - 1) })}>−</button>
            <input type="number" value={state.a.c || 1} readOnly />
            <button className="count-btn" onClick={() => updateArmy('a', { c: (state.a.c || 1) + 1 })}>+</button>
          </div>
          <div style={{ marginTop: '10px' }}>
            <StatsSummary army="a" compact={true} />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="nav-btn" style={{ background: 'var(--btn-bg)', color: 'var(--text-color)', fontSize: '0.7rem' }} onClick={setEqualResources}>Equal Resources</button>
          <button className="nav-btn" style={{ background: 'var(--btn-bg)', color: 'var(--text-color)', fontSize: '0.7rem' }} onClick={setEqualProduction}>Equal Prod Time</button>
        </div>

        <div className="counter-group">
          <label>{nameB} Count</label>
          <div className="counter-controls">
            <button className="count-btn" onClick={() => updateArmy('b', { c: Math.max(1, (state.b.c || 1) - 1) })}>−</button>
            <input type="number" value={state.b.c || 1} readOnly />
            <button className="count-btn" onClick={() => updateArmy('b', { c: (state.b.c || 1) + 1 })}>+</button>
          </div>
          <div style={{ marginTop: '10px' }}>
            <StatsSummary army="b" compact={true} />
          </div>
        </div>
      </div>

      <section id="results" className="results-area" style={{ width: '100%' }}>
        <div id="overall-result" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', color }}>
          Winner: {winA ? nameA : nameB} ({duration.toFixed(1)}s)
        </div>
        <div id="stat-summary" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p>{nameA} survivors: <strong>{String(survivorsA)}</strong> ({ratioA}%) | {nameB} survivors: <strong>{String(survivorsB)}</strong> ({ratioB}%)</p>
        </div>
        
        <CombatCharts history={res.history} nameA={nameA} nameB={nameB} />
      </section>
    </div>
  );
};

export default BattleSimulation;

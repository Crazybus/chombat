import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CombatSim } from '../sim/CombatSim';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import CombatCharts from './CombatCharts';

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

  const ratioA = ((res.armyA.totalHp / res.armyA.initialTotalHp) * 100).toFixed(1);
  const ratioB = ((res.armyB.totalHp / res.armyB.initialTotalHp) * 100).toFixed(1);

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
        </div>
        <div className="ratio-vs">VS</div>
        <div className="counter-group">
          <label>{nameB} Count</label>
          <div className="counter-controls">
            <button className="count-btn" onClick={() => updateArmy('b', { c: Math.max(1, (state.b.c || 1) - 1) })}>−</button>
            <input type="number" value={state.b.c || 1} readOnly />
            <button className="count-btn" onClick={() => updateArmy('b', { c: (state.b.c || 1) + 1 })}>+</button>
          </div>
        </div>
      </div>

      <section id="results" className="results-area" style={{ width: '100%' }}>
        <div id="overall-result" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', color }}>
          Winner: {winA ? nameA : nameB} ({res.duration.toFixed(1)}s)
        </div>
        <div id="stat-summary" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p>{nameA} survivors: <strong>{Math.ceil(res.armyA.remaining)}</strong> ({ratioA}%) | {nameB} survivors: <strong>{Math.ceil(res.armyB.remaining)}</strong> ({ratioB}%)</p>
        </div>
        
        <CombatCharts history={res.history} nameA={nameA} nameB={nameB} />
      </section>
    </div>
  );
};

export default BattleSimulation;

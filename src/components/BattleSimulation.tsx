import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CombatSim } from '../sim/CombatSim';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import CombatCharts from './CombatCharts';

const BattleSimulation: React.FC = () => {
  const { state, updateArmy } = useSimulation();
  
  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const res = useMemo(() => {
    const dA = allUnits[state.a.ps || ''] || allUnits['archer'];
    const dB = allUnits[state.b.ps || ''] || allUnits['skirmisher'];
    
    const sim = new CombatSim(dA, dB, state.a, state.b, techsById, allUnits);
    return sim.run();
  }, [state.a, state.b, allUnits, techsById]);

  const nameA = state.a.nm || (allUnits[state.a.ps || '']?.name) || 'Unit A';
  const nameB = state.b.nm || (allUnits[state.b.ps || '']?.name) || 'Unit B';

  const winA = res.armyA.totalHp > res.armyB.totalHp;
  const color = winA ? 'var(--army-a-color)' : 'var(--army-b-color)';

  const ratioA = ((res.armyA.totalHp / res.armyA.initialTotalHp) * 100).toFixed(1);
  const ratioB = ((res.armyB.totalHp / res.armyB.initialTotalHp) * 100).toFixed(1);

  return (
    <div id="battle" className="section-anchor">
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

      <section id="results" className="results-area">
        <div id="overall-result" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', color }}>
          Winner: {winA ? nameA : nameB} ({res.duration.toFixed(1)}s)
        </div>
        <div id="stat-summary" style={{ textAlign: 'center' }}>
          <p>{nameA} survivors: <strong>{Math.ceil(res.armyA.remaining)}</strong> ({ratioA}%) | {nameB} survivors: <strong>{Math.ceil(res.armyB.remaining)}</strong> ({ratioB}%)</p>
        </div>
        
        <CombatCharts history={res.history} nameA={nameA} nameB={nameB} />
      </section>
    </div>
  );
};

export default BattleSimulation;

import React, { useMemo, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { calculateCount, ProductionResult } from '../sim/ProductionSim';
import { CombatSim } from '../sim/CombatSim';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { Line } from 'react-chartjs-2';

const ProductionSimulation: React.FC = () => {
  const { state } = useSimulation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const searchMax = 1800;
  const step = 10;

  const results = useMemo(() => {
    const data: any = { labels: [], countA: [], countB: [], advantage: [], economyA: [], economyB: [] };
    
    const dA = allUnits[state.a.ps || ''] || allUnits['archer'];
    const dB = allUnits[state.b.ps || ''] || allUnits['skirmisher'];
    
    const baseCostA = { f: dA.f, w: dA.w, g: dA.g };
    const baseCostB = { f: dB.f, w: dB.w, g: dB.g };

    let finalResA: ProductionResult | null = null;
    let finalResB: ProductionResult | null = null;

    for (let t = 0; t <= searchMax; t += step) {
      const resA = calculateCount(t, state.a.tl || [], baseCostA, state.a.cont, state.a.sv);
      const resB = calculateCount(t, state.b.tl || [], baseCostB, state.b.cont, state.b.sv);
      
      data.labels.push(t + 's');
      data.countA.push(resA.count);
      data.countB.push(resB.count);
      data.economyA.push(resA.economyHistory[resA.economyHistory.length - 1]);
      data.economyB.push(resB.economyHistory[resB.economyHistory.length - 1]);

      let adv = 0;
      if (resA.count > 0 || resB.count > 0) {
        if (resA.count > 0 && resB.count > 0) {
          const sim = new CombatSim(dA, dB, { ...state.a, c: resA.count }, { ...state.b, c: resB.count }, techsById, allUnits);
          const combatRes = sim.run();
          adv = combatRes.armyA.totalHp > combatRes.armyB.totalHp 
            ? (combatRes.armyA.totalHp / combatRes.armyA.initialTotalHp) * 100 
            : -(combatRes.armyB.totalHp / combatRes.armyB.initialTotalHp) * 100;
        } else if (resA.count > 0) {
          adv = 100;
        } else {
          adv = -100;
        }
      }
      data.advantage.push(adv);

      if (t === searchMax) {
        finalResA = resA;
        finalResB = resB;
      }
    }

    return { data, finalResA, finalResB, nameA: state.a.nm || dA.name, nameB: state.b.nm || dB.name };
  }, [state.a, state.b, allUnits, techsById]);

  const { data, finalResA, finalResB, nameA, nameB } = results;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0 }, point: { radius: 0 } }
  };

  const growthData = {
    labels: data.labels,
    datasets: [
      { label: nameA, data: data.countA, borderColor: 'var(--army-a-color)' },
      { label: nameB, data: data.countB, borderColor: 'var(--army-b-color)' },
    ]
  };

  const advantageData = {
    labels: data.labels,
    datasets: [
      { 
        label: 'Advantage (+A / -B)', 
        data: data.advantage, 
        borderColor: 'var(--accent-color)',
        fill: { target: 'origin', above: 'rgba(52, 152, 219, 0.2)', below: 'rgba(231, 76, 60, 0.2)' }
      },
    ]
  };

  return (
    <div id="production" className="section-anchor">
      <div className="section-header">
        <h2>Production Simulation</h2>
        <p>Factor in production timing and delays.</p>
      </div>

      <button className="toggle-prod-section-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Edit Production Simulation' : 'Done Editing'}
      </button>

      <div className={`production-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="production-race-controls">
           <TimelineEditor army="a" name={nameA} />
           <TimelineEditor army="b" name={nameB} />
        </div>
      </div>

      <div className="results-area">
        <div className="charts-grid scaling-grid">
          <div className="chart-wrapper">
            <h4>Army Growth</h4>
            <div className="chart-container"><Line data={growthData} options={commonOptions} /></div>
          </div>
          <div className="chart-wrapper">
            <h4>Battle Advantage</h4>
            <div className="chart-container">
              <Line 
                data={advantageData} 
                options={{ ...commonOptions, scales: { y: { min: -100, max: 100 } }, elements: { line: { tension: 0.2 } } }} 
              />
            </div>
          </div>
        </div>

        <div className="matchup-report">
          <h3>Production Analysis</h3>
          <div id="production-report-text">
            {finalResA && finalResB && (
              <p>Final counts at {searchMax}s: <strong>{finalResA.count} {nameA}</strong> vs <strong>{finalResB.count} {nameB}</strong></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineEditor: React.FC<{ army: 'a' | 'b', name: string }> = ({ army, name }) => {
  const { state, updateArmy } = useSimulation();
  const armyState = state[army];

  const addStep = (type: string) => {
    const newStep = { t: type, n: type.charAt(0).toUpperCase() + type.slice(1), d: 30, c: 1, co: 0 };
    updateArmy(army, { tl: [...(armyState.tl || []), newStep] });
  };

  const removeStep = (index: number) => {
    const newTl = [...(armyState.tl || [])];
    newTl.splice(index, 1);
    updateArmy(army, { tl: newTl });
  };

  const updateStep = (index: number, updates: any) => {
    const newTl = [...(armyState.tl || [])];
    newTl[index] = { ...newTl[index], ...updates };
    updateArmy(army, { tl: newTl });
  };

  return (
    <div className={`prod-group army-${army}-border`}>
      <div className="prod-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>{name} Production</label>
        <div className="field-check">
          <input 
            type="checkbox" 
            checked={armyState.cont || false} 
            onChange={(e) => updateArmy(army, { cont: e.target.checked })}
          />
          <label style={{ fontSize: '0.75rem' }}>Always Produce Villagers</label>
        </div>
      </div>
      
      <div className="production-timeline">
        {armyState.tl?.map((step, idx) => (
          <div key={idx} className="timeline-step">
            <div className="step-header">
              <span className="timeline-step-label">{step.t}</span>
              <button className="remove-step-btn" onClick={() => removeStep(idx)}>&times;</button>
            </div>
            <div className="step-body">
              <div className="step-field">
                <label>Name</label>
                <input type="text" value={step.n || ''} onChange={(e) => updateStep(idx, { n: e.target.value })} style={{ width: '80px' }} />
              </div>
              <div className="step-field">
                <label>Delay</label>
                <input type="number" value={step.d || 0} onChange={(e) => updateStep(idx, { d: parseInt(e.target.value) || 0 })} style={{ width: '40px' }} />
              </div>
              <div className="step-field">
                <label>x</label>
                <input type="number" value={step.c || 1} onChange={(e) => updateStep(idx, { c: parseInt(e.target.value) || 1 })} style={{ width: '35px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="add-step-controls">
        <button className="add-step-btn" onClick={() => addStep('villagers')}>Villagers</button>
        <button className="add-step-btn" onClick={() => addStep('building')}>Building</button>
        <button className="add-step-btn" onClick={() => addStep('production')}>Production</button>
        <button className="add-step-btn" onClick={() => addStep('tech')}>Tech</button>
      </div>
    </div>
  );
};

export default ProductionSimulation;

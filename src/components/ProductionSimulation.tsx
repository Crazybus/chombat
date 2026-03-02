import React, { useMemo, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { calculateCount, ProductionResult } from '../sim/ProductionSim';
import { CombatSim } from '../sim/CombatSim';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyzeProduction, ProductionAnalysisResult } from '../sim/ProductionSim';

// Register once at module level
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductionSimulation: React.FC = () => {
  const { state, analysisA, analysisB } = useSimulation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const result: ProductionAnalysisResult | null = useMemo(() => {
    if (!analysisA || !analysisB) return null;
    const allUnits = { ...units, ...presets };
    return analyzeProduction(state.a, state.b, analysisA.baseUnit, analysisB.baseUnit, techsById, allUnits);
  }, [state.a, state.b, analysisA, analysisB, techsById]);

  if (!result || !analysisA || !analysisB) return null;
  const { finalResA, finalResB, labels, countA, countB, advantage } = result;

  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: { 
      x: { ticks: { maxTicksLimit: 12 } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    elements: { line: { tension: 0.1 }, point: { radius: 0 } }
  };

  const growthData = {
    labels,
    datasets: [
      { label: nameA, data: countA, borderColor: 'var(--army-a-color)', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: true },
      { label: nameB, data: countB, borderColor: 'var(--army-b-color)', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true },
    ]
  };

  const advantageData = {
    labels,
    datasets: [
      { 
        label: 'Advantage % (+A / -B)', 
        data: advantage, 
        borderColor: 'var(--accent-color)',
        fill: { target: 'origin', above: 'rgba(52, 152, 219, 0.2)', below: 'rgba(231, 76, 60, 0.2)' }
      },
    ]
  };

  return (
    <div id="production" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Production Simulation</h2>
        <p>Factor in production timing and delays.</p>
      </div>

      <button className="toggle-prod-section-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Edit Production Simulation' : 'Done Editing'}
      </button>

      <div className={`production-content ${isCollapsed ? 'collapsed' : ''}`} style={{ marginBottom: '20px' }}>
        <div className="production-race-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           <TimelineEditor army="a" name={nameA} />
           <TimelineEditor army="b" name={nameB} />
        </div>
      </div>

      <div className="results-area" style={{ width: '100%' }}>
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', width: '100%' }}>
          <div className="chart-wrapper" style={{ height: '350px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Army Growth over Time</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}><Line data={growthData} options={commonOptions} /></div>
          </div>
          <div className="chart-wrapper" style={{ height: '350px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Battle Advantage % (+A / -B)</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}>
              <Line 
                data={advantageData} 
                options={{ ...commonOptions, scales: { ...commonOptions.scales, y: { min: -100, max: 100 } } }} 
              />
            </div>
          </div>
        </div>

        <div className="matchup-report" style={{ marginTop: '20px', background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '10px', marginBottom: '15px' }}>Production Analysis</h3>
          <div id="production-report-text">
            {finalResA && finalResB && (
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--army-a-color)' }}>{nameA}</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalResA.count}</p>
                  <p style={{ color: 'var(--text-dim)' }}>units at 30 min</p>
                </div>
                <div style={{ alignSelf: 'center', fontSize: '2rem', color: 'var(--text-dim)' }}>VS</div>
                <div>
                  <h4 style={{ color: 'var(--army-b-color)' }}>{nameB}</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalResB.count}</p>
                  <p style={{ color: 'var(--text-dim)' }}>units at 30 min</p>
                </div>
              </div>
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

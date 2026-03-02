import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
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

const EffectivenessScaling: React.FC = () => {
  const { state, analysisA, analysisB } = useSimulation();
  
  const scales = [1, 2, 3, 4, 5, 8, 10, 15, 20];

  const runScaling = (mode: '1vX' | 'Xv1') => {
    if (!analysisA || !analysisB) return { labels: [], hpA: [], hpB: [], table: [] };
    const results: any = { labels: scales, hpA: [], hpB: [], table: [] };
    
    const techsById: Record<number, any> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    const allUnits = { ...units, ...presets };

    const nameA = analysisA.unitName;
    const nameB = analysisB.unitName;

    scales.forEach((s) => {
      const cntA = mode === '1vX' ? 1 : s;
      const cntB = mode === 'Xv1' ? 1 : s;
      
      const sim = new CombatSim(analysisA.baseUnit, analysisB.baseUnit, { ...state.a, c: cntA }, { ...state.b, c: cntB }, techsById, allUnits);
      const res = sim.run();

      const hA = (res.armyA.totalHp / res.armyA.initialTotalHp) * 100;
      const hB = (res.armyB.totalHp / res.armyB.initialTotalHp) * 100;
      
      results.hpA.push(hA);
      results.hpB.push(hB);
      
      const winner = res.armyA.totalHp > res.armyB.totalHp 
        ? (mode === '1vX' ? `1 ${nameA}` : `${s} ${nameA}`) 
        : (mode === '1vX' ? `${s} ${nameB}` : `1 ${nameB}`);
      
      const winA = res.armyA.totalHp > res.armyB.totalHp;

      results.table.push({
        ratio: `1 vs ${s}`,
        winner,
        hp: Math.max(hA, hB).toFixed(0),
        winA
      });
    });
    return results;
  };

  const res1vX = useMemo(() => runScaling('1vX'), [state.a, state.b, analysisA, analysisB]);
  const resXv1 = useMemo(() => runScaling('Xv1'), [state.a, state.b, analysisA, analysisB]);

  if (!analysisA || !analysisB) return null;
  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: { 
      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    plugins: {
      legend: { position: 'top' as const },
    },
    elements: { line: { tension: 0.2, borderWidth: 2 }, point: { radius: 2 } }
  };

  const createChartData = (res: any) => ({
    labels: res.labels,
    datasets: [
      { label: nameA + ' % HP', data: res.hpA, borderColor: 'var(--army-a-color)', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: false },
      { label: nameB + ' % HP', data: res.hpB, borderColor: 'var(--army-b-color)', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: false },
    ]
  });

  return (
    <div id="scaling" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Effectiveness Scaling</h2>
        <p>Pop & Cost efficiency across different swarm ratios.</p>
      </div>

      <div className="results-area" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* 1vX Section */}
          <div className="scaling-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
            <div className="table-container" style={{ background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
              <h3 style={{ color: 'var(--accent-color)', marginBottom: '15px', fontSize: '1.1rem' }}>1 {nameA} vs X {nameB}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-dim)', textAlign: 'left', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '10px' }}>Ratio</th>
                    <th style={{ padding: '10px' }}>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {res1vX.table.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ padding: '10px' }}>{row.ratio}</td>
                      <td style={{ padding: '10px', color: row.winA ? 'var(--army-a-color)' : 'var(--army-b-color)', fontWeight: 'bold' }}>
                        {row.winner} <span style={{ opacity: 0.7, fontWeight: 'normal', fontSize: '0.8rem' }}>({row.hp}% HP)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-wrapper" style={{ height: '400px', background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
              <h4 style={{ marginBottom: '15px', color: 'var(--text-dim)', textAlign: 'center' }}>Efficiency Curve: 1 {nameA} vs X {nameB}</h4>
              <div className="chart-container" style={{ height: 'calc(100% - 40px)' }}>
                <Line data={createChartData(res1vX)} options={commonOptions} />
              </div>
            </div>
          </div>

          {/* Xv1 Section */}
          <div className="scaling-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
            <div className="table-container" style={{ background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
              <h3 style={{ color: 'var(--accent-color)', marginBottom: '15px', fontSize: '1.1rem' }}>X {nameA} vs 1 {nameB}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-dim)', textAlign: 'left', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '10px' }}>Ratio</th>
                    <th style={{ padding: '10px' }}>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {resXv1.table.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ padding: '10px' }}>{row.ratio}</td>
                      <td style={{ padding: '10px', color: row.winA ? 'var(--army-a-color)' : 'var(--army-b-color)', fontWeight: 'bold' }}>
                        {row.winner} <span style={{ opacity: 0.7, fontWeight: 'normal', fontSize: '0.8rem' }}>({row.hp}% HP)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-wrapper" style={{ height: '400px', background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
              <h4 style={{ marginBottom: '15px', color: 'var(--text-dim)', textAlign: 'center' }}>Efficiency Curve: X {nameA} vs 1 {nameB}</h4>
              <div className="chart-container" style={{ height: 'calc(100% - 40px)' }}>
                <Line data={createChartData(resXv1)} options={commonOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectivenessScaling;

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
    scales: { y: { min: 0, max: 100 } },
    elements: { line: { tension: 0.2 }, point: { radius: 2 } }
  };

  const createChartData = (res: any) => ({
    labels: res.labels,
    datasets: [
      { label: nameA + ' % HP', data: res.hpA, borderColor: 'var(--army-a-color)' },
      { label: nameB + ' % HP', data: res.hpB, borderColor: 'var(--army-b-color)' },
    ]
  });

  return (
    <div id="scaling" className="section-anchor">
      <div className="section-header">
        <h2>Effectiveness Scaling</h2>
        <p>Pop & Cost efficiency across different swarm ratios.</p>
      </div>

      <div className="results-area">
        <div className="scaling-analysis-layout">
          {/* 1vX Section */}
          <div className="side-by-side">
            <div className="table-container">
              <h3>1 {nameA} vs X {nameB}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ratio</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {res1vX.table.map((row: any, i: number) => (
                    <tr key={i}>
                      <td>{row.ratio}</td>
                      <td style={{ color: row.winA ? 'var(--army-a-color)' : 'var(--army-b-color)', fontWeight: 'bold' }}>
                        {row.winner} ({row.hp}% HP)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-wrapper">
              <h4>1 {nameA} vs X {nameB} Scaling</h4>
              <div className="chart-container">
                <Line data={createChartData(res1vX)} options={commonOptions} />
              </div>
            </div>
          </div>

          {/* Xv1 Section */}
          <div className="side-by-side">
            <div className="table-container">
              <h3>1 {nameB} vs X {nameA}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ratio</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {resXv1.table.map((row: any, i: number) => (
                    <tr key={i}>
                      <td>{row.ratio}</td>
                      <td style={{ color: row.winA ? 'var(--army-a-color)' : 'var(--army-b-color)', fontWeight: 'bold' }}>
                        {row.winner} ({row.hp}% HP)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-wrapper">
              <h4>1 {nameB} vs X {nameA} Scaling</h4>
              <div className="chart-container">
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

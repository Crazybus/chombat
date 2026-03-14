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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const EffectivenessScaling: React.FC = () => {
  const { state, analysisA, analysisB } = useSimulation();

  const scales = [1, 2, 3, 4, 5, 8, 10, 15, 20];

  const runScaling = (mode: '1vX' | 'Xv1') => {
    if (!analysisA || !analysisB) return { labels: [], hpA: [], hpB: [], table: [] };
    const results: any = { labels: scales, hpA: [], hpB: [], table: [] };

    const techsById: Record<number, any> = {};
    Object.values(techs).forEach((t) => (techsById[t.id] = t));
    const allUnits = { ...units, ...presets };

    const nameA = analysisA.unitName;
    const nameB = analysisB.unitName;

    scales.forEach((s) => {
      const cntA = mode === '1vX' ? 1 : s;
      const cntB = mode === 'Xv1' ? 1 : s;

      const sim = new CombatSim(
        analysisA.baseUnit,
        analysisB.baseUnit,
        { ...state.armyA, count: cntA },
        { ...state.armyB, count: cntB },
        techsById,
        allUnits,
      );
      const res = sim.run();

      const hA = (res.armyA.totalHp / res.armyA.initialTotalHp) * 100;
      const hB = (res.armyB.totalHp / res.armyB.initialTotalHp) * 100;

      results.hpA.push(hA);
      results.hpB.push(hB);

      const winA = res.armyA.totalHp > res.armyB.totalHp;
      const winnerName = winA ? nameA : nameB;
      const winnerState = winA ? res.armyA : res.armyB;
      const winnerMaxHp = winA ? res.dataA.hp : res.dataB.hp;

      // Calculate survival details
      const fullUnits = Math.floor(winnerState.remaining);
      const damagedHp = Math.round((winnerState.remaining - fullUnits) * winnerMaxHp);
      const totalRemainingUnits = Math.ceil(winnerState.remaining);

      let detail = '';
      if (totalRemainingUnits === 1) {
        detail = `1 ${winnerName} (${Math.round(winnerState.totalHp)} HP left)`;
      } else {
        detail = `${totalRemainingUnits} ${winnerName}s (${fullUnits} full`;
        if (damagedHp > 0) detail += `, 1 with ${damagedHp} HP`;
        detail += `)`;
      }

      results.table.push({
        ratio: mode === '1vX' ? `1 vs ${s}` : `${s} vs 1`,
        winner: detail,
        pct: Math.max(hA, hB).toFixed(0),
        winA,
      });
    });
    return results;
  };

  const res1vX = useMemo(() => runScaling('1vX'), [state.armyA, state.armyB, analysisA, analysisB]);
  const resXv1 = useMemo(() => runScaling('Xv1'), [state.armyA, state.armyB, analysisA, analysisB]);

  if (!analysisA || !analysisB) return null;
  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' as const },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#888', font: { size: 10 } },
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#888',
          maxTicksLimit: 8,
          maxRotation: 45,
          minRotation: 0,
          font: { size: 10 },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#e0e0e0', font: { size: 11 } },
      },
    },
    elements: { line: { tension: 0.1, borderWidth: 2 }, point: { radius: 0 } },
  };

  const createChartData = (res: any) => ({
    labels: res.labels,
    datasets: [
      {
        label: nameA + ' % HP',
        data: res.hpA,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        fill: true,
      },
      {
        label: nameB + ' % HP',
        data: res.hpB,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        fill: true,
      },
    ],
  });
  return (
    <div id="scaling" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Effectiveness Scaling</h2>
        <p>Pop & Cost efficiency across different swarm ratios.</p>
      </div>

      <div className="results-area" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
          {/* 1vX Section */}
          <div
            className="scaling-section"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
              gap: '20px',
              minHeight: '420px',
              width: '100%',
            }}
          >
            <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <h3 style={{ color: 'var(--accent-color)', marginBottom: '8px', fontSize: '0.95rem' }}>
                1 {nameA} vs X {nameB}
              </h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-dim)',
                        textAlign: 'left',
                        color: 'var(--text-dim)',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--panel-bg)',
                        zIndex: 1,
                      }}
                    >
                      <th style={{ padding: '8px' }}>Ratio</th>
                      <th style={{ padding: '8px' }}>Survival Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res1vX.table.map((row: any, i: number) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid var(--border-dim)',
                          background: i % 2 === 0 ? 'var(--panel-bg-alt)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{row.ratio}</td>
                        <td
                          style={{
                            padding: '6px 8px',
                            color: row.winA ? 'var(--army-a-color)' : 'var(--army-b-color)',
                            fontWeight: 'bold',
                          }}
                        >
                          {row.winner}{' '}
                          <span style={{ opacity: 0.7, fontWeight: 'normal', fontSize: '0.75rem' }}>[{row.pct}%]</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <h4 style={{ marginBottom: '8px', color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem' }}>
                Efficiency Curve
              </h4>
              <div className="chart-container" style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <Line data={createChartData(res1vX)} options={commonOptions} />
              </div>
            </div>
          </div>

          {/* Xv1 Section */}
          <div
            className="scaling-section"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
              gap: '20px',
              minHeight: '420px',
              width: '100%',
            }}
          >
            <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <h3 style={{ color: 'var(--accent-color)', marginBottom: '8px', fontSize: '0.95rem' }}>
                X {nameA} vs 1 {nameB}
              </h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-dim)',
                        textAlign: 'left',
                        color: 'var(--text-dim)',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--panel-bg)',
                        zIndex: 1,
                      }}
                    >
                      <th style={{ padding: '8px' }}>Ratio</th>
                      <th style={{ padding: '8px' }}>Survival Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resXv1.table.map((row: any, i: number) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid var(--border-dim)',
                          background: i % 2 === 0 ? 'var(--panel-bg-alt)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{row.ratio}</td>
                        <td
                          style={{
                            padding: '6px 8px',
                            color: row.winA ? 'var(--army-a-color)' : 'var(--army-b-color)',
                            fontWeight: 'bold',
                          }}
                        >
                          {row.winner}{' '}
                          <span style={{ opacity: 0.7, fontWeight: 'normal', fontSize: '0.75rem' }}>[{row.pct}%]</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <h4 style={{ marginBottom: '8px', color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem' }}>
                Efficiency Curve
              </h4>
              <div className="chart-container" style={{ flex: 1, position: 'relative', minHeight: 0 }}>
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

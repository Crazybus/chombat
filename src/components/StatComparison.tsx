import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { analyzeDuel } from '../sim/ArmyAnalyzer';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';

const StatComparison: React.FC = () => {
  const { state, analysisA, analysisB } = useSimulation();

  const duelAnalysis = useMemo(() => {
    if (!analysisA || !analysisB) return null;

    const techsById: Record<number, any> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    const allUnits = { ...units, ...presets };

    return analyzeDuel(state.a, state.b, analysisA, analysisB, techsById, allUnits);
  }, [analysisA, analysisB, state.a, state.b]);

  if (!duelAnalysis || !analysisA || !analysisB) return null;
  const { winner, winnerColor, remainingInfo, rows, nameA, nameB } = duelAnalysis;

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
            const diff = r.valA - r.valB;
            
            let diffColor = 'var(--text-dim)';
            if (diff > 0.001) diffColor = 'var(--success-color)';
            else if (diff < -0.001) diffColor = 'var(--danger-color)';

            const diffDisplay = Math.abs(diff) < 0.001 ? '−' : (diff > 0 ? '+' : '') + diff.toFixed(r.label.includes('DPS') || r.label.includes('Time') || r.label.includes('Reload') ? 2 : 0);

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

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
    Object.values(techs).forEach((t) => (techsById[t.id] = t));
    const allUnits = { ...units, ...presets };

    return analyzeDuel(state.a, state.b, analysisA, analysisB, techsById, allUnits);
  }, [analysisA, analysisB, state.a, state.b]);

  if (!duelAnalysis || !analysisA || !analysisB) return null;
  const { winner, winnerColor, remainingInfo, rows, nameA, nameB } = duelAnalysis;

  return (
    <div id="comparison" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Stat Comparison</h2>
        <p>
          Direct 1v1 comparison: <strong>{nameA}</strong> vs <strong>{nameB}</strong>
        </p>
      </div>

      <div className="results-area" style={{ width: '100%' }}>
        <div id="comparison-summary">
          <div
            style={{
              textAlign: 'center',
              padding: '15px',
              background: 'var(--panel-bg-alt)',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid var(--border-dim)',
              overflowWrap: 'anywhere',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>
              Winner: <span style={{ color: winnerColor, fontWeight: 'bold' }}>{winner}</span>{' '}
              {remainingInfo && `(${remainingInfo})`}
            </span>
          </div>
        </div>

        <div className="stat-duel-table">
          {/* Header */}
          <div className="duel-row duel-header">
            <div className="duel-attribute">Attribute</div>
            <div className="duel-val" style={{ color: 'var(--army-a-color)' }}>
              {nameA}
            </div>
            <div className="duel-val" style={{ color: 'var(--army-b-color)' }}>
              {nameB}
            </div>
            <div className="duel-diff">Difference</div>
          </div>

          {/* Rows */}
          {rows.map((r) => {
            const diff = r.valA - r.valB;

            let diffColor = 'var(--text-dim)';
            if (diff > 0.001) diffColor = 'var(--success-color)';
            else if (diff < -0.001) diffColor = 'var(--danger-color)';

            const diffDisplay =
              Math.abs(diff) < 0.001
                ? '−'
                : (diff > 0 ? '+' : '') +
                  diff.toFixed(
                    r.label.includes('DPS') || r.label.includes('Time') || r.label.includes('Reload') ? 2 : 0,
                  );

            return (
              <div key={r.label} className="duel-row">
                <div className="duel-attribute">{r.label}</div>
                <div className="duel-val">{r.a}</div>
                <div className="duel-val">{r.b}</div>
                <div className="duel-diff">
                  <span className="diff-badge" style={{ color: diffColor }}>
                    {diffDisplay}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatComparison;

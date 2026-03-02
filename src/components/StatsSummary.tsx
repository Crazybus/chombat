import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ArmyAnalysis } from '../sim/ArmyAnalyzer';

interface StatsSummaryProps {
  army: 'a' | 'b';
  compact?: boolean;
  hoverExpand?: boolean;
  showName?: boolean;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ army, compact = false, hoverExpand = false, showName = false }) => {
  const { analysisA, analysisB } = useSimulation();
  const [isHovered, setIsHovered] = useState(false);
  const analysis = army === 'a' ? analysisA : analysisB;

  const formatStat = (base: number, total: number) => {
    const diff = Math.round(total - base);
    return (
      <>
        <span>{Math.round(base)}</span>
        {Math.abs(diff) >= 1 && (
          <span className={diff > 0 ? 'stat-bonus' : 'stat-penalty'}>
            {' '}{diff > 0 ? '+' : ''}{diff}
          </span>
        )}
      </>
    );
  };

  if (!analysis) return <div className="unit-stats-summary" />;
  const { effectiveStats, modifiedBase, ageName, unitName } = analysis;

  const isMelee = (effectiveStats.range || 0) <= 1;

  const showBreakdown = hoverExpand ? isHovered : !compact;

  return (
    <div 
      className="stats-summary-container"
      onMouseEnter={() => hoverExpand && setIsHovered(true)}
      onMouseLeave={() => hoverExpand && setIsHovered(false)}
      style={{ position: 'relative', width: '100%' }}
    >
      <div 
        className="unit-stats-summary" 
        style={{
          ...(compact ? { padding: '4px 8px', gap: '8px', border: 'none', background: 'transparent', marginBottom: 0, minHeight: 'auto' } : {}),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
      >
        {showName && (
          <div style={{ fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '4px', fontSize: '0.95rem' }}>
            {ageName} {unitName}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="stat-badge" title="HP">
            <span className="stat-icon">❤️</span>
            <span className="stat-text">{formatStat(modifiedBase.hp, effectiveStats.hp)}</span>
          </div>
          <div className="stat-badge" title={isMelee ? 'Melee Attack' : 'Pierce Attack'}>
            <span className="stat-icon">{isMelee ? '⚔️' : '🏹'}</span>
            <span className="stat-text">
              {isMelee 
                ? formatStat(modifiedBase.matk, effectiveStats.matk)
                : formatStat(modifiedBase.patk, effectiveStats.patk)
              }
            </span>
          </div>
          <div className="stat-badge" title="Melee Armor">
            <span className="stat-icon">🛡️</span>
            <span className="stat-text">{formatStat(modifiedBase.marm, effectiveStats.marm)}</span>
          </div>
          <div className="stat-badge" title="Pierce Armor">
            <span className="stat-icon">🛡️</span>
            <span className="stat-text">{formatStat(modifiedBase.parm, effectiveStats.parm)}</span>
          </div>
          {effectiveStats.range > 1 && (
            <div className="stat-badge" title="Range">
              <span className="stat-icon">🎯</span>
              <span className="stat-text">{formatStat(modifiedBase.range, effectiveStats.range)}</span>
            </div>
          )}
        </div>
      </div>

      {showBreakdown && (
        <div 
          className="unit-breakdown-wrapper"
          style={hoverExpand ? {
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: '15px',
            width: '450px',
            marginTop: '10px',
            pointerEvents: 'none' // Hover popup shouldn't block mouse
          } : {}}
        >
          <UnitStatsExplanation army={army} analysis={analysis} hideHeader={true} />
        </div>
      )}
    </div>
  );
};

export const UnitStatsExplanation: React.FC<{ army: 'a' | 'b', analysis: ArmyAnalysis, hideHeader?: boolean }> = ({ army, analysis, hideHeader = false }) => {
  const { toggleBonus } = useSimulation();
  const { groups, unitName, ageName } = analysis;

  return (
    <div className="unit-explanation" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: hideHeader ? '0' : '12px', borderTop: hideHeader ? 'none' : '1px solid var(--border-dim)', paddingTop: hideHeader ? '0' : '12px', width: '100%' }}>
      {!hideHeader && (
        <div className="summary-line" style={{ fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px', fontSize: '0.85rem' }}>
          {ageName} {unitName}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {Object.entries(groups).map(([key, group]) => {
          if (group.sources.length === 0) return null;
          return (
            <div key={key} className="stat-explanation-group" style={{ background: 'var(--panel-bg-alt)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-dim)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{group.icon}</span> {group.label}
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
                {group.sources.map((src, i) => {
                  const isTech = src.type === 'tech';
                  const isActive = src.isActive !== false;
                  
                  return (
                    <li 
                      key={i} 
                      style={{ 
                        marginBottom: '2px', 
                        cursor: isTech ? 'pointer' : 'default',
                        textDecoration: isActive ? 'none' : 'line-through',
                        opacity: isActive ? 1 : 0.5,
                        transition: 'all 0.2s',
                        pointerEvents: 'auto' // Allow toggling even in hover popup
                      }}
                      onClick={() => isTech && src.techId && toggleBonus(army, src.techId)}
                      title={isTech ? 'Click to toggle this upgrade' : undefined}
                    >
                      <span>{src.name === 'Manual Override' ? '' : src.name + ': '}<span className={src.isBonus ? 'stat-bonus' : 'stat-penalty'} style={{ fontWeight: 'bold' }}>{src.label}</span></span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsSummary;

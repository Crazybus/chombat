import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { ArmyState, TechData } from '../sim/types';
import UnitSelector from './UnitSelector';
import BonusTechManager from './BonusTechManager';
import CivSelector from './CivSelector';
import { CombatSim } from '../sim/CombatSim';
import { techs } from '../data/techs';
import { bonuses } from '../data/bonuses';
import { getEffectLabel } from '../sim/TechLogic';
import { analyzeArmy, ArmyAnalysis } from '../sim/ArmyAnalyzer';

interface ArmyPanelProps {
  army: 'a' | 'b';
}

const ArmyPanel: React.FC<ArmyPanelProps> = ({ army }) => {
  const { state, updateArmy, loadPreset, applyAgeBonuses, clearOverrides } = useSimulation();
  const armyState = state[army];
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(true);

  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  const currentUnit = armyState.ps ? allUnits[armyState.ps] : null;

  const handleStatChange = (field: keyof ArmyState, value: any) => {
    updateArmy(army, { [field]: value });
  };

  const handleAgeChange = (age: string) => {
    applyAgeBonuses(army, age);
  };

  const getMicroLabel = (val: number) => {
    if (val >= 5) return 'Perfect';
    if (val >= 4) return '4 Groups';
    if (val >= 3) return '3 Groups';
    if (val >= 2) return '2 Groups';
    return 'Focus Fire';
  };

  return (
    <section className="army-panel" id={`army-${army}`}>
      <div className="header-row">
        <div className="name-edit-group">
          <UnitSelector army={army} onSelect={(id) => loadPreset(army, id)} />
          <button 
            className="toggle-stats-btn" 
            onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
          >
            {isConfigCollapsed ? 'Edit' : 'Done'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <CivSelector army={army} />
        </div>

        <div className="army-age-controls" style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
          {['1', '2', '3', '4'].map(age => (
            <button
              key={age}
              className={`age-btn ${armyState.age === age ? 'active' : ''}`}
              onClick={() => handleAgeChange(age)}
            >
              {age === '1' ? 'I' : age === '2' ? 'II' : age === '3' ? 'III' : 'IV'}
            </button>
          ))}
        </div>
      </div>

      <div className={`unit-config ${isConfigCollapsed ? 'collapsed' : ''}`} id={`${army}-config`}>
        <div className="field">
          <label>Unit Name Override</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={armyState.nm || ''} 
              onChange={(e) => handleStatChange('nm', e.target.value)}
              style={{ flex: 1 }}
            />
            <button 
              className="nav-btn" 
              style={{ padding: '2px 8px', fontSize: '0.7rem', background: 'var(--panel-bg-alt)' }}
              onClick={() => clearOverrides(army)}
            >
              Reset Overrides
            </button>
          </div>
        </div>
        
        <div className="grid-fields">
          <StatField army={army} label="HP" field="h" value={armyState.h || currentUnit?.hp || 0} step={5} />
          <StatField army={army} label="Reload (s)" field="rl" value={armyState.rl || currentUnit?.reload || 0} step={0.1} />
          <StatField army={army} label="M. Attack" field="am" value={armyState.am || currentUnit?.matk || 0} step={1} />
          <StatField army={army} label="M. Armor" field="aa" value={armyState.aa || currentUnit?.marm || 0} step={1} />
          <StatField army={army} label="P. Attack" field="ap" value={armyState.ap || currentUnit?.patk || 0} step={1} />
          <StatField army={army} label="P. Armor" field="ar" value={armyState.ar || currentUnit?.parm || 0} step={1} />
          <StatField army={army} label="Range" field="n" value={armyState.n || currentUnit?.range || 0} step={1} />
        </div>

        <div className="grid-fields">
          <StatField army={army} label="Atk Speed %" field="as" value={armyState.as || 0} step={5} />
          <StatField army={army} label="Bonus Red %" field="ab" value={armyState.ab || 0} step={5} />
        </div>

        <BonusTechManager army={army} />

        <div className="efficiency-config">
          <h3>Engagement Efficiency</h3>
          <div className="field">
            <label>Engagement % <span className="val-display">{armyState.e || 100}%</span></label>
            <input 
              type="range" 
              min="1" max="100" 
              value={armyState.e || 100} 
              onChange={(e) => handleStatChange('e', parseInt(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Target Micro <span className="val-display">{getMicroLabel(armyState.mc || 5)}</span></label>
            <input 
              type="range" 
              min="1" max="5" 
              value={armyState.mc || 5} 
              onChange={(e) => handleStatChange('mc', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      <StatsSummary army={army} />
    </section>
  );
};

const StatsSummary: React.FC<{ army: 'a' | 'b' }> = ({ army }) => {
  const { analysisA, analysisB } = useSimulation();
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
  const { effectiveStats, modifiedBase, baseUnit } = analysis;

  const isMelee = (effectiveStats.range || 0) <= 1;

  return (
    <div className="unit-stats-summary">
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
      <UnitStatsExplanation army={army} analysis={analysis} />
    </div>
  );
};

const UnitStatsExplanation: React.FC<{ army: 'a' | 'b', analysis: ArmyAnalysis }> = ({ army, analysis }) => {
  const { toggleBonus } = useSimulation();
  const { groups, unitName, ageName } = analysis;

  return (
    <div className="unit-explanation" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '12px', borderTop: '1px solid var(--border-dim)', paddingTop: '12px', width: '100%' }}>
      <div className="summary-line" style={{ fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px', fontSize: '0.85rem' }}>
        {ageName} {unitName}
      </div>
      
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
                        transition: 'all 0.2s'
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

interface StatFieldProps {
  army: 'a' | 'b';
  label: string;
  field: keyof ArmyState;
  value: number;
  step: number;
}

const StatField: React.FC<StatFieldProps> = ({ army, label, field, value, step }) => {
  const { updateArmy } = useSimulation();
  
  const handleChange = (newVal: number) => {
    updateArmy(army, { [field]: newVal });
  };

  const currentVal = parseFloat(String(value || 0));

  return (
    <div className="field">
      <label>{label}</label>
      <div className="stepper">
        <button className="step-btn" onClick={() => handleChange(currentVal - step)}>−</button>
        <input 
          type="number" 
          value={currentVal} 
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)} 
          step={step}
        />
        <button className="step-btn" onClick={() => handleChange(currentVal + step)}>+</button>
      </div>
    </div>
  );
};

export default ArmyPanel;

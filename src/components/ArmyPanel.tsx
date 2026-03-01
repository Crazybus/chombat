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

interface ArmyPanelProps {
  army: 'a' | 'b';
}

const ArmyPanel: React.FC<ArmyPanelProps> = ({ army }) => {
  const { state, updateArmy, loadPreset, applyAgeBonuses } = useSimulation();
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

      <StatsSummary army={army} />

      <div className={`unit-config ${isConfigCollapsed ? 'collapsed' : ''}`} id={`${army}-config`}>
        <div className="field">
          <label>Unit Name Override</label>
          <input 
            type="text" 
            value={armyState.nm || ''} 
            onChange={(e) => handleStatChange('nm', e.target.value)}
          />
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
    </section>
  );
};

const StatsSummary: React.FC<{ army: 'a' | 'b' }> = ({ army }) => {
  const { state } = useSimulation();
  const armyState = state[army];
  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  
  const currentUnit = useMemo(() => {
    if (armyState.ps) return allUnits[armyState.ps];
    if (armyState.nm) {
      // Try to find unit by name
      const found = Object.values(allUnits).find(u => u.name === armyState.nm);
      if (found) return found;
    }
    return null;
  }, [armyState.ps, armyState.nm, allUnits]);

  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const effectiveStats = useMemo(() => {
    // If we have a currentUnit, use it as base. Otherwise, create a minimal UnitData from armyState.
    const baseData = currentUnit || {
      hp: armyState.h || 0,
      matk: armyState.am || 0,
      patk: armyState.ap || 0,
      marm: armyState.aa || 0,
      parm: armyState.ar || 0,
      reload: armyState.rl || 2,
      range: armyState.n || 0,
      id: 'custom',
      class: -1
    };
    
    // We use a dummy sim to run applyBonuses
    const sim = new CombatSim(baseData, baseData, armyState, armyState, techsById, allUnits);
    return sim.dataA;
  }, [currentUnit, armyState, techsById, allUnits]);

  const formatStat = (base: number, total: number) => {
    const diff = Math.round(total - base);
    return (
      <>
        <span>{Math.round(total)}</span>
        {Math.abs(diff) >= 1 && (
          <span className={diff > 0 ? 'stat-bonus' : 'stat-penalty'}>
            {' '}{diff > 0 ? '+' : ''}{diff}
          </span>
        )}
      </>
    );
  };

  if (!effectiveStats) return <div className="unit-stats-summary" />;

  const isMelee = (effectiveStats.range || 0) <= 1;
  const baseHP = currentUnit?.hp || armyState.h || 0;
  const baseAtk = isMelee ? (currentUnit?.matk || armyState.am || 0) : (currentUnit?.patk || armyState.ap || 0);
  const baseMarm = currentUnit?.marm || armyState.aa || 0;
  const baseParm = currentUnit?.parm || armyState.ar || 0;
  const baseRange = currentUnit?.range || armyState.n || 0;

  return (
    <div className="unit-stats-summary">
      <div className="stat-badge" title="HP">
        <span className="stat-icon">❤️</span>
        <span className="stat-text">{formatStat(baseHP, effectiveStats.hp)}</span>
      </div>
      <div className="stat-badge" title={isMelee ? 'Melee Attack' : 'Pierce Attack'}>
        <span className="stat-icon">{isMelee ? '⚔️' : '🏹'}</span>
        <span className="stat-text">
          {isMelee 
            ? formatStat(baseAtk, effectiveStats.matk)
            : formatStat(baseAtk, effectiveStats.patk)
          }
        </span>
      </div>
      <div className="stat-badge" title="Melee Armor">
        <span className="stat-icon">🛡️</span>
        <span className="stat-text">{formatStat(baseMarm, effectiveStats.marm)}</span>
      </div>
      <div className="stat-badge" title="Pierce Armor">
        <span className="stat-icon">🛡️</span>
        <span className="stat-text">{formatStat(baseParm, effectiveStats.parm)}</span>
      </div>
      {effectiveStats.range > 1 && (
        <div className="stat-badge" title="Range">
          <span className="stat-icon">🎯</span>
          <span className="stat-text">{formatStat(baseRange, effectiveStats.range)}</span>
        </div>
      )}
      <UnitStatsExplanation army={army} effectiveStats={effectiveStats} currentUnit={currentUnit} techsById={techsById} />
    </div>
  );
};

const UnitStatsExplanation: React.FC<{ army: 'a' | 'b', effectiveStats: any, currentUnit: any, techsById: Record<number, TechData> }> = ({ army, effectiveStats, currentUnit, techsById }) => {
  const { state } = useSimulation();
  const armyState = state[army];

  const getAgeName = (age: string) => {
    switch (age) {
      case '1': return 'Dark Age';
      case '2': return 'Feudal Age';
      case '3': return 'Castle Age';
      case '4': return 'Imperial Age';
      default: return 'Dark Age';
    }
  };

  const unitBaseName = currentUnit?.name || armyState.nm || 'Custom Unit';
  const ageName = getAgeName(armyState.age || '1');

  // Categorize bonuses
  const statGroups: Record<string, { label: string, icon: string, sources: React.ReactNode[] }> = {
    hp: { label: 'HP', icon: '❤️', sources: [] },
    atk: { label: 'Attack', icon: '⚔️', sources: [] },
    arm: { label: 'Armor', icon: '🛡️', sources: [] },
    range: { label: 'Range', icon: '🎯', sources: [] },
    other: { label: 'Misc', icon: '⚙️', sources: [] },
  };

  // 1. Manual Overrides
  const fieldToGroup: Record<string, string> = {
    h: 'hp', am: 'atk', ap: 'atk', aa: 'arm', ar: 'arm',
    rl: 'atk', n: 'range', as: 'atk', ab: 'other'
  };
  const fieldLabel: Record<string, string> = {
    h: 'HP', am: 'Melee Atk', ap: 'Pierce Atk', aa: 'Melee Arm', ar: 'Pierce Arm',
    rl: 'Reload', n: 'Range', as: 'Atk Speed', ab: 'Bonus Red'
  };

  Object.entries(fieldLabel).forEach(([key, label]) => {
    const val = (armyState as any)[key];
    if (val !== undefined) {
      // Check if it's actually different from base
      const baseKey = key === 'h' ? 'hp' : 
                      key === 'am' ? 'matk' :
                      key === 'ap' ? 'patk' :
                      key === 'aa' ? 'marm' :
                      key === 'ar' ? 'parm' :
                      key === 'rl' ? 'reload' :
                      key === 'n' ? 'range' :
                      key === 'as' ? 'atk_speed' :
                      key === 'ab' ? 'bonus_red' : key;
      
      const baseVal = currentUnit ? (currentUnit as any)[baseKey] : undefined;
      
      if (baseVal === undefined || parseFloat(String(val)) !== parseFloat(String(baseVal))) {
        const group = fieldToGroup[key];
        const isIncrease = baseVal !== undefined && parseFloat(String(val)) > parseFloat(String(baseVal));
        const colorClass = isIncrease ? 'stat-bonus' : 'stat-penalty';
        
        statGroups[group].sources.push(
          <span key={key}>Manual override: {label} set to <span className={colorClass} style={{ fontWeight: 'bold' }}>{val}</span></span>
        );
      }
    }
  });

  // 2. Tech Bonuses
  armyState.bn?.forEach(bState => {
    const tech = techsById[parseInt(bState.i)] || (bonuses as any)[bState.i];
    if (!tech) return;
    
    const effs = tech.effects || [];
    const techLabels: string[] = [];
    const seenGroupLabels = new Set<string>();

    effs.forEach((e: any, idx: number) => {
      if (!bState.e[idx]) return;
      let label = getEffectLabel(e);
      if (!label) return;

      // Round long floats in labels
      label = label.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));

      // Map effect type to group
      let group = 'other';
      if (e.t === 0) group = 'hp';
      else if (e.t === 1 || e.t === 9) group = 'atk';
      else if (e.t === 8) group = 'arm';
      else if (e.t === 12 || e.a === 3) group = 'range';
      
      // Prevent duplicate labels within the same tech (e.g. Forging +1 Atk twice)
      const groupLabel = `${group}-${label}`;
      if (seenGroupLabels.has(groupLabel)) return;
      seenGroupLabels.add(groupLabel);

      const isBonus = !label.includes('-');
      const colorClass = isBonus ? 'stat-bonus' : 'stat-penalty';

      statGroups[group].sources.push(
        <span key={`${bState.i}-${idx}`}>{tech.name}: <span className={colorClass} style={{ fontWeight: 'bold' }}>{label}</span></span>
      );
    });
  });

  // 3. Special unit upgrades (Idempotent check matching CombatSim)
  const ageId = parseInt(armyState.age || '1');
  if (ageId >= 2) {
    const isScout = currentUnit?.id === '448' || currentUnit?.id === 'scout_cavalry';
    const isEagle = currentUnit?.id === '751' || currentUnit?.id === 'eagle_scout';
    if (isScout && currentUnit?.matk === 3) {
      statGroups.atk.sources.push(<span key="scout-upgrade">Unit auto-upgrade: <span className="stat-bonus" style={{ fontWeight: 'bold' }}>+2 Melee Attack</span></span>);
    }
    if (isEagle && currentUnit?.matk === 4) {
      statGroups.atk.sources.push(<span key="eagle-upgrade">Unit auto-upgrade: <span className="stat-bonus" style={{ fontWeight: 'bold' }}>+3 Melee Attack</span></span>);
    }
  }

  return (
    <div className="unit-explanation" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '12px', borderTop: '1px solid var(--border-dim)', paddingTop: '12px', width: '100%' }}>
      <div className="summary-line" style={{ fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px', fontSize: '0.85rem' }}>
        {ageName} {unitBaseName}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {Object.entries(statGroups).map(([key, group]) => {
          if (group.sources.length === 0) return null;
          return (
            <div key={key} className="stat-explanation-group" style={{ background: 'var(--panel-bg-alt)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-dim)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{group.icon}</span> {group.label}
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
                {group.sources.map((src, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{src}</li>
                ))}
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

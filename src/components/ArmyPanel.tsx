import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { ArmyState } from '../sim/types';
import UnitSelector from './UnitSelector';
import BonusTechManager from './BonusTechManager';
import CivSelector from './CivSelector';
import StatsSummary from './StatsSummary';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="name-edit-group">
            <UnitSelector army={army} onSelect={(id) => loadPreset(army, id)} />
            <button
              className="toggle-stats-btn"
              onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
              style={{ 
                padding: '2px 6px', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isConfigCollapsed ? 'Edit Unit Stats' : 'Close Editor'}
            >
              {isConfigCollapsed ? '✏️' : 'Done'}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <CivSelector army={army} />
          <div className="army-age-controls" style={{ display: 'flex', gap: '5px' }}>
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
      </div>

      <div style={{ marginTop: '15px', marginBottom: '15px' }}>
        <StatsSummary army={army} showName={true} />
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
    </section>
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
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const valRef = useRef(value);
  
  useEffect(() => {
    valRef.current = value;
  }, [value]);

  const handleChange = (newVal: number) => {
    const rounded = Math.round(newVal * 100) / 100;
    updateArmy(army, { [field]: rounded });
  };

  const startRepeating = (dir: number) => {
    const doStep = () => {
      const currentVal = (parseFloat(String(valRef.current || 0)));
      const next = currentVal + (dir * step);
      handleChange(next);
    };

    doStep();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(doStep, 50);
    }, 500);
  };

  const stopRepeating = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopRepeating();
  }, []);

  const currentVal = parseFloat(String(value || 0));

  return (
    <div className="field">
      <label>{label}</label>
      <div className="stepper">
        <button 
          className="step-btn" 
          onMouseDown={() => startRepeating(-1)}
          onMouseUp={stopRepeating}
          onMouseLeave={stopRepeating}
          onTouchStart={() => startRepeating(-1)}
          onTouchEnd={stopRepeating}
          onClick={(e) => { e.preventDefault(); }} 
        >−</button>
        <input 
          type="number" 
          value={currentVal} 
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)} 
          step={step}
        />
        <button 
          className="step-btn" 
          onMouseDown={() => startRepeating(1)}
          onMouseUp={stopRepeating}
          onMouseLeave={stopRepeating}
          onTouchStart={() => startRepeating(1)}
          onTouchEnd={stopRepeating}
          onClick={(e) => { e.preventDefault(); }}
        >+</button>
      </div>
    </div>
  );
};

export default ArmyPanel;

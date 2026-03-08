import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { units } from '../data/units';
import { presets } from '../data/presets';
import UnitSelector from './UnitSelector';
import BonusTechManager from './BonusTechManager';
import CivSelector from './CivSelector';
import StatsSummary from './StatsSummary';

interface ArmyPanelProps {
  army: 'a' | 'b';
}

const ArmyPanel: React.FC<ArmyPanelProps> = ({ army }) => {
  const { state, updateArmy, loadPreset, applyAgeBonuses, clearOverrides } = useSimulation();
  const armyKey = army === 'a' ? 'armyA' : 'armyB';
  const armyState = state[armyKey];
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(true);

  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  const currentUnit = armyState.preset ? allUnits[armyState.preset] : null;

  const handleNameChange = (value: string) => {
    updateArmy(army, { name: value });
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
        <div className="header-row-group">
          <div className="header-row-item">
            <UnitSelector army={army} onSelect={(id) => loadPreset(army, id)} />
            <button
              className="nav-btn secondary"
              onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                height: '32px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title={isConfigCollapsed ? 'Modify Unit Stats' : 'Close Editor'}
            >
              {isConfigCollapsed ? '⚙️ Modify Stats' : 'Done'}
            </button>
          </div>
        </div>

        <div className="header-row-group">
          <div className="header-row-item">
            <span className="stat-label">Civ:</span>
            <CivSelector army={army} />
          </div>

          <div className="header-row-item">
            <span className="stat-label">Age:</span>
            <div className="army-age-controls">
              {['1', '2', '3', '4'].map((age) => (
                <button
                  key={age}
                  className={`age-btn ${armyState.age === age ? 'active' : ''}`}
                  onClick={() => handleAgeChange(age)}
                  title={`Age ${age}`}
                >
                  {age === '1' ? 'I' : age === '2' ? 'II' : age === '3' ? 'III' : 'IV'}
                </button>
              ))}
            </div>
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
              value={armyState.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
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
          <StatField
            army={army}
            label="HP"
            field="hp"
            value={armyState.overrides?.hp || currentUnit?.hp || 0}
            step={5}
          />
          <StatField
            army={army}
            label="Reload (s)"
            field="reload"
            value={armyState.overrides?.reload || currentUnit?.reload || 0}
            step={0.1}
          />
          <StatField
            army={army}
            label="M. Attack"
            field="meleeAttack"
            value={armyState.overrides?.meleeAttack || currentUnit?.matk || 0}
            step={1}
          />
          <StatField
            army={army}
            label="M. Armor"
            field="meleeArmor"
            value={armyState.overrides?.meleeArmor || currentUnit?.marm || 0}
            step={1}
          />
          <StatField
            army={army}
            label="P. Attack"
            field="pierceAttack"
            value={armyState.overrides?.pierceAttack || currentUnit?.patk || 0}
            step={1}
          />
          <StatField
            army={army}
            label="P. Armor"
            field="pierceArmor"
            value={armyState.overrides?.pierceArmor || currentUnit?.parm || 0}
            step={1}
          />
          <StatField
            army={army}
            label="Range"
            field="range"
            value={armyState.overrides?.range || currentUnit?.range || 0}
            step={1}
          />
        </div>

        <div className="grid-fields">
          <StatField
            army={army}
            label="Atk Speed %"
            field="attackSpeed"
            value={armyState.overrides?.attackSpeed || 0}
            step={5}
          />
          <StatField
            army={army}
            label="Bonus Red %"
            field="bonusReduction"
            value={armyState.overrides?.bonusReduction || 0}
            step={5}
          />
        </div>

        <BonusTechManager army={army} />

        <div className="efficiency-config">
          <h3>Engagement Efficiency</h3>
          <div className="field">
            <label>
              Engagement % <span className="val-display">{armyState.overrides?.engagement || 100}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={armyState.overrides?.engagement || 100}
              onChange={(e) => updateArmy(army, { overrides: { engagement: parseInt(e.target.value) } })}
            />
          </div>
          <div className="field">
            <label>
              Target Micro <span className="val-display">{getMicroLabel(armyState.overrides?.micro || 5)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={armyState.overrides?.micro || 5}
              onChange={(e) => updateArmy(army, { overrides: { micro: parseInt(e.target.value) } })}
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
  field: string;
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
    updateArmy(army, { overrides: { [field]: rounded } });
  };

  const startRepeating = (dir: number) => {
    const doStep = () => {
      const currentVal = parseFloat(String(valRef.current || 0));
      const next = currentVal + dir * step;
      handleChange(next);
    };

    doStep();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(doStep, 80);
    }, 600);
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
          onPointerDown={(e) => {
            e.preventDefault();
            startRepeating(-1);
          }}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
        >
          −
        </button>
        <input
          type="number"
          value={currentVal}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          step={step}
        />
        <button
          className="step-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            startRepeating(1);
          }}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ArmyPanel;

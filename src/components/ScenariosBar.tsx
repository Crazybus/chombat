import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { featuredScenarios, scenarios } from '../data/scenarios';

const ScenariosBar: React.FC = () => {
  const { state, loadScenario, resetToNewScenario } = useSimulation();
  const [search, setSearch] = useState('');

  const allScenarios = Object.entries(scenarios).map(([id, s]: [string, any]) => ({ id, ...s }));
  const filtered = search.length > 1 
    ? allScenarios.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="scenarios-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', flexWrap: 'nowrap' }}>
      <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        Scenarios:
      </span>
      <div id="featured-scenarios-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
        {featuredScenarios.map(id => {
          const scenario = (scenarios as any)[id];
          if (!scenario) return null;
          const isActive = state.sid === id;
          return (
            <button
              key={id}
              className={`scenario-btn ${isActive ? 'active' : ''}`}
              style={{
                background: isActive ? 'var(--accent-color)' : 'var(--btn-bg)',
                color: isActive ? 'black' : 'var(--btn-text)',
                borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                fontWeight: isActive ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                height: '32px',
                padding: '0 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
              onClick={() => loadScenario(id)}
            >
              {scenario.name}
            </button>
          );
        })}
        {state.name === 'Shared Scenario' && !state.sid && (
          <button className="scenario-btn active" style={{ background: 'var(--accent-color)', color: 'black', fontWeight: 'bold', height: '32px', whiteSpace: 'nowrap' }}>
            🔗 Shared Scenario
          </button>
        )}
      </div>

      <div className="searchable-scenario" style={{ flex: 1, display: 'flex', gap: '8px', position: 'relative' }}>
        <input 
          type="text" 
          className="scenario-search" 
          placeholder="Search more scenarios..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            flex: 1, 
            height: '32px', 
            background: 'var(--input-bg)', 
            color: 'var(--text-color)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '4px', 
            padding: '0 12px',
            fontSize: '0.85rem'
          }} 
        />
        {filtered.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--panel-bg)', border: '1px solid var(--border-color)', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', borderRadius: '4px', marginTop: '5px', maxHeight: '300px', overflowY: 'auto' }}>
            {filtered.map(s => (
              <div 
                key={s.id} 
                onClick={() => { loadScenario(s.id); setSearch(''); }}
                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--border-dim)' }}
                className="preset-item"
              >
                {s.name}
              </div>
            ))}
          </div>
        )}
        <button 
          id="new-scenario-btn" 
          className="nav-btn" 
          style={{ background: 'var(--color-pos)', color: 'white', height: '32px', padding: '0 15px', whiteSpace: 'nowrap' }}
          onClick={() => {
            if (window.confirm('Create a new scenario? This will clear all current settings.')) {
              resetToNewScenario();
            }
          }}
        >
          + New
        </button>
      </div>
    </div>
  );
};

export default ScenariosBar;

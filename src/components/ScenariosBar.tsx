import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { featuredScenarios, scenarios } from '../data/scenarios';

const ScenariosBar: React.FC = () => {
  const { state, loadScenario, resetToNewScenario } = useSimulation();
  const [search, setSearch] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const allScenarios = Object.entries(scenarios).map(([id, s]: [string, any]) => ({ id, ...s }));
  const filtered = search.length >= 1 
    ? allScenarios.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="scenarios-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
        <span className="scenarios-label">
          Scenarios:
        </span>
        <button 
          className="small-action-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
        >
          {isExpanded ? 'Collapse' : 'Show All'}
        </button>
      </div>
      
      <div id="featured-scenarios-container" className={`featured-scenarios ${isExpanded ? 'expanded' : ''}`}>
        {featuredScenarios.map(id => {
          const scenario = (scenarios as any)[id];
          if (!scenario) return null;
          const isActive = state.sid === id;
          return (
            <button
              key={id}
              className={`scenario-btn ${isActive ? 'active' : ''}`}
              onClick={() => loadScenario(id)}
            >
              {scenario.name}
            </button>
          );
        })}
        {state.name === 'Shared Scenario' && !state.sid && (
          <button className="scenario-btn active">
            🔗 Shared Scenario
          </button>
        )}
      </div>

      <div className="searchable-scenario">
        <input 
          type="text" 
          className="scenario-search" 
          placeholder="Search scenarios..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filtered.length > 0 && (
          <div className="scenario-list">
            {filtered.map(s => (
              <div 
                key={s.id} 
                onClick={() => { loadScenario(s.id); setSearch(''); }}
                className="scenario-item"
              >
                {s.name}
              </div>
            ))}
          </div>
        )}
        <button 
          id="new-scenario-btn" 
          className="nav-btn" 
          style={{ background: 'var(--color-pos)', color: 'white' }}
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

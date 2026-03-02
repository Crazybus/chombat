import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { featuredScenarios, scenarios } from '../data/scenarios';

const ScenariosBar: React.FC = () => {
  const { state, loadScenario, resetToNewScenario } = useSimulation();

  return (
    <div className="scenarios-bar">
      <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
        Scenarios:
      </span>
      <div id="featured-scenarios-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                fontWeight: isActive ? 'bold' : 'normal'
              }}
              onClick={() => loadScenario(id)}
            >
              {scenario.name}
            </button>
          );
        })}
        {state.name === 'Shared Scenario' && !state.sid && (
          <button className="scenario-btn active" style={{ background: 'var(--accent-color)', color: 'black', fontWeight: 'bold' }}>
            🔗 Shared Scenario
          </button>
        )}
      </div>

      <div className="searchable-scenario" style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input type="text" className="scenario-search" placeholder="Search more scenarios..." style={{ width: '200px' }} />
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

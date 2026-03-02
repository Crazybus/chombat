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
      <div id="featured-scenarios-container" style={{ display: 'flex', gap: '10px' }}>
        {featuredScenarios.map(id => {
          const scenario = (scenarios as any)[id];
          if (!scenario) return null;
          const isActive = state.sid === id;
          return (
            <button
              key={id}
              className={`scenario-btn ${isActive ? 'active' : ''}`}
              style={isActive ? { background: 'var(--accent-color)', color: 'black' } : {}}
              onClick={() => loadScenario(id)}
            >
              {scenario.name}
            </button>
          );
        })}
        {state.name === 'Shared Scenario' && !state.sid && (
          <button className="scenario-btn active" style={{ background: 'var(--accent-color)', color: 'black' }}>
            🔗 Shared Scenario
          </button>
        )}
      </div>

      <div className="searchable-scenario">
        <input type="text" className="scenario-search" placeholder="Search more scenarios..." />
        {/* Scenario list popup logic would go here */}
      </div>
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
        + New Scenario
      </button>
    </div>
  );
};

export default ScenariosBar;

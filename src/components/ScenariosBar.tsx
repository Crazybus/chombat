import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { featuredScenarios, scenarios } from '../data/scenarios';

const ScenariosBar: React.FC = () => {
  const { state, loadScenario, resetToNewScenario } = useSimulation();
  const [search, setSearch] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allScenarios = Object.entries(scenarios).map(([id, s]: [string, any]) => ({ id, ...s }));
  const filtered =
    search.length >= 1 ? allScenarios.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      if (filtered[selectedIndex]) {
        loadScenario(filtered[selectedIndex].id);
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      setSearch('');
    }
  };

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <div className="scenarios-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
        <span className="scenarios-label">Scenarios:</span>
        <button
          className="small-action-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
        >
          {isExpanded ? 'Collapse' : 'Show All'}
        </button>
      </div>

      <div id="featured-scenarios-container" className={`featured-scenarios ${isExpanded ? 'expanded' : ''}`}>
        {featuredScenarios.map((id) => {
          const scenario = (scenarios as any)[id];
          if (!scenario) return null;
          const isActive = state.scenarioId === id;
          return (
            <button key={id} className={`scenario-btn ${isActive ? 'active' : ''}`} onClick={() => loadScenario(id)}>
              {scenario.name}
            </button>
          );
        })}
        {state.name === 'Shared Scenario' && !state.scenarioId && (
          <button className="scenario-btn active">🔗 Shared Scenario</button>
        )}
      </div>

      <div className="searchable-scenario">
        <input
          type="text"
          className="scenario-search"
          placeholder="Search scenarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {filtered.length > 0 && (
          <div className="scenario-list">
            {filtered.map((s, index) => (
              <div
                key={s.id}
                onClick={() => {
                  loadScenario(s.id);
                  setSearch('');
                }}
                className={`scenario-item ${index === selectedIndex ? 'selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
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

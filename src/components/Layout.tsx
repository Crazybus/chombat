import React, { useState, useEffect } from 'react';
import ScenariosBar from './ScenariosBar';
import ArmyPanel from './ArmyPanel';
import StatComparison from './StatComparison';
import BattleSimulation from './BattleSimulation';
import ProductionSimulation from './ProductionSimulation';
import EffectivenessScaling from './EffectivenessScaling';
import { useSyncURL } from '../hooks/useSyncURL';
import { useSimulation } from '../context/SimulationContext';

const Layout: React.FC = () => {
  const { state, showToast, setState } = useSimulation();
  const { syncURL, getCleanState } = useSyncURL();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  const handleShare = async () => {
    const url = await syncURL(true);
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Shared URL copied to clipboard!');
      });
    }
  };

  const handleExport = () => {
    const cleanState = getCleanState();
    // Generate scenario ID from name or desc
    const scenarioName = cleanState.name || 'new_scenario';
    const scenarioId = scenarioName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 30);

    const exportText = `export const ${scenarioId} = ${JSON.stringify(cleanState, null, 4)};`;
    navigator.clipboard.writeText(exportText).then(() => {
      showToast(`Scenario "${scenarioId}" copied! Paste into src/data/scenarios/`);
    });
  };

  return (
    <>
      <nav className="sticky-nav">
        <div className="nav-content">
          <a href="/" className="nav-brand">
            <img src="/img/logo.png" alt="Chombat Logo" className="brand-logo" />
            <span>CHOMBAT <span style={{ fontSize: '0.7em', color: 'var(--text-dim)', fontWeight: 'normal' }}>(alpha)</span></span>
          </a>
          <ul>
            <li><a href="#">Units</a></li>
            <li><a href="#comparison">Stats</a></li>
            <li><a href="#battle">Battle Sim</a></li>
            <li><a href="#production">Production</a></li>
            <li><a href="#scaling">Scaling</a></li>
            <li><a href="#about">About</a></li>
            <li><button className="nav-btn" title="Toggle Light/Dark Mode" onClick={() => setIsDarkMode(!isDarkMode)}>🌓</button></li>
            <li><button className="nav-btn" onClick={handleExport}>Export</button></li>
            <li><button className="nav-btn" onClick={handleShare}>Share</button></li>
            <li><button className="nav-btn" title="Submit scenario to the repo">Submit</button></li>
          </ul>
        </div>
      </nav>

      <main>
        <ScenariosBar />
        
        <div 
          id="scenario-name-header" 
          className="scenario-name-header" 
          title="Click to edit scenario name"
          style={{ cursor: 'pointer', display: 'block' }}
          onClick={() => {
            const newName = window.prompt('Enter scenario name:', state.name || '');
            if (newName !== null) setState(prev => ({ ...prev, name: newName }));
          }}
        >
          {state.name || 'Untitled Scenario'}
        </div>

        <div className="scenario-context">
          <textarea 
            id="scenario-desc" 
            placeholder="Add a description for this matchup scenario..."
            value={state.desc}
            onChange={(e) => setState(prev => ({ ...prev, desc: e.target.value }))}
          />
        </div>

        <div className="simulation-container">
          <ArmyPanel army="a" />
          <ArmyPanel army="b" />
        </div>

        <StatComparison />
        <BattleSimulation />
        <ProductionSimulation />
        <EffectivenessScaling />

        <div id="about" className="section-anchor">
          <div className="section-header">
            <h2>About Chombat</h2>
          </div>
          <div className="results-area">
            <p>
              Chombat is an Age of Empires II combat simulator designed to help players understand the nuances of unit
              interactions, balance, production timing, micro impact, and unit scaling.
            </p>
            <p>
              This project is currently in alpha state. I will do my best to maintain backwards compatability of shared
              scenarios but will make breaking changes if it is needed for new features. Any scenarios which have been
              submitted via the "submit" button will be tested and updated before releases of new versions.
            </p>
            <p>
              One of the specific design choices is to make the tool a template for testing out ideas and strategies. Some
              example scenarios and units are available but the tools strength is to be able to test new units without
              waiting for a database update. And more importantly to see what the impact of a stat or production nerf would
              have on certain matchups.
            </p>
            <p>
              It uses a deterministic time-based simulation that accounts for attack reloads, armor types, micro overkill,
              and production delays. This allows you to simulate complex "what-if" scenarios, such as how many full upgraded
              feudal scouts need to catch up to an all in Man-at-Arms rush, or how target fire micro makes 60 archers beat
              60 skirms.
            </p>
            <p>
              For feature requests, bug reports, or to contribute, please visit the
              <a href="https://github.com/Crazybus/chombat" target="_blank"
                style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}> Chombat GitHub repository</a>.
            </p>
            <div className="disclaimer">
              <p>Age of Empires II: Definitive Edition © Microsoft Corporation.</p>
              <p>
                Chombat was created under Microsoft's
                <a href="https://www.xbox.com/en-us/developers/rules" target="_blank"
                  style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}> "Game Content Usage Rules"</a>
                using assets from Age of Empires II: Definitive Edition, and it is not endorsed by or affiliated with
                Microsoft.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Layout;

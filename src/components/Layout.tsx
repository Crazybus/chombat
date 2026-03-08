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
  const { state, showToast, setState, swapArmies } = useSimulation();
  const { syncURL, getCleanState } = useSyncURL(state, setState);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  // Section highlighting logic
  useEffect(() => {
    const sections = ['units', 'comparison', 'battle', 'production', 'scaling', 'about'];
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <nav className="sticky-nav">
        <div className="sticky-nav-main">
          <div className="nav-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
                ☰
              </button>
              <a
                href="/"
                className="nav-brand"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo(0, 0);
                }}
              >
                <img src="/img/logo.png" alt="Chombat Logo" className="brand-logo" />
                <span className="brand-text">
                  CHOMBAT <small className="brand-version">(alpha)</small>
                </span>
              </a>
            </div>

            <div className="nav-links-desktop">
              <ul>
                <li>
                  <a href="#units" className={activeSection === 'units' ? 'active' : ''}>
                    Units
                  </a>
                </li>
                <li>
                  <a href="#comparison" className={activeSection === 'comparison' ? 'active' : ''}>
                    Stats
                  </a>
                </li>
                <li>
                  <a href="#battle" className={activeSection === 'battle' ? 'active' : ''}>
                    Battle Sim
                  </a>
                </li>
                <li>
                  <a href="#production" className={activeSection === 'production' ? 'active' : ''}>
                    Production
                  </a>
                </li>
                <li>
                  <a href="#scaling" className={activeSection === 'scaling' ? 'active' : ''}>
                    Scaling
                  </a>
                </li>
                <li>
                  <a href="#about" className={activeSection === 'about' ? 'active' : ''}>
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-actions">
              <div
                className="hide-mobile"
                style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '15px' }}
              >
                <a
                  href="https://discord.gg/UZ7mxjzNhf"
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  title="Join Discord"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.07 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/Crazybus/chombat"
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  title="GitHub Repository"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
                <button
                  className="social-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  title="Toggle Light/Dark Mode"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8V4z" />
                  </svg>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="nav-btn secondary" onClick={handleExport}>
                  Export
                </button>
                <button className="nav-btn" onClick={handleShare}>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={toggleSidebar}>
            &times;
          </button>
        </div>
        <ul className="sidebar-links">
          <li>
            <a href="#units" onClick={toggleSidebar}>
              Units
            </a>
          </li>
          <li>
            <a href="#comparison" onClick={toggleSidebar}>
              Stats Comparison
            </a>
          </li>
          <li>
            <a href="#battle" onClick={toggleSidebar}>
              Battle Simulation
            </a>
          </li>
          <li>
            <a href="#production" onClick={toggleSidebar}>
              Production Simulation
            </a>
          </li>
          <li>
            <a href="#scaling" onClick={toggleSidebar}>
              Effectiveness Scaling
            </a>
          </li>
          <li>
            <a href="#about" onClick={toggleSidebar}>
              About
            </a>
          </li>
          <hr />
          <li>
            <button
              className="sidebar-btn"
              onClick={() => {
                handleExport();
                toggleSidebar();
              }}
            >
              Export Scenario
            </button>
          </li>
          <li>
            <a
              href="https://discord.gg/UZ7mxjzNhf"
              target="_blank"
              rel="noreferrer"
              className="sidebar-social"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.07 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Discord
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Crazybus/chombat"
              target="_blank"
              rel="noreferrer"
              className="sidebar-social"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
          </li>
        </ul>
      </div>

      <main className="section-anchor">
        <div id="units" style={{ height: '1px', scrollMarginTop: '150px' }}></div>

        <div className="results-area" style={{ padding: '10px 15px', marginBottom: '20px' }}>
          <ScenariosBar />
        </div>

        <div
          id="scenario-name-header"
          className="scenario-name-header"
          title="Click to edit scenario name"
          style={{ cursor: 'pointer', display: 'block' }}
          onClick={() => {
            const newName = window.prompt('Enter scenario name:', state.name || '');
            if (newName !== null) setState((prev) => ({ ...prev, name: newName }));
          }}
        >
          {state.name || 'Untitled Scenario'}
        </div>

        <div className="scenario-context">
          <textarea
            id="scenario-desc"
            placeholder="Add a description for this matchup scenario..."
            value={state.description || ''}
            onChange={(e) => setState((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            className="nav-btn secondary"
            onClick={swapArmies}
            title="Swap Side A and Side B"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 20px' }}
          >
            <span>🔄 Swap Side A & B</span>
          </button>
        </div>

        <div className="simulation-container">
          <ArmyPanel army="a" />
          <ArmyPanel army="b" />
        </div>

        <StatComparison />
        <BattleSimulation />
        <ProductionSimulation />
        <EffectivenessScaling />

        <div id="about" className="section-anchor" style={{ scrollMarginTop: '80px' }}>
          <div className="section-header">
            <h2>About Chombat</h2>
          </div>
          <div className="results-area">
            <p>
              Chombat is an Age of Empires II combat simulator designed to help players understand the nuances of unit
              interactions, balance, production timing, micro impact, and unit scaling.
            </p>
            <p>
              Join the{' '}
              <a
                href="https://discord.gg/UZ7mxjzNhf"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}
              >
                Discord Community
              </a>{' '}
              to share and discuss scenarios, or create an issue or pull request in the{' '}
              <a
                href="https://github.com/Crazybus/chombat"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}
              >
                Chombat GitHub repo
              </a>
              .
            </p>
            <p>
              This project is currently in alpha state. I will do my best to maintain backwards compatability of shared
              scenarios but will make breaking changes if it is needed for new features. Any scenarios which have been
              submitted via the "submit" button will be tested and updated before releases of new versions.
            </p>
            <p>
              One of the specific design choices is to make the tool a template for testing out ideas and strategies.
              Some example scenarios and units are available but the tools strength is to be able to test new units
              without waiting for a database update. And more importantly to see what the impact of a stat or production
              nerf would have on certain matchups.
            </p>
            <p>
              It uses a deterministic time-based simulation that accounts for attack reloads, armor types, micro
              overkill, and production delays. This allows you to simulate complex "what-if" scenarios, such as how many
              full upgraded feudal scouts need to catch up to an all in Man-at-Arms rush, or how target fire micro makes
              60 archers beat 60 skirms.
            </p>
            <div className="disclaimer">
              <p>Age of Empires II: Definitive Edition © Microsoft Corporation.</p>
              <p>
                Chombat was created under Microsoft's
                <a
                  href="https://www.xbox.com/en-us/developers/rules"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
                >
                  {' '}
                  "Game Content Usage Rules"
                </a>{' '}
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

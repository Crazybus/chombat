import React, { useMemo, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CombatSim } from '../sim/CombatSim';
import { calculateEqualResources, calculateEqualProductionTime, calculateEqualFight } from '../sim/ArmyAnalyzer';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import CombatCharts from './CombatCharts';
import StatsSummary from './StatsSummary';

const BattleSimulation: React.FC = () => {
  const { state, updateArmy, analysisA, analysisB } = useSimulation();

  const res = useMemo(() => {
    if (!analysisA || !analysisB) return null;

    const techsByIdMap: Record<number, any> = {};
    Object.values(techs).forEach((t) => (techsByIdMap[t.id] = t));
    const allUnits = { ...units, ...presets };

    const sim = new CombatSim(analysisA.baseUnit, analysisB.baseUnit, state.armyA, state.armyB, techsByIdMap, allUnits);
    return sim.run();
  }, [state.armyA, state.armyB, analysisA, analysisB]);

  if (!res || !analysisA || !analysisB) return null;

  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const winA = res.armyA.totalHp > res.armyB.totalHp;
  const color = winA ? 'var(--army-a-color)' : 'var(--army-b-color)';

  const ratioA =
    res.armyA.initialTotalHp > 0 ? ((res.armyA.totalHp / res.armyA.initialTotalHp) * 100).toFixed(1) : '0.0';
  const ratioB =
    res.armyB.initialTotalHp > 0 ? ((res.armyB.totalHp / res.armyB.initialTotalHp) * 100).toFixed(1) : '0.0';

  const survivorsA = isNaN(res.armyA.remaining) ? 0 : Math.ceil(res.armyA.remaining);
  const survivorsB = isNaN(res.armyB.remaining) ? 0 : Math.ceil(res.armyB.remaining);
  const duration = isNaN(res.duration) ? 0 : res.duration;

  const techsById: Record<number, any> = {};
  Object.values(techs).forEach((t) => (techsById[t.id] = t));
  const allUnits = { ...units, ...presets };

  const setEqualResources = () => {
    const newCountB = calculateEqualResources(
      state.armyA.count || 1,
      analysisA.baseUnit,
      state.armyA,
      analysisB.baseUnit,
      state.armyB,
      techsById,
      allUnits,
    );
    updateArmy('b', { count: Math.max(1, newCountB) });
  };

  const setEqualProduction = () => {
    const newCountB = calculateEqualProductionTime(
      state.armyA.count || 1,
      analysisA.baseUnit,
      state.armyA,
      analysisB.baseUnit,
      state.armyB,
      techsById,
      allUnits,
    );
    updateArmy('b', { count: Math.max(1, newCountB) });
  };

  const setEqualFight = () => {
    const newCountB = calculateEqualFight(
      state.armyA.count || 1,
      analysisA.baseUnit,
      state.armyA,
      analysisB.baseUnit,
      state.armyB,
      techsById,
      allUnits,
    );
    updateArmy('b', { count: Math.max(1, newCountB) });
  };

  return (
    <div id="battle" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Battle Simulation</h2>
        <p>Simulated combat results based on specific army sizes.</p>
      </div>

      <div className="ratio-bar">
        <ArmyCounter army="a" analysis={analysisA} count={state.armyA.count || 1} />

        <div className="simulation-actions">
          <button className="nav-btn secondary" onClick={setEqualResources}>
            Equal Resources
          </button>
          <button className="nav-btn secondary" onClick={setEqualProduction}>
            Equal Prod Time
          </button>
          <button className="nav-btn secondary" onClick={setEqualFight}>
            Equal Fight
          </button>
        </div>

        <ArmyCounter army="b" analysis={analysisB} count={state.armyB.count || 1} />
      </div>

      <section id="results" className="results-area" style={{ width: '100%' }}>
        <div
          id="overall-result"
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '15px',
            textAlign: 'center',
            color,
            overflowWrap: 'anywhere',
          }}
        >
          Winner: {winA ? nameA : nameB} ({duration.toFixed(1)}s)
        </div>
        <div id="stat-summary" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p>
            {nameA} survivors: <strong>{String(survivorsA)}</strong> ({ratioA}%) | {nameB} survivors:{' '}
            <strong>{String(survivorsB)}</strong> ({ratioB}%)
          </p>
        </div>

        <CombatCharts history={res.history} nameA={nameA} nameB={nameB} />
      </section>
    </div>
  );
};

const ArmyCounter: React.FC<{ army: 'a' | 'b'; analysis: any; count: number }> = ({ army, analysis, count }) => {
  const { updateArmy } = useSimulation();
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const handleChange = (newVal: number) => {
    updateArmy(army, { count: Math.max(1, newVal) });
  };

  const startRepeating = (dir: number) => {
    const doStep = () => {
      handleChange(countRef.current + dir);
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

  const scrollToUnits = () => {
    document.getElementById('units')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="counter-group">
      <label
        onClick={scrollToUnits}
        style={{
          color: `var(--army-${army}-color)`,
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          marginBottom: '5px',
        }}
      >
        {analysis.unitName}
      </label>
      <div className="counter-controls">
        <button
          className="count-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            startRepeating(-1);
          }}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
        >
          −
        </button>
        <input type="number" value={count} onChange={(e) => handleChange(parseInt(e.target.value) || 1)} />
        <button
          className="count-btn"
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

      <div style={{ marginTop: '10px', width: '100%' }}>
        <StatsSummary army={army} compact={true} hoverExpand={true} />
      </div>
    </div>
  );
};

export default BattleSimulation;

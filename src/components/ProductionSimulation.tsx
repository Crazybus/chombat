import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { analyzeProduction, ProductionAnalysisResult, ProductionResult } from '../sim/ProductionSim';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { buildings } from '../data/buildings';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductionSimulation: React.FC = () => {
  const { state, analysisA, analysisB } = useSimulation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showLog, setShowLog] = useState(false);

  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const result: ProductionAnalysisResult | null = useMemo(() => {
    if (!analysisA || !analysisB) return null;
    const allUnits = { ...units, ...presets };
    return analyzeProduction(state.a, state.b, analysisA.baseUnit, analysisB.baseUnit, techsById, allUnits);
  }, [state.a, state.b, analysisA, analysisB, techsById]);

  if (!result || !analysisA || !analysisB) return null;
  const { finalResA, finalResB, labels, countA, countB, advantage, tideTurnsAt, winnerAtTideTurn, countAtTideTurnA, countAtTideTurnB, economyA, economyB } = result;

  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: { 
      x: { ticks: { maxTicksLimit: 12 } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    elements: { line: { tension: 0.1 }, point: { radius: 0 } }
  };

  const growthData = {
    labels,
    datasets: [
      { label: nameA, data: countA, borderColor: 'var(--army-a-color)', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: true },
      { label: nameB, data: countB, borderColor: 'var(--army-b-color)', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true },
    ]
  };

  const advantageData = {
    labels,
    datasets: [
      { 
        label: 'Advantage % (+A / -B)', 
        data: advantage, 
        borderColor: 'var(--accent-color)',
        fill: { target: 'origin', above: 'rgba(52, 152, 219, 0.2)', below: 'rgba(231, 76, 60, 0.2)' }
      },
    ]
  };

  const economyData = {
    labels,
    datasets: [
      { label: 'A: Gathered', data: economyA.map(e => e.gathered), borderColor: 'var(--army-a-color)', borderDash: [5, 5], fill: false },
      { label: 'A: Spent', data: economyA.map(e => e.spent), borderColor: 'var(--army-a-color)', fill: false },
      { label: 'B: Gathered', data: economyB.map(e => e.gathered), borderColor: 'var(--army-b-color)', borderDash: [5, 5], fill: false },
      { label: 'B: Spent', data: economyB.map(e => e.spent), borderColor: 'var(--army-b-color)', fill: false },
    ]
  };

  const balanceData = {
    labels,
    datasets: [
      { label: 'A: Balance', data: economyA.map(e => e.gathered - e.spent), borderColor: 'var(--army-a-color)', fill: false },
      { label: 'B: Balance', data: economyB.map(e => e.gathered - e.spent), borderColor: 'var(--army-b-color)', fill: false },
    ]
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div id="production" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <h2>Production Simulation</h2>
        <p>Define your build order and see when the tide turns.</p>
      </div>

      <button className="toggle-prod-section-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Edit Build Order' : 'Done Editing'}
      </button>

      <div className={`production-content ${isCollapsed ? 'collapsed' : ''}`} style={{ marginBottom: '20px' }}>
        <div className="production-race-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           <TimelineEditor army="a" name={nameA} />
           <TimelineEditor army="b" name={nameB} />
        </div>
      </div>

      <div className="results-area" style={{ width: '100%' }}>
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', width: '100%' }}>
          <div className="chart-wrapper" style={{ height: '350px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Army Growth over Time</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}><Line data={growthData} options={commonOptions} /></div>
          </div>
          <div className="chart-wrapper" style={{ height: '350px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Battle Advantage % (+A / -B)</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}>
              <Line 
                data={advantageData} 
                options={{ ...commonOptions, scales: { ...commonOptions.scales, y: { min: -100, max: 100 } } }} 
              />
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '350px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Economy (Gathered vs Spent)</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}><Line data={economyData} options={commonOptions} /></div>
          </div>
          <div className="chart-wrapper" style={{ height: '350px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Economic Balance (Delta)</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}><Line data={balanceData} options={commonOptions} /></div>
          </div>
        </div>

        <div className="matchup-report" style={{ marginTop: '20px', background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '10px', marginBottom: '15px' }}>Production Analysis</h3>
          <div id="production-report-text">
            {tideTurnsAt !== null ? (
              <p style={{ fontSize: '1.1rem', textAlign: 'center' }}>
                The <strong>{winnerAtTideTurn}</strong> start to win at <strong style={{ color: 'var(--accent-color)' }}>{formatTime(tideTurnsAt)}</strong> when the fight becomes <strong>{countAtTideTurnA} vs {countAtTideTurnB}</strong>.
              </p>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>One side maintains the advantage throughout the entire 30 minute window.</p>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--army-a-color)' }}>{nameA}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalResA.count}</p>
                <p style={{ color: 'var(--text-dim)' }}>units at 30 min</p>
              </div>
              <div style={{ alignSelf: 'center', fontSize: '2rem', color: 'var(--text-dim)' }}>VS</div>
              <div>
                <h4 style={{ color: 'var(--army-b-color)' }}>{nameB}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalResB.count}</p>
                <p style={{ color: 'var(--text-dim)' }}>units at 30 min</p>
              </div>
            </div>
          </div>
        </div>

        <div className="event-log-container" style={{ marginTop: '20px' }}>
          <button className="nav-btn" style={{ width: '100%' }} onClick={() => setShowLog(!showLog)}>
            {showLog ? 'Hide' : 'Show'} Full Event Log
          </button>
          {showLog && (
            <div className="event-log" style={{ background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', marginTop: '10px', maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-dim)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <EventList events={finalResA.events} name={nameA} color="var(--army-a-color)" />
                <EventList events={finalResB.events} name={nameB} color="var(--army-b-color)" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventList: React.FC<{ events: any[], name: string, color: string }> = ({ events, name, color }) => (
  <div>
    <h4 style={{ color, marginBottom: '10px', borderBottom: '1px solid var(--border-dim)' }}>{name} Events</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px' }}>
          <span style={{ color: 'var(--text-dim)', minWidth: '50px' }}>{Math.floor(e.time / 60)}m {e.time % 60}s</span>
          <span>{e.msg}</span>
        </div>
      ))}
    </div>
  </div>
);

const TimelineEditor: React.FC<{ army: 'a' | 'b', name: string }> = ({ army, name }) => {
  const { state, updateArmy } = useSimulation();
  const armyState = state[army];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addStep = (type: string, data: any = {}) => {
    const newStep = { t: type, n: data.name || type, d: data.time || 30, c: 1, co: data.cost || 0, ...data };
    updateArmy(army, { tl: [...(armyState.tl || []), newStep] });
  };

  const addAgeTechs = (age: number) => {
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    
    const civKey = armyState.cv || GENERIC_CIV;
    const availableCivTechs: Record<number, number> = civs[civKey] || {};
    
    const analysis = army === 'a' ? analysisA : analysisB;
    const u = analysis?.baseUnit || units['archer'];
    
    const relevant = getRecommendedTechs(u, age, civKey, techsById, availableCivTechs);
    
    const newSteps = relevant.filter(t => t.age === age).map(t => ({
      t: 'tech',
      n: t.name,
      d: t.time || 40,
      c: 1,
      co: (t.f||0)+(t.w||0)+(t.g||0),
      i: t.id.toString(),
      bt: t.building.toString(),
      b: true
    }));
    
    updateArmy(army, { tl: [...(armyState.tl || []), ...newSteps] });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = armyState.tl?.findIndex((_, i) => `step-${army}-${i}` === active.id) ?? -1;
      const newIndex = armyState.tl?.findIndex((_, i) => `step-${army}-${i}` === over.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) {
        updateArmy(army, { tl: arrayMove(armyState.tl!, oldIndex, newIndex) });
      }
    }
  };

  return (
    <div className={`prod-group army-${army}-border`} style={{ background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
      <div className="prod-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>{name}</h3>
        <div className="field-check">
          <input 
            type="checkbox" 
            checked={armyState.cont || false} 
            onChange={(e) => updateArmy(army, { cont: e.target.checked })}
          />
          <label style={{ fontSize: '0.75rem' }}>Continuous Vills</label>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={(armyState.tl || []).map((_, i) => `step-${army}-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="production-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {armyState.tl?.map((step, idx) => (
                <SortableStep key={idx} id={`step-${army}-${idx}`} army={army} index={idx} step={step} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <div className="add-step-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
          <AutocompleteSelector 
            label="+ Building" 
            options={Object.values(buildings).map(b => ({ id: b.id, name: b.name, time: b.time, cost: (b.f||0)+(b.w||0)+(b.g||0)+(b.s||0), prod: true }))}
            onSelect={(b) => addStep('building', b)}
          />
          <AutocompleteSelector 
            label="+ Tech" 
            options={Object.values(techs).map(t => ({ id: t.id, name: t.name, time: t.time, cost: (t.f||0)+(t.w||0)+(t.g||0), bt: t.building.toString() }))}
            onSelect={(t) => addStep('tech', t)}
          />
          <button className="add-step-btn" onClick={() => addStep('villagers', { name: 'Villagers', v: 1, d: 25 })}>+ Vills</button>
          <button className="add-step-btn" onClick={() => addStep('delay', { name: 'Idle Time', d: 30 })}>+ Delay</button>
          <button className="add-step-btn" onClick={() => addStep('units', { name: 'Wait for units', c: 5 })}>+ Wait</button>
          <button className="add-step-btn" onClick={() => addStep('production', { name: 'Start Production', v: 1, tr: 30, inf: true, d: 0 })}>+ Production</button>
        </div>

        <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '5px' }}>Quick Add:</span>
          <button className="small-action-btn" onClick={() => addAgeTechs(2)}>Feudal Techs</button>
          <button className="small-action-btn" onClick={() => addAgeTechs(3)}>Castle Techs</button>
          <button className="small-action-btn" onClick={() => addAgeTechs(4)}>Imperial Techs</button>
        </div>
      </div>
    </div>
  );
};

const SortableStep: React.FC<{ id: string, army: 'a' | 'b', index: number, step: any }> = ({ id, army, index, step }) => {
  const { updateArmy, state } = useSimulation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const update = (updates: any) => {
    const currentList = state[army].tl || [];
    const newList = [...currentList];
    newList[index] = { ...newList[index], ...updates };
    updateArmy(army, { tl: newList });
  };

  const remove = () => {
    const currentList = state[army].tl || [];
    const newList = [...currentList];
    newList.splice(index, 1);
    updateArmy(army, { tl: newList });
  };

  const toggleBlock = (target: number) => {
    if (step.b && step.bt === target) {
      update({ b: false, bt: undefined });
    } else {
      update({ b: true, bt: target });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="timeline-step">
      <div className="step-header">
        <div {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '8px' }}>⣿</div>
        <span className="timeline-step-label">{step.t}</span>
        <button className="remove-step-btn" onClick={remove}>&times;</button>
      </div>
      <div className="step-body" style={{ display: 'flex', gap: '8px', padding: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="step-field">
          <label>Name</label>
          <input type="text" value={step.n || ''} onChange={(e) => update({ n: e.target.value })} style={{ width: '100px' }} />
        </div>
        
        {step.t === 'units' ? (
          <div className="step-field">
            <label>Wait for Count</label>
            <input type="number" value={step.c || 0} onChange={(e) => update({ c: parseInt(e.target.value) || 0 })} style={{ width: '45px' }} />
          </div>
        ) : (
          <>
            <div className="step-field">
              <label>Sec</label>
              <input type="number" value={step.d || 0} onChange={(e) => update({ d: parseInt(e.target.value) || 0 })} style={{ width: '45px' }} />
            </div>
            
            {step.t === 'villagers' || step.t === 'building' ? (
              <div className="step-field">
                <label>Count</label>
                <input type="number" value={step.c || 1} onChange={(e) => update({ c: parseInt(e.target.value) || 1 })} style={{ width: '35px' }} />
              </div>
            ) : null}

            {step.t === 'production' ? (
              <div className="step-field">
                <label>Train(s)</label>
                <input type="number" value={step.tr || 0} onChange={(e) => update({ tr: parseInt(e.target.value) || 0 })} style={{ width: '45px' }} />
              </div>
            ) : null}
          </>
        )}

        {/* Blocking Buttons */}
        {(step.t === 'tech' || step.t === 'building' || step.t === 'production') && (
          <div className="block-buttons" style={{ display: 'flex', gap: '4px' }}>
            <button 
              className={`small-toggle-btn ${step.b && step.bt === 109 ? 'active' : ''}`}
              style={step.b && step.bt === 109 ? { background: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' } : {}}
              onClick={() => toggleBlock(109)}
              title="Blocks Town Center production"
            >
              Block TC
            </button>
            <button 
              className={`small-toggle-btn ${step.b && step.bt !== 109 ? 'active' : ''}`}
              style={step.b && step.bt !== 109 ? { background: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' } : {}}
              onClick={() => toggleBlock(101)} // Default to military
              title="Blocks Military production"
            >
              Block Unit
            </button>
          </div>
        )}

        {(step.t === 'villagers' || step.t === 'production') && (
          <div className="step-field check-field">
            <label title="Keep producing after this step">Inf?</label>
            <input type="checkbox" checked={step.inf || false} onChange={(e) => update({ inf: e.target.checked })} />
          </div>
        )}
      </div>
    </div>
  );
};

const AutocompleteSelector: React.FC<{ label: string, options: any[], onSelect: (opt: any) => void }> = ({ label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const rect = buttonRef.current?.getBoundingClientRect();

  return (
    <div style={{ position: 'relative' }}>
      <button ref={buttonRef} className="add-step-btn" onClick={() => setIsOpen(!isOpen)}>{label}</button>
      {isOpen && rect && (
        <div 
          className="preset-list" 
          style={{ 
            display: 'block', 
            position: 'fixed', 
            top: rect.top - 305 > 0 ? rect.top - 305 : rect.bottom + 5,
            left: rect.left, 
            zIndex: 10000, 
            minWidth: '250px', 
            maxHeight: '300px', 
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-color)'
          }}
        >
          <input 
            type="text" 
            autoFocus 
            placeholder="Search..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', color: 'var(--text-color)', border: 'none', borderBottom: '1px solid var(--border-dim)' }}
          />
          {filtered.map((o, i) => (
            <div key={i} className="preset-item" onClick={() => { onSelect(o); setIsOpen(false); setSearch(''); }}>
              {o.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductionSimulation;

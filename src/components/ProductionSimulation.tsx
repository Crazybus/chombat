import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { analyzeProduction, ProductionAnalysisResult } from '../sim/ProductionSim';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StatsSummary from './StatsSummary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const ProductionSimulation: React.FC = () => {
  const { state, analysisA, analysisB, loadPreset } = useSimulation();
  const [isCollapsedA, setIsCollapsedA] = useState(true);
  const [isCollapsedB, setIsCollapsedB] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);
  const [maxTime, setMaxTime] = useState(1800); // Default 30 mins

  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const result: ProductionAnalysisResult | null = useMemo(() => {
    if (!analysisA || !analysisB) return null;
    const allUnits = { ...units, ...presets };
    return analyzeProduction(state.a, state.b, analysisA.baseUnit, analysisB.baseUnit, techsById, allUnits, maxTime);
  }, [state.a, state.b, analysisA, analysisB, techsById, maxTime]);

  if (!result || !analysisA || !analysisB) return null;
  const { 
    finalResA, finalResB, labels, countA, countB, advantage, 
    tideTurnsAt, economyA, economyB, 
    mergedEvents
  } = result;

  const nameA = analysisA.unitName;
  const nameB = analysisB.unitName;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' as const },
    scales: { 
      x: { 
        ticks: { maxTicksLimit: 12 },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    plugins: {
      legend: { position: 'top' as const },
    },
    elements: { line: { tension: 0.1, borderWidth: 2 }, point: { radius: 0 } }
  };

  const growthData = {
    labels,
    datasets: [
      { label: nameA, data: countA, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: true },
      { label: nameB, data: countB, borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true },
    ]
  };

  const advantageData = {
    labels,
    datasets: [
      { 
        label: 'Battle Advantage % (+A / -B)', 
        data: advantage, 
        borderColor: '#3498db', 
        segment: {
          borderColor: (ctx: any) => {
            const val = ctx.p0.parsed.y;
            return val >= 0 ? '#3498db' : '#e74c3c';
          }
        },
        fill: { target: 'origin', above: 'rgba(52, 152, 219, 0.2)', below: 'rgba(231, 76, 60, 0.2)' }
      },
    ]
  };

  const economyData = {
    labels,
    datasets: [
      { label: 'A: Gathered', data: economyA.map(e => e.gathered), borderColor: '#3498db', borderDash: [5, 5], fill: false },
      { label: 'A: Spent', data: economyA.map(e => e.spent), borderColor: '#3498db', fill: false },
      { label: 'B: Gathered', data: economyB.map(e => e.gathered), borderColor: '#e74c3c', borderDash: [5, 5], fill: false },
      { label: 'B: Spent', data: economyB.map(e => e.spent), borderColor: '#e74c3c', fill: false },
    ]
  };

  const balanceData = {
    labels,
    datasets: [
      { label: 'A: Float', data: economyA.map(e => Math.max(0, e.gathered - e.spent)), borderColor: '#3498db', fill: false },
      { label: 'A: Vills', data: economyA.map(e => e.vills), borderColor: '#3498db', borderDash: [2, 2], fill: false, pointRadius: 0, borderWidth: 1 },
      { label: 'B: Float', data: economyB.map(e => Math.max(0, e.gathered - e.spent)), borderColor: '#e74c3c', fill: false },
      { label: 'B: Vills', data: economyB.map(e => e.vills), borderColor: '#e74c3c', borderDash: [2, 2], fill: false, pointRadius: 0, borderWidth: 1 },
    ]
  };

  const createAnnotations = (events: any[], color: string) => {
    const annotations: any = {};
    events.filter(e => e.msg.startsWith('Started:') || e.msg.includes('production started')).forEach((e, i) => {
      const timeStr = Math.floor(e.time / 60) + 'm' + (e.time % 60 ? (e.time % 60) + 's' : '');
      const labelIdx = labels.indexOf(timeStr);
      if (labelIdx === -1) return;

      annotations[`line${color}-${i}`] = {
        type: 'line',
        xMin: labelIdx,
        xMax: labelIdx,
        borderColor: color,
        borderWidth: 1,
        borderDash: [2, 2],
        label: { display: false, content: e.msg, position: 'start' }
      };
    });
    return annotations;
  };

  const balanceOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      annotation: {
        annotations: {
          ...createAnnotations(finalResA.events, 'rgba(52, 152, 219, 0.3)'),
          ...createAnnotations(finalResB.events, 'rgba(231, 76, 60, 0.3)'),
        }
      }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const displayedEvents = showFullLog ? mergedEvents : mergedEvents.filter(e => e.important);

  return (
    <div id="production" className="section-anchor" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <h2>Production Simulation</h2>
            <p>Define your build order and see when the tide turns.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Sim Duration:</span>
            <select 
              value={maxTime} 
              onChange={(e) => setMaxTime(parseInt(e.target.value))}
              style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-dim)', padding: '4px 8px', borderRadius: '4px' }}
            >
              <option value={600}>10 Mins</option>
              <option value={900}>15 Mins</option>
              <option value={1200}>20 Mins</option>
              <option value={1800}>30 Mins</option>
              <option value={2700}>45 Mins</option>
              <option value={3600}>60 Mins</option>
            </select>
          </div>
        </div>
      </div>

      <div className="build-orders-overview" style={{ marginBottom: '15px' }}>
        <BuildOrderSummary 
          army="a" 
          name={nameA} 
          timeline={state.a.tl || []} 
          onEdit={() => setIsCollapsedA(!isCollapsedA)} 
          onReset={() => state.a.ps && loadPreset('a', state.a.ps)}
        />
        <div className={`production-content ${isCollapsedA ? 'collapsed' : ''}`} style={{ marginBottom: isCollapsedA ? '0' : '20px' }}>
          <TimelineEditor army="a" name={nameA} />
          {!isCollapsedA && (
            <button className="toggle-prod-section-btn" style={{ marginTop: '10px', width: '100%' }} onClick={() => setIsCollapsedA(true)}>
              Close Side A Build Order Editor
            </button>
          )}
        </div>

        <BuildOrderSummary 
          army="b" 
          name={nameB} 
          timeline={state.b.tl || []} 
          onEdit={() => setIsCollapsedB(!isCollapsedB)} 
          onReset={() => state.b.ps && loadPreset('b', state.b.ps)}
        />
        <div className={`production-content ${isCollapsedB ? 'collapsed' : ''}`} style={{ marginBottom: isCollapsedB ? '0' : '20px' }}>
          <TimelineEditor army="b" name={nameB} />
          {!isCollapsedB && (
            <button className="toggle-prod-section-btn" style={{ marginTop: '10px', width: '100%' }} onClick={() => setIsCollapsedB(true)}>
              Close Side B Build Order Editor
            </button>
          )}
        </div>
      </div>

      <div className="results-area" style={{ width: '100%' }}>
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', width: '100%' }}>
          <div className="chart-wrapper" style={{ height: '300px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
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
            <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Floating Resources & Eco Units</h4>
            <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}><Line data={balanceData} options={balanceOptions} /></div>
          </div>
        </div>

        <div className="matchup-report" style={{ marginTop: '20px', background: 'var(--panel-bg-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <div style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '10px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Events</h3>
          </div>
          
          <div className="event-timeline-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {displayedEvents.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-dim)', textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px' }}>Time</th>
                    <th style={{ padding: '8px' }}>Side</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Eco (V/V)</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Mil (U/U)</th>
                    <th style={{ padding: '8px' }}>Event</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEvents.map((e, i) => (
                    <tr key={i} className="event-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: e.important ? 'rgba(243, 156, 18, 0.05)' : (i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent') }}>
                      <td style={{ padding: '10px 8px', color: 'var(--text-dim)', width: '80px' }}>{formatTime(e.time)}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 'bold', width: '120px' }}>
                        {e.army === 'a' ? <span style={{ color: 'var(--army-a-color)' }}>{nameA}</span> : e.army === 'b' ? <span style={{ color: 'var(--army-b-color)' }}>{nameB}</span> : <span style={{ color: 'var(--accent-color)' }}>System</span>}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ color: 'var(--army-a-color)' }}>{e.villsA}</span> / <span style={{ color: 'var(--army-b-color)' }}>{e.villsB}</span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ color: 'var(--army-a-color)' }}>{e.unitsA}</span> / <span style={{ color: 'var(--army-b-color)' }}>{e.unitsB}</span>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: e.important ? 'bold' : 'normal' }}>{e.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No events detected.</p>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <button 
              className="nav-btn secondary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)' }}
              onClick={() => setShowFullLog(!showFullLog)}
            >
              <span>{showFullLog ? '🔼 Show Important Events Only' : '🔽 Show All Simulation Events'}</span>
            </button>
          </div>

          <div className="investment-table-container">
            <h4 style={{ color: 'var(--accent-color)', marginBottom: '15px', fontSize: '1rem' }}>Resource Investment at {formatTime(tideTurnsAt || maxTime)}</h4>
            <table className="investment-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-dim)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px 8px' }}>Category</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--army-a-color)' }}>{nameA}</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--army-b-color)' }}>{nameB}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const stepVal = 15;
                  const idx = tideTurnsAt !== null ? Math.floor(tideTurnsAt / stepVal) : economyA.length - 1;
                  const ecoA = economyA[idx] || economyA[economyA.length - 1];
                  const ecoB = economyB[idx] || economyB[economyB.length - 1];
                  const rows = [
                    { label: 'Villagers', a: ecoA.spentOnVillagers, b: ecoB.spentOnVillagers },
                    { label: 'Units', a: ecoA.spentOnUnits, b: ecoB.spentOnUnits },
                    { label: 'Buildings', a: ecoA.spentOnBuildings, b: ecoB.spentOnBuildings },
                    { label: 'Technologies', a: ecoA.spentOnTechs, b: ecoB.spentOnTechs },
                  ];
                  const totalA = rows.reduce((acc, r) => acc + r.a, 0);
                  const totalB = rows.reduce((acc, r) => acc + r.b, 0);
                  const fmt = (n: number) => n.toLocaleString();
                  return (
                    <>
                      {rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                          <td style={{ padding: '10px 8px', color: 'var(--text-dim)' }}>{r.label}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>{fmt(r.a)}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>{fmt(r.b)}</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border-dim)', background: 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 8px' }}>Total Investment</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>{fmt(totalA)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>{fmt(totalB)}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuildOrderSummary: React.FC<{ army: 'a' | 'b', name: string, timeline: any[], onEdit: () => void, onReset: () => void }> = ({ army, name, timeline, onEdit, onReset }) => (
  <div 
    className="build-order-summary" 
    onClick={onEdit}
    style={{ 
      background: 'rgba(0,0,0,0.15)', 
      padding: '12px', 
      borderRadius: '4px', 
      marginBottom: '8px', 
      fontSize: '0.85rem', 
      color: 'var(--text-dim)',
      borderLeft: `3px solid var(--army-${army}-color)`,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(0,0,0,0.15)';
      e.currentTarget.style.transform = 'none';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span 
        style={{ 
          background: 'var(--btn-bg)', 
          border: '1px solid var(--border-dim)', 
          color: 'var(--text-color)', 
          borderRadius: '3px', 
          padding: '2px 6px', 
          fontSize: '0.7rem', 
          marginRight: '5px'
        }}
        title="Toggle Build Order Editor"
      >
        ✏️
      </span>
      <strong style={{ color: `var(--army-${army}-color)`, marginRight: '5px' }}>{name}:</strong>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <StatsSummary army={army} compact={true} hoverExpand={true} />
      </div>
      <button 
        className="small-action-btn" 
        onClick={(e) => { e.stopPropagation(); onReset(); }}
        title="Refresh to default build order plan for this unit"
        style={{ fontSize: '0.7rem', padding: '4px 8px', marginLeft: 'auto' }}
      >
        🔄 Refresh Plan
      </button>
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', paddingLeft: '25px', opacity: 0.8 }}>
      {timeline && timeline.length > 0 ? (
        timeline.map((step: any, i: number) => {
          let label = "";
          const n = (step.n || "").toLowerCase();
          switch (step.t) {
            case 'villagers': label = `👨‍🌾${step.c || 1} villagers`; break;
            case 'building': label = n; break;
            case 'tech': label = n; break;
            case 'production': 
              label = n.includes('production') ? `⚔️ ${n}` : `⚔️ ${n} production`; 
              break;
            case 'units': case 'wait': label = `🎯wait ${step.c || 0}`; break;
            case 'delay': label = `⏳${step.d || 0}s`; break;
            default: label = n;
          }
          return (
            <React.Fragment key={i}>
              <span style={{ color: 'var(--text-color)' }}>{label}</span>
              {i < (timeline?.length || 0) - 1 && <span style={{ opacity: 0.3 }}>→</span>}
            </React.Fragment>
          );
        })
      ) : (
        <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Empty build order - 1 facility production assumed.</span>
      )}
    </div>
  </div>
);

const GRID_TEMPLATE = "30px 70px 1fr 100px 100px 100px 100px 60px 30px";

const TechButton: React.FC<{ id: number, label: string, onClick: (id: number) => void }> = ({ id, label, onClick }) => (
  <button 
    className="small-action-btn" 
    style={{ minWidth: '25px', padding: '2px 4px' }} 
    onClick={(e) => { e.stopPropagation(); onClick(id); }}
    title={(techs as any)[id]?.name || `Tech ${id}`}
  >
    {label}
  </button>
);

const TimelineEditor: React.FC<{ army: 'a' | 'b', name: string }> = ({ army, name }) => {
  const { state, updateArmy, loadPreset, analysisA, analysisB } = useSimulation();
  const armyState = state[army];
  const unitBuildingId = (army === 'a' ? analysisA?.baseUnit?.building : analysisB?.baseUnit?.building) || 87;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addStep = (type: string, data: any = {}) => {
    // Normalize properties
    const newStep = { 
      t: type, 
      n: data.name || type, 
      d: data.time !== undefined ? data.time : 30, 
      c: 1, 
      co: data.cost || 0,
      i: data.i || data.id?.toString(),
      bt: data.bt !== undefined ? parseInt(data.bt.toString()) : undefined,
      lim: false, // Default to infinite/continuous
      ...data 
    };
    // Remove redundant/wrong properties
    delete (newStep as any).time;
    delete (newStep as any).cost;
    delete (newStep as any).id;

    updateArmy(army, { tl: [...(armyState.tl || []), newStep] });
  };

  const addTechById = (id: number) => {
    const t = (techs as any)[id] || Object.values(techs).find(x => x.id === id);
    if (!t) return;
    addStep('tech', {
      n: t.name,
      d: t.time || 40,
      c: 1,
      co: (t.f||0)+(t.w||0)+(t.g||0),
      i: t.id.toString(),
      bt: t.building,
      b: (t.building === unitBuildingId || t.building === 109),
      lim: true // Techs are inherently "Once"
    });
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
      <div className="prod-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>{name}</h3>
        {armyState.ps && (
          <button 
            className="nav-btn secondary" 
            onClick={() => loadPreset(army, armyState.ps!)}
            title="Refresh to default build order plan for this unit"
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          >
            🔄 Refresh Default Plan
          </button>
        )}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div className="add-step-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
          <AutocompleteSelector 
            label="+ Building" 
            options={Object.values(buildings).map(b => ({ i: b.id, name: b.name, time: b.time, cost: (b.f||0)+(b.w||0)+(b.g||0)+(b.s||0), prod: true, bt: parseInt(b.id), lim: true }))}
            onSelect={(b) => addStep('building', b)}
          />
          <AutocompleteSelector 
            label="+ Tech" 
            options={Object.values(techs).map(t => ({ i: t.id.toString(), name: t.name, time: t.time, cost: (t.f||0)+(t.w||0)+(t.g||0), bt: t.building, lim: true }))}
            onSelect={(t) => addStep('tech', t)}
          />
          <button className="add-step-btn" onClick={() => addStep('villagers', { name: 'Villagers', v: 1, d: 25, lim: false, cost: 50 })}>+ Vills</button>
          <button className="add-step-btn" onClick={() => addStep('delay', { name: 'Idle Time', d: 30, lim: true })}>+ Delay</button>
          <button className="add-step-btn" onClick={() => addStep('units', { name: 'Wait for units', c: 5, lim: true })}>+ Wait</button>
          <button className="add-step-btn" onClick={() => addStep('production', { name: `${name} Production`, v: 1, tr: 30, lim: false, d: 0 })}>+ {name} Production</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ages</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
              <button className="small-action-btn" onClick={() => addTechById(101)}>II</button>
              <button className="small-action-btn" onClick={() => addTechById(102)}>III</button>
              <button className="small-action-btn" onClick={() => addTechById(103)}>IV</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Melee</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
              <span title="Melee Attack (Sword/Horse)" style={{ fontSize: '0.9rem', width: '20px', opacity: 0.7, textAlign: 'center' }}>⚔️</span>
              <TechButton id={67} label="II" onClick={addTechById} />
              <TechButton id={68} label="III" onClick={addTechById} />
              <TechButton id={74} label="IV" onClick={addTechById} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Infantry</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
              <span title="Infantry Armor" style={{ fontSize: '0.9rem', width: '20px', opacity: 0.7, textAlign: 'center' }}>🛡️</span>
              <TechButton id={75} label="II" onClick={addTechById} />
              <TechButton id={76} label="III" onClick={addTechById} />
              <TechButton id={77} label="IV" onClick={addTechById} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cavalry</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
              <span title="Cavalry Armor & HP" style={{ fontSize: '0.9rem', width: '20px', opacity: 0.7, textAlign: 'center' }}>🏇</span>
              <TechButton id={81} label="II" onClick={addTechById} />
              <TechButton id={82} label="III" onClick={addTechById} />
              <TechButton id={80} label="IV" onClick={addTechById} />
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
              <TechButton id={435} label="❤️" onClick={addTechById} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Archers</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
              <span title="Archer Attack" style={{ fontSize: '0.9rem', width: '20px', opacity: 0.7, textAlign: 'center' }}>🏹</span>
              <TechButton id={199} label="II" onClick={addTechById} />
              <TechButton id={200} label="III" onClick={addTechById} />
              <TechButton id={201} label="IV" onClick={addTechById} />
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
              <span title="Archer Armor" style={{ fontSize: '0.9rem', width: '20px', opacity: 0.7, textAlign: 'center' }}>🛡️</span>
              <TechButton id={211} label="II" onClick={addTechById} />
              <TechButton id={212} label="III" onClick={addTechById} />
              <TechButton id={219} label="IV" onClick={addTechById} />
            </div>
          </div>
        </div>

        <div className="timeline-table-header" style={{ display: 'grid', gridTemplateColumns: GRID_TEMPLATE, gap: '8px', padding: '0 8px 8px 8px', borderBottom: '1px solid var(--border-dim)', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          <div></div>
          <div title="The type of action (Building, Tech, Production, etc.)">Type</div>
          <div title="Custom name for this step">Name</div>
          <div style={{ textAlign: 'center' }} title="Duration in seconds. For Age Up/Tech/Building, this is the build time.">Sec</div>
          <div style={{ textAlign: 'center' }} title="Quantity or Multiplier. For buildings, this is how many to build at once.">Qty</div>
          <div style={{ textAlign: 'center' }} title="Total resource cost for this step.">Cost</div>
          <div style={{ textAlign: 'center' }} title="Which production facility this action blocks while in progress.">Block</div>
          <div style={{ textAlign: 'center' }} title="Once (Limited): If checked, this step will block the build order until the exact count is produced. If unchecked, production starts immediately and continues infinitely.">Once</div>
          <div></div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={(armyState.tl || []).map((_, i) => `step-${army}-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="production-timeline-table" style={{ display: 'flex', flexDirection: 'column' }}>
              {armyState.tl?.map((step, idx) => (
                <SortableStep key={idx} id={`step-${army}-${idx}`} army={army} index={idx} step={step} unitBuildingId={unitBuildingId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

const SortableStep: React.FC<{ id: string, army: 'a' | 'b', index: number, step: any, unitBuildingId: number }> = ({ id, army, index, step, unitBuildingId }) => {
  const { updateArmy, state } = useSimulation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const style = { transform: CSS.Transform.toString(transform), transition };

  const update = (updates: any) => {
    const currentList = state[army].tl || [];
    const newList = [...currentList];
    newList[index] = { ...newList[index], ...updates };
    updateArmy(army, { tl: newList });
  };

  const startRepeating = (field: string, dir: number, stepVal: number = 1) => {
    const doStep = () => {
      const currentVal = parseFloat(String(stepRef.current[field] || 0));
      const next = currentVal + (dir * stepVal);
      const rounded = Math.round(next * 100) / 100;
      update({ [field]: rounded });
    };

    doStep();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(doStep, 50);
    }, 500);
  };

  const stopRepeating = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopRepeating();
  }, []);

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

  const typeIcon = useMemo(() => {
    switch (step.t) {
      case 'villagers': return '👨‍🌾';
      case 'building': return '🏠';
      case 'tech': return '🧪';
      case 'production': return '⚔️';
      case 'units': return '🎯';
      case 'delay': return '⏳';
      default: return '❓';
    }
  }, [step.t]);

  const isTCActive = !!(step.b && step.bt === 109);
  const isUnitActive = !!(step.b && step.bt === unitBuildingId && step.b);

  return (
    <div ref={setNodeRef} style={style} className="timeline-row" >
      <div style={{ display: 'grid', gridTemplateColumns: GRID_TEMPLATE, gap: '8px', alignItems: 'center', padding: '8px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-dim)' }}>⠿</div>
        
        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '1rem' }}>{typeIcon}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{step.t.slice(0,4)}</span>
        </div>

        <div>
          <input 
            type="text" 
            value={step.n || ''} 
            onChange={(e) => update({ n: e.target.value })} 
            className="compact-input"
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '0.85rem' }} 
          />
        </div>
        
        <div className="stepper compact">
          <button className="step-btn" onMouseDown={() => startRepeating(step.t === 'production' ? 'tr' : 'd', -1, step.t === 'production' ? 1 : 5)} onMouseUp={stopRepeating} onMouseLeave={stopRepeating}>−</button>
          <input 
            type="number" 
            value={step.t === 'production' ? (step.tr || 0) : (step.d || 0)} 
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (step.t === 'production') update({ tr: val, d: val });
              else update({ d: val });
            }} 
            className="compact-input"
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-dim)', textAlign: 'center' }} 
          />
          <button className="step-btn" onMouseDown={() => startRepeating(step.t === 'production' ? 'tr' : 'd', 1, step.t === 'production' ? 1 : 5)} onMouseUp={stopRepeating} onMouseLeave={stopRepeating}>+</button>
        </div>

        <div className="stepper compact">
          <button className="step-btn" onMouseDown={() => startRepeating(step.t === 'production' ? 'v' : 'c', -1)} onMouseUp={stopRepeating} onMouseLeave={stopRepeating}>−</button>
          {step.t === 'production' ? (
            <input 
              type="number" 
              value={step.v || 1} 
              onChange={(e) => update({ v: parseInt(e.target.value) || 1 })} 
              className="compact-input"
              title="Multiplier / Capacity"
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'center' }} 
            />
          ) : (
            <input 
              type="number" 
              value={step.c || 1} 
              onChange={(e) => update({ c: parseInt(e.target.value) || 1 })} 
              className="compact-input"
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'center' }} 
            />
          )}
          <button className="step-btn" onMouseDown={() => startRepeating(step.t === 'production' ? 'v' : 'c', 1)} onMouseUp={stopRepeating} onMouseLeave={stopRepeating}>+</button>
        </div>

        <div className="stepper compact">
          <button className="step-btn" onMouseDown={() => startRepeating('co', -1, 5)} onMouseUp={stopRepeating} onMouseLeave={stopRepeating}>−</button>
          <input 
            type="number" 
            value={step.co || 0} 
            onChange={(e) => update({ co: parseInt(e.target.value) || 0 })} 
            className="compact-input"
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-dim)', textAlign: 'center' }} 
          />
          <button className="step-btn" onMouseDown={() => startRepeating('co', 1, 5)} onMouseUp={stopRepeating} onMouseLeave={stopRepeating}>+</button>
        </div>

        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {(step.t === 'tech' || step.t === 'building' || step.t === 'production') ? (
            <>
              <button 
                className={`tiny-toggle-btn ${isTCActive ? 'active' : ''}`}
                style={{ 
                  fontSize: '0.7rem', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-dim)',
                  background: isTCActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  color: isTCActive ? 'black' : 'var(--text-dim)',
                  cursor: 'pointer', fontWeight: 'bold'
                }}
                onClick={() => toggleBlock(109)}
              >TC</button>
              <button 
                className={`tiny-toggle-btn ${isUnitActive ? 'active' : ''}`}
                style={{ 
                  fontSize: '0.7rem', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-dim)',
                  background: isUnitActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  color: isUnitActive ? 'black' : 'var(--text-dim)',
                  cursor: 'pointer', fontWeight: 'bold'
                }}
                onClick={() => toggleBlock(unitBuildingId)}
              >UNIT</button>
            </>
          ) : null}
        </div>

        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
          {(step.t === 'villagers' || step.t === 'production') ? (
            <div 
              className={`custom-checkbox ${step.lim ? 'checked' : ''}`}
              onClick={() => update({ lim: !step.lim })}
              title="Toggle Limited Production (Produce exactly X and wait)"
              style={{
                width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border-dim)',
                background: step.lim ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color: step.lim ? 'black' : 'transparent', transition: 'all 0.2s',
                fontWeight: 'bold'
              }}
            >
              ✓
            </div>
          ) : null}
        </div>

        <button 
          onClick={remove} 
          style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
        >×</button>
      </div>
    </div>
  );
};

const AutocompleteSelector: React.FC<{ label: string, options: any[], onSelect: (opt: any) => void }> = ({ label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
      if (listRef.current && listRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
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
          ref={listRef}
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

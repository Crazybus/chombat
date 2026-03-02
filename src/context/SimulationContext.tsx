import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SimulationState, ArmyState, UnitData, TechData } from '../sim/types';
import { scenarios, featuredScenarios } from '../data/scenarios';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { civs, GENERIC_CIV } from '../data/civs';
import { COMBAT_BUILDINGS, shouldApplyTech } from '../sim/TechLogic';
import { analyzeArmy, ArmyAnalysis, getRecommendedTechs, scrubArmy } from '../sim/ArmyAnalyzer';
import { buildings } from '../data/buildings';

interface SimulationContextType {
  state: SimulationState;
  analysisA: ArmyAnalysis | null;
  analysisB: ArmyAnalysis | null;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
  updateArmy: (army: 'a' | 'b', updates: Partial<ArmyState>) => void;
  loadScenario: (id: string) => void;
  loadPreset: (army: 'a' | 'b', id: string) => void;
  showToast: (msg: string) => void;
  resetToNewScenario: () => void;
  applyAgeBonuses: (army: 'a' | 'b', age: string, civOverride?: string) => void;
  clearOverrides: (army: 'a' | 'b') => void;
  toggleBonus: (army: 'a' | 'b', techId: string) => void;
}

const defaultArmy: ArmyState = {
  c: 1,
  age: '1',
  tl: [{ t: 'production', n: 'Initial Production', c: 1, tr: 30 }],
  bn: [],
};

const initialState: SimulationState = {
  a: { ...defaultArmy },
  b: { ...defaultArmy },
  desc: '',
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>(initialState);
  const [toast, setToast] = useState<string | null>(null);

  const analysisA = useMemo(() => {
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    return analyzeArmy(state.a, units, techsById);
  }, [state.a]);

  const analysisB = useMemo(() => {
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    return analyzeArmy(state.b, units, techsById);
  }, [state.b]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateArmy = (army: 'a' | 'b', updates: Partial<ArmyState>) => {
    setState(prev => ({
      ...prev,
      [army]: { ...prev[army], ...updates }
    }));
  };

  const clearOverrides = (army: 'a' | 'b') => {
    updateArmy(army, {
      h: undefined, am: undefined, ap: undefined, aa: undefined, ar: undefined,
      rl: undefined, n: undefined, as: undefined, ab: undefined, ad: undefined,
      af: undefined, aw: undefined, ag: undefined, da: undefined, df: undefined,
      dw: undefined, dg: undefined, e: undefined, mc: undefined
    });
  };

  const toggleBonus = (army: 'a' | 'b', techId: string) => {
    setState(prev => {
      const armyState = prev[army];
      const newBonuses = armyState.bn?.map(b => {
        if (b.i === techId) {
          const allActive = b.e.every(x => x);
          return { ...b, e: b.e.map(() => !allActive) };
        }
        return b;
      });
      return { ...prev, [army]: { ...armyState, bn: newBonuses } };
    });
  };

  const applyAgeBonuses = (army: 'a' | 'b', age: string, civOverride?: string) => {
    const armyState = state[army];
    const allUnits: Record<string, UnitData> = { ...units, ...presets };
    
    // Find unit by ps or by name
    let data = armyState.ps ? allUnits[armyState.ps] : null;
    if (!data && armyState.nm) {
      data = Object.values(allUnits).find(u => u.name === armyState.nm) || null;
    }
    
    const ageId = parseInt(age);
    const civKey = civOverride !== undefined ? civOverride : armyState.cv;
    
    if (!data) {
      updateArmy(army, { age, cv: civKey });
      return;
    }

    const availableTechs: Record<number, number> = civKey ? (civs as any)[civKey] || {} : {};
    
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);

    // Clear and re-apply bonuses
    const newBonuses: { i: string; e: boolean[] }[] = [];

    if (ageId > 1) {
      const relevantTechs = getRecommendedTechs(data, ageId, civKey, techsById, availableTechs);

      relevantTechs.sort((a, b) => (a.age - b.age) || (a.id - b.id)).forEach((t) => {
        newBonuses.push({ i: t.id.toString(), e: (t.effects || []).map(() => true) });
      });
    }

    let overrides: Partial<ArmyState> = { age, cv: civKey, bn: newBonuses };
    updateArmy(army, overrides);
  };

  const loadPreset = (army: 'a' | 'b', id: string) => {
    const allUnits: Record<string, UnitData> = { ...units, ...presets };
    const u = allUnits[id];
    if (!u) return;

    const currentAge = state[army].age || '1';
    const currentCiv = state[army].cv || GENERIC_CIV;
    const ageId = parseInt(currentAge);

    const newArmyState: ArmyState = {
      ...state[army],
      ps: id,
      nm: u.name,
      h: undefined, am: undefined, ap: undefined, aa: undefined, ar: undefined,
      rl: undefined, n: undefined, af: undefined, aw: undefined, ag: undefined,
      bn: [], 
      tl: []
    };

    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);
    const availableTechs: Record<number, number> = currentCiv ? (civs as any)[currentCiv] || {} : {};

    // 1. Build Production Building
    const bId = u.building ? u.building.toString() : '87'; 
    const bData = (buildings as any)[bId] || Object.values(buildings).find(b => b.id === bId);
    if (bData) {
      newArmyState.tl?.push({
        t: 'building', n: bData.name, d: bData.time || 50, c: 1, co: (bData.f||0)+(bData.w||0)+(bData.g||0)+(bData.s||0),
        prod: true, i: bId, b: false
      });
    }

    // 2. Research All Upgrades (Sequential, Blocking Units)
    if (ageId > 1) {
      const relevantTechs = getRecommendedTechs(u, ageId, currentCiv, techsById, availableTechs);
      relevantTechs.sort((a, b) => (a.age - b.age) || (a.id - b.id)).forEach((t) => {
        newArmyState.bn?.push({ i: t.id.toString(), e: (t.effects || []).map(() => true) });
        
        newArmyState.tl?.push({
          t: 'tech', n: t.name, d: t.time || 40, c: 1, co: (t.f||0)+(t.w||0)+(t.g||0),
          i: t.id.toString(), bt: t.building.toString(), b: true // Blocks unit prod
        });
      });
    }

    // 3. Start Infinite Production (Immediate)
    newArmyState.tl?.push({ t: 'production', n: `Infinite ${u.name}`, v: 1, tr: u.trainTime, inf: true, d: 0 });

    setState(prev => ({ ...prev, [army]: newArmyState }));
  };

  const resetToNewScenario = () => {
    // Initial state should also have sensible defaults
    setState({
      a: { ...defaultArmy, ps: 'archer', nm: 'Archer' },
      b: { ...defaultArmy, ps: 'skirmisher', nm: 'Skirmisher' },
      desc: 'New scenario description...',
      name: 'New Scenario',
    });
    // Trigger loadPreset to fill timeline
    loadPreset('a', 'archer');
    loadPreset('b', 'skirmisher');
  };

  const loadScenario = (id: string) => {
    const scenario = (scenarios as any)[id];
    if (scenario) {
      const allUnits: Record<string, UnitData> = { ...units, ...presets };
      const techsById: Record<number, TechData> = {};
      Object.values(techs).forEach(t => techsById[t.id] = t);
      
      setState({
        a: scrubArmy(scenario.a, allUnits, techsById),
        b: scrubArmy(scenario.b, allUnits, techsById),
        desc: scenario.desc || '',
        name: scenario.name,
      });
    }
  };

  // Initial load: Load first featured scenario if no state exists
  useEffect(() => {
    if (!state.a.ps && featuredScenarios.length > 0) {
      loadScenario(featuredScenarios[0]);
    }
  }, []);

  return (
    <SimulationContext.Provider value={{ 
      state, 
      analysisA, 
      analysisB, 
      setState, 
      updateArmy, 
      loadScenario, 
      loadPreset, 
      showToast, 
      resetToNewScenario, 
      applyAgeBonuses, 
      clearOverrides, 
      toggleBonus 
    }}>
      {children}
      {toast && (
        <div className="share-toast" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000 }}>
          {toast}
        </div>
      )}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

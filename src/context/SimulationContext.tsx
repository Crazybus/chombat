import React, { createContext, useContext, useState, useEffect } from 'react';
import { SimulationState, ArmyState, UnitData, TechData } from '../sim/types';
import { scenarios, featuredScenarios } from '../data/scenarios';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { civs } from '../data/civs';
import { COMBAT_BUILDINGS, shouldApplyTech } from '../sim/TechLogic';

interface SimulationContextType {
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
  updateArmy: (army: 'a' | 'b', updates: Partial<ArmyState>) => void;
  loadScenario: (id: string) => void;
  loadPreset: (army: 'a' | 'b', id: string) => void;
  showToast: (msg: string) => void;
  resetToNewScenario: () => void;
  applyAgeBonuses: (army: 'a' | 'b', age: string, civOverride?: string) => void;
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

    const availableTechs = civKey ? (civs as any)[civKey] || [] : [];
    
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach(t => techsById[t.id] = t);

    // Clear and re-apply bonuses
    const newBonuses: { i: string; e: boolean[] }[] = [];

    if (ageId > 1) {
      const relevantTechs = Object.values(techsById).filter((t) => {
        if (!COMBAT_BUILDINGS.includes(t.building)) return false;
        
        // If civ is selected, it must be in the available list.
        // If NO civ is selected, we only allow "common" techs (those that appear in most civs).
        // For simplicity, if no civ is selected, we'll exclude techs that are NOT in the generic pool.
        // A better check: techs with building -1 or those specifically marked as unique are usually excluded.
        // In the AoE2 dataset, unique techs are usually in the Castle (82).
        if (civKey) {
          if (!availableTechs.includes(t.id)) return false;
        } else {
          // If no civ selected, exclude civ-specific unique techs.
          // Most unique techs are in the Castle (82) or have IDs > 1000.
          if (t.building === 82 || t.id > 1000) return false;
        }

        if (t.age > ageId) return false;
        return shouldApplyTech(t, data);
      });

      relevantTechs.sort((a, b) => (a.age - b.age) || (a.id - b.id)).forEach((t) => {
        newBonuses.push({ i: t.id.toString(), e: (t.effects || []).map(() => true) });
      });
    }

    // Special case: Scout Cavalry gets +2 attack in Feudal Age+
    // Note: We no longer set am override here to prevent state corruption.
    // It is handled dynamically in CombatSim.applyBonuses based on ageId.
    let overrides: Partial<ArmyState> = { age, cv: civKey, bn: newBonuses };

    updateArmy(army, overrides);
  };

  const loadPreset = (army: 'a' | 'b', id: string) => {
    const allUnits: Record<string, UnitData> = { ...units, ...presets };
    const u = allUnits[id];
    if (!u) return;

    // Only set the preset ID and Name. 
    // We don't set h, am, ap, etc. unless they are explicitly overriden by the user.
    // This allows UnitStatsExplanation to correctly identify what is a manual change.
    updateArmy(army, {
      ps: id,
      nm: u.name,
      h: undefined,
      am: undefined,
      ap: undefined,
      aa: undefined,
      ar: undefined,
      rl: undefined,
      n: undefined,
      af: undefined,
      aw: undefined,
      ag: undefined,
      tl: [{ t: 'production', n: 'Initial Production', c: 1, tr: u.trainTime }],
      bn: [], // Reset bonuses for new unit
    });
  };

  const resetToNewScenario = () => {
    setState({
      a: { ...defaultArmy, ps: 'archer', nm: 'Archer' },
      b: { ...defaultArmy, ps: 'skirmisher', nm: 'Skirmisher' },
      desc: 'New scenario description...',
      name: 'New Scenario',
    });
  };

  const loadScenario = (id: string) => {
    const scenario = (scenarios as any)[id];
    if (scenario) {
      setState({
        a: scenario.a,
        b: scenario.b,
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
    <SimulationContext.Provider value={{ state, setState, updateArmy, loadScenario, loadPreset, showToast, resetToNewScenario, applyAgeBonuses }}>
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

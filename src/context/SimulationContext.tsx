import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SimulationState, ArmyState, UnitData, TechData } from '../sim/types';
import { scenarios, featuredScenarios } from '../data/scenarios';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { civs, GENERIC_CIV } from '../data/civs';
import { analyzeArmy, ArmyAnalysis, getRecommendedTechs, scrubArmy } from '../sim/ArmyAnalyzer';
import { buildings } from '../data/buildings';
import { useSyncURL } from '../hooks/useSyncURL';

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
  swapArmies: () => void;
}

const defaultArmy: ArmyState = {
  count: 10,
  age: '2',
  timeline: [
    { type: 'villagers', name: 'Villagers', value: 1, delay: 25, limitedProduction: false },
    {
      type: 'tech',
      name: 'Feudal Age',
      delay: 130,
      count: 1,
      cost: 500,
      id: '101',
      buildingTarget: 109,
      isBlocking: true,
      limitedProduction: true,
    },
    {
      type: 'building',
      name: 'Barracks',
      delay: 50,
      count: 1,
      cost: 175,
      producesUnits: true,
      id: '87',
      isBlocking: false,
    },
    { type: 'production', name: 'Unit Production', value: 0, trainSpeed: 30, limitedProduction: false, delay: 0 },
  ],
  bonuses: [],
};

const initialState: SimulationState = {
  armyA: {
    ...defaultArmy,
    name: 'Archer',
    preset: 'archer',
    bonuses: [
      { id: '199', effects: [true] }, // Fletching
      { id: '211', effects: [true] }, // Padded Archer Armor
    ],
    timeline: [
      { type: 'villagers', name: 'Villagers', value: 1, delay: 25, limitedProduction: false },
      {
        type: 'tech',
        name: 'Feudal Age',
        delay: 130,
        count: 1,
        cost: 500,
        id: '101',
        buildingTarget: 109,
        isBlocking: true,
        limitedProduction: true,
      },
      {
        type: 'building',
        name: 'Archery Range',
        delay: 50,
        count: 1,
        cost: 175,
        producesUnits: true,
        id: '87',
        isBlocking: false,
      },
      {
        type: 'tech',
        name: 'Fletching',
        delay: 30,
        count: 1,
        cost: 150,
        id: '199',
        buildingTarget: 103,
        isBlocking: false,
        limitedProduction: false,
      },
      {
        type: 'tech',
        name: 'Padded Archer Armor',
        delay: 40,
        count: 1,
        cost: 150,
        id: '211',
        buildingTarget: 103,
        isBlocking: false,
        limitedProduction: false,
      },
      { type: 'production', name: 'Archer Production', value: 0, trainSpeed: 35, limitedProduction: false, delay: 0 },
    ],
  },
  armyB: {
    ...defaultArmy,
    name: 'Skirmisher',
    preset: 'skirmisher',
    bonuses: [
      { id: '199', effects: [true] }, // Fletching
      { id: '211', effects: [true] }, // Padded Archer Armor
    ],
    timeline: [
      { type: 'villagers', name: 'Villagers', value: 1, delay: 25, limitedProduction: false },
      {
        type: 'tech',
        name: 'Feudal Age',
        delay: 130,
        count: 1,
        cost: 500,
        id: '101',
        buildingTarget: 109,
        isBlocking: true,
        limitedProduction: true,
      },
      {
        type: 'building',
        name: 'Archery Range',
        delay: 50,
        count: 1,
        cost: 175,
        producesUnits: true,
        id: '87',
        isBlocking: false,
      },
      {
        type: 'tech',
        name: 'Fletching',
        delay: 30,
        count: 1,
        cost: 150,
        id: '199',
        buildingTarget: 103,
        isBlocking: false,
        limitedProduction: false,
      },
      {
        type: 'tech',
        name: 'Padded Archer Armor',
        delay: 40,
        count: 1,
        cost: 150,
        id: '211',
        buildingTarget: 103,
        isBlocking: false,
        limitedProduction: false,
      },
      { type: 'production', name: 'Skirmisher Production', value: 0, trainSpeed: 22, limitedProduction: false },
    ],
  },
  description: '',
  scenarioId: undefined,
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>(initialState);
  const [toast, setToast] = useState<string | null>(null);
  const { clearURL, setScenarioInURL } = useSyncURL(state, setState);

  const analysisA = useMemo(() => {
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach((t) => (techsById[t.id] = t));
    return analyzeArmy(state.armyA, units, techsById);
  }, [state.armyA]);

  const analysisB = useMemo(() => {
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach((t) => (techsById[t.id] = t));
    return analyzeArmy(state.armyB, units, techsById);
  }, [state.armyB]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateArmy = (army: 'a' | 'b', updates: Partial<ArmyState>) => {
    clearURL();
    const armyKey = army === 'a' ? 'armyA' : 'armyB';
    setState((prev) => {
      const currentArmy = prev[armyKey];
      const newOverrides = updates.overrides
        ? {
            ...currentArmy.overrides,
            ...updates.overrides,
            cost: { ...currentArmy.overrides?.cost, ...updates.overrides.cost },
            discount: { ...currentArmy.overrides?.discount, ...updates.overrides.discount },
          }
        : currentArmy.overrides;

      return {
        ...prev,
        [armyKey]: {
          ...currentArmy,
          ...updates,
          overrides: newOverrides,
        },
        scenarioId: undefined,
      };
    });
  };

  const swapArmies = () => {
    clearURL();
    setState((prev) => ({
      ...prev,
      armyA: prev.armyB,
      armyB: prev.armyA,
      scenarioId: undefined,
    }));
  };

  const clearOverrides = (army: 'a' | 'b') => {
    clearURL();
    const armyKey = army === 'a' ? 'armyA' : 'armyB';
    setState((prev) => ({
      ...prev,
      [armyKey]: {
        ...prev[armyKey],
        overrides: undefined,
      },
      scenarioId: undefined,
    }));
  };

  const toggleBonus = (army: 'a' | 'b', techId: string) => {
    clearURL();
    const armyKey = army === 'a' ? 'armyA' : 'armyB';
    setState((prev) => {
      const armyState = prev[armyKey];
      const newBonuses = armyState.bonuses?.map((b) => {
        if (b.id === techId) {
          const allActive = b.effects.every((x) => x);
          return { ...b, effects: b.effects.map(() => !allActive) };
        }
        return b;
      });
      return { ...prev, [armyKey]: { ...armyState, bonuses: newBonuses }, scenarioId: undefined };
    });
  };

  const applyAgeBonuses = (army: 'a' | 'b', age: string, civOverride?: string) => {
    clearURL();
    const armyKey = army === 'a' ? 'armyA' : 'armyB';
    const armyState = state[armyKey];
    const allUnits: Record<string, UnitData> = { ...units, ...presets };

    let data = armyState.preset ? allUnits[armyState.preset] : null;
    if (!data && armyState.name) {
      data = Object.values(allUnits).find((u) => u.name === armyState.name) || null;
    }

    const ageId = parseInt(age);
    const civKey = civOverride !== undefined ? civOverride : armyState.civ;

    if (!data) {
      updateArmy(army, { age, civ: civKey });
      return;
    }

    const availableTechs: Record<number, number> = civKey ? (civs as any)[civKey] || {} : {};
    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach((t) => (techsById[t.id] = t));

    const newBonuses: { id: string; effects: boolean[] }[] = [];
    if (ageId >= 1) {
      const relevantTechs = getRecommendedTechs(data, ageId, civKey, techsById, availableTechs);
      relevantTechs
        .sort((a, b) => a.age - b.age || a.id - b.id)
        .forEach((t) => {
          newBonuses.push({ id: t.id.toString(), effects: (t.effects || []).map(() => true) });
        });
    }

    setState((prev) => ({
      ...prev,
      [armyKey]: { ...prev[armyKey], age, civ: civKey, bonuses: newBonuses },
      scenarioId: undefined,
    }));
  };

  const loadPreset = (army: 'a' | 'b', id: string) => {
    clearURL();
    const allUnits: Record<string, UnitData> = { ...units, ...presets };
    const u = allUnits[id];
    if (!u) return;

    const armyKey = army === 'a' ? 'armyA' : 'armyB';
    const currentAge = state[armyKey].age || '1';
    const currentCiv = state[armyKey].civ || GENERIC_CIV;
    const ageId = parseInt(currentAge);

    const newArmyState: ArmyState = {
      ...state[armyKey],
      preset: id,
      name: u.name,
      overrides: undefined,
      bonuses: [],
      timeline: [],
    };

    const techsById: Record<number, TechData> = {};
    Object.values(techs).forEach((t) => (techsById[t.id] = t));
    const availableTechs: Record<number, number> = currentCiv ? (civs as any)[currentCiv] || {} : {};

    const unitBuildingId = u.building || 87; // fallback to barracks

    // 1. Add continuous villager production
    newArmyState.timeline?.push({
      type: 'villagers',
      name: 'Villagers',
      value: 1,
      delay: 25,
      limitedProduction: false,
    });

    // 2. Add Age Up techs sequentially
    if (ageId >= 2) {
      newArmyState.timeline?.push({
        type: 'tech',
        name: 'Feudal Age',
        delay: 130,
        count: 1,
        cost: 500,
        id: '101',
        buildingTarget: 109,
        isBlocking: true,
        limitedProduction: true,
      });
    }
    if (ageId >= 3) {
      newArmyState.timeline?.push({
        type: 'tech',
        name: 'Castle Age',
        delay: 160,
        count: 1,
        cost: 1000,
        id: '102',
        buildingTarget: 109,
        isBlocking: true,
        limitedProduction: true,
      });
    }
    if (ageId >= 4) {
      newArmyState.timeline?.push({
        type: 'tech',
        name: 'Imperial Age',
        delay: 190,
        count: 1,
        cost: 1800,
        id: '103',
        buildingTarget: 109,
        isBlocking: true,
        limitedProduction: true,
      });
    }

    // 3. Add appropriate production building
    const bData =
      (buildings as any)[unitBuildingId.toString()] ||
      Object.values(buildings).find((b) => b.id === unitBuildingId.toString());
    if (bData) {
      newArmyState.timeline?.push({
        type: 'building',
        name: bData.name,
        delay: bData.time || 50,
        count: 1,
        cost: (bData.food || 0) + (bData.wood || 0) + (bData.gold || 0) + (bData.stone || 0),
        producesUnits: true,
        id: unitBuildingId.toString(),
        isBlocking: false,
      });
    }

    // 4. Add recommended techs
    const newBonuses: { id: string; effects: boolean[] }[] = [];
    if (ageId >= 1) {
      const relevantTechs = getRecommendedTechs(u, ageId, currentCiv, techsById, availableTechs);
      relevantTechs
        .sort((a, b) => a.age - b.age || a.id - b.id)
        .forEach((t) => {
          newBonuses.push({ id: t.id.toString(), effects: (t.effects || []).map(() => true) });

          // Only block Build Order progress (limitedProduction: true) IF it's researched at the unit's building or TC
          // AND set isBlocking: true to reduce current lane capacity
          const isSameBuilding = t.building === unitBuildingId;
          const isTC = t.building === 109;
          const shouldWait = isSameBuilding || isTC;

          newArmyState.timeline?.push({
            type: 'tech',
            name: t.name,
            delay: t.time || 40,
            count: 1,
            cost: (t.food || 0) + (t.wood || 0) + (t.gold || 0),
            id: t.id.toString(),
            buildingTarget: t.building,
            isBlocking: shouldWait,
            limitedProduction: shouldWait,
          });
        });
    }
    newArmyState.bonuses = newBonuses;

    // 5. Add unit production - use value: 0 if buildings were added to avoid duplication
    newArmyState.timeline?.push({
      type: 'production',
      name: `${u.name} Production`,
      value: 0,
      trainSpeed: u.trainTime,
      limitedProduction: false,
      delay: 0,
    });

    setState((prev) => ({ ...prev, [armyKey]: newArmyState, scenarioId: undefined }));
  };

  const resetToNewScenario = () => {
    clearURL();
    const archer = units['archer'];

    setState({
      armyA: {
        ...defaultArmy,
        name: archer.name,
        preset: 'archer',
        bonuses: [
          { id: '199', effects: [true] },
          { id: '211', effects: [true] },
        ],
        timeline: [
          { type: 'villagers', name: 'Villagers', value: 1, delay: 25, limitedProduction: false },
          {
            type: 'tech',
            name: 'Feudal Age',
            delay: 130,
            count: 1,
            cost: 500,
            id: '101',
            buildingTarget: 109,
            isBlocking: true,
            limitedProduction: true,
          },
          {
            type: 'building',
            name: 'Archery Range',
            delay: 50,
            count: 1,
            cost: 175,
            producesUnits: true,
            id: '87',
            isBlocking: false,
          },
          {
            type: 'tech',
            name: 'Fletching',
            delay: 30,
            count: 1,
            cost: 150,
            id: '199',
            buildingTarget: 103,
            isBlocking: false,
            limitedProduction: false,
          },
          {
            type: 'tech',
            name: 'Padded Archer Armor',
            delay: 40,
            count: 1,
            cost: 150,
            id: '211',
            buildingTarget: 103,
            isBlocking: false,
            limitedProduction: false,
          },
          {
            type: 'production',
            name: 'Archer Production',
            value: 0,
            trainSpeed: 35,
            limitedProduction: false,
            delay: 0,
          },
        ],
      },
      armyB: {
        ...defaultArmy,
        name: 'Skirmisher',
        preset: 'skirmisher',
        bonuses: [
          { id: '199', effects: [true] },
          { id: '211', effects: [true] },
        ],
        timeline: [
          { type: 'villagers', name: 'Villagers', value: 1, delay: 25, limitedProduction: false },
          {
            type: 'tech',
            name: 'Feudal Age',
            delay: 130,
            count: 1,
            cost: 500,
            id: '101',
            buildingTarget: 109,
            isBlocking: true,
            limitedProduction: true,
          },
          {
            type: 'building',
            name: 'Archery Range',
            delay: 50,
            count: 1,
            cost: 175,
            producesUnits: true,
            id: '87',
            isBlocking: false,
          },
          {
            type: 'tech',
            name: 'Fletching',
            delay: 30,
            count: 1,
            cost: 150,
            id: '199',
            buildingTarget: 103,
            isBlocking: false,
            limitedProduction: false,
          },
          {
            type: 'tech',
            name: 'Padded Archer Armor',
            delay: 40,
            count: 1,
            cost: 150,
            id: '211',
            buildingTarget: 103,
            isBlocking: false,
            limitedProduction: false,
          },
          { type: 'production', name: 'Skirmisher Production', value: 0, trainSpeed: 22, limitedProduction: false },
        ],
      },
      description: 'New scenario description...',
      name: 'New Scenario',
      scenarioId: 'new',
    });
  };

  const loadScenario = (id: string) => {
    setScenarioInURL(id);
    const scenario = (scenarios as any)[id];
    if (scenario) {
      const allUnits: Record<string, UnitData> = { ...units, ...presets };
      const techsById: Record<number, TechData> = {};
      Object.values(techs).forEach((t) => (techsById[t.id] = t));

      setState({
        armyA: scrubArmy(scenario.armyA, allUnits, techsById),
        armyB: scrubArmy(scenario.armyB, allUnits, techsById),
        description: scenario.description || '',
        name: scenario.name,
        scenarioId: id,
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      !params.get('s') &&
      !params.get('id') &&
      !params.get('scenario') &&
      !state.armyA.preset &&
      featuredScenarios.length > 0
    ) {
      loadScenario(featuredScenarios[0]);
    }
  }, []);

  return (
    <SimulationContext.Provider
      value={{
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
        toggleBonus,
        swapArmies,
      }}
    >
      {children}
      {toast && (
        <div
          className="share-toast"
          style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000 }}
        >
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

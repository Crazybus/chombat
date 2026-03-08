import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SimulationState, TechData, UnitData } from '../sim/types';
import { scrubArmy } from '../sim/ArmyAnalyzer';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { scenarios } from '../data/scenarios';
import { inflate, deflate } from 'pako';

export function useSyncURL(state: SimulationState, setState: React.Dispatch<React.SetStateAction<SimulationState>>) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = useRef(true);

  // Load from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const base64Data = params.get('s');
    const shortId = params.get('id');
    const scenarioId = params.get('scenario');

    if (isInitialLoad.current) {
      const allScenarios = scenarios as Record<string, any>;
      if (scenarioId && allScenarios[scenarioId]) {
        // Load named scenario from path
        const loaded = allScenarios[scenarioId];
        const allUnits: Record<string, UnitData> = { ...units, ...presets };
        const techsById: Record<number, TechData> = {};
        Object.values(techs).forEach((t) => (techsById[t.id] = t));

        setState({
          armyA: scrubArmy(loaded.armyA, allUnits, techsById),
          armyB: scrubArmy(loaded.armyB, allUnits, techsById),
          description: loaded.description || '',
          name: loaded.name || 'Shared Scenario',
          scenarioId: scenarioId,
        });
      } else if (shortId) {
        // Resolve short ID from API
        fetch(`/api/resolve/${shortId}`)
          .then(async (res) => {
            const result = await res.json();
            if (res.ok && result.data) {
              const loaded = result.data;
              const allUnits: Record<string, UnitData> = { ...units, ...presets };
              const techsById: Record<number, TechData> = {};
              Object.values(techs).forEach((t) => (techsById[t.id] = t));

              setState({
                armyA: scrubArmy(loaded.armyA, allUnits, techsById),
                armyB: scrubArmy(loaded.armyB, allUnits, techsById),
                description: loaded.description || '',
                name: loaded.name || 'Shared Scenario',
                scenarioId: loaded.scenarioId,
              });
            } else {
              console.error('Failed to resolve short URL:', result.error || res.statusText);
            }
          })
          .catch((err) => console.error('Error fetching short URL:', err));
      } else if (base64Data) {
        try {
          const bin = atob(base64Data.replace(/-/g, '+').replace(/_/g, '/'));
          const json = inflate(new Uint8Array([...bin].map((c) => c.charCodeAt(0))), { to: 'string' });
          const loaded = JSON.parse(json);

          const allUnits: Record<string, UnitData> = { ...units, ...presets };
          const techsById: Record<number, TechData> = {};
          Object.values(techs).forEach((t) => (techsById[t.id] = t));

          setState({
            armyA: scrubArmy(loaded.armyA, allUnits, techsById),
            armyB: scrubArmy(loaded.armyB, allUnits, techsById),
            description: loaded.description || '',
            name: loaded.name || 'Shared Scenario',
            scenarioId: loaded.scenarioId,
          });
        } catch (e) {
          console.error('Failed to load scenario from base64 URL', e);
        }
      }
    }
    isInitialLoad.current = false;
  }, []);

  // Save to URL
  const syncURL = async (explicit = false) => {
    if (!explicit) return;

    const exportData = {
      armyA: state.armyA,
      armyB: state.armyB,
      name: state.name,
      description: state.description,
      scenarioId: state.scenarioId,
    };

    try {
      // 1. Try to get a short URL from the API
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: exportData }),
      });

      if (response.ok) {
        const { id } = await response.json();
        const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
        navigate(`?id=${id}`, { replace: true });
        return url;
      } else {
        const err = await response.json();
        console.warn('URL shortening failed:', err.error || response.statusText);
      }
    } catch (apiError) {
      console.warn('URL shortening API unreachable, falling back to base64', apiError);
    }

    // 2. Fallback to base64 encoding
    try {
      const json = JSON.stringify(exportData);
      const compressed = deflate(json);
      const base64 = btoa(String.fromCharCode(...compressed))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const url = `${window.location.origin}${window.location.pathname}?s=${base64}`;
      navigate(`?s=${base64}`, { replace: true });
      return url;
    } catch (e) {
      console.error('Failed to generate base64 sync URL', e);
      return null;
    }
  };

  const clearURL = () => {
    if (location.search) {
      navigate(window.location.pathname, { replace: true });
    }
  };

  const setScenarioInURL = (id: string) => {
    navigate(`?scenario=${id}`, { replace: true });
  };

  const getCleanState = () => {
    return {
      armyA: state.armyA,
      armyB: state.armyB,
      name: state.name,
      description: state.description,
      scenarioId: state.scenarioId,
    };
  };

  return { syncURL, clearURL, setScenarioInURL, getCleanState };
}

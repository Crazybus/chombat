import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  const params = useParams();
  const isInitialLoad = useRef(true);

  // Load from URL path
  useEffect(() => {
    // Parse path: /s/:scenario, /l/:title/:id, /d/:title/:data
    // Title is informational only (ignored on load, any value works)
    const pathParts = params['*']?.split('/').filter(Boolean) || [];
    const pathType = pathParts[0]; // s, l, or d
    let pathValue: string | undefined;

    if (pathType === 'd' && pathParts.length >= 3) {
      // /d/:title/:data - title at index 1 (ignored), data at index 2
      pathValue = pathParts[2];
    } else if (pathType === 'l' && pathParts.length >= 3) {
      // /l/:title/:id - title at index 1 (ignored), id at index 2
      pathValue = pathParts[2];
    } else if (pathType === 's' && pathParts.length >= 2) {
      // /s/:scenario
      pathValue = pathParts[1];
    }

    if (isInitialLoad.current && pathType && pathValue) {
      const allScenarios = scenarios as Record<string, any>;

      // New path-based routing
      if (pathType === 's' && allScenarios[pathValue]) {
        // Named scenario: /s/champi_vs_scouts
        const loaded = allScenarios[pathValue];
        loadScenarioData(loaded, pathValue);
      } else if (pathType === 'l') {
        // Short link: /l/qoQ5Hd or /l/qoQ5Hd/champi_vs_scouts (title ignored)
        fetch(`/api/resolve/${pathValue}`)
          .then(async (res) => {
            const result = await res.json();
            if (res.ok && result.data) {
              loadScenarioData(result.data, result.data.scenarioId);
            } else {
              console.error('Failed to resolve short URL:', result.error || res.statusText);
            }
          })
          .catch((err) => console.error('Error fetching short URL:', err));
      } else if (pathType === 'd') {
        // Direct data: /d/:title/:data or /d/:data (title ignored, just for readability)
        try {
          const bin = atob(pathValue.replace(/-/g, '+').replace(/_/g, '/'));
          const json = inflate(new Uint8Array([...bin].map((c) => c.charCodeAt(0))), { to: 'string' });
          const loaded = JSON.parse(json);
          loadScenarioData(loaded, loaded.scenarioId);
        } catch (e) {
          console.error('Failed to load scenario from direct data URL', e);
        }
      }
    }
    isInitialLoad.current = false;
  }, [params]);

  const loadScenarioData = (loaded: any, scenarioId: string) => {
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
  };

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
        // Generate title slug from scenario name (required, informational only)
        const titleSlug = exportData.name
          ? exportData.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, '')
              .slice(0, 50)
          : 'scenario';
        // Navigate to /l/:title/:id format
        const path = `/l/${titleSlug}/${id}`;
        navigate(path, { replace: true });
        return `${window.location.origin}${path}`;
      } else {
        const err = await response.json();
        console.warn('URL shortening failed:', err.error || response.statusText);
      }
    } catch (apiError) {
      console.warn('URL shortening API unreachable, falling back to direct data', apiError);
    }

    // 2. Fallback to direct data encoding: /d/:title/:data
    try {
      const json = JSON.stringify(exportData);
      const compressed = deflate(json);
      const base64 = btoa(String.fromCharCode(...compressed))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Generate title slug from scenario name (required, informational only)
      const titleSlug = exportData.name
        ? exportData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 50)
        : 'scenario';

      const path = `/d/${titleSlug}/${base64}`;
      navigate(path, { replace: true });
      return `${window.location.origin}${path}`;
    } catch (e) {
      console.error('Failed to generate direct data URL', e);
      return null;
    }
  };

  const clearURL = () => {
    if (location.pathname !== '/' || location.search) {
      navigate('/', { replace: true });
    }
  };

  const setScenarioInURL = (id: string) => {
    navigate(`/s/${id}`, { replace: true });
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

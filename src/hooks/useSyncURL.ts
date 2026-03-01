import { useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';

export const useSyncURL = () => {
  const { state, setState, loadScenario, showToast } = useSimulation();
  const isInitialLoad = useRef(true);

  const syncURL = async (forceShorten: boolean = false): Promise<string | null> => {
    const json = JSON.stringify(state);

    if (forceShorten) {
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: state }),
        });

        if (response.ok) {
          const result = await response.json();
          const shortUrl = `${window.location.origin}${window.location.pathname}#${result.id}`;
          return shortUrl;
        }
      } catch (e) {
        console.error('Failed to shorten URL:', e);
      }
      
      // Fallback to long URL
      const params = new URLSearchParams();
      params.set('data', json);
      return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    // Normal sync (don't update URL with full state on every change, just clear scenario if needed)
    // In React version, we might want to keep the URL clean unless sharing
    return null;
  };

  const loadStateFromURL = async () => {
    const p = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    // 1. KV Resolve
    if (hash && hash.length > 1 && !hash.startsWith('?')) {
      const shortId = hash.substring(1);
      if (/^[a-zA-Z0-9]{6,8}$/.test(shortId)) {
        try {
          const response = await fetch(`/api/resolve/${shortId}`);
          if (response.ok) {
            const result = await response.json();
            setState(result.data);
            showToast('Matchup loaded from shared link');
            return;
          }
        } catch (e) {
          console.error('Failed to load matchup from KV:', e);
        }
      }
    }

    // 2. Data param
    const dataParam = p.get('data');
    if (dataParam) {
      try {
        const state = JSON.parse(dataParam);
        setState(state);
        return;
      } catch (e) {
        console.error('Failed to parse data param:', e);
      }
    }

    // 3. Scenario param
    const scenarioId = p.get('scenario');
    if (scenarioId) {
      loadScenario(scenarioId);
    }
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      loadStateFromURL();
      isInitialLoad.current = false;
    }
  }, []);

  return { syncURL };
};

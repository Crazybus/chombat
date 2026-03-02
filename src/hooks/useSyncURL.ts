import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SimulationState, TechData, UnitData } from '../sim/types';
import { scrubArmy } from '../sim/ArmyAnalyzer';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import pako from 'pako';

export function useSyncURL(state: SimulationState, setState: React.Dispatch<React.SetStateAction<SimulationState>>) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = useRef(true);

  // Load from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const data = params.get('s');
    if (data && isInitialLoad.current) {
      try {
        const bin = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
        const json = pako.inflate(new Uint8Array([...bin].map(c => c.charCodeAt(0))), { to: 'string' });
        const loaded = JSON.parse(json);
        
        const allUnits: Record<string, UnitData> = { ...units, ...presets };
        const techsById: Record<number, TechData> = {};
        Object.values(techs).forEach(t => techsById[t.id] = t);

        setState({
          a: scrubArmy(loaded.a, allUnits, techsById),
          b: scrubArmy(loaded.b, allUnits, techsById),
          desc: loaded.desc || '',
          name: loaded.name || 'Shared Scenario',
          sid: loaded.sid
        });
      } catch (e) {
        console.error('Failed to load scenario from URL', e);
      }
    }
    isInitialLoad.current = false;
  }, []);

  // Save to URL (MANUAL ONLY NOW - to avoid clutter and race conditions)
  const syncURL = (explicit = false) => {
    if (!explicit) return;
    try {
      const exportData = {
        a: state.a,
        b: state.b,
        name: state.name,
        desc: state.desc,
        sid: state.sid
      };
      const json = JSON.stringify(exportData);
      const compressed = pako.deflate(json);
      const base64 = btoa(String.fromCharCode(...compressed))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const url = `${window.location.origin}${window.location.pathname}?s=${base64}`;
      navigate(`?s=${base64}`, { replace: true });
      return url;
    } catch (e) {
      console.error('Failed to sync state to URL', e);
      return null;
    }
  };

  const getCleanState = () => {
    return {
      a: state.a,
      b: state.b,
      name: state.name,
      desc: state.desc,
      sid: state.sid
    };
  };

  return { syncURL, getCleanState };
}

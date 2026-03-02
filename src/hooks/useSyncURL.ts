import { useEffect, useRef, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ArmyState, SimulationState } from '../sim/types';
import { analyzeArmy } from '../sim/ArmyAnalyzer';
import { units } from '../data/units';
import { presets } from '../data/presets';
import { techs } from '../data/techs';
import { bonuses as civBonuses } from '../data/bonuses';

export const useSyncURL = () => {
  const { state, setState, loadScenario, showToast } = useSimulation();
  const isInitialLoad = useRef(true);

  const allUnits = useMemo(() => ({ ...units, ...presets }), []);
  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const getCleanState = (): SimulationState => {
    const cleanArmy = (army: ArmyState): ArmyState => {
      const u = army.ps ? allUnits[army.ps] : (army.nm ? Object.values(allUnits).find(x => x.name === army.nm) : null);
      if (!u) return { ...army };

      // Calculate what the stats SHOULD be with current techs/age
      const analysis = analyzeArmy(army, allUnits, techsById, civBonuses);
      if (!analysis) return { ...army };

      const { effectiveStats } = analysis;
      const scrubbed: any = {
        nm: army.nm,
        c: army.c,
        ps: army.ps,
        cv: army.cv,
        age: army.age,
        tl: army.tl,
        bn: army.bn,
        cont: army.cont,
        sv: army.sv
      };
      
      const mapping: Record<string, string> = {
        h: 'hp', am: 'matk', ap: 'patk', aa: 'marm', ar: 'parm',
        rl: 'reload', n: 'range', as: 'atk_speed', ab: 'bonus_red',
        af: 'f', aw: 'w', ag: 'ag'
      };

      // Only keep overrides that DON'T match natural tech-upgraded stats
      Object.entries(mapping).forEach(([configKey, statKey]) => {
        const val = (army as any)[configKey];
        const effVal = effectiveStats[statKey];
        if (val !== undefined && parseFloat(String(val)) !== parseFloat(String(effVal || 0))) {
          scrubbed[configKey] = val;
        }
      });

      // Clean up undefined keys
      Object.keys(scrubbed).forEach(key => scrubbed[key] === undefined && delete scrubbed[key]);

      return scrubbed as ArmyState;
    };

    return {
      name: state.name,
      desc: state.desc,
      a: cleanArmy(state.a),
      b: cleanArmy(state.b)
    };
  };

  const syncURL = async (forceShorten: boolean = false): Promise<string | null> => {
    const cleanState = getCleanState();
    const json = JSON.stringify(cleanState);

    if (forceShorten) {
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: json, // Send the cleaned JSON
        });

        if (response.ok) {
          const result = await response.json();
          const shortUrl = `${window.location.origin}${window.location.pathname}#${result.id}`;
          return shortUrl;
        }
      } catch (e) {
        console.error('Failed to shorten URL:', e);
      }
      
      // Fallback to long URL with cleaned state
      const params = new URLSearchParams();
      params.set('data', json);
      return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

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
            // Clear hash so refresh doesn't keep reloading
            window.location.hash = '';
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

  return { syncURL, getCleanState };
};

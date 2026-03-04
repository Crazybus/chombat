import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { techs } from '../data/techs';
import { bonuses } from '../data/bonuses';
import { getEffectLabel, shouldApplyTech, shouldApplyEffect } from '../sim/TechLogic';
import { units } from '../data/units';
import { presets } from '../data/presets';

interface BonusTechManagerProps {
  army: 'a' | 'b';
}

const BonusTechManager: React.FC<BonusTechManagerProps> = ({ army }) => {
  const { state, updateArmy } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isListOpen, setIsListOpen] = useState(false);

  const armyState = state[army];
  const allUnits = useMemo<Record<string, any>>(() => ({ ...units, ...presets }), []);
  const currentUnit = armyState.ps ? allUnits[armyState.ps] : null;

  const techsById = useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(techs).forEach((t) => (map[t.id] = t));
    return map;
  }, []);

  const availableBonuses = useMemo(() => {
    const combined: Record<string, any> = { ...techs, ...bonuses };
    return Object.entries(combined)
      .filter(([, b]) => {
        if (searchTerm && !b.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (!currentUnit) return true;
        // Basic filtering to show relevant techs
        return shouldApplyTech(b as any, currentUnit);
      })
      .map(([id, b]) => ({ id, name: b.name }));
  }, [searchTerm, currentUnit]);

  const addBonus = (id: string) => {
    const b = techsById[parseInt(id)] || (bonuses as any)[id];
    if (!b) return;

    // Prevent duplicates
    if (armyState.bn?.some((item) => item.i === id)) return;

    const effects = b.effects || [];
    const effectsState = effects.map(() => true);

    const newBonuses = [...(armyState.bn || []), { i: id, e: effectsState }];
    updateArmy(army, { bn: newBonuses });
    setSearchTerm('');
    setIsListOpen(false);
  };

  const removeBonus = (id: string) => {
    const newBonuses = armyState.bn?.filter((item) => item.i !== id) || [];
    updateArmy(army, { bn: newBonuses });
  };

  const toggleEffect = (bonusId: string, effectIndex: number) => {
    const newBonuses = armyState.bn?.map((item) => {
      if (item.i === bonusId) {
        const newE = [...item.e];
        newE[effectIndex] = !newE[effectIndex];
        return { ...item, e: newE };
      }
      return item;
    });
    updateArmy(army, { bn: newBonuses });
  };

  return (
    <div className="bonus-config">
      <label>Bonuses & Technologies</label>
      <div className="searchable-bonus" style={{ position: 'relative' }}>
        <input
          type="text"
          className="bonus-search"
          placeholder="Search for bonuses..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsListOpen(true);
          }}
          onFocus={() => setIsListOpen(true)}
        />
        {isListOpen && searchTerm && (
          <div
            className="bonus-list"
            style={{ display: 'block', position: 'absolute', top: '100%', left: 0, zIndex: 100, width: '100%' }}
          >
            {availableBonuses.map((b) => (
              <div key={b.id} className="preset-item" onClick={() => addBonus(b.id)}>
                {b.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="applied-bonuses">
        {armyState.bn?.map((item) => {
          const b = techsById[parseInt(item.i)] || (bonuses as any)[item.i];
          if (!b) return null;

          const effs = b.effects || [];
          const seenLabels = new Set<string>();

          return (
            <div key={item.i} className="applied-bonus" data-id={item.i}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="applied-bonus-name">{b.name}</span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {effs.map((e: any, idx: number) => {
                    const label = getEffectLabel(e);
                    if (!label || seenLabels.has(label)) return null;

                    const applies = currentUnit ? shouldApplyEffect(e, currentUnit, effs) : true;
                    if (!applies) return null;

                    seenLabels.add(label);
                    return (
                      <div key={idx} className="applied-bonus-effect">
                        <input type="checkbox" checked={!!item.e[idx]} onChange={() => toggleEffect(item.i, idx)} />
                        <label>{label}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className="remove-bonus-btn" onClick={() => removeBonus(item.i)}>
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BonusTechManager;

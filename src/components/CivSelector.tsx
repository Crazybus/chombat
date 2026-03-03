import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { civs, GENERIC_CIV } from '../data/civs';

interface CivSelectorProps {
  army: 'a' | 'b';
}

const CivSelector: React.FC<CivSelectorProps> = ({ army }) => {
  const { state, applyAgeBonuses } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const armyState = state[army];
  const civNames = useMemo(() => Object.keys(civs).sort(), []);

  const filteredCivs = useMemo(() => {
    return civNames.filter(name => 
      !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [civNames, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (civ: string) => {
    applyAgeBonuses(army, armyState.age || '1', civ || GENERIC_CIV);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatCivName = (name: string) => {
    if (!name || name === GENERIC_CIV) return 'Generic';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="civ-selector" ref={containerRef} style={{ position: 'relative' }}>
      <button 
        className="nav-btn secondary"
        title="Click to change civilization"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🏰 {formatCivName(armyState.cv || GENERIC_CIV)}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▼</span>
      </button>

      {isOpen && (
        <div className="civ-list">
          <input
            type="text"
            className="search-input"
            placeholder="Search civs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <div className="preset-item" onClick={() => handleSelect(GENERIC_CIV)}>None (All Techs)</div>
            {filteredCivs.map(name => (
              <div 
                key={name} 
                className="preset-item"
                onClick={() => handleSelect(name)}
              >
                {formatCivName(name)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CivSelector;

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const armyState = state[army === 'a' ? 'armyA' : 'armyB'];
  const civNames = useMemo(() => Object.keys(civs).sort(), []);

  const filteredOptions = useMemo(() => {
    const options: string[] = [];
    
    // Check if "None" matches search
    if (!searchTerm || 
        "generic".includes(searchTerm.toLowerCase()) || 
        "none".includes(searchTerm.toLowerCase())) {
      options.push(GENERIC_CIV);
    }

    const filteredCivs = civNames.filter((name) => 
      !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return [...options, ...filteredCivs];
  }, [civNames, searchTerm]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredOptions.length === 0) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter') {
      if (filteredOptions[selectedIndex]) {
        handleSelect(filteredOptions[selectedIndex]);
      }
    }
  };

  const formatCivName = (name: string) => {
    if (!name || name === GENERIC_CIV) return 'Generic';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="civ-selector" ref={containerRef} style={{ position: 'relative' }}>
      <button className="nav-btn secondary" title="Click to change civilization" onClick={() => setIsOpen(!isOpen)}>
        <span>🏰 {formatCivName(armyState.civ || GENERIC_CIV)}</span>
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
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {filteredOptions.map((name, index) => (
              <div
                key={name}
                className={`preset-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(name)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {name === GENERIC_CIV ? 'None (All Techs)' : formatCivName(name)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CivSelector;

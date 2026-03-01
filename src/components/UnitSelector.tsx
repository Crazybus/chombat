import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { units } from '../data/units';
import { presets } from '../data/presets';

interface UnitSelectorProps {
  army: 'a' | 'b';
  onSelect: (id: string) => void;
}

const fuzzyMatch = (text: string, pattern: string): boolean => {
  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();
  let textIndex = 0;

  for (let i = 0; i < patternLower.length; i++) {
    const charIndex = textLower.indexOf(patternLower[i], textIndex);
    if (charIndex === -1) return false;
    textIndex = charIndex + 1;
  }
  return true;
};

const UnitSelector: React.FC<UnitSelectorProps> = ({ army, onSelect }) => {
  const { state } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allUnits = useMemo(() => {
    const combined: Record<string, any> = { ...units, ...presets };
    return Object.entries(combined).map(([id, u]) => ({ id, name: u.name }));
  }, []);

  const filteredUnits = useMemo(() => {
    const filtered = allUnits.filter(u => !searchTerm || fuzzyMatch(u.name, searchTerm));
    
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      filtered.sort((a, b) => {
        const aLower = a.name.toLowerCase();
        const bLower = b.name.toLowerCase();
        if (aLower === termLower) return -1;
        if (bLower === termLower) return 1;
        if (aLower.startsWith(termLower)) return -1;
        if (bLower.startsWith(termLower)) return 1;
        return aLower.indexOf(termLower) - bLower.indexOf(termLower);
      });
    }
    return filtered;
  }, [allUnits, searchTerm]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredUnits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredUnits.length) % filteredUnits.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredUnits[selectedIndex]) {
        onSelect(filteredUnits[selectedIndex].id);
        setIsOpen(false);
        setSearchTerm('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const currentUnitId = state[army].ps;
  const unitMap: Record<string, any> = { ...units, ...presets };
  const currentUnitName = currentUnitId ? unitMap[currentUnitId]?.name : state[army].nm || `Unit ${army.toUpperCase()}`;

  return (
    <div className="unit-selector-container" ref={containerRef} style={{ position: 'relative' }}>
      <h2 
        className="clickable-unit-name" 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {currentUnitName}
      </h2>

      {isOpen && (
        <div className="preset-list" style={{ display: 'block', position: 'absolute', top: '100%', left: 0, zIndex: 1000, minWidth: '250px' }}>
          <input
            ref={inputRef}
            type="text"
            className="unit-search-input"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: '100%', padding: '8px', marginBottom: '4px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
          />
          <div className="unit-list-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredUnits.map((u, index) => (
              <div
                key={u.id}
                className={`preset-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(u.id);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {u.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitSelector;

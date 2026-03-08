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
  const toggleRef = useRef<HTMLHeadingElement>(null);

  const allUnits = useMemo(() => {
    const combined: Record<string, any> = { ...units, ...presets };
    return Object.entries(combined).map(([id, u]) => ({ id, name: u.name }));
  }, []);

  const filteredUnits = useMemo(() => {
    const filtered = allUnits.filter((u) => !searchTerm || fuzzyMatch(u.name, searchTerm));

    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      filtered.sort((a, b) => {
        const aLower = a.name.toLowerCase();
        const bLower = b.name.toLowerCase();

        // 1. Exact match
        if (aLower === termLower) return -1;
        if (bLower === termLower) return 1;

        // 2. Starts with (prefix)
        const aStarts = aLower.startsWith(termLower);
        const bStarts = bLower.startsWith(termLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // 3. Contains substring (lower indexOf is better)
        const aIndex = aLower.indexOf(termLower);
        const bIndex = bLower.indexOf(termLower);
        if (aIndex !== -1 && bIndex === -1) return -1;
        if (aIndex === -1 && bIndex !== -1) return 1;
        if (aIndex !== -1 && bIndex !== -1) {
          if (aIndex !== bIndex) return aIndex - bIndex;
        }

        // 4. Fallback to name sort
        return aLower.localeCompare(bLower);
      });
    }
    return filtered;
  }, [allUnits, searchTerm]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking the toggle, let the onClick handle it
      if (toggleRef.current?.contains(event.target as Node)) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredUnits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredUnits.length) % filteredUnits.length);
    } else if (e.key === 'Enter') {
      if (filteredUnits[selectedIndex]) {
        onSelect(filteredUnits[selectedIndex].id);
        setIsOpen(false);
        setSearchTerm('');
      }
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const armyKey = army === 'a' ? 'armyA' : 'armyB';
  const currentUnitId = state[armyKey].preset;
  const unitMap: Record<string, any> = { ...units, ...presets };
  const currentUnitName = currentUnitId
    ? unitMap[currentUnitId]?.name
    : state[armyKey].name || `Unit ${army.toUpperCase()}`;

  return (
    <div className="unit-selector-container" ref={containerRef}>
      <h2 ref={toggleRef} className="clickable-unit-name" onClick={handleToggle}>
        {currentUnitName}
      </h2>

      {isOpen && (
        <div className="preset-list">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="unit-list-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredUnits.map((u, index) => (
              <div
                key={u.id}
                className={`preset-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
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

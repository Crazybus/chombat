import { describe, it, expect } from 'vitest';

// Copying logic from UnitSelector.tsx for reproduction
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

const sortUnits = (units: { name: string }[], searchTerm: string) => {
  const termLower = searchTerm.toLowerCase();
  return [...units].sort((a, b) => {
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
};

describe('Fuzzy Search Logic', () => {
  it('should prioritize substring matches over pure fuzzy matches', () => {
    const units = [{ name: 'Elite Cataphract' }, { name: 'Elite Kipchak' }, { name: 'War Elephant' }];
    const searchTerm = 'eleph';

    // Verify all match fuzzily
    expect(fuzzyMatch('Elite Cataphract', searchTerm)).toBe(true);
    expect(fuzzyMatch('Elite Kipchak', searchTerm)).toBe(true);
    expect(fuzzyMatch('War Elephant', searchTerm)).toBe(true);

    const sorted = sortUnits(units, searchTerm);
    const names = sorted.map((u) => u.name);

    // Current behavior (demonstrating the bug):
    // "War Elephant" indexOf "eleph" is 4.
    // "Elite Cataphract" indexOf "eleph" is -1.
    // sort result for (Cataphract, Elephant) is -1 - 4 = -5. Cataphract comes first.

    // Desired behavior:
    expect(names[0]).toBe('War Elephant');
  });
});

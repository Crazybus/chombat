import { TechTargetException } from '../sim/types';

/**
 * Special rules for tech applicability that cannot be derived from standard game data.
 * These are civilization-specific exceptions to normal tech targeting rules.
 */
export const techTargetExceptions: Record<string, TechTargetException[]> = {
  INCAS: [
    // Inca villagers benefit from blacksmith infantry technologies in Castle Age+
    { unitId: 83, building: 103, targetClass: 6, minAge: 3 },
  ],
};

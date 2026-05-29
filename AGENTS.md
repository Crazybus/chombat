# AGENTS.md — Chombat Development Guide

## Project Overview

Chombat is an Age of Empires II combat simulator that analyzes unit matchups, tech bonuses, and army compositions. The project uses TypeScript with Vite for the frontend and a Python script to import game data from AoK/Genie format files.

### Key Directories

```
src/
├── data/           # Auto-generated game data + constants
│   ├── units.ts    # Unit stats (auto-generated)
│   ├── techs.ts    # Tech effects (auto-generated)
│   ├── civs.ts     # Civilization data (auto-generated)
│   ├── buildings.ts # Building data (auto-generated)
│   ├── effect_constants.ts # Effect type/attribute IDs (manual)
│   ├── bonuses.ts  # Civ-specific bonuses (manual)
│   ├── presets.ts  # Army presets (manual)
│   └── scenarios/  # Predefined scenarios (manual)
├── sim/            # Core simulation logic
│   ├── CombatSim.ts      # Combat simulation engine
│   ├── Unit.ts           # Unit class with stats
│   ├── ArmyAnalyzer.ts   # Army analysis and tech recommendations
│   ├── TechLogic.ts      # Tech effect matching and labeling
│   ├── ProductionSim.ts  # Production timeline simulation
│   └── types.ts          # TypeScript interfaces
├── rules/          # Game rules and exceptions
│   └── tech_target_exceptions.ts # Special tech targeting rules
└── hooks/          # React hooks
utils/
└── import_game_data.py # Python script to parse .dat files
tests/              # Vitest test files
```

## Architecture

### Data Flow

1. **Game Data Import**: `utils/import_game_data.py` parses AoK/Genie `.dat` files → generates `src/data/*.ts`
2. **Effect Processing**: `TechLogic.ts` determines if effects apply to units
3. **Bonus Application**: `CombatSim.ts` applies tech bonuses to unit stats
4. **Combat Simulation**: `CombatSim.ts` runs tick-based combat simulation
5. **Army Analysis**: `ArmyAnalyzer.ts` analyzes army compositions and recommends techs

### Effect System

The effect system uses a three-part structure:

- **Type**: 0=Set, 4=Add, 5=Multiply
- **Attribute**: Numeric ID (see `effect_constants.ts`)
- **Value**: Encoded or raw numeric value

#### Common Attribute IDs

| ID      | Attribute         | Notes                                  |
| ------- | ----------------- | -------------------------------------- |
| 0       | HP                | Raw value                              |
| 5       | Speed             | Raw value                              |
| 8       | Armor             | Encoded as `cls \| amt`                |
| 9       | Attack            | Encoded as `cls \| amt`                |
| 10      | Reload            | Raw value                              |
| 11      | Accuracy          | Raw value                              |
| 12      | Max Range         | Raw value                              |
| 15      | Base Armor        | Raw value                              |
| 20      | Min Range         | Raw value                              |
| 24      | Damage Resistance | Raw value                              |
| 25      | Poison Damage     | Encoded as `(duration << 8) \| damage` |
| 100-106 | Costs             | Food, Wood, Gold, Stone, Total         |

#### Encoding Patterns

1. **Class/Amount Encoding** (Armor/Attack): `value = (class << 8) | amount`
   - Example: Class 3 (Pierce), +2 → `(3 << 8) | 2 = 770`
   - Decode: `class = value >> 8`, `amount = value & 0xFF`

2. **Poison Encoding** (DOT): `value = (duration_seconds << 8) | damage_per_tick`
   - Example: 6s duration, 5 damage/tick → `(6 << 8) | 5 = 1541`
   - Decode: `damage = value & 0xFF`, `duration = (value >> 8) & 0xFF`

### Combat Simulation

- **Tick Rate**: 0.05 seconds (20 ticks per second)
- **Max Duration**: 300 seconds
- **Damage Calculation**: Base attack - armor + bonus damage
- **DOT Processing**: 1-second intervals, independent of attack cooldown
- **Unit Tracking**: Each unit has `currentCount`, `currentUnitHp`, `attackCooldown`

### Tech Effect Matching

The `shouldApplyEffect` function in `TechLogic.ts` determines if an effect applies to a unit:

1. Age check (effect age ≤ current age)
2. Latest age wins (higher age effects override lower)
3. Unit ID match (`unitId === -1` means all units)
4. Class match (with category aliases)
5. Range/accuracy checks (don't apply to melee)
6. Cost checks (don't apply if unit has no cost)
7. Armor/Attack class checks (must have relevant class)
8. Deduplication (hide generic if specific exists)

## Development Workflow

### Commands

```bash
# Install dependencies
make install

# Generate game data from .dat files
make data

# Run tests
make test

# Run linter
make lint

# Format code
make format

# Build for production
make build

# Run development server
make dev

# Pre-commit hook (builds, tests, formats, lints)
make hook
```

### Testing

- Uses Vitest with TypeScript
- Test files in `tests/` directory
- Run specific test: `npm test -- TestName`
- All tests must pass before committing

### Adding New Mechanics

When adding new game mechanics (like DOT):

1. **Define Constants**: Add attribute ID to `effect_constants.ts`
2. **Update Types**: Add fields to `UnitData` interface in `types.ts`
3. **Update Unit Class**: Add fields to `Unit` class in `Unit.ts`
4. **Handle in CombatSim**: Process in `applyBonuses()` method
5. **Update TechLogic**: Add to `getEffectLabel()` for display
6. **Update ArmyAnalyzer**: Add to combat tech filter if applicable
7. **Update Import Script**: Add to `VALID_ATTRS` and handle in `extract_effects()`
8. **Write Tests**: Create test file in `tests/`

### Auto-Generated Files

The following files are generated by `import_game_data.py` and should NOT be manually edited:

- `src/data/units.ts`
- `src/data/techs.ts`
- `src/data/civs.ts`
- `src/data/buildings.ts`

If you need to add data that's not in the .dat files, use the post-processing pattern in the import script (see `_inject_curare_effects()` example).

## Common Patterns

### Adding a Tech Effect

```typescript
// In effect_constants.ts
export const EFFECT_ATTRIBUTES = {
  // ... existing
  new_attribute: 26, // Choose next available ID
};

// In import_game_data.py
VALID_ATTRS.add(26)  # Add to valid attributes

# In the extract_effects function or post-processing
# Handle the new attribute type
```

### Adding a Unit Type

Units are imported from the .dat files. If a unit needs special handling:

1. Add to `tech_target_exceptions.ts` if it needs special tech targeting
2. Add to `CLASS_ALIASES` in `TechLogic.ts` if it belongs to a category
3. Add to `presets.ts` if it should be available in the UI

### Adding a Civilization Bonus

1. Add to `src/data/bonuses.ts` with the civ key
2. Define effects using the standard effect format
3. Effects are automatically applied during simulation

## Gotchas

### Genie Format Quirks

- Unit IDs are strings in the data files but may be numbers in effects
- Some effects use encoded values that need decoding
- Class-based effects may need category aliases to match correctly
- Age-based effects use "latest age wins" logic

### Combat Simulation

- DOT ticks every 1 second, not on attack cooldown
- Damage is applied immediately, DOT damage is separate
- Unit HP is tracked per-unit and across the army
- Micro affects damage distribution but not total damage

### Testing

- Tests run in isolation, don't rely on global state
- Use `analyzeArmy()` for testing tech effects
- Use `CombatSim` directly for testing combat mechanics
- Mock data should match the structure of real game data

## Import Script Details

The Python import script uses the `genieutils` library to parse AoK .dat files:

- Located at `utils/import_game_data.py`
- Requires Python 3 and genieutils package
- Generates TypeScript files in `src/data/`
- Handles effect extraction with `VALID_ATTRS` filtering
- Supports post-processing for data not in .dat files

### Key Functions

- `convert()`: Main entry point, processes all data
- `extract_effects()`: Parses effect data from techs
- `load_extra_data()`: Loads additional data from JSON files
- `_inject_curare_effects()`: Example of post-processing for custom data

## Future Considerations

### When genieutils Supports New Attributes

If the .dat parser gains support for new attribute types:

1. Remove post-processing functions from import script
2. Update `VALID_ATTRS` to include the new attribute
3. Run `make data` to regenerate files
4. Verify tests still pass

### Performance Optimization

- Combat simulation runs in O(n²) time for large armies
- Consider caching frequently used calculations
- Pre-compute tech effect applicability for common unit types

## References

- [Age of Empires II Wiki](https://ageofempires.fandom.com)
- [Genie Format Documentation](https://github.com/geml1l/genieutils)
- [Vitest Documentation](https://vitest.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

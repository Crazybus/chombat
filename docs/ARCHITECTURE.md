# Chombat Architecture

Chombat is a static web application for simulating Age of Empires II combat.

## Project Structure

- `index.html`: Main UI structure and layout.
- `styles.css`: Visual styling, including theme support (dark/light).
- `script.js`: Core application logic, simulation engine, and UI management.
- `units.js`: Generated unit data from game files.
- `techs.js`: Generated technology data from game files.
- `bonuses.js`: Manually defined civilization bonuses.
- `presets.js`: Common unit configurations (e.g., "Archer FU Feudal").
- `scenarios.js`: Predefined matchup scenarios.
- `convert_units.py`: Python script to extract data from game `.dat` files and Tech Tree JSONs.

## Data Flow

1.  **Extraction**: `convert_units.py` reads `empires2_x2_p1.dat` and `CivTechTrees/*.json` to produce `units.js` and `techs.js`.
2.  **Loading**: On page load, `script.js` loads state from the URL or local defaults.
3.  **UI Interaction**: User changes unit stats, adds production steps, or toggles bonuses.
4.  **Simulation**: `script.js` triggers `CombatSim` whenever inputs change.
5.  **Visualization**: Simulation results are rendered using Chart.js and updated in the summary panels.
6.  **Persistence**: Application state is synchronized to the URL for sharing.

## Key Components

### CombatSim Class
The core simulation engine. It runs a deterministic, time-based loop (0.05s ticks) to calculate combat outcomes. It accounts for:
- Attack reload times and speed bonuses.
- Melee vs. Pierce armor types.
- Engagement efficiency (percentage of army actively attacking).
- Target micro (overkill avoidance).

### Unit Class
Represents an individual unit or group of units in the simulation. Handles cost calculations and state management during battle.

### Production Timeline
Simulates army growth over time. Supports sequential steps like adding buildings or researching techs, triggered by time or unit count.

# Chombat Architecture

Chombat is a static web application for simulating Age of Empires II combat and production.

## Project Structure

- `index.html`: Main UI structure and layout.
- `styles.css`: Visual styling, including theme support (dark/light).
- `script.js`: Core application logic, simulation engine, and UI management.
- `units.js`: Generated unit data from game files.
- `techs.js`: Generated technology data from game files.
- `buildings.js`: Generated building data from game files.
- `bonuses.js`: Manually defined civilization bonuses.
- `presets.js`: Common unit configurations (e.g., "Archer FU Feudal").
- `scenarios.js`: Predefined matchup scenarios.
- `convert_units.py`: Python script to extract data from game `.dat` files and Tech Tree JSONs.

## Data Flow

1.  **Extraction**: `convert_units.py` reads `empires2_x2_p1.dat` and `CivTechTrees/*.json` to produce data files.
2.  **Loading**: On page load, `script.js` loads state from the URL or local defaults.
3.  **UI Interaction**: User changes unit stats, adds production steps, or toggles bonuses.
4.  **Simulation**: `script.js` triggers `CombatSim` whenever inputs change.
5.  **Visualization**: Results are rendered using Chart.js.
6.  **Persistence**: Application state is synchronized to the URL.

## Key Components

### CombatSim Class

The core simulation engine. It runs a deterministic, time-based loop (0.05s ticks) to calculate combat outcomes. It accounts for:

- Attack reloads and speed bonuses.
- Melee vs. Pierce armor.
- Engagement efficiency.
- Target micro (overkill avoidance).

### Production Timeline

Simulates army growth sequentially. Unlike the combat sim, it processes steps one by one:

- **Sequential Processing**: Each step (tech, building, wait) must finish its delay before the next step starts.
- **Blocking**: Technology steps can optionally "block" a production building, reducing output while researching.
- **Dynamic Updates**: Changing the order of steps (via drag-and-drop) immediately recalculates the growth curve.

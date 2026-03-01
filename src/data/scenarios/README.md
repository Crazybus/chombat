# Scenarios Directory

Each scenario is stored in its own TypeScript file for easier management and version control.

## File Structure

```
src/data/scenarios/
├── index.ts              # Re-exports all scenarios
├── archer_vs_skirm.ts    # Individual scenario file
├── champi_vs_maa.ts      # Individual scenario file
└── champi_vs_scouts.ts   # Individual scenario file
```

## Creating a New Scenario

### Option 1: Export from UI (Recommended)

1. Set up your matchup in the Chombat UI
2. Click the **Export** button
3. The scenario JSON will be copied to your clipboard with a generated ID
4. Create a new file: `src/data/scenarios/your_scenario_name.ts`
5. Paste the exported JSON
6. Add the export to `index.ts`:
   ```typescript
   export { your_scenario_name } from './your_scenario_name';
   ```
7. Add to `featuredScenarios` in `src/data/scenarios.ts` if you want it as a button

### Option 2: Manual Creation

Create a new file `src/data/scenarios/your_scenario_name.ts`:

```typescript
export const your_scenario_name = {
    "name": "Your Scenario Name",
    "a": {
        "nm": "Unit A Name",
        "c": "10",
        "age": "2",
        // ... other stats
        "tl": [...],  // Timeline steps
        "bn": [...]   // Bonus techs
    },
    "b": {
        "nm": "Unit B Name",
        // ... same structure as army A
    },
    "desc": "Description of the scenario"
};
```

## Scenario ID Format

- Use snake_case: `archer_vs_skirm`, `champi_vs_scouts`
- Keep it descriptive but concise
- The ID is used in the URL: `/?scenario_id=champi_vs_scouts`

## Adding to Featured Scenarios

To show your scenario as a button on the main page, add it to the `featuredScenarios` array in `src/data/scenarios.ts`:

```typescript
export const featuredScenarios = [
    'champi_vs_scouts',
    'archer_vs_skirm',
    'champi_vs_maa',
    'your_new_scenario',  // Add here
];
```

## Export Format

When you click Export in the UI, you get JSON ready to paste:

```json
{
  "your_scenario_id": {
    "name": "Scenario Name",
    "a": { ... },
    "b": { ... },
    "desc": "Description"
  }
}
```

Just:
1. Create `src/data/scenarios/your_scenario_id.ts`
2. Paste the JSON (remove outer braces, keep the inner object)
3. Add `export const your_scenario_id = ` before the object
4. Update `index.ts` and `scenarios.ts`

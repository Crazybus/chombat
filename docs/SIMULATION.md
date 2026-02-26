# Simulation Logic

This document details the mathematical and logical models used in Chombat.

## Combat Simulation

The combat simulation runs in a loop with a tick rate of **0.05 seconds**.

### Damage Calculation
For each tick, if a unit's attack cooldown is zero:
1.  **Attack Type**: Determine if the attack is Melee or Pierce based on the unit's range (range > 1 is Pierce).
2.  **Base Damage**: `effective_attack = max(1, attack - opponent_armor)`.
3.  **Bonus Damage**: Bonus damage is added to the base damage. *Note: Detailed bonus damage mapping is a work in progress.*
4.  **Engagement**: Total damage in a tick is `effective_attack * active_attackers`. `active_attackers` is calculated based on the "Engagement %" setting.

### Micro (Overkill Avoidance)
The "Target Micro" slider (1 to 5) simulates how effectively units distribute their damage:
-   **Focus Fire (1)**: All units target the same enemy until it dies. High overkill potential for ranged units.
-   **Perfect (5)**: Damage is perfectly distributed to kill units without wasting a single hit point.

### Health Management
Units are treated as a group with a `totalHp` and `currentUnitHp`. When damage is applied, `totalHp` is reduced, and `currentCount` is updated: `currentCount = ceil(totalHp / hpPerUnit)`.

## Production Simulation

The production simulation calculates army size at specific points in time (every 10s up to 1800s).

### Timeline Steps
Production is modified by a list of sequential steps:
-   **Add Building**: Increases the `currentBuild` capacity.
-   **Research Tech**: Occupies one production building for the duration of the research time (found in `techs.js`).
-   **Train Units**: A wait condition that pauses processing further steps until a certain unit count is reached.

### Triggers
Steps can be triggered by:
-   **Time**: Step occurs once simulation time reacher the trigger value.
-   **Units**: Step occurs once the current unit count reacher the trigger value.

### Advantage Calculation
The "Battle Advantage" chart compares the outcome of a battle between the two armies produced at each 10s interval. It displays the HP percentage of the winner (positive for Army A, negative for Army B).

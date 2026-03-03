# Simulation Logic

This document details the mathematical models used in Chombat.

## Combat Simulation

The combat simulation runs in a loop with a tick rate of **0.05 seconds**.

### Damage Calculation

For each tick, if a unit's attack cooldown is zero:

1.  **Attack Type**: Melee or Pierce based on range (range > 1 is Pierce).
2.  **Base Damage**: `effective_attack = max(1, attack - opponent_armor)`.
3.  **Engagement**: Damage is multiplied by the number of units actively attacking, based on the "Engagement %" setting.

### Micro (Overkill Avoidance)

The "Target Micro" slider (1 to 5) simulates damage distribution:

- **Focus Fire (1)**: High overkill potential; units waste damage on nearly-dead targets.
- **Perfect (5)**: Damage is perfectly distributed to maximize kills.

## Production Simulation

The production simulation calculates army size every 10 seconds up to 30 minutes.

### Sequential Timeline

Steps are processed one after another:

1.  **Start Step**: Set construction/research start time.
2.  **Delay**: Wait for `delay * count` seconds.
3.  **Effect**: Apply the step's effect (add buildings, change speed, etc.).
4.  **Next**: Start the next step in the timeline.

### Research Blocking

If "Block" is enabled for a step:

- One production building is removed from the active pool for the duration of that step.
- Total production capacity is reduced while the research is in progress.

### Battle Advantage Chart

At each interval, a mini combat simulation is run using the current army counts. The chart displays the winner's remaining HP percentage (positive for A, negative for B).

# Chombat Usage Guide

Chombat is a powerful simulator for Age of Empires II combat and production. This guide explains how to get the most out of it.

## 1. Unit Configuration

In the top section, you can configure two armies (Unit A and Unit B).

- **Unit Selection**: Use the search box to find a unit from the game data or a predefined preset (e.g., "Archer FU Feudal").
- **Manual Stats**: Click "Edit" to manually override any stat (HP, Attack, Armor, Reload, etc.).
- **Age Upgrades**: Use the **II**, **III**, and **IV** buttons to quickly apply standard Blacksmith and unit upgrades for that age.
- **Bonuses**: Search for and apply civilization-specific bonuses (e.g., Japanese infantry attack speed).
- **Engagement & Micro**: Adjust how much of your army is actively fighting and how well they avoid "overkilling" units.

## 2. Battle Simulation

The Battle Simulation section shows the outcome of a fight between two specific army sizes.

- **Army Counts**: Adjust the number of units on each side using the `+` and `−` buttons.
- **Charts**:
  - **Unit Counts Over Time**: Shows how many units remain as the battle progresses.
  - **Total HP**: Visualizes the remaining "tankiness" of each side.
  - **Resource Value**: Shows the current "gold/food/wood value" of the remaining units.
  - **Cost Efficiency**: A ratio showing which army is trading more efficiently.

## 3. Production Simulation

This section simulates army growth over time using a sequential timeline.

- **Timeline Steps**: Add steps to define your build order:
  - **Technology**: Research a tech (e.g., Bloodlines). Check "Block" if production should pause in one building during research.
  - **Building**: Add more production buildings.
  - **Add Production**: Instantly add a certain number of units.
  - **Change Speed**: Update the train time for future units.
  - **Wait for Units**: Pauses the timeline processing until a certain number of units have been trained.
- **Reordering**: Drag steps using the `::` handle to change the order.
- **Charts**:
  - **Army Growth**: Shows the total unit count over 30 minutes.
  - **Battle Advantage**: Simulates a fight at every 10-second interval to show who would win if the fight started at that moment.

## 4. Effectiveness Scaling

This section analyzes how the matchup changes as army sizes scale. It shows "breakpoints" where one side starts to dominate or becomes more cost-effective.

## 5. Sharing

Click **Share Matchup** to copy a URL to your clipboard. This URL contains the entire state of your simulation, including all custom stats and timeline steps.

// Import all scenarios from individual files
import { archer_vs_skirm } from './scenarios/archer_vs_skirm';
import { champi_vs_scouts } from './scenarios/champi_vs_scouts';
import { champi_vs_maa } from './scenarios/champi_vs_maa';

// Combine all scenarios into single object
export const scenarios = {
    archer_vs_skirm,
    champi_vs_scouts,
    champi_vs_maa,
};

// List of featured scenarios to show as buttons
export const featuredScenarios = ['champi_vs_scouts', 'archer_vs_skirm', 'champi_vs_maa'];

import { Route } from '../domain/Route';

// Target intensity for compliance check
const TARGET_INTENSITY = 89.3368; // gCO₂e/MJ

export interface ComparisonResult {
  baseline: {
    routeId: string;
    ghgIntensity: number;
  };
  comparison: {
    routeId: string;
    ghgIntensity: number;
  };
  percentDiff: number;
  compliant: boolean;
}

export class ComputeComparison {
  /**
   * Compares a baseline route with a comparison route
   * 
   * Calculates:
   * - Percentage difference: ((comparison / baseline) − 1) × 100
   * - Compliance status: comparison ghgIntensity < Target_Intensity
   */
  execute(baseline: Route, comparison: Route): ComparisonResult {
    // Validate inputs
    if (!baseline) {
      throw new Error('Baseline route is required');
    }
    if (!comparison) {
      throw new Error('Comparison route is required');
    }
    if (baseline.ghgIntensity <= 0) {
      throw new Error('Baseline GHG intensity must be positive');
    }

    // Calculate percentage difference: ((comparison / baseline) − 1) × 100
    const percentDiff = ((comparison.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

    // Determine compliance: comparison route is compliant if below target intensity
    const compliant = comparison.ghgIntensity < TARGET_INTENSITY;

    return {
      baseline: {
        routeId: baseline.routeId,
        ghgIntensity: baseline.ghgIntensity
      },
      comparison: {
        routeId: comparison.routeId,
        ghgIntensity: comparison.ghgIntensity
      },
      percentDiff,
      compliant
    };
  }

  /**
   * Compares multiple comparison routes against a single baseline
   */
  executeMultiple(baseline: Route, comparisons: Route[]): ComparisonResult[] {
    if (!comparisons || comparisons.length === 0) {
      throw new Error('At least one comparison route is required');
    }

    return comparisons.map(comparison => this.execute(baseline, comparison));
  }
}

import { ICompareRoutes, RouteComparison } from '../../ports/inbound';
import { IApiClient } from '../../ports/outbound';

export class CompareRoutes implements ICompareRoutes {
  constructor(private apiClient: IApiClient) {}

  async execute(): Promise<RouteComparison> {
    const comparisonData = await this.apiClient.getComparison();
    
    // Calculate percentage difference on frontend
    // Formula: ((comparison / baseline) − 1) × 100
    const percentDiff = ((comparisonData.comparison.ghgIntensity / comparisonData.baseline.ghgIntensity) - 1) * 100;
    
    // Target intensity from requirements: 89.3368 gCO₂e/MJ
    const TARGET_INTENSITY = 89.3368;
    const compliant = comparisonData.comparison.ghgIntensity < TARGET_INTENSITY;
    
    return {
      baseline: comparisonData.baseline,
      comparison: comparisonData.comparison,
      percentDiff,
      compliant
    };
  }
}

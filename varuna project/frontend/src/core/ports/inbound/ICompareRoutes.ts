export interface RouteComparison {
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

export interface ICompareRoutes {
  execute(): Promise<RouteComparison>;
}

export interface Route {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export class RouteEntity implements Route {
  constructor(
    public id: number,
    public routeId: string,
    public vesselType: string,
    public fuelType: string,
    public year: number,
    public ghgIntensity: number,
    public fuelConsumption: number,
    public distance: number,
    public totalEmissions: number,
    public isBaseline: boolean
  ) {}

  static fromData(data: Route): RouteEntity {
    return new RouteEntity(
      data.id,
      data.routeId,
      data.vesselType,
      data.fuelType,
      data.year,
      data.ghgIntensity,
      data.fuelConsumption,
      data.distance,
      data.totalEmissions,
      data.isBaseline
    );
  }

  isCompliant(targetIntensity: number): boolean {
    return this.ghgIntensity < targetIntensity;
  }
}

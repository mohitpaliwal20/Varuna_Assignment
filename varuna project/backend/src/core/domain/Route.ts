export class Route {
  constructor(
    public readonly id: number,
    public readonly routeId: string,
    public readonly vesselType: string,
    public readonly fuelType: string,
    public readonly year: number,
    public readonly ghgIntensity: number,
    public readonly fuelConsumption: number,
    public readonly distance: number,
    public readonly totalEmissions: number,
    public readonly isBaseline: boolean,
    public readonly createdAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.routeId || this.routeId.trim() === '') {
      throw new Error('Route ID is required');
    }
    if (!this.vesselType || this.vesselType.trim() === '') {
      throw new Error('Vessel type is required');
    }
    if (!this.fuelType || this.fuelType.trim() === '') {
      throw new Error('Fuel type is required');
    }
    if (this.year < 2000 || this.year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (this.ghgIntensity < 0) {
      throw new Error('GHG intensity must be non-negative');
    }
    if (this.fuelConsumption < 0) {
      throw new Error('Fuel consumption must be non-negative');
    }
    if (this.distance < 0) {
      throw new Error('Distance must be non-negative');
    }
    if (this.totalEmissions < 0) {
      throw new Error('Total emissions must be non-negative');
    }
  }

  public static fromData(data: {
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
    createdAt?: Date;
  }): Route {
    return new Route(
      data.id,
      data.routeId,
      data.vesselType,
      data.fuelType,
      data.year,
      data.ghgIntensity,
      data.fuelConsumption,
      data.distance,
      data.totalEmissions,
      data.isBaseline,
      data.createdAt
    );
  }
}

export interface ComplianceBalance {
  id?: number;
  shipId: string;
  year: number;
  cbGco2eq: number;
  computedAt?: Date;
}

export interface ComplianceRepository {
  save(compliance: ComplianceBalance): Promise<ComplianceBalance>;
  findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;
  findAdjustedCB(shipId: string, year: number): Promise<number>;
}

export type ComplianceStatus = 'SURPLUS' | 'DEFICIT';

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  status: ComplianceStatus;
  computedAt: Date;
}

export class ComplianceBalanceEntity implements ComplianceBalance {
  constructor(
    public shipId: string,
    public year: number,
    public cbGco2eq: number,
    public status: ComplianceStatus,
    public computedAt: Date
  ) {}

  static fromData(data: ComplianceBalance): ComplianceBalanceEntity {
    return new ComplianceBalanceEntity(
      data.shipId,
      data.year,
      data.cbGco2eq,
      data.status,
      new Date(data.computedAt)
    );
  }

  static computeStatus(cbGco2eq: number): ComplianceStatus {
    return cbGco2eq >= 0 ? 'SURPLUS' : 'DEFICIT';
  }

  isSurplus(): boolean {
    return this.status === 'SURPLUS';
  }

  isDeficit(): boolean {
    return this.status === 'DEFICIT';
  }

  canBank(): boolean {
    return this.cbGco2eq > 0;
  }
}

export type ComplianceStatus = 'SURPLUS' | 'DEFICIT';

export class ComplianceBalance {
  constructor(
    public readonly shipId: string,
    public readonly year: number,
    public readonly cbGco2eq: number,
    public readonly computedAt?: Date,
    public readonly id?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.shipId || this.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }
    if (this.year < 2000 || this.year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (isNaN(this.cbGco2eq)) {
      throw new Error('Compliance balance must be a valid number');
    }
  }

  public getStatus(): ComplianceStatus {
    return this.cbGco2eq >= 0 ? 'SURPLUS' : 'DEFICIT';
  }

  public isSurplus(): boolean {
    return this.cbGco2eq > 0;
  }

  public isDeficit(): boolean {
    return this.cbGco2eq < 0;
  }

  public static fromData(data: {
    id?: number;
    shipId: string;
    year: number;
    cbGco2eq: number;
    computedAt?: Date;
  }): ComplianceBalance {
    return new ComplianceBalance(
      data.shipId,
      data.year,
      data.cbGco2eq,
      data.computedAt,
      data.id
    );
  }
}

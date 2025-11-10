export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  id: number;
  year: number;
  members: PoolMember[];
  createdAt: Date;
}

export class PoolEntity implements Pool {
  constructor(
    public id: number,
    public year: number,
    public members: PoolMember[],
    public createdAt: Date
  ) {}

  static fromData(data: Pool): PoolEntity {
    return new PoolEntity(
      data.id,
      data.year,
      data.members,
      new Date(data.createdAt)
    );
  }

  getTotalCbBefore(): number {
    return this.members.reduce((sum, member) => sum + member.cbBefore, 0);
  }

  getTotalCbAfter(): number {
    return this.members.reduce((sum, member) => sum + member.cbAfter, 0);
  }

  isValid(): boolean {
    return this.getTotalCbAfter() >= 0;
  }

  validateDeficitConstraints(): boolean {
    // Deficit ships cannot exit worse
    return this.members
      .filter(m => m.cbBefore < 0)
      .every(m => m.cbAfter >= m.cbBefore);
  }

  validateSurplusConstraints(): boolean {
    // Surplus ships cannot exit negative
    return this.members
      .filter(m => m.cbBefore > 0)
      .every(m => m.cbAfter >= 0);
  }

  validateAllConstraints(): boolean {
    return (
      this.isValid() &&
      this.validateDeficitConstraints() &&
      this.validateSurplusConstraints()
    );
  }
}

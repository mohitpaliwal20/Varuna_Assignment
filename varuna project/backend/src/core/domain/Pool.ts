export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export class Pool {
  constructor(
    public readonly year: number,
    public readonly members: PoolMember[],
    public readonly createdAt?: Date,
    public readonly id?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.year < 2000 || this.year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (!this.members || this.members.length === 0) {
      throw new Error('Pool must have at least one member');
    }
    
    // Validate each member
    for (const member of this.members) {
      if (!member.shipId || member.shipId.trim() === '') {
        throw new Error('All pool members must have a ship ID');
      }
      if (isNaN(member.cbBefore) || isNaN(member.cbAfter)) {
        throw new Error('All pool members must have valid CB values');
      }
    }

    // Validate pool constraints
    const totalCbAfter = this.getTotalCbAfter();
    if (totalCbAfter < 0) {
      throw new Error('Pool total CB after allocation must be non-negative');
    }

    // Validate deficit ships don't exit worse
    for (const member of this.members) {
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        throw new Error(`Deficit ship ${member.shipId} cannot exit with worse balance`);
      }
    }

    // Validate surplus ships don't exit negative
    for (const member of this.members) {
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        throw new Error(`Surplus ship ${member.shipId} cannot exit with negative balance`);
      }
    }
  }

  public getTotalCbBefore(): number {
    return this.members.reduce((sum, member) => sum + member.cbBefore, 0);
  }

  public getTotalCbAfter(): number {
    return this.members.reduce((sum, member) => sum + member.cbAfter, 0);
  }

  public getMemberCount(): number {
    return this.members.length;
  }

  public static fromData(data: {
    id?: number;
    year: number;
    members: PoolMember[];
    createdAt?: Date;
  }): Pool {
    return new Pool(data.year, data.members, data.createdAt, data.id);
  }
}

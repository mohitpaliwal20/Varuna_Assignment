export type TransactionType = 'BANK' | 'APPLY';

export class BankEntry {
  constructor(
    public readonly shipId: string,
    public readonly year: number,
    public readonly amountGco2eq: number,
    public readonly transactionType: TransactionType,
    public readonly createdAt?: Date,
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
    if (isNaN(this.amountGco2eq)) {
      throw new Error('Amount must be a valid number');
    }
    if (this.transactionType !== 'BANK' && this.transactionType !== 'APPLY') {
      throw new Error('Transaction type must be BANK or APPLY');
    }
    if (this.transactionType === 'BANK' && this.amountGco2eq <= 0) {
      throw new Error('Bank amount must be positive');
    }
    if (this.transactionType === 'APPLY' && this.amountGco2eq <= 0) {
      throw new Error('Apply amount must be positive');
    }
  }

  public isBank(): boolean {
    return this.transactionType === 'BANK';
  }

  public isApply(): boolean {
    return this.transactionType === 'APPLY';
  }

  public static fromData(data: {
    id?: number;
    shipId: string;
    year: number;
    amountGco2eq: number;
    transactionType: TransactionType;
    createdAt?: Date;
  }): BankEntry {
    return new BankEntry(
      data.shipId,
      data.year,
      data.amountGco2eq,
      data.transactionType,
      data.createdAt,
      data.id
    );
  }
}

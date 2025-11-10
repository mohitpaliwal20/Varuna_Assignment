export type TransactionType = 'BANK' | 'APPLY';

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  transactionType: TransactionType;
  createdAt: Date;
}

export class BankEntryEntity implements BankEntry {
  constructor(
    public id: number,
    public shipId: string,
    public year: number,
    public amountGco2eq: number,
    public transactionType: TransactionType,
    public createdAt: Date
  ) {}

  static fromData(data: BankEntry): BankEntryEntity {
    return new BankEntryEntity(
      data.id,
      data.shipId,
      data.year,
      data.amountGco2eq,
      data.transactionType,
      new Date(data.createdAt)
    );
  }

  isBankTransaction(): boolean {
    return this.transactionType === 'BANK';
  }

  isApplyTransaction(): boolean {
    return this.transactionType === 'APPLY';
  }
}

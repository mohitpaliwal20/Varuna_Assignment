export interface BankEntry {
  id?: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  transactionType: 'BANK' | 'APPLY';
  createdAt?: Date;
}

export interface BankRepository {
  save(entry: BankEntry): Promise<BankEntry>;
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  getAvailableBalance(shipId: string, year: number): Promise<number>;
}

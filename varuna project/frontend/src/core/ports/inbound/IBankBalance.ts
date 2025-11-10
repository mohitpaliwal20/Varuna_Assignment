export interface BankBalanceRequest {
  shipId: string;
  year: number;
  amount: number;
}

export interface BankBalanceResponse {
  success: boolean;
  message?: string;
}

export interface IBankBalance {
  execute(request: BankBalanceRequest): Promise<BankBalanceResponse>;
}

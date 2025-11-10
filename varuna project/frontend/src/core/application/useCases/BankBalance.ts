import { IBankBalance, BankBalanceRequest, BankBalanceResponse } from '../../ports/inbound';
import { IApiClient } from '../../ports/outbound';

export class BankBalance implements IBankBalance {
  constructor(private apiClient: IApiClient) {}

  async execute(request: BankBalanceRequest): Promise<BankBalanceResponse> {
    try {
      await this.apiClient.bankSurplus(request.shipId, request.year, request.amount);
      return {
        success: true,
        message: 'Surplus banked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bank surplus'
      };
    }
  }
}

import { IApplyBanked, ApplyBankedRequest, ApplyBankedResponse } from '../../ports/inbound';
import { IApiClient } from '../../ports/outbound';

export class ApplyBanked implements IApplyBanked {
  constructor(private apiClient: IApiClient) {}

  async execute(request: ApplyBankedRequest): Promise<ApplyBankedResponse> {
    try {
      await this.apiClient.applyBanked(request.shipId, request.year, request.amount);
      return {
        success: true,
        message: 'Banked surplus applied successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to apply banked surplus'
      };
    }
  }
}

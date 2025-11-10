import { ISetBaseline } from '../../ports/inbound';
import { IApiClient } from '../../ports/outbound';

export class SetBaseline implements ISetBaseline {
  constructor(private apiClient: IApiClient) {}

  async execute(routeId: string): Promise<void> {
    await this.apiClient.setBaseline(routeId);
  }
}

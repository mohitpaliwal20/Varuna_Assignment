import { Route } from '../../domain';
import { IFetchRoutes } from '../../ports/inbound';
import { IApiClient } from '../../ports/outbound';

export class FetchRoutes implements IFetchRoutes {
  constructor(private apiClient: IApiClient) {}

  async execute(): Promise<Route[]> {
    return await this.apiClient.fetchRoutes();
  }
}

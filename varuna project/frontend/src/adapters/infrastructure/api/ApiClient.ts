import {
  IApiClient,
  RouteComparisonData,
  AdjustedComplianceBalance,
  CreatePoolPayload,
} from '../../../core/ports/outbound';
import { Route, ComplianceBalance, BankEntry, Pool } from '../../../core/domain';
import { config } from '../../../shared/config';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient implements IApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw new ApiError(
          errorData.message || 'An error occurred',
          response.status,
          errorData.details
        );
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        error
      );
    }
  }

  // Routes endpoints
  async fetchRoutes(): Promise<Route[]> {
    return this.request<Route[]>('/routes');
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.request<void>(`/routes/${routeId}/baseline`, {
      method: 'POST',
    });
  }

  async getComparison(): Promise<RouteComparisonData> {
    return this.request<RouteComparisonData>('/routes/comparison');
  }

  // Compliance endpoints
  async getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const params = new URLSearchParams({
      shipId,
      year: year.toString(),
    });
    return this.request<ComplianceBalance>(`/compliance/cb?${params}`);
  }

  async getAdjustedComplianceBalance(
    shipId: string,
    year: number
  ): Promise<AdjustedComplianceBalance> {
    const params = new URLSearchParams({
      shipId,
      year: year.toString(),
    });
    return this.request<AdjustedComplianceBalance>(
      `/compliance/adjusted-cb?${params}`
    );
  }

  // Banking endpoints
  async getBankingRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const params = new URLSearchParams({
      shipId,
      year: year.toString(),
    });
    return this.request<BankEntry[]>(`/banking/records?${params}`);
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<void> {
    await this.request<void>('/banking/bank', {
      method: 'POST',
      body: JSON.stringify({ shipId, year, amount }),
    });
  }

  async applyBanked(shipId: string, year: number, amount: number): Promise<void> {
    await this.request<void>('/banking/apply', {
      method: 'POST',
      body: JSON.stringify({ shipId, year, amount }),
    });
  }

  // Pools endpoints
  async createPool(payload: CreatePoolPayload): Promise<Pool> {
    return this.request<Pool>('/pools', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

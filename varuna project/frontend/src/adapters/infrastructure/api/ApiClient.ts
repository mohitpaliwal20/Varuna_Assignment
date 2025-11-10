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
    const routes = await this.request<any[]>('/routes');
    // Convert string numbers to actual numbers
    return routes.map(route => ({
      ...route,
      ghgIntensity: parseFloat(route.ghgIntensity),
      fuelConsumption: parseFloat(route.fuelConsumption),
      distance: parseFloat(route.distance),
      totalEmissions: parseFloat(route.totalEmissions)
    }));
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.request<void>(`/routes/${routeId}/baseline`, {
      method: 'POST',
    });
  }

  async getComparison(): Promise<RouteComparisonData> {
    const data = await this.request<any>('/routes/comparison');
    
    // API returns { baseline, comparisons: [] }
    // We need to return the first comparison in the expected format
    if (!data.comparisons || data.comparisons.length === 0) {
      throw new ApiError('No comparison data available', 404);
    }
    
    const firstComparison = data.comparisons[0];
    
    // Convert string numbers to actual numbers and return in expected format
    return {
      baseline: {
        routeId: firstComparison.baseline.routeId,
        ghgIntensity: parseFloat(firstComparison.baseline.ghgIntensity)
      },
      comparison: {
        routeId: firstComparison.comparison.routeId,
        ghgIntensity: parseFloat(firstComparison.comparison.ghgIntensity)
      },
      percentDiff: firstComparison.percentDiff,
      compliant: firstComparison.compliant
    };
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
    const data = await this.request<any>(`/compliance/cb?${params}`);
    // Convert string numbers to actual numbers
    return {
      ...data,
      cbGco2eq: parseFloat(data.cbGco2eq)
    };
  }

  async getAdjustedComplianceBalance(
    shipId: string,
    year: number
  ): Promise<AdjustedComplianceBalance> {
    const params = new URLSearchParams({
      shipId,
      year: year.toString(),
    });
    const data = await this.request<any>(`/compliance/adjusted-cb?${params}`);
    // Convert string numbers to actual numbers
    return {
      ...data,
      adjustedCbGco2eq: parseFloat(data.adjustedCbGco2eq)
    };
  }

  // Banking endpoints
  async getBankingRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const params = new URLSearchParams({
      shipId,
      year: year.toString(),
    });
    const records = await this.request<any[]>(`/banking/records?${params}`);
    // Convert string numbers to actual numbers
    return records.map(record => ({
      ...record,
      amountGco2eq: parseFloat(record.amountGco2eq)
    }));
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
    // Transform payload to match backend API expectations
    const backendPayload = {
      year: payload.year,
      shipIds: payload.memberShipIds  // Backend expects 'shipIds', not 'memberShipIds'
    };
    
    return this.request<Pool>('/pools', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  }
}

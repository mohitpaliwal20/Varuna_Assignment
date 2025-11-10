import { Route, ComplianceBalance, BankEntry, Pool } from '../../domain';

export interface RouteComparisonData {
  baseline: {
    routeId: string;
    ghgIntensity: number;
  };
  comparison: {
    routeId: string;
    ghgIntensity: number;
  };
  percentDiff: number;
  compliant: boolean;
}

export interface BankingRecord {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  transactionType: 'BANK' | 'APPLY';
  createdAt: string;
}

export interface AdjustedComplianceBalance {
  shipId: string;
  year: number;
  adjustedCbGco2eq: number;
}

export interface CreatePoolPayload {
  year: number;
  memberShipIds: string[];
}

export interface IApiClient {
  // Routes endpoints
  fetchRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<RouteComparisonData>;

  // Compliance endpoints
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance>;

  // Banking endpoints
  getBankingRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<void>;
  applyBanked(shipId: string, year: number, amount: number): Promise<void>;

  // Pools endpoints
  createPool(payload: CreatePoolPayload): Promise<Pool>;
}

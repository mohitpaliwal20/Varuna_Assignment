export interface ApplyBankedRequest {
  shipId: string;
  year: number;
  amount: number;
}

export interface ApplyBankedResponse {
  success: boolean;
  message?: string;
}

export interface IApplyBanked {
  execute(request: ApplyBankedRequest): Promise<ApplyBankedResponse>;
}

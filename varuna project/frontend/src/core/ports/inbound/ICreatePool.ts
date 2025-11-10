import { Pool } from '../../domain';

export interface CreatePoolRequest {
  year: number;
  memberShipIds: string[];
}

export interface CreatePoolResponse {
  pool: Pool;
  success: boolean;
  message?: string;
}

export interface ICreatePool {
  execute(request: CreatePoolRequest): Promise<CreatePoolResponse>;
}

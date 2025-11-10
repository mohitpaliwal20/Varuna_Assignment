import { ICreatePool, CreatePoolRequest, CreatePoolResponse } from '../../ports/inbound';
import { IApiClient } from '../../ports/outbound';
import { PoolEntity } from '../../domain';

export class CreatePool implements ICreatePool {
  constructor(private apiClient: IApiClient) {}

  async execute(request: CreatePoolRequest): Promise<CreatePoolResponse> {
    try {
      // Validate request
      if (!request.year || request.year < 2024) {
        return {
          pool: {} as any,
          success: false,
          message: 'Invalid year provided'
        };
      }

      if (!request.memberShipIds || request.memberShipIds.length < 2) {
        return {
          pool: {} as any,
          success: false,
          message: 'Pool must have at least 2 members'
        };
      }

      // Call API to create pool
      const pool = await this.apiClient.createPool({
        year: request.year,
        memberShipIds: request.memberShipIds
      });

      // Validate pool constraints using domain entity
      const poolEntity = PoolEntity.fromData(pool);
      
      if (!poolEntity.validateAllConstraints()) {
        return {
          pool,
          success: false,
          message: 'Pool validation failed: constraints not met'
        };
      }

      return {
        pool,
        success: true,
        message: 'Pool created successfully'
      };
    } catch (error) {
      return {
        pool: {} as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create pool'
      };
    }
  }
}

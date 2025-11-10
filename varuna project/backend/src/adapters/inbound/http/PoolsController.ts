import { Request, Response } from 'express';
import { CreatePool } from '../../../core/application/CreatePool';
import { z } from 'zod';

// Validation schema
const CreatePoolSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  shipIds: z.array(z.string().min(1)).min(1, 'Pool must have at least one ship')
});

export class PoolsController {
  constructor(
    private readonly createPoolUseCase: CreatePool
  ) {}

  /**
   * POST /pools
   * Create new pool with members and allocation
   */
  async createPool(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validation = CreatePoolSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: validation.error.errors
        });
        return;
      }

      const { year, shipIds } = validation.data;

      // Execute create pool use case
      const result = await this.createPoolUseCase.execute({ year, shipIds });

      res.status(201).json({
        message: 'Pool created successfully',
        pool: {
          id: result.pool.id,
          year: result.pool.year,
          members: result.pool.members,
          createdAt: result.pool.createdAt
        },
        totalCbBefore: result.totalCbBefore,
        totalCbAfter: result.totalCbAfter
      });
    } catch (error: any) {
      console.error('Error creating pool:', error);
      
      // Handle business rule violations (pool constraints)
      if (error.message.includes('must be non-negative') ||
          error.message.includes('cannot exit worse') ||
          error.message.includes('cannot exit negative') ||
          error.message.includes('must have at least one ship') ||
          error.message.includes('All ship IDs must be valid')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message
        });
        return;
      }

      // Handle validation errors
      if (error.message.includes('Year must be') ||
          error.message.includes('is required')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create pool'
      });
    }
  }
}

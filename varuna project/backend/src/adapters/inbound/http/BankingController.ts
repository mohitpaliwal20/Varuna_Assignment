import { Request, Response } from 'express';
import { BankRepository } from '../../../core/ports/outbound/BankRepository';
import { BankSurplus } from '../../../core/application/BankSurplus';
import { ApplyBanked } from '../../../core/application/ApplyBanked';
import { z } from 'zod';

// Validation schemas
const BankSurplusSchema = z.object({
  shipId: z.string().min(1, 'Ship ID is required'),
  year: z.number().int().min(2000).max(2100),
  amount: z.number().positive('Amount must be positive')
});

const ApplyBankedSchema = z.object({
  shipId: z.string().min(1, 'Ship ID is required'),
  year: z.number().int().min(2000).max(2100),
  amount: z.number().positive('Amount must be positive')
});

export class BankingController {
  constructor(
    private readonly bankRepository: BankRepository,
    private readonly bankSurplus: BankSurplus,
    private readonly applyBanked: ApplyBanked
  ) {}

  /**
   * GET /banking/records?shipId&year
   * Fetch banking records for a ship
   */
  async getBankingRecords(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;

      // Validate query parameters
      if (!shipId || typeof shipId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'shipId query parameter is required'
        });
        return;
      }

      if (!year || typeof year !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'year query parameter is required'
        });
        return;
      }

      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'year must be a valid number'
        });
        return;
      }

      // Get banking records
      const records = await this.bankRepository.findByShipAndYear(shipId, yearNum);

      // Get available balance
      const availableBalance = await this.bankRepository.getAvailableBalance(shipId, yearNum);

      res.json({
        shipId,
        year: yearNum,
        records,
        availableBalance
      });
    } catch (error) {
      console.error('Error getting banking records:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get banking records'
      });
    }
  }

  /**
   * POST /banking/bank
   * Bank positive compliance balance
   */
  async bankBalance(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validation = BankSurplusSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: validation.error.errors
        });
        return;
      }

      const { shipId, year, amount } = validation.data;

      // Execute bank surplus use case
      const result = await this.bankSurplus.execute({ shipId, year, amount });

      res.status(201).json({
        message: 'Balance banked successfully',
        bankEntry: {
          id: result.bankEntry.id,
          shipId: result.bankEntry.shipId,
          year: result.bankEntry.year,
          amountGco2eq: result.bankEntry.amountGco2eq,
          transactionType: result.bankEntry.transactionType,
          createdAt: result.bankEntry.createdAt
        },
        availableCB: result.availableCB,
        remainingCB: result.remainingCB
      });
    } catch (error: any) {
      console.error('Error banking balance:', error);
      
      // Handle business rule violations
      if (error.message.includes('Cannot bank') || 
          error.message.includes('exceeds available') ||
          error.message.includes('must be positive')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message
        });
        return;
      }

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to bank balance'
      });
    }
  }

  /**
   * POST /banking/apply
   * Apply banked surplus to deficit
   */
  async applyBankedBalance(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validation = ApplyBankedSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: validation.error.errors
        });
        return;
      }

      const { shipId, year, amount } = validation.data;

      // Execute apply banked use case
      const result = await this.applyBanked.execute({ shipId, year, amount });

      res.status(200).json({
        message: 'Banked balance applied successfully',
        bankEntry: {
          id: result.bankEntry.id,
          shipId: result.bankEntry.shipId,
          year: result.bankEntry.year,
          amountGco2eq: result.bankEntry.amountGco2eq,
          transactionType: result.bankEntry.transactionType,
          createdAt: result.bankEntry.createdAt
        },
        availableBanked: result.availableBanked,
        remainingBanked: result.remainingBanked,
        cbBefore: result.cbBefore,
        cbAfter: result.cbAfter
      });
    } catch (error: any) {
      console.error('Error applying banked balance:', error);
      
      // Handle business rule violations
      if (error.message.includes('exceeds available') ||
          error.message.includes('must be positive')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message
        });
        return;
      }

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to apply banked balance'
      });
    }
  }
}

import pool from '../../../infrastructure/db/connection';
import { BankRepository, BankEntry } from '../../../core/ports/outbound/BankRepository';

export class BankRepositoryImpl implements BankRepository {
  async save(entry: BankEntry): Promise<BankEntry> {
    try {
      const result = await pool.query(
        `INSERT INTO bank_entries (ship_id, year, amount_gco2eq, transaction_type, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING 
          id, 
          ship_id as "shipId", 
          year, 
          amount_gco2eq as "amountGco2eq", 
          transaction_type as "transactionType", 
          created_at as "createdAt"`,
        [entry.shipId, entry.year, entry.amountGco2eq, entry.transactionType]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error saving bank entry:', error);
      throw new Error('Failed to save bank entry');
    }
  }

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          ship_id as "shipId", 
          year, 
          amount_gco2eq as "amountGco2eq", 
          transaction_type as "transactionType", 
          created_at as "createdAt"
        FROM bank_entries
        WHERE ship_id = $1 AND year = $2
        ORDER BY created_at DESC`,
        [shipId, year]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching bank entries:', error);
      throw new Error('Failed to fetch bank entries');
    }
  }

  async getAvailableBalance(shipId: string, year: number): Promise<number> {
    try {
      // Calculate available banked balance
      // BANK transactions add to the banked balance (positive)
      // APPLY transactions reduce the banked balance (negative)
      const result = await pool.query(
        `SELECT 
          SUM(CASE 
            WHEN transaction_type = 'BANK' THEN amount_gco2eq
            WHEN transaction_type = 'APPLY' THEN -amount_gco2eq
            ELSE 0
          END) as available_balance
        FROM bank_entries
        WHERE ship_id = $1 AND year = $2`,
        [shipId, year]
      );

      return parseFloat(result.rows[0].available_balance || 0);
    } catch (error) {
      console.error('Error calculating available balance:', error);
      throw new Error('Failed to calculate available balance');
    }
  }
}

import pool from '../../../infrastructure/db/connection';
import { ComplianceRepository, ComplianceBalance } from '../../../core/ports/outbound/ComplianceRepository';

export class ComplianceRepositoryImpl implements ComplianceRepository {
  async save(compliance: ComplianceBalance): Promise<ComplianceBalance> {
    try {
      const result = await pool.query(
        `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq, computed_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (ship_id, year) 
        DO UPDATE SET 
          cb_gco2eq = EXCLUDED.cb_gco2eq,
          computed_at = CURRENT_TIMESTAMP
        RETURNING 
          id, 
          ship_id as "shipId", 
          year, 
          cb_gco2eq as "cbGco2eq", 
          computed_at as "computedAt"`,
        [compliance.shipId, compliance.year, compliance.cbGco2eq]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error saving compliance balance:', error);
      throw new Error('Failed to save compliance balance');
    }
  }

  async findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null> {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          ship_id as "shipId", 
          year, 
          cb_gco2eq as "cbGco2eq", 
          computed_at as "computedAt"
        FROM ship_compliance
        WHERE ship_id = $1 AND year = $2`,
        [shipId, year]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching compliance balance:', error);
      throw new Error('Failed to fetch compliance balance');
    }
  }

  async findAdjustedCB(shipId: string, year: number): Promise<number> {
    try {
      // Get the original compliance balance
      const complianceResult = await pool.query(
        `SELECT cb_gco2eq FROM ship_compliance WHERE ship_id = $1 AND year = $2`,
        [shipId, year]
      );

      if (complianceResult.rows.length === 0) {
        return 0;
      }

      const originalCB = parseFloat(complianceResult.rows[0].cb_gco2eq);

      // Calculate the net effect of banking transactions
      // BANK transactions reduce available CB (negative impact)
      // APPLY transactions increase available CB (positive impact)
      const bankingResult = await pool.query(
        `SELECT 
          SUM(CASE 
            WHEN transaction_type = 'BANK' THEN -amount_gco2eq
            WHEN transaction_type = 'APPLY' THEN amount_gco2eq
            ELSE 0
          END) as net_adjustment
        FROM bank_entries
        WHERE ship_id = $1 AND year = $2`,
        [shipId, year]
      );

      const netAdjustment = parseFloat(bankingResult.rows[0].net_adjustment || 0);
      
      return originalCB + netAdjustment;
    } catch (error) {
      console.error('Error calculating adjusted CB:', error);
      throw new Error('Failed to calculate adjusted CB');
    }
  }
}

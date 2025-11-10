import pool from '../../../infrastructure/db/connection';
import { PoolRepository, Pool, PoolMember } from '../../../core/ports/outbound/PoolRepository';

export class PoolRepositoryImpl implements PoolRepository {
  async createPool(year: number, members: PoolMember[]): Promise<Pool> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create the pool
      const poolResult = await client.query(
        `INSERT INTO pools (year, created_at)
        VALUES ($1, CURRENT_TIMESTAMP)
        RETURNING id, year, created_at as "createdAt"`,
        [year]
      );

      const poolId = poolResult.rows[0].id;

      // Insert all pool members
      for (const member of members) {
        await client.query(
          `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after, created_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [poolId, member.shipId, member.cbBefore, member.cbAfter]
        );
      }

      await client.query('COMMIT');

      return {
        id: poolResult.rows[0].id,
        year: poolResult.rows[0].year,
        members,
        createdAt: poolResult.rows[0].createdAt,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating pool:', error);
      throw new Error('Failed to create pool');
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Pool | null> {
    try {
      // Get pool details
      const poolResult = await pool.query(
        `SELECT id, year, created_at as "createdAt"
        FROM pools
        WHERE id = $1`,
        [id]
      );

      if (poolResult.rows.length === 0) {
        return null;
      }

      // Get pool members
      const membersResult = await pool.query(
        `SELECT 
          ship_id as "shipId", 
          cb_before as "cbBefore", 
          cb_after as "cbAfter"
        FROM pool_members
        WHERE pool_id = $1
        ORDER BY ship_id`,
        [id]
      );

      return {
        id: poolResult.rows[0].id,
        year: poolResult.rows[0].year,
        members: membersResult.rows,
        createdAt: poolResult.rows[0].createdAt,
      };
    } catch (error) {
      console.error('Error fetching pool by id:', error);
      throw new Error('Failed to fetch pool');
    }
  }

  async findByYear(year: number): Promise<Pool[]> {
    try {
      // Get all pools for the year
      const poolsResult = await pool.query(
        `SELECT id, year, created_at as "createdAt"
        FROM pools
        WHERE year = $1
        ORDER BY created_at DESC`,
        [year]
      );

      // For each pool, get its members
      const pools: Pool[] = [];
      for (const poolRow of poolsResult.rows) {
        const membersResult = await pool.query(
          `SELECT 
            ship_id as "shipId", 
            cb_before as "cbBefore", 
            cb_after as "cbAfter"
          FROM pool_members
          WHERE pool_id = $1
          ORDER BY ship_id`,
          [poolRow.id]
        );

        pools.push({
          id: poolRow.id,
          year: poolRow.year,
          members: membersResult.rows,
          createdAt: poolRow.createdAt,
        });
      }

      return pools;
    } catch (error) {
      console.error('Error fetching pools by year:', error);
      throw new Error('Failed to fetch pools');
    }
  }
}

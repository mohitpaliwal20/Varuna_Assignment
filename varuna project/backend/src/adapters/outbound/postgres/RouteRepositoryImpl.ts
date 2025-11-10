import pool from '../../../infrastructure/db/connection';
import { RouteRepository, Route } from '../../../core/ports/outbound/RouteRepository';

export class RouteRepositoryImpl implements RouteRepository {
  async findAll(): Promise<Route[]> {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          route_id as "routeId", 
          vessel_type as "vesselType", 
          fuel_type as "fuelType", 
          year, 
          ghg_intensity as "ghgIntensity", 
          fuel_consumption as "fuelConsumption", 
          distance, 
          total_emissions as "totalEmissions", 
          is_baseline as "isBaseline",
          created_at as "createdAt"
        FROM routes
        ORDER BY route_id`
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching all routes:', error);
      throw new Error('Failed to fetch routes');
    }
  }

  async findById(id: number): Promise<Route | null> {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          route_id as "routeId", 
          vessel_type as "vesselType", 
          fuel_type as "fuelType", 
          year, 
          ghg_intensity as "ghgIntensity", 
          fuel_consumption as "fuelConsumption", 
          distance, 
          total_emissions as "totalEmissions", 
          is_baseline as "isBaseline",
          created_at as "createdAt"
        FROM routes
        WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching route by id:', error);
      throw new Error('Failed to fetch route');
    }
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          route_id as "routeId", 
          vessel_type as "vesselType", 
          fuel_type as "fuelType", 
          year, 
          ghg_intensity as "ghgIntensity", 
          fuel_consumption as "fuelConsumption", 
          distance, 
          total_emissions as "totalEmissions", 
          is_baseline as "isBaseline",
          created_at as "createdAt"
        FROM routes
        WHERE route_id = $1`,
        [routeId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching route by routeId:', error);
      throw new Error('Failed to fetch route');
    }
  }

  async setBaseline(routeId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // First, unset all baselines
      await client.query('UPDATE routes SET is_baseline = false');
      
      // Then set the specified route as baseline
      const result = await client.query(
        'UPDATE routes SET is_baseline = true WHERE route_id = $1',
        [routeId]
      );
      
      if (result.rowCount === 0) {
        throw new Error(`Route with routeId ${routeId} not found`);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting baseline:', error);
      throw new Error('Failed to set baseline');
    } finally {
      client.release();
    }
  }

  async findBaseline(): Promise<Route | null> {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          route_id as "routeId", 
          vessel_type as "vesselType", 
          fuel_type as "fuelType", 
          year, 
          ghg_intensity as "ghgIntensity", 
          fuel_consumption as "fuelConsumption", 
          distance, 
          total_emissions as "totalEmissions", 
          is_baseline as "isBaseline",
          created_at as "createdAt"
        FROM routes
        WHERE is_baseline = true
        LIMIT 1`
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching baseline route:', error);
      throw new Error('Failed to fetch baseline route');
    }
  }

  async findComparison(comparisonRouteId: string): Promise<{ baseline: Route; comparison: Route } | null> {
    try {
      const baseline = await this.findBaseline();
      if (!baseline) {
        return null;
      }

      const comparison = await this.findByRouteId(comparisonRouteId);
      if (!comparison) {
        return null;
      }

      return { baseline, comparison };
    } catch (error) {
      console.error('Error fetching comparison:', error);
      throw new Error('Failed to fetch comparison');
    }
  }
}

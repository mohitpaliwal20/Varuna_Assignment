import { Request, Response } from 'express';
import { ComplianceRepository } from '../../../core/ports/outbound/ComplianceRepository';
import { RouteRepository } from '../../../core/ports/outbound/RouteRepository';
import { ComputeCB } from '../../../core/application/ComputeCB';

export class ComplianceController {
  constructor(
    private readonly complianceRepository: ComplianceRepository,
    private readonly routeRepository: RouteRepository,
    private readonly computeCB: ComputeCB
  ) {}

  /**
   * GET /compliance/cb?shipId&year
   * Compute and return compliance balance for a ship
   */
  async getComplianceBalance(req: Request, res: Response): Promise<void> {
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

      // Check if compliance balance already exists
      let compliance = await this.complianceRepository.findByShipAndYear(shipId, yearNum);

      if (!compliance) {
        // Need to compute CB - find route data for this ship
        // For this implementation, we'll use routeId as shipId
        const route = await this.routeRepository.findByRouteId(shipId);
        
        if (!route) {
          res.status(404).json({
            error: 'Not Found',
            message: `No route data found for ship ${shipId}`
          });
          return;
        }

        // Compute CB
        const result = this.computeCB.execute({
          shipId,
          year: yearNum,
          actualIntensity: route.ghgIntensity,
          fuelConsumption: route.fuelConsumption
        });

        // Save computed CB
        compliance = await this.complianceRepository.save({
          shipId: result.complianceBalance.shipId,
          year: result.complianceBalance.year,
          cbGco2eq: result.complianceBalance.cbGco2eq,
          computedAt: result.complianceBalance.computedAt
        });
      }

      res.json({
        shipId: compliance.shipId,
        year: compliance.year,
        cbGco2eq: compliance.cbGco2eq,
        status: compliance.cbGco2eq > 0 ? 'SURPLUS' : compliance.cbGco2eq < 0 ? 'DEFICIT' : 'NEUTRAL',
        computedAt: compliance.computedAt
      });
    } catch (error) {
      console.error('Error getting compliance balance:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get compliance balance'
      });
    }
  }

  /**
   * GET /compliance/adjusted-cb?shipId&year
   * Return CB after bank applications
   */
  async getAdjustedComplianceBalance(req: Request, res: Response): Promise<void> {
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

      // Get adjusted CB (CB after bank applications)
      const adjustedCB = await this.complianceRepository.findAdjustedCB(shipId, yearNum);

      res.json({
        shipId,
        year: yearNum,
        adjustedCbGco2eq: adjustedCB,
        status: adjustedCB > 0 ? 'SURPLUS' : adjustedCB < 0 ? 'DEFICIT' : 'NEUTRAL'
      });
    } catch (error) {
      console.error('Error getting adjusted compliance balance:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get adjusted compliance balance'
      });
    }
  }
}

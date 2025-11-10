import { Request, Response } from 'express';
import { RouteRepository } from '../../../core/ports/outbound/RouteRepository';
import { ComputeComparison } from '../../../core/application/ComputeComparison';
import { Route as DomainRoute } from '../../../core/domain/Route';

export class RoutesController {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly computeComparison: ComputeComparison
  ) {}

  /**
   * GET /routes
   * Fetch all routes
   */
  async getRoutes(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.routeRepository.findAll();
      res.json(routes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch routes'
      });
    }
  }

  /**
   * POST /routes/:id/baseline
   * Set a route as baseline
   */
  async setBaseline(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Find the route by ID
      const route = await this.routeRepository.findById(parseInt(id, 10));
      
      if (!route) {
        res.status(404).json({
          error: 'Not Found',
          message: `Route with ID ${id} not found`
        });
        return;
      }

      // Set as baseline using routeId
      await this.routeRepository.setBaseline(route.routeId);

      res.json({
        message: 'Baseline set successfully',
        routeId: route.routeId
      });
    } catch (error) {
      console.error('Error setting baseline:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to set baseline'
      });
    }
  }

  /**
   * GET /routes/comparison
   * Get baseline vs comparison data with percentDiff and compliant flags
   * Query params: comparisonRouteId (optional, if not provided returns all routes compared to baseline)
   */
  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const { comparisonRouteId } = req.query;

      // Get baseline route
      const baseline = await this.routeRepository.findBaseline();
      
      if (!baseline) {
        res.status(404).json({
          error: 'Not Found',
          message: 'No baseline route set'
        });
        return;
      }

      // Convert to domain entity
      const baselineDomain = DomainRoute.fromData(baseline);

      if (comparisonRouteId) {
        // Single comparison
        const comparison = await this.routeRepository.findByRouteId(comparisonRouteId as string);
        
        if (!comparison) {
          res.status(404).json({
            error: 'Not Found',
            message: `Comparison route ${comparisonRouteId} not found`
          });
          return;
        }

        const comparisonDomain = DomainRoute.fromData(comparison);
        const result = this.computeComparison.execute(baselineDomain, comparisonDomain);
        
        res.json(result);
      } else {
        // Compare all routes against baseline
        const allRoutes = await this.routeRepository.findAll();
        const comparisonRoutes = allRoutes.filter(r => r.routeId !== baseline.routeId);
        
        if (comparisonRoutes.length === 0) {
          res.json({
            baseline: {
              routeId: baseline.routeId,
              ghgIntensity: baseline.ghgIntensity
            },
            comparisons: []
          });
          return;
        }

        const comparisonDomains = comparisonRoutes.map(r => DomainRoute.fromData(r));
        const results = this.computeComparison.executeMultiple(baselineDomain, comparisonDomains);
        
        res.json({
          baseline: {
            routeId: baseline.routeId,
            ghgIntensity: baseline.ghgIntensity
          },
          comparisons: results
        });
      }
    } catch (error) {
      console.error('Error getting comparison:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get comparison data'
      });
    }
  }
}

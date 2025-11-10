import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { RoutesController } from '../../adapters/inbound/http/RoutesController';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/BankingController';
import { PoolsController } from '../../adapters/inbound/http/PoolsController';

interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

export function createApp(
  routesController: RoutesController,
  complianceController: ComplianceController,
  bankingController: BankingController,
  poolsController: PoolsController
): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes endpoints
  app.get('/routes', (req, res) => routesController.getRoutes(req, res));
  app.post('/routes/:id/baseline', (req, res) => routesController.setBaseline(req, res));
  app.get('/routes/comparison', (req, res) => routesController.getComparison(req, res));

  // Compliance endpoints
  app.get('/compliance/cb', (req, res) => complianceController.getComplianceBalance(req, res));
  app.get('/compliance/adjusted-cb', (req, res) => complianceController.getAdjustedComplianceBalance(req, res));

  // Banking endpoints
  app.get('/banking/records', (req, res) => bankingController.getBankingRecords(req, res));
  app.post('/banking/bank', (req, res) => bankingController.bankBalance(req, res));
  app.post('/banking/apply', (req, res) => bankingController.applyBankedBalance(req, res));

  // Pools endpoints
  app.post('/pools', (req, res) => poolsController.createPool(req, res));

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`
    });
  });

  // Global error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred'
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = err.stack;
    }

    res.status(500).json(errorResponse);
  });

  return app;
}

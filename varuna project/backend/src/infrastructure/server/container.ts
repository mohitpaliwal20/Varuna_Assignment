import pool from '../db/connection';

// Repository implementations
import {
  RouteRepositoryImpl,
  ComplianceRepositoryImpl,
  BankRepositoryImpl,
  PoolRepositoryImpl
} from '../../adapters/outbound/postgres';

// Use cases
import {
  ComputeCB,
  ComputeComparison,
  BankSurplus,
  ApplyBanked,
  CreatePool
} from '../../core/application';

// Controllers
import { RoutesController } from '../../adapters/inbound/http/RoutesController';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/BankingController';
import { PoolsController } from '../../adapters/inbound/http/PoolsController';

/**
 * Dependency Injection Container
 * Wires up all dependencies following hexagonal architecture principles
 */
export class Container {
  // Repositories (Outbound Adapters)
  private routeRepository: RouteRepositoryImpl;
  private complianceRepository: ComplianceRepositoryImpl;
  private bankRepository: BankRepositoryImpl;
  private poolRepository: PoolRepositoryImpl;

  // Use Cases (Application Layer)
  private computeCB: ComputeCB;
  private computeComparison: ComputeComparison;
  private bankSurplus: BankSurplus;
  private applyBanked: ApplyBanked;
  private createPool: CreatePool;

  // Controllers (Inbound Adapters)
  private routesController: RoutesController;
  private complianceController: ComplianceController;
  private bankingController: BankingController;
  private poolsController: PoolsController;

  constructor() {
    // Initialize repositories
    this.routeRepository = new RouteRepositoryImpl();
    this.complianceRepository = new ComplianceRepositoryImpl();
    this.bankRepository = new BankRepositoryImpl();
    this.poolRepository = new PoolRepositoryImpl();

    // Initialize use cases with repository dependencies
    this.computeCB = new ComputeCB();
    this.computeComparison = new ComputeComparison();
    this.bankSurplus = new BankSurplus(
      this.complianceRepository,
      this.bankRepository
    );
    this.applyBanked = new ApplyBanked(
      this.complianceRepository,
      this.bankRepository
    );
    this.createPool = new CreatePool(
      this.complianceRepository,
      this.poolRepository
    );

    // Initialize controllers with use case dependencies
    this.routesController = new RoutesController(
      this.routeRepository,
      this.computeComparison
    );
    this.complianceController = new ComplianceController(
      this.complianceRepository,
      this.routeRepository,
      this.computeCB
    );
    this.bankingController = new BankingController(
      this.bankRepository,
      this.bankSurplus,
      this.applyBanked
    );
    this.poolsController = new PoolsController(
      this.createPool
    );
  }

  // Getters for controllers
  getRoutesController(): RoutesController {
    return this.routesController;
  }

  getComplianceController(): ComplianceController {
    return this.complianceController;
  }

  getBankingController(): BankingController {
    return this.bankingController;
  }

  getPoolsController(): PoolsController {
    return this.poolsController;
  }

  // Cleanup method for graceful shutdown
  async cleanup(): Promise<void> {
    await pool.end();
    console.log('Database connection pool closed');
  }
}

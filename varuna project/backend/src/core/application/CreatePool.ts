import { Pool, PoolMember } from '../domain/Pool';
import { PoolRepository } from '../ports/outbound/PoolRepository';
import { ComplianceRepository } from '../ports/outbound/ComplianceRepository';

export interface CreatePoolInput {
  year: number;
  shipIds: string[];
}

export interface CreatePoolOutput {
  pool: Pool;
  totalCbBefore: number;
  totalCbAfter: number;
}

/**
 * CreatePool use case - Creates a pool with greedy allocation algorithm
 * 
 * Requirements:
 * - Sort members descending by compliance balance
 * - Transfer surplus to deficits using greedy algorithm
 * - Validate sum(adjustedCB) ≥ 0
 * - Enforce deficit ship cannot exit worse constraint
 * - Enforce surplus ship cannot exit negative constraint
 * - Create pool and pool_members records
 */
export class CreatePool {
  constructor(
    private readonly complianceRepository: ComplianceRepository,
    private readonly poolRepository: PoolRepository
  ) {}

  async execute(input: CreatePoolInput): Promise<CreatePoolOutput> {
    // Validate input
    if (input.year < 2000 || input.year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (!input.shipIds || input.shipIds.length === 0) {
      throw new Error('Pool must have at least one ship');
    }
    if (input.shipIds.some(id => !id || id.trim() === '')) {
      throw new Error('All ship IDs must be valid');
    }

    // Fetch adjusted compliance balances for all ships
    const shipBalances: Array<{ shipId: string; cbBefore: number }> = [];
    
    for (const shipId of input.shipIds) {
      const adjustedCB = await this.complianceRepository.findAdjustedCB(shipId, input.year);
      shipBalances.push({ shipId, cbBefore: adjustedCB });
    }

    // Validate sum(adjustedCB) ≥ 0
    const totalCbBefore = shipBalances.reduce((sum, ship) => sum + ship.cbBefore, 0);
    if (totalCbBefore < 0) {
      throw new Error(`Pool total compliance balance (${totalCbBefore}) must be non-negative`);
    }

    // Apply greedy allocation algorithm
    const members = this.applyGreedyAllocation(shipBalances);

    // Create pool using repository
    const poolData = await this.poolRepository.createPool(input.year, members);
    
    // Create Pool domain entity (this will validate all constraints)
    const pool = Pool.fromData(poolData);

    const totalCbAfter = pool.getTotalCbAfter();

    return {
      pool,
      totalCbBefore,
      totalCbAfter
    };
  }

  /**
   * Greedy allocation algorithm:
   * 1. Sort members descending by compliance balance (surplus first)
   * 2. Transfer surplus to deficits
   * 3. Ensure constraints are met
   */
  private applyGreedyAllocation(
    shipBalances: Array<{ shipId: string; cbBefore: number }>
  ): PoolMember[] {
    // Sort descending by CB (surplus ships first, then deficit ships)
    const sorted = [...shipBalances].sort((a, b) => b.cbBefore - a.cbBefore);

    // Initialize members with cbAfter = cbBefore
    const members: PoolMember[] = sorted.map(ship => ({
      shipId: ship.shipId,
      cbBefore: ship.cbBefore,
      cbAfter: ship.cbBefore
    }));

    // Separate surplus and deficit ships
    const surplusIndices: number[] = [];
    const deficitIndices: number[] = [];

    members.forEach((member, index) => {
      if (member.cbBefore > 0) {
        surplusIndices.push(index);
      } else if (member.cbBefore < 0) {
        deficitIndices.push(index);
      }
    });

    // Greedy transfer: iterate through deficits and fill from surplus
    for (const deficitIdx of deficitIndices) {
      const deficit = members[deficitIdx];

      for (const surplusIdx of surplusIndices) {
        const surplus = members[surplusIdx];
        
        if (surplus.cbAfter <= 0) {
          // This surplus ship has no more to give
          continue;
        }

        // Calculate how much can be transferred
        // Cannot make deficit worse, cannot make surplus negative
        const availableFromSurplus = surplus.cbAfter;
        const stillNeeded = Math.abs(deficit.cbAfter);
        const transferAmount = Math.min(availableFromSurplus, stillNeeded);

        // Transfer
        surplus.cbAfter -= transferAmount;
        deficit.cbAfter += transferAmount;

        // If deficit is fully covered, move to next deficit
        if (deficit.cbAfter >= 0) {
          break;
        }
      }
    }

    return members;
  }
}

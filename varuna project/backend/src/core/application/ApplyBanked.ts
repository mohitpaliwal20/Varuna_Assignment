import { BankEntry } from '../domain/BankEntry';
import { ComplianceBalance } from '../domain/ComplianceBalance';
import { BankRepository } from '../ports/outbound/BankRepository';
import { ComplianceRepository } from '../ports/outbound/ComplianceRepository';

export interface ApplyBankedInput {
  shipId: string;
  year: number;
  amount: number;
}

export interface ApplyBankedOutput {
  bankEntry: BankEntry;
  availableBanked: number;
  remainingBanked: number;
  cbBefore: number;
  cbAfter: number;
  updatedCompliance: ComplianceBalance;
}

/**
 * ApplyBanked use case - Applies banked surplus to current deficit
 * 
 * Requirements:
 * - Amount must be positive
 * - Amount must be ≤ available banked balance
 * - Creates bank entry record with transaction type 'APPLY'
 * - Updates compliance balance
 */
export class ApplyBanked {
  constructor(
    private readonly complianceRepository: ComplianceRepository,
    private readonly bankRepository: BankRepository
  ) {}

  async execute(input: ApplyBankedInput): Promise<ApplyBankedOutput> {
    // Validate input
    if (!input.shipId || input.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }
    if (input.year < 2000 || input.year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (input.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Get available banked balance
    const availableBanked = await this.bankRepository.getAvailableBalance(
      input.shipId,
      input.year
    );

    // Validate amount ≤ available banked balance
    if (input.amount > availableBanked) {
      throw new Error(`Amount ${input.amount} exceeds available banked balance ${availableBanked}`);
    }

    // Get current compliance balance
    const compliance = await this.complianceRepository.findByShipAndYear(
      input.shipId,
      input.year
    );

    if (!compliance) {
      throw new Error(`No compliance balance found for ship ${input.shipId} in year ${input.year}`);
    }

    const cbBefore = compliance.cbGco2eq;

    // Create bank entry with transaction type 'APPLY'
    const bankEntry = new BankEntry(
      input.shipId,
      input.year,
      input.amount,
      'APPLY',
      new Date()
    );

    // Save bank entry
    const savedEntry = await this.bankRepository.save({
      shipId: bankEntry.shipId,
      year: bankEntry.year,
      amountGco2eq: bankEntry.amountGco2eq,
      transactionType: bankEntry.transactionType,
      createdAt: bankEntry.createdAt
    });

    // Update compliance balance (add the banked amount to current CB)
    const cbAfter = cbBefore + input.amount;
    const updatedComplianceData = {
      ...compliance,
      cbGco2eq: cbAfter,
      computedAt: new Date()
    };

    const savedCompliance = await this.complianceRepository.save(updatedComplianceData);

    return {
      bankEntry: BankEntry.fromData(savedEntry),
      availableBanked,
      remainingBanked: availableBanked - input.amount,
      cbBefore,
      cbAfter,
      updatedCompliance: ComplianceBalance.fromData(savedCompliance)
    };
  }
}

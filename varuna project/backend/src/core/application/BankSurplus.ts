import { BankEntry } from '../domain/BankEntry';
import { BankRepository } from '../ports/outbound/BankRepository';
import { ComplianceRepository } from '../ports/outbound/ComplianceRepository';

export interface BankSurplusInput {
  shipId: string;
  year: number;
  amount: number;
}

export interface BankSurplusOutput {
  bankEntry: BankEntry;
  availableCB: number;
  remainingCB: number;
}

/**
 * BankSurplus use case - Banks positive compliance balance for future use
 * 
 * Requirements:
 * - Amount must be positive
 * - Amount must be ≤ available compliance balance
 * - Creates bank entry record with transaction type 'BANK'
 */
export class BankSurplus {
  constructor(
    private readonly complianceRepository: ComplianceRepository,
    private readonly bankRepository: BankRepository
  ) {}

  async execute(input: BankSurplusInput): Promise<BankSurplusOutput> {
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

    // Get current compliance balance
    const compliance = await this.complianceRepository.findByShipAndYear(
      input.shipId,
      input.year
    );

    if (!compliance) {
      throw new Error(`No compliance balance found for ship ${input.shipId} in year ${input.year}`);
    }

    const availableCB = compliance.cbGco2eq;

    // Validate amount is positive and ≤ available CB
    if (availableCB <= 0) {
      throw new Error('Cannot bank negative or zero compliance balance');
    }

    if (input.amount > availableCB) {
      throw new Error(`Amount ${input.amount} exceeds available compliance balance ${availableCB}`);
    }

    // Create bank entry with transaction type 'BANK'
    const bankEntry = new BankEntry(
      input.shipId,
      input.year,
      input.amount,
      'BANK',
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

    return {
      bankEntry: BankEntry.fromData(savedEntry),
      availableCB,
      remainingCB: availableCB - input.amount
    };
  }
}

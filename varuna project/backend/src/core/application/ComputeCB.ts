import { ComplianceBalance } from '../domain/ComplianceBalance';

// Constants from requirements
const TARGET_INTENSITY = 89.3368; // gCO₂e/MJ (2% below 91.16)
const ENERGY_CONVERSION_FACTOR = 41000; // MJ/t

export interface ComputeCBInput {
  shipId: string;
  year: number;
  actualIntensity: number; // gCO₂e/MJ
  fuelConsumption: number; // tonnes
}

export interface ComputeCBOutput {
  complianceBalance: ComplianceBalance;
  energyInScope: number;
  status: 'SURPLUS' | 'DEFICIT';
}

export class ComputeCB {
  /**
   * Computes the compliance balance for a ship based on the formula:
   * CB = (Target_Intensity - Actual_Intensity) × Energy_in_scope
   * 
   * Where:
   * - Target_Intensity = 89.3368 gCO₂e/MJ
   * - Energy_in_scope = fuelConsumption × 41,000 MJ/t
   * 
   * Positive CB = Surplus
   * Negative CB = Deficit
   */
  execute(input: ComputeCBInput): ComputeCBOutput {
    // Validate input
    if (!input.shipId || input.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }
    if (input.year < 2000 || input.year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (input.actualIntensity < 0) {
      throw new Error('Actual intensity must be non-negative');
    }
    if (input.fuelConsumption < 0) {
      throw new Error('Fuel consumption must be non-negative');
    }

    // Calculate Energy_in_scope = fuelConsumption × 41,000 MJ/t
    const energyInScope = input.fuelConsumption * ENERGY_CONVERSION_FACTOR;

    // Calculate CB = (Target_Intensity - Actual_Intensity) × Energy_in_scope
    const cbGco2eq = (TARGET_INTENSITY - input.actualIntensity) * energyInScope;

    // Create compliance balance entity
    const complianceBalance = new ComplianceBalance(
      input.shipId,
      input.year,
      cbGco2eq,
      new Date()
    );

    return {
      complianceBalance,
      energyInScope,
      status: complianceBalance.getStatus()
    };
  }
}

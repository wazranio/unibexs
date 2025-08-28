/**
 * Commission Calculator Utilities
 * 
 * Handles commission calculations based on partner tiers, university rates,
 * and special program configurations.
 */

import { Commission, CommissionCalculationConfig, Application } from '@/types';
import { StorageService } from '@/lib/data/storage';

// Default commission configuration
export const DEFAULT_COMMISSION_CONFIG: CommissionCalculationConfig = {
  tiers: {
    bronze: { rate: 0.10, minimumStudents: 0 },    // 10%
    silver: { rate: 0.125, minimumStudents: 10 },  // 12.5%
    gold: { rate: 0.15, minimumStudents: 25 },     // 15%
  },
  specialRates: {
    // University-specific rates (override tier rates)
    byUniversity: {
      'university_of_malaya': 0.18,          // 18% for top university
      'universiti_teknologi_malaysia': 0.16, // 16% for tech programs
    },
    // Program-specific rates
    byProgram: {
      'medicine': 0.08,     // Lower rate for medicine (high value programs)
      'dentistry': 0.08,    // Lower rate for dentistry
      'engineering': 0.12,  // Standard rate for engineering
      'business': 0.15,     // Higher rate for business programs
    },
    // Country-specific bonuses (added to base rate)
    byCountry: {
      'sudan': 0.02,        // +2% for Sudan students (higher effort)
      'oman': 0.015,        // +1.5% for Oman students
    },
  },
  processingFee: 0.02,  // 2% processing fee deducted
  taxRate: 0.00,        // No tax currently (0%)
};

/**
 * Calculate commission amount for an application
 */
export function calculateCommission(
  tuitionFee: number,
  partnerTier: 'bronze' | 'silver' | 'gold',
  universityId?: string,
  programName?: string,
  studentNationality?: string,
  config: CommissionCalculationConfig = DEFAULT_COMMISSION_CONFIG
): {
  baseRate: number;
  effectiveRate: number;
  grossCommission: number;
  processingFee: number;
  taxAmount: number;
  netCommission: number;
  breakdown: string[];
} {
  const breakdown: string[] = [];

  // 1. Start with tier base rate
  let effectiveRate = config.tiers[partnerTier].rate;
  breakdown.push(`Base rate (${partnerTier}): ${(effectiveRate * 100).toFixed(1)}%`);

  // 2. Apply university-specific rate if available
  if (universityId && config.specialRates?.byUniversity?.[universityId]) {
    const universityRate = config.specialRates.byUniversity[universityId];
    effectiveRate = universityRate;
    breakdown.push(`University override: ${(universityRate * 100).toFixed(1)}%`);
  }

  // 3. Apply program-specific rate if available
  else if (programName && config.specialRates?.byProgram) {
    const programKey = programName.toLowerCase();
    const programRate = config.specialRates.byProgram[programKey];
    if (programRate) {
      effectiveRate = programRate;
      breakdown.push(`Program override (${programName}): ${(programRate * 100).toFixed(1)}%`);
    }
  }

  // 4. Apply country bonus if available
  if (studentNationality && config.specialRates?.byCountry) {
    const countryKey = studentNationality.toLowerCase();
    const countryBonus = config.specialRates.byCountry[countryKey];
    if (countryBonus) {
      effectiveRate += countryBonus;
      breakdown.push(`Country bonus (${studentNationality}): +${(countryBonus * 100).toFixed(1)}%`);
    }
  }

  // 5. Calculate gross commission
  const grossCommission = tuitionFee * effectiveRate;
  breakdown.push(`Gross commission: MYR ${tuitionFee.toLocaleString()} × ${(effectiveRate * 100).toFixed(1)}% = MYR ${grossCommission.toLocaleString()}`);

  // 6. Calculate deductions
  const processingFee = grossCommission * (config.processingFee || 0);
  const taxAmount = grossCommission * (config.taxRate || 0);
  const netCommission = grossCommission - processingFee - taxAmount;

  if (processingFee > 0) {
    breakdown.push(`Processing fee (${((config.processingFee || 0) * 100).toFixed(1)}%): -MYR ${processingFee.toLocaleString()}`);
  }
  if (taxAmount > 0) {
    breakdown.push(`Tax (${((config.taxRate || 0) * 100).toFixed(1)}%): -MYR ${taxAmount.toLocaleString()}`);
  }

  breakdown.push(`Net commission: MYR ${netCommission.toLocaleString()}`);

  return {
    baseRate: config.tiers[partnerTier].rate,
    effectiveRate,
    grossCommission,
    processingFee,
    taxAmount,
    netCommission,
    breakdown,
  };
}

/**
 * Create a commission record when enrollment is completed
 */
export function createCommissionFromApplication(
  application: Application,
  enrollmentDate: Date = new Date()
): Commission {
  // Get related data
  const partner = StorageService.getPartners().find(p => p.id === application.partnerId);
  const student = StorageService.getStudents().find(s => s.id === application.studentId);
  
  if (!partner) {
    throw new Error(`Partner not found: ${application.partnerId}`);
  }

  // Calculate commission
  const calculation = calculateCommission(
    application.tuitionFee || 0,
    partner.tier || 'bronze',
    application.university,
    application.program,
    student?.nationality
  );

  const commission: Commission = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    applicationId: application.id,
    studentId: application.studentId,
    partnerId: application.partnerId,
    
    // Commission Details
    tuitionFee: application.tuitionFee || 0,
    commissionRate: calculation.effectiveRate,
    commissionAmount: calculation.netCommission,
    currency: application.currency || 'MYR',
    
    // Status & Dates
    status: 'commission_pending',
    enrollmentDate,
    createdAt: new Date(),
    
    // Metadata
    partnerTier: partner.tier || 'bronze',
    university: application.university,
    program: application.program,
  };

  return commission;
}

/**
 * Get partner tier based on their performance
 */
export function calculatePartnerTier(partnerId: string): 'bronze' | 'silver' | 'gold' {
  const applications = StorageService.getApplications()
    .filter(app => app.partnerId === partnerId);
  
  const enrolledStudents = applications.filter(app => 
    app.currentStatus === 'enrollment_completed' || 
    app.currentStatus === 'commission_pending' ||
    app.currentStatus === 'commission_approved' ||
    app.currentStatus === 'commission_paid'
  ).length;

  const config = DEFAULT_COMMISSION_CONFIG.tiers;
  
  if (enrolledStudents >= config.gold.minimumStudents) {
    return 'gold';
  } else if (enrolledStudents >= config.silver.minimumStudents) {
    return 'silver';
  }
  
  return 'bronze';
}

/**
 * Update all partner tiers based on current performance
 */
export function updatePartnerTiers(): void {
  const partners = StorageService.getPartners();
  
  partners.forEach(partner => {
    const newTier = calculatePartnerTier(partner.id);
    if (partner.tier !== newTier) {
      console.log(`📈 Partner tier updated: ${partner.name} → ${newTier}`);
      StorageService.savePartner({
        ...partner,
        tier: newTier
      });
    }
  });
}

/**
 * Format commission amount with currency
 */
export function formatCommissionAmount(amount: number, currency: string = 'MYR'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Calculate estimated commission for preview (before enrollment)
 */
export function estimateCommission(
  tuitionFee: number,
  partnerId: string,
  universityId?: string,
  programName?: string,
  studentNationality?: string
): {
  estimatedAmount: number;
  rate: number;
  tier: string;
} {
  const partner = StorageService.getPartners().find(p => p.id === partnerId);
  const tier = partner?.tier || calculatePartnerTier(partnerId);
  
  const calculation = calculateCommission(
    tuitionFee,
    tier,
    universityId,
    programName,
    studentNationality
  );
  
  return {
    estimatedAmount: calculation.netCommission,
    rate: calculation.effectiveRate,
    tier,
  };
}
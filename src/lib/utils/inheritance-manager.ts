import { Level, EnhancedProgram, EnglishRequirements } from '@/types';
import { StorageService } from '@/lib/data/storage';

export class InheritanceManager {
  /**
   * Apply level defaults to an enhanced program
   * This creates the full program object with inherited and overridden values
   */
  static applyLevelDefaults(program: EnhancedProgram, level?: Level): EnhancedProgram {
    if (!level) {
      level = StorageService.getLevel(program.levelId);
    }

    if (!level) {
      // If no level found, return program as-is
      return program;
    }

    const appliedProgram: EnhancedProgram = { ...program };

    // Ensure inheritsFromLevel exists with default values
    if (!appliedProgram.inheritsFromLevel) {
      appliedProgram.inheritsFromLevel = {
        duration: true,
        commission: true,
        englishRequirements: true
      };
    }

    // Apply duration inheritance
    if (appliedProgram.inheritsFromLevel.duration && level.defaultDuration) {
      appliedProgram.duration = level.defaultDuration;
    }

    // Apply commission rate inheritance
    if (appliedProgram.inheritsFromLevel.commission && level.defaultCommissionRate !== undefined) {
      appliedProgram.commissionRate = level.defaultCommissionRate;
    }

    // Apply English requirements inheritance
    if (appliedProgram.inheritsFromLevel.englishRequirements && level.defaultEnglishRequirements) {
      appliedProgram.englishRequirements = level.defaultEnglishRequirements;
    }

    return appliedProgram;
  }

  /**
   * Get effective values for a program (with inheritance applied)
   */
  static getEffectiveValues(program: EnhancedProgram): {
    duration: string;
    commissionRate?: number;
    englishRequirements?: EnglishRequirements;
  } {
    const level = StorageService.getLevel(program.levelId);
    const applied = this.applyLevelDefaults(program, level);

    return {
      duration: applied.duration || 'Not specified',
      commissionRate: applied.commissionRate,
      englishRequirements: applied.englishRequirements,
    };
  }

  /**
   * Create a new program with proper inheritance flags
   */
  static createProgramWithInheritance(
    baseProgram: Omit<EnhancedProgram, 'inheritsFromLevel' | 'id' | 'createdAt' | 'updatedAt'>,
    overrides: {
      duration?: boolean;
      commission?: boolean;
      englishRequirements?: boolean;
    } = {}
  ): Omit<EnhancedProgram, 'id' | 'createdAt' | 'updatedAt'> {
    const program: Omit<EnhancedProgram, 'id' | 'createdAt' | 'updatedAt'> = {
      ...baseProgram,
      inheritsFromLevel: {
        duration: overrides.duration ?? true,
        commission: overrides.commission ?? true,
        englishRequirements: overrides.englishRequirements ?? true,
      },
    };

    return program;
  }

  /**
   * Update level defaults and cascade to all programs
   */
  static updateLevelAndCascade(
    levelId: string, 
    updates: Partial<Pick<Level, 'defaultDuration' | 'defaultCommissionRate' | 'defaultEnglishRequirements'>>
  ): void {
    // Update the level
    const level = StorageService.getLevel(levelId);
    if (!level) return;

    const updatedLevel: Level = {
      ...level,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    StorageService.updateLevel(updatedLevel);

    // Find all programs that inherit from this level
    const programs = StorageService.getEnhancedPrograms({ levelId });
    
    const updatedPrograms = programs.map(program => {
      let needsUpdate = false;
      const programUpdates: Partial<EnhancedProgram> = {};

      // Ensure inheritsFromLevel exists with default values
      const inheritance = program.inheritsFromLevel || {
        duration: true,
        commission: true,
        englishRequirements: true
      };

      // Check if program inherits duration and level default changed
      if (inheritance.duration && updates.defaultDuration !== undefined) {
        programUpdates.duration = updates.defaultDuration;
        needsUpdate = true;
      }

      // Check if program inherits commission and level default changed
      if (inheritance.commission && updates.defaultCommissionRate !== undefined) {
        programUpdates.commissionRate = updates.defaultCommissionRate;
        needsUpdate = true;
      }

      // Check if program inherits English requirements and level default changed
      if (inheritance.englishRequirements && updates.defaultEnglishRequirements !== undefined) {
        programUpdates.englishRequirements = updates.defaultEnglishRequirements;
        needsUpdate = true;
      }

      if (needsUpdate) {
        return {
          ...program,
          ...programUpdates,
          updatedAt: new Date().toISOString()
        };
      }

      return program;
    });

    // Save all updated programs
    updatedPrograms.forEach(program => {
      StorageService.updateEnhancedProgram(program);
    });
  }

  /**
   * Toggle inheritance for a program property
   */
  static toggleInheritance(
    programId: string,
    property: 'duration' | 'commission' | 'englishRequirements',
    inherit: boolean
  ): void {
    const program = StorageService.getEnhancedProgram(programId);
    if (!program) return;

    const updatedProgram: EnhancedProgram = {
      ...program,
      inheritsFromLevel: {
        ...program.inheritsFromLevel,
        [property]: inherit
      },
      updatedAt: new Date().toISOString()
    };

    // If enabling inheritance, apply the level default
    if (inherit) {
      const level = StorageService.getLevel(program.levelId);
      if (level) {
        switch (property) {
          case 'duration':
            if (level.defaultDuration) {
              updatedProgram.duration = level.defaultDuration;
            }
            break;
          case 'commission':
            if (level.defaultCommissionRate !== undefined) {
              updatedProgram.commissionRate = level.defaultCommissionRate;
            }
            break;
          case 'englishRequirements':
            if (level.defaultEnglishRequirements) {
              updatedProgram.englishRequirements = level.defaultEnglishRequirements;
            }
            break;
        }
      }
    }

    StorageService.updateEnhancedProgram(updatedProgram);
  }

  /**
   * Get all programs that would be affected by a level change
   */
  static getAffectedPrograms(levelId: string, property: keyof Level): EnhancedProgram[] {
    const programs = StorageService.getEnhancedPrograms({ levelId });
    
    return programs.filter(program => {
      // Ensure inheritsFromLevel exists with default values
      const inheritance = program.inheritsFromLevel || {
        duration: true,
        commission: true,
        englishRequirements: true
      };

      switch (property) {
        case 'defaultDuration':
          return inheritance.duration;
        case 'defaultCommissionRate':
          return inheritance.commission;
        case 'defaultEnglishRequirements':
          return inheritance.englishRequirements;
        default:
          return false;
      }
    });
  }

  /**
   * Bulk update program inheritance settings
   */
  static bulkUpdateInheritance(
    programIds: string[],
    inheritance: {
      duration?: boolean;
      commission?: boolean;
      englishRequirements?: boolean;
    }
  ): void {
    const programs = programIds.map(id => StorageService.getEnhancedProgram(id)).filter(Boolean) as EnhancedProgram[];
    
    programs.forEach(program => {
      const updatedInheritance = {
        ...program.inheritsFromLevel,
        ...inheritance
      };

      const updatedProgram: EnhancedProgram = {
        ...program,
        inheritsFromLevel: updatedInheritance,
        updatedAt: new Date().toISOString()
      };

      // Apply level defaults for newly inherited properties
      const level = StorageService.getLevel(program.levelId);
      if (level) {
        if (inheritance.duration === true && level.defaultDuration) {
          updatedProgram.duration = level.defaultDuration;
        }
        if (inheritance.commission === true && level.defaultCommissionRate !== undefined) {
          updatedProgram.commissionRate = level.defaultCommissionRate;
        }
        if (inheritance.englishRequirements === true && level.defaultEnglishRequirements) {
          updatedProgram.englishRequirements = level.defaultEnglishRequirements;
        }
      }

      StorageService.updateEnhancedProgram(updatedProgram);
    });
  }

  /**
   * Check if a program has any overrides (non-inherited values)
   */
  static hasOverrides(program: EnhancedProgram): boolean {
    // Ensure inheritsFromLevel exists with default values
    const inheritance = program.inheritsFromLevel || {
      duration: true,
      commission: true,
      englishRequirements: true
    };

    return (
      !inheritance.duration ||
      !inheritance.commission ||
      !inheritance.englishRequirements
    );
  }

  /**
   * Get inheritance status for display purposes
   */
  static getInheritanceStatus(program: EnhancedProgram): {
    duration: { inherited: boolean; hasOverride: boolean };
    commission: { inherited: boolean; hasOverride: boolean };
    englishRequirements: { inherited: boolean; hasOverride: boolean };
  } {
    const level = StorageService.getLevel(program.levelId);
    
    // Ensure inheritsFromLevel exists with default values
    const inheritance = program.inheritsFromLevel || {
      duration: true,
      commission: true,
      englishRequirements: true
    };
    
    return {
      duration: {
        inherited: inheritance.duration,
        hasOverride: !inheritance.duration && !!level?.defaultDuration
      },
      commission: {
        inherited: inheritance.commission,
        hasOverride: !inheritance.commission && level?.defaultCommissionRate !== undefined
      },
      englishRequirements: {
        inherited: inheritance.englishRequirements,
        hasOverride: !inheritance.englishRequirements && !!level?.defaultEnglishRequirements
      }
    };
  }
}
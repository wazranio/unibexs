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

    // Apply duration inheritance
    if (program.inheritsFromLevel.duration && level.defaultDuration) {
      appliedProgram.duration = level.defaultDuration;
    }

    // Apply commission rate inheritance
    if (program.inheritsFromLevel.commission && level.defaultCommissionRate !== undefined) {
      appliedProgram.commissionRate = level.defaultCommissionRate;
    }

    // Apply English requirements inheritance
    if (program.inheritsFromLevel.englishRequirements && level.defaultEnglishRequirements) {
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
      duration: applied.duration,
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

      // Check if program inherits duration and level default changed
      if (program.inheritsFromLevel.duration && updates.defaultDuration !== undefined) {
        programUpdates.duration = updates.defaultDuration;
        needsUpdate = true;
      }

      // Check if program inherits commission and level default changed
      if (program.inheritsFromLevel.commission && updates.defaultCommissionRate !== undefined) {
        programUpdates.commissionRate = updates.defaultCommissionRate;
        needsUpdate = true;
      }

      // Check if program inherits English requirements and level default changed
      if (program.inheritsFromLevel.englishRequirements && updates.defaultEnglishRequirements !== undefined) {
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
      switch (property) {
        case 'defaultDuration':
          return program.inheritsFromLevel.duration;
        case 'defaultCommissionRate':
          return program.inheritsFromLevel.commission;
        case 'defaultEnglishRequirements':
          return program.inheritsFromLevel.englishRequirements;
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
    return (
      !program.inheritsFromLevel.duration ||
      !program.inheritsFromLevel.commission ||
      !program.inheritsFromLevel.englishRequirements
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
    
    return {
      duration: {
        inherited: program.inheritsFromLevel.duration,
        hasOverride: !program.inheritsFromLevel.duration && !!level?.defaultDuration
      },
      commission: {
        inherited: program.inheritsFromLevel.commission,
        hasOverride: !program.inheritsFromLevel.commission && level?.defaultCommissionRate !== undefined
      },
      englishRequirements: {
        inherited: program.inheritsFromLevel.englishRequirements,
        hasOverride: !program.inheritsFromLevel.englishRequirements && !!level?.defaultEnglishRequirements
      }
    };
  }
}
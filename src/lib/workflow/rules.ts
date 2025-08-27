import { Application, User } from '@/types';
import { WorkflowService } from './index';
import { StatusAuthorityService as AuthorityMatrixService } from './authority-matrix';
import { StatusAuthorityService } from './status-authority-matrix';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  type: 'validation' | 'permission' | 'automation' | 'notification';
  priority: number;
  conditions: (context: RuleContext) => boolean;
  action: (context: RuleContext) => RuleResult;
  isActive: boolean;
}

export interface RuleContext {
  application: Application;
  user: User;
  targetStatus: string;
  currentStatus: string;
  stage: number;
  data?: Record<string, unknown>;
}

export interface RuleResult {
  success: boolean;
  message?: string;
  warnings?: string[];
  errors?: string[];
  actions?: string[];
  data?: Record<string, unknown>;
}

export class WorkflowRulesEngine {
  private static rules: WorkflowRule[] = [];

  static initialize() {
    this.rules = [
      // Permission Rules
      {
        id: 'status-authority-validation',
        name: 'Status Authority Matrix Validation (PDF-based)',
        description: 'Validate status transitions against PDF workflow matrix for Stage 1',
        type: 'validation',
        priority: 110,
        isActive: true,
        conditions: (context) => context.stage === 1, // Only for Stage 1
        action: (context) => {
          const actor = context.user.role === 'admin' ? 'Admin' : 'Partner';
          const validation = StatusAuthorityService.validateTransition(
            context.currentStatus,
            context.targetStatus,
            actor
          );

          if (!validation.allowed) {
            const errors = [];
            if (validation.specViolation) {
              errors.push(`PDF_SPEC_VIOLATION: ${validation.reason}`);
              console.warn('PDF Spec Violation detected:', {
                currentStatus: context.currentStatus,
                targetStatus: context.targetStatus,
                actor,
                reason: validation.reason
              });
            } else {
              errors.push(validation.reason || 'Status authority violation');
            }

            return {
              success: false,
              errors,
              message: 'Status transition violates PDF workflow matrix',
              data: { 
                specViolation: validation.specViolation,
                currentStatus: context.currentStatus,
                targetStatus: context.targetStatus,
                actor
              }
            };
          }

          console.log(`✅ PDF Authority check passed: ${context.currentStatus} → ${context.targetStatus} by ${actor}`);
          return {
            success: true,
            message: 'PDF authority matrix validation passed'
          };
        }
      },

      {
        id: 'legacy-authority-matrix-validation',
        name: 'Legacy Authority Matrix Validation',
        description: 'Fallback to legacy authority matrix for non-Stage 1 statuses',
        type: 'validation',
        priority: 109,
        isActive: true,
        conditions: (context) => context.stage !== 1, // Only for non-Stage 1
        action: (context) => {
          const validation = AuthorityMatrixService.validateStatusTransition(
            context.application,
            context.targetStatus,
            (context.user.role === 'admin' ? 'Admin' : 'Partner') as 'Admin' | 'Partner'
          );

          if (!validation.allowed) {
            const errors = [];
            if (validation.specViolation) {
              errors.push(`SPEC_VIOLATION: ${validation.reason}`);
              console.error('SPEC_VIOLATION detected:', validation.specViolation);
            } else {
              errors.push(validation.reason || 'Authority matrix violation');
            }

            return {
              success: false,
              errors,
              message: 'Status transition violates authority matrix permissions',
              data: { specViolation: validation.specViolation }
            };
          }

          return {
            success: true,
            message: 'Legacy authority matrix validation passed'
          };
        }
      },

      {
        id: 'partner-stage-restrictions',
        name: 'Partner Stage Access Restrictions',
        description: 'Partners can only update statuses where they are the designated actor',
        type: 'permission',
        priority: 100,
        isActive: true,
        conditions: (context) => context.user.role === 'partner',
        action: (context) => {
          const targetStatusConfig = WorkflowService.getStatus(context.stage, context.targetStatus);
          const canUpdate = !targetStatusConfig || targetStatusConfig.nextActor === 'Partner';

          return {
            success: canUpdate,
            message: canUpdate ? undefined : 'Partners can only update statuses where they are the designated actor',
            errors: canUpdate ? [] : ['Insufficient permissions for this status change']
          };
        }
      },

      // Validation Rules
      {
        id: 'document-validation',
        name: 'Required Documents Validation',
        description: 'Ensure all required documents are present before status change',
        type: 'validation',
        priority: 90,
        isActive: true,
        conditions: (context) => {
          const statusConfig = WorkflowService.getStatus(context.stage, context.targetStatus);
          return statusConfig?.requiresDocuments !== undefined;
        },
        action: (context) => {
          const statusConfig = WorkflowService.getStatus(context.stage, context.targetStatus);
          const requiredDocs = statusConfig?.requiresDocuments || [];
          const missingDocs = requiredDocs.filter(doc => !context.application.documentsRequired?.includes(doc));
          
          return {
            success: missingDocs.length === 0,
            errors: missingDocs.length > 0 ? [`Missing required documents: ${missingDocs.join(', ')}`] : [],
            message: missingDocs.length > 0 ? 'Please upload all required documents before proceeding' : undefined
          };
        }
      },

      {
        id: 'rejection-reason-required',
        name: 'Rejection Reason Required',
        description: 'Rejection statuses must include a detailed reason',
        type: 'validation',
        priority: 95,
        isActive: true,
        conditions: (context) => context.targetStatus.includes('rejected') || context.targetStatus.includes('disputed'),
        action: (context) => {
          const reason = context.data?.reason;
          const hasReason = typeof reason === 'string' && reason.trim().length > 10;

          return {
            success: hasReason,
            errors: hasReason ? [] : ['Reason must be at least 10 characters long for rejections/disputes'],
            message: hasReason ? undefined : 'Please provide a detailed reason'
          };
        }
      },

      {
        id: 'date-format-validation',
        name: 'Date Format Validation',
        description: 'Validate date formats for arrival dates and other date inputs',
        type: 'validation',
        priority: 85,
        isActive: true,
        conditions: (context) => ['arrival_date_confirmed', 'visa_issued'].includes(context.targetStatus),
        action: (context) => {
          const dateInput = context.data?.arrival_date || context.data?.planned_arrival_date;
          if (!dateInput || typeof dateInput !== 'string') {
            return {
              success: false,
              errors: ['Date input is required for this status change'],
              message: 'Please provide a valid date'
            };
          }

          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const isValidFormat = dateRegex.test(dateInput);

          if (!isValidFormat) {
            return {
              success: false,
              errors: ['Date must be in YYYY-MM-DD format'],
              message: 'Invalid date format. Please use YYYY-MM-DD format'
            };
          }

          return {
            success: true,
            message: 'Date format validation passed'
          };
        }
      },

      {
        id: 'receipt-schema-validation',
        name: 'Receipt Schema Validation',
        description: 'Validate receipt documents meet required schema',
        type: 'validation',
        priority: 85,
        isActive: true,
        conditions: (context) => ['payment_submitted', 'payment_confirmation_submitted'].includes(context.targetStatus),
        action: (context) => {
          const receipt = context.data?.receipt;
          if (!receipt || typeof receipt !== 'string') {
            return {
              success: false,
              errors: ['Receipt document is required'],
              message: 'Please upload a valid receipt document'
            };
          }

          // Basic receipt validation - could be extended with more specific checks
          const validTypes = ['pdf', 'jpg', 'jpeg', 'png'];
          const fileExtension = receipt.split('.').pop()?.toLowerCase();

          if (!validTypes.includes(fileExtension || '')) {
            return {
              success: false,
              errors: [`Receipt must be one of: ${validTypes.join(', ')}`],
              message: 'Invalid receipt file type'
            };
          }

          return {
            success: true,
            message: 'Receipt schema validation passed'
          };
        }
      },

      {
        id: 'filename-requirements',
        name: 'Filename Requirements Validation',
        description: 'Validate uploaded filenames meet requirements',
        type: 'validation',
        priority: 80,
        isActive: true,
        conditions: (context) => {
          const documents = context.data?.documents;
          return Array.isArray(documents) && documents.length > 0;
        },
        action: (context) => {
          const documents = context.data?.documents as string[];
          if (!documents) {
            return {
              success: true,
              message: 'No documents to validate'
            };
          }

          const errors: string[] = [];

          documents.forEach((doc, index) => {
            // Check for minimum filename length
            if (doc.length < 3) {
              errors.push(`Document ${index + 1}: Filename too short`);
            }

            // Check for valid characters (no special characters that could cause issues)
            const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
            if (invalidChars.test(doc)) {
              errors.push(`Document ${index + 1}: Filename contains invalid characters`);
            }
          });

          return {
            success: errors.length === 0,
            errors,
            message: errors.length > 0 ? 'Please fix filename issues' : 'Filename validation passed'
          };
        }
      },

      {
        id: 'tracking-number-validation',
        name: 'Tracking Number Validation',
        description: 'Validate tracking/reference numbers are provided when required',
        type: 'validation',
        priority: 85,
        isActive: true,
        conditions: (context) => ['submitted_to_immigration', 'visa_issued'].includes(context.targetStatus),
        action: (context) => {
          const trackingData = context.data?.tracking_number || context.application.trackingNumber;
          
          if (!trackingData || typeof trackingData !== 'string' || trackingData.trim().length < 5) {
            return {
              success: false,
              errors: ['Valid tracking/reference number is required'],
              message: 'Please provide a valid tracking or reference number'
            };
          }

          return {
            success: true,
            message: 'Tracking number validation passed'
          };
        }
      },

      {
        id: 'sequential-status-validation',
        name: 'Sequential Status Validation',
        description: 'Ensure status changes follow the correct sequence',
        type: 'validation',
        priority: 85,
        isActive: true,
        conditions: () => true,
        action: (context) => {
          const isValidTransition = WorkflowService.validateStatusTransition(
            context.stage,
            context.currentStatus,
            context.targetStatus
          );
          
          return {
            success: isValidTransition,
            errors: isValidTransition ? [] : ['Invalid status transition'],
            message: isValidTransition ? undefined : `Cannot transition from ${context.currentStatus} to ${context.targetStatus}`
          };
        }
      },

      // Business Logic Rules
      {
        id: 'high-priority-fast-track',
        name: 'High Priority Fast Track',
        description: 'High priority applications should be processed within specific timeframes',
        type: 'validation',
        priority: 70,
        isActive: true,
        conditions: (context) => context.application.priority === 'high',
        action: (context) => {
          const daysSinceCreation = Math.floor(
            (new Date().getTime() - new Date(context.application.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          const warnings: string[] = [];
          if (daysSinceCreation > 3 && context.stage === 1) {
            warnings.push('High priority application pending in Stage 1 for over 3 days');
          }
          if (daysSinceCreation > 7) {
            warnings.push('High priority application pending for over 7 days - consider escalation');
          }
          
          return {
            success: true,
            warnings
          };
        }
      },

      {
        id: 'duplicate-status-prevention',
        name: 'Prevent Duplicate Status Changes',
        description: 'Prevent setting the same status multiple times within a short period',
        type: 'validation',
        priority: 60,
        isActive: true,
        conditions: (context) => context.currentStatus === context.targetStatus,
        action: (context) => {
          const recentSameStatus = context.application.stageHistory?.filter(
            entry => entry.status === context.targetStatus &&
            new Date().getTime() - new Date(entry.timestamp).getTime() < 60 * 60 * 1000 // 1 hour
          );
          
          if (recentSameStatus && recentSameStatus.length > 0) {
            return {
              success: false,
              errors: ['This status was recently applied. Please verify this change is necessary.'],
              message: 'Duplicate status change detected'
            };
          }
          
          return {
            success: false,
            errors: ['Cannot set the same status - no change would occur'],
            message: 'Status is already set to the target value'
          };
        }
      },

      // Automation Rules
      {
        id: 'auto-advance-trigger',
        name: 'Auto-Advance Stage Trigger',
        description: 'Automatically advance to next stage for specific status completions',
        type: 'automation',
        priority: 50,
        isActive: true,
        conditions: (context) => ['approved_stage1', 'university_approved', 'visa_issued', 'arrival_verified'].includes(context.targetStatus),
        action: (context) => {
          void context; // Avoid unused parameter warning
          return {
            success: true,
            actions: ['auto-advance-stage'],
            message: 'Application will auto-advance to next stage',
            data: { shouldAutoAdvance: true }
          };
        }
      },

      // Data Integrity Rules
      {
        id: 'stage-consistency-check',
        name: 'Stage Data Consistency Check',
        description: 'Ensure stage-specific data is consistent with status changes',
        type: 'validation',
        priority: 80,
        isActive: true,
        conditions: () => true,
        action: (context) => {
          const warnings: string[] = [];
          const errors: string[] = [];
          
          // Stage-specific checks
          switch (context.stage) {
            case 2:
              if (context.targetStatus === 'university_approved' && !context.application.university) {
                warnings.push('University name should be specified');
              }
              break;
              
            case 3:
              if (context.targetStatus === 'visa_issued' && !context.application.trackingNumber) {
                warnings.push('Visa tracking number should be provided');
              }
              break;
              
            case 4:
              if (context.targetStatus === 'arrival_verified') {
                const hasArrivalInfo = context.application.stageHistory?.some(h => h.status.includes('arrival')) || false;
                if (!hasArrivalInfo) {
                  errors.push('Arrival information must be recorded before verification');
                }
              }
              break;
              
            case 5:
              if (context.targetStatus === 'commission_approved') {
                if ((context.application.tuitionFee || 0) <= 0) {
                  warnings.push('Tuition fee amount should be specified for commission calculation');
                }
              }
              break;
          }
          
          return {
            success: errors.length === 0,
            warnings,
            errors
          };
        }
      },

      // Notification Rules
      {
        id: 'urgent-notification-trigger',
        name: 'Urgent Notification Trigger',
        description: 'Send immediate notifications for critical status changes',
        type: 'notification',
        priority: 40,
        isActive: true,
        conditions: (context) => [
          'rejected_stage1', 'rejected_university', 'visa_rejected',
          'correction_requested_admin', 'university_requested_corrections'
        ].includes(context.targetStatus),
        action: (context) => {
          void context; // Avoid unused parameter warning
          return {
            success: true,
            actions: ['send-urgent-notification'],
            message: 'Urgent notification will be sent',
            data: { notificationPriority: 'high' }
          };
        }
      }
    ];
  }

  /**
   * Evaluate all applicable rules for a status change
   */
  static evaluateStatusChange(
    application: Application,
    user: User,
    targetStatus: string,
    additionalData?: Record<string, unknown>
  ): {
    canProceed: boolean;
    errors: string[];
    warnings: string[];
    actions: string[];
    ruleResults: Array<{ rule: WorkflowRule; result: RuleResult }>;
  } {
    const context: RuleContext = {
      application,
      user,
      targetStatus,
      currentStatus: application.currentStatus,
      stage: application.currentStage,
      data: additionalData || {}
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    const actions: string[] = [];
    const ruleResults: Array<{ rule: WorkflowRule; result: RuleResult }> = [];

    // Sort rules by priority (higher priority first)
    const applicableRules = this.rules
      .filter(rule => rule.isActive && rule.conditions(context))
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      try {
        const result = rule.action(context);
        ruleResults.push({ rule, result });

        if (!result.success) {
          errors.push(...(result.errors || []));
          if (result.message) {
            errors.push(result.message);
          }
        }

        warnings.push(...(result.warnings || []));
        actions.push(...(result.actions || []));

        // If this is a critical validation rule and it fails, stop evaluation
        if (rule.type === 'validation' && rule.priority >= 90 && !result.success) {
          break;
        }

      } catch (error) {
        console.error(`Rule evaluation failed for rule ${rule.id}:`, error);
        errors.push(`Internal validation error: ${rule.name}`);
      }
    }

    return {
      canProceed: errors.length === 0,
      errors: Array.from(new Set(errors)), // Remove duplicates
      warnings: Array.from(new Set(warnings)),
      actions: Array.from(new Set(actions)),
      ruleResults
    };
  }

  /**
   * Get specific rule by ID
   */
  static getRule(ruleId: string): WorkflowRule | undefined {
    return this.rules.find(rule => rule.id === ruleId);
  }

  /**
   * Enable or disable a rule
   */
  static toggleRule(ruleId: string, isActive: boolean): boolean {
    const rule = this.getRule(ruleId);
    if (rule) {
      rule.isActive = isActive;
      return true;
    }
    return false;
  }

  /**
   * Add custom rule
   */
  static addCustomRule(rule: WorkflowRule): void {
    // Check for duplicate IDs
    if (this.rules.some(r => r.id === rule.id)) {
      throw new Error(`Rule with ID ${rule.id} already exists`);
    }
    this.rules.push(rule);
  }

  /**
   * Get all rules of a specific type
   */
  static getRulesByType(type: WorkflowRule['type']): WorkflowRule[] {
    return this.rules.filter(rule => rule.type === type && rule.isActive);
  }

  /**
   * Get rules summary for admin interface
   */
  static getRulesSummary(): Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    priority: number;
    isActive: boolean;
  }> {
    return this.rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      type: rule.type,
      priority: rule.priority,
      isActive: rule.isActive
    }));
  }

  /**
   * Validate application state for potential issues
   */
  static validateApplicationState(application: Application): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for stale applications
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(application.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate > 14) {
      issues.push(`Application has been idle for ${daysSinceUpdate} days`);
      recommendations.push('Follow up with responsible party or escalate');
    }

    // Check for missing critical data
    if (!application.program) {
      issues.push('Program not specified');
    }
    if (!application.university) {
      issues.push('University not specified');
    }
    if (!application.intakeDate) {
      issues.push('Intake date not specified');
    }

    // Check for inconsistent stage history
    if (!application.stageHistory || application.stageHistory.length === 0) {
      issues.push('No stage history recorded');
    }

    const currentStageHistory = application.stageHistory?.filter(h => h.stage === application.currentStage) || [];
    if (currentStageHistory.length === 0) {
      issues.push('Current stage has no history entries');
    }

    // Check priority vs processing time
    if (application.priority === 'high' && daysSinceUpdate > 7) {
      issues.push('High priority application processing slower than expected');
      recommendations.push('Consider expediting or escalating this application');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }
}

// Initialize rules when the module loads
WorkflowRulesEngine.initialize();
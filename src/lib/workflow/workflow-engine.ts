/**
 * Zero-Hardcoded Workflow Engine
 * 
 * This engine handles all workflow logic through configuration.
 * NO hardcoded status checks, text, or business logic.
 * Everything is driven by stage configurations.
 */

import { 
  WorkflowConfiguration, 
  StageConfig, 
  StatusConfig, 
  StatusInfo, 
  StatusAction,
  StatusDisplay,
  UserRole, 
  WorkflowActor 
} from './stages/types';

export class WorkflowEngine {
  private config: WorkflowConfiguration;
  private static instance: WorkflowEngine;

  constructor(configuration: WorkflowConfiguration) {
    this.config = configuration;
  }

  static getInstance(configuration?: WorkflowConfiguration): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      if (!configuration) {
        throw new Error('WorkflowEngine requires configuration on first initialization');
      }
      WorkflowEngine.instance = new WorkflowEngine(configuration);
    }
    return WorkflowEngine.instance;
  }

  /**
   * Get complete status configuration
   */
  getStatusConfig(stage: number, statusKey: string): StatusConfig | null {
    const stageConfig = this.config.stages[stage];
    if (!stageConfig) return null;
    
    return stageConfig.statuses[statusKey] || null;
  }

  /**
   * Get stage configuration
   */
  getStageConfig(stage: number): StageConfig | null {
    return this.config.stages[stage] || null;
  }

  /**
   * Get status display information for UI
   * REPLACES: getCurrentStatus, getPrimaryMessage, getActionButtonText hardcoded functions
   */
  getStatusDisplay(stage: number, statusKey: string, role: UserRole): StatusInfo {
    const config = this.getStatusConfig(stage, statusKey);
    
    if (!config) {
      return this.getFallbackStatusInfo(stage, statusKey);
    }

    const actor = role === 'admin' ? 'Admin' : 'Partner';
    const displayConfig = config.display[role];
    
    return {
      statusKey,
      stage,
      displayName: displayConfig.allText.heroCardTitle,
      description: displayConfig.allText.heroCardDescription,
      
      // Authority information
      canUpdate: this.canActorUpdate(stage, statusKey, actor),
      availableTransitions: this.getAvailableTransitions(stage, statusKey, actor),
      waitingFor: this.getWaitingFor(stage, statusKey, actor),
      
      // Display information
      text: displayConfig.allText.statusCard,
      isUrgent: displayConfig.styling.urgencyLevel === 'high' || displayConfig.styling.urgencyLevel === 'critical',
      actionButton: this.getPrimaryAction(stage, statusKey, role),
      hasMultiple: config.actions[role].length > 1,
      
      // Visual styling
      color: displayConfig.styling.statusColor,
      icon: displayConfig.styling.statusIcon,
      styling: displayConfig.styling,
      
      // Behavior configuration
      rules: config.rules,
      behavior: config.behavior
    };
  }

  /**
   * Get specific text for any UI element
   * REPLACES: All hardcoded text in components
   */
  getText(stage: number, statusKey: string, role: UserRole, textField: keyof StatusDisplay['allText']): string {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return '';
    
    const value = config.display[role].allText[textField];
    return Array.isArray(value) ? value.join(', ') : (value || '');
  }

  /**
   * Check if actor can update status
   * REPLACES: StatusAuthorityService.canActorUpdate with configuration
   */
  canActorUpdate(stage: number, statusKey: string, actor: WorkflowActor): boolean {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return false;

    switch (actor) {
      case 'Admin':
        return config.authority.adminCanUpdate;
      case 'Partner':
        return config.authority.partnerCanUpdate;
      case 'System':
        return config.authority.systemCanUpdate;
      default:
        return false;
    }
  }

  /**
   * Get available transitions for actor
   * REPLACES: StatusAuthorityService.getAvailableTransitions
   */
  getAvailableTransitions(stage: number, statusKey: string, actor: WorkflowActor): string[] {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return [];

    switch (actor) {
      case 'Admin':
        return config.authority.adminTransitions;
      case 'Partner':
        return config.authority.partnerTransitions;
      case 'System':
        return config.authority.systemTransitions;
      default:
        return [];
    }
  }

  /**
   * Get what actor is waiting for
   */
  private getWaitingFor(stage: number, statusKey: string, actor: WorkflowActor): string | undefined {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return undefined;

    switch (actor) {
      case 'Admin':
        return config.authority.adminWaitsFor;
      case 'Partner':
        return config.authority.partnerWaitsFor;
      default:
        return undefined;
    }
  }

  /**
   * Get primary action for status/role
   * REPLACES: Hardcoded action button logic
   */
  getPrimaryAction(stage: number, statusKey: string, role: UserRole): StatusAction | undefined {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return undefined;

    const actions = config.actions[role];
    return actions.length > 0 ? actions[0] : undefined;
  }

  /**
   * Get all actions for status/role
   */
  getAllActions(stage: number, statusKey: string, role: UserRole): StatusAction[] {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return [];

    return config.actions[role] || [];
  }

  /**
   * Check if status has specific rule
   * REPLACES: All hardcoded status check functions (isDocumentUploadAction, etc.)
   */
  hasRule(stage: number, statusKey: string, rule: keyof StatusConfig['rules']): boolean {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return false;

    return config.rules[rule] || false;
  }

  /**
   * Get behavior configuration
   * REPLACES: Hardcoded modal and action logic
   */
  getBehavior(stage: number, statusKey: string, behaviorType: keyof StatusConfig['behavior']): any {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return null;

    return config.behavior[behaviorType];
  }

  /**
   * Validate status transition
   */
  validateTransition(
    currentStage: number,
    currentStatus: string,
    targetStatus: string,
    actor: WorkflowActor
  ): { allowed: boolean; reason?: string } {
    const availableTransitions = this.getAvailableTransitions(currentStage, currentStatus, actor);
    const allowed = availableTransitions.includes(targetStatus);
    
    if (!allowed) {
      const canUpdate = this.canActorUpdate(currentStage, currentStatus, actor);
      if (!canUpdate) {
        return {
          allowed: false,
          reason: `${actor} cannot update from status: ${currentStatus}`
        };
      }

      return {
        allowed: false,
        reason: `Invalid transition: ${currentStatus} → ${targetStatus} for ${actor}`
      };
    }

    return { allowed: true };
  }

  /**
   * Get document configuration for status
   */
  getDocumentConfig(stage: number, statusKey: string) {
    const config = this.getStatusConfig(stage, statusKey);
    return config?.documents || null;
  }

  /**
   * Get validation rules for status
   */
  getValidationConfig(stage: number, statusKey: string) {
    const config = this.getStatusConfig(stage, statusKey);
    return config?.validation || null;
  }

  /**
   * Get subflow configuration for status
   */
  getSubflowConfig(stage: number, statusKey: string) {
    const config = this.getStatusConfig(stage, statusKey);
    return config?.subflows || null;
  }

  /**
   * Check if status is terminal (no further transitions)
   */
  isTerminalStatus(stage: number, statusKey: string): boolean {
    const config = this.getStatusConfig(stage, statusKey);
    if (!config) return false;
    
    return config.rules.isTerminalStatus === true;
  }

  /**
   * Get next stage information
   */
  getNextStage(currentStage: number): { stage: number; firstStatus: string } | null {
    const nextStageNum = currentStage + 1;
    const nextStageConfig = this.getStageConfig(nextStageNum);
    
    if (!nextStageConfig) return null;
    
    const firstStatusKey = Object.keys(nextStageConfig.statuses)[0];
    return {
      stage: nextStageNum,
      firstStatus: firstStatusKey
    };
  }

  /**
   * Get all statuses for a stage
   */
  getStageStatuses(stage: number): string[] {
    const stageConfig = this.getStageConfig(stage);
    return stageConfig ? Object.keys(stageConfig.statuses) : [];
  }

  /**
   * Generic fallback for unknown statuses
   */
  private getFallbackStatusInfo(stage: number, statusKey: string): StatusInfo {
    const fallbackText = statusKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      statusKey,
      stage,
      displayName: fallbackText,
      description: `Application is in ${fallbackText.toLowerCase()} status`,
      canUpdate: false,
      availableTransitions: [],
      text: fallbackText,
      isUrgent: false,
      actionButton: undefined,
      hasMultiple: false,
      color: 'gray',
      icon: '⏳',
      styling: {
        statusColor: 'gray',
        statusIcon: '⏳',
        urgencyLevel: 'medium',
        badgeVariant: 'neutral'
      },
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },
      behavior: {
        onEntry: [],
        onExit: [],
        onAction: 'showModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: [],
        auditEvents: []
      }
    };
  }

  /**
   * Get configuration version and metadata
   */
  getConfigInfo() {
    return {
      version: this.config.version,
      lastUpdated: this.config.lastUpdated,
      stageCount: Object.keys(this.config.stages).length,
      totalStatuses: Object.values(this.config.stages).reduce(
        (total, stage) => total + Object.keys(stage.statuses).length, 
        0
      )
    };
  }

  /**
   * Update configuration (for copy management)
   */
  updateConfig(newConfig: WorkflowConfiguration) {
    this.config = newConfig;
  }
}
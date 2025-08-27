/**
 * Configuration Types for Zero-Hardcoded Workflow System
 * 
 * This file defines the complete structure for stage and status configurations.
 * Every piece of workflow logic, UI text, and behavior is configured here.
 */

export type WorkflowActor = 'Admin' | 'Partner' | 'System' | 'University' | 'Immigration';
export type UserRole = 'admin' | 'partner';

/**
 * Authority Configuration (from PDF Workflow Matrix)
 * Defines who can update statuses and what transitions are allowed
 */
export interface StatusAuthority {
  setBy: WorkflowActor;
  setTrigger: string;
  adminCanUpdate: boolean;
  adminTransitions: string[];
  adminWaitsFor?: string;
  partnerCanUpdate: boolean;
  partnerTransitions: string[];
  partnerWaitsFor?: string;
  systemCanUpdate: boolean;
  systemTransitions: string[];
}

/**
 * Rules Configuration (replaces hardcoded checks)
 * Defines behavioral flags for each status
 */
export interface StatusRules {
  isDocumentUploadStatus: boolean;
  isDocumentReviewStatus: boolean;
  isPaymentStatus: boolean;
  isTerminalStatus: boolean;
  requiresUrgentAction: boolean;
  showsInDashboard: boolean;
  allowsBulkUpdate: boolean;
  expandsDocumentSection: boolean;
  expandsTimelineSection: boolean;
  blocksNavigation: boolean;
  autoRefreshRequired: boolean;
  requiresConfirmation: boolean;
  requiresDocuments: boolean;
  partialSubmission: boolean;
}

/**
 * UI Display Configuration
 * All text content for different UI contexts
 */
export interface StatusDisplay {
  allText: {
    // Status card and main display
    statusCard: string;
    primaryMessage: string;
    secondaryMessage?: string;
    
    // Dashboard and lists
    dashboardTitle: string;
    dashboardSubtitle: string;
    listViewStatus: string;
    
    // Hero card content
    heroCardTitle: string;
    heroCardSubtitle: string;
    heroCardDescription: string;
    
    // Timeline entries
    timelineTitle: string;
    timelineDescription: string;
    
    // Action buttons
    actionButtonText?: string;
    actionButtonSecondary?: string;
    
    // Notifications and messages
    successMessage: string;
    errorMessage: string;
    warningMessage?: string;
    infoMessage?: string;
    
    // Empty states and placeholders
    emptyStateTitle: string;
    emptyStateDescription: string;
    loadingMessage: string;
    
    // Next steps and guidance
    nextStepsTitle: string;
    nextSteps: string[];
    estimatedTime: string;
    urgencyText?: string;
  };
  
  // Visual styling
  styling: {
    statusColor: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'purple' | 'gray';
    statusIcon: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    progressStep?: number;
    progressTotal?: number;
  };
}

/**
 * Action Configuration
 * Defines buttons and their behaviors
 */
export interface StatusAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  icon?: string;
  behavior: 'showModal' | 'navigate' | 'upload' | 'download' | 'external' | 'custom';
  target?: string; // Modal name, URL, function name
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  disabled?: boolean;
  disabledReason?: string;
  permissions?: string[];
}

/**
 * Behavior Configuration
 * Defines what happens during status lifecycle
 */
export interface StatusBehavior {
  onEntry: string[]; // Actions to take when entering this status
  onExit: string[]; // Actions to take when leaving this status
  onAction: string; // Default action behavior
  onDocumentUpload?: string; // Special document upload behavior
  onPayment?: string; // Special payment behavior
  modalToShow: string; // Default modal to show
  redirectAfterAction: boolean;
  autoProgressTo?: string; // Automatic progression to next status
  waitingForActor: WorkflowActor;
  notificationTriggers: string[]; // When to send notifications
  auditEvents: string[]; // Events to log
}

/**
 * Document Configuration
 * Defines document handling for each status
 */
export interface DocumentConfig {
  required: string[]; // Required document types
  optional: string[]; // Optional document types
  autoGenerate: string[]; // Documents to auto-generate
  hideUpload: boolean; // Whether to hide upload UI
  reviewRequired: boolean; // Whether documents need admin review
  bulkUpload: boolean; // Allow multiple file upload
  allowedTypes: string[]; // File type restrictions
  maxSize: number; // Max file size in MB
  downloadable: boolean; // Whether docs can be downloaded
}

/**
 * Validation Configuration
 * Business rules and validation logic
 */
export interface ValidationConfig {
  onEntry: string[]; // Validations before entering status
  onExit: string[]; // Validations before leaving status
  requiredFields: string[]; // Required data fields
  businessRules: string[]; // Business rule checks
  dependencies: string[]; // Other statuses that must be complete
  blockers: string[]; // Conditions that prevent progress
}

/**
 * Subflow Configuration
 * Handles loops and nested workflows
 */
export interface SubflowConfig {
  [subflowName: string]: {
    trigger: string; // Status that triggers this subflow
    blocksMainFlow: boolean; // Whether this blocks main progression
    requiredActions: string[]; // Actions needed to complete subflow
    completionStatus: string; // Status to return to after completion
    maxIterations?: number; // Prevent infinite loops
    timeoutDays?: number; // Auto-complete after timeout
  };
}

/**
 * Complete Status Configuration
 * Everything needed to handle a status without hardcoding
 */
export interface StatusConfig {
  // Core configuration
  authority: StatusAuthority;
  rules: StatusRules;
  behavior: StatusBehavior;
  
  // User experience
  display: {
    admin: StatusDisplay;
    partner: StatusDisplay;
  };
  
  actions: {
    admin: StatusAction[];
    partner: StatusAction[];
  };
  
  // Content management
  documents: DocumentConfig;
  validation: ValidationConfig;
  subflows?: SubflowConfig;
  
  // Metadata
  version: string;
  lastUpdated: string;
  description: string;
}

/**
 * Stage Configuration
 * Collection of all statuses for a stage
 */
export interface StageConfig {
  stageName: string;
  stageDescription: string;
  stageIcon: string;
  stageColor: string;
  estimatedDuration: string;
  
  // All statuses in this stage
  statuses: {
    [statusKey: string]: StatusConfig;
  };
  
  // Stage-level configuration
  defaultTransitions: string[]; // Cross-stage transitions
  stageCompletionStatus: string; // Status that completes the stage
  nextStage?: number;
  
  // Stage metadata
  version: string;
  lastUpdated: string;
}

/**
 * Complete Workflow Configuration
 * All stages and their configurations
 */
export interface WorkflowConfiguration {
  stages: {
    [stageNumber: number]: StageConfig;
  };
  globalSettings: {
    timeoutDays: number;
    maxRetries: number;
    notificationSettings: any;
    auditSettings: any;
  };
  version: string;
  lastUpdated: string;
}

/**
 * Runtime Status Information
 * What the WorkflowEngine returns for UI consumption
 */
export interface StatusInfo {
  // Basic info
  statusKey: string;
  stage: number;
  displayName: string;
  description: string;
  
  // Authority info
  canUpdate: boolean;
  availableTransitions: string[];
  waitingFor?: string;
  
  // Display info
  text: string;
  isUrgent: boolean;
  actionButton?: StatusAction;
  hasMultiple: boolean;
  
  // UI configuration
  color: string;
  icon: string;
  styling: any;
  
  // Rules
  rules: StatusRules;
  behavior: StatusBehavior;
}

/**
 * Copy Update Interface
 * For easy text modifications
 */
export interface CopyUpdate {
  stage: number;
  status: string;
  role: UserRole;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedAt: string;
}
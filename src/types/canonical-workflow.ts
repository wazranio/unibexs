// Main workflow statuses that represent the primary flow of an application
export type MainFlowStatus = 
  // Stage 1: Application Review
  | 'new_application'
  | 'submitted'
  | 'under_review_admin'
  | 'stage1_approved'
  
  // Stage 2: University Review
  | 'sent_to_university'
  | 'university_review' 
  | 'university_approved'
  | 'university_requested_corrections'
  | 'program_change_suggested'
  | 'program_change_accepted'
  | 'program_change_rejected'
  | 'rejected_university'
  
  // Stage 3: Visa Processing
  | 'offer_letter_issued'
  | 'offer_letter_confirmed'
  | 'program_payment_required'
  | 'program_payment_submitted'
  | 'program_payment_verified'
  | 'visa_processing'
  | 'waiting_visa_payment'
  | 'payment_submitted'
  | 'payment_received'
  | 'payment_rejected'
  | 'payment_confirmation_submitted'
  | 'payment_confirmation_rejected'
  | 'submitted_to_immigration'
  | 'immigration_requested_documents'
  | 'visa_issued'
  | 'visa_rejected'
  | 'visa_approved'
  
  // Stage 4: Arrival & Enrollment
  | 'pre_arrival_checklist'
  | 'arrival_confirmed'
  | 'accommodation_arranged'
  | 'orientation_scheduled'
  | 'enrollment_in_progress'
  | 'enrollment_documents_submitted'
  | 'waiting_arrival_date'
  | 'arrival_date_confirmed'
  | 'student_arrived'
  | 'arrival_verified'
  | 'enrollment_confirmation_submitted'
  | 'enrollment_completed'
  | 'arrival_verification_rejected'
  | 'first_semester_started'
  | 'arrival_and_enrollment'
  | 'enrollment_verified'
  
  // Stage 5: Commission Processing
  | 'commission_calculation_pending'
  | 'commission_calculated'
  | 'commission_approved'
  | 'commission_payment_initiated'
  | 'commission_paid'
  | 'commission_disputed'
  | 'commission_resolved'
  | 'commission_eligible'
  
  // Terminal states
  | 'success'
  | 'rejected'
  | 'approved_stage1'
  | 'rejected_stage1'
  | 'correction_requested_admin'
  | 'documents_submitted'
  | 'documents_partially_submitted'
  | 'documents_under_review'
  | 'documents_approved'
  | 'documents_rejected'
  | 'documents_resubmission_required';

// Subflow types for document requests, payments, etc.
export type SubflowType = 'DocumentRequest' | 'Payment' | 'ProgramPayment' | 'ProgramChange';

export type SubflowState = 'requested' | 'provided' | 'approved' | 'rejected' | 'required' | 'amount_set' | 'submitted' | 'verified' | 'proposed' | 'accepted';

// Interface for canonical workflow state
export interface CanonicalWorkflowState {
  mainFlowStatus: MainFlowStatus;
  stage: number;
  activeSubflows: Array<{
    type: SubflowType;
    state: SubflowState;
    isBlocking: boolean;
    metadata?: Record<string, unknown>;
  }>;
  lastUpdated: string;
  updatedBy: string;
}

// Workflow transition rules
export interface WorkflowTransition {
  from: MainFlowStatus;
  to: MainFlowStatus;
  conditions?: string[];
  requiredRole?: 'admin' | 'partner';
  requiresApproval?: boolean;
  automaticTriggers?: string[];
}

// Status display configuration
export interface StatusDisplayConfig {
  mainFlowStatus: MainFlowStatus;
  userFriendlyText: {
    admin: string;
    partner: string;
  };
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedTimeframe: string;
  nextAction?: {
    admin?: string;
    partner?: string;
  };
  statusColor: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';
}
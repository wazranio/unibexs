import { WorkflowStage, WorkflowStatus } from '@/types';

export const STAGE_NAMES = {
  1: "Partner Application Submission (Pre-University Review)",
  2: "Offer Letter Stage",
  3: "Visa Processing",
  4: "Student Arrival & Enrollment",
  5: "Partner Commission"
} as const;

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    stage: 1,
    name: "Partner Application Submission (Pre-University Review)",
    description: "Initial submission through admin review and approval",
    statuses: [
      {
        key: "new_application",
        name: "New Application",
        description: "Partner has uploaded initial documents",
        nextAction: "Admin to review and decide",
        nextActor: "Admin",
        canTransitionTo: ["under_review_admin", "approved_stage1", "rejected_stage1", "correction_requested_admin"],
        allowedVerbs: ["review", "approve", "reject", "request_corrections"],
        preconditions: ["application_id exists", "partner uploaded docs"],
        inputs: ["application_files"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Under Review / Approved / Rejected / Correction Requested",
        notifications: [{to: "Partner", template: "status updated"}],
        auditLog: {event: "application.status_updated"}
      },
      {
        key: "under_review_admin",
        name: "Under Review by Admin",
        description: "Admin reviewing application documents",
        nextAction: "Decide: approve / reject / request corrections",
        nextActor: "Admin",
        canTransitionTo: ["approved_stage1", "rejected_stage1", "correction_requested_admin"],
        allowedVerbs: ["approve", "reject", "request_corrections"],
        preconditions: ["review complete"],
        inputs: ["application_files"],
        validationRules: ["reason_required on reject", "authority_matrix"],
        statusTransition: "→ Approved / Rejected / Correction Requested by Admin",
        notifications: [{to: "Partner", template: "decision & reason if any"}],
        auditLog: {event: "application.decision"}
      },
      {
        key: "correction_requested_admin",
        name: "Correction Requested by Admin",
        description: "Partner must upload requested corrections",
        nextAction: "Upload requested documents",
        nextActor: "Partner",
        canTransitionTo: ["documents_partially_submitted", "documents_submitted"],
        allowedVerbs: ["upload"],
        preconditions: ["correction_list provided by Admin"],
        inputs: ["application_files"],
        validationRules: ["filenames_required", "authority_matrix"],
        statusTransition: "→ Documents Submitted",
        notifications: [{to: "Admin", template: "partner uploaded corrections"}],
        auditLog: {event: "application.corrections_uploaded"}
      },
      {
        key: "documents_partially_submitted",
        name: "Documents Partially Submitted",
        description: "Partner has uploaded some but not all requested documents",
        nextAction: "Upload remaining documents",
        nextActor: "Partner",
        canTransitionTo: ["documents_submitted"],
        allowedVerbs: ["upload"],
        preconditions: ["some documents uploaded"],
        inputs: ["application_files"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Documents Submitted",
        notifications: [{to: "Partner", template: "upload remaining documents"}],
        auditLog: {event: "application.partial_upload"}
      },
      {
        key: "documents_submitted",
        name: "Documents Submitted",
        description: "Partner has uploaded all requested documents",
        nextAction: "Admin to review documents and decide",
        nextActor: "Admin",
        canTransitionTo: ["documents_under_review", "documents_approved", "documents_rejected", "documents_resubmission_required"],
        allowedVerbs: ["start_review", "approve", "reject", "request_resubmission"],
        preconditions: ["all requested documents uploaded"],
        inputs: ["application_files"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Documents Under Review / Approved / Rejected / Resubmission Required",
        notifications: [{to: "Admin", template: "documents ready for review"}],
        auditLog: {event: "application.documents_submitted"}
      },
      {
        key: "documents_under_review",
        name: "Documents Under Review",
        description: "Admin is reviewing the uploaded documents",
        nextAction: "Complete document review",
        nextActor: "Admin",
        canTransitionTo: ["documents_approved", "documents_rejected", "documents_resubmission_required"],
        allowedVerbs: ["approve", "reject", "request_resubmission"],
        preconditions: ["documents uploaded for review"],
        inputs: ["review_decisions"],
        validationRules: ["reason_required on reject", "authority_matrix"],
        statusTransition: "→ Documents Approved/Rejected/Resubmission Required",
        notifications: [{to: "Partner", template: "review decision"}],
        auditLog: {event: "application.documents_reviewed"}
      },
      {
        key: "documents_approved",
        name: "Documents Approved",
        description: "Admin approved all uploaded documents",
        nextAction: "Continue with application processing",
        nextActor: "Admin",
        canTransitionTo: ["under_review_admin", "approved_stage1"],
        allowedVerbs: ["continue_processing"],
        preconditions: ["all documents approved"],
        inputs: ["application_files"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Continue Processing",
        notifications: [{to: "Partner", template: "documents approved"}],
        auditLog: {event: "application.documents_approved"}
      },
      {
        key: "documents_rejected",
        name: "Documents Rejected",
        description: "Admin rejected uploaded documents - application cannot proceed",
        nextAction: "Application rejected - process ends",
        nextActor: "Admin",
        canTransitionTo: [],
        allowedVerbs: ["acknowledge"],
        preconditions: ["documents rejected with reason"],
        validationRules: ["reason_required"],
        statusTransition: "Flow ends",
        notifications: [{to: "Partner", template: "documents rejected"}],
        auditLog: {event: "application.documents_rejected"}
      },
      {
        key: "documents_resubmission_required",
        name: "Documents Resubmission Required",
        description: "Some documents need to be resubmitted with corrections",
        nextAction: "Resubmit requested documents",
        nextActor: "Partner",
        canTransitionTo: ["documents_partially_submitted", "documents_submitted"],
        allowedVerbs: ["resubmit"],
        preconditions: ["resubmission requirements specified"],
        inputs: ["application_files"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Documents Submitted",
        notifications: [{to: "Partner", template: "resubmission required"}],
        auditLog: {event: "application.resubmission_required"}
      },
      {
        key: "approved_stage1",
        name: "Approved",
        description: "Admin approved, ready for university submission",
        nextAction: "Prepare & submit to University",
        nextActor: "Admin",
        canTransitionTo: ["sent_to_university"],
        allowedVerbs: ["prepare", "submit"],
        preconditions: ["status = Approved", "dossier complete"],
        inputs: ["application_files"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Sent to University (Stage 1 closed; handover to Stage 2)",
        notifications: [{to: "Partner", template: "submitted to university"}],
        auditLog: {event: "university.submitted"}
      },
      {
        key: "rejected_stage1",
        name: "Rejected",
        description: "Admin rejected application",
        nextAction: "Acknowledge rejection",
        nextActor: "Partner",
        canTransitionTo: [],
        allowedVerbs: ["acknowledge"],
        preconditions: ["rejection reason present"],
        validationRules: ["reason_required"],
        statusTransition: "Flow ends",
        notifications: [{to: "Admin", template: "final"}, {to: "Partner", template: "final"}],
        auditLog: {event: "application.rejected_ack"}
      }
    ]
  },
  {
    stage: 2,
    name: "Offer Letter Stage",
    description: "University review and decision process",
    statuses: [
      {
        key: "sent_to_university",
        name: "Sent to University",
        description: "Application submitted to university for review",
        nextAction: "Review and respond",
        nextActor: "University",
        canTransitionTo: ["university_approved", "rejected_university", "university_requested_corrections", "program_change_suggested"],
        allowedVerbs: ["decide", "request_corrections"],
        preconditions: ["submission delivered"],
        inputs: ["submission_package"],
        validationRules: ["reason_required on reject / change"],
        statusTransition: "→ University Approved / Rejected / Requested Corrections / Program Change Suggested",
        notifications: [{to: "Admin", template: "await decision"}, {to: "Partner", template: "await decision"}],
        auditLog: {event: "university.review_in_progress"}
      },
      {
        key: "university_requested_corrections",
        name: "University Requested Corrections",
        description: "University requires additional documents",
        nextAction: "Upload requested documents",
        nextActor: "Partner",
        canTransitionTo: ["sent_to_university"],
        allowedVerbs: ["upload"],
        preconditions: ["correction_list from University"],
        inputs: ["application_files"],
        validationRules: ["filenames_required", "authority_matrix"],
        statusTransition: "→ Sent to University",
        notifications: [{to: "Admin", template: "partner uploaded corrections"}],
        auditLog: {event: "university.corrections_uploaded"}
      },
      {
        key: "program_change_suggested",
        name: "Program Change Suggested",
        description: "University suggests different program",
        nextAction: "Decide: accept / reject",
        nextActor: "Partner",
        canTransitionTo: ["program_change_accepted", "program_change_rejected"],
        allowedVerbs: ["decide"],
        preconditions: ["program_change_reason provided by Univ."],
        inputs: ["program_choice"],
        validationRules: ["reason_required from Univ.", "authority_matrix"],
        statusTransition: "→ Program Change Accepted / Program Change Rejected",
        notifications: [{to: "Admin", template: "awaiting partner decision"}],
        auditLog: {event: "university.program_change_suggested"}
      },
      {
        key: "program_change_accepted",
        name: "Program Change Accepted",
        description: "Partner accepted university's program change suggestion",
        nextAction: "Create new application for suggested program",
        nextActor: "Admin",
        canTransitionTo: ["sent_to_university"],
        allowedVerbs: ["create_new_application"],
        preconditions: ["partner accepted program change"],
        inputs: ["new_program_details"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Sent to University (with new program)",
        notifications: [{to: "Admin", template: "partner accepted, create new application"}],
        auditLog: {event: "university.program_change_accepted"}
      },
      {
        key: "program_change_rejected",
        name: "Program Change Rejected",
        description: "Partner rejected program change - continue with original or terminate",
        nextAction: "Choose: continue with original program or terminate application",
        nextActor: "Partner",
        canTransitionTo: ["sent_to_university", "rejected_university"],
        allowedVerbs: ["continue_original", "terminate"],
        preconditions: ["partner rejected program change"],
        inputs: ["rejection_reason"],
        validationRules: ["reason_required", "authority_matrix"],
        statusTransition: "→ Continue Original / Terminate Application",
        notifications: [{to: "Admin", template: "partner rejected program change"}],
        auditLog: {event: "university.program_change_rejected"}
      },
      {
        key: "university_approved",
        name: "University Approved",
        description: "University approved, offer letter ready",
        nextAction: "Upload & record Offer Letter; close Stage 2",
        nextActor: "Admin",
        canTransitionTo: ["offer_letter_issued"],
        allowedVerbs: ["upload", "change_status"],
        preconditions: ["approval notice received from University"],
        inputs: ["offer_letter"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Offer Letter Issued (Stage 2 closed; handover to Stage 3)",
        notifications: [{to: "Partner", template: "moving to Stage 3"}],
        auditLog: {event: "offer_letter.recorded"}
      },
      {
        key: "rejected_university",
        name: "Rejected by University",
        description: "University rejected application",
        nextAction: "Acknowledge rejection",
        nextActor: "Partner",
        canTransitionTo: [],
        allowedVerbs: ["acknowledge"],
        preconditions: ["rejection reason present"],
        validationRules: ["reason_required"],
        statusTransition: "Flow ends",
        notifications: [{to: "Admin", template: "final"}, {to: "Partner", template: "final"}],
        auditLog: {event: "university.rejected_ack"}
      }
    ]
  },
  {
    stage: 3,
    name: "Visa Processing",
    description: "Visa fee payment and immigration processing",
    statuses: [
      {
        key: "offer_letter_issued",
        name: "Offer Letter Issued (from Stage 2)",
        description: "Offer letter uploaded, ready for visa process",
        nextAction: "Start visa procedure (set fee & payment method)",
        nextActor: "Admin",
        canTransitionTo: ["waiting_visa_payment"],
        allowedVerbs: ["set_fee", "change_status"],
        preconditions: ["offer letter uploaded"],
        inputs: ["visa_fee_amount", "payment_method"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Waiting for Payment",
        notifications: [{to: "Partner", template: "fee & method"}],
        auditLog: {event: "visa.fee_requested"}
      },
      {
        key: "waiting_visa_payment",
        name: "Waiting for Payment",
        description: "Partner must upload proof of payment",
        nextAction: "Upload proof of payment",
        nextActor: "Partner",
        canTransitionTo: ["payment_submitted"],
        allowedVerbs: ["upload"],
        preconditions: ["visa_fee_amount set"],
        inputs: ["receipt"],
        validationRules: ["schema:receipt"],
        statusTransition: "→ Payment Submitted",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "visa.payment_uploaded"}
      },
      {
        key: "payment_submitted",
        name: "Payment Submitted",
        description: "Admin reviewing payment proof",
        nextAction: "Review payment proof",
        nextActor: "Admin",
        canTransitionTo: ["payment_received", "payment_rejected"],
        allowedVerbs: ["approve", "reject"],
        preconditions: ["receipt uploaded"],
        inputs: ["receipt"],
        validationRules: ["reason_required on reject", "authority_matrix"],
        statusTransition: "→ Payment Received / Payment Rejected",
        notifications: [{to: "Partner", template: "decision & reason if any"}],
        auditLog: {event: "visa.payment_decision"}
      },
      {
        key: "payment_rejected",
        name: "Payment Rejected",
        description: "Payment proof rejected, partner must resubmit",
        nextAction: "Re-upload correct payment proof",
        nextActor: "Partner",
        canTransitionTo: ["payment_submitted"],
        allowedVerbs: ["upload"],
        preconditions: ["rejection reason present"],
        inputs: ["receipt"],
        validationRules: ["schema:receipt", "authority_matrix"],
        statusTransition: "→ Payment Submitted",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "visa.payment_resubmitted"}
      },
      {
        key: "payment_received",
        name: "Payment Received",
        description: "Payment approved, ready for immigration submission",
        nextAction: "Submit to Immigration (record tracking number)",
        nextActor: "Admin",
        canTransitionTo: ["submitted_to_immigration"],
        allowedVerbs: ["submit", "record_tracking"],
        preconditions: ["payment approved"],
        inputs: ["tracking_number"],
        validationRules: ["tracking_number_required", "authority_matrix"],
        statusTransition: "→ Submitted to Immigration (with tracking/reference number)",
        notifications: [{to: "Partner", template: "notification"}],
        auditLog: {event: "immigration.submitted"}
      },
      {
        key: "submitted_to_immigration",
        name: "Submitted to Immigration (with tracking/reference number)",
        description: "Application submitted to immigration",
        nextAction: "Review and respond",
        nextActor: "Immigration",
        canTransitionTo: ["visa_issued", "visa_rejected", "immigration_requested_documents"],
        allowedVerbs: ["approve", "reject", "request_corrections"],
        preconditions: ["submission delivered"],
        inputs: ["case_file"],
        validationRules: ["reason_required on reject"],
        statusTransition: "→ Immigration Approved / Visa Rejected / Immigration Requested Documents",
        notifications: [{to: "Admin", template: "notification"}, {to: "Partner", template: "notification"}],
        auditLog: {event: "immigration.review_in_progress"}
      },
      {
        key: "immigration_requested_documents",
        name: "Immigration Requested Documents",
        description: "Immigration requires additional documents",
        nextAction: "Upload requested documents",
        nextActor: "Partner",
        canTransitionTo: ["submitted_to_immigration"],
        allowedVerbs: ["upload"],
        preconditions: ["document request received from Immigration"],
        inputs: ["application_files"],
        validationRules: ["filenames_required", "authority_matrix"],
        statusTransition: "→ Submitted to Immigration",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "immigration.docs_uploaded"}
      },
      {
        key: "visa_issued",
        name: "Visa Issued (with uploaded visa document/number)",
        description: "Visa approved with document and number uploaded",
        nextAction: "Confirm student arrival date",
        nextActor: "Partner",
        canTransitionTo: ["waiting_arrival_date"],
        allowedVerbs: ["confirm"],
        preconditions: ["visa_document & visa_number uploaded by Admin"],
        inputs: ["arrival_date"],
        validationRules: ["date_format=YYYY-MM-DD"],
        statusTransition: "handover → Stage 4 (Waiting Partner to confirm arrival date)",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "visa.arrival_date_confirmed"}
      },
      {
        key: "visa_rejected",
        name: "Visa Rejected",
        description: "Immigration rejected visa application",
        nextAction: "Acknowledge rejection",
        nextActor: "Partner",
        canTransitionTo: [],
        allowedVerbs: ["acknowledge"],
        preconditions: ["rejection reason present"],
        validationRules: ["reason_required"],
        statusTransition: "Flow ends",
        notifications: [{to: "Admin", template: "notification"}, {to: "Partner", template: "notification"}],
        auditLog: {event: "immigration.rejected_ack"}
      }
    ]
  },
  {
    stage: 4,
    name: "Student Arrival & Enrollment",
    description: "Student arrival confirmation and enrollment verification",
    statuses: [
      {
        key: "waiting_arrival_date",
        name: "Waiting Partner to confirm arrival date",
        description: "Partner must confirm planned arrival date",
        nextAction: "Confirm student arrival date",
        nextActor: "Partner",
        canTransitionTo: ["arrival_date_confirmed"],
        allowedVerbs: ["confirm"],
        preconditions: ["visa issued"],
        inputs: ["arrival_date"],
        validationRules: ["date_format=YYYY-MM-DD"],
        statusTransition: "→ Arrival Date Confirmed",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "arrival.date_confirmed"}
      },
      {
        key: "arrival_date_confirmed",
        name: "Arrival Date Confirmed",
        description: "Planned arrival date recorded",
        nextAction: "Confirm student has arrived",
        nextActor: "Partner",
        canTransitionTo: ["student_arrived"],
        allowedVerbs: ["confirm"],
        preconditions: ["arrival date recorded"],
        inputs: ["arrival_confirm"],
        validationRules: [],
        statusTransition: "→ Student Arrived",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "arrival.confirmed"}
      },
      {
        key: "student_arrived",
        name: "Student Arrived",
        description: "Partner confirmed student arrival",
        nextAction: "Verify arrival & update university system",
        nextActor: "Admin",
        canTransitionTo: ["arrival_verified", "arrival_verification_rejected"],
        allowedVerbs: ["verify", "update"],
        preconditions: ["partner confirmation received"],
        inputs: ["supporting_docs"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Student Arrival Verified / Arrival Verification Rejected",
        notifications: [{to: "Partner", template: "notification"}],
        auditLog: {event: "arrival.verified_decision"}
      },
      {
        key: "arrival_verified",
        name: "Student Arrival Verified",
        description: "Admin verified arrival, ready for enrollment",
        nextAction: "Confirm enrollment & upload enrollment proof",
        nextActor: "Partner",
        canTransitionTo: ["enrollment_confirmation_submitted"],
        allowedVerbs: ["confirm", "upload"],
        preconditions: ["arrival verified"],
        inputs: ["enrollment_proof"],
        validationRules: ["filenames_required"],
        statusTransition: "→ Enrollment Confirmation Submitted",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "enrollment.proof_uploaded"}
      },
      {
        key: "enrollment_confirmation_submitted",
        name: "Enrollment Confirmation Submitted",
        description: "Partner uploaded enrollment proof",
        nextAction: "Approve enrollment (or reject with reason)",
        nextActor: "Admin",
        canTransitionTo: ["enrollment_completed"],
        allowedVerbs: ["approve", "reject"],
        preconditions: ["enrollment proof uploaded"],
        inputs: ["enrollment_proof"],
        validationRules: ["reason_required"],
        statusTransition: "Approve → Enrollment Completed (Stage 4 closed; handover to Stage 5: Commission Pending)",
        notifications: [],
        auditLog: {event: "enrollment.decision"}
      },
      {
        key: "enrollment_completed",
        name: "Enrollment Completed",
        description: "Admin approved enrollment, stage 4 complete",
        nextAction: "Proceed to commission payment",
        nextActor: "Admin",
        canTransitionTo: ["commission_pending"],
        allowedVerbs: ["change_status"],
        preconditions: ["enrollment proof approved"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Commission Pending (Stage 4 closed; handover to Stage 5)",
        notifications: [{to: "Partner", template: "moving to commission stage"}],
        auditLog: {event: "enrollment.completed"}
      },
      {
        key: "arrival_verification_rejected",
        name: "Arrival Verification Rejected",
        description: "Admin rejected arrival verification",
        nextAction: "Provide justification/supporting documents",
        nextActor: "Partner",
        canTransitionTo: ["student_arrived"],
        allowedVerbs: ["upload"],
        preconditions: ["rejection reason present"],
        inputs: ["supporting_docs"],
        validationRules: ["filenames_required"],
        statusTransition: "→ Student Arrived",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "arrival.justification_uploaded"}
      }
    ]
  },
  {
    stage: 5,
    name: "Partner Commission",
    description: "Commission validation and payment processing",
    statuses: [
      {
        key: "commission_pending",
        name: "Commission Pending (from Stage 4)",
        description: "Enrollment completed, ready for commission process",
        nextAction: "Confirm payment & upload receipt",
        nextActor: "Partner",
        canTransitionTo: ["payment_confirmation_submitted"],
        allowedVerbs: ["confirm", "upload"],
        preconditions: ["enrollment completed"],
        inputs: ["receipt"],
        validationRules: ["schema:receipt"],
        statusTransition: "→ Payment Confirmation Submitted",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "commission.payment_uploaded"}
      },
      {
        key: "payment_confirmation_submitted",
        name: "Payment Confirmation Submitted",
        description: "Partner uploaded student payment proof",
        nextAction: "Review receipt",
        nextActor: "Admin",
        canTransitionTo: ["commission_approved", "payment_confirmation_rejected"],
        allowedVerbs: ["approve", "reject"],
        preconditions: ["receipt uploaded"],
        inputs: ["receipt"],
        validationRules: ["reason_required on reject"],
        statusTransition: "→ Commission Approved / Payment Confirmation Rejected",
        notifications: [{to: "Partner", template: "notification"}],
        auditLog: {event: "commission.payment_decision"}
      },
      {
        key: "payment_confirmation_rejected",
        name: "Payment Confirmation Rejected",
        description: "Payment proof rejected, partner must resubmit",
        nextAction: "Re-upload receipt / justification",
        nextActor: "Partner",
        canTransitionTo: ["payment_confirmation_submitted"],
        allowedVerbs: ["upload"],
        preconditions: ["rejection reason present"],
        inputs: ["receipt", "justification"],
        validationRules: ["filenames_required"],
        statusTransition: "→ Payment Confirmation Submitted",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "commission.payment_resubmitted"}
      },
      {
        key: "commission_approved",
        name: "Commission Approved",
        description: "Payment confirmed, commission ready for transfer",
        nextAction: "Transfer commission to Partner",
        nextActor: "Admin",
        canTransitionTo: ["commission_released"],
        allowedVerbs: ["transfer", "upload"],
        preconditions: ["payment confirmation approved", "amount set"],
        inputs: ["transfer_proof"],
        validationRules: ["authority_matrix"],
        statusTransition: "→ Commission Released",
        notifications: [{to: "Partner", template: "notification"}],
        auditLog: {event: "commission.released"}
      },
      {
        key: "commission_released",
        name: "Commission Released",
        description: "Commission transferred to partner",
        nextAction: "Confirm transfer (or dispute)",
        nextActor: "Partner",
        canTransitionTo: ["commission_paid", "commission_transfer_disputed"],
        allowedVerbs: ["confirm", "dispute"],
        preconditions: ["transfer proof available"],
        inputs: ["confirmation", "dispute_reason"],
        validationRules: [],
        statusTransition: "→ Commission Paid / Commission Transfer Disputed",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "commission.partner_feedback"}
      },
      {
        key: "commission_transfer_disputed",
        name: "Commission Transfer Disputed",
        description: "Partner disputed commission transfer",
        nextAction: "Re-upload transfer proof / resolve dispute",
        nextActor: "Admin",
        canTransitionTo: ["commission_released"],
        allowedVerbs: ["upload", "transfer"],
        preconditions: ["dispute reason provided"],
        inputs: ["transfer_proof"],
        validationRules: [],
        statusTransition: "→ Commission Released",
        notifications: [{to: "Partner", template: "notification"}],
        auditLog: {event: "commission.dispute_resolved"}
      },
      {
        key: "commission_paid",
        name: "Commission Paid",
        description: "Commission successfully paid to partner",
        nextAction: "Acknowledge completion",
        nextActor: "Partner",
        canTransitionTo: [],
        allowedVerbs: ["acknowledge"],
        preconditions: ["partner confirmed receipt"],
        validationRules: [],
        statusTransition: "→ Application Completed",
        notifications: [{to: "Admin", template: "notification"}],
        auditLog: {event: "application.completed"}
      }
    ]
  }
];

export class WorkflowService {
  static getStage(stageNumber: number): WorkflowStage | undefined {
    return WORKFLOW_STAGES.find(stage => stage.stage === stageNumber);
  }

  static getStatus(stageNumber: number, statusKey: string): WorkflowStatus | undefined {
    const stage = this.getStage(stageNumber);
    return stage?.statuses.find(status => status.key === statusKey);
  }

  static getAvailableTransitions(currentStage: number, currentStatus: string): WorkflowStatus[] {
    const status = this.getStatus(currentStage, currentStatus);
    if (!status) return [];

    const stage = this.getStage(currentStage);
    if (!stage) return [];

    return stage.statuses.filter(s => status.canTransitionTo.includes(s.key));
  }

  static getNextStageStatus(stage: number): string | null {
    const nextStage = this.getStage(stage + 1);
    return nextStage ? nextStage.statuses[0].key : null;
  }

  static validateStatusTransition(
    currentStage: number,
    currentStatus: string,
    newStatus: string
  ): boolean {
    const status = this.getStatus(currentStage, currentStatus);
    return status?.canTransitionTo.includes(newStatus) || false;
  }

  static getStatusDisplayName(stageNumber: number, statusKey: string): string {
    const status = this.getStatus(stageNumber, statusKey);
    return status?.name || statusKey;
  }

  static getNextAction(stageNumber: number, statusKey: string): string {
    const status = this.getStatus(stageNumber, statusKey);
    return status?.nextAction || 'No action required';
  }

  static getNextActor(stageNumber: number, statusKey: string): 'Admin' | 'Partner' | 'University' | 'Immigration' {
    const status = this.getStatus(stageNumber, statusKey);
    return status?.nextActor || 'Admin';
  }

  static requiresReason(stageNumber: number, statusKey: string): boolean {
    const status = this.getStatus(stageNumber, statusKey);
    return status?.requiresReason || false;
  }

  static getRequiredDocuments(stageNumber: number, statusKey: string): string[] {
    const status = this.getStatus(stageNumber, statusKey);
    return status?.requiresDocuments || [];
  }

  static getAllStatuses(): Record<string, string> {
    const statuses: Record<string, string> = {};
    
    WORKFLOW_STAGES.forEach(stage => {
      stage.statuses.forEach(status => {
        statuses[status.key] = status.name;
      });
    });

    return statuses;
  }

  static getStageName(stageNumber: number): string {
    return STAGE_NAMES[stageNumber as keyof typeof STAGE_NAMES] || `Stage ${stageNumber}`;
  }

  static getStageNames(): Record<number, string> {
    return { ...STAGE_NAMES };
  }

  static getAllStageOptions(): Array<{ value: number; label: string }> {
    return Object.entries(STAGE_NAMES).map(([stage, name]) => ({
      value: parseInt(stage),
      label: name
    }));
  }
}

// Re-export automation helpers
export { WorkflowAutomation } from './automation';
export { WorkflowRulesEngine } from './rules';
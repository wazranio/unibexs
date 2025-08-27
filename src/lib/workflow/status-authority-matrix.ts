/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Status-Based Authority Matrix for Stage 1
 * 
 * Direct implementation of PDF Workflow Matrix permissions
 * Maps each status to who can update it and what transitions are allowed
 */


export type StatusActor = 'Admin' | 'Partner' | 'System';

export interface StatusPermission {
  // Who sets this status initially
  setBy: StatusActor;
  // When/how this status gets set
  setTrigger: string;
  // Can Admin update from this status?
  adminCanUpdate: boolean;
  // Available transitions for Admin
  adminTransitions: string[];
  // What Admin does when they can't update
  adminWaitsFor?: string;
  // Can Partner update from this status?
  partnerCanUpdate: boolean;
  // Available transitions for Partner (often via actions like document upload)
  partnerTransitions: string[];
  // What Partner does when they can't update
  partnerWaitsFor?: string;
  // Can System update from this status?
  systemCanUpdate: boolean;
  // Available transitions for System (automatic)
  systemTransitions: string[];
}

/**
 * Complete Status Authority Matrix - Stage 1 & Stage 2 - Direct from PDF
 */
export const STATUS_AUTHORITY_MATRIX: Record<string, StatusPermission> = {
  // ===== STAGE 1 STATUSES =====
  // Row 1: new_application  
  new_application: {
    setBy: 'System',
    setTrigger: 'Partner submits application',
    adminCanUpdate: true,
    adminTransitions: ['under_review_admin', 'approved_stage1', 'rejected_stage1', 'correction_requested_admin'], // 4 transitions per updated PDF
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin decision',
    systemCanUpdate: true,
    systemTransitions: []
  },

  // Row 2: under_review_admin
  under_review_admin: {
    setBy: 'Admin',
    setTrigger: 'Admin receives new application',
    adminCanUpdate: true,
    adminTransitions: ['approved_stage1', 'rejected_stage1', 'correction_requested_admin'],
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin decision',
    systemCanUpdate: true,
    systemTransitions: []
  },

  // Row 3: correction_requested_admin
  correction_requested_admin: {
    setBy: 'Admin',
    setTrigger: 'Admin reviews and finds issues',
    adminCanUpdate: false,
    adminTransitions: [],
    adminWaitsFor: 'WAITS for Partner to upload corrections',
    partnerCanUpdate: true,
    partnerTransitions: ['documents_partially_submitted', 'documents_submitted'], // Via document upload
    systemCanUpdate: true,
    systemTransitions: ['documents_partially_submitted', 'documents_submitted']
  },

  // Row 4: documents_partially_submitted  
  documents_partially_submitted: {
    setBy: 'System',
    setTrigger: 'Partner uploads partial documents',
    adminCanUpdate: false,
    adminTransitions: [],
    adminWaitsFor: 'WAITS for Partner to complete upload',
    partnerCanUpdate: true,
    partnerTransitions: ['documents_submitted'], // Via completing upload
    systemCanUpdate: true,
    systemTransitions: ['documents_submitted']
  },

  // Row 5: documents_submitted
  documents_submitted: {
    setBy: 'System',
    setTrigger: 'Partner uploads all documents',
    adminCanUpdate: true,
    adminTransitions: ['documents_under_review', 'documents_approved', 'documents_rejected', 'documents_resubmission_required'], // 4 transitions per updated PDF
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin review',
    systemCanUpdate: true,
    systemTransitions: []
  },

  // Row 6: documents_under_review
  documents_under_review: {
    setBy: 'Admin',
    setTrigger: 'Admin starts reviewing documents',
    adminCanUpdate: true,
    adminTransitions: ['documents_approved', 'documents_rejected', 'documents_resubmission_required'],
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin review',
    systemCanUpdate: true,
    systemTransitions: []
  },

  // Row 7: documents_approved
  documents_approved: {
    setBy: 'Admin',
    setTrigger: 'Admin approves all documents',
    adminCanUpdate: true,
    adminTransitions: ['approved_stage1', 'correction_requested_admin'], // Allow requesting more documents even after approval
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for System to auto-approve Stage 1',
    systemCanUpdate: true,
    systemTransitions: ['approved_stage1'] // System auto-triggers final approval
  },

  // Row 8: documents_rejected
  documents_rejected: {
    setBy: 'Admin',
    setTrigger: 'Admin rejects documents completely',
    adminCanUpdate: true, // Allow admin to update from documents_rejected
    adminTransitions: ['correction_requested_admin', 'approved_stage1'], // Allow requesting corrections or approving anyway
    adminWaitsFor: 'Admin decision - request corrections or proceed with rejection',
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin decision',
    systemCanUpdate: true,
    systemTransitions: ['rejected_stage1'] // System triggers final rejection if admin doesn't intervene
  },

  // Row 9: documents_resubmission_required
  documents_resubmission_required: {
    setBy: 'Admin',
    setTrigger: 'Admin needs document corrections',
    adminCanUpdate: false,
    adminTransitions: [],
    adminWaitsFor: 'WAITS for Partner to resubmit documents',
    partnerCanUpdate: true,
    partnerTransitions: ['documents_partially_submitted'], // Via reupload
    systemCanUpdate: true,
    systemTransitions: ['documents_partially_submitted', 'documents_submitted']
  },

  // Row 10: approved_stage1
  approved_stage1: {
    setBy: 'System',
    setTrigger: 'Admin confirms documents and application',
    adminCanUpdate: true,
    adminTransitions: ['sent_to_university'], // Move to Stage 2
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin/System to send to university',
    systemCanUpdate: true,
    systemTransitions: ['sent_to_university'] // Auto-move to Stage 2
  },

  // Row 11: rejected_stage1
  rejected_stage1: {
    setBy: 'System',
    setTrigger: 'Admin rejects application',
    adminCanUpdate: false,
    adminTransitions: [],
    adminWaitsFor: 'Terminal status - no further action needed',
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'Terminal status - application rejected',
    systemCanUpdate: false,
    systemTransitions: [] // Terminal status
  },

  // Global Administrative Statuses - Available from any status
  application_cancelled: {
    setBy: 'Admin',
    setTrigger: 'Admin permanently cancels application',
    adminCanUpdate: false,
    adminTransitions: [], // Terminal state - no transitions
    adminWaitsFor: 'Application cancelled - terminal state',
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'Application cancelled - create new application',
    systemCanUpdate: false,
    systemTransitions: []
  },

  application_on_hold: {
    setBy: 'Admin',
    setTrigger: 'Admin temporarily holds application',
    adminCanUpdate: true,
    adminTransitions: [], // Will be dynamically populated with previous status
    adminWaitsFor: 'Admin decision to resume or cancel',
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'Application on hold - awaiting admin decision',
    systemCanUpdate: false,
    systemTransitions: []
  },

  // ===== STAGE 2 STATUSES =====
  
  // Row 1: sent_to_university
  sent_to_university: {
    setBy: 'System',
    setTrigger: 'Application approved Stage 1 and sent to university',
    adminCanUpdate: false,
    adminTransitions: [],
    adminWaitsFor: 'WAITS for University response',
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for University response',
    systemCanUpdate: true,
    systemTransitions: ['university_requested_corrections', 'university_acknowledged', 'university_declined', 'program_change_suggested']
  },

  // Row 2: university_requested_corrections
  university_requested_corrections: {
    setBy: 'System',
    setTrigger: 'University requests additional documents/corrections',
    adminCanUpdate: true,
    adminTransitions: ['corrections_in_progress', 'university_acknowledged'],
    partnerCanUpdate: true,
    partnerTransitions: ['corrections_in_progress'], // Via document upload
    systemCanUpdate: true,
    systemTransitions: ['corrections_in_progress']
  },

  // Row 3: corrections_in_progress
  corrections_in_progress: {
    setBy: 'System',
    setTrigger: 'Partner/Admin starts uploading requested corrections',
    adminCanUpdate: true,
    adminTransitions: ['corrections_submitted', 'university_requested_corrections'],
    partnerCanUpdate: true,
    partnerTransitions: ['corrections_submitted'], // Via completing upload
    systemCanUpdate: true,
    systemTransitions: ['corrections_submitted']
  },

  // Row 4: corrections_submitted
  corrections_submitted: {
    setBy: 'System',
    setTrigger: 'All requested corrections uploaded and submitted',
    adminCanUpdate: true,
    adminTransitions: ['sent_to_university', 'university_acknowledged'],
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for University response',
    systemCanUpdate: true,
    systemTransitions: ['university_acknowledged']
  },

  // Row 5: program_change_suggested
  program_change_suggested: {
    setBy: 'System',
    setTrigger: 'University suggests alternative program',
    adminCanUpdate: true,
    adminTransitions: ['program_change_accepted', 'program_change_declined', 'under_negotiation'],
    partnerCanUpdate: true,
    partnerTransitions: ['program_change_accepted', 'program_change_declined'],
    systemCanUpdate: true,
    systemTransitions: ['under_negotiation']
  },

  // Row 6: program_change_accepted
  program_change_accepted: {
    setBy: 'Partner',
    setTrigger: 'Partner accepts suggested program change',
    adminCanUpdate: true,
    adminTransitions: ['sent_to_university', 'university_acknowledged'],
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for updated application processing',
    systemCanUpdate: true,
    systemTransitions: ['sent_to_university', 'university_acknowledged']
  },

  // Row 7: program_change_declined
  program_change_declined: {
    setBy: 'Partner',
    setTrigger: 'Partner declines suggested program change',
    adminCanUpdate: true,
    adminTransitions: ['university_declined', 'under_negotiation'],
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin decision',
    systemCanUpdate: true,
    systemTransitions: ['university_declined']
  },

  // Row 8: under_negotiation
  under_negotiation: {
    setBy: 'System',
    setTrigger: 'Extended discussions between all parties',
    adminCanUpdate: true,
    adminTransitions: ['program_change_accepted', 'university_acknowledged', 'university_declined'],
    partnerCanUpdate: true,
    partnerTransitions: ['program_change_accepted', 'program_change_declined'],
    systemCanUpdate: true,
    systemTransitions: ['university_acknowledged', 'university_declined']
  },

  // Row 9: university_acknowledged
  university_acknowledged: {
    setBy: 'System',
    setTrigger: 'University accepts application and sends offer',
    adminCanUpdate: true,
    adminTransitions: ['approved_stage2'], // Move to Stage 3
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Admin/System to proceed to Stage 3',
    systemCanUpdate: true,
    systemTransitions: ['approved_stage2'] // Auto-move to Stage 3
  },

  // Row 10: university_declined  
  university_declined: {
    setBy: 'System',
    setTrigger: 'University rejects application',
    adminCanUpdate: true,
    adminTransitions: ['rejected_stage2'], // Final rejection
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'Terminal status - application rejected',
    systemCanUpdate: true,
    systemTransitions: ['rejected_stage2'] // Terminal rejection
  },

  // Row 11: approved_stage2
  approved_stage2: {
    setBy: 'System',
    setTrigger: 'Stage 2 complete - university acceptance confirmed',
    adminCanUpdate: true,
    adminTransitions: ['visa_processing_initiated'], // Move to Stage 3
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'WAITS for Stage 3 visa processing',
    systemCanUpdate: true,
    systemTransitions: ['visa_processing_initiated'] // Auto-move to Stage 3
  },

  // Row 12: rejected_stage2
  rejected_stage2: {
    setBy: 'System',
    setTrigger: 'University rejection confirmed',
    adminCanUpdate: false,
    adminTransitions: [],
    adminWaitsFor: 'Terminal status - no further action needed',
    partnerCanUpdate: false,
    partnerTransitions: [],
    partnerWaitsFor: 'Terminal status - application rejected',
    systemCanUpdate: false,
    systemTransitions: [] // Terminal status
  }
};

// Legacy export for backward compatibility
export const STAGE_1_STATUS_AUTHORITY = STATUS_AUTHORITY_MATRIX;

/**
 * Status Authority Matrix Service
 */
export class StatusAuthorityService {
  /**
   * Check if an actor can update from a specific status
   */
  static canActorUpdate(status: string, actor: StatusActor): boolean {
    const permission = STATUS_AUTHORITY_MATRIX[status];
    if (!permission) return false;

    switch (actor) {
      case 'Admin':
        return permission.adminCanUpdate;
      case 'Partner':
        return permission.partnerCanUpdate;
      case 'System':
        return permission.systemCanUpdate;
      default:
        return false;
    }
  }

  /**
   * Get available transitions for an actor from a status
   */
  static getAvailableTransitions(status: string, actor: StatusActor): string[] {
    const permission = STATUS_AUTHORITY_MATRIX[status];
    if (!permission) return [];

    switch (actor) {
      case 'Admin':
        return permission.adminTransitions;
      case 'Partner':
        return permission.partnerTransitions;
      case 'System':
        return permission.systemTransitions;
      default:
        return [];
    }
  }

  /**
   * Validate a status transition
   */
  static validateTransition(
    currentStatus: string,
    targetStatus: string,
    actor: StatusActor
  ): { 
    allowed: boolean; 
    reason?: string; 
    specViolation?: boolean;
  } {
    // Get available transitions for actor
    const availableTransitions = this.getAvailableTransitions(currentStatus, actor);
    
    // Check if transition is allowed
    const allowed = availableTransitions.includes(targetStatus);
    
    if (!allowed) {
      const permission = STATUS_AUTHORITY_MATRIX[currentStatus];
      if (!permission) {
        return {
          allowed: false,
          reason: `Unknown status: ${currentStatus}`,
          specViolation: true
        };
      }

      // Check if actor can update at all
      const canUpdate = this.canActorUpdate(currentStatus, actor);
      if (!canUpdate) {
        return {
          allowed: false,
          reason: `${actor} cannot update from status: ${currentStatus}`,
          specViolation: true
        };
      }

      return {
        allowed: false,
        reason: `Invalid transition: ${currentStatus} → ${targetStatus} for ${actor}`,
        specViolation: true
      };
    }

    return { allowed: true };
  }

  /**
   * Get who can set a particular status
   */
  static getStatusSetBy(status: string): StatusActor | null {
    const permission = STATUS_AUTHORITY_MATRIX[status];
    return permission ? permission.setBy : null;
  }

  /**
   * Get the trigger event for a status
   */
  static getStatusTrigger(status: string): string | null {
    const permission = STATUS_AUTHORITY_MATRIX[status];
    return permission ? permission.setTrigger : null;
  }

  /**
   * Get all statuses that an actor can update
   */
  static getUpdatableStatuses(actor: StatusActor): string[] {
    const updatableStatuses: string[] = [];
    
    for (const [status, _permission] of Object.entries(STATUS_AUTHORITY_MATRIX)) {
      if (this.canActorUpdate(status, actor)) {
        updatableStatuses.push(status);
      }
    }
    
    return updatableStatuses;
  }

  /**
   * Get comprehensive status information for UI
   */
  static getStatusInfo(status: string): {
    setBy: StatusActor;
    trigger: string;
    adminActions: { canUpdate: boolean; transitions: string[] };
    partnerActions: { canUpdate: boolean; transitions: string[] };
    systemActions: { canUpdate: boolean; transitions: string[] };
    adminWaitsFor?: string;
    partnerWaitsFor?: string;
  } | null {
    const permission = STATUS_AUTHORITY_MATRIX[status];
    if (!permission) return null;

    return {
      setBy: permission.setBy,
      trigger: permission.setTrigger,
      adminActions: {
        canUpdate: permission.adminCanUpdate,
        transitions: permission.adminTransitions
      },
      partnerActions: {
        canUpdate: permission.partnerCanUpdate,
        transitions: permission.partnerTransitions
      },
      systemActions: {
        canUpdate: permission.systemCanUpdate,
        transitions: permission.systemTransitions
      },
      adminWaitsFor: permission.adminWaitsFor,
      partnerWaitsFor: permission.partnerWaitsFor
    };
  }

  /**
   * Debug: Print the complete matrix
   */
  static printMatrix(): void {
    console.table(
      Object.entries(STATUS_AUTHORITY_MATRIX).map(([status, permission]) => ({
        Status: status,
        'Set By': permission.setBy,
        'Admin Can Update': permission.adminCanUpdate ? '✅' : '❌',
        'Admin Transitions': permission.adminTransitions.length,
        'Partner Can Update': permission.partnerCanUpdate ? '✅' : '❌', 
        'Partner Transitions': permission.partnerTransitions.length,
        'System Can Update': permission.systemCanUpdate ? '✅' : '❌',
        'System Transitions': permission.systemTransitions.length
      }))
    );
  }

  /**
   * Validate entire matrix against PDF (Stage 1 & 2)
   */
  static validateAgainstPDF(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check that all Stage 1 & 2 statuses are defined
    const expectedStatuses = [
      // Stage 1 statuses
      'new_application',
      'under_review_admin', 
      'correction_requested_admin',
      'documents_partially_submitted',
      'documents_submitted',
      'documents_under_review',
      'documents_approved',
      'documents_rejected',
      'documents_resubmission_required',
      'approved_stage1',
      'rejected_stage1',
      // Terminal statuses
      'application_cancelled',
      'application_on_hold',
      // Stage 2 statuses
      'sent_to_university',
      'university_requested_corrections',
      'corrections_in_progress',
      'corrections_submitted',
      'program_change_suggested',
      'program_change_accepted',
      'program_change_declined',
      'under_negotiation',
      'university_acknowledged',
      'university_declined',
      'approved_stage2',
      'rejected_stage2'
    ];
    
    for (const status of expectedStatuses) {
      if (!STATUS_AUTHORITY_MATRIX[status]) {
        issues.push(`Missing status definition: ${status}`);
      }
    }
    
    // PDF-specific validations
    const tests = [
      // new_application: Admin can update, Partner cannot
      () => {
        const info = this.getStatusInfo('new_application');
        if (!info?.adminActions.canUpdate) issues.push('new_application: Admin should be able to update');
        if (info?.partnerActions.canUpdate) issues.push('new_application: Partner should NOT be able to update');
      },
      
      // correction_requested_admin: Admin cannot update, Partner can
      () => {
        const info = this.getStatusInfo('correction_requested_admin');
        if (info?.adminActions.canUpdate) issues.push('correction_requested_admin: Admin should NOT be able to update');
        if (!info?.partnerActions.canUpdate) issues.push('correction_requested_admin: Partner should be able to update');
      },
      
      // documents_partially_submitted: Admin cannot update, Partner can
      () => {
        const info = this.getStatusInfo('documents_partially_submitted');
        if (info?.adminActions.canUpdate) issues.push('documents_partially_submitted: Admin should NOT be able to update');
        if (!info?.partnerActions.canUpdate) issues.push('documents_partially_submitted: Partner should be able to update');
      }
    ];
    
    tests.forEach(test => test());
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}
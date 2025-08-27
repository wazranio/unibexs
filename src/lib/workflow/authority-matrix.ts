// Status Authority Matrix - defines who can update which status and available transitions

export type Actor = 'Admin' | 'Partner' | 'University' | 'Immigration' | 'System';

export interface StatusAuthority {
  status: string;
  canUpdate: {
    Admin: boolean;
    Partner: boolean;
    University: boolean;
    Immigration: boolean;
    System: boolean;
  };
  availableTransitions: {
    Admin: string[];
    Partner: string[];
    University: string[];
    Immigration: string[];
    System: string[];
  };
  description: string;
}

// Authority matrix based on the workflow PDF
export const STATUS_AUTHORITY_MATRIX: StatusAuthority[] = [
  // Stage 1 Statuses
  {
    status: 'new_application',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['under_review_admin', 'correction_requested_admin', 'approved_stage1'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'New application submitted by partner'
  },
  {
    status: 'under_review_admin',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['approved_stage1', 'rejected_stage1', 'correction_requested_admin'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Admin reviewing application'
  },
  {
    status: 'correction_requested_admin',
    canUpdate: {
      Admin: false,
      Partner: true,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: [],
      Partner: ['documents_partially_submitted', 'documents_submitted'],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Admin requested corrections from partner'
  },
  {
    status: 'documents_partially_submitted',
    canUpdate: {
      Admin: false,
      Partner: true,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: [],
      Partner: ['documents_submitted'],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Partner uploaded some documents'
  },
  {
    status: 'documents_submitted',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['documents_under_review', 'documents_approved', 'documents_rejected'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Partner submitted all requested documents'
  },
  {
    status: 'documents_under_review',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['documents_approved', 'documents_rejected', 'documents_resubmission_required'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Admin reviewing submitted documents'
  },
  {
    status: 'documents_approved',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['approved_stage1'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Admin approved submitted documents'
  },
  {
    status: 'documents_rejected',
    canUpdate: {
      Admin: false,
      Partner: false,
      University: false,
      Immigration: false,
      System: true
    },
    availableTransitions: {
      Admin: [],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Documents rejected - terminal state'
  },
  {
    status: 'documents_resubmission_required',
    canUpdate: {
      Admin: false,
      Partner: true,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: [],
      Partner: ['documents_partially_submitted', 'documents_submitted'],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Partner must resubmit corrected documents'
  },
  {
    status: 'approved_stage1',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['sent_to_university'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Stage 1 approved, ready for university submission'
  },
  {
    status: 'rejected_stage1',
    canUpdate: {
      Admin: false,
      Partner: false,
      University: false,
      Immigration: false,
      System: true
    },
    availableTransitions: {
      Admin: [],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Application rejected at Stage 1 - terminal state'
  },

  // Stage 2 Statuses
  {
    status: 'sent_to_university',
    canUpdate: {
      Admin: false,
      Partner: false,
      University: true,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: [],
      Partner: [],
      University: ['university_approved', 'rejected_university', 'university_requested_corrections', 'program_change_suggested'],
      Immigration: [],
      System: []
    },
    description: 'Application sent to university for review'
  },
  {
    status: 'university_requested_corrections',
    canUpdate: {
      Admin: false,
      Partner: true,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: [],
      Partner: ['sent_to_university'],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'University requested additional documents'
  },
  {
    status: 'program_change_suggested',
    canUpdate: {
      Admin: false,
      Partner: false,
      University: false,
      Immigration: false,
      System: true
    },
    availableTransitions: {
      Admin: [],
      Partner: ['program_change_accepted', 'program_change_rejected'],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'University suggested program change - awaiting partner decision'
  },
  {
    status: 'program_change_accepted',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['sent_to_university'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Partner accepted program change'
  },
  {
    status: 'program_change_rejected',
    canUpdate: {
      Admin: false,
      Partner: true,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: [],
      Partner: ['sent_to_university', 'rejected_university'],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'Partner rejected program change'
  },
  {
    status: 'university_approved',
    canUpdate: {
      Admin: true,
      Partner: false,
      University: false,
      Immigration: false,
      System: false
    },
    availableTransitions: {
      Admin: ['offer_letter_issued'],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'University approved application'
  },
  {
    status: 'rejected_university',
    canUpdate: {
      Admin: false,
      Partner: false,
      University: false,
      Immigration: false,
      System: true
    },
    availableTransitions: {
      Admin: [],
      Partner: [],
      University: [],
      Immigration: [],
      System: []
    },
    description: 'University rejected application - terminal state'
  }
];

export class StatusAuthorityService {
  static canActorUpdate(status: string, actor: Actor): boolean {
    const authority = STATUS_AUTHORITY_MATRIX.find(auth => auth.status === status);
    return authority?.canUpdate[actor] || false;
  }

  static getAvailableTransitions(status: string, actor: Actor): string[] {
    const authority = STATUS_AUTHORITY_MATRIX.find(auth => auth.status === status);
    return authority?.availableTransitions[actor] || [];
  }

  static validateTransition(currentStatus: string, newStatus: string, actor: Actor): { allowed: boolean; reason?: string; specViolation?: boolean } {
    const availableTransitions = this.getAvailableTransitions(currentStatus, actor);
    const allowed = availableTransitions.includes(newStatus);
    
    if (!allowed) {
      return {
        allowed: false,
        reason: `${actor} cannot transition from ${currentStatus} to ${newStatus}`,
        specViolation: true
      };
    }
    
    return { allowed: true };
  }

  static validateStatusTransition(application: { currentStatus: string }, targetStatus: string, actor: 'Admin' | 'Partner'): { allowed: boolean; reason?: string; specViolation?: boolean } {
    return this.validateTransition(application.currentStatus, targetStatus, actor);
  }

  static getStatusDescription(status: string): string {
    const authority = STATUS_AUTHORITY_MATRIX.find(auth => auth.status === status);
    return authority?.description || 'Unknown status';
  }

  static getAllStatusesForActor(actor: Actor): string[] {
    return STATUS_AUTHORITY_MATRIX
      .filter(auth => auth.canUpdate[actor])
      .map(auth => auth.status);
  }

  static getAuthorityMatrix(): StatusAuthority[] {
    return [...STATUS_AUTHORITY_MATRIX];
  }
}
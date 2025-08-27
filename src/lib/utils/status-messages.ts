/**
 * Shared Status Messages System
 * 
 * Context-aware, human-readable messages for all application statuses.
 * Provides both waiting messages and next action messages for admin and partner perspectives.
 */

import { Application } from '@/types';

export interface StatusMessage {
  admin: {
    waiting: string;
    next: string;
  };
  partner: {
    waiting: string;
    next: string;
  };
}

export const STATUS_MESSAGES: Record<string, StatusMessage> = {
  // Stage 1 statuses
  'new_application': {
    admin: { waiting: 'Ready for your review', next: 'Review and approve for university submission' },
    partner: { waiting: 'Under admin review', next: 'Admin will review and make a decision' }
  },
  'under_review_admin': {
    admin: { waiting: 'You are currently reviewing', next: 'Complete review and make decision' },
    partner: { waiting: 'Admin is reviewing your submission', next: 'Admin will provide feedback soon' }
  },
  'correction_requested_admin': {
    admin: { waiting: 'Awaiting partner document updates', next: 'Partner will upload requested documents' },
    partner: { waiting: 'Documents needed - check requirements', next: 'Upload requested documents' }
  },
  'documents_partially_submitted': {
    admin: { waiting: 'Partial document upload in progress', next: 'Partner will complete document submission' },
    partner: { waiting: 'Complete your document upload', next: 'Upload remaining required documents' }
  },
  'documents_submitted': {
    admin: { waiting: 'Documents ready for review', next: 'Review submitted documents' },
    partner: { waiting: 'Documents under admin review', next: 'Admin will verify documents' }
  },
  'documents_under_review': {
    admin: { waiting: 'You are reviewing documents', next: 'Complete document verification' },
    partner: { waiting: 'Documents being verified', next: 'Admin will complete document review' }
  },
  'documents_approved': {
    admin: { waiting: 'Documents verified successfully', next: 'Proceed to final approval' },
    partner: { waiting: 'Documents approved by admin', next: 'Admin will complete final review' }
  },
  'documents_rejected': {
    admin: { waiting: 'Documents rejected - corrections needed', next: 'Partner will resubmit documents' },
    partner: { waiting: 'Document corrections required', next: 'Resubmit documents with fixes' }
  },
  'documents_resubmission_required': {
    admin: { waiting: 'Awaiting document resubmission', next: 'Partner will provide corrected documents' },
    partner: { waiting: 'Resubmit corrected documents', next: 'Upload improved documents' }
  },
  'approved_stage1': {
    admin: { waiting: 'Ready for university submission', next: 'Send to university for evaluation' },
    partner: { waiting: 'Approved - pending university submission', next: 'Admin will forward to university' }
  },
  'rejected_stage1': {
    admin: { waiting: 'Application rejected - terminal', next: 'No further action - application closed' },
    partner: { waiting: 'Application not approved', next: 'Consider resubmission with improvements' }
  },
  
  // Stage 2 statuses
  'sent_to_university': {
    admin: { waiting: 'University is evaluating application', next: 'University will provide decision' },
    partner: { waiting: 'University reviewing application', next: 'Awaiting university response' }
  },
  'university_requested_corrections': {
    admin: { waiting: 'University needs additional information', next: 'Guide partner with university requirements' },
    partner: { waiting: 'University requires updates', next: 'Submit required information' }
  },
  'program_change_suggested': {
    admin: { waiting: 'Program change proposal pending', next: 'Review and approve change request' },
    partner: { waiting: 'Alternative program suggested', next: 'Accept or reject program change' }
  },
  'program_change_accepted': {
    admin: { waiting: 'Program change approved', next: 'Process updated application' },
    partner: { waiting: 'Program change accepted', next: 'Application updated with new program' }
  },
  'program_change_rejected': {
    admin: { waiting: 'Program change declined', next: 'Continue with original application' },
    partner: { waiting: 'Program change not accepted', next: 'Proceeding with original program' }
  },
  'university_approved': {
    admin: { waiting: 'University approved - processing offer', next: 'Generate and send offer letter' },
    partner: { waiting: 'University acceptance received', next: 'Offer letter being prepared' }
  },
  'rejected_university': {
    admin: { waiting: 'University rejection - terminal', next: 'No further action - application closed' },
    partner: { waiting: 'University did not approve', next: 'Consider alternative programs' }
  },
  'offer_letter_issued': {
    admin: { waiting: 'Offer letter sent successfully', next: 'Proceed to visa processing stage' },
    partner: { waiting: 'Offer letter received', next: 'Prepare for visa application' }
  },
  
  // Special statuses
  'application_on_hold': {
    admin: { waiting: 'Application paused by admin', next: 'Resume to continue processing' },
    partner: { waiting: 'Processing temporarily paused', next: 'Admin will resume when ready' }
  },
  'application_cancelled': {
    admin: { waiting: 'Application terminated permanently', next: 'No further action possible' },
    partner: { waiting: 'Application cancelled', next: 'No further action possible' }
  }
};

/**
 * Get status message for an application
 */
export const getStatusMessage = (app: Application, isAdmin: boolean, type: 'waiting' | 'next'): string => {
  // Special handling for terminal statuses
  if (app.currentStatus === 'application_cancelled') {
    return type === 'next' ? 'No next steps - application cancelled' : 'Application terminated permanently';
  }
  
  if (app.currentStatus === 'application_on_hold') {
    if (type === 'waiting') {
      return app.holdReason ? `On hold: ${app.holdReason}` : 'Application is on hold - awaiting resume';
    } else {
      return isAdmin ? 'Resume application to continue' : 'Waiting for admin to resume';
    }
  }
  
  // Terminal statuses
  if (app.currentStatus === 'rejected_stage1' || app.currentStatus === 'rejected_university') {
    return type === 'next' ? 'Application journey ended' : 'Application terminated';
  }
  
  // Use status message mapping
  const statusMsg = STATUS_MESSAGES[app.currentStatus];
  if (statusMsg) {
    const roleMsg = isAdmin ? statusMsg.admin : statusMsg.partner;
    return roleMsg[type];
  }
  
  // Fallback for unmapped statuses
  return type === 'next' ? 'Check status for next steps' : 'Processing in progress';
};

/**
 * Get contextual readiness status for an application
 */
export const getReadinessMessage = (app: Application, isAdmin: boolean): { ready: boolean; message: string; type: 'success' | 'info' | 'warning' | 'error' } => {
  // Special handling for terminal statuses
  if (app.currentStatus === 'application_cancelled') {
    return { 
      ready: false, 
      message: app.cancelReason ? `Cancelled: ${app.cancelReason}` : 'Application has been cancelled - no actions available',
      type: 'error'
    };
  }
  
  if (app.currentStatus === 'application_on_hold') {
    return { 
      ready: false, 
      message: app.holdReason ? `On hold: ${app.holdReason}` : 'Application is on hold - awaiting resume',
      type: 'warning'
    };
  }
  
  // Use context-aware message
  const statusMsg = STATUS_MESSAGES[app.currentStatus];
  if (statusMsg) {
    const roleMsg = isAdmin ? statusMsg.admin : statusMsg.partner;
    return { 
      ready: false, 
      message: roleMsg.waiting,
      type: 'info'
    };
  }
  
  // Fallback
  return { 
    ready: false, 
    message: 'Processing in progress',
    type: 'info'
  };
};
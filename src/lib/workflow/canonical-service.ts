/* eslint-disable @typescript-eslint/no-unused-vars */
import { Application } from '@/types';
import { MainFlowStatus } from '@/types/canonical-workflow';

export interface SubflowState {
  type: 'DocumentRequest' | 'Payment' | 'ProgramPayment' | 'ProgramChange';
  state: 'requested' | 'provided' | 'approved' | 'rejected' | 'required' | 'amount_set' | 'submitted' | 'verified' | 'proposed' | 'accepted';
  isBlocking: boolean;
  metadata?: Record<string, unknown>;
}

export class CanonicalWorkflowService {
  static getActiveSubflowsForLegacyApp(app: Application, _userRole: 'admin' | 'partner'): SubflowState[] {
    const subflows: SubflowState[] = [];

    // Based on current status, determine active subflows
    switch (app.currentStatus) {
      case 'correction_requested_admin':
      case 'documents_resubmission_required':
        subflows.push({
          type: 'DocumentRequest',
          state: 'requested',
          isBlocking: true,
        });
        break;

      case 'documents_submitted':
      case 'documents_under_review':
        subflows.push({
          type: 'DocumentRequest',
          state: 'provided',
          isBlocking: false,
        });
        break;

      case 'waiting_visa_payment':
        subflows.push({
          type: 'Payment',
          state: 'required',
          isBlocking: true,
          metadata: { paymentType: 'visa' }
        });
        break;

      case 'program_payment_required':
        subflows.push({
          type: 'ProgramPayment',
          state: 'required',
          isBlocking: true,
          metadata: { paymentType: 'program' }
        });
        break;

      case 'payment_submitted':
      case 'program_payment_submitted':
        subflows.push({
          type: app.currentStatus.includes('program') ? 'ProgramPayment' : 'Payment',
          state: 'submitted',
          isBlocking: false,
        });
        break;

      case 'payment_rejected':
        subflows.push({
          type: 'Payment',
          state: 'rejected',
          isBlocking: true,
          metadata: { paymentType: 'visa' }
        });
        break;

      case 'program_change_suggested':
        subflows.push({
          type: 'ProgramChange',
          state: 'proposed',
          isBlocking: true,
        });
        break;
    }

    return subflows;
  }

  static getMainFlowStatus(status: string): MainFlowStatus | null {
    const validStatuses: MainFlowStatus[] = [
      'new_application', 'submitted', 'under_review_admin', 'stage1_approved',
      'sent_to_university', 'university_review', 'university_approved',
      'offer_letter_issued', 'visa_processing', 'visa_approved',
      'arrival_and_enrollment', 'enrollment_verified', 'commission_eligible', 'success'
    ];

    return validStatuses.includes(status as MainFlowStatus) ? status as MainFlowStatus : null;
  }
}
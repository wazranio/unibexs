/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * System Triggers for Automatic Workflow Status Changes
 * 
 * Based on PDF Workflow Matrix - Stage 1 System Actor Events
 * Handles automatic status transitions that should be triggered by system events
 */

import { Application } from '@/types';
import { StorageService } from '@/lib/data/storage';

export interface SystemTriggerEvent {
  type: 'application_submitted' | 'documents_uploaded' | 'admin_decision' | 'stage_completed';
  applicationId: string;
  data?: Record<string, unknown>;
  triggeredBy: string;
  timestamp: string;
}

export interface TriggerResult {
  success: boolean;
  previousStatus: string;
  newStatus: string;
  message: string;
  triggeredAt: string;
}

export class SystemTriggers {
  /**
   * Stage 1 System Triggers based on PDF Matrix
   */

  /**
   * Trigger: Partner submits application
   * Event: application_submitted
   * Action: Set status to "new_application"
   */
  static onApplicationSubmitted(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Only trigger if coming from draft or initial state
    if (previousStatus !== 'draft' && previousStatus !== '') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Application already submitted',
        triggeredAt: new Date().toISOString()
      };
    }

    // System sets to "new_application"
    const updatedApp = {
      ...application,
      currentStatus: 'new_application',
      nextAction: 'Change status to Under Review by Admin',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'new_application',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Application submitted by partner'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);

    // Emit event for UI updates
    this.emitStatusChange(applicationId, previousStatus, 'new_application', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'new_application',
      message: 'Application automatically set to new_application by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Partner uploads some but not all requested documents
   * Event: documents_uploaded (partial)
   * Action: Set status to "documents_partially_submitted"
   */
  static onPartialDocumentsUploaded(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Only trigger from correction_requested_admin or documents_resubmission_required
    if (!['correction_requested_admin', 'documents_resubmission_required'].includes(previousStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Invalid status for partial document upload',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'documents_partially_submitted',
      nextAction: 'Upload remaining documents',
      nextActor: 'Partner' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'documents_partially_submitted',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Partner uploaded partial documents'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'documents_partially_submitted', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'documents_partially_submitted',
      message: 'Status automatically set to documents_partially_submitted by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Partner uploads all requested documents
   * Event: documents_uploaded (complete)
   * Action: Set status to "documents_submitted"
   */
  static onAllDocumentsUploaded(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can trigger from correction_requested_admin, documents_partially_submitted, or documents_resubmission_required
    const validPreviousStatuses = [
      'correction_requested_admin',
      'documents_partially_submitted', 
      'documents_resubmission_required'
    ];
    
    if (!validPreviousStatuses.includes(previousStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Invalid status for complete document upload',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'documents_submitted',
      nextAction: 'Admin to start document review',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'documents_submitted',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Partner uploaded all requested documents'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'documents_submitted', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'documents_submitted',
      message: 'Status automatically set to documents_submitted by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Admin confirms final approval for Stage 1
   * Event: admin_decision (approve)
   * Action: Set status to "approved_stage1"
   */
  static onStage1FinalApproval(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can only trigger from documents_approved
    if (previousStatus !== 'documents_approved') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only approve Stage 1 from documents_approved status',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'approved_stage1',
      nextAction: 'Prepare & submit to University',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'approved_stage1',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Stage 1 approved by admin - ready for university'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'approved_stage1', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'approved_stage1',
      message: 'Status automatically set to approved_stage1 by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Admin makes final rejection decision
   * Event: admin_decision (reject)
   * Action: Set status to "rejected_stage1"
   */
  static onStage1FinalRejection(applicationId: string, triggeredBy: string, reason?: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can trigger from multiple admin review statuses
    const validPreviousStatuses = [
      'new_application',
      'under_review_admin', 
      'documents_under_review',
      'documents_rejected'
    ];
    
    if (!validPreviousStatuses.includes(previousStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Invalid status for final rejection',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'rejected_stage1',
      nextAction: 'Acknowledge rejection',
      nextActor: 'Partner' as const,
      rejectionReason: reason || 'Application rejected by admin',
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'rejected_stage1',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: reason || 'Application rejected by admin'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'rejected_stage1', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'rejected_stage1',
      message: 'Status automatically set to rejected_stage1 by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Helper: Check if application has all required documents uploaded
   */
  private static hasAllRequiredDocuments(applicationId: string): boolean {
    const application = StorageService.getApplication(applicationId);
    if (!application || !application.documentsRequired || application.documentsRequired.length === 0) {
      return true; // No specific documents required
    }

    const documents = StorageService.getDocuments().filter(doc => 
      doc.applicationId === applicationId && 
      doc.status === 'approved'
    );

    // Check if all required document types are present
    return application.documentsRequired.every(requiredType => 
      documents.some(doc => doc.type === requiredType)
    );
  }

  /**
   * Helper: Check if application has some but not all required documents
   */
  private static hasPartialRequiredDocuments(applicationId: string): boolean {
    const application = StorageService.getApplication(applicationId);
    if (!application || !application.documentsRequired || application.documentsRequired.length === 0) {
      return false; // No requirements to be partial about
    }

    const documents = StorageService.getDocuments().filter(doc => 
      doc.applicationId === applicationId && 
      ['pending', 'approved'].includes(doc.status)
    );

    const hasAny = documents.length > 0;
    const hasAll = application.documentsRequired.every(requiredType => 
      documents.some(doc => doc.type === requiredType)
    );

    return hasAny && !hasAll;
  }

  /**
   * Smart Document Upload Handler
   * Automatically determines if upload is partial or complete and triggers appropriate status
   */
  static onDocumentUpload(applicationId: string, _triggeredBy: string): TriggerResult {
    if (this.hasAllRequiredDocuments(applicationId)) {
      return this.onAllDocumentsUploaded(applicationId, _triggeredBy);
    } else if (this.hasPartialRequiredDocuments(applicationId)) {
      return this.onPartialDocumentsUploaded(applicationId, _triggeredBy);
    } else {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'No valid documents uploaded',
        triggeredAt: new Date().toISOString()
      };
    }
  }

  /**
   * Helper: Emit status change event for UI updates
   */
  private static emitStatusChange(applicationId: string, previousStatus: string, newStatus: string, actor: string) {
    // Custom event for components listening to status changes
    const event = new CustomEvent('applicationStatusChanged', {
      detail: {
        applicationId,
        previousStatus,
        newStatus,
        actor,
        timestamp: new Date().toISOString(),
        source: 'SystemTrigger'
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  /**
   * Get trigger history for application
   */
  static getTriggerHistory(applicationId: string): Array<{
    timestamp: string;
    previousStatus: string;
    newStatus: string;
    actor: string;
    trigger: string;
  }> {
    const application = StorageService.getApplication(applicationId);
    if (!application) return [];

    return (application.stageHistory || [])
      .filter(entry => entry.actor === 'System')
      .map(entry => ({
        timestamp: entry.timestamp,
        previousStatus: '', // Would need to store this
        newStatus: entry.status,
        actor: entry.actor,
        trigger: entry.reason || 'Unknown trigger'
      }));
  }

  /**
   * Test all System triggers for an application
   */
  static testTriggers(applicationId: string): Record<string, TriggerResult> {
    return {
      applicationSubmitted: this.onApplicationSubmitted(applicationId, 'test'),
      partialDocuments: this.onPartialDocumentsUploaded(applicationId, 'test'),
      allDocuments: this.onAllDocumentsUploaded(applicationId, 'test'),
      stage1Approval: this.onStage1FinalApproval(applicationId, 'test'),
      stage1Rejection: this.onStage1FinalRejection(applicationId, 'test', 'Test rejection')
    };
  }
}
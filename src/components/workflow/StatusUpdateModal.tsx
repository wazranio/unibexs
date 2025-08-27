'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import { WorkflowService } from '@/lib/workflow';
import { WorkflowRulesEngine } from '@/lib/workflow/rules';
import { StatusAuthorityService } from '@/lib/workflow/status-authority-matrix';
import { Application } from '@/types';
import { getStageName } from '@/lib/utils';
import {
  X,
  AlertTriangle,
  Upload,
  FileText,
  User,
  Save,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

import InlineDocumentRequest from './InlineDocumentRequest';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface StatusUpdateModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedApplication: Application) => void;
  isAdmin: boolean;
}


const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdate,
  isAdmin,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification system state
  const [notification, setNotification] = useState<Notification | null>(null);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    status: string;
    reason: string;
    notes: string;
  } | null>(null);

  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    errors: string[];
    warnings: string[];
    actions: string[];
    data?: Record<string, unknown>;
  } | null>(null);
  
  // Inline component states
  const [showInlineDocumentRequest, setShowInlineDocumentRequest] = useState(false);
  const [showInlineProgramChange, setShowInlineProgramChange] = useState(false);
  const [showInlineProgramDecision, setShowInlineProgramDecision] = useState(false);
  const [showInlineFileUpload, setShowInlineFileUpload] = useState(false);
  const [, setInlineUploadType] = useState<'visa_document' | 'offer_letter' | 'payment_proof' | 'enrollment_proof' | 'other'>('other');
  
  const currentUser = AuthService.getCurrentUser();
  
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus('');
      setReason('');
      setNotes('');
      setUploadedDocuments([]);
      setValidationResult(null);
      setNotification(null);
      setShowConfirmation(false);
      setPendingUpdate(null);
    }
  }, [isOpen]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification && notification.duration) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const availableTransitions = (() => {
    if (application.currentStage === 1) {
      // For Stage 1, use StatusAuthorityService (PDF-based)
      const actor = isAdmin ? 'Admin' : 'Partner';
      const transitions = StatusAuthorityService.getAvailableTransitions(application.currentStatus, actor);
      
      // Convert to the format expected by the UI
      return transitions.map(statusKey => ({
        key: statusKey,
        name: WorkflowService.getStatusDisplayName(1, statusKey) || statusKey.replace(/_/g, ' '),
        description: StatusAuthorityService.getStatusTrigger(statusKey) || 'Status transition',
        nextAction: `Move to ${statusKey.replace(/_/g, ' ')}`,
        requiresReason: statusKey.includes('reject') || statusKey.includes('correction'),
        requiresDocuments: []
      }));
    } else {
      // For other stages, use existing WorkflowService
      return WorkflowService.getAvailableTransitions(
        application.currentStage,
        application.currentStatus
      ).filter(status => {
        if (isAdmin) return true;
        const nextActor = WorkflowService.getNextActor(application.currentStage, status.key);
        return nextActor === 'Partner';
      });
    }
  })();

  // Check if partner needs to make a program change decision
  const needsProgramDecision = !isAdmin && 
    application.currentStatus === 'program_change_suggested' &&
    application.nextActor === 'Partner';

  // Preview validation when status or inputs change - TEMPORARILY DISABLED TO FIX LOOP
  // useEffect(() => {
  //   if (selectedStatus && currentUser && application) {
  //     try {
  //       const selectedStatusInfo = availableTransitions.find(s => s.key === selectedStatus);
  //       const requiresReason = selectedStatusInfo?.requiresReason || selectedStatus.includes('reject');

  //       const result = WorkflowRulesEngine.evaluateStatusChange(
  //         application,
  //         currentUser,
  //         selectedStatus,
  //         {
  //           reason: requiresReason ? reason : undefined,
  //           documents: uploadedDocuments,
  //           notes: notes || undefined
  //         }
  //       );
  //       setValidationResult({
  //         success: result.canProceed,
  //         errors: result.errors,
  //         warnings: result.warnings,
  //         actions: result.actions,
  //         data: undefined
  //       });
  //     } catch (error) {
  //       console.warn('[StatusUpdate] Preview validation error:', error);
  //       // Set a safe fallback validation result
  //       setValidationResult({
  //         success: false,
  //         errors: ['Validation error - please try again'],
  //         warnings: [],
  //         actions: [],
  //         data: undefined
  //       });
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedStatus, reason, uploadedDocuments, notes, currentUser?.id, application?.id, application?.currentStatus]);

  if (!isOpen) return null;

  const selectedStatusInfo = availableTransitions.find(s => s.key === selectedStatus);
  const requiredDocuments = selectedStatusInfo?.requiresDocuments || [];
  const requiresReason = selectedStatusInfo?.requiresReason || selectedStatus.includes('reject');

  // Handlers for inline components
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    
    // Show inline components based on status - especially for Stage 1
    if (newStatus === 'correction_requested_admin') {
      // For correction_requested_admin, show document request interface
      setShowInlineDocumentRequest(true);
      setShowInlineProgramChange(false);
      setShowInlineFileUpload(false);
    } else if (newStatus.includes('correction') || newStatus.includes('request_documents')) {
      setShowInlineDocumentRequest(true);
      setShowInlineProgramChange(false);
      setShowInlineFileUpload(false);
    } else if (newStatus.includes('program_change')) {
      setShowInlineProgramChange(true);
      setShowInlineDocumentRequest(false);
      setShowInlineFileUpload(false);
    } else if (newStatus === 'university_approved' || newStatus.includes('upload') || newStatus.includes('visa') || newStatus.includes('offer')) {
      // Determine upload type based on status
      let uploadType: 'visa_document' | 'offer_letter' | 'payment_proof' | 'enrollment_proof' | 'other' = 'other';
      if (newStatus === 'university_approved') uploadType = 'offer_letter';
      else if (newStatus.includes('visa')) uploadType = 'visa_document';
      else if (newStatus.includes('offer')) uploadType = 'offer_letter';
      else if (newStatus.includes('payment')) uploadType = 'payment_proof';
      else if (newStatus.includes('enrollment')) uploadType = 'enrollment_proof';
      
      setInlineUploadType(uploadType);
      setShowInlineFileUpload(true);
      setShowInlineDocumentRequest(false);
      setShowInlineProgramChange(false);
    } else {
      // Hide all inline components for regular status changes
      setShowInlineDocumentRequest(false);
      setShowInlineProgramChange(false);
      setShowInlineFileUpload(false);
    }
  };

  const handleDocumentRequestCreated = (documentRequestData: {documentType: string; reason: string; applicationId: string}) => {
    setShowInlineDocumentRequest(false);
    
    try {
      // Create the document request record
      const documentRequest = {
        id: StorageService.generateId('DOC_REQ'),
        applicationId: documentRequestData.applicationId,
        requestSource: 'Admin' as const,
        documents: [{
          id: StorageService.generateId('DOC_REQ_ITEM'),
          type: documentRequestData.documentType,
          description: documentRequestData.reason,
          mandatory: true,
          status: 'pending' as const
        }],
        status: 'pending' as const,
        requestedBy: currentUser?.name || 'Admin',
        requestedAt: new Date().toISOString(),
        stage: application.currentStage,
        notes: documentRequestData.reason
      };
      
      // Save document request
      StorageService.addDocumentRequest(documentRequest);
      
      // Update application with document request info and set status
      const updatedApp = { 
        ...application, 
        activeDocumentRequest: documentRequest.id,
        documentsRequired: [...(application.documentsRequired || []), documentRequestData.documentType],
        hasActionRequired: true,
        currentStatus: 'correction_requested_admin',
        nextAction: 'Partner needs to upload requested documents',
        nextActor: 'Partner' as const,
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated application
      StorageService.updateApplication(updatedApp);
      
      // Add audit log entry
      StorageService.addAuditEntry(
        application.id,
        'document_request_created',
        `Document request created: ${documentRequestData.documentType}`,
        currentUser?.name || 'Admin',
        currentUser?.role as 'admin' | 'partner',
        application.currentStatus,
        'correction_requested_admin',
        {
          documentType: documentRequestData.documentType,
          reason: documentRequestData.reason
        }
      );
      
      onUpdate(updatedApp);
      
      // Trigger multiple sync events for better component synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'appleaction_applications',
        newValue: JSON.stringify(StorageService.getApplications()),
      }));
      
      // Custom event for application updates with force refresh
      window.dispatchEvent(new CustomEvent('applicationUpdated', {
        detail: { 
          applicationId: updatedApp.id, 
          application: updatedApp,
          force: true,
          source: 'document_request'
        }
      }));
      
      // Force a small delay to ensure storage operations complete
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceRefresh', {
          detail: { applicationId: updatedApp.id }
        }));
      }, 100);
      
      onClose();
    } catch (error) {
      console.error('Error creating document request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create document request. Please try again.',
        duration: 5000
      });
    }
  };

  const _handleProgramChangeProposed = () => {
    setShowInlineProgramChange(false);
    // The status change will be handled by the program change proposal
    onUpdate(application);
    onClose();
  };

  const _handleProgramDecisionMade = () => {
    setShowInlineProgramDecision(false);
    
    // Refresh the application from storage to get latest updates
    const storedApps = JSON.parse(localStorage.getItem('appleaction_applications') || '[]');
    const updatedApp = storedApps.find((app: Application) => app.id === application.id) || application;
    
    onUpdate(updatedApp);
    
    // Trigger storage event for real-time sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'appleaction_applications',
      newValue: JSON.stringify(storedApps),
    }));
    
    onClose();
  };

  const _handleFileUploaded = (uploadData?: { uploadType: string; files: FileList; notes: string }) => {
    setShowInlineFileUpload(false);
    
    try {
      // Get the latest application data
      const updatedApp = StorageService.getApplication(application.id);
      if (!updatedApp) {
        console.error('Application not found after file upload');
        return;
      }

      // If this was a document upload that could trigger status changes, handle it
      if (uploadData && application.currentStage === 1) {
        const needsDocuments = ['correction_requested_admin', 'documents_resubmission_required', 'documents_partially_submitted'].includes(application.currentStatus);
        
        if (needsDocuments) {
          // Check if all required documents are now uploaded
          const requiredDocs = updatedApp.documentsRequired || [];
          // const uploadedDocs = updatedApp.documentsUploaded || [];
          
          // Determine if upload is complete
          // const uploadComplete = requiredDocs.length > 0 && requiredDocs.every(doc => 
          //   uploadedDocs.some(uploaded => uploaded.includes(doc) || uploaded.includes(uploadData.uploadType))
          // );

          // Auto-update status based on upload completeness
          const newStatus = application.currentStatus;
          // if (uploadComplete) {
          //   newStatus = 'documents_submitted';
          // } else {
          //   newStatus = 'documents_partially_submitted';
          // }

          // Only update status if it changed
          if (newStatus !== application.currentStatus) {
            const finalApp = {
              ...updatedApp,
              currentStatus: newStatus,
              updatedAt: new Date().toISOString()
            };

            // Add to stage history
            if (!finalApp.stageHistory) {
              finalApp.stageHistory = [];
            }
            finalApp.stageHistory.push({
              stage: finalApp.currentStage,
              status: newStatus,
              timestamp: new Date().toISOString(),
              actor: currentUser?.name || 'System',
              notes: `Document upload completed: ${uploadData.uploadType}`,
              documents: [uploadData.uploadType]
            });

            StorageService.updateApplication(finalApp);
            
            // Trigger automation event
            window.dispatchEvent(new CustomEvent('documents_uploaded', {
              detail: {
                applicationId: finalApp.id,
                // uploadComplete,
                uploadType: uploadData.uploadType,
                newStatus
              }
            }));

            onUpdate(finalApp);
          } else {
            onUpdate(updatedApp);
          }
        } else {
          onUpdate(updatedApp);
        }
      } else {
        onUpdate(updatedApp);
      }
      
      // Trigger multiple sync events for better component synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'appleaction_applications',
        newValue: JSON.stringify(StorageService.getApplications()),
      }));
      
      // Custom event for application updates with force refresh
      window.dispatchEvent(new CustomEvent('applicationUpdated', {
        detail: { 
          applicationId: application.id,
          force: true,
          source: 'file_upload'
        }
      }));
      
    } catch (error) {
      console.error('Error handling file upload:', error);
      // Still try to refresh with current data
      const updatedApp = StorageService.getApplication(application.id) || application;
      onUpdate(updatedApp);
    }
    
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedStatus || !currentUser) return;

    // Validation
    if (requiresReason && !reason.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide a reason for this status change.',
        duration: 4000
      });
      return;
    }

    if (requiredDocuments.length > 0 && uploadedDocuments.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please upload the required documents.',
        duration: 4000
      });
      return;
    }

    // Show confirmation dialog
    setPendingUpdate({
      status: selectedStatus,
      reason: reason,
      notes: notes
    });
    setShowConfirmation(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingUpdate || !currentUser) return;
    
    console.log('[StatusUpdate] Starting confirmation process:', {
      currentStatus: application.currentStatus,
      targetStatus: pendingUpdate.status,
      userRole: currentUser.role
    });

    setIsSubmitting(true);

    try {
      const previousStatus = application.currentStatus;

      // Validate the status change using the new workflow rules
      console.log('[StatusUpdate] About to validate:', {
        currentStatus: application.currentStatus,
        targetStatus: pendingUpdate.status,
        userRole: currentUser.role,
        stage: application.currentStage,
        reason: pendingUpdate.reason,
        documents: uploadedDocuments,
        notes: pendingUpdate.notes
      });

      const validationResult = WorkflowRulesEngine.evaluateStatusChange(
        application,
        currentUser,
        pendingUpdate.status,
        {
          reason: pendingUpdate.reason || undefined,
          documents: uploadedDocuments,
          notes: pendingUpdate.notes || undefined
        }
      );
      
      console.log('[StatusUpdate] Validation result:', validationResult);

      if (!validationResult.canProceed) {
        const errorMessages = validationResult.errors.map(error => {
          // Provide more user-friendly error messages
          if (error.includes('PDF_SPEC_VIOLATION')) {
            return `This status change is not allowed by the workflow rules. Current status: ${application.currentStatus}, Target status: ${pendingUpdate.status}`;
          }
          if (error.includes('cannot update from status')) {
            const userRole = currentUser.role === 'admin' ? 'Admin' : 'Partner';
            return `As ${userRole}, you cannot make changes from the current status: ${application.currentStatus}`;
          }
          if (error.includes('Invalid transition')) {
            return `This status change is not allowed. Please check the workflow rules for valid transitions from ${application.currentStatus}`;
          }
          return error;
        });

        // Show detailed error with context
        const errorMessage = `Status Update Blocked: ${errorMessages.join(' | ')} (Current: ${application.currentStatus}, Target: ${pendingUpdate.status}, Role: ${currentUser.role})`;
        
        setNotification({
          type: 'error',
          message: errorMessage,
          duration: 8000
        });
        console.error('Status validation failed:', validationResult);
        
        // Clean up confirmation dialog
        setShowConfirmation(false);
        setPendingUpdate(null);
        return;
      }

      // Determine if this moves to next stage
      let newStage = application.currentStage;
      let finalStatus = pendingUpdate.status;

      // Auto-advance logic for completed stages
      if (pendingUpdate.status === 'approved_stage1') {
        newStage = 2;
        finalStatus = 'sent_to_university';
      } else if (pendingUpdate.status === 'university_approved') {
        newStage = 3;
        finalStatus = 'offer_letter_issued';
      } else if (pendingUpdate.status === 'visa_issued') {
        newStage = 4;
        finalStatus = 'waiting_arrival_date';
      } else if (pendingUpdate.status === 'enrollment_completed') {
        newStage = 5;
        finalStatus = 'commission_pending';
      }

      const updatedApp: Application = {
        ...application,
        currentStage: newStage,
        currentStatus: finalStatus,
        nextAction: WorkflowService.getNextAction(newStage, finalStatus),
        nextActor: WorkflowService.getNextActor(newStage, finalStatus) as 'Admin' | 'Partner' | 'University' | 'Immigration',
        updatedAt: new Date().toISOString(),
        rejectionReason: pendingUpdate.reason || undefined,
        documentsRequired: WorkflowService.getRequiredDocuments(newStage, finalStatus),
      };

      // Add to stage history
      if (!updatedApp.stageHistory) {
        updatedApp.stageHistory = [];
      }
      updatedApp.stageHistory.push({
        stage: newStage,
        status: finalStatus,
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        reason: pendingUpdate.reason || undefined,
        notes: pendingUpdate.notes || undefined,
        documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
      });

      // Update application
      StorageService.updateApplication(updatedApp);
      console.log('[StatusUpdate] Application updated in storage:', updatedApp);

      // Add audit log entry with new event format
      const eventName = `status.${finalStatus}`;
      const actionDescription = `Status changed from ${previousStatus} to ${finalStatus}${newStage !== application.currentStage ? ` (moved to ${getStageName(newStage)})` : ''}`;

      StorageService.addAuditEntry(
        application.id,
        eventName,
        actionDescription,
        currentUser.name,
        currentUser.role as 'admin' | 'partner' | 'university' | 'immigration',
        previousStatus,
        finalStatus,
        {
          stage: newStage,
          reason: pendingUpdate.reason || undefined,
          notes: pendingUpdate.notes || undefined,
          documents: uploadedDocuments,
          autoAdvanced: newStage !== application.currentStage,
        }
      );

      // Add comment if notes provided
      if (pendingUpdate.notes && pendingUpdate.notes.trim()) {
        const comment = {
          id: StorageService.generateId('COMMENT'),
          applicationId: application.id,
          stage: newStage,
          author: currentUser.name,
          authorRole: currentUser.role as 'admin' | 'partner',
          content: pendingUpdate.notes.trim(),
          isInternal: false,
          createdAt: new Date().toISOString(),
        };
        StorageService.addComment(comment);
      }

      onUpdate(updatedApp);
      
      // Trigger multiple sync events for better component synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'appleaction_applications',
        newValue: JSON.stringify(StorageService.getApplications()),
      }));
      
      // Custom event for application updates with force refresh
      window.dispatchEvent(new CustomEvent('applicationUpdated', {
        detail: { 
          applicationId: updatedApp.id, 
          application: updatedApp,
          force: true,
          source: 'status_update'
        }
      }));
      
      // Force a small delay to ensure storage operations complete
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceRefresh', {
          detail: { applicationId: updatedApp.id }
        }));
      }, 100);
      
      // Clean up
      setShowConfirmation(false);
      setPendingUpdate(null);
      onClose();

      // Show success message with warnings if any
      let message = newStage !== application.currentStage
        ? `Status updated and application moved to ${getStageName(newStage)}!`
        : 'Application status updated successfully!';

      if (validationResult.warnings.length > 0) {
        message += ` Warnings: ${validationResult.warnings.join(', ')}`;
      }

      setNotification({
        type: 'success',
        message: message,
        duration: 5000
      });
      
      console.log('[StatusUpdate] Status update completed successfully');

    } catch (error) {
      console.error('[StatusUpdate] Error updating status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update application status. Please try again.',
        duration: 5000
      });
      
      // Clean up confirmation dialog on error
      setShowConfirmation(false);
      setPendingUpdate(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = (docType: string) => {
    // Simulate document upload
    const fileName = `${docType}_${Date.now()}.pdf`;
    setUploadedDocuments([...uploadedDocuments, fileName]);
  };

  const removeDocument = (index: number) => {
    const newDocs = uploadedDocuments.filter((_, i) => i !== index);
    setUploadedDocuments(newDocs);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose} />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/50 border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white">
                Update Application Status
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {application.id} - Current: {WorkflowService.getStatusDisplayName(application.currentStage, application.currentStatus)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Status */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="w-5 h-5 text-blue-400">🕐</span>
                <div>
                  <p className="font-medium text-white">
                    Current Stage: {getStageName(application.currentStage)}
                  </p>
                  <p className="text-sm text-gray-300">
                    Status: {WorkflowService.getStatusDisplayName(application.currentStage, application.currentStatus)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Next Action: {application.nextAction} (by {application.nextActor})
                  </p>
                </div>
              </div>
            </div>

            {/* Program Change Decision (Partner only) */}
            {needsProgramDecision && (
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-3">
                  Program Change Decision Required
                </label>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">University Suggested Program Change</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        The university has suggested a different program for your application. You need to decide whether to accept or reject this suggestion.
                      </p>
                      <button
                        onClick={() => setShowInlineProgramDecision(true)}
                        className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Make Decision
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Status Changes */}
            {!needsProgramDecision && (
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Select New Status
                </label>
              <div className="space-y-2">
                {availableTransitions.map((status) => (
                  <label
                    key={status.key}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStatus === status.key
                        ? 'border-blue-500 bg-gray-800 shadow-md'
                        : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.key}
                      checked={selectedStatus === status.key}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="mr-3 text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{status.name}</p>
                      <p className="text-sm text-gray-300">{status.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Next: {status.nextAction}</p>
                    </div>
                    {status.requiresReason && (
                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Requires Reason
                      </span>
                    )}
                  </label>
                ))}
              </div>
              </div>
            )}

            {/* Reason Field (if required) - Hide when InlineDocumentRequest is shown */}
            {requiresReason && !showInlineDocumentRequest && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a detailed reason for this status change..."
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  required
                />
              </div>
            )}

            {/* Document Upload (if required) */}
            {requiredDocuments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-3">
                  Required Documents <span className="text-blue-600">*</span>
                </label>
                <div className="space-y-2">
                  {requiredDocuments.map((docType) => (
                    <div key={docType} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {docType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentUpload(docType)}
                        className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </button>
                    </div>
                  ))}
                </div>

                {/* Uploaded Documents */}
                {uploadedDocuments.length > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg border border-blue-300">
                    <p className="text-sm font-medium text-blue-800 mb-2">Uploaded Documents:</p>
                    <div className="space-y-1">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-blue-700">{doc}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes Field - Hide when InlineDocumentRequest is shown */}
            {!showInlineDocumentRequest && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or comments..."
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Warning for Auto-advance */}
            {selectedStatusInfo && ['approved_stage1', 'university_approved', 'visa_issued', 'enrollment_completed'].includes(selectedStatus) && (
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Auto-advance Notice</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This status change will automatically move the application to the next stage and update the workflow accordingly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Request Suggestion - Only show when NOT using InlineDocumentRequest */}
            {isAdmin && selectedStatus.includes('correction') && !showInlineDocumentRequest && (
              <div className="bg-gradient-to-r from-green-100 to-green-200 border border-green-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-green-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">💡 Suggestion</p>
                    <p className="text-sm text-green-700 mt-1">
                      Consider creating a document request to specify exactly what documents are needed from the partner.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      After updating this status, go to the Documents tab and click &quot;Create Document Request&quot; for a structured approach.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationResult && validationResult.errors.length > 0 && (
              <div className="bg-gradient-to-r from-red-100 to-red-200 border border-red-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Status Change Blocked</p>
                    <div className="text-sm text-red-700 mt-2 space-y-2">
                      {validationResult.errors.map((error: string, index: number) => {
                        // Provide user-friendly error messages
                        let friendlyError = error;
                        if (error.includes('PDF_SPEC_VIOLATION')) {
                          friendlyError = `This status transition is not allowed by the workflow rules for Stage ${application.currentStage}.`;
                        } else if (error.includes('cannot update from status')) {
                          const userRole = isAdmin ? 'Admin' : 'Partner';
                          friendlyError = `As ${userRole}, you cannot make changes from the current status: ${application.currentStatus}`;
                        } else if (error.includes('Invalid transition')) {
                          friendlyError = `This status change is not allowed. Please check available transitions.`;
                        }

                        return (
                          <div key={index} className="bg-red-50 p-2 rounded border border-red-200">
                            <p className="font-medium">• {friendlyError}</p>
                            {error !== friendlyError && (
                              <p className="text-xs text-red-600 mt-1">Technical: {error}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                      <p><strong>Current:</strong> {application.currentStatus}</p>
                      <p><strong>Target:</strong> {selectedStatus}</p>
                      <p><strong>Your Role:</strong> {isAdmin ? 'Admin' : 'Partner'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {validationResult && validationResult.warnings.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Validation Warnings</p>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Components - Document Request First */}
            {showInlineDocumentRequest && (
              <InlineDocumentRequest
                application={application}
                isAdmin={true}
                onSubmit={handleDocumentRequestCreated}
                onCancel={() => setShowInlineDocumentRequest(false)}
              />
            )}

            {/* Document Request Suggestion - Show after InlineDocumentRequest */}
            {isAdmin && selectedStatus.includes('correction') && showInlineDocumentRequest && (
              <div className="bg-gradient-to-r from-green-100 to-green-200 border border-green-300 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-green-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">💡 Suggestion</p>
                    <p className="text-sm text-green-700 mt-1">
                      Use the form above to specify exactly what documents are needed from the partner.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      This creates a structured document request that the partner can easily follow.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showInlineProgramChange && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p>Program change functionality coming soon...</p>
                <button onClick={() => setShowInlineProgramChange(false)} className="mt-2 px-3 py-1 bg-gray-200 rounded">Cancel</button>
              </div>
            )}

            {showInlineFileUpload && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p>File upload functionality coming soon...</p>
                <button onClick={() => setShowInlineFileUpload(false)} className="mt-2 px-3 py-1 bg-gray-200 rounded">Cancel</button>
              </div>
            )}

            {showInlineProgramDecision && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p>Program decision functionality coming soon...</p>
                <button onClick={() => setShowInlineProgramDecision(false)} className="mt-2 px-3 py-1 bg-gray-200 rounded">Cancel</button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span>Acting as: {currentUser?.name} ({currentUser?.role})</span>
            </div>
            
            {/* Only show standard buttons if no inline components are active */}
            {!showInlineDocumentRequest && !showInlineProgramChange && !showInlineFileUpload && !showInlineProgramDecision && (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedStatus || isSubmitting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </button>
              </div>
            )}

            {/* Show close button when inline components are active */}
            {(showInlineDocumentRequest || showInlineProgramChange || showInlineFileUpload || showInlineProgramDecision) && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
              >
                Close Modal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Component */}
      {notification && (
        <div className={`
          fixed bottom-4 right-4 z-[70] max-w-md p-4 rounded-lg shadow-lg
          transform transition-all duration-300 ease-in-out
          ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' :
            notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-800' :
            'bg-blue-100 border border-blue-400 text-blue-800'}
        `}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && pendingUpdate && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
              onClick={() => setShowConfirmation(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Confirm Status Change
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Status:</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {application.currentStatus.replace(/_/g, ' ')}
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-blue-600 dark:text-blue-400">New Status:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {pendingUpdate.status.replace(/_/g, ' ')}
                  </p>
                </div>
                
                {pendingUpdate.reason && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Reason:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{pendingUpdate.reason}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setPendingUpdate(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Confirm Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusUpdateModal;
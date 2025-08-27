'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Application, DocumentRequest, Document } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';
import UploadConfirmationDialog from '@/components/ui/UploadConfirmationDialog';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onUpdate: (application: Application) => void;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface DocumentRequirement {
  id: string;
  type: string;
  description: string;
  mandatory: boolean;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected' | 'resubmission_required';
  documentId?: string;
  rejectionReason?: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  application, 
  onUpdate 
}) => {
  const [documentRequest, setDocumentRequest] = useState<DocumentRequest | null>(null);
  const [uploadingDocs, setUploadingDocs] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [completedUploads, setCompletedUploads] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    requirementId: string;
    file: File;
    documentType: string;
  } | null>(null);

  const currentUser = AuthService.getCurrentUser();

  const handleConfirmUpload = () => {
    if (pendingUpload) {
      handleFileUpload(pendingUpload.requirementId, pendingUpload.file);
      setShowUploadConfirmation(false);
      setPendingUpload(null);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadConfirmation(false);
    setPendingUpload(null);
  };

  const loadDocumentRequest = useCallback(async () => {
    setLoading(true);
    try {
      // Get active document request for this application
      const activeRequest = StorageService.getActiveDocumentRequest(application.id);
      console.log('📄 DocumentUploadModal: Active request:', activeRequest);
      
      if (activeRequest) {
        // Load existing documents to check status
        const existingDocs = StorageService.getDocuments(application.id);
        console.log('📄 DocumentUploadModal: Existing documents:', existingDocs);
        
        // Update requirement status based on existing documents
        const updatedRequirements = activeRequest.documents.map(req => {
          const existingDoc = existingDocs.find(doc => 
            doc.type === req.type && doc.status !== 'rejected'
          );
          if (existingDoc) {
            return {
              ...req,
              status: 'uploaded' as const,
              documentId: existingDoc.id
            };
          }
          return req;
        });

        setDocumentRequest({
          ...activeRequest,
          documents: updatedRequirements
        });

        // Track already uploaded documents
        const uploaded = new Set(
          updatedRequirements
            .filter(req => req.status === 'uploaded')
            .map(req => req.id)
        );
        setCompletedUploads(uploaded);
      }
    } catch (error) {
      console.error('Error loading document request:', error);
    } finally {
      setLoading(false);
    }
  }, [application.id]);

  useEffect(() => {
    if (isOpen) {
      loadDocumentRequest();
    }
  }, [isOpen, loadDocumentRequest]);

  const handleFileUpload = async (requirementId: string, file: File) => {
    if (!documentRequest) return;

    setUploadingDocs(prev => new Set([...prev, requirementId]));
    setUploadProgress(prev => ({ ...prev, [requirementId]: 0 }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [requirementId]: Math.min(prev[requirementId] + 10, 90)
        }));
      }, 100);

      // Find requirement details
      const requirement = documentRequest.documents.find(req => req.id === requirementId);
      if (!requirement) throw new Error('Requirement not found');

      // Find existing document to determine version
      const existingDocs = StorageService.getDocuments(application.id);
      const existingDoc = existingDocs.find(d => d.type === requirement.type);
      const version = existingDoc ? existingDoc.version + 1 : 1;

      // Create file data URL for demo storage
      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Create new document
      const newDocument: Document = {
        id: StorageService.generateId('DOC'),
        applicationId: application.id,
        stage: application.currentStage,
        type: requirement.type,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser!.name,
        status: 'pending',
        version,
        parentDocumentId: existingDoc?.id,
        url: fileDataUrl,
        size: file.size,
        mimeType: file.type,
      };

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [requirementId]: 100 }));

      // Save document
      StorageService.addDocument(newDocument);
      console.log('📄 DocumentUploadModal: Document saved:', newDocument);

      // Update requirement status
      const updatedRequirements = documentRequest.documents.map(req => {
        if (req.id === requirementId) {
          return { 
            ...req, 
            status: 'uploaded' as const, 
            documentId: newDocument.id 
          };
        }
        return req;
      });

      // Check if all mandatory documents are uploaded
      const allMandatoryUploaded = updatedRequirements.every(
        req => !req.mandatory || req.status === 'uploaded'
      );

      const updatedRequest: DocumentRequest = {
        ...documentRequest,
        documents: updatedRequirements,
        status: allMandatoryUploaded ? 'submitted' : 'partially_submitted',
      };

      StorageService.updateDocumentRequest(updatedRequest);
      setDocumentRequest(updatedRequest);
      setCompletedUploads(prev => new Set([...prev, requirementId]));

      // Create audit entry
      StorageService.addAuditEntry(
        application.id,
        'document.uploaded',
        `Document uploaded: ${file.name} (${requirement.type})`,
        currentUser!.name,
        'partner',
        application.currentStatus,
        application.currentStatus,
        { 
          documentId: newDocument.id,
          fileName: file.name,
          documentType: requirement.type
        }
      );

      // If all documents uploaded, update application status
      if (allMandatoryUploaded) {
        await updateApplicationStatus();
      }

    } catch (error) {
      console.error('Error uploading document:', error);
      setNotification({
        type: 'error',
        message: 'Failed to upload document. Please try again.'
      });
      
      // Reset progress on error
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[requirementId];
        return newProgress;
      });
      
      // Auto-clear error notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUploadingDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(requirementId);
        return newSet;
      });
    }
  };

  const updateApplicationStatus = async () => {
    const updatedApp = {
      ...application,
      currentStatus: 'documents_submitted',
      nextAction: 'Admin reviewing submitted documents',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
    };

    StorageService.updateApplication(updatedApp);
    
    // Trigger UI updates
    window.dispatchEvent(new CustomEvent('applicationUpdated', {
      detail: { applicationId: application.id, newStatus: updatedApp.currentStatus }
    }));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'appleaction_applications',
      newValue: JSON.stringify(StorageService.getApplications())
    }));

    // Create status change audit entry
    const isResubmission = application.currentStatus === 'documents_resubmission_required';
    const auditMessage = isResubmission 
      ? 'Status updated to documents_submitted - documents resubmitted for review'
      : 'Status updated to documents_submitted - all required documents uploaded';
      
    StorageService.addAuditEntry(
      application.id,
      'status.changed',
      auditMessage,
      currentUser!.name,
      'partner',
      application.currentStatus,
      updatedApp.currentStatus
    );

    onUpdate(updatedApp);
    
    // Show success notification
    setTimeout(() => {
      const successMessage = isResubmission
        ? 'Documents resubmitted successfully! Your application status has been updated to "Documents Submitted". The admin will review your corrections soon.'
        : 'All documents uploaded successfully! Your application status has been updated to "Documents Submitted". The admin will review your documents soon.';
        
      setNotification({
        type: 'success',
        message: successMessage
      });
      
      // Auto-close notification and modal after 5 seconds
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 5000);
    }, 500);
  };

  const getRequirementStatusIcon = (requirement: DocumentRequirement) => {
    if (completedUploads.has(requirement.id)) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (uploadingDocs.has(requirement.id)) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else if (requirement.status === 'uploaded') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (requirement.mandatory) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRequirementStatusText = (requirement: DocumentRequirement) => {
    if (completedUploads.has(requirement.id) || requirement.status === 'uploaded') {
      return 'Uploaded';
    } else if (uploadingDocs.has(requirement.id)) {
      return 'Uploading...';
    } else if (requirement.mandatory) {
      return 'Required';
    } else {
      return 'Optional';
    }
  };

  const getRequirementStatusColor = (requirement: DocumentRequirement) => {
    if (completedUploads.has(requirement.id) || requirement.status === 'uploaded') {
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
    } else if (uploadingDocs.has(requirement.id)) {
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
    } else if (requirement.mandatory) {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
    } else {
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50';
    }
  };

  const isAllMandatoryCompleted = documentRequest?.documents.every(
    req => !req.mandatory || req.status === 'uploaded' || completedUploads.has(req.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">Upload Required Documents</h2>
                  <p className="text-blue-100 text-sm">Application: {application.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mx-4 mt-4 p-3 rounded-lg border ${
              notification.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
                : notification.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                {notification.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                {notification.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  {notification.type === 'success' && (
                    <p className="text-xs mt-1 opacity-75">This modal will close automatically in 5 seconds.</p>
                  )}
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 max-h-[calc(85vh-140px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading document requirements...</span>
            </div>
          ) : !documentRequest ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Document Request Found</h3>
              <p className="text-gray-600">
                There are no document requirements for this application at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Progress Summary */}
              {documentRequest.documents.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Upload Progress</h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {documentRequest.documents.filter(req => req.status === 'uploaded' || completedUploads.has(req.id)).length} of {documentRequest.documents.filter(req => req.mandatory).length} required documents uploaded
                      </p>
                    </div>
                    {isAllMandatoryCompleted && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCheck className="w-4 h-4 mr-1" />
                        <span className="font-medium text-xs">Complete!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document List */}
              <div className="space-y-3">
                {documentRequest.documents.map((requirement) => (
                  <div 
                    key={requirement.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-sm transition-shadow bg-gray-50 dark:bg-gray-700/30"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getRequirementStatusIcon(requirement)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {requirement.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              {requirement.mandatory && (
                                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                                  Required
                                </span>
                              )}
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRequirementStatusColor(requirement)}`}>
                                {getRequirementStatusText(requirement)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {requirement.description}
                            </p>

                            {/* Rejection Reason */}
                            {requirement.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-xs font-medium text-red-800 dark:text-red-300">Admin Feedback:</p>
                                <p className="text-xs text-red-700 dark:text-red-400 mt-1">{requirement.rejectionReason}</p>
                              </div>
                            )}
                          </div>

                          {/* Upload Button */}
                          <div className="flex-shrink-0 ml-3">
                            {(requirement.status === 'pending' || requirement.status === 'resubmission_required' || (!completedUploads.has(requirement.id) && requirement.status !== 'uploaded' && requirement.status !== 'approved')) && (
                              <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center">
                                <Upload className="w-3 h-3 mr-1" />
                                {uploadingDocs.has(requirement.id) ? 'Uploading...' : (requirement.status === 'resubmission_required' ? 'Re-upload' : 'Upload')}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Show confirmation dialog instead of direct upload
                                      setPendingUpload({
                                        requirementId: requirement.id,
                                        file: file,
                                        documentType: requirement.type
                                      });
                                      setShowUploadConfirmation(true);
                                    }
                                    // Reset input
                                    e.target.value = '';
                                  }}
                                  disabled={uploadingDocs.has(requirement.id)}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Upload Progress */}
                        {uploadingDocs.has(requirement.id) && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress[requirement.id] || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[requirement.id] || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Upload Guidelines:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Accepted: PDF, JPG, PNG, DOC, DOCX • Max 10MB • All required documents needed to proceed
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {documentRequest && (
                  <>
                    {documentRequest.documents.filter(req => req.status === 'uploaded' || completedUploads.has(req.id)).length} of {documentRequest.documents.length} documents uploaded
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs"
              >
                {isAllMandatoryCompleted ? 'Done' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upload Confirmation Dialog */}
      <UploadConfirmationDialog
        isOpen={showUploadConfirmation}
        onClose={handleCancelUpload}
        onConfirm={handleConfirmUpload}
        file={pendingUpload?.file || null}
        documentType={pendingUpload?.documentType || ''}
        isUploading={pendingUpload ? uploadingDocs.has(pendingUpload.requirementId) : false}
      />
    </div>
  );
};

export default DocumentUploadModal;
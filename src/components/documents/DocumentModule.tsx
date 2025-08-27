'use client';

import React, { useState, useEffect } from 'react';
import { Application, DocumentRequest, Document } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import { getStatusDisplayForRole } from '@/lib/utils/status-display';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import UploadConfirmationDialog from '@/components/ui/UploadConfirmationDialog';
import { useToast } from '@/components/ui/Toast';
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

interface DocumentModuleProps {
  application: Application;
  isAdmin: boolean;
  onUpdate: (application: Application) => void;
}

interface DocumentWithMetadata extends Document {
  requirement?: DocumentRequirement;
  isLatestVersion: boolean;
  previousVersions: Document[];
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

const DocumentModule: React.FC<DocumentModuleProps> = ({ application, isAdmin, onUpdate }) => {
  console.log('🚀 DocumentModule: Component rendered for application', application.id, 'isAdmin:', isAdmin);
  
  const [documents, setDocuments] = useState<DocumentWithMetadata[]>([]);
  const [documentRequest, setDocumentRequest] = useState<DocumentRequest | null>(null);
  // Document selection removed - unused state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [reviewingDoc, setReviewingDoc] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['required']));
  
  // Confirmation dialog states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    action: 'approve' | 'reject' | 'resubmission';
    documentId: string;
    documentName: string;
    reason?: string;
  } | null>(null);
  const [resubmissionReason, setResubmissionReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  
  // Upload confirmation states
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    file: File;
    requirementId: string;
    documentType: string;
  } | null>(null);

  const currentUser = AuthService.getCurrentUser();
  const { showToast } = useToast();

  useEffect(() => {
    console.log('🔍 DocumentModule: Loading documents for application', application.id);
    loadDocuments();
    
    // Listen for application updates to refresh document data
    const handleApplicationUpdate = (e: CustomEvent) => {
      const { applicationId: updatedAppId, action } = e.detail || {};
      if (updatedAppId === application.id && (action === 'documents_submitted' || action === 'document_uploaded' || action === 'document_reviewed')) {
        console.log('🔄 DocumentModule: Reloading documents due to update event', action);
        setTimeout(() => loadDocuments(), 100);
      }
    };
    
    window.addEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id]);

  const loadDocuments = () => {
    // Load active document request
    const activeRequest = StorageService.getActiveDocumentRequest(application.id);
    setDocumentRequest(activeRequest);

    // Load all documents for this application
    const allDocs = StorageService.getDocuments(application.id);
    
    // Group documents by type and version
    const docsByType = new Map<string, Document[]>();
    allDocs.forEach(doc => {
      if (!docsByType.has(doc.type)) {
        docsByType.set(doc.type, []);
      }
      docsByType.get(doc.type)!.push(doc);
    });

    // Create metadata-enhanced documents
    const enhancedDocs: DocumentWithMetadata[] = [];
    docsByType.forEach((docs, type) => {
      // Sort by version (descending)
      docs.sort((a, b) => b.version - a.version);
      
      docs.forEach((doc, index) => {
        const requirement = activeRequest?.documents.find(req => req.type === type);
        enhancedDocs.push({
          ...doc,
          requirement,
          isLatestVersion: index === 0,
          previousVersions: docs.slice(index + 1),
        });
      });
    });

    setDocuments(enhancedDocs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'resubmission_required':
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      case 'uploaded':
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'resubmission_required':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'uploaded':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels = getStatusDisplayForRole(status, isAdmin ? 'admin' : 'partner');
    return labels.short;
  };

  const getStatusDescription = (status: string): string => {
    const labels = getStatusDisplayForRole(status, isAdmin ? 'admin' : 'partner');
    return labels.description;
  };

  // New method to handle file selection (before upload)
  const handleFileSelected = (requirementId: string, file: File) => {
    console.log('🔥 handleFileSelected called with:', { requirementId, fileName: file.name });
    
    // Find the requirement type for display
    const requirement = documentRequest?.documents.find(req => req.id === requirementId);
    console.log('📋 Found requirement:', requirement);
    
    // Get document type from requirement or fallback to document type
    const documentType = requirement?.type || 'document';
    console.log('📄 Document type:', documentType);
    
    // Set up confirmation dialog
    setPendingUpload({ file, requirementId, documentType });
    setShowUploadConfirmation(true);
    console.log('✅ Confirmation dialog should show now');
  };
  
  // Confirm upload after user approves
  const confirmFileUpload = async () => {
    if (!pendingUpload) return;
    
    const { file, requirementId } = pendingUpload;
    setShowUploadConfirmation(false);
    
    await handleFileUpload(requirementId, file);
    
    // Clean up
    setPendingUpload(null);
  };
  
  // Cancel upload
  const cancelFileUpload = () => {
    setShowUploadConfirmation(false);
    setPendingUpload(null);
  };

  const handleFileUpload = async (requirementId: string, file: File) => {
    setUploadingDoc(requirementId);

    try {
      // Find existing document version
      const existingDoc = documents.find(d => d.requirement?.id === requirementId && d.isLatestVersion);
      const version = existingDoc ? existingDoc.version + 1 : 1;
      
      // Find the requirement type for proper document typing
      const requirement = documentRequest?.documents.find(req => req.id === requirementId);
      const documentType = requirement?.type || requirementId;

      // Create file data URL for demo storage (in production, upload to cloud storage)
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
        type: documentType,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser!.name,
        status: 'pending',
        version,
        parentDocumentId: existingDoc?.id,
        url: fileDataUrl, // Store file content as data URL for demo
        size: file.size,
        mimeType: file.type,
      };

      // Save document to storage
      StorageService.addDocument(newDocument);
      console.log('📄 DocumentModule: Document saved:', newDocument.id, newDocument.fileName);

      // Update document request if exists
      if (documentRequest) {
        const updatedRequirements = documentRequest.documents.map(doc => {
          if (doc.id === requirementId) {
            return { ...doc, status: 'uploaded' as const, documentId: newDocument.id };
          }
          return doc;
        });

        const allUploaded = updatedRequirements.every(
          doc => !doc.mandatory || doc.status !== 'pending'
        );

        const updatedRequest: DocumentRequest = {
          ...documentRequest,
          documents: updatedRequirements,
          status: allUploaded ? 'submitted' : 'partially_submitted',
        };

        StorageService.updateDocumentRequest(updatedRequest);
      }

      // Update application status
      const updatedApp = {
        ...application,
        currentStatus: 'documents_submitted',
        nextAction: 'Admin reviewing documents',
        nextActor: 'Admin' as const,
        updatedAt: new Date().toISOString(),
      };

      StorageService.updateApplication(updatedApp);
      
      // Trigger multiple update events for comprehensive UI refresh
      const updateEvents = [
        new CustomEvent('applicationUpdated', {
          detail: { applicationId: application.id, newStatus: updatedApp.currentStatus }
        }),
        new StorageEvent('storage', {
          key: `application_${application.id}`,
          newValue: JSON.stringify(updatedApp)
        })
      ];
      
      updateEvents.forEach(event => window.dispatchEvent(event));
      
      // Update parent component first
      onUpdate(updatedApp);
      
      // Create audit log entry for document upload
      StorageService.addAuditEntry(
        application.id,
        'document.uploaded',
        `Document uploaded: ${newDocument.fileName} (${requirement?.type || requirementId})`,
        currentUser!.name,
        'admin',
        application.currentStatus,
        application.currentStatus,
        { 
          documentId: newDocument.id,
          fileName: newDocument.fileName,
          documentType: requirement?.type || requirementId
        }
      );
      
      // Then reload local data
      loadDocuments();
      
      // Force a small delay to ensure all components receive updates
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('applicationUpdated', {
          detail: { applicationId: application.id, action: 'document_uploaded' }
        }));
      }, 100);

      // Show success message
      showToast({
        type: 'success',
        title: 'Document Uploaded Successfully!',
        message: `${newDocument.fileName} has been uploaded and status updated.`
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload document. Please try again.'
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDocumentReview = async (
    documentId: string,
    decision: 'approved' | 'rejected' | 'resubmission_required',
    reason?: string
  ) => {
    setReviewingDoc(documentId);

    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Update document status
      const updatedDoc: Document = {
        ...document,
        status: decision,
        reviewedBy: currentUser!.name,
        reviewedAt: new Date().toISOString(),
        rejectionReason: reason,
      };

      StorageService.updateDocument(updatedDoc);

      // Update requirement status if exists
      if (documentRequest && document.requirement) {
        const updatedRequirements = documentRequest.documents.map(req => {
          if (req.id === document.requirement!.id) {
            return {
              ...req,
              status: decision,
              rejectionReason: reason,
            };
          }
          return req;
        });

        // Check overall status
        const allApproved = updatedRequirements.every(
          req => !req.mandatory || req.status === 'approved'
        );
        const anyRejected = updatedRequirements.some(req => req.status === 'rejected');
        const anyResubmission = updatedRequirements.some(
          req => req.status === 'resubmission_required'
        );

        let overallStatus: DocumentRequest['status'] = 'submitted';
        if (allApproved) {
          overallStatus = 'approved';
        } else if (anyRejected) {
          overallStatus = 'rejected';
        } else if (anyResubmission) {
          overallStatus = 'partially_submitted';
        }

        const updatedRequest: DocumentRequest = {
          ...documentRequest,
          documents: updatedRequirements,
          status: overallStatus,
        };

        StorageService.updateDocumentRequest(updatedRequest);

        // Update application status based on document review
        let newStatus = application.currentStatus;
        let nextAction = application.nextAction;
        let nextActor = application.nextActor;

        if (allApproved) {
          newStatus = 'documents_approved';
          nextAction = 'Proceed to next stage';
          nextActor = 'Admin';
        } else if (anyRejected) {
          newStatus = 'documents_rejected';
          nextAction = 'Application cannot proceed';
          nextActor = 'Admin';
        } else if (anyResubmission) {
          newStatus = 'documents_resubmission_required';
          nextAction = 'Partner needs to resubmit documents';
          nextActor = 'Partner';
        }

        const updatedApp = {
          ...application,
          currentStatus: newStatus,
          nextAction,
          nextActor: nextActor as 'Admin' | 'Partner' | 'University' | 'Immigration',
          updatedAt: new Date().toISOString(),
        };

        StorageService.updateApplication(updatedApp);
        
        // Trigger comprehensive UI updates
        window.dispatchEvent(new CustomEvent('applicationUpdated', {
          detail: { applicationId: application.id, action: 'document_reviewed', newStatus: updatedApp.currentStatus }
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: `application_${application.id}`,
          newValue: JSON.stringify(updatedApp)
        }));
        
        // Create audit log entry for document review
        StorageService.addAuditEntry(
          application.id,
          'document.reviewed',
          `Document ${decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'reviewed'}: ${updatedDoc.fileName}`,
          currentUser!.name,
          'admin',
          application.currentStatus,
          updatedApp.currentStatus,
          { 
            documentId: updatedDoc.id,
            fileName: updatedDoc.fileName,
            decision: decision,
            rejectionReason: decision === 'rejected' ? reason : undefined
          }
        );
        
        onUpdate(updatedApp);
      }

      loadDocuments();
      const actionText = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'marked for resubmission';
      showToast({
        type: decision === 'approved' ? 'success' : decision === 'rejected' ? 'error' : 'warning',
        title: `Document ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}!`,
        message: `${document.fileName} has been ${actionText}.`
      });
    } catch (error) {
      console.error('Error reviewing document:', error);
      showToast({
        type: 'error',
        title: 'Review Failed',
        message: 'Failed to review document. Please try again.'
      });
    } finally {
      setReviewingDoc(null);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (searchTerm && !doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return doc.isLatestVersion; // Only show latest versions by default
  });

  // Group documents by category
  const requiredDocs = filteredDocuments.filter(d => d.requirement?.mandatory);
  const optionalDocs = filteredDocuments.filter(d => d.requirement && !d.requirement.mandatory);
  const additionalDocs = filteredDocuments.filter(d => !d.requirement);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Quick action handlers
  const handleQuickAction = (action: 'approve' | 'reject' | 'resubmission', documentId: string, documentName: string) => {
    setConfirmationData({ action, documentId, documentName });
    
    if (action === 'resubmission') {
      setShowReasonInput(true);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleResubmissionWithReason = () => {
    if (!resubmissionReason.trim()) {
      showToast({
        type: 'error',
        title: 'Reason Required',
        message: 'Please provide a reason for resubmission.'
      });
      return;
    }
    
    setConfirmationData(prev => prev ? {...prev, reason: resubmissionReason.trim()} : null);
    setShowReasonInput(false);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmationData) return;
    
    const { action, documentId, reason } = confirmationData;
    
    try {
      await handleDocumentReview(
        documentId, 
        action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resubmission_required',
        reason
      );
      
      // Show success message
      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for resubmission';
      showToast({
        type: action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning',
        title: `Document ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}!`,
        message: `The document has been ${actionText} successfully.`
      });
      
      setShowConfirmation(false);
      setConfirmationData(null);
      setResubmissionReason('');
    } catch (error) {
      console.error('Error in quick action:', error);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to process document action. Please try again.'
      });
    }
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setShowReasonInput(false);
    setConfirmationData(null);
    setResubmissionReason('');
  };

  // Show message if no document request exists
  if (!documentRequest) {
    if (!isAdmin) {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Document Request Active</h3>
          <p className="text-gray-600 mb-4">
            The admin has not requested any documents for this application yet.
          </p>
          <p className="text-sm text-gray-500">
            You will be notified when documents are required for your application.
          </p>
        </div>
      );
    } else {
      // Admin view - can create document request
      return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Document Request Created</h3>
          <p className="text-gray-600 mb-6">
            Create a document request to collect required documents from the partner.
          </p>
          <button
            onClick={() => {
              // Create default document request
              const newRequest: DocumentRequest = {
                id: `docreq-${Date.now()}`,
                applicationId: application.id,
                requestedBy: currentUser?.id || 'admin',
                requestedAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                stage: 1,
                requestSource: 'Admin' as const,
                documents: [
                  { id: '1', type: 'passport', description: 'Valid passport copy', mandatory: true, status: 'pending' },
                  { id: '2', type: 'transcript', description: 'Academic transcripts', mandatory: true, status: 'pending' },
                  { id: '3', type: 'bank_statement', description: 'Bank statements (3 months)', mandatory: true, status: 'pending' },
                  { id: '4', type: 'recommendation_letter', description: 'Recommendation letters', mandatory: true, status: 'pending' }
                ],
                notes: 'Standard document request for application review'
              };
              StorageService.addDocumentRequest(newRequest);
              loadDocuments();
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Document Request
          </button>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Status Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Document Management Center</h2>
            <p className="text-blue-100">
              {isAdmin ? 'Review and manage all application documents' : 'Upload and track your application documents'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">{documents.filter(d => d.status === 'pending').length}</p>
            <p className="text-sm text-blue-100">Pending</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">{documents.filter(d => d.status === 'pending' && d.requirement?.status === 'uploaded').length}</p>
            <p className="text-sm text-blue-100">Under Review</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">{documents.filter(d => d.status === 'approved').length}</p>
            <p className="text-sm text-blue-100">Approved</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-3xl font-bold">
              {documents.filter(d => d.status === 'rejected' || d.status === 'resubmission_required').length}
            </p>
            <p className="text-sm text-blue-100">Action Required</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Documents</option>
              <option value="pending">Pending Upload</option>
              <option value="uploaded">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resubmission_required">Resubmission Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Categories */}
      {/* Required Documents */}
      {requiredDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleCategory('required')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {requiredDocs.length}
              </span>
            </div>
            {expandedCategories.has('required') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedCategories.has('required') && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {requiredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isAdmin={isAdmin}
                  onUpload={handleFileSelected}
                  onReview={handleDocumentReview}
                  onQuickAction={handleQuickAction}
                  uploadingDoc={uploadingDoc}
                  reviewingDoc={reviewingDoc}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  getStatusLabel={getStatusLabel}
                  getStatusDescription={getStatusDescription}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleCategory('optional')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Optional Documents</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {optionalDocs.length}
              </span>
            </div>
            {expandedCategories.has('optional') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedCategories.has('optional') && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {optionalDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isAdmin={isAdmin}
                  onUpload={handleFileSelected}
                  onReview={handleDocumentReview}
                  onQuickAction={handleQuickAction}
                  uploadingDoc={uploadingDoc}
                  reviewingDoc={reviewingDoc}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  getStatusLabel={getStatusLabel}
                  getStatusDescription={getStatusDescription}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Additional Documents */}
      {additionalDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleCategory('additional')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Documents</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {additionalDocs.length}
              </span>
            </div>
            {expandedCategories.has('additional') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedCategories.has('additional') && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {additionalDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isAdmin={isAdmin}
                  onUpload={handleFileSelected}
                  onReview={handleDocumentReview}
                  onQuickAction={handleQuickAction}
                  uploadingDoc={uploadingDoc}
                  reviewingDoc={reviewingDoc}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  getStatusLabel={getStatusLabel}
                  getStatusDescription={getStatusDescription}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No documents have been uploaded yet'}
          </p>
        </div>
      )}
      
      {/* Upload Confirmation Dialog */}
      <UploadConfirmationDialog
        isOpen={showUploadConfirmation}
        onClose={cancelFileUpload}
        onConfirm={confirmFileUpload}
        file={pendingUpload?.file || null}
        documentType={pendingUpload?.documentType || ''}
        isUploading={uploadingDoc === pendingUpload?.requirementId}
      />
      
      {/* Confirmation Dialog for Quick Actions */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={`Confirm Document ${confirmationData?.action === 'approve' ? 'Approval' : confirmationData?.action === 'reject' ? 'Rejection' : 'Resubmission Request'}`}
        message={`Are you sure you want to ${confirmationData?.action === 'approve' ? 'approve' : confirmationData?.action === 'reject' ? 'reject' : 'request resubmission of'} this document?`}
        confirmText={confirmationData?.action === 'approve' ? 'Approve Document' : confirmationData?.action === 'reject' ? 'Reject Document' : 'Request Resubmission'}
        cancelText="Cancel"
        type={confirmationData?.action === 'approve' ? 'success' : confirmationData?.action === 'reject' ? 'error' : 'warning'}
        details={[
          {
            label: 'Document Name',
            value: confirmationData?.documentName || ''
          },
          {
            label: 'Action',
            value: confirmationData?.action === 'approve' ? 'Approve' : confirmationData?.action === 'reject' ? 'Reject' : 'Request Resubmission'
          }
        ]}
        reason={confirmationData?.reason}
        isLoading={reviewingDoc === confirmationData?.documentId}
      />
      
      {/* Resubmission Reason Input Dialog */}
      {showReasonInput && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={handleCancelAction} />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Document Resubmission</h3>
                </div>
                <button
                  onClick={handleCancelAction}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Please provide a clear reason for why this document needs to be resubmitted.</p>
              
              {/* Document info */}
              <div className="p-3 rounded-lg border bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 mb-4">
                <div className="flex justify-between items-start py-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Name:</span>
                  <span className="text-sm ml-2 text-orange-800 dark:text-orange-200 text-right flex-1">
                    {confirmationData?.documentName || ''}
                  </span>
                </div>
              </div>
              <textarea
                value={resubmissionReason}
                onChange={(e) => setResubmissionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 'This passport scan is unclear, please provide a high-quality scan' or 'Document is expired, please upload current version'"
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleCancelAction}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResubmissionWithReason}
                  disabled={!resubmissionReason.trim()}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Document Card Component
interface DocumentCardProps {
  document: DocumentWithMetadata;
  isAdmin: boolean;
  onUpload: (requirementId: string, file: File) => void;
  onReview: (documentId: string, decision: 'approved' | 'rejected' | 'resubmission_required', reason?: string) => void;
  onQuickAction: (action: 'approve' | 'reject' | 'resubmission', documentId: string, documentName: string) => void;
  uploadingDoc: string | null;
  reviewingDoc: string | null;
  showTooltip: string | null;
  setShowTooltip: (id: string | null) => void;
  getStatusLabel: (status: string) => string;
  getStatusDescription: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isAdmin,
  onUpload,
  onReview,
  onQuickAction,
  uploadingDoc,
  reviewingDoc,
  showTooltip,
  setShowTooltip,
  getStatusLabel,
  getStatusDescription,
  getStatusIcon,
  getStatusColor,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'resubmission_required'>('approved');
  const [reviewReason, setReviewReason] = useState('');

  const handleReviewSubmit = () => {
    if ((reviewDecision === 'rejected' || reviewDecision === 'resubmission_required') && !reviewReason) {
      alert('Please provide a reason for rejection/resubmission');
      return;
    }
    onReview(document.id, reviewDecision, reviewReason);
    setShowReviewForm(false);
    setReviewReason('');
  };

  return (
    <div className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getStatusIcon(document.status)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {document.requirement?.type || document.type}
                {document.requirement?.mandatory && (
                  <span className="ml-2 text-xs text-red-600">*Required</span>
                )}
              </h4>
              {document.requirement?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{document.requirement.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{document.fileName}</span>
                <span>•</span>
                <span>Version {document.version}</span>
                <span>•</span>
                <span>{formatDateTime(document.uploadedAt)}</span>
              </div>
              {document.reviewedBy && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Reviewed by {document.reviewedBy} on {formatDateTime(document.reviewedAt!)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Badge with Tooltip */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(document.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}
              >
                {getStatusLabel(document.status)}
              </button>
              {showTooltip === document.id && (
                <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 -left-20">
                  <p className="font-medium mb-1 text-gray-900 dark:text-white">{getStatusLabel(document.status)}</p>
                  <p className="text-xs">{getStatusDescription(document.status)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isAdmin && document.status !== 'approved' && (
              <label className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium flex items-center cursor-pointer shadow-sm ${
                uploadingDoc === document.requirement?.id 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}>
                <Upload className="w-4 h-4 mr-1" />
                {uploadingDoc === document.requirement?.id 
                  ? 'Uploading...' 
                  : document.status === 'resubmission_required' 
                    ? 'Resubmit' 
                    : 'Upload'
                }
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUpload(document.requirement?.id || document.id, file);
                    }
                    // Reset input to allow same file upload again
                    e.target.value = '';
                  }}
                  disabled={uploadingDoc === document.requirement?.id}
                />
              </label>
            )}

            {isAdmin && (
              <>
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Download Document"
                >
                  <Download className="w-4 h-4" />
                </button>
                {isAdmin && document.fileName && document.status !== 'approved' && document.status !== 'rejected' && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onQuickAction('approve', document.id, document.fileName)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-xs font-medium flex items-center shadow-sm"
                      title="Approve Document"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      ✓
                    </button>
                    <button
                      onClick={() => onQuickAction('reject', document.id, document.fileName)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-xs font-medium flex items-center shadow-sm"
                      title="Reject Document"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      ✗
                    </button>
                    <button
                      onClick={() => onQuickAction('resubmission', document.id, document.fileName)}
                      className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors text-xs font-medium flex items-center shadow-sm"
                      title="Request Resubmission"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      ↻
                    </button>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-xs font-medium flex items-center shadow-sm ml-1"
                      title="Detailed Review"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Review
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Rejection Reason */}
        {document.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Feedback:</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{document.rejectionReason}</p>
          </div>
        )}

        {/* Review Form for Admin */}
        {showReviewForm && isAdmin && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-3">Document Review</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as 'approved' | 'rejected' | 'resubmission_required')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="resubmission_required">Request Resubmission</option>
                </select>
              </div>
              {(reviewDecision === 'rejected' || reviewDecision === 'resubmission_required') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason {reviewDecision === 'rejected' ? 'for Rejection' : 'for Resubmission'}
                  </label>
                  <textarea
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={reviewDecision === 'rejected' ? "Provide clear reason for rejection..." : "e.g., 'This passport scan is unclear, please provide a high-quality scan'"}
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewingDoc === document.id}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {reviewingDoc === document.id ? 'Processing...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version History */}
        {document.previousVersions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              View {document.previousVersions.length} previous version{document.previousVersions.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentModule;
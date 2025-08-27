'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import { CanonicalWorkflowService } from '@/lib/workflow/canonical-service';
import { StatusAuthorityService } from '@/lib/workflow/status-authority-matrix';
import { getEnhancedStageInfo } from '@/lib/utils/enhanced-status-copy';
import { useWorkflowEngine } from '@/lib/workflow/useWorkflowEngine';
import { getStatusMessage, getReadinessMessage } from '@/lib/utils/status-messages';
import type { Document } from '@/types';
import { ActionRouter, ActionButton } from '@/lib/actions/actionRouter';
import Sidebar from '@/components/layout/Sidebar';
import StatusUpdateModal from '@/components/workflow/StatusUpdateModal';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { Application, Student, Partner, Comment } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  PauseCircle,
  XCircle,
  Play,
  Lock,
} from 'lucide-react';

interface ApplicationDetailsV3Props {
  applicationId?: string;
  application?: Application;
  student?: Student;
  partner?: Partner;
  isAdmin: boolean;
}

const ApplicationDetailsV3: React.FC<ApplicationDetailsV3Props> = ({ 
  applicationId, 
  application: initialApplication, 
  student: initialStudent, 
  partner: initialPartner, 
  isAdmin 
}) => {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(initialApplication || null);
  const [student, setStudent] = useState<Student | null>(initialStudent || null);
  const [, setPartner] = useState<Partner | null>(initialPartner || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(!initialApplication);
  const [showComments, setShowComments] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    timeline: false,
    documents: false
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDocumentViewModal, setShowDocumentViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'resubmission'>('reject');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showApprovalConfirmation, setShowApprovalConfirmation] = useState(false);
  const [documentToApprove, setDocumentToApprove] = useState<Document | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [resumeReason, setResumeReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const currentUser = AuthService.getCurrentUser();
  
  // Initialize workflow engine - NO MORE HARDCODED LOGIC!
  const workflowEngine = useWorkflowEngine();

  const loadApplicationData = useCallback(() => {
    const targetApplicationId = applicationId || initialApplication?.id;
    
    if (!targetApplicationId) {
      setLoading(false);
      return;
    }

    try {
      const app = StorageService.getApplication(targetApplicationId);
      if (!app) {
        router.push(isAdmin ? '/admin/applications' : '/partner/applications');
        return;
      }

      if (!isAdmin && currentUser?.partnerId !== app.partnerId) {
        router.push('/partner/applications');
        return;
      }

      const studentData = StorageService.getStudent(app.studentId);
      const partnerData = StorageService.getPartner(app.partnerId);
      const commentsData = StorageService.getComments(targetApplicationId);

      console.log('[ApplicationDetailsV3] Loading fresh application data:', {
        appId: app.id,
        currentStatus: app.currentStatus,
        updatedAt: app.updatedAt
      });
      
      setApplication(app);
      setStudent(studentData || null);
      setPartner(partnerData || null);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId, initialApplication?.id, isAdmin, currentUser?.partnerId, router]);

  useEffect(() => {
    loadApplicationData();

    const handleStorageChange = (e: StorageEvent) => {
      // Specifically check for the applications key
      if (e.key === 'appleaction_applications') {
        console.log('[ApplicationDetailsV3] Storage changed, reloading application data');
        
        // Get the specific application from the updated data
        try {
          const updatedApplications = JSON.parse(e.newValue || '[]');
          const updatedApp = updatedApplications.find((app: Application) => app.id === (applicationId || initialApplication?.id));
          
          if (updatedApp) {
            // Update local state immediately
            setApplication(updatedApp);
            // Then reload for related data
            loadApplicationData();
          } else {
            // If no specific app found, just reload
            loadApplicationData();
          }
        } catch (error) {
          console.error('[ApplicationDetailsV3] Error parsing storage event data:', error);
          // Fallback to regular reload
          loadApplicationData();
        }
      }
    };

    const handleApplicationUpdate = (e: CustomEvent) => {
      const { applicationId: updatedAppId, force, application: updatedApp } = e.detail || {};
      const currentAppId = applicationId || initialApplication?.id;
      
      if (!updatedAppId || updatedAppId === currentAppId || force) {
        // If we have the updated application data, use it directly
        if (updatedApp && updatedApp.id === currentAppId) {
          setApplication(updatedApp);
        }
        // Always reload to get fresh related data
        loadApplicationData();
      }
    };

    const handleForceRefresh = (e: CustomEvent) => {
      const { applicationId: refreshAppId } = e.detail || {};
      const currentAppId = applicationId || initialApplication?.id;
      
      if (!refreshAppId || refreshAppId === currentAppId) {
        console.log('Force refreshing application data');
        loadApplicationData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    window.addEventListener('forceRefresh', handleForceRefresh as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
      window.removeEventListener('forceRefresh', handleForceRefresh as EventListener);
    };
  }, [applicationId, initialApplication?.id, loadApplicationData]);



  // ZERO HARDCODED LOGIC! Everything from configuration
  const getCurrentStatus = (app: Application, isAdmin: boolean) => {
    const role = isAdmin ? 'admin' : 'partner';
    
    try {
      // Use workflow engine for ALL status logic
      const statusInfo = workflowEngine.getStatusInfo(app.currentStage, app.currentStatus, role);
      
      // Convert workflow engine action to legacy ActionButton format
      let actionButton: ActionButton | null = null;
      if (statusInfo.actionButton) {
        actionButton = {
          text: statusInfo.actionButton.label,
          action: statusInfo.actionButton.behavior === 'upload' ? 
                  (statusInfo.actionButton.id.includes('resubmit') ? 'resubmit_docs' : 'upload_docs') :
                  statusInfo.actionButton.id,
          type: statusInfo.actionButton.type === 'warning' ? 'secondary' : statusInfo.actionButton.type
        };
      }
      
      return {
        text: statusInfo.text,
        isUrgent: statusInfo.isUrgent,
        actionButton,
        hasMultiple: statusInfo.hasMultiple
      };
    } catch (error) {
      console.error('Error getting status from workflow engine:', error);
      
      // Fallback to basic display
      return {
        text: `Status: ${app.currentStatus.replace(/_/g, ' ')}`,
        isUrgent: false,
        actionButton: null,
        hasMultiple: false
      };
    }
  };

  // NO MORE HARDCODED MESSAGES! Get from configuration
  const getPrimaryMessage = (app: Application, isAdmin: boolean) => {
    const role = isAdmin ? 'admin' : 'partner';
    return workflowEngine.getText(app.currentStage, app.currentStatus, role, 'primaryMessage') || 
           `Status: ${app.currentStatus.replace(/_/g, ' ')}`;
  };

  // NO MORE HARDCODED BUTTON TEXT! Get from configuration
  const getActionButtonText = (app: Application, isAdmin: boolean, actionButton: ActionButton | null) => {
    if (!actionButton) return null;
    
    const role = isAdmin ? 'admin' : 'partner';
    return workflowEngine.getText(app.currentStage, app.currentStatus, role, 'actionButtonText') || 
           actionButton.text;
  };

  // Helper function to determine if action is document upload related
  const isDocumentUploadAction = (app: Application, isAdmin: boolean) => {
    if (isAdmin) return false; // Admin always uses status modal
    
    // Use workflow engine rules instead of hardcoded status list
    return workflowEngine.hasRule(app.currentStage, app.currentStatus, 'isDocumentUploadStatus');
  };

  // Helper function to determine if action is document review related (for admin)
  const isDocumentReviewAction = (app: Application, isAdmin: boolean) => {
    if (!isAdmin) return false; // Only admin can review documents
    
    // Use workflow engine rules instead of hardcoded status check
    return workflowEngine.hasRule(app.currentStage, app.currentStatus, 'isDocumentReviewStatus');
  };

  // Handle document review action for admin
  const handleDocumentReviewAction = () => {
    // Expand the documents section
    setExpandedSections(prev => ({
      ...prev,
      documents: true
    }));
    
    // Show helpful notification
    showNotification('info', 'Documents section expanded. Review uploaded documents below and approve or reject them.');
    
    // Scroll to documents section after a short delay to allow expansion
    setTimeout(() => {
      const documentsSection = document.querySelector('[data-section="documents"]');
      if (documentsSection) {
        documentsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  // Helper function to show notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string, autoHide: boolean = true) => {
    setNotification({ type, message });
    
    if (autoHide) {
      const hideDelay = type === 'success' ? 4000 : type === 'error' ? 5000 : 3000;
      setTimeout(() => setNotification(null), hideDelay);
    }
  };

  // Handle Cancel Application
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!application || !cancelReason.trim()) return;
    
    const currentStatusBeforeCancel = application.currentStatus;
    
    const updatedApp: Application = {
      ...application,
      currentStatus: 'application_cancelled' as Application['currentStatus'],
      cancelReason: cancelReason,
      cancelledBy: currentUser?.name || 'Admin',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // First update storage
    StorageService.updateApplication(updatedApp);
    
    // Add audit entry
    StorageService.addAuditEntry(
      application.id,
      'application.cancelled',
      `Application cancelled: ${cancelReason}`,
      currentUser!.name,
      'admin',
      currentStatusBeforeCancel,
      'application_cancelled'
    );
    
    // Update local state - this triggers immediate UI update
    setApplication(updatedApp);
    
    // Close modal and show notification
    setShowCancelModal(false);
    setCancelReason('');
    showNotification('error', '❌ Application has been permanently cancelled.');
    
    // No immediate loadApplicationData() call to avoid race condition
  };

  // Handle Put On Hold
  const handleOnHold = () => {
    if (application?.currentStatus === 'application_on_hold') {
      showNotification('info', 'Application is already on hold');
      return;
    }
    setShowOnHoldModal(true);
  };

  const confirmOnHold = () => {
    if (!application || !holdReason.trim()) return;
    
    // Don't allow hold if already on hold
    if (application.currentStatus === 'application_on_hold') {
      showNotification('info', 'Application is already on hold');
      setShowOnHoldModal(false);
      return;
    }
    
    const currentStatusBeforeHold = application.currentStatus;
    
    const updatedApp: Application = {
      ...application,
      previousStatus: currentStatusBeforeHold, // Save current status BEFORE changing
      currentStatus: 'application_on_hold' as Application['currentStatus'],
      holdReason: holdReason,
      heldBy: currentUser?.name || 'Admin',
      heldAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // First update storage
    StorageService.updateApplication(updatedApp);
    
    // Add audit entry
    StorageService.addAuditEntry(
      application.id,
      'application.on_hold',
      `Application put on hold: ${holdReason}`,
      currentUser!.name,
      'admin',
      currentStatusBeforeHold,
      'application_on_hold'
    );
    
    // Update local state - this triggers immediate UI update
    setApplication(updatedApp);
    
    // Close modal and show notification
    setShowOnHoldModal(false);
    setHoldReason('');
    showNotification('info', 'Application has been put on hold.');
    
    // No immediate loadApplicationData() call to avoid race condition
  };

  // Handle Resume from Hold
  const handleResume = () => {
    if (!application?.previousStatus) {
      showNotification('error', 'Cannot resume: Previous status unknown. Please use status update instead.');
      return;
    }
    setShowResumeModal(true);
  };

  const confirmResume = () => {
    if (!application || !resumeReason.trim()) return;
    
    // Check if previousStatus exists
    if (!application.previousStatus) {
      showNotification('error', 'Cannot resume: Previous status not found. Please update status manually.');
      setShowResumeModal(false);
      setResumeReason('');
      return;
    }
    
    const previousStatusToResumeTo = application.previousStatus;
    
    const updatedApp: Application = {
      ...application,
      currentStatus: previousStatusToResumeTo as Application['currentStatus'], // Proper type cast
      previousStatus: 'application_on_hold',
      resumeReason: resumeReason,
      resumedBy: currentUser?.name || 'Admin',
      resumedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Clear hold-related fields
      holdReason: undefined,
      heldBy: undefined,
      heldAt: undefined
    };
    
    // First update storage
    StorageService.updateApplication(updatedApp);
    
    // Add audit entry
    StorageService.addAuditEntry(
      application.id,
      'application.resumed',
      `Application resumed from hold: ${resumeReason}`,
      currentUser!.name,
      'admin',
      'application_on_hold',
      previousStatusToResumeTo
    );
    
    // Update local state - this triggers immediate UI update
    setApplication(updatedApp);
    
    // Close modal and show notification
    setShowResumeModal(false);
    setResumeReason('');
    showNotification('success', 'Application has been resumed and processing continues.');
    
    // No immediate loadApplicationData() call to avoid race condition
  };

  // Document management functions
  const handleApproveDocument = (doc: Document) => {
    try {
      const updatedDoc = {
        ...doc,
        status: 'approved' as const,
        reviewedBy: currentUser?.name || 'Admin',
        reviewedAt: new Date().toISOString()
      };
      
      StorageService.updateDocument(updatedDoc);
      showNotification('success', `Document "${doc.fileName}" approved successfully!`);
      
      // Check if all documents are now approved and update application status
      if (!application) return;
      
      const allDocuments = StorageService.getDocuments(application.id);
      const allApproved = allDocuments.every(d => d.status === 'approved');
      
      const documentReviewStatuses = ['documents_submitted', 'documents_under_review', 'documents_resubmission_required'];
      if (allApproved && documentReviewStatuses.includes(application.currentStatus)) {
        const updatedApp = {
          ...application,
          currentStatus: 'documents_approved' as const,
          updatedAt: new Date().toISOString()
        };
        StorageService.updateApplication(updatedApp);
        setApplication(updatedApp);
        showNotification('success', 'All documents approved! Application status updated.');
      }
      
      // Force refresh the component by reloading application data
      loadApplicationData();
    } catch (error) {
      console.error('Error approving document:', error);
      showNotification('error', 'Failed to approve document. Please try again.');
    }
  };

  const handleRejectDocument = (doc: Document, reason: string, action: 'reject' | 'resubmission') => {
    try {
      const updatedDoc = {
        ...doc,
        status: action === 'reject' ? 'rejected' as const : 'resubmission_required' as const,
        reviewedBy: currentUser?.name || 'Admin',
        reviewedAt: new Date().toISOString(),
        rejectionReason: reason
      };
      
      StorageService.updateDocument(updatedDoc);
      
      if (action === 'reject') {
        showNotification('success', `Document "${doc.fileName}" has been rejected.`);
      } else {
        // Create DocumentRequest for resubmission
        const newRequest = {
          id: `REQ-RESUBMIT-${Date.now()}`,
          applicationId: application!.id,
          stage: application!.currentStage || 1,
          requestedBy: currentUser?.name || 'Admin',
          requestedAt: new Date().toISOString(),
          requestSource: 'Admin' as const,
          status: 'pending' as const,
          documents: [{
            id: `DOCREQ-${doc.id}-${Date.now()}`,
            type: doc.type,
            description: doc.fileName || doc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            mandatory: true,
            status: 'pending' as const,
            rejectionReason: reason
          }],
          notes: `Document resubmission requested: ${reason}`
        };
        
        StorageService.addDocumentRequest(newRequest);
        showNotification('success', `Document "${doc.fileName}" marked for resubmission with feedback.`);
      }
      
      // Update application status if all documents are processed
      const allDocuments = StorageService.getDocuments(application!.id);
      const hasRejectedDocs = allDocuments.some(d => d.status === 'rejected');
      const hasResubmissionDocs = allDocuments.some(d => d.status === 'resubmission_required');
      const hasPendingDocs = allDocuments.some(d => ['pending', 'uploaded'].includes(d.status));
      const allProcessed = allDocuments.every(d => ['approved', 'rejected', 'resubmission_required'].includes(d.status));
      
      if (application) {
        let newStatus: 'documents_approved' | 'documents_rejected' | 'documents_under_review' | 'documents_resubmission_required';
        
        if (allProcessed) {
          // Only set final statuses when ALL documents are fully processed
          if (hasRejectedDocs && !hasResubmissionDocs) {
            newStatus = 'documents_rejected'; // Only if permanently rejected (not resubmission)
          } else if (hasResubmissionDocs) {
            newStatus = 'documents_resubmission_required';
          } else if (allDocuments.every(d => d.status === 'approved')) {
            newStatus = 'documents_approved';
          } else {
            newStatus = 'documents_under_review';
          }
        } else {
          // If documents are still pending, keep under review regardless of other statuses
          newStatus = 'documents_under_review';
        }
        
        // Only update if status actually changed
        if (newStatus !== application.currentStatus) {
          const updatedApp = {
            ...application,
            currentStatus: newStatus,
            updatedAt: new Date().toISOString()
          };
          StorageService.updateApplication(updatedApp);
        }
      }
      
      // Force refresh the component by reloading application data
      loadApplicationData();
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error processing document:', error);
      showNotification('error', 'Failed to process document. Please try again.');
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDocumentViewModal(true);
  };

  const handleDownloadDocument = (doc: Document) => {
    try {
      if (!doc.url) {
        showNotification('error', 'Document URL not available for download.');
        return;
      }
      // Convert base64 to blob and trigger download
      const byteCharacters = atob(doc.url.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.mimeType });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('success', `Document "${doc.fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading document:', error);
      showNotification('error', 'Failed to download document. Please try again.');
    }
  };

  const getWorkType = (status: string) => {
    if (status.includes('document')) return 'Document Review';
    if (status === 'new_application') return 'Application Review';
    if (status.includes('correction')) return 'Corrections Required';
    if (status.includes('approved')) return 'Approved';
    if (status.includes('rejected')) return 'Rejected';
    return 'Processing';
  };

  const getDaysInStatus = (app: Application) => {
    const now = new Date();
    const updated = new Date(app.updatedAt);
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  const getReadinessStatus = (app: Application, isAdmin: boolean) => {
    const blockers = [];
    
    // Check for common blockers using workflow engine rules
    if (workflowEngine.hasRule(app.currentStage, app.currentStatus, 'requiresDocuments') && !isAdmin) {
      blockers.push('Documents required');
    }
    
    if (workflowEngine.hasRule(app.currentStage, app.currentStatus, 'partialSubmission')) {
      blockers.push('Upload incomplete');
    }
    
    if (blockers.length === 0) {
      const currentStatus = getCurrentStatus(app, isAdmin);
      if (currentStatus.actionButton) {
        return { 
          ready: true, 
          message: 'Ready for your action',
          type: 'success' as const
        };
      }
      
      // Use shared utility for context-aware messages
      return getReadinessMessage(app, isAdmin);
    }
    
    return { 
      ready: false, 
      message: `Action required: ${blockers.join(', ')}`,
      type: 'warning' as const
    };
  };

  const getNextStepPreview = (app: Application, isAdmin: boolean) => {
    return getStatusMessage(app, isAdmin, 'next');
  };

  const getSLAIndicator = (app: Application) => {
    const daysInStatus = getDaysInStatus(app);
    const priority = app.priority;
    
    let slaHours = 72; // Default 3 days
    if (priority === 'high') slaHours = 24;
    if (priority === 'medium') slaHours = 48;
    
    const slaHoursElapsed = daysInStatus * 24;
    const remaining = slaHours - slaHoursElapsed;
    
    if (remaining <= 0) {
      return { text: 'SLA exceeded', type: 'danger' };
    }
    if (remaining <= 12) {
      return { text: `${remaining}h remaining`, type: 'warning' };
    }
    return { text: `${Math.ceil(remaining/24)}d remaining`, type: 'normal' };
  };

  const getStageDisplay = (app: Application) => {
    const stageInfo = getEnhancedStageInfo(app.currentStage);
    const emojis = ['📝', '🔍', '🎓', '✈️', '💰'];
    return {
      name: stageInfo.name,
      emoji: emojis[app.currentStage - 1] || '📋',
      number: app.currentStage
    };
  };

  const toggleSection = (section: 'timeline' | 'documents') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!application || !student) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Application Not Found</h2>
            <p className="text-gray-600 mb-6">
              The requested application could not be found or you don&apos;t have permission to view it.
            </p>
            <Link
              href={isAdmin ? '/admin/applications' : '/partner/applications'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = getCurrentStatus(application, isAdmin);
  const stage = getStageDisplay(application);
  
  // Check if application is on hold for visual state management
  const isOnHold = application.currentStatus === 'application_on_hold';
  // Check if application is cancelled for visual state management
  const isCancelled = application.currentStatus === 'application_cancelled';

  return (
    <div className={`flex h-screen ${
      isOnHold ? 'bg-yellow-50/30 dark:bg-yellow-900/20' : 
      isCancelled ? 'bg-red-50/30 dark:bg-red-900/20' :
      'bg-gray-50 dark:bg-gray-900'
    }`}>
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={isAdmin ? '/admin/applications' : '/partner/applications'}
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="font-medium">Applications</span>
                </Link>
                <div className="text-gray-300">•</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    #{application.id.substring(0, 8)}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.firstName} {student.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Update Status Button - Only show if user can update based on PDF matrix */}
                {application.currentStage === 1 && currentUser && (() => {
                  const userActor = isAdmin ? 'Admin' : 'Partner';
                  const canUpdate = StatusAuthorityService.canActorUpdate(application.currentStatus, userActor);
                  return canUpdate;
                })() && (
                  <button
                    onClick={() => {
                      if (isDocumentUploadAction(application, isAdmin)) {
                        setShowDocumentModal(true);
                      } else if (isDocumentReviewAction(application, isAdmin)) {
                        handleDocumentReviewAction();
                      } else {
                        setShowStatusModal(true);
                      }
                    }}
                    disabled={isOnHold || isCancelled}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium shadow-sm ${
                      isOnHold
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isCancelled
                        ? 'bg-red-300 text-red-700 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={
                      isOnHold ? 'Cannot update status while on hold - resume first' : 
                      isCancelled ? 'Cannot update status - application is permanently cancelled' :
                      undefined
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Update Status
                  </button>
                )}

                {/* Administrative Actions - Only for Admin */}
                {isAdmin && !workflowEngine.isTerminalStatus(application.currentStage, application.currentStatus) && !isCancelled && (
                  <>
                    {/* Smart Hold/Resume Button */}
                    {isOnHold ? (
                      <button
                        onClick={handleResume}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                        title="Resume application processing"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={handleOnHold}
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-sm"
                        title="Put application on hold temporarily"
                      >
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Hold
                      </button>
                    )}
                    
                    {/* Cancel button - disabled when on hold */}
                    <button
                      onClick={handleCancel}
                      disabled={isOnHold}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium shadow-sm ${
                        isOnHold 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                      title={isOnHold ? 'Cannot cancel while on hold - resume first' : 'Cancel application permanently'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    showComments 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments ({comments.length})
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border ${
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

        {/* On Hold Information Banner */}
        {isOnHold && (
          <div className="mx-6 mt-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Application On Hold
                </h3>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <p>
                    <strong>Held by:</strong> {application.heldBy || 'Unknown'} on {' '}
                    {application.heldAt 
                      ? new Date(application.heldAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown date'
                    }
                  </p>
                  <p>
                    <strong>Reason:</strong> {application.holdReason || 'No reason provided'}
                  </p>
                  <p className="text-xs opacity-75 mt-2">
                    All application processing is paused. Use the Resume button to continue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Information Banner */}
        {isCancelled && (
          <div className="mx-6 mt-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Application Permanently Cancelled
                </h3>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p>
                    <strong>Cancelled by:</strong> {application.cancelledBy || 'Admin'} on {' '}
                    {application.cancelledAt 
                      ? new Date(application.cancelledAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown date'
                    }
                  </p>
                  <p>
                    <strong>Reason:</strong> {application.cancelReason || 'No reason provided'}
                  </p>
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                    <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                      ⚠️ This action is permanent and cannot be reversed.
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      No further processing is possible. A new application must be created if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            
            {/* Hero Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              {/* Row 1: Primary Status & Visual Indicator */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Dynamic Status Icon */}
                  <div className={`p-3 rounded-lg ${
                    currentStatus.isUrgent 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : currentStatus.actionButton
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {currentStatus.isUrgent ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : currentStatus.actionButton ? (
                      <Clock className="w-6 h-6" />
                    ) : (
                      <CheckCircle className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Primary Message & Context Badges */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {getPrimaryMessage(application, isAdmin)}
                    </h2>
                    
                    {/* Enhanced Context Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Work Type Badge */}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        📝 {getWorkType(application.currentStatus)}
                      </span>
                      
                      {/* Priority Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        application.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        application.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {application.priority === 'high' ? '🔴' : 
                         application.priority === 'medium' ? '🟡' : '🟢'} {application.priority} priority
                      </span>
                      
                      {/* Stage Badge */}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <span className="mr-1">{stage.emoji}</span>
                        Stage {application.currentStage}
                      </span>
                      
                      {/* Time in Status Badge */}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                        ⏱️ {getDaysInStatus(application)} days
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Reference */}
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{application.id}</p>
                  {student && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{student.firstName} {student.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* Row 2: Readiness/Blocker Alert */}
              {(() => {
                const readiness = getReadinessStatus(application, isAdmin);
                return (
                  <div className={`rounded-lg p-3 mb-4 ${
                    readiness.type === 'success' ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                    readiness.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                    'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}>
                    <div className="flex items-center">
                      {readiness.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      ) : readiness.type === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        readiness.type === 'success' ? 'text-green-800 dark:text-green-200' :
                        readiness.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-blue-800 dark:text-blue-200'
                      }`}>
                        {readiness.message}
                      </span>
                    </div>
                  </div>
                );
              })()}
              
              {/* Row 3: Primary Action Button */}
              {currentStatus.actionButton && (
                <div className={isOnHold || isCancelled ? 'relative' : ''}>
                  {(isOnHold || isCancelled) && (
                    <div className={`absolute inset-0 rounded-lg flex items-center justify-center z-10 ${
                      isOnHold ? 'bg-yellow-100/50 dark:bg-yellow-900/30' : 
                      'bg-red-100/50 dark:bg-red-900/30'
                    }`}>
                      {isOnHold ? (
                        <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      if (isDocumentUploadAction(application, isAdmin)) {
                        setShowDocumentModal(true);
                      } else if (isDocumentReviewAction(application, isAdmin)) {
                        handleDocumentReviewAction();
                      } else {
                        setShowStatusModal(true);
                      }
                    }}
                    disabled={isOnHold || isCancelled}
                    className={`w-full mt-2 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      isOnHold
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isCancelled
                        ? 'bg-red-300 text-red-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title={
                      isOnHold ? 'Cannot perform actions while on hold - resume first' : 
                      isCancelled ? 'Cannot perform actions - application is permanently cancelled' : 
                      undefined
                    }
                  >
                    {getActionButtonText(application, isAdmin, currentStatus.actionButton)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
              
              {/* Row 4: Supporting Information */}
              <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Next: {getNextStepPreview(application, isAdmin)}</span>
                <span className={`${
                  getSLAIndicator(application).type === 'danger' ? 'text-red-600' :
                  getSLAIndicator(application).type === 'warning' ? 'text-yellow-600' :
                  'text-gray-500'
                }`}>
                  {getSLAIndicator(application).text}
                </span>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Application Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Program</label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{application.program}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">University</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      {application.university}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Intake Date</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {application.intakeDate ? new Date(application.intakeDate).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tuition Fee</label>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {application.tuitionFee?.toLocaleString() || 'TBD'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information - Enhanced with comprehensive data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name (as per passport)</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {student.firstName} {student.lastName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nationality</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {student.nationality}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Passport Number</label>
                    <p className="text-gray-900 dark:text-gray-100 font-mono">{student.passportNumber}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {student.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                    <div className="flex items-center text-gray-900 dark:text-gray-100">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {student.phone}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Current Address</label>
                    <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">{student.address}</p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  {/* Emergency Contact */}
                  {student.emergencyContact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Emergency Contact</label>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{student.emergencyContact.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.emergencyContact.relationship}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.emergencyContact.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* English Proficiency */}
                  {student.englishProficiency && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">English Proficiency</label>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {student.englishProficiency.testType}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Score: {student.englishProficiency.score}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Test Date: {new Date(student.englishProficiency.testDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Academic History */}
                  {student.academicHistory && student.academicHistory.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Previous Education</label>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {student.academicHistory[0].degree}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {student.academicHistory[0].institution}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {student.academicHistory[0].startYear} - {student.academicHistory[0].endYear} | GPA: {student.academicHistory[0].gpa}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700" data-section="documents">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Documents</h3>
                  {(() => {
                    const allDocs = StorageService.getDocuments(application.id);
                    const totalDocs = allDocs.length;
                    const approvedDocs = allDocs.filter(doc => doc.status === 'approved').length;
                    const pendingDocs = allDocs.filter(doc => doc.status === 'pending').length;
                    
                    if (totalDocs === 0) return null;
                    
                    return (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                          {approvedDocs} Approved
                        </span>
                        {pendingDocs > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                            {pendingDocs} Pending
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                          {totalDocs} Total
                        </span>
                      </div>
                    );
                  })()}
                </div>
                {expandedSections.documents ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.documents && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="mt-4">
                    {(() => {
                      const allDocuments = StorageService.getDocuments(application.id);
                      console.log('🔍 ApplicationDetailsV3: Retrieved', allDocuments.length, 'documents for application', application.id);
                      
                      if (allDocuments.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Documents Yet</h4>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                              Documents will appear here once they are uploaded.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              Click &quot;Initialize Database&quot; in the login page to load sample documents.
                            </p>
                          </div>
                        );
                      }

                      // Group documents by stage
                      const documentsByStage = allDocuments.reduce((acc, doc) => {
                        if (!acc[doc.stage]) acc[doc.stage] = [];
                        acc[doc.stage].push(doc);
                        return acc;
                      }, {} as Record<number, typeof allDocuments>);

                      const stages = [
                        { number: 1, name: 'Application Documents', description: 'Initial application and supporting documents' },
                        { number: 2, name: 'Offer Letter Documents', description: 'Documents required for university offer letter' },
                        { number: 3, name: 'Visa Documents', description: 'Documents required for visa application' },
                      ];

                      return (
                        <div className="space-y-6">
                          {stages.map(stage => {
                            const stageDocs = documentsByStage[stage.number] || [];
                            
                            // Only show stage if it has documents OR if current stage is >= stage number
                            if (stageDocs.length === 0 && application.currentStage < stage.number) {
                              return null;
                            }

                            const approvedCount = stageDocs.filter(doc => doc.status === 'approved').length;
                            const pendingCount = stageDocs.filter(doc => doc.status === 'pending').length;
                            const rejectedCount = stageDocs.filter(doc => doc.status === 'rejected' || doc.status === 'resubmission_required').length;

                            return (
                              <div key={stage.number} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                        application.currentStage > stage.number 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                          : application.currentStage === stage.number
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                      }`}>
                                        {stage.number}
                                      </span>
                                      <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{stage.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{stage.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {stageDocs.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                      {approvedCount > 0 && (
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded text-xs font-medium">
                                          {approvedCount} ✓
                                        </span>
                                      )}
                                      {pendingCount > 0 && (
                                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 rounded text-xs font-medium">
                                          {pendingCount} ⏳
                                        </span>
                                      )}
                                      {rejectedCount > 0 && (
                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded text-xs font-medium">
                                          {rejectedCount} ⚠️
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {stageDocs.length > 0 ? (
                                  <div className="space-y-3">
                                    {stageDocs.map(doc => (
                                      <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                              {doc.status === 'approved' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                              ) : doc.status === 'rejected' || doc.status === 'resubmission_required' ? (
                                                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                              ) : (
                                                <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                                              )}
                                              <div>
                                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                                  {doc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </h5>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{doc.fileName}</p>
                                                {/* Show document type */}
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{doc.type}</p>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                              <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                              <span>•</span>
                                              <span>Version: {doc.version}</span>
                                              <span>•</span>
                                              <span>Size: {doc.size ? (doc.size / 1024 / 1024).toFixed(1) : '0.0'} MB</span>
                                            </div>
                                            
                                            {doc.reviewedBy && (
                                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                                Reviewed by {doc.reviewedBy} on {new Date(doc.reviewedAt!).toLocaleDateString()}
                                              </div>
                                            )}
                                            
                                            {doc.rejectionReason && (
                                              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <p className="text-sm font-medium text-red-800 dark:text-red-200">Admin Feedback:</p>
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{doc.rejectionReason}</p>
                                              </div>
                                            )}
                                          </div>
                                          
                                          <div className="flex flex-col items-end space-y-2 ml-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              doc.status === 'approved' 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                : doc.status === 'rejected' || doc.status === 'resubmission_required'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                            }`}>
                                              {doc.status === 'resubmission_required' ? 'Resubmit' : doc.status}
                                            </span>
                                            
                                            {/* Document Action Buttons */}
                                            <div className="flex flex-col space-y-1">
                                              {/* View/Download buttons - always available */}
                                              <div className="flex space-x-1">
                                                <button 
                                                  onClick={() => handleViewDocument(doc)}
                                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                  title="View Document"
                                                >
                                                  View
                                                </button>
                                                <button 
                                                  onClick={() => handleDownloadDocument(doc)}
                                                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                                  title="Download Document"
                                                >
                                                  Download
                                                </button>
                                              </div>
                                              
                                              {/* Admin action buttons - smart visibility based on document status */}
                                              {isAdmin && doc.fileName && (
                                                <div className="flex space-x-1">
                                                  {/* Approve button - only for pending/uploaded documents */}
                                                  {['pending', 'uploaded'].includes(doc.status) && (
                                                    <button 
                                                      onClick={() => {
                                                        setDocumentToApprove(doc);
                                                        setShowApprovalConfirmation(true);
                                                      }}
                                                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                      title="Approve Document"
                                                    >
                                                      ✓
                                                    </button>
                                                  )}
                                                  
                                                  {/* Reject button - only for pending/uploaded documents */}
                                                  {['pending', 'uploaded'].includes(doc.status) && (
                                                    <button 
                                                      onClick={() => {
                                                        setSelectedDocument(doc);
                                                        setActionType('reject');
                                                        setShowRejectModal(true);
                                                      }}
                                                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                      title="Reject Document"
                                                    >
                                                      ✗
                                                    </button>
                                                  )}
                                                  
                                                  {/* Request Resubmission - available except when already requested */}
                                                  {doc.status !== 'resubmission_required' && (
                                                    <button 
                                                      onClick={() => {
                                                        setSelectedDocument(doc);
                                                        setActionType('resubmission');
                                                        setShowRejectModal(true);
                                                      }}
                                                      className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                                                      title="Request Resubmission"
                                                    >
                                                      ↻
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">
                                      {application.currentStage >= stage.number 
                                        ? 'No documents uploaded for this stage yet'
                                        : 'Documents for this stage will be available later'
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Timeline &amp; Activity</h3>
                {expandedSections.timeline ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.timeline && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="mt-4 space-y-4">
                    {application.stageHistory && application.stageHistory.length > 0 ? (
                      application.stageHistory.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {entry.status?.replace(/_/g, ' ') || 'Status update'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              By {entry.actor || 'System'} • {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown time'}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No activity history available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Comments interface would be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        <StatusUpdateModal
          application={application}
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onUpdate={(updatedApp) => {
            // Update local application state
            setApplication(updatedApp);
            
            // Force reload application data to ensure fresh state
            setTimeout(() => {
              loadApplicationData();
            }, 100);
            
            // Trigger storage event for real-time sync across all components
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'appleaction_applications',
              newValue: JSON.stringify([updatedApp]),
            }));
            
            // Custom event for application updates
            window.dispatchEvent(new CustomEvent('applicationUpdated', {
              detail: { applicationId: updatedApp.id, force: true }
            }));
          }}
          isAdmin={isAdmin}
        />

        {/* Document Upload Modal */}
        <DocumentUploadModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          application={application}
          onUpdate={(updatedApp) => {
            // Update local application state
            setApplication(updatedApp);
            
            // Force reload application data to ensure fresh state
            setTimeout(() => {
              loadApplicationData();
            }, 100);
            
            // Trigger storage event for real-time sync across all components
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'appleaction_applications',
              newValue: JSON.stringify([updatedApp]),
            }));
            
            // Custom event for application updates
            window.dispatchEvent(new CustomEvent('applicationUpdated', {
              detail: { applicationId: updatedApp.id, force: true }
            }));
          }}
        />

        {/* Document View Modal */}
        {selectedDocument && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${showDocumentViewModal ? '' : 'hidden'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDocument.fileName}
                </h2>
                <button
                  onClick={() => setShowDocumentViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Document Preview: {selectedDocument.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p><strong>File:</strong> {selectedDocument.fileName}</p>
                    <p><strong>Size:</strong> {selectedDocument.size ? (selectedDocument.size / 1024 / 1024).toFixed(1) : '0.0'} MB</p>
                    <p><strong>Uploaded:</strong> {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {selectedDocument.status}</p>
                  </div>
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      onClick={() => handleDownloadDocument(selectedDocument)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Download Document
                    </button>
                    <button
                      onClick={() => setShowDocumentViewModal(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Rejection Modal */}
        {selectedDocument && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${showRejectModal ? '' : 'hidden'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {actionType === 'reject' ? 'Reject Document' : 'Request Resubmission'}
                </h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedDocument(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Document: <strong>{selectedDocument.fileName}</strong>
                </p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {actionType === 'reject' ? 'Reason for rejection (required):' : 'Reason for resubmission (required):'}
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please specify what needs to be corrected or improved..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setSelectedDocument(null);
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (rejectionReason.trim()) {
                        handleRejectDocument(selectedDocument, rejectionReason, actionType);
                      } else {
                        showNotification('error', `Please provide a reason for ${actionType === 'reject' ? 'rejection' : 'resubmission'}.`);
                      }
                    }}
                    disabled={!rejectionReason.trim()}
                    className={`px-4 py-2 ${actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed`}
                  >
                    {actionType === 'reject' ? 'Reject Document' : 'Request Resubmission'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Confirmation Dialog */}
        {showApprovalConfirmation && documentToApprove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Approve Document
                </h2>
                <button
                  onClick={() => {
                    setShowApprovalConfirmation(false);
                    setDocumentToApprove(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to approve <strong>&quot;{documentToApprove.fileName}&quot;</strong>?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowApprovalConfirmation(false);
                      setDocumentToApprove(null);
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (documentToApprove) {
                        handleApproveDocument(documentToApprove);
                      }
                      setShowApprovalConfirmation(false);
                      setDocumentToApprove(null);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Approve Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Application Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Cancel Application
                </h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️ This action is permanent. The partner will need to create a new application to restart.
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for cancellation (required):
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why this application is being cancelled..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                  required
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel Action
                  </button>
                  <button
                    onClick={confirmCancel}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Cancel Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* On Hold Modal */}
        {showOnHoldModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
                  Put Application On Hold
                </h2>
                <button
                  onClick={() => {
                    setShowOnHoldModal(false);
                    setHoldReason('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ℹ️ This action is temporary. You can resume the application later.
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for putting on hold (required):
                </label>
                <textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="Explain why this application is being put on hold..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                  required
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowOnHoldModal(false);
                      setHoldReason('');
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmOnHold}
                    disabled={!holdReason.trim()}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Put On Hold
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Resume Application
                </h2>
                <button
                  onClick={() => {
                    setShowResumeModal(false);
                    setResumeReason('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ Application will resume to status: <strong>{application?.previousStatus?.replace(/_/g, ' ')}</strong>
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for resuming (required):
                </label>
                <textarea
                  value={resumeReason}
                  onChange={(e) => setResumeReason(e.target.value)}
                  placeholder="Explain why this application is being resumed..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                  required
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowResumeModal(false);
                      setResumeReason('');
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmResume}
                    disabled={!resumeReason.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Resume Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ApplicationDetailsV3;
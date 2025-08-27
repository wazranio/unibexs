'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import { WorkflowService } from '@/lib/workflow';
import Sidebar from '@/components/layout/Sidebar';
import { Application, Student, Partner, Comment, DocumentRequest } from '@/types';
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  AlertCircle,
  MessageSquare,
  Upload,
  Edit,
  DollarSign,
  Globe,
  GraduationCap,
} from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency, getStatusColor, getStageColor, getPriorityColor, getStageName } from '@/lib/utils';
import { getStatusDisplayForRole } from '@/lib/utils/status-display';
import StatusUpdateModal from '@/components/workflow/StatusUpdateModal';
import WorkflowVisualization from '@/components/workflow/WorkflowVisualization';
import DocumentModule from '@/components/documents/DocumentModule';
import CreateDocumentRequestModal from '@/components/admin/CreateDocumentRequestModal';

interface ApplicationDetailsProps {
  // Support both old and new prop structures
  applicationId?: string; // Keep for backward compatibility
  application?: Application; // New prop structure
  student?: Student; // New prop structure
  partner?: Partner; // New prop structure
  isAdmin: boolean;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ 
  applicationId, 
  application: initialApplication, 
  student: initialStudent, 
  partner: initialPartner, 
  isAdmin 
}) => {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(initialApplication || null);
  const [student, setStudent] = useState<Student | null>(initialStudent || null);
  const [partner, setPartner] = useState<Partner | null>(initialPartner || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [documentRequest, setDocumentRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(!initialApplication); // No loading if data is provided
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'workflow' | 'timeline' | 'documents' | 'comments'>('overview');
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showCreateDocumentRequestModal, setShowCreateDocumentRequestModal] = useState(false);

  const currentUser = AuthService.getCurrentUser();

  const loadApplicationData = useCallback(() => {
    // If data is already provided via props, use it
    if (initialApplication && initialStudent && initialPartner) {
      const commentsData = StorageService.getComments(initialApplication.id);
      const activeDocRequest = StorageService.getActiveDocumentRequest(initialApplication.id);
      
      setApplication(initialApplication);
      setStudent(initialStudent);
      setPartner(initialPartner);
      setComments(commentsData);
      setDocumentRequest(activeDocRequest);
      setLoading(false);
      return;
    }

    // Fallback to loading via applicationId (for backward compatibility)
    if (!applicationId) {
      setLoading(false);
      return;
    }

    try {
      const app = StorageService.getApplication(applicationId);
      if (!app) {
        router.push(isAdmin ? '/admin/applications' : '/partner/applications');
        return;
      }

      // Check if partner user can access this application
      if (!isAdmin && currentUser?.partnerId !== app.partnerId) {
        router.push('/partner/applications');
        return;
      }

      const studentData = StorageService.getStudent(app.studentId);
      const partnerData = StorageService.getPartner(app.partnerId);
      const commentsData = StorageService.getComments(applicationId);
      const activeDocRequest = StorageService.getActiveDocumentRequest(applicationId);

      setApplication(app);
      setStudent(studentData || null);
      setPartner(partnerData || null);
      setComments(commentsData);
      setDocumentRequest(activeDocRequest);
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId, initialApplication, initialStudent, initialPartner, isAdmin, currentUser?.partnerId, router]);

  useEffect(() => {
    loadApplicationData();

    // Listen for data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('appleaction_') || e.key?.includes('application_')) {
        console.log('🔄 ApplicationDetails: Storage change detected, reloading data', e.key);
        loadApplicationData();
      }
    };

    // Listen for custom application update events
    const handleApplicationUpdate = (e: CustomEvent) => {
      const { applicationId: updatedAppId, action, newStatus, force } = e.detail || {};
      const currentAppId = applicationId || initialApplication?.id;
      if (!updatedAppId || updatedAppId === currentAppId) {
        console.log('🔄 ApplicationDetails: Custom application update event detected', { action, newStatus, force });
        
        // Force immediate reload for document-related updates
        if (action === 'documents_submitted' || action === 'document_uploaded' || action === 'document_reviewed' || force) {
          console.log('🚀 ApplicationDetails: Force reloading due to document update');
          setTimeout(() => loadApplicationData(), 50);
        }
        
        loadApplicationData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    };
  }, [applicationId, initialApplication?.id, loadApplicationData]);

  const handleDocumentRequestCreated = (data: {documentType: string; description: string; deadline?: string; priority: 'low' | 'medium' | 'high'; notes?: string}) => {
    console.log('Document request created:', data);
    loadApplicationData(); // Reload to get updated application
    setShowCreateDocumentRequestModal(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !application || !currentUser) return;

    setIsAddingComment(true);

    try {
      const comment: Comment = {
        id: StorageService.generateId('COMMENT'),
        applicationId: application.id,
        stage: application.currentStage,
        author: currentUser.name,
        authorRole: currentUser.role as 'admin' | 'partner',
        content: newComment.trim(),
        isInternal: false,
        createdAt: new Date().toISOString(),
      };

      StorageService.addComment(comment);
      setComments([...comments, comment]);
      setNewComment('');

      // Add audit log entry
      StorageService.addAuditEntry(
        application.id,
        'comment.added',
        'Comment added',
        currentUser.name,
        currentUser.role as 'admin' | 'partner' | 'university' | 'immigration',
        application.currentStatus,
        application.currentStatus,
        { comment: comment.content }
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplication(updatedApplication);
    loadApplicationData(); // Refresh all data
  };

  const getAvailableActions = () => {
    if (!application) return [];

    const currentStatus = application.currentStatus;
    const stage = application.currentStage;

    // Get available transitions from workflow
    const availableTransitions = WorkflowService.getAvailableTransitions(stage, currentStatus);

    // Filter based on user role
    return availableTransitions.filter(status => {
      if (isAdmin) return true; // Admin can perform any action
      
      // Partner can only perform actions where they are the next actor
      const nextActor = WorkflowService.getNextActor(stage, status.key);
      return nextActor === 'Partner';
    });
  };

  const availableActions = getAvailableActions();

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!application || !student) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Application Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The requested application could not be found.</p>
            <Link
              href={isAdmin ? '/admin/applications' : '/partner/applications'}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Return to Applications List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplayForRole(application.currentStatus, isAdmin ? 'admin' : 'partner');
  const statusDisplayName = statusDisplay.short;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm transition-all duration-300">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href={isAdmin ? '/admin/applications' : '/partner/applications'}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 btn-enhanced"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Applications
                </Link>
                <div className="text-gray-300 dark:text-gray-600">|</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{application.id}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{student.firstName} {student.lastName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.currentStatus)} cursor-help transition-all duration-200 hover:scale-105`}>
                    {statusDisplayName}
                  </span>
                  <div className="absolute z-10 invisible group-hover:visible w-64 p-3 mt-2 text-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 -left-20 transition-all duration-200">
                    <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">{statusDisplay.short}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{statusDisplay.description}</p>
                    {statusDisplay.action && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Next: {statusDisplay.action}</p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(application.currentStage)} transition-all duration-200 hover:scale-105`}>
                  {getStageName(application.currentStage)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getPriorityColor(application.priority)} transition-all duration-200 hover:scale-105`}>
                  {application.priority} Priority
                </span>
                {availableActions.length > 0 && (
                  <button
                    onClick={() => setShowStatusUpdateModal(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center btn-enhanced focus-ring"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <nav className="px-6 flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'workflow', label: 'Workflow', icon: Clock },
              { key: 'timeline', label: 'Timeline', icon: Clock },
              { key: 'documents', label: 'Documents', icon: Upload },
              { key: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover:scale-105 ${
                    selectedTab === tab.key
                      ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Hero Status Card - Main Guide */}
                <div className="bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
                  <div className="p-8">
                    {/* Current Status Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full animate-pulse ${getStatusColor(application.currentStatus).includes('green') ? 'bg-green-500' : getStatusColor(application.currentStatus).includes('orange') ? 'bg-orange-500' : getStatusColor(application.currentStatus).includes('red') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                            {WorkflowService.getStatusDisplayName(application.currentStage, application.currentStatus)}
                          </h2>
                          <p className="text-blue-600 text-sm">
                            Stage {application.currentStage}: {getStageName(application.currentStage)}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.currentStatus)}`}>
                        {application.currentStatus.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    </div>

                    {/* Status Explanation */}
                    <div className="bg-white/70 rounded-xl p-6 mb-6 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Status</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {(() => {
                          const status = application.currentStatus;
                          
                          if (isAdmin) {
                            // Admin-specific explanations
                            switch (status) {
                              case 'correction_requested_admin':
                                return 'You have requested additional documents from the partner. Waiting for the partner to upload the required documents.';
                              case 'documents_submitted':
                                return 'The partner has uploaded all requested documents. Review the documents and make a decision (approve, reject, or request resubmission).';
                              case 'documents_partially_submitted':
                                return 'The partner has uploaded some documents but is still missing others. The partner needs to complete the document submission.';
                              case 'documents_under_review':
                                return 'You are currently reviewing the submitted documents. Complete your review and make a decision on each document.';
                              case 'documents_approved':
                                return 'You have approved all submitted documents. The application can now proceed to the next stage of processing.';
                              case 'documents_rejected':
                                return 'You have rejected the submitted documents. The application cannot proceed and the process has ended.';
                              case 'documents_resubmission_required':
                                return 'You have requested resubmission of certain documents. The partner needs to upload corrected versions of the specified documents.';
                              case 'new_application':
                                return 'A new application has been submitted by the partner. Begin your review of the application and documents.';
                              case 'under_review_admin':
                                return 'You are reviewing this application. Complete your review and decide whether to approve, reject, or request corrections.';
                              case 'approved_stage1':
                                return 'You have approved this application. Prepare the submission package for the university.';
                              case 'sent_to_university':
                                return 'Application has been sent to the university for their review. Monitor for university feedback and decisions.';
                              case 'university_approved':
                                return 'The university has approved this application. Begin the visa processing procedures.';
                              case 'visa_issued':
                                return 'Visa has been issued for this student. Coordinate arrival and enrollment procedures.';
                              default:
                                return 'Application is in progress. Review current stage requirements and take appropriate action.';
                            }
                          } else {
                            // Partner-specific explanations
                            switch (status) {
                              case 'correction_requested_admin':
                                return 'The admin has reviewed your application and needs additional documents before processing can continue. Please upload the requested documents.';
                              case 'documents_submitted':
                                return 'You have successfully uploaded all requested documents. The admin is now reviewing them and will make a decision soon.';
                              case 'documents_partially_submitted':
                                return 'You have uploaded some documents, but there are still more documents needed to complete your application. Please upload the remaining documents.';
                              case 'documents_under_review':
                                return 'The admin is currently reviewing all the documents you submitted. You will be notified once the review is complete.';
                              case 'documents_approved':
                                return 'Excellent news! All your documents have been approved. Your application will now proceed to the next stage.';
                              case 'documents_rejected':
                                return 'Unfortunately, the submitted documents have been rejected and your application cannot proceed at this time.';
                              case 'documents_resubmission_required':
                                return 'Some of your documents need to be corrected and resubmitted. Please check the specific requirements and upload new versions.';
                              case 'new_application':
                                return 'Your application has been submitted successfully and is waiting for the admin to begin the review process.';
                              case 'under_review_admin':
                                return 'The admin is currently reviewing your application and will make a decision soon. No action required from you at this time.';
                              case 'approved_stage1':
                                return 'Congratulations! Your application has been approved and will now be sent to the university for their review.';
                              case 'sent_to_university':
                                return 'Your application has been forwarded to the university. They will review it and make their decision.';
                              case 'university_approved':
                                return 'Excellent! The university has approved your application. The visa processing stage will begin next.';
                              case 'visa_issued':
                                return 'Your visa has been issued! You can now prepare for your arrival and enrollment.';
                              default:
                                return 'Your application is currently being processed. Please check back for updates.';
                            }
                          }
                        })()}
                      </p>
                    </div>

                    {/* Action Required Section */}
                    {(application.nextActor === (isAdmin ? 'Admin' : 'Partner') || documentRequest) && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-start space-x-4">
                          <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">Action Required</h3>
                            
                            {/* Document Request Specific */}
                            {documentRequest && !isAdmin && (
                              documentRequest.status === 'pending' || 
                              documentRequest.status === 'partially_submitted' ||
                              documentRequest.documents.some(d => d.status === 'resubmission_required')
                            ) && (
                              <div className="space-y-4">
                                <p className="text-blue-100 leading-relaxed">
                                  {isAdmin 
                                    ? `You have requested documents from the partner. Waiting for ${documentRequest.documents.filter(d => d.status === 'pending' || d.status === 'resubmission_required').length} document(s) to be uploaded${documentRequest.dueDate ? ` by ${new Date(documentRequest.dueDate).toLocaleDateString()}` : ''}.`
                                    : `${documentRequest.requestSource} has requested specific documents for your application. You need to upload ${documentRequest.documents.filter(d => d.status === 'pending' || d.status === 'resubmission_required').length} document(s)${documentRequest.dueDate ? ` by ${new Date(documentRequest.dueDate).toLocaleDateString()}` : ''}.`
                                  }
                                </p>
                                
                                {/* Document List Preview */}
                                <div className="bg-white/10 rounded-lg p-4">
                                  <h4 className="font-semibold mb-2">Required Documents:</h4>
                                  <ul className="space-y-1 text-sm">
                                    {documentRequest.documents
                                      .filter(d => d.status === 'pending' || d.status === 'resubmission_required')
                                      .slice(0, 3)
                                      .map(doc => (
                                        <li key={doc.id} className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                          <span>{doc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                        </li>
                                      ))}
                                    {documentRequest.documents.filter(d => d.status === 'pending' || d.status === 'resubmission_required').length > 3 && (
                                      <li className="text-white/80">...and {documentRequest.documents.filter(d => d.status === 'pending' || d.status === 'resubmission_required').length - 3} more</li>
                                    )}
                                  </ul>
                                </div>

                                <button
                                  onClick={() => setSelectedTab('documents')}
                                  className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                                >
                                  {isAdmin ? (
                                    <>
                                      <FileText className="w-5 h-5" />
                                      <span>Review Document Requests</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5" />
                                      <span>Upload Required Documents</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* General Status Update */}
                            {application.nextActor === (isAdmin ? 'Admin' : 'Partner') && !documentRequest && (
                              <div className="space-y-4">
                                <p className="text-blue-100 leading-relaxed">
                                  {isAdmin 
                                    ? `Action required: ${application.nextAction?.replace(/Partner|Admin/g, 'you') || 'Review needed'}`
                                    : application.nextAction || 'Action needed'
                                  }
                                </p>
                                <button
                                  onClick={() => setShowStatusUpdateModal(true)}
                                  className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                                >
                                  <Edit className="w-5 h-5" />
                                  <span>{isAdmin ? 'Update Application Status' : 'Take Required Action'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Action Required - Success State */}
                    {application.nextActor !== (isAdmin ? 'Admin' : 'Partner') && !documentRequest && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 rounded-full p-3">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">No Action Required</h3>
                            <p className="text-green-100 mt-1">
                              {isAdmin 
                                ? `Application is being processed by ${application.nextActor}. Monitor for updates and next steps.`
                                : `Your application is being processed. ${application.nextAction}`
                              }
                            </p>
                            <p className="text-green-200 text-sm mt-2">
                              {isAdmin 
                                ? `Next step: ${application.nextActor} will handle the next phase`
                                : `Next step: ${application.nextActor} will ${application.nextAction?.toLowerCase() || 'proceed'}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-blue-600" />
                    Application Progress
                  </h3>
                  <WorkflowVisualization application={application} role={isAdmin ? 'admin' : 'partner'} />
                </div>

                {/* Quick Application Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Application Details Card */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                      Program Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Program</p>
                        <p className="font-medium text-gray-800">{application.program}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">University</p>
                        <p className="font-medium text-gray-800">{application.university}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Intake Date</p>
                        <p className="font-medium text-gray-800">{formatDate(application.intakeDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tuition Fee</p>
                        <p className="font-medium text-green-600">{formatCurrency(application.tuitionFee || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Student Summary Card */}
                  {student && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Student
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-800">{student.firstName} {student.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-800 text-sm">{student.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Nationality</p>
                          <p className="font-medium text-gray-800">{student.nationality}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passport</p>
                          <p className="font-medium text-gray-800">{student.passportNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Partner Summary Card */}
                  {partner && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        Partner Organization
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Organization</p>
                          <p className="font-medium text-gray-800">{partner.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Contact Person</p>
                          <p className="font-medium text-gray-800">{partner.contactPerson}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-800 text-sm">{partner.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-800">{partner.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Student Information */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Student Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <p className="text-sm text-gray-900">{student.firstName} {student.lastName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {student.email}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {student.phone}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                          <p className="text-sm text-gray-900">{student.dateOfBirth ? formatDate(student.dateOfBirth) : 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-gray-400" />
                            {student.nationality}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                          <p className="text-sm text-gray-900">{student.passportNumber}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <p className="text-sm text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {student.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Application Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                          <p className="text-sm text-gray-900">{application.program}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                          <p className="text-sm text-gray-900">{application.university}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Intake Date</label>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(application.intakeDate)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fee</label>
                          <p className="text-sm text-gray-900 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            {formatCurrency(application.tuitionFee || 0)}
                          </p>
                        </div>
                        {application.trackingNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                            <p className="text-sm text-gray-900">{application.trackingNumber}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                          <p className="text-sm text-gray-900">{formatDateTime(application.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Partner Information */}
                    {partner && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Building2 className="w-5 h-5 mr-2" />
                          Partner Organization
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <p className="text-sm text-gray-900">{partner.name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            <p className="text-sm text-gray-900">{partner.contactPerson}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-sm text-gray-900">{partner.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <p className="text-sm text-gray-900">{partner.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <p className="text-sm text-gray-900">{student.emergencyContact?.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <p className="text-sm text-gray-900">{student.emergencyContact?.relationship || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-sm text-gray-900">{student.emergencyContact?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'workflow' && (
              <WorkflowVisualization application={application} role={isAdmin ? 'admin' : 'partner'} />
            )}

            {selectedTab === 'timeline' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h3>
                <div className="space-y-6">
                  {application.stageHistory?.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStageColor(entry.stage)}`}>
                          <span className="text-sm font-medium">{entry.stage}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {WorkflowService.getStatusDisplayName(entry.stage, entry.status)}
                          </p>
                          <p className="text-sm text-gray-500">{formatDateTime(entry.timestamp)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">By {entry.actor}</p>
                        {entry.notes && (
                          <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>
                        )}
                        {entry.reason && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">Reason: {entry.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'documents' && (
              <div>
                <p>🔍 Debug: Documents tab selected, application: {application?.id}, isAdmin: {isAdmin}</p>
                {application ? (
                  <DocumentModule
                    application={application}
                    isAdmin={isAdmin}
                    onUpdate={handleApplicationUpdate}
                  />
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">❌ No application data available for DocumentModule</p>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'comments' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Comments & Notes</h3>
                  <span className="text-sm text-gray-500">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Add Comment Form */}
                <div className="mb-6">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {currentUser?.name?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isAddingComment}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isAddingComment ? 'Adding...' : 'Add Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            comment.authorRole === 'admin' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            <span className="text-xs font-medium">
                              {comment.author.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              comment.authorRole === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {comment.authorRole}
                            </span>
                            <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No comments yet</p>
                      <p className="text-sm text-gray-400 mt-1">Be the first to add a comment</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdateModal && (
        <StatusUpdateModal
          application={application}
          isAdmin={isAdmin}
          isOpen={showStatusUpdateModal}
          onClose={() => setShowStatusUpdateModal(false)}
          onUpdate={handleApplicationUpdate}
        />
      )}

      {/* Create Document Request Modal */}
      {showCreateDocumentRequestModal && isAdmin && (
        <CreateDocumentRequestModal
          application={application}
          isOpen={showCreateDocumentRequestModal}
          onClose={() => setShowCreateDocumentRequestModal(false)}
          onSubmit={handleDocumentRequestCreated}
        />
      )}
    </div>
  );
};

export default ApplicationDetails;
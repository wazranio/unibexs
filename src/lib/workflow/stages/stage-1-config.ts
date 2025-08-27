/**
 * Stage 1 Configuration: Application Review
 * 
 * This file contains ALL Stage 1 workflow logic extracted from hardcoded implementations.
 * NO MORE hardcoded switch statements or status checks needed.
 * 
 * Extracted from:
 * - ApplicationDetailsV3.tsx (lines 206-273, 316-359, 365-384)
 * - status-display.ts (complete STATUS_DISPLAY_MAP)
 * - enhanced-status-copy.ts (ENHANCED_STATUS_MAP)
 * - status-authority-matrix.ts (STAGE_1_STATUS_AUTHORITY)
 */

import { StageConfig } from './types';

export const STAGE_1_CONFIG: StageConfig = {
  stageName: "Application Review",
  stageDescription: "Initial application submission and admin review",
  stageIcon: "📋",
  stageColor: "blue",
  estimatedDuration: "1-2 weeks",
  
  statuses: {
    // ===== NEW_APPLICATION =====
    new_application: {
      // Authority matrix from PDF
      authority: {
        setBy: 'System',
        setTrigger: 'Partner submits application',
        adminCanUpdate: true,
        adminTransitions: ['under_review_admin', 'approved_stage1', 'rejected_stage1', 'correction_requested_admin'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin decision',
        systemCanUpdate: true,
        systemTransitions: []
      },

      // Rules configuration (replaces hardcoded checks)
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: true,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration for both roles
      display: {
        admin: {
          allText: {
            statusCard: 'Review new application and make decision',
            primaryMessage: 'Review new application and make decision',
            secondaryMessage: 'Application submitted - awaiting your review',
            dashboardTitle: 'New Application',
            dashboardSubtitle: 'Needs Review',
            listViewStatus: 'New Application',
            heroCardTitle: 'New Application Received',
            heroCardSubtitle: 'Ready for Review',
            heroCardDescription: 'Application submitted and awaiting review',
            timelineTitle: 'Application Submitted',
            timelineDescription: 'Partner submitted new application for review',
            actionButtonText: 'Review Application',
            actionButtonSecondary: 'View Details',
            successMessage: 'Application status updated successfully',
            errorMessage: 'Failed to update application status',
            warningMessage: 'Please review all documents before making decision',
            infoMessage: 'New application requires your attention',
            emptyStateTitle: 'No Application Data',
            emptyStateDescription: 'Application information is not available',
            loadingMessage: 'Loading application details...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Review application documents', 'Check student information', 'Make approval decision'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Standard priority'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '📋',
            urgencyLevel: 'medium',
            badgeVariant: 'info',
            progressStep: 1,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Application submitted - awaiting admin review',
            primaryMessage: 'Application submitted - awaiting admin review',
            secondaryMessage: 'Your application has been received and is under review',
            dashboardTitle: 'Application Submitted',
            dashboardSubtitle: 'Under Review',
            listViewStatus: 'Application Submitted',
            heroCardTitle: 'Application Submitted',
            heroCardSubtitle: 'Under Review',
            heroCardDescription: 'Your application has been submitted successfully',
            timelineTitle: 'Application Submitted',
            timelineDescription: 'Your application has been submitted for review',
            actionButtonText: undefined,
            successMessage: 'Application submitted successfully',
            errorMessage: 'Unable to check application status',
            infoMessage: 'Your application is being reviewed by our team',
            emptyStateTitle: 'Application Processing',
            emptyStateDescription: 'Please wait while we review your application',
            loadingMessage: 'Checking application status...',
            nextStepsTitle: 'What Happens Next',
            nextSteps: ['Admin will review your application', 'You will be notified of any required corrections'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Please wait'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '📋',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 1,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'review_app',
          label: 'Review Application',
          type: 'primary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: false
        }],
        partner: []
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection'],
        onExit: ['logStatusChange'],
        onAction: 'showStatusModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['statusChanged'],
        auditEvents: ['application.submitted']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: false
      },

      validation: {
        onEntry: ['application_exists'],
        onExit: ['decision_made'],
        requiredFields: [],
        businessRules: [],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Initial application submission status"
    },

    // ===== UNDER_REVIEW_ADMIN =====
    under_review_admin: {
      authority: {
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

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: true,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Continue reviewing - approve, reject, or request corrections',
            primaryMessage: 'Continue reviewing - approve, reject, or request corrections',
            secondaryMessage: 'Application is currently under your review',
            dashboardTitle: 'Under Review',
            dashboardSubtitle: 'In Progress',
            listViewStatus: 'Under Review',
            heroCardTitle: 'Application Under Review',
            heroCardSubtitle: 'Review in Progress',
            heroCardDescription: 'Application is being reviewed by admin',
            timelineTitle: 'Review Started',
            timelineDescription: 'Admin began reviewing the application',
            actionButtonText: 'Make Decision',
            actionButtonSecondary: 'Continue Review',
            successMessage: 'Review decision recorded',
            errorMessage: 'Failed to save review decision',
            warningMessage: 'Please complete review before making decision',
            infoMessage: 'Take your time to review all application details',
            emptyStateTitle: 'Review in Progress',
            emptyStateDescription: 'Complete your review to proceed',
            loadingMessage: 'Loading review details...',
            nextStepsTitle: 'Review Options',
            nextSteps: ['Review all documents', 'Check student eligibility', 'Make approval decision'],
            estimatedTime: '2-4 business days',
            urgencyText: 'Standard review'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '👀',
            urgencyLevel: 'medium',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Application under review by admin',
            primaryMessage: 'Application under review by admin',
            secondaryMessage: 'Admin is carefully reviewing your application',
            dashboardTitle: 'Under Review',
            dashboardSubtitle: 'Admin Reviewing',
            listViewStatus: 'Under Review',
            heroCardTitle: 'Application Under Review',
            heroCardSubtitle: 'Please Wait',
            heroCardDescription: 'Admin is reviewing your application',
            timelineTitle: 'Review in Progress',
            timelineDescription: 'Admin is reviewing your application details',
            actionButtonText: undefined,
            successMessage: 'Application status updated',
            errorMessage: 'Unable to check review status',
            infoMessage: 'Your application is being carefully reviewed',
            emptyStateTitle: 'Review in Progress',
            emptyStateDescription: 'Please wait while admin completes the review',
            loadingMessage: 'Checking review status...',
            nextStepsTitle: 'Please Wait',
            nextSteps: ['Review is in progress', 'Decision will be communicated soon'],
            estimatedTime: '2-4 business days',
            urgencyText: 'Please be patient'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '👀',
            urgencyLevel: 'low',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [{
          id: 'continue_review',
          label: 'Make Decision (Approve/Reject/Request)',
          type: 'primary',
          icon: 'CheckSquare',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: false
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandDocumentSection'],
        onExit: ['logDecision'],
        onAction: 'showStatusModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['decisionMade'],
        auditEvents: ['application.under_review']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['admin_assigned'],
        onExit: ['review_complete'],
        requiredFields: [],
        businessRules: ['review_time_limit'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Admin reviewing application documents"
    },

    // ===== CORRECTION_REQUESTED_ADMIN =====
    correction_requested_admin: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin reviews and finds issues',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner to upload corrections',
        partnerCanUpdate: true,
        partnerTransitions: ['documents_partially_submitted', 'documents_submitted'],
        systemCanUpdate: true,
        systemTransitions: ['documents_partially_submitted', 'documents_submitted']
      },

      rules: {
        isDocumentUploadStatus: true, // Key rule for partner actions!
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true, // Urgent for partner!
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: true,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Waiting for partner to upload documents',
            primaryMessage: 'Waiting for partner to upload documents',
            secondaryMessage: 'Corrections have been requested from partner',
            dashboardTitle: 'Corrections Requested',
            dashboardSubtitle: 'Waiting for Partner',
            listViewStatus: 'Awaiting Corrections',
            heroCardTitle: 'Corrections Requested',
            heroCardSubtitle: 'Waiting for Upload',
            heroCardDescription: 'Additional documents/corrections requested from partner',
            timelineTitle: 'Corrections Requested',
            timelineDescription: 'Admin requested document corrections from partner',
            actionButtonText: undefined,
            successMessage: 'Correction request sent to partner',
            errorMessage: 'Failed to send correction request',
            infoMessage: 'Partner has been notified of required corrections',
            emptyStateTitle: 'Waiting for Partner',
            emptyStateDescription: 'Partner will upload the requested corrections',
            loadingMessage: 'Checking for uploaded corrections...',
            nextStepsTitle: 'Waiting For',
            nextSteps: ['Partner to review correction request', 'Partner to upload corrected documents'],
            estimatedTime: '3-5 business days',
            urgencyText: 'Waiting for partner'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '📤',
            urgencyLevel: 'low',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Upload required documents',
            primaryMessage: 'Upload required documents to proceed',
            secondaryMessage: 'Admin has requested additional documents or corrections',
            dashboardTitle: 'Action Required',
            dashboardSubtitle: 'Upload Documents',
            listViewStatus: 'Action Required',
            heroCardTitle: 'Action Required',
            heroCardSubtitle: 'Upload Documents',
            heroCardDescription: 'Admin has requested additional documents or corrections',
            timelineTitle: 'Corrections Requested',
            timelineDescription: 'Admin requested document corrections',
            actionButtonText: 'Upload Required Documents',
            actionButtonSecondary: 'View Requirements',
            successMessage: 'Documents uploaded successfully',
            errorMessage: 'Failed to upload documents',
            warningMessage: 'Please upload all requested documents',
            infoMessage: 'Check the requirements and upload the needed documents',
            emptyStateTitle: 'Upload Required',
            emptyStateDescription: 'Please upload the documents requested by admin',
            loadingMessage: 'Preparing upload interface...',
            nextStepsTitle: 'Action Required',
            nextSteps: ['Review correction requirements', 'Upload requested documents', 'Submit for review'],
            estimatedTime: 'Please upload ASAP',
            urgencyText: 'Urgent - Action Required'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '📤',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [],
        partner: [{
          id: 'upload_docs',
          label: 'Upload Required Documents',
          type: 'primary',
          icon: 'Upload',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }]
      },

      behavior: {
        onEntry: ['expandDocumentSection', 'highlightRequirements'],
        onExit: ['validateUploads'],
        onAction: 'showDocumentUpload',
        onDocumentUpload: 'autoProgressOnComplete',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['documentsUploaded'],
        auditEvents: ['documents.correction_requested']
      },

      documents: {
        required: ['corrections_list'],
        optional: [],
        autoGenerate: [],
        hideUpload: false, // Show upload for partner!
        reviewRequired: true,
        bulkUpload: true,
        allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
        maxSize: 10,
        downloadable: true
      },

      validation: {
        onEntry: ['correction_requirements_specified'],
        onExit: ['all_corrections_uploaded'],
        requiredFields: ['correction_list'],
        businessRules: ['upload_deadline'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Partner must upload requested corrections"
    },

    // ===== DOCUMENTS_PARTIALLY_SUBMITTED =====
    documents_partially_submitted: {
      authority: {
        setBy: 'System',
        setTrigger: 'Partner uploads partial documents',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner to complete upload',
        partnerCanUpdate: true,
        partnerTransitions: ['documents_submitted'],
        systemCanUpdate: true,
        systemTransitions: ['documents_submitted']
      },

      rules: {
        isDocumentUploadStatus: true,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: true,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Partner uploading documents...',
            primaryMessage: 'Partner uploading documents...',
            secondaryMessage: 'Partner is in the process of uploading documents',
            dashboardTitle: 'Documents Uploading',
            dashboardSubtitle: 'In Progress',
            listViewStatus: 'Upload in Progress',
            heroCardTitle: 'Document Upload in Progress',
            heroCardSubtitle: 'Partner Uploading',
            heroCardDescription: 'Partner is uploading additional documents',
            timelineTitle: 'Upload Started',
            timelineDescription: 'Partner began uploading requested documents',
            actionButtonText: undefined,
            successMessage: 'Upload progress tracked',
            errorMessage: 'Upload tracking error',
            infoMessage: 'Partner is uploading the requested documents',
            emptyStateTitle: 'Upload in Progress',
            emptyStateDescription: 'Partner is uploading documents',
            loadingMessage: 'Monitoring upload progress...',
            nextStepsTitle: 'In Progress',
            nextSteps: ['Partner completing upload', 'Will notify when upload complete'],
            estimatedTime: 'Upload in progress',
            urgencyText: 'Waiting for completion'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '⏳',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Complete your document upload',
            primaryMessage: 'Complete your document upload',
            secondaryMessage: 'Please upload all remaining required documents',
            dashboardTitle: 'Upload Incomplete',
            dashboardSubtitle: 'Action Required',
            listViewStatus: 'Complete Upload',
            heroCardTitle: 'Complete Upload',
            heroCardSubtitle: 'Upload Remaining Documents',
            heroCardDescription: 'You have uploaded some documents, please complete the upload',
            timelineTitle: 'Upload in Progress',
            timelineDescription: 'You started uploading documents',
            actionButtonText: 'Complete Upload',
            actionButtonSecondary: 'Continue Uploading',
            successMessage: 'Upload progress saved',
            errorMessage: 'Upload error occurred',
            warningMessage: 'Please upload all required documents',
            infoMessage: 'You can upload multiple files at once',
            emptyStateTitle: 'Upload Incomplete',
            emptyStateDescription: 'Please upload the remaining required documents',
            loadingMessage: 'Loading upload interface...',
            nextStepsTitle: 'Complete Upload',
            nextSteps: ['Upload remaining documents', 'Submit completed application'],
            estimatedTime: 'Complete today',
            urgencyText: 'Please complete upload'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '⏳',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 3,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [],
        partner: [{
          id: 'complete_upload',
          label: 'Complete Upload',
          type: 'primary',
          icon: 'Upload',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }]
      },

      behavior: {
        onEntry: ['showUploadProgress'],
        onExit: ['validateAllUploads'],
        onAction: 'showDocumentUpload',
        onDocumentUpload: 'trackProgress',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['uploadComplete'],
        auditEvents: ['documents.partial_upload']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: false,
        reviewRequired: false,
        bulkUpload: true,
        allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
        maxSize: 10,
        downloadable: false
      },

      validation: {
        onEntry: ['some_documents_uploaded'],
        onExit: ['all_documents_uploaded'],
        requiredFields: [],
        businessRules: ['upload_timeout'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Partner has uploaded some but not all documents"
    },

    // ===== DOCUMENTS_SUBMITTED =====
    documents_submitted: {
      authority: {
        setBy: 'System',
        setTrigger: 'Partner uploads all documents',
        adminCanUpdate: true,
        adminTransitions: ['documents_under_review', 'documents_approved', 'documents_rejected', 'documents_resubmission_required'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin review',
        systemCanUpdate: true,
        systemTransitions: []
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: true,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Review submitted documents',
            primaryMessage: 'Review uploaded documents for approval',
            secondaryMessage: 'Partner has submitted all requested documents',
            dashboardTitle: 'Documents Submitted',
            dashboardSubtitle: 'Ready for Review',
            listViewStatus: 'Documents Submitted',
            heroCardTitle: 'Documents Ready for Review',
            heroCardSubtitle: 'All Documents Uploaded',
            heroCardDescription: 'Partner has submitted requested documents',
            timelineTitle: 'Documents Submitted',
            timelineDescription: 'Partner submitted all requested documents',
            actionButtonText: 'Review Documents & Decide',
            actionButtonSecondary: 'View Documents',
            successMessage: 'Document review completed',
            errorMessage: 'Failed to complete document review',
            warningMessage: 'Please review all documents before deciding',
            infoMessage: 'All requested documents have been uploaded',
            emptyStateTitle: 'Documents Ready',
            emptyStateDescription: 'Review the uploaded documents',
            loadingMessage: 'Loading documents for review...',
            nextStepsTitle: 'Review Documents',
            nextSteps: ['Review each uploaded document', 'Check document quality and completeness', 'Approve or request changes'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Ready for review'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '📄',
            urgencyLevel: 'medium',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Documents submitted - awaiting review',
            primaryMessage: 'Documents uploaded - awaiting admin review',
            secondaryMessage: 'All requested documents have been submitted',
            dashboardTitle: 'Documents Submitted',
            dashboardSubtitle: 'Under Review',
            listViewStatus: 'Documents Submitted',
            heroCardTitle: 'Documents Submitted',
            heroCardSubtitle: 'Under Admin Review',
            heroCardDescription: 'All requested documents have been submitted',
            timelineTitle: 'Documents Uploaded',
            timelineDescription: 'You submitted all requested documents',
            actionButtonText: undefined,
            successMessage: 'All documents submitted successfully',
            errorMessage: 'Unable to check document status',
            infoMessage: 'Admin is reviewing your submitted documents',
            emptyStateTitle: 'Documents Submitted',
            emptyStateDescription: 'Admin is reviewing your documents',
            loadingMessage: 'Checking document review status...',
            nextStepsTitle: 'Under Review',
            nextSteps: ['Admin reviewing documents', 'Decision will be communicated'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Please wait for review'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '📄',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [{
          id: 'review_docs',
          label: 'Review Documents & Decide',
          type: 'primary',
          icon: 'FileText',
          behavior: 'custom',
          target: 'expandDocumentsAndScroll',
          requiresConfirmation: false
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandDocumentSection'],
        onExit: ['logDocumentDecision'],
        onAction: 'expandDocumentsAndScroll',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['documentsReviewed'],
        auditEvents: ['documents.submitted']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['all_documents_uploaded'],
        onExit: ['document_review_complete'],
        requiredFields: [],
        businessRules: ['review_deadline'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Partner has uploaded all requested documents"
    },

    // ===== DOCUMENTS_UNDER_REVIEW =====
    documents_under_review: {
      authority: {
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

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: true,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Complete document review',
            primaryMessage: 'Review documents and make approval decision',
            secondaryMessage: 'Document review is in progress',
            dashboardTitle: 'Documents Under Review',
            dashboardSubtitle: 'Review in Progress',
            listViewStatus: 'Documents Under Review',
            heroCardTitle: 'Document Review in Progress',
            heroCardSubtitle: 'Review Each Document',
            heroCardDescription: 'Submitted documents are being reviewed',
            timelineTitle: 'Document Review Started',
            timelineDescription: 'Admin began reviewing uploaded documents',
            actionButtonText: 'Complete Review',
            actionButtonSecondary: 'Continue Review',
            successMessage: 'Document review completed',
            errorMessage: 'Failed to complete document review',
            warningMessage: 'Please complete review of all documents',
            infoMessage: 'Review each document carefully before deciding',
            emptyStateTitle: 'Review in Progress',
            emptyStateDescription: 'Complete the document review',
            loadingMessage: 'Loading document review interface...',
            nextStepsTitle: 'Complete Review',
            nextSteps: ['Review each document', 'Check quality and completeness', 'Make final decision'],
            estimatedTime: '2-4 hours',
            urgencyText: 'Review in progress'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '🔍',
            urgencyLevel: 'medium',
            badgeVariant: 'warning',
            progressStep: 4,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Documents being reviewed',
            primaryMessage: 'Admin is reviewing your documents',
            secondaryMessage: 'Your documents are being carefully reviewed',
            dashboardTitle: 'Documents Under Review',
            dashboardSubtitle: 'Please Wait',
            listViewStatus: 'Under Review',
            heroCardTitle: 'Documents Under Review',
            heroCardSubtitle: 'Review in Progress',
            heroCardDescription: 'Admin is reviewing your submitted documents',
            timelineTitle: 'Document Review Started',
            timelineDescription: 'Admin is reviewing your documents',
            actionButtonText: undefined,
            successMessage: 'Documents are being reviewed',
            errorMessage: 'Unable to check review status',
            infoMessage: 'Admin is carefully reviewing each document',
            emptyStateTitle: 'Review in Progress',
            emptyStateDescription: 'Please wait while documents are reviewed',
            loadingMessage: 'Checking review progress...',
            nextStepsTitle: 'Please Wait',
            nextSteps: ['Documents being reviewed', 'Decision will be communicated'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Please be patient'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '🔍',
            urgencyLevel: 'low',
            badgeVariant: 'warning',
            progressStep: 4,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [{
          id: 'complete_review',
          label: 'Complete Review',
          type: 'primary',
          icon: 'CheckSquare',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: false
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandDocumentSection'],
        onExit: ['validateDecision'],
        onAction: 'showStatusModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['reviewComplete'],
        auditEvents: ['documents.under_review']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['documents_available'],
        onExit: ['all_documents_reviewed'],
        requiredFields: [],
        businessRules: ['complete_review_required'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Admin is reviewing the uploaded documents"
    },

    // ===== DOCUMENTS_APPROVED =====
    documents_approved: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin approves all documents',
        adminCanUpdate: true,
        adminTransitions: ['approved_stage1', 'correction_requested_admin'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for System to auto-approve Stage 1',
        systemCanUpdate: true,
        systemTransitions: ['approved_stage1']
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Move to Stage 1 approval',
            primaryMessage: 'Finalize application approval for university submission',
            secondaryMessage: 'All documents have been approved',
            dashboardTitle: 'Documents Approved',
            dashboardSubtitle: 'Ready to Approve',
            listViewStatus: 'Documents Approved',
            heroCardTitle: 'Documents Approved',
            heroCardSubtitle: 'Finalize Stage 1',
            heroCardDescription: 'Admin approved all uploaded documents',
            timelineTitle: 'Documents Approved',
            timelineDescription: 'Admin approved all submitted documents',
            actionButtonText: 'Approve Stage 1',
            actionButtonSecondary: 'Continue Processing',
            successMessage: 'Documents approved successfully',
            errorMessage: 'Failed to approve documents',
            infoMessage: 'All documents meet requirements',
            emptyStateTitle: 'Documents Approved',
            emptyStateDescription: 'Ready to complete Stage 1 approval',
            loadingMessage: 'Processing approval...',
            nextStepsTitle: 'Final Approval',
            nextSteps: ['Complete Stage 1 approval', 'Prepare for university submission'],
            estimatedTime: 'Ready now',
            urgencyText: 'Ready to approve'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 5,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Documents approved!',
            primaryMessage: 'Documents approved - being prepared for university',
            secondaryMessage: 'Great! All your documents have been approved',
            dashboardTitle: 'Documents Approved',
            dashboardSubtitle: 'Success!',
            listViewStatus: 'Documents Approved',
            heroCardTitle: 'Documents Approved!',
            heroCardSubtitle: 'All Documents Accepted',
            heroCardDescription: 'All your documents have been approved',
            timelineTitle: 'Documents Approved',
            timelineDescription: 'Admin approved all your documents',
            actionButtonText: undefined,
            successMessage: 'Congratulations! All documents approved',
            errorMessage: 'Unable to check approval status',
            infoMessage: 'Your application is progressing well',
            emptyStateTitle: 'Documents Approved',
            emptyStateDescription: 'Your documents meet all requirements',
            loadingMessage: 'Processing approval...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Final approval processing', 'Preparation for university submission'],
            estimatedTime: 'Processing now',
            urgencyText: 'Great progress!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 5,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [{
          id: 'approve_stage1',
          label: 'Approve Stage 1',
          type: 'success',
          icon: 'CheckCircle',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: true,
          confirmationMessage: 'Are you sure you want to approve Stage 1? This will move the application to university submission.'
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandTimelineSection'],
        onExit: ['triggerStage1Completion'],
        onAction: 'showStatusModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        autoProgressTo: 'approved_stage1',
        waitingForActor: 'Admin',
        notificationTriggers: ['stage1Ready'],
        auditEvents: ['documents.approved']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['all_documents_approved'],
        onExit: ['stage1_requirements_met'],
        requiredFields: [],
        businessRules: ['approval_authority'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Admin approved all documents, ready for Stage 1 completion"
    },

    // ===== DOCUMENTS_REJECTED =====
    documents_rejected: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin rejects documents completely',
        adminCanUpdate: true,
        adminTransitions: ['correction_requested_admin', 'approved_stage1'],
        adminWaitsFor: 'Admin decision - request corrections or proceed with rejection',
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin decision',
        systemCanUpdate: true,
        systemTransitions: ['rejected_stage1']
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: true,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: true,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Documents rejected - application terminated',
            primaryMessage: 'Documents rejected - application terminated',
            secondaryMessage: 'Documents did not meet requirements',
            dashboardTitle: 'Documents Rejected',
            dashboardSubtitle: 'Process Ended',
            listViewStatus: 'Documents Rejected',
            heroCardTitle: 'Documents Rejected',
            heroCardSubtitle: 'Application Terminated',
            heroCardDescription: 'Documents did not meet requirements',
            timelineTitle: 'Documents Rejected',
            timelineDescription: 'Admin rejected documents - process terminated',
            actionButtonText: undefined,
            successMessage: 'Rejection recorded',
            errorMessage: 'Unable to record rejection',
            infoMessage: 'Application process has ended',
            emptyStateTitle: 'Process Terminated',
            emptyStateDescription: 'Application cannot proceed',
            loadingMessage: 'Processing rejection...',
            nextStepsTitle: 'Process Complete',
            nextSteps: ['Application terminated', 'Partner notified of rejection'],
            estimatedTime: 'Complete',
            urgencyText: 'Process ended'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 0,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Documents rejected - application terminated',
            primaryMessage: 'Documents rejected - application terminated',
            secondaryMessage: 'Unfortunately, your documents did not meet requirements',
            dashboardTitle: 'Documents Rejected',
            dashboardSubtitle: 'Application Ended',
            listViewStatus: 'Application Rejected',
            heroCardTitle: 'Application Not Approved',
            heroCardSubtitle: 'Documents Rejected',
            heroCardDescription: 'Unfortunately, your documents did not meet requirements',
            timelineTitle: 'Application Rejected',
            timelineDescription: 'Admin rejected your documents',
            actionButtonText: undefined,
            successMessage: 'Status updated',
            errorMessage: 'Unable to check status',
            infoMessage: 'You can create a new application if needed',
            emptyStateTitle: 'Application Rejected',
            emptyStateDescription: 'This application cannot proceed further',
            loadingMessage: 'Loading information...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Review rejection reasons', 'Consider creating new application'],
            estimatedTime: 'Process complete',
            urgencyText: 'Application ended'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 0,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [],
        partner: []
      },

      behavior: {
        onEntry: ['logRejection', 'notifyPartner'],
        onExit: [],
        onAction: 'none',
        modalToShow: 'none',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['applicationRejected'],
        auditEvents: ['documents.rejected']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: false
      },

      validation: {
        onEntry: ['rejection_reason_provided'],
        onExit: [],
        requiredFields: ['rejection_reason'],
        businessRules: [],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Admin rejected documents - application terminated"
    },

    // ===== DOCUMENTS_RESUBMISSION_REQUIRED =====
    documents_resubmission_required: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin needs document corrections',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner to resubmit documents',
        partnerCanUpdate: true,
        partnerTransitions: ['documents_partially_submitted'],
        systemCanUpdate: true,
        systemTransitions: ['documents_partially_submitted', 'documents_submitted']
      },

      rules: {
        isDocumentUploadStatus: true,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: true,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Waiting for document resubmission',
            primaryMessage: 'Waiting for partner to resubmit corrected documents',
            secondaryMessage: 'Document corrections have been requested',
            dashboardTitle: 'Resubmission Required',
            dashboardSubtitle: 'Waiting for Partner',
            listViewStatus: 'Awaiting Resubmission',
            heroCardTitle: 'Resubmission Required',
            heroCardSubtitle: 'Waiting for Corrections',
            heroCardDescription: 'Some documents need to be resubmitted with corrections',
            timelineTitle: 'Resubmission Requested',
            timelineDescription: 'Admin requested document resubmission',
            actionButtonText: undefined,
            successMessage: 'Resubmission request sent',
            errorMessage: 'Failed to request resubmission',
            infoMessage: 'Partner has been notified of resubmission requirements',
            emptyStateTitle: 'Waiting for Partner',
            emptyStateDescription: 'Partner will resubmit corrected documents',
            loadingMessage: 'Checking for resubmitted documents...',
            nextStepsTitle: 'Waiting For',
            nextSteps: ['Partner to review requirements', 'Partner to resubmit documents'],
            estimatedTime: '3-5 business days',
            urgencyText: 'Waiting for partner'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '🔄',
            urgencyLevel: 'low',
            badgeVariant: 'warning',
            progressStep: 3,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Resubmit corrected documents',
            primaryMessage: 'Admin requested document corrections - please resubmit',
            secondaryMessage: 'Some documents need corrections before approval',
            dashboardTitle: 'Action Required',
            dashboardSubtitle: 'Resubmit Documents',
            listViewStatus: 'Resubmission Required',
            heroCardTitle: 'Resubmission Required',
            heroCardSubtitle: 'Correct and Resubmit',
            heroCardDescription: 'Admin requested document corrections - please resubmit',
            timelineTitle: 'Corrections Needed',
            timelineDescription: 'Admin requested document corrections',
            actionButtonText: 'Resubmit Documents',
            actionButtonSecondary: 'View Requirements',
            successMessage: 'Documents resubmitted successfully',
            errorMessage: 'Failed to resubmit documents',
            warningMessage: 'Please correct all issues before resubmitting',
            infoMessage: 'Review the feedback and resubmit corrected documents',
            emptyStateTitle: 'Resubmission Required',
            emptyStateDescription: 'Please resubmit corrected documents',
            loadingMessage: 'Loading resubmission interface...',
            nextStepsTitle: 'Action Required',
            nextSteps: ['Review admin feedback', 'Correct identified issues', 'Resubmit documents'],
            estimatedTime: 'Please resubmit ASAP',
            urgencyText: 'Urgent - Corrections Required'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '🔄',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 3,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [],
        partner: [{
          id: 'resubmit_docs',
          label: 'Resubmit Documents',
          type: 'primary',
          icon: 'RefreshCw',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }]
      },

      behavior: {
        onEntry: ['expandDocumentSection', 'highlightCorrections'],
        onExit: ['validateResubmission'],
        onAction: 'showDocumentUpload',
        onDocumentUpload: 'trackResubmission',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['documentsResubmitted'],
        auditEvents: ['documents.resubmission_required']
      },

      documents: {
        required: ['corrected_documents'],
        optional: [],
        autoGenerate: [],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: true,
        allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
        maxSize: 10,
        downloadable: true
      },

      validation: {
        onEntry: ['correction_feedback_provided'],
        onExit: ['corrected_documents_uploaded'],
        requiredFields: ['correction_list'],
        businessRules: ['resubmission_deadline'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Some documents need to be resubmitted with corrections"
    },

    // ===== APPROVED_STAGE1 =====
    approved_stage1: {
      authority: {
        setBy: 'System',
        setTrigger: 'Admin confirms documents and application',
        adminCanUpdate: true,
        adminTransitions: ['sent_to_university'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin/System to send to university',
        systemCanUpdate: true,
        systemTransitions: ['sent_to_university']
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: true,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Ready to send to university',
            primaryMessage: 'Application approved - ready to send to university',
            secondaryMessage: 'Stage 1 complete - ready for university submission',
            dashboardTitle: 'Stage 1 Approved',
            dashboardSubtitle: 'Ready for University',
            listViewStatus: 'Stage 1 Approved',
            heroCardTitle: 'Stage 1 Complete!',
            heroCardSubtitle: 'Ready for University',
            heroCardDescription: 'Admin approved, ready for university submission',
            timelineTitle: 'Stage 1 Approved',
            timelineDescription: 'Application approved and ready for university',
            actionButtonText: 'Send to University',
            actionButtonSecondary: 'Prepare Submission',
            successMessage: 'Stage 1 approved successfully',
            errorMessage: 'Failed to process Stage 1 approval',
            infoMessage: 'Application is ready for university submission',
            emptyStateTitle: 'Ready to Submit',
            emptyStateDescription: 'Prepare and submit to university',
            loadingMessage: 'Preparing university submission...',
            nextStepsTitle: 'University Submission',
            nextSteps: ['Prepare university submission package', 'Submit to university', 'Begin Stage 2'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Ready to proceed'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎓',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 5,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Stage 1 approved! Moving to university review',
            primaryMessage: 'Application approved - being prepared for university',
            secondaryMessage: 'Congratulations! Your application has been approved',
            dashboardTitle: 'Application Approved',
            dashboardSubtitle: 'Moving to University',
            listViewStatus: 'Stage 1 Approved',
            heroCardTitle: 'Application Approved! 🎉',
            heroCardSubtitle: 'Moving to University Review',
            heroCardDescription: 'Your application has been approved and will be sent to university',
            timelineTitle: 'Stage 1 Complete',
            timelineDescription: 'Your application has been approved',
            actionButtonText: undefined,
            successMessage: 'Congratulations! Stage 1 approved',
            errorMessage: 'Unable to check approval status',
            infoMessage: 'Your application will now be sent to the university',
            emptyStateTitle: 'Approved!',
            emptyStateDescription: 'Your application is being prepared for university',
            loadingMessage: 'Preparing for university submission...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Application sent to university', 'University review begins', 'You\'ll be notified of progress'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Great news!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎓',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 5,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [{
          id: 'send_university',
          label: 'Send to University',
          type: 'success',
          icon: 'Send',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: true,
          confirmationMessage: 'Are you sure you want to send this application to the university? This will begin Stage 2.'
        }],
        partner: []
      },

      behavior: {
        onEntry: ['celebrateApproval', 'expandTimelineSection'],
        onExit: ['initializeStage2'],
        onAction: 'showStatusModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        autoProgressTo: 'sent_to_university',
        waitingForActor: 'Admin',
        notificationTriggers: ['stage1Complete', 'readyForUniversity'],
        auditEvents: ['stage1.approved']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: ['university_submission_package'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['stage1_requirements_complete'],
        onExit: ['ready_for_stage2'],
        requiredFields: [],
        businessRules: ['university_submission_ready'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Stage 1 approved - ready for university submission"
    },

    // ===== REJECTED_STAGE1 =====
    rejected_stage1: {
      authority: {
        setBy: 'System',
        setTrigger: 'Admin rejects application',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'Terminal status - no further action needed',
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'Terminal status - application rejected',
        systemCanUpdate: false,
        systemTransitions: []
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: true,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: true,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Application rejected at Stage 1',
            primaryMessage: 'Application rejected at Stage 1',
            secondaryMessage: 'Application did not meet Stage 1 requirements',
            dashboardTitle: 'Application Rejected',
            dashboardSubtitle: 'Process Complete',
            listViewStatus: 'Stage 1 Rejected',
            heroCardTitle: 'Application Rejected',
            heroCardSubtitle: 'Stage 1 Not Approved',
            heroCardDescription: 'Application has been rejected at Stage 1',
            timelineTitle: 'Application Rejected',
            timelineDescription: 'Application rejected - process terminated',
            actionButtonText: undefined,
            successMessage: 'Rejection processed',
            errorMessage: 'Unable to process rejection',
            infoMessage: 'Application process has been terminated',
            emptyStateTitle: 'Process Complete',
            emptyStateDescription: 'Application has been rejected',
            loadingMessage: 'Processing rejection...',
            nextStepsTitle: 'Process Complete',
            nextSteps: ['Application terminated', 'Partner notified'],
            estimatedTime: 'Complete',
            urgencyText: 'Process ended'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '🚫',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 0,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Application rejected at Stage 1',
            primaryMessage: 'Application rejected at Stage 1',
            secondaryMessage: 'Unfortunately, your application did not meet requirements',
            dashboardTitle: 'Application Rejected',
            dashboardSubtitle: 'Not Approved',
            listViewStatus: 'Application Rejected',
            heroCardTitle: 'Application Not Approved',
            heroCardSubtitle: 'Stage 1 Rejected',
            heroCardDescription: 'Unfortunately, your application has been rejected',
            timelineTitle: 'Application Rejected',
            timelineDescription: 'Your application was not approved',
            actionButtonText: undefined,
            successMessage: 'Status updated',
            errorMessage: 'Unable to check status',
            infoMessage: 'You can create a new application if needed',
            emptyStateTitle: 'Application Rejected',
            emptyStateDescription: 'This application cannot proceed',
            loadingMessage: 'Loading information...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Review rejection reasons', 'Consider improvements for future applications'],
            estimatedTime: 'Process complete',
            urgencyText: 'Application ended'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '🚫',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 0,
            progressTotal: 5
          }
        }
      },

      actions: {
        admin: [],
        partner: []
      },

      behavior: {
        onEntry: ['finalizeRejection', 'notifyAllParties'],
        onExit: [],
        onAction: 'none',
        modalToShow: 'none',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['finalRejection'],
        auditEvents: ['stage1.rejected']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: false
      },

      validation: {
        onEntry: ['rejection_reason_documented'],
        onExit: [],
        requiredFields: ['rejection_reason'],
        businessRules: [],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Application rejected at Stage 1 - terminal status"
    },

    // ===== APPLICATION_CANCELLED =====
    application_cancelled: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin cancels application permanently',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'TERMINAL - No further actions',
        partnerCanUpdate: false,
        partnerTransitions: [],
        systemCanUpdate: false,
        systemTransitions: []
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: true,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: true,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      behavior: {
        onEntry: ['sendCancellationNotification'],
        onExit: [],
        onAction: 'none',
        modalToShow: 'none',
        redirectAfterAction: false,
        waitingForActor: 'System',
        notificationTriggers: ['applicationCancelled'],
        auditEvents: ['application.cancelled']
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Application Cancelled',
            primaryMessage: 'This application has been permanently cancelled',
            secondaryMessage: 'No further actions are possible on this application',
            dashboardTitle: 'Cancelled',
            dashboardSubtitle: 'Permanently cancelled',
            listViewStatus: 'Cancelled',
            heroCardTitle: 'Application Cancelled',
            heroCardSubtitle: 'Permanently Closed',
            heroCardDescription: 'This application has been cancelled and cannot be processed further',
            timelineTitle: 'Application Cancelled',
            timelineDescription: 'Application permanently cancelled by admin',
            successMessage: 'Application cancelled successfully',
            errorMessage: 'Unable to cancel application',
            emptyStateTitle: 'No Actions Available',
            emptyStateDescription: 'This application is cancelled',
            loadingMessage: 'Loading cancelled application...',
            nextStepsTitle: 'No Further Actions',
            nextSteps: ['Application is permanently closed'],
            estimatedTime: 'N/A',
            urgencyText: 'Cancelled'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'low',
            badgeVariant: 'error'
          }
        },
        partner: {
          allText: {
            statusCard: 'Application Cancelled',
            primaryMessage: 'Your application has been cancelled',
            secondaryMessage: 'Please contact support if you have questions',
            dashboardTitle: 'Cancelled',
            dashboardSubtitle: 'Application closed',
            listViewStatus: 'Cancelled',
            heroCardTitle: 'Application Cancelled',
            heroCardSubtitle: 'Application Closed',
            heroCardDescription: 'Your application has been cancelled. No further action is required',
            timelineTitle: 'Application Cancelled',
            timelineDescription: 'Your application was cancelled',
            successMessage: 'Application status updated',
            errorMessage: 'Unable to load application status',
            emptyStateTitle: 'Application Cancelled',
            emptyStateDescription: 'No further actions available',
            loadingMessage: 'Loading application...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Contact support if needed'],
            estimatedTime: 'N/A',
            urgencyText: 'No action required'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'low',
            badgeVariant: 'error'
          }
        }
      },

      actions: {
        admin: [],
        partner: []
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['cancellation_reason_provided'],
        onExit: [],
        requiredFields: ['cancelReason'],
        businessRules: [],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Application permanently cancelled - terminal status"
    },

    // ===== APPLICATION_ON_HOLD =====
    application_on_hold: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin puts application on temporary hold',
        adminCanUpdate: true,
        adminTransitions: ['resume_from_hold'],
        adminWaitsFor: 'Admin decides when to resume',
        partnerCanUpdate: false,
        partnerTransitions: [],
        systemCanUpdate: false,
        systemTransitions: []
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: true,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      behavior: {
        onEntry: ['sendHoldNotification'],
        onExit: ['sendResumeNotification'],
        onAction: 'showResumeModal',
        modalToShow: 'StatusResumeModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['applicationOnHold'],
        auditEvents: ['application.on_hold']
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Application On Hold',
            primaryMessage: 'This application is temporarily on hold',
            secondaryMessage: 'Click Resume to continue processing when ready',
            dashboardTitle: 'On Hold',
            dashboardSubtitle: 'Temporarily paused',
            listViewStatus: 'On Hold',
            heroCardTitle: 'Application On Hold',
            heroCardSubtitle: 'Temporarily Paused',
            heroCardDescription: 'This application has been temporarily put on hold pending review',
            timelineTitle: 'Application On Hold',
            timelineDescription: 'Application temporarily paused by admin',
            actionButtonText: 'Resume Application',
            successMessage: 'Application resumed successfully',
            errorMessage: 'Unable to resume application',
            emptyStateTitle: 'Application On Hold',
            emptyStateDescription: 'Application is temporarily paused',
            loadingMessage: 'Loading application details...',
            nextStepsTitle: 'Admin Action Required',
            nextSteps: ['Review hold reason', 'Resume when ready'],
            estimatedTime: 'Pending admin review',
            urgencyText: 'On hold'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '⏸️',
            urgencyLevel: 'low',
            badgeVariant: 'warning'
          }
        },
        partner: {
          allText: {
            statusCard: 'Application On Hold',
            primaryMessage: 'Your application is temporarily on hold',
            secondaryMessage: 'We will notify you when processing resumes',
            dashboardTitle: 'On Hold',
            dashboardSubtitle: 'Temporarily paused',
            listViewStatus: 'On Hold',
            heroCardTitle: 'Application On Hold',
            heroCardSubtitle: 'Temporarily Paused',
            heroCardDescription: 'Your application is temporarily on hold. We will resume processing soon',
            timelineTitle: 'Application On Hold',
            timelineDescription: 'Your application is temporarily on hold',
            successMessage: 'Application status updated',
            errorMessage: 'Unable to load application status',
            emptyStateTitle: 'Application On Hold',
            emptyStateDescription: 'Temporarily paused',
            loadingMessage: 'Loading application...',
            nextStepsTitle: 'What Happens Next',
            nextSteps: ['Wait for notification', 'We will resume processing'],
            estimatedTime: 'Pending review',
            urgencyText: 'Please wait'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '⏸️',
            urgencyLevel: 'low',
            badgeVariant: 'warning'
          }
        }
      },

      actions: {
        admin: [
          {
            id: 'resume_from_hold',
            label: 'Resume Application',
            type: 'primary',
            behavior: 'custom',
            requiresConfirmation: true,
            confirmationMessage: 'Are you sure you want to resume this application?',
            permissions: ['application.resume']
          }
        ],
        partner: []
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['hold_reason_provided'],
        onExit: ['resume_approved'],
        requiredFields: ['holdReason'],
        businessRules: [],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Application temporarily on hold - can be resumed"
    }
  },

  defaultTransitions: ['sent_to_university'],
  stageCompletionStatus: 'approved_stage1',
  nextStage: 2,
  
  version: "1.0.0",
  lastUpdated: "2025-08-26"
};

// Export default for easy importing
export default STAGE_1_CONFIG;
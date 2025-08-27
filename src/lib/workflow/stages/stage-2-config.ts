/**
 * Stage 2 Configuration: University Review & Offer Letter
 * 
 * This file contains ALL Stage 2 workflow logic based on the PDF workflow matrix.
 * Handles university interactions, program changes, and offer letter processes.
 * 
 * Based on PDF Workflow Status Actions Matrix:
 * - sent_to_university (Admin can update)
 * - university_requested_corrections (Partner can update)
 * - program_change_suggested (Partner can update)
 * - program_change_accepted (Admin can update)
 * - program_change_rejected (Partner can update)
 * - university_approved (Admin can update)
 * - rejected_university (Terminal status)
 * - offer_letter_issued (Admin can update)
 */

import { StageConfig } from './types';

export const STAGE_2_CONFIG: StageConfig = {
  stageName: "University Review & Offer Letter",
  stageDescription: "University evaluation and offer letter process",
  stageIcon: "🎓",
  stageColor: "purple",
  estimatedDuration: "2-6 weeks",
  
  statuses: {
    // ===== SENT_TO_UNIVERSITY =====
    sent_to_university: {
      // Authority matrix from PDF
      authority: {
        setBy: 'System',
        setTrigger: 'After approved_stage1 happened',
        adminCanUpdate: true,
        adminTransitions: ['university_approved', 'rejected_university', 'university_requested_corrections', 'program_change_suggested'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for university decision',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
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
        autoRefreshRequired: true, // Check university status periodically
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration for both roles
      display: {
        admin: {
          allText: {
            statusCard: 'Awaiting university decision',
            primaryMessage: 'Application sent to university - monitoring response',
            secondaryMessage: 'University is reviewing the submitted application',
            dashboardTitle: 'Sent to University',
            dashboardSubtitle: 'Awaiting Decision',
            listViewStatus: 'University Review',
            heroCardTitle: 'University Review in Progress',
            heroCardSubtitle: 'Application Submitted',
            heroCardDescription: 'Application submitted to university for review',
            timelineTitle: 'Sent to University',
            timelineDescription: 'Application submitted to university for evaluation',
            actionButtonText: 'Check University Status',
            actionButtonSecondary: 'Update Status',
            successMessage: 'University status updated successfully',
            errorMessage: 'Failed to update university status',
            warningMessage: 'Please monitor university response',
            infoMessage: 'University review typically takes 2-4 weeks',
            emptyStateTitle: 'Awaiting University',
            emptyStateDescription: 'University will respond when review is complete',
            loadingMessage: 'Checking university status...',
            nextStepsTitle: 'Monitoring University',
            nextSteps: ['Monitor university portal', 'Prepare for potential corrections', 'Track response timeline'],
            estimatedTime: '2-4 weeks',
            urgencyText: 'Standard university timeline'
          },
          styling: {
            statusColor: 'purple',
            statusIcon: '🎓',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 1,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'University reviewing your application',
            primaryMessage: 'Your application is being reviewed by the university',
            secondaryMessage: 'The university is evaluating your application materials',
            dashboardTitle: 'University Review',
            dashboardSubtitle: 'In Progress',
            listViewStatus: 'University Review',
            heroCardTitle: 'University Review',
            heroCardSubtitle: 'Application Under Evaluation',
            heroCardDescription: 'The university is reviewing your application',
            timelineTitle: 'University Review Started',
            timelineDescription: 'Your application was sent to the university',
            actionButtonText: undefined,
            successMessage: 'Application status updated',
            errorMessage: 'Unable to check university status',
            infoMessage: 'University typically responds within 2-4 weeks',
            emptyStateTitle: 'Under Review',
            emptyStateDescription: 'Please wait while university reviews your application',
            loadingMessage: 'Checking review status...',
            nextStepsTitle: 'Please Wait',
            nextSteps: ['University reviewing application', 'Decision will be communicated', 'Prepare for potential requests'],
            estimatedTime: '2-4 weeks',
            urgencyText: 'Please be patient'
          },
          styling: {
            statusColor: 'purple',
            statusIcon: '🎓',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 1,
            progressTotal: 4
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'check_university_status',
          label: 'Check University Status',
          type: 'secondary',
          icon: 'ExternalLink',
          behavior: 'external',
          target: 'university_portal',
          requiresConfirmation: false
        }, {
          id: 'update_status',
          label: 'Update Status',
          type: 'primary',
          icon: 'Edit',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: false
        }],
        partner: []
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'startUniversityTracking'],
        onExit: ['stopUniversityTracking'],
        onAction: 'showStatusModal',
        modalToShow: 'StatusUpdateModal',
        redirectAfterAction: false,
        waitingForActor: 'University',
        notificationTriggers: ['universityStatusChange'],
        auditEvents: ['university.submitted']
      },

      documents: {
        required: [],
        optional: ['university_correspondence'],
        autoGenerate: ['university_submission_package'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['stage1_complete', 'university_submission_ready'],
        onExit: ['university_response_received'],
        requiredFields: [],
        businessRules: ['university_response_timeout'],
        dependencies: ['approved_stage1'],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Application submitted to university for review"
    },

    // ===== UNIVERSITY_REQUESTED_CORRECTIONS =====
    university_requested_corrections: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin after he submit the application to university and university response that we need these corrections',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner',
        partnerCanUpdate: true,
        partnerTransitions: ['sent_to_university'],
        systemCanUpdate: false,
        systemTransitions: []
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
            statusCard: 'Waiting for partner to upload corrections',
            primaryMessage: 'University requested corrections - waiting for partner',
            secondaryMessage: 'University needs additional documents or corrections',
            dashboardTitle: 'University Corrections',
            dashboardSubtitle: 'Waiting for Partner',
            listViewStatus: 'Corrections Requested',
            heroCardTitle: 'University Requested Corrections',
            heroCardSubtitle: 'Partner Action Required',
            heroCardDescription: 'University requires additional documents',
            timelineTitle: 'University Corrections',
            timelineDescription: 'University requested additional documents',
            actionButtonText: undefined,
            successMessage: 'Correction request processed',
            errorMessage: 'Failed to process correction request',
            infoMessage: 'Partner has been notified of university requirements',
            emptyStateTitle: 'Waiting for Partner',
            emptyStateDescription: 'Partner will upload required corrections',
            loadingMessage: 'Monitoring upload progress...',
            nextStepsTitle: 'Waiting For',
            nextSteps: ['Partner to review university requirements', 'Partner to upload corrections', 'Resubmit to university'],
            estimatedTime: '3-7 days',
            urgencyText: 'Waiting for partner action'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '📤',
            urgencyLevel: 'medium',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'University requested corrections - upload required',
            primaryMessage: 'University needs additional documents',
            secondaryMessage: 'Please upload the documents requested by the university',
            dashboardTitle: 'University Corrections',
            dashboardSubtitle: 'Action Required',
            listViewStatus: 'Upload Required',
            heroCardTitle: 'University Corrections Needed',
            heroCardSubtitle: 'Upload Additional Documents',
            heroCardDescription: 'University requires additional documents',
            timelineTitle: 'Corrections Requested',
            timelineDescription: 'University requested additional documents',
            actionButtonText: 'Upload Corrections',
            actionButtonSecondary: 'View Requirements',
            successMessage: 'Corrections uploaded successfully',
            errorMessage: 'Failed to upload corrections',
            warningMessage: 'Please upload all requested documents',
            infoMessage: 'Check university requirements carefully',
            emptyStateTitle: 'Upload Required',
            emptyStateDescription: 'Upload the documents requested by university',
            loadingMessage: 'Preparing upload interface...',
            nextStepsTitle: 'Action Required',
            nextSteps: ['Review university requirements', 'Upload requested documents', 'Submit corrections'],
            estimatedTime: 'Upload ASAP',
            urgencyText: 'University waiting'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '📤',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [],
        partner: [{
          id: 'upload_university_corrections',
          label: 'Upload Corrections',
          type: 'primary',
          icon: 'Upload',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }]
      },

      behavior: {
        onEntry: ['expandDocumentSection', 'highlightUniversityRequirements'],
        onExit: ['validateUniversityCorrections'],
        onAction: 'showDocumentUpload',
        onDocumentUpload: 'autoProgressOnUniversityCorrections',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['universityCorrectionsUploaded'],
        auditEvents: ['university.corrections_requested']
      },

      documents: {
        required: ['university_corrections'],
        optional: [],
        autoGenerate: [],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: true,
        allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
        maxSize: 15,
        downloadable: true
      },

      validation: {
        onEntry: ['university_correction_list_available'],
        onExit: ['all_university_corrections_uploaded'],
        requiredFields: ['university_requirements'],
        businessRules: ['university_deadline'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "University requires additional documents"
    },

    // ===== PROGRAM_CHANGE_SUGGESTED =====
    program_change_suggested: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin after he submit the application to university and university response that we this student with application not eligible or other resonee that admin mention to enter this program so they sugest a deefrents ones and they have to chose one or reject',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner',
        partnerCanUpdate: true,
        partnerTransitions: ['program_change_accepted', 'program_change_rejected'],
        systemCanUpdate: false,
        systemTransitions: []
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
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
            statusCard: 'Waiting for partner program change decision',
            primaryMessage: 'University suggested program change - awaiting partner decision',
            secondaryMessage: 'University cannot approve current program but suggested alternatives',
            dashboardTitle: 'Program Change Suggested',
            dashboardSubtitle: 'Partner Decision Required',
            listViewStatus: 'Program Change Pending',
            heroCardTitle: 'Program Change Suggested',
            heroCardSubtitle: 'University Alternative Offered',
            heroCardDescription: 'University suggests different program',
            timelineTitle: 'Program Change Suggested',
            timelineDescription: 'University suggested alternative program',
            actionButtonText: undefined,
            successMessage: 'Program change suggestion processed',
            errorMessage: 'Failed to process program change',
            infoMessage: 'Partner needs to decide on university suggestion',
            emptyStateTitle: 'Awaiting Decision',
            emptyStateDescription: 'Partner will decide on program change',
            loadingMessage: 'Waiting for partner decision...',
            nextStepsTitle: 'Waiting For',
            nextSteps: ['Partner to review alternatives', 'Partner to make decision', 'Process decision outcome'],
            estimatedTime: '5-10 days',
            urgencyText: 'Partner decision required'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '🔄',
            urgencyLevel: 'medium',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'University suggested program change - your decision required',
            primaryMessage: 'University cannot approve current program but offers alternatives',
            secondaryMessage: 'Please review the suggested program options and decide',
            dashboardTitle: 'Program Change Suggested',
            dashboardSubtitle: 'Your Decision Required',
            listViewStatus: 'Decision Required',
            heroCardTitle: 'Program Change Option',
            heroCardSubtitle: 'University Offers Alternative',
            heroCardDescription: 'University suggests different program',
            timelineTitle: 'Program Alternative Offered',
            timelineDescription: 'University suggested alternative program',
            actionButtonText: 'Review & Decide',
            actionButtonSecondary: 'View Alternatives',
            successMessage: 'Decision recorded successfully',
            errorMessage: 'Failed to record decision',
            warningMessage: 'Please review all options carefully',
            infoMessage: 'University cannot approve your current program choice',
            emptyStateTitle: 'Decision Required',
            emptyStateDescription: 'Review university suggestions and decide',
            loadingMessage: 'Loading program options...',
            nextStepsTitle: 'Your Decision',
            nextSteps: ['Review suggested programs', 'Consider pros and cons', 'Accept or reject suggestion'],
            estimatedTime: 'Please decide soon',
            urgencyText: 'Decision required'
          },
          styling: {
            statusColor: 'yellow',
            statusIcon: '🔄',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [],
        partner: [{
          id: 'decide_program_change',
          label: 'Accept/Reject Program Change',
          type: 'primary',
          icon: 'GitBranch',
          behavior: 'showModal',
          target: 'ProgramChangeModal',
          requiresConfirmation: true,
          confirmationMessage: 'This decision will affect your entire application. Are you sure?'
        }]
      },

      behavior: {
        onEntry: ['expandTimelineSection', 'highlightProgramOptions'],
        onExit: ['processProgramDecision'],
        onAction: 'showProgramChangeModal',
        modalToShow: 'ProgramChangeModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['programChangeDecision'],
        auditEvents: ['university.program_change_suggested']
      },

      documents: {
        required: [],
        optional: ['program_comparison', 'university_alternatives'],
        autoGenerate: ['program_options_summary'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['program_alternatives_available'],
        onExit: ['program_decision_made'],
        requiredFields: ['program_options', 'decision_reason'],
        businessRules: ['decision_deadline'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "University suggests different program - partner decision required"
    },

    // ===== PROGRAM_CHANGE_ACCEPTED =====
    program_change_accepted: {
      authority: {
        setBy: 'Partner',
        setTrigger: 'Partner after he reinvce the program change request sugest and he talk with the student and he ok with a suggest',
        adminCanUpdate: true,
        adminTransitions: ['sent_to_university'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin',
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
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      display: {
        admin: {
          allText: {
            statusCard: 'Program change accepted - resubmit to university',
            primaryMessage: 'Partner accepted program change - prepare new submission',
            secondaryMessage: 'Create new application for the accepted program',
            dashboardTitle: 'Program Change Accepted',
            dashboardSubtitle: 'Prepare Resubmission',
            listViewStatus: 'Program Change Accepted',
            heroCardTitle: 'Program Change Accepted',
            heroCardSubtitle: 'Prepare New Application',
            heroCardDescription: 'Partner accepted university program change suggestion',
            timelineTitle: 'Program Change Accepted',
            timelineDescription: 'Partner accepted alternative program',
            actionButtonText: 'Prepare New Application',
            actionButtonSecondary: 'Update Program Details',
            successMessage: 'Program change processed successfully',
            errorMessage: 'Failed to process program change',
            infoMessage: 'New application will be prepared for suggested program',
            emptyStateTitle: 'Preparing Application',
            emptyStateDescription: 'Prepare application for new program',
            loadingMessage: 'Preparing new application...',
            nextStepsTitle: 'Prepare Resubmission',
            nextSteps: ['Update application with new program', 'Review requirements for new program', 'Resubmit to university'],
            estimatedTime: '2-3 business days',
            urgencyText: 'Prepare resubmission'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 3,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'Program change accepted - application being updated',
            primaryMessage: 'You accepted the program change - application being updated',
            secondaryMessage: 'Your application is being prepared for the new program',
            dashboardTitle: 'Program Change Accepted',
            dashboardSubtitle: 'Application Updating',
            listViewStatus: 'Program Change Accepted',
            heroCardTitle: 'Program Change Accepted',
            heroCardSubtitle: 'Application Being Updated',
            heroCardDescription: 'Your application is being updated for new program',
            timelineTitle: 'Decision Recorded',
            timelineDescription: 'You accepted the program change',
            actionButtonText: undefined,
            successMessage: 'Program change accepted successfully',
            errorMessage: 'Unable to update program change status',
            infoMessage: 'Your application will be resubmitted with new program',
            emptyStateTitle: 'Processing Change',
            emptyStateDescription: 'Application being updated for new program',
            loadingMessage: 'Processing program change...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Application updated for new program', 'Resubmitted to university', 'University reviews new application'],
            estimatedTime: '2-3 business days',
            urgencyText: 'Good choice!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 3,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [{
          id: 'prepare_new_application',
          label: 'Prepare New Application',
          type: 'primary',
          icon: 'FileText',
          behavior: 'showModal',
          target: 'ProgramUpdateModal',
          requiresConfirmation: false
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandTimelineSection', 'initiateProgramChange'],
        onExit: ['finalizeNewProgram'],
        onAction: 'showProgramUpdateModal',
        modalToShow: 'ProgramUpdateModal',
        redirectAfterAction: false,
        autoProgressTo: 'sent_to_university',
        waitingForActor: 'Admin',
        notificationTriggers: ['programChangeProcessed'],
        auditEvents: ['university.program_change_accepted']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: ['updated_application_package'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
      },

      validation: {
        onEntry: ['program_decision_confirmed'],
        onExit: ['new_program_application_ready'],
        requiredFields: ['new_program_details'],
        businessRules: ['program_eligibility_check'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Partner accepted program change - preparing new application"
    },

    // ===== PROGRAM_CHANGE_REJECTED =====
    program_change_rejected: {
      authority: {
        setBy: 'Partner',
        setTrigger: 'Partner after he reinvce the program change request sugest and he talk with the student and he not ok with that',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner next step',
        partnerCanUpdate: true,
        partnerTransitions: ['sent_to_university', 'rejected_university'],
        systemCanUpdate: false,
        systemTransitions: []
      },

      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
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
            statusCard: 'Program change rejected - waiting for partner decision',
            primaryMessage: 'Partner rejected program change - awaiting next step',
            secondaryMessage: 'Partner chose to continue with original program or terminate',
            dashboardTitle: 'Program Change Rejected',
            dashboardSubtitle: 'Awaiting Next Step',
            listViewStatus: 'Change Rejected',
            heroCardTitle: 'Program Change Rejected',
            heroCardSubtitle: 'Partner Decision Required',
            heroCardDescription: 'Partner rejected program change - continue or terminate',
            timelineTitle: 'Program Change Rejected',
            timelineDescription: 'Partner rejected university program suggestion',
            actionButtonText: undefined,
            successMessage: 'Program rejection processed',
            errorMessage: 'Failed to process program rejection',
            infoMessage: 'Partner must decide: continue original or terminate',
            emptyStateTitle: 'Awaiting Decision',
            emptyStateDescription: 'Partner will choose next course of action',
            loadingMessage: 'Waiting for partner decision...',
            nextStepsTitle: 'Waiting For',
            nextSteps: ['Partner to decide final course', 'Continue with original program or terminate', 'Process final decision'],
            estimatedTime: '3-5 days',
            urgencyText: 'Partner decision needed'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'medium',
            badgeVariant: 'error',
            progressStep: 2,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'Program change rejected - choose your next step',
            primaryMessage: 'You rejected the program change - what would you like to do?',
            secondaryMessage: 'Continue with original program or end application',
            dashboardTitle: 'Program Change Rejected',
            dashboardSubtitle: 'Choose Next Step',
            listViewStatus: 'Decision Required',
            heroCardTitle: 'Program Change Rejected',
            heroCardSubtitle: 'Choose Your Next Step',
            heroCardDescription: 'Choose: continue with original program or end application',
            timelineTitle: 'Program Change Rejected',
            timelineDescription: 'You rejected the program change',
            actionButtonText: 'Choose Next Step',
            actionButtonSecondary: 'Review Options',
            successMessage: 'Decision recorded successfully',
            errorMessage: 'Failed to record decision',
            warningMessage: 'Consider all options before deciding',
            infoMessage: 'You can continue with original program or end application',
            emptyStateTitle: 'Decision Required',
            emptyStateDescription: 'Choose your next course of action',
            loadingMessage: 'Loading decision options...',
            nextStepsTitle: 'Your Options',
            nextSteps: ['Continue with original program (university may still reject)', 'Terminate application', 'Make final decision'],
            estimatedTime: 'Please decide soon',
            urgencyText: 'Important decision'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'high',
            badgeVariant: 'error',
            progressStep: 2,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [],
        partner: [{
          id: 'choose_next_step',
          label: 'Continue Original / End Application',
          type: 'primary',
          icon: 'GitBranch',
          behavior: 'showModal',
          target: 'FinalDecisionModal',
          requiresConfirmation: true,
          confirmationMessage: 'This is your final decision. Are you sure?'
        }]
      },

      behavior: {
        onEntry: ['expandTimelineSection', 'highlightFinalOptions'],
        onExit: ['processFinalDecision'],
        onAction: 'showFinalDecisionModal',
        modalToShow: 'FinalDecisionModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['finalDecisionMade'],
        auditEvents: ['university.program_change_rejected']
      },

      documents: {
        required: [],
        optional: ['rejection_reasoning'],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: false
      },

      validation: {
        onEntry: ['rejection_reason_recorded'],
        onExit: ['final_decision_made'],
        requiredFields: ['final_decision'],
        businessRules: ['decision_authority'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Partner rejected program change - final decision required"
    },

    // ===== UNIVERSITY_APPROVED =====
    university_approved: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin after he get the offer letter and he uploaded it so the partner can view in it and confirm it, and he can view the offer letter and find it in documents section',
        adminCanUpdate: true,
        adminTransitions: ['offer_letter_issued'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin',
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
            statusCard: 'University approved - upload offer letter',
            primaryMessage: 'University approved application - upload offer letter',
            secondaryMessage: 'Great news! University approved the application',
            dashboardTitle: 'University Approved',
            dashboardSubtitle: 'Upload Offer Letter',
            listViewStatus: 'University Approved',
            heroCardTitle: 'University Approved! 🎉',
            heroCardSubtitle: 'Upload Offer Letter',
            heroCardDescription: 'University has approved the application',
            timelineTitle: 'University Approved',
            timelineDescription: 'University approved the application',
            actionButtonText: 'Upload Offer Letter',
            actionButtonSecondary: 'Process Approval',
            successMessage: 'Offer letter uploaded successfully',
            errorMessage: 'Failed to upload offer letter',
            infoMessage: 'Upload the offer letter for partner review',
            emptyStateTitle: 'Ready to Upload',
            emptyStateDescription: 'Upload the university offer letter',
            loadingMessage: 'Processing university approval...',
            nextStepsTitle: 'Upload Offer Letter',
            nextSteps: ['Upload official offer letter', 'Notify partner', 'Begin visa processing preparation'],
            estimatedTime: '1 business day',
            urgencyText: 'Upload offer letter'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎓',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'University approved your application!',
            primaryMessage: 'Congratulations! University approved your application',
            secondaryMessage: 'Your offer letter is being prepared',
            dashboardTitle: 'University Approved',
            dashboardSubtitle: 'Congratulations!',
            listViewStatus: 'University Approved',
            heroCardTitle: 'Congratulations! 🎉',
            heroCardSubtitle: 'University Approved Your Application',
            heroCardDescription: 'The university has approved your application',
            timelineTitle: 'University Approval',
            timelineDescription: 'University approved your application',
            actionButtonText: undefined,
            successMessage: 'Congratulations on your university approval!',
            errorMessage: 'Unable to check approval status',
            infoMessage: 'Your offer letter will be available soon',
            emptyStateTitle: 'Approved!',
            emptyStateDescription: 'Your offer letter is being prepared',
            loadingMessage: 'Processing your approval...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Offer letter will be issued', 'Program fee payment will be required', 'Visa processing will begin'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Congratulations!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎓',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [{
          id: 'upload_offer_letter',
          label: 'Upload Offer Letter',
          type: 'success',
          icon: 'Upload',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandDocumentSection', 'celebrateApproval'],
        onExit: ['finalizeOfferLetter'],
        onAction: 'showOfferLetterUpload',
        onDocumentUpload: 'processOfferLetter',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        autoProgressTo: 'offer_letter_issued',
        waitingForActor: 'Admin',
        notificationTriggers: ['universityApproved', 'offerLetterReady'],
        auditEvents: ['university.approved']
      },

      documents: {
        required: ['offer_letter'],
        optional: ['university_conditions'],
        autoGenerate: [],
        hideUpload: false,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      validation: {
        onEntry: ['university_approval_confirmed'],
        onExit: ['offer_letter_uploaded'],
        requiredFields: ['offer_letter_document'],
        businessRules: ['offer_letter_validity'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "University approved - offer letter ready to upload"
    },

    // ===== REJECTED_UNIVERSITY =====
    rejected_university: {
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin after he submit the application to university and university response that we this student with application not eligible or other resonee to not accept this application',
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
            statusCard: 'University rejected application',
            primaryMessage: 'University rejected the application',
            secondaryMessage: 'University determined student not eligible',
            dashboardTitle: 'University Rejected',
            dashboardSubtitle: 'Application Ended',
            listViewStatus: 'University Rejected',
            heroCardTitle: 'University Rejection',
            heroCardSubtitle: 'Application Not Approved',
            heroCardDescription: 'University rejected application',
            timelineTitle: 'University Rejection',
            timelineDescription: 'University rejected the application',
            actionButtonText: undefined,
            successMessage: 'Rejection processed',
            errorMessage: 'Unable to process rejection',
            infoMessage: 'Application process has ended',
            emptyStateTitle: 'Process Complete',
            emptyStateDescription: 'University rejected application',
            loadingMessage: 'Processing rejection...',
            nextStepsTitle: 'Process Complete',
            nextSteps: ['Application terminated by university', 'Partner notified'],
            estimatedTime: 'Complete',
            urgencyText: 'Process ended'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '🚫',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 0,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'University rejected your application',
            primaryMessage: 'Unfortunately, the university rejected your application',
            secondaryMessage: 'The university determined you are not eligible for this program',
            dashboardTitle: 'University Rejected',
            dashboardSubtitle: 'Application Not Approved',
            listViewStatus: 'University Rejected',
            heroCardTitle: 'Application Not Approved',
            heroCardSubtitle: 'University Decision',
            heroCardDescription: 'Unfortunately, the university rejected your application',
            timelineTitle: 'University Rejection',
            timelineDescription: 'University rejected your application',
            actionButtonText: undefined,
            successMessage: 'Status updated',
            errorMessage: 'Unable to check status',
            infoMessage: 'You may apply to other universities or programs',
            emptyStateTitle: 'Application Ended',
            emptyStateDescription: 'This application cannot proceed further',
            loadingMessage: 'Loading information...',
            nextStepsTitle: 'Options',
            nextSteps: ['Review rejection reasons', 'Consider other universities', 'Explore alternative programs'],
            estimatedTime: 'Process complete',
            urgencyText: 'Application ended'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '🚫',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 0,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [],
        partner: []
      },

      behavior: {
        onEntry: ['finalizeUniversityRejection', 'notifyAllParties'],
        onExit: [],
        onAction: 'none',
        modalToShow: 'none',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['universityRejected'],
        auditEvents: ['university.rejected']
      },

      documents: {
        required: [],
        optional: ['rejection_letter'],
        autoGenerate: [],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: [],
        maxSize: 0,
        downloadable: true
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
      description: "University rejected application - terminal status"
    },

    // ===== OFFER_LETTER_ISSUED =====
    offer_letter_issued: {
      authority: {
        setBy: 'System',
        setTrigger: 'System after this university_approved and parnter confirm that he reicved the student offer letter and evertyhing is ok',
        adminCanUpdate: true,
        adminTransitions: ['waiting_visa_payment'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for Admin',
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
            statusCard: 'Offer letter issued - begin visa process',
            primaryMessage: 'Offer letter issued - ready to begin visa processing',
            secondaryMessage: 'Stage 2 complete - transitioning to Stage 3',
            dashboardTitle: 'Offer Letter Issued',
            dashboardSubtitle: 'Begin Visa Process',
            listViewStatus: 'Offer Letter Issued',
            heroCardTitle: 'Stage 2 Complete!',
            heroCardSubtitle: 'Begin Visa Processing',
            heroCardDescription: 'Offer letter has been issued to student',
            timelineTitle: 'Offer Letter Issued',
            timelineDescription: 'Offer letter issued - ready for visa processing',
            actionButtonText: 'Begin Visa Process',
            actionButtonSecondary: 'Set Visa Fees',
            successMessage: 'Visa process initiated successfully',
            errorMessage: 'Failed to initiate visa process',
            infoMessage: 'Ready to begin Stage 3 - Visa Processing',
            emptyStateTitle: 'Ready for Stage 3',
            emptyStateDescription: 'Begin visa processing workflow',
            loadingMessage: 'Preparing visa process...',
            nextStepsTitle: 'Begin Stage 3',
            nextSteps: ['Set visa processing fees', 'Begin visa application', 'Coordinate with immigration'],
            estimatedTime: '1 business day',
            urgencyText: 'Ready for visa process'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✈️',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 4
          }
        },
        partner: {
          allText: {
            statusCard: 'Offer letter ready - prepare for visa application',
            primaryMessage: 'Your offer letter has been issued',
            secondaryMessage: 'Visa application process will begin soon',
            dashboardTitle: 'Offer Letter Ready',
            dashboardSubtitle: 'Prepare for Visa',
            listViewStatus: 'Offer Letter Ready',
            heroCardTitle: 'Offer Letter Issued! 🎓',
            heroCardSubtitle: 'Prepare for Visa Application',
            heroCardDescription: 'Your offer letter has been issued',
            timelineTitle: 'Offer Letter Ready',
            timelineDescription: 'Your university offer letter is ready',
            actionButtonText: undefined,
            successMessage: 'Offer letter issued successfully',
            errorMessage: 'Unable to check offer letter status',
            infoMessage: 'Visa application process will begin soon',
            emptyStateTitle: 'Offer Letter Ready',
            emptyStateDescription: 'Prepare for visa application process',
            loadingMessage: 'Processing offer letter...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Visa application will begin', 'Program fee payment will be required', 'Prepare visa documents'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Great progress!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✈️',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 4
          }
        }
      },

      actions: {
        admin: [{
          id: 'begin_visa_process',
          label: 'Begin Visa Process',
          type: 'success',
          icon: 'Plane',
          behavior: 'showModal',
          target: 'VisaProcessModal',
          requiresConfirmation: true,
          confirmationMessage: 'Ready to begin Stage 3 - Visa Processing?'
        }],
        partner: []
      },

      behavior: {
        onEntry: ['expandDocumentSection', 'prepareStage3Transition'],
        onExit: ['initializeStage3'],
        onAction: 'showVisaProcessModal',
        modalToShow: 'VisaProcessModal',
        redirectAfterAction: false,
        autoProgressTo: 'waiting_visa_payment',
        waitingForActor: 'Admin',
        notificationTriggers: ['offerLetterIssued', 'readyForVisa'],
        auditEvents: ['offer_letter.issued']
      },

      documents: {
        required: [],
        optional: [],
        autoGenerate: ['visa_preparation_package'],
        hideUpload: false,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      validation: {
        onEntry: ['offer_letter_confirmed'],
        onExit: ['ready_for_stage3'],
        requiredFields: [],
        businessRules: ['visa_process_ready'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-26",
      description: "Offer letter issued - ready for visa processing (Stage 3)"
    }
  },

  defaultTransitions: ['waiting_visa_payment'],
  stageCompletionStatus: 'offer_letter_issued',
  nextStage: 3,
  
  version: "1.0.0",
  lastUpdated: "2025-08-26"
};

// Export default for easy importing
export default STAGE_2_CONFIG;
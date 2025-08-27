import { MainFlowStatus } from '@/types/canonical-workflow';

export interface EnhancedStatus {
  displayName: string;
  userFriendlyText: string;
  explanation: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  nextSteps: string[];
}

export interface StageInfo {
  name: string;
  description: string;
  emoji: string;
  estimatedDuration: string;
}

const ENHANCED_STATUS_MAP: Record<string, EnhancedStatus> = {
  new_application: {
    displayName: 'New Application',
    userFriendlyText: 'Application submitted - awaiting review',
    explanation: 'Your application has been received and is waiting for initial review by our team.',
    urgencyLevel: 'medium',
    estimatedDuration: '1-2 business days',
    nextSteps: ['Admin will review your application', 'You will be notified of any required corrections']
  },
  submitted: {
    displayName: 'Application Submitted',
    userFriendlyText: 'Application being reviewed',
    explanation: 'Your application is currently under review by our admissions team.',
    urgencyLevel: 'medium',
    estimatedDuration: '3-5 business days',
    nextSteps: ['Wait for review completion', 'Prepare for potential document requests']
  },
  under_review_admin: {
    displayName: 'Under Review',
    userFriendlyText: 'Application being reviewed by admin',
    explanation: 'Our team is carefully reviewing your application documents and details.',
    urgencyLevel: 'low',
    estimatedDuration: '2-4 business days',
    nextSteps: ['Review is in progress', 'Decision will be communicated soon']
  },
  stage1_approved: {
    displayName: 'Stage 1 Approved',
    userFriendlyText: 'Application approved - proceeding to university',
    explanation: 'Great news! Your application has been approved and is being sent to the university.',
    urgencyLevel: 'low',
    estimatedDuration: '1-2 business days',
    nextSteps: ['Application will be submitted to university', 'University review will begin']
  },
  sent_to_university: {
    displayName: 'Sent to University',
    userFriendlyText: 'University reviewing your application',
    explanation: 'Your application has been submitted to the university and is under their review.',
    urgencyLevel: 'low',
    estimatedDuration: '2-4 weeks',
    nextSteps: ['University will review your application', 'Await decision from university']
  },
  university_review: {
    displayName: 'University Review',
    userFriendlyText: 'University processing application',
    explanation: 'The university is currently processing and reviewing your application.',
    urgencyLevel: 'low',
    estimatedDuration: '2-4 weeks',
    nextSteps: ['University review in progress', 'Decision pending']
  },
  university_approved: {
    displayName: 'University Approved',
    userFriendlyText: 'University approved! Preparing offer letter',
    explanation: 'Excellent! The university has approved your application. Your offer letter is being prepared.',
    urgencyLevel: 'medium',
    estimatedDuration: '3-5 business days',
    nextSteps: ['Offer letter will be issued', 'Program fee payment will be required']
  },
  offer_letter_issued: {
    displayName: 'Offer Letter Issued',
    userFriendlyText: 'Offer letter ready - confirm acceptance',
    explanation: 'Your offer letter has been issued. Please review and confirm your acceptance.',
    urgencyLevel: 'high',
    estimatedDuration: '1-2 weeks for response',
    nextSteps: ['Review offer letter details', 'Confirm acceptance', 'Prepare for program fee payment']
  },
  visa_processing: {
    displayName: 'Visa Processing',
    userFriendlyText: 'Processing visa application',
    explanation: 'Your visa application is being processed by the immigration authorities.',
    urgencyLevel: 'medium',
    estimatedDuration: '4-8 weeks',
    nextSteps: ['Visa processing in progress', 'Prepare for potential document requests']
  },
  visa_approved: {
    displayName: 'Visa Approved',
    userFriendlyText: 'Visa approved! Plan your arrival',
    explanation: 'Great news! Your visa has been approved. You can now plan your arrival and enrollment.',
    urgencyLevel: 'high',
    estimatedDuration: 'As per your travel plans',
    nextSteps: ['Book travel arrangements', 'Confirm arrival date', 'Prepare for enrollment']
  },
  arrival_and_enrollment: {
    displayName: 'Arrival & Enrollment',
    userFriendlyText: 'Complete enrollment process',
    explanation: 'Time to complete your enrollment at the university. Follow the enrollment procedures.',
    urgencyLevel: 'high',
    estimatedDuration: '1-2 weeks',
    nextSteps: ['Complete university enrollment', 'Submit enrollment confirmation']
  },
  enrollment_verified: {
    displayName: 'Enrollment Verified',
    userFriendlyText: 'Successfully enrolled!',
    explanation: 'Congratulations! You have successfully enrolled at the university.',
    urgencyLevel: 'low',
    estimatedDuration: 'Complete',
    nextSteps: ['Begin your studies', 'Partner commission will be processed']
  },
  commission_eligible: {
    displayName: 'Commission Processing',
    userFriendlyText: 'Processing commission payment',
    explanation: 'Student successfully enrolled. Commission payment is being processed.',
    urgencyLevel: 'low',
    estimatedDuration: '5-10 business days',
    nextSteps: ['Commission calculation', 'Payment processing']
  },
  success: {
    displayName: 'Completed',
    userFriendlyText: 'Application journey completed successfully!',
    explanation: 'Congratulations! The entire application process has been completed successfully.',
    urgencyLevel: 'low',
    estimatedDuration: 'Complete',
    nextSteps: ['Journey completed successfully']
  }
};

const STAGE_INFO_MAP: Record<number, StageInfo> = {
  1: {
    name: 'Application Review',
    description: 'Initial application submission and admin review',
    emoji: '📋',
    estimatedDuration: '1-2 weeks'
  },
  2: {
    name: 'University Review',
    description: 'University evaluation and offer letter process',
    emoji: '🎓',
    estimatedDuration: '2-6 weeks'
  },
  3: {
    name: 'Visa Processing',
    description: 'Visa application and immigration approval',
    emoji: '✈️',
    estimatedDuration: '4-12 weeks'
  },
  4: {
    name: 'Arrival & Enrollment',
    description: 'Student arrival and university enrollment',
    emoji: '🏫',
    estimatedDuration: '2-4 weeks'
  },
  5: {
    name: 'Commission',
    description: 'Partner commission processing',
    emoji: '💰',
    estimatedDuration: '1-2 weeks'
  }
};

export function getEnhancedStatusCopy(status: MainFlowStatus | string): EnhancedStatus {
  return ENHANCED_STATUS_MAP[status] || {
    displayName: status,
    userFriendlyText: 'Processing...',
    explanation: 'Your application is being processed.',
    urgencyLevel: 'medium',
    estimatedDuration: 'Unknown',
    nextSteps: ['Please wait for updates']
  };
}

export function getEnhancedStageInfo(stage: number): StageInfo {
  return STAGE_INFO_MAP[stage] || {
    name: `Stage ${stage}`,
    description: 'Processing stage',
    emoji: '📋',
    estimatedDuration: 'Unknown'
  };
}

export function getTimeEstimate(status: MainFlowStatus | string): string {
  const statusInfo = getEnhancedStatusCopy(status);
  return statusInfo.estimatedDuration;
}

export function getUrgencyLevel(status: MainFlowStatus | string): 'low' | 'medium' | 'high' | 'critical' {
  const statusInfo = getEnhancedStatusCopy(status);
  return statusInfo.urgencyLevel;
}

export function getNextSteps(status: MainFlowStatus | string): string[] {
  const statusInfo = getEnhancedStatusCopy(status);
  return statusInfo.nextSteps;
}
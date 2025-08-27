export interface StatusDisplay {
  short: string;
  long?: string;
  description: string;
  action?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  color: 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'purple' | 'gray';
}

const STATUS_DISPLAY_MAP: Record<string, { admin: StatusDisplay; partner: StatusDisplay }> = {
  new_application: {
    admin: {
      short: 'New Application',
      description: 'Application submitted and awaiting review',
      action: 'Begin review process',
      urgency: 'medium',
      color: 'blue'
    },
    partner: {
      short: 'Application Submitted',
      description: 'Your application has been submitted successfully',
      action: 'Wait for admin review',
      urgency: 'low',
      color: 'blue'
    }
  },
  under_review_admin: {
    admin: {
      short: 'Under Review',
      description: 'Application is being reviewed by admin',
      action: 'Complete review and make decision',
      urgency: 'medium',
      color: 'yellow'
    },
    partner: {
      short: 'Under Review',
      description: 'Admin is reviewing your application',
      urgency: 'low',
      color: 'yellow'
    }
  },
  correction_requested_admin: {
    admin: {
      short: 'Corrections Requested',
      description: 'Additional documents/corrections requested from partner',
      action: 'Wait for partner response',
      urgency: 'low',
      color: 'orange'
    },
    partner: {
      short: 'Action Required',
      description: 'Admin has requested additional documents or corrections',
      action: 'Upload requested documents',
      urgency: 'high',
      color: 'orange'
    }
  },
  documents_submitted: {
    admin: {
      short: 'Documents Submitted',
      description: 'Partner has submitted requested documents',
      action: 'Review submitted documents',
      urgency: 'medium',
      color: 'blue'
    },
    partner: {
      short: 'Documents Submitted',
      description: 'All requested documents have been submitted',
      action: 'Wait for admin review',
      urgency: 'low',
      color: 'blue'
    }
  },
  documents_under_review: {
    admin: {
      short: 'Documents Under Review',
      description: 'Submitted documents are being reviewed',
      action: 'Complete document review',
      urgency: 'medium',
      color: 'yellow'
    },
    partner: {
      short: 'Documents Under Review',
      description: 'Admin is reviewing your submitted documents',
      urgency: 'low',
      color: 'yellow'
    }
  },
  documents_approved: {
    admin: {
      short: 'Documents Approved',
      description: 'All submitted documents have been approved',
      action: 'Proceed with application processing',
      urgency: 'low',
      color: 'green'
    },
    partner: {
      short: 'Documents Approved',
      description: 'All your documents have been approved',
      urgency: 'low',
      color: 'green'
    }
  },
  documents_resubmission_required: {
    admin: {
      short: 'Awaiting Resubmission',
      description: 'Partner needs to resubmit corrected documents',
      action: 'Wait for partner to upload corrections',
      urgency: 'low',
      color: 'orange'
    },
    partner: {
      short: 'Action Required',
      description: 'Admin requested document corrections - please resubmit',
      action: 'Upload corrected documents',
      urgency: 'high',
      color: 'orange'
    }
  },
  approved_stage1: {
    admin: {
      short: 'Stage 1 Approved',
      description: 'Application approved for university submission',
      action: 'Submit to university',
      urgency: 'medium',
      color: 'green'
    },
    partner: {
      short: 'Application Approved',
      description: 'Your application has been approved and will be sent to university',
      urgency: 'low',
      color: 'green'
    }
  },
  rejected_stage1: {
    admin: {
      short: 'Application Rejected',
      description: 'Application has been rejected at Stage 1',
      urgency: 'low',
      color: 'red'
    },
    partner: {
      short: 'Application Rejected',
      description: 'Unfortunately, your application has been rejected',
      urgency: 'low',
      color: 'red'
    }
  },
  sent_to_university: {
    admin: {
      short: 'Sent to University',
      description: 'Application has been submitted to university',
      action: 'Monitor university response',
      urgency: 'low',
      color: 'purple'
    },
    partner: {
      short: 'University Review',
      description: 'Your application is being reviewed by the university',
      urgency: 'low',
      color: 'purple'
    }
  },
  university_approved: {
    admin: {
      short: 'University Approved',
      description: 'University has approved the application',
      action: 'Begin visa processing',
      urgency: 'medium',
      color: 'green'
    },
    partner: {
      short: 'University Approved',
      description: 'Congratulations! The university has approved your application',
      urgency: 'low',
      color: 'green'
    }
  },
  offer_letter_issued: {
    admin: {
      short: 'Offer Letter Issued',
      description: 'Offer letter has been issued to student',
      action: 'Prepare for visa application',
      urgency: 'low',
      color: 'green'
    },
    partner: {
      short: 'Offer Letter Ready',
      description: 'Your offer letter has been issued',
      action: 'Prepare for visa application',
      urgency: 'medium',
      color: 'green'
    }
  },
  visa_processing: {
    admin: {
      short: 'Visa Processing',
      description: 'Visa application is being processed',
      action: 'Monitor visa status',
      urgency: 'low',
      color: 'orange'
    },
    partner: {
      short: 'Visa Processing',
      description: 'Your visa application is being processed',
      urgency: 'low',
      color: 'orange'
    }
  },
  visa_approved: {
    admin: {
      short: 'Visa Approved',
      description: 'Student visa has been approved',
      action: 'Coordinate arrival planning',
      urgency: 'medium',
      color: 'green'
    },
    partner: {
      short: 'Visa Approved',
      description: 'Congratulations! Your visa has been approved',
      action: 'Plan your arrival',
      urgency: 'high',
      color: 'green'
    }
  },
  enrollment_completed: {
    admin: {
      short: 'Enrollment Completed',
      description: 'Student has successfully enrolled',
      action: 'Process commission payment',
      urgency: 'low',
      color: 'green'
    },
    partner: {
      short: 'Successfully Enrolled',
      description: 'You have successfully enrolled at the university',
      urgency: 'low',
      color: 'green'
    }
  },
  commission_paid: {
    admin: {
      short: 'Commission Paid',
      description: 'Partner commission has been processed and paid',
      urgency: 'low',
      color: 'green'
    },
    partner: {
      short: 'Commission Received',
      description: 'Your commission has been processed and paid',
      urgency: 'low',
      color: 'green'
    }
  },
  success: {
    admin: {
      short: 'Completed Successfully',
      description: 'Application process completed successfully',
      urgency: 'low',
      color: 'green'
    },
    partner: {
      short: 'Journey Complete',
      description: 'Your application journey has been completed successfully',
      urgency: 'low',
      color: 'green'
    }
  },
  application_cancelled: {
    admin: {
      short: 'Application Cancelled',
      description: 'Application has been permanently cancelled',
      urgency: 'low',
      color: 'red'
    },
    partner: {
      short: 'Application Cancelled',
      description: 'Your application has been cancelled. Please create a new application to restart.',
      urgency: 'low',
      color: 'red'
    }
  },
  application_on_hold: {
    admin: {
      short: 'On Hold',
      description: 'Application is temporarily on hold',
      action: 'Resume or cancel application',
      urgency: 'medium',
      color: 'yellow'
    },
    partner: {
      short: 'Application On Hold',
      description: 'Your application is temporarily on hold. We will notify you when it resumes.',
      urgency: 'medium',
      color: 'yellow'
    }
  }
};

export function getStatusDisplayForRole(status: string, role: 'admin' | 'partner'): StatusDisplay {
  const statusConfig = STATUS_DISPLAY_MAP[status];
  
  if (statusConfig) {
    return statusConfig[role];
  }
  
  // Fallback for unknown statuses
  const fallbackStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    short: fallbackStatus,
    description: `Application is in ${fallbackStatus.toLowerCase()} status`,
    urgency: 'medium',
    color: 'gray'
  };
}

export function getStatusDisplayName(status: string, role: 'admin' | 'partner' = 'admin'): string {
  return getStatusDisplayForRole(status, role).short;
}

export function getStatusDescription(status: string, role: 'admin' | 'partner' = 'admin'): string {
  return getStatusDisplayForRole(status, role).description;
}

export function getStatusAction(status: string, role: 'admin' | 'partner' = 'admin'): string | undefined {
  return getStatusDisplayForRole(status, role).action;
}

export function getStatusUrgency(status: string, role: 'admin' | 'partner' = 'admin'): 'low' | 'medium' | 'high' | 'critical' {
  return getStatusDisplayForRole(status, role).urgency;
}

export function getStatusColor(status: string, role: 'admin' | 'partner' = 'admin'): string {
  const color = getStatusDisplayForRole(status, role).color;
  
  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return colorMap[color];
}
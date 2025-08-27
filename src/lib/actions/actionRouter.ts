import { Application } from '@/types';

export interface ActionButton {
  text: string;
  action: string;
  type?: 'primary' | 'secondary' | 'success' | 'danger';
  targetStatus?: string;
  paymentType?: 'visa' | 'program';
}

export class ActionRouter {
  static handleAction(actionButton: ActionButton, application: Application) {
    const { action, targetStatus, paymentType } = actionButton;
    
    // Determine base URL based on current user role
    const isAdmin = window.location.pathname.includes('/admin/');
    const baseUrl = isAdmin ? '/admin' : '/partner';
    
    let targetUrl = `${baseUrl}/applications/${application.id}`;

    switch (action) {
      case 'change_status':
        if (targetStatus) {
          // Navigate to status update page with target status
          targetUrl = `${baseUrl}/applications/${application.id}/status?target=${targetStatus}`;
        } else {
          targetUrl = `${baseUrl}/applications/${application.id}/status`;
        }
        break;

      case 'upload_documents':
      case 'upload_docs':
      case 'resubmit_docs':
        targetUrl = `${baseUrl}/applications/${application.id}/documents`;
        break;

      case 'review_documents':
      case 'review_docs':
      case 'approve_docs':
        targetUrl = `${baseUrl}/applications/${application.id}/review`;
        break;

      case 'pay_fee':
      case 'pay_visa':
      case 'pay_program':
        targetUrl = `${baseUrl}/applications/${application.id}/payment?type=${paymentType || 'visa'}`;
        break;

      case 'verify_payment':
      case 'verify_program_payment':
        targetUrl = `${baseUrl}/applications/${application.id}/payment/verify`;
        break;

      case 'apply_visa':
        targetUrl = `${baseUrl}/applications/${application.id}/visa`;
        break;

      case 'plan_arrival':
        targetUrl = `${baseUrl}/applications/${application.id}/arrival`;
        break;

      case 'complete_enrollment':
        targetUrl = `${baseUrl}/applications/${application.id}/enrollment`;
        break;

      case 'process_commission':
      case 'release_commission':
        targetUrl = `${baseUrl}/applications/${application.id}/commission`;
        break;

      case 'review_app':
      case 'continue_review':
        targetUrl = `${baseUrl}/applications/${application.id}/review`;
        break;

      case 'send_university':
        targetUrl = `${baseUrl}/applications/${application.id}/university`;
        break;

      case 'issue_offer':
        targetUrl = `${baseUrl}/applications/${application.id}/offer`;
        break;

      case 'decide_program':
        targetUrl = `${baseUrl}/applications/${application.id}/program-change`;
        break;

      case 'submit_corrections':
        targetUrl = `${baseUrl}/applications/${application.id}/corrections`;
        break;

      case 'fix_payment':
        targetUrl = `${baseUrl}/applications/${application.id}/payment/fix`;
        break;

      case 'confirm_arrival_date':
        targetUrl = `${baseUrl}/applications/${application.id}/arrival/confirm`;
        break;

      case 'report_student_arrival':
        targetUrl = `${baseUrl}/applications/${application.id}/arrival/report`;
        break;

      case 'submit_enrollment_confirmation':
        targetUrl = `${baseUrl}/applications/${application.id}/enrollment/confirm`;
        break;

      default:
        // Default to application details page
        targetUrl = `${baseUrl}/applications/${application.id}`;
        break;
    }

    // Navigate to the determined URL
    window.location.href = targetUrl;
  }

  static getActionIcon(action: string): string {
    const iconMap: Record<string, string> = {
      pay_fee: '💳',
      pay_visa: '💳',
      pay_program: '💳',
      upload_documents: '📎',
      upload_docs: '📎',
      resubmit_docs: '📎',
      review_documents: '👀',
      review_docs: '👀',
      approve_docs: '✅',
      verify_payment: '🔍',
      apply_visa: '✈️',
      plan_arrival: '🛬',
      complete_enrollment: '🎓',
      process_commission: '💰',
      release_commission: '💰',
      review_app: '👀',
      send_university: '🏫',
      issue_offer: '📜',
      decide_program: '🤔',
      submit_corrections: '✏️',
      fix_payment: '🔧',
      confirm_arrival_date: '📅',
      report_student_arrival: '✈️',
      submit_enrollment_confirmation: '🎓',
    };

    return iconMap[action] || '➡️';
  }

  static getActionColor(action: string): string {
    if (action.includes('pay')) return 'bg-green-600 hover:bg-green-700';
    if (action.includes('upload') || action.includes('resubmit')) return 'bg-orange-600 hover:bg-orange-700';
    if (action.includes('review') || action.includes('approve')) return 'bg-purple-600 hover:bg-purple-700';
    if (action.includes('verify')) return 'bg-blue-600 hover:bg-blue-700';
    if (action.includes('commission')) return 'bg-yellow-600 hover:bg-yellow-700';
    
    return 'bg-gray-600 hover:bg-gray-700';
  }
}
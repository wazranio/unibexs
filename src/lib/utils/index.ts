import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(prefix: string = 'ID'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Color utility functions
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'new_application': 'bg-blue-100 text-blue-800 border-blue-200',
    'under_review_admin': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approved_stage1': 'bg-green-100 text-green-800 border-green-200',
    'rejected_stage1': 'bg-red-100 text-red-800 border-red-200',
    'sent_to_university': 'bg-purple-100 text-purple-800 border-purple-200',
    'university_approved': 'bg-green-100 text-green-800 border-green-200',
    'offer_letter_issued': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'visa_processing': 'bg-orange-100 text-orange-800 border-orange-200',
    'visa_approved': 'bg-green-100 text-green-800 border-green-200',
    'enrollment_completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'commission_paid': 'bg-green-100 text-green-800 border-green-200',
    'success': 'bg-green-100 text-green-800 border-green-200',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    'high': 'bg-red-100 text-red-800 border-red-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'low': 'bg-green-100 text-green-800 border-green-200',
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getStageColor(stage: number): string {
  const colorMap: Record<number, string> = {
    1: 'bg-blue-100 text-blue-800 border-blue-200',
    2: 'bg-purple-100 text-purple-800 border-purple-200',
    3: 'bg-orange-100 text-orange-800 border-orange-200',
    4: 'bg-green-100 text-green-800 border-green-200',
    5: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return colorMap[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getStageName(stageNumber: number): string {
  const stageNames = {
    1: "Application Review",
    2: "Offer Letter", 
    3: "Visa Processing",
    4: "Student Arrival",
    5: "Commission Payment"
  } as const;
  
  return stageNames[stageNumber as keyof typeof stageNames] || `Stage ${stageNumber}`;
}

export function getStageDisplayName(stageNumber: number): string {
  return getStageName(stageNumber);
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  return phone;
}
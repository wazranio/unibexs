export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'partner';
  name: string;
  partnerId?: string;
  createdAt: string;
}

export interface Partner {
  id: string;
  type: 'individual' | 'business';
  name: string;
  email: string;
  phone: string;
  country: string;
  
  // Individual specific
  photo?: string; // URL
  passport?: string; // URL
  
  // Business specific
  businessName?: string;
  tradingLicense?: string; // URL
  
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  
  // Legacy fields for backward compatibility
  address?: string;
  contactPerson?: string;
  registrationNumber?: string;
  totalApplications?: number;
  successfulPlacements?: number;
  pendingCommission?: number;
  tier?: 'bronze' | 'silver' | 'gold';
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  applicationIds: string[]; // Links to all applications
  createdAt: string;
  
  // Legacy fields for backward compatibility
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  academicHistory?: Array<{
    institution: string;
    degree: string;
    startYear: number;
    endYear: number;
    gpa: number;
  }>;
  englishProficiency?: {
    testType: string;
    score: string;
    testDate: string;
  };
}

export interface Application {
  id: string;
  studentId: string;
  partnerId: string;
  currentStage: 1 | 2 | 3 | 4 | 5;
  currentStatus: string;
  nextAction?: string;
  nextActor?: 'Admin' | 'Partner' | 'University' | 'Immigration';
  trackingNumber?: string;
  stageHistory?: StageHistoryEntry[];
  rejectionReason?: string;
  documentsRequired?: string[];
  activeDocumentRequest?: string; // ID of active document request
  hasActionRequired?: boolean; // Quick flag for partner to see action needed
  programChangeId?: string; // ID of program change request
  
  // Hold/Resume functionality
  previousStatus?: string; // Status to resume to when coming off hold
  holdReason?: string; // Reason why application was put on hold
  heldBy?: string; // Admin who put the application on hold
  heldAt?: string; // Timestamp when application was put on hold
  resumeReason?: string; // Reason why application was resumed
  resumedBy?: string; // Admin who resumed the application
  resumedAt?: string; // Timestamp when application was resumed
  
  // Cancel functionality
  cancelReason?: string; // Reason why application was cancelled
  cancelledBy?: string; // Admin who cancelled the application
  cancelledAt?: string; // Timestamp when application was cancelled
  
  createdAt: string;
  updatedAt: string;
  program: string;
  university: string;
  intakeDate: string;
  tuitionFee?: number;
  currency?: string;
  priority: 'low' | 'medium' | 'high';
  
  // Additional properties used in initialize-v2.ts
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    uploadedAt: string;
    uploadedBy: string;
    filename: string;
    size: number;
    url: string;
  }>;
  timeline?: Array<{
    id: string;
    stage: number;
    status: string;
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
  }>;
  submittedAt?: string;
  metadata?: Record<string, unknown>;
  
  // Program change workflow support
  appliedProgram?: string; // Original applied program for compatibility
  appliedUniversity?: string; // Original applied university for compatibility
  studentName?: string; // Student name for compatibility
  studentEmail?: string; // Student email for compatibility
  submissionDate?: string; // Submission date for compatibility
  notes?: string; // General notes
  
  programChangeData?: {
    suggestedUniversity: string;
    suggestedProgram: string;
    originalProgram: string;
    reason: string;
    suggestedAt?: string;
    suggestedBy?: string;
    newProgramDetails?: {
      duration: string;
      fee: number;
      requirements: string[];
    };
  };
  programChangeDecision?: {
    decision: 'accepted' | 'rejected';
    decidedAt: string;
    decidedBy: string;
    reason: string;
    newProgram?: {
      university: string;
      program: string;
      details?: {
        duration: string;
        fee: number;
        requirements: string[];
      };
    };
  };
}

export interface StageHistoryEntry {
  stage: number;
  status: string;
  timestamp: string;
  actor: string;
  reason?: string;
  documents?: string[];
  notes?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  stage: number;
  type: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmission_required';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  url?: string;
  version: number; // Track document versions for resubmissions
  parentDocumentId?: string; // Link to previous version if resubmitted
  size?: number; // File size in bytes
  mimeType?: string; // MIME type of the file
}

export interface DocumentRequest {
  id: string;
  applicationId: string;
  stage: number;
  requestedBy: string; // Admin acting on behalf of University/Immigration
  requestedAt: string;
  requestSource: 'Admin' | 'University' | 'Immigration'; // Who is requesting
  documents: DocumentRequirement[];
  status: 'pending' | 'partially_submitted' | 'submitted' | 'approved' | 'rejected';
  dueDate?: string;
  notes?: string;
}

export interface DocumentRequirement {
  id: string;
  type: string;
  description: string;
  mandatory: boolean;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected' | 'resubmission_required';
  documentId?: string; // Link to uploaded document
  rejectionReason?: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  stage: number;
  type: 'visa_fee' | 'student_payment';
  amount: number;
  currency: string;
  proofDocument: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface VisaRecord {
  id: string;
  applicationId: string;
  trackingNumber: string;
  visaNumber?: string;
  issuedAt?: string;
  expiryDate?: string;
  status: 'submitted' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ArrivalRecord {
  id: string;
  applicationId: string;
  plannedArrivalDate: string;
  actualArrivalDate?: string;
  status: 'planned' | 'confirmed' | 'verified';
  verifiedBy?: string;
  verifiedAt?: string;
}


export interface Comment {
  id: string;
  applicationId: string;
  stage: number;
  author: string;
  authorRole: 'admin' | 'partner';
  content: string;
  isInternal: boolean;
  createdAt: string;
  parentId?: string; // For threaded comments/replies
}

export interface AuditLogEntry {
  id: string;
  applicationId: string;
  event: string;
  action: string;
  actor: string;
  actorRole: 'admin' | 'partner' | 'university' | 'immigration';
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  stage?: number;
  reason?: string;
  trackingNumber?: string;
  visaNumber?: string;
  documents?: string[];
  details?: Record<string, unknown>;
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  byStage: Record<number, number>;
  byStatus: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

export interface WorkflowStage {
  stage: number;
  name: string;
  description: string;
  statuses: WorkflowStatus[];
}

export interface WorkflowStatus {
  key: string;
  name: string;
  description: string;
  nextAction: string;
  nextActor: 'Admin' | 'Partner' | 'University' | 'Immigration';
  canTransitionTo: string[];
  requiresReason?: boolean;
  requiresDocuments?: string[];
  allowedVerbs?: string[];
  preconditions?: string[];
  inputs?: string[];
  validationRules?: string[];
  statusTransition?: string;
  notifications?: Array<{to: string; template: string}>;
  auditLog?: {event: string; fields?: string[]};
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface DocumentRequestData {
  documentType: string;
  reason: string;
  applicationId: string;
}

export interface FileUploadData {
  files: FileList;
  uploadType: string;
  notes: string;
  applicationId: string;
}

export interface ProgramChangeData {
  newProgram: string;
  reason: string;
  applicationId: string;
}

export interface ProgramDecisionData {
  decision: 'accept' | 'reject';
  reason: string;
  suggestedProgram?: string;
  applicationId: string;
}

// New MVP Entities

export interface University {
  id: string;
  name: string;
  type: 'university' | 'college';
  country: string;
  logo?: string;
  createdAt: string;
}

export interface College {
  id: string;
  universityId: string;
  name: string;
  createdAt: string;
}

export interface Program {
  id: string;
  universityId: string;
  collegeId?: string; // Optional college within university
  name: string;
  duration: string;
  fees: number;
  currency: string;
  intakes: string[];
  requirements?: string[];
  createdAt: string;
}

// Enhanced Program Management with Field of Study and Level Support

export interface FieldOfStudy {
  id: string;
  name: string;
  code: string; // Based on ISCED-F simplified
  keywords: string[]; // For search matching
  icon: string; // Emoji or icon identifier
  description?: string;
  subcategories?: string[]; // Related specializations
  createdAt: string;
}

export interface Level {
  id: string;
  universityId: string;
  collegeId: string;
  name: 'Bachelor' | 'Master' | 'PhD' | 'Foundation' | 'Diploma' | 'Certificate';
  displayName: string; // E.g., "Bachelor's Degree", "Master's Degree"
  
  // Default values that can be inherited by programs
  defaultDuration?: string;
  defaultCommissionRate?: number; // Percentage (0.15 = 15%)
  defaultEnglishRequirements?: EnglishRequirements;
  
  // Metadata
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnglishRequirements {
  ielts?: number;
  toefl?: number;
  pte?: number;
  duolingo?: number;
  other?: {
    testName: string;
    minScore: number | string;
  };
}

export interface EnhancedProgram extends Program {
  levelId: string;
  fieldOfStudyId: string;
  
  // Override inherited values from Level if needed
  englishRequirements?: EnglishRequirements;
  commissionRate?: number; // Override level default
  
  // Enhanced search and categorization
  searchKeywords: string[]; // Additional keywords for better search
  programCode?: string; // Internal program code
  isActive: boolean; // Enable/disable programs
  
  // Display enhancements
  shortDescription?: string;
  highlights?: string[]; // Key selling points
  programUrl?: string; // Official program URL for partners to get more information
  
  // Inheritance flags
  inheritsFromLevel: {
    duration: boolean;
    commission: boolean;
    englishRequirements: boolean;
  };
  
  updatedAt: string;
}

export interface LogisticsPartner {
  id: string;
  name: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  services: string[];
  description?: string;
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'accommodation' | 'transport' | 'insurance' | 'medical' | 'banking' | 'other';
  contactEmail: string;
  contactPhone: string;
  country: string;
  services: string[]; // Simple list of services offered
  description?: string;
  createdAt: string;
}

// Analytics interfaces for dashboard cards
export interface PartnerAnalytics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface StudentAnalytics {
  total: number;
  active: number;
  countries: number;
  programs: number;
}

export interface UniversityAnalytics {
  totalUniversities: number;
  totalColleges: number;
  totalPrograms: number;
  countries: number;
}

export interface ServiceAnalytics {
  total: number;
  byType: Record<string, number>;
}

// Commission Module Types
export type CommissionStatus = 
  | 'commission_pending'     // Awaiting admin review after enrollment verified
  | 'commission_approved'    // Admin approved, payment being processed
  | 'commission_released'    // Admin uploaded transfer document
  | 'commission_paid'        // Partner confirmed receipt (terminal status)
  | 'commission_transfer_disputed'; // Partner disputed payment

export interface Commission {
  id: string;
  applicationId: string;
  studentId: string;
  partnerId: string;
  
  // Commission Details
  tuitionFee: number;
  commissionRate: number;        // e.g., 0.15 for 15%
  commissionAmount: number;      // calculated amount
  currency: string;              // e.g., 'MYR'
  
  // Status & Dates
  status: CommissionStatus;
  enrollmentDate: Date;          // When enrollment was confirmed
  createdAt: Date;               // When commission was created (Stage 5 start)
  approvedAt?: Date;             // When admin approved
  releasedAt?: Date;             // When admin uploaded transfer document
  paidAt?: Date;                 // When partner confirmed receipt
  
  // Documents & Payment Info
  transferDocumentUrl?: string;   // Admin uploaded transfer receipt
  transferReference?: string;     // Bank transfer reference number
  paymentNotes?: string;         // Admin notes about payment
  
  // Metadata
  partnerTier: 'bronze' | 'silver' | 'gold';
  university: string;
  program: string;
  
  // Audit
  approvedBy?: string;           // Admin who approved
  releasedBy?: string;           // Admin who released payment
}

export interface CommissionCalculationConfig {
  tiers: {
    bronze: { rate: number; minimumStudents: number };
    silver: { rate: number; minimumStudents: number };
    gold: { rate: number; minimumStudents: number };
  };
  specialRates?: {
    byUniversity?: Record<string, number>;
    byProgram?: Record<string, number>;
    byCountry?: Record<string, number>;
  };
  processingFee?: number;        // Flat fee or percentage
  taxRate?: number;              // Tax percentage if applicable
}

export interface CommissionSummary {
  totalEarned: number;           // All commission_paid
  pendingReview: number;         // commission_pending
  awaitingPayment: number;       // commission_approved + commission_released  
  thisMonth: number;             // Paid this month
  totalStudents: number;         // Count of students with commissions
}

export interface CommissionPipelineStats {
  pending: {
    count: number;
    totalAmount: number;
    oldestDays: number;
  };
  approved: {
    count: number;
    totalAmount: number;
    averageDaysToApprove: number;
  };
  paid: {
    count: number;
    totalAmount: number;
    thisMonth: number;
  };
}
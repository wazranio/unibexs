import {
  Partner,
  Student,
  Application,
  Document,
  Payment,
  VisaRecord,
  ArrivalRecord,
  Commission,
  Comment,
  AuditLogEntry,
  StageHistoryEntry,
  DocumentRequest,
} from '@/types';

const STORAGE_KEYS = {
  APPLICATIONS: 'appleaction_applications',
  PARTNERS: 'appleaction_partners',
  STUDENTS: 'appleaction_students',
  DOCUMENTS: 'appleaction_documents',
  DOCUMENT_REQUESTS: 'appleaction_document_requests',
  PAYMENTS: 'appleaction_payments',
  VISA_RECORDS: 'appleaction_visa_records',
  ARRIVAL_RECORDS: 'appleaction_arrival_records',
  COMMISSIONS: 'appleaction_commissions',
  COMMENTS: 'appleaction_comments',
  AUDIT_LOG: 'appleaction_audit_log',
  APP_VERSION: 'appleaction_app_version',
} as const;

// Sample data generators
const SAMPLE_PARTNERS: Partner[] = [
  {
    id: 'YOUR-UNI',
    type: 'business',
    name: 'Your Uni',
    email: 'contact@youruni.com',
    phone: '+1-555-0100',
    country: 'Malaysia',
    businessName: 'Your Uni Education Services',
    status: 'approved',
    address: '123 University Avenue, Education City, EC 12345',
    contactPerson: 'University Representative',
    createdAt: '2023-01-15T10:00:00Z',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateStudent = (id: string): Student => {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'South Korea', 'India', 'Brazil'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const nationality = countries[Math.floor(Math.random() * countries.length)];
  
  return {
    id,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    nationality,
    passportNumber: `${nationality.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    applicationIds: [], // Will be populated when applications are created
    createdAt: new Date().toISOString(),
    // Legacy fields for backward compatibility
    dateOfBirth: new Date(1995 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    address: `${Math.floor(Math.random() * 999) + 1} Main St, ${nationality === 'USA' ? 'Any City' : 'Foreign City'}, ${nationality}`,
    emergencyContact: {
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      relationship: ['Parent', 'Sibling', 'Spouse', 'Guardian'][Math.floor(Math.random() * 4)],
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateApplication = (id: string, studentId: string, partnerId: string, index: number): Application => {
  const programs = ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'Law', 'Psychology', 'Economics', 'Mathematics', 'Physics', 'Chemistry'];
  const universities = ['Harvard University', 'MIT', 'Stanford University', 'University of Cambridge', 'Oxford University', 'Yale University', 'Princeton University', 'University of Toronto', 'University of Melbourne', 'ETH Zurich'];
  const priorities = ['low', 'medium', 'high'] as const;
  
  // Distribute applications across stages and statuses
  let currentStage: 1 | 2 | 3 | 4 | 5;
  let currentStatus: string;
  
  if (index < 12) {
    // Stage 1 - 12 applications
    currentStage = 1;
    if (index < 3) currentStatus = 'new_application';
    else if (index < 7) currentStatus = 'under_review_admin';
    else if (index < 9) currentStatus = 'correction_requested_admin';
    else if (index < 11) currentStatus = 'approved_stage1';
    else currentStatus = 'rejected_stage1';
  } else if (index < 20) {
    // Stage 2 - 8 applications
    currentStage = 2;
    if (index < 23) currentStatus = 'sent_to_university';
    else if (index < 25) currentStatus = 'university_requested_corrections';
    else if (index < 27) currentStatus = 'university_approved';
    else currentStatus = 'rejected_university';
  } else if (index < 26) {
    // Stage 3 - 6 applications
    currentStage = 3;
    if (index < 21) currentStatus = 'waiting_visa_payment';
    else if (index < 23) currentStatus = 'payment_received';
    else if (index < 25) currentStatus = 'submitted_to_immigration';
    else currentStatus = 'visa_issued';
  } else if (index < 28) {
    // Stage 4 - 2 applications
    currentStage = 4;
    if (index < 27) currentStatus = 'arrival_date_confirmed';
    else currentStatus = 'arrival_verified';
  } else {
    // Stage 5 - 2 applications
    currentStage = 5;
    if (index < 29) currentStatus = 'commission_approved';
    else currentStatus = 'commission_paid';
  }
  
  const createdAt = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString();
  const updatedAt = new Date(Date.parse(createdAt) + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
  
  const stageHistory: StageHistoryEntry[] = [
    {
      stage: 1,
      status: currentStage >= 1 ? (currentStage > 1 ? 'approved_stage1' : currentStatus) : currentStatus,
      timestamp: createdAt,
      actor: 'Partner',
      notes: 'Initial application submission',
    },
  ];
  
  if (currentStage > 1) {
    stageHistory.push({
      stage: 2,
      status: currentStage > 2 ? 'university_approved' : currentStatus,
      timestamp: new Date(Date.parse(createdAt) + 7 * 24 * 60 * 60 * 1000).toISOString(),
      actor: 'University',
      notes: 'University review completed',
    });
  }
  
  if (currentStage > 2) {
    stageHistory.push({
      stage: 3,
      status: currentStage > 3 ? 'visa_issued' : currentStatus,
      timestamp: new Date(Date.parse(createdAt) + 14 * 24 * 60 * 60 * 1000).toISOString(),
      actor: 'Immigration',
      notes: 'Visa processing completed',
    });
  }
  
  if (currentStage > 3) {
    stageHistory.push({
      stage: 4,
      status: currentStage > 4 ? 'arrival_verified' : currentStatus,
      timestamp: new Date(Date.parse(createdAt) + 21 * 24 * 60 * 60 * 1000).toISOString(),
      actor: 'Admin',
      notes: 'Student arrival confirmed',
    });
  }
  
  if (currentStage > 4) {
    stageHistory.push({
      stage: 5,
      status: currentStatus,
      timestamp: updatedAt,
      actor: 'Admin',
      notes: 'Commission processing',
    });
  }
  
  return {
    id,
    studentId,
    partnerId,
    currentStage,
    currentStatus,
    nextAction: getNextAction(currentStage, currentStatus),
    nextActor: getNextActor(currentStage, currentStatus),
    trackingNumber: currentStage >= 3 ? `TRK-${Date.now().toString().slice(-6)}-${index}` : undefined,
    stageHistory,
    rejectionReason: currentStatus.includes('rejected') ? 'Sample rejection reason for demo purposes' : undefined,
    documentsRequired: getRequiredDocuments(currentStage, currentStatus),
    createdAt,
    updatedAt,
    program: programs[Math.floor(Math.random() * programs.length)],
    university: universities[Math.floor(Math.random() * universities.length)],
    intakeDate: new Date(2024, 8 + Math.floor(Math.random() * 4), 1).toISOString().split('T')[0],
    tuitionFee: Math.floor(Math.random() * 50000) + 20000,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
  };
};

// Helper functions for workflow logic
function getNextAction(stage: number, status: string): string {
  const actionMap: Record<string, string> = {
    'new_application': 'Review application and make decision',
    'under_review_admin': 'Complete review and make decision',
    'correction_requested_admin': 'Upload corrected documents',
    'approved_stage1': 'Prepare for university submission',
    'rejected_stage1': 'Application workflow ended',
    'sent_to_university': 'Review application and make decision',
    'university_requested_corrections': 'Upload requested documents',
    'university_approved': 'Proceed to visa processing',
    'rejected_university': 'Application workflow ended',
    'waiting_visa_payment': 'Upload visa payment proof',
    'payment_received': 'Submit to immigration',
    'submitted_to_immigration': 'Process visa application',
    'visa_issued': 'Proceed to arrival stage',
    'arrival_date_confirmed': 'Confirm actual student arrival',
    'arrival_verified': 'Proceed to commission stage',
    'commission_approved': 'Process commission payment',
    'commission_paid': 'Application completed successfully',
  };
  
  return actionMap[status] || 'No action required';
}

function getNextActor(stage: number, status: string): 'Admin' | 'Partner' | 'University' | 'Immigration' {
  const actorMap: Record<string, 'Admin' | 'Partner' | 'University' | 'Immigration'> = {
    'new_application': 'Admin',
    'under_review_admin': 'Admin',
    'correction_requested_admin': 'Partner',
    'approved_stage1': 'Admin',
    'rejected_stage1': 'Admin',
    'sent_to_university': 'University',
    'university_requested_corrections': 'Partner',
    'university_approved': 'Admin',
    'rejected_university': 'University',
    'waiting_visa_payment': 'Partner',
    'payment_received': 'Admin',
    'submitted_to_immigration': 'Immigration',
    'visa_issued': 'Admin',
    'arrival_date_confirmed': 'Partner',
    'arrival_verified': 'Admin',
    'commission_approved': 'Admin',
    'commission_paid': 'Admin',
  };
  
  return actorMap[status] || 'Admin';
}

function getRequiredDocuments(stage: number, status: string): string[] {
  const docMap: Record<string, string[]> = {
    'correction_requested_admin': ['passport', 'academic_transcripts', 'english_test'],
    'university_requested_corrections': ['additional_documents'],
    'waiting_visa_payment': ['visa_payment_proof'],
    'immigration_requested_documents': ['medical_certificate', 'police_clearance'],
    'waiting_arrival_date': ['flight_itinerary'],
    'waiting_student_payment': ['student_payment_proof'],
  };
  
  return docMap[status] || [];
}

// Generate realistic mock documents for applications
function generateMockDocuments(applicationId: string, currentStage: number, currentStatus: string, index: number, profile?: Record<string, unknown>): Document[] {
  const documents: Document[] = [];
  const baseDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  console.log('🔧 Generating documents for application:', applicationId, 'Stage:', currentStage, 'Status:', currentStatus);
  
  // Use profile data for realistic filenames
  const studentName = profile && typeof profile.firstName === 'string' && typeof profile.lastName === 'string' 
    ? `${profile.firstName}_${profile.lastName}` 
    : 'Student';
  const programName = typeof profile?.program === 'string' ? profile.program : '';
  const isArchitecture = programName.includes('Architecture');
  const isMaster = programName.includes('Master');
  
  // Safe access to nested properties
  const englishProficiency = profile?.englishProficiency && typeof profile.englishProficiency === 'object' 
    ? profile.englishProficiency as { testType?: string; overallScore?: string } 
    : {};
  const testType = typeof englishProficiency.testType === 'string' ? englishProficiency.testType : 'IELTS';
  const overallScore = typeof englishProficiency.overallScore === 'string' ? englishProficiency.overallScore : '6.5';
  
  // Stage 1 Documents - Comprehensive admission requirements
  const stage1Documents = [
    {
      type: 'passport',
      fileName: `${studentName}_Passport_Copy.pdf`,
      description: 'Valid passport copy (bio-data page) - Required',
      mandatory: true,
      uploadedDays: -15,
      status: 'approved',
    },
    {
      type: 'academic_transcripts',
      fileName: `${studentName}_Academic_Transcripts.pdf`,
      description: isMaster ? 'Official bachelor degree transcript and certificate' : 'Official high school certificate or latest certification',
      mandatory: true,
      uploadedDays: -12,
      status: 'approved',
    },
    {
      type: 'english_test',
      fileName: `${studentName}_${testType}_Certificate.pdf`,
      description: `${testType} test results (Overall ${overallScore})`,
      mandatory: true,
      uploadedDays: -10,
      status: 'approved',
    },
    {
      type: 'personal_statement',
      fileName: `${studentName}_Personal_Statement.pdf`,
      description: 'Personal statement and motivation letter for program application',
      mandatory: true,
      uploadedDays: -8,
      status: 'approved',
    },
    {
      type: 'bank_statement',
      fileName: `${studentName}_Financial_Documents.pdf`,
      description: 'Bank statement (6 months) and financial support evidence',
      mandatory: true,
      uploadedDays: -6,
      status: 'approved',
    },
    {
      type: 'recommendation_letters',
      fileName: `${studentName}_Recommendation_Letters.pdf`,
      description: isMaster ? '2-3 academic/professional recommendation letters' : '2 recommendation letters from teachers',
      mandatory: true,
      uploadedDays: -4,
      status: 'approved',
    },
    {
      type: 'cv_resume',
      fileName: `${studentName}_CV_Resume.pdf`,
      description: 'Updated curriculum vitae showing education and experience',
      mandatory: isMaster,
      uploadedDays: -3,
      status: 'approved',
    },
    {
      type: 'passport_photos',
      fileName: `${studentName}_Passport_Photos.jpg`,
      description: 'White background passport-size photographs (6 copies)',
      mandatory: true,
      uploadedDays: -2,
      status: index === 0 ? 'pending' : 'approved', // Make first application have some pending docs
    }
  ];
  
  // Add specialized documents based on program
  if (isArchitecture) {
    stage1Documents.push({
      type: 'design_portfolio',
      fileName: `${studentName}_Architecture_Portfolio.pdf`,
      description: 'Design portfolio showcasing creative work and architectural projects',
      mandatory: true,
      uploadedDays: -5,
      status: 'approved',
    });
  }
  
  // Add research proposal for master's by research (if applicable)
  if (isMaster && profile?.modeOfStudy === 'Research') {
    stage1Documents.push({
      type: 'research_proposal',
      fileName: `${studentName}_Research_Proposal.pdf`,
      description: 'Detailed research proposal outlining intended study area',
      mandatory: true,
      uploadedDays: -7,
      status: 'approved',
    });
  }
  
  // Only add stage 1 documents if we're in stage 1 or beyond
  if (currentStage >= 1) {
    stage1Documents.forEach((doc, docIndex) => {
      // Always create all documents for comprehensive testing
      
      const uploadDate = new Date(baseDate.getTime() + doc.uploadedDays * 24 * 60 * 60 * 1000);
      
      const documentData = {
        id: `DOC-${applicationId}-S1-${docIndex + 1}`,
        applicationId,
        stage: 1,
        type: doc.type,
        fileName: doc.fileName,
        uploadedAt: uploadDate.toISOString(),
        uploadedBy: 'John Partner',
        status: doc.status as 'pending' | 'approved' | 'rejected' | 'resubmission_required',
        version: 1,
        url: `data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=`, // Base64 of minimal PDF
        size: Math.floor(Math.random() * 2000000) + 500000, // 0.5-2.5MB
        mimeType: 'application/pdf',
      };
      
      documents.push(documentData);
      console.log('📄 Created document:', documentData.fileName, 'for application:', applicationId);
      
      // Add review metadata for approved/rejected documents
      if (doc.status === 'approved') {
        documents[documents.length - 1].reviewedBy = 'System Administrator';
        documents[documents.length - 1].reviewedAt = new Date(uploadDate.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Reviewed next day
      } else if (doc.status === 'resubmission_required') {
        documents[documents.length - 1].reviewedBy = 'System Administrator';
        documents[documents.length - 1].reviewedAt = new Date(uploadDate.getTime() + 12 * 60 * 60 * 1000).toISOString();
        documents[documents.length - 1].rejectionReason = 'Document quality is poor. Please upload a clearer scan.';
      }
    });
  }
  
  // Stage 2 Documents (Offer Letter Stage) - University submission documents
  if (currentStage >= 2) {
    const stage2Documents = [
      {
        type: 'offer_letter',
        fileName: 'Ahmed_Ali_University_Offer_Letter.pdf',
        description: 'Official university offer letter',
        mandatory: true,
        uploadedDays: -25,
        status: 'approved',
      },
      {
        type: 'acceptance_letter',
        fileName: 'Ahmed_Ali_Acceptance_Confirmation.pdf',
        description: 'Student acceptance confirmation',
        mandatory: true,
        uploadedDays: -20,
        status: 'approved',
      },
      {
        type: 'tuition_payment_receipt',
        fileName: 'Ahmed_Ali_Tuition_Payment_Receipt.pdf',
        description: 'First semester tuition payment receipt',
        mandatory: true,
        uploadedDays: -15,
        status: 'approved',
      }
    ];
    
    stage2Documents.forEach((doc, docIndex) => {
      const uploadDate = new Date(baseDate.getTime() + doc.uploadedDays * 24 * 60 * 60 * 1000);
      
      documents.push({
        id: `DOC-${applicationId}-S2-${docIndex + 1}`,
        applicationId,
        stage: 2,
        type: doc.type,
        fileName: doc.fileName,
        uploadedAt: uploadDate.toISOString(),
        uploadedBy: 'John Partner',
        status: doc.status as 'pending' | 'approved' | 'rejected',
        version: 1,
        url: `data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=`,
        size: Math.floor(Math.random() * 1000000) + 300000,
        mimeType: 'application/pdf',
        reviewedBy: 'System Administrator',
        reviewedAt: new Date(uploadDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      });
    });
  }
  
  // Stage 3 Documents (Visa Stage) - Complete visa application documents
  if (currentStage >= 3) {
    const stage3Documents = [
      {
        type: 'visa_application_form',
        fileName: 'Ahmed_Ali_Visa_Application_Form.pdf',
        description: 'Completed visa application form',
        mandatory: true,
        uploadedDays: -30,
        status: 'approved',
      },
      {
        type: 'medical_certificate',
        fileName: 'Ahmed_Ali_Medical_Certificate.pdf',
        description: 'Medical examination certificate from approved clinic',
        mandatory: true,
        uploadedDays: -25,
        status: 'approved',
      },
      {
        type: 'police_clearance',
        fileName: 'Ahmed_Ali_Police_Clearance.pdf',
        description: 'Police clearance certificate (criminal background check)',
        mandatory: true,
        uploadedDays: -22,
        status: 'approved',
      },
      {
        type: 'financial_evidence',
        fileName: 'Ahmed_Ali_Financial_Evidence.pdf',
        description: 'Proof of financial support and scholarship documents',
        mandatory: true,
        uploadedDays: -20,
        status: 'approved',
      },
      {
        type: 'accommodation_proof',
        fileName: 'Ahmed_Ali_Accommodation_Booking.pdf',
        description: 'Accommodation booking confirmation',
        mandatory: true,
        uploadedDays: -18,
        status: 'approved',
      },
      {
        type: 'travel_insurance',
        fileName: 'Ahmed_Ali_Travel_Insurance.pdf',
        description: 'Comprehensive travel and health insurance policy',
        mandatory: true,
        uploadedDays: -15,
        status: 'approved',
      },
      {
        type: 'visa_payment_receipt',
        fileName: 'Ahmed_Ali_Visa_Fee_Payment.pdf',
        description: 'Visa application fee payment receipt',
        mandatory: true,
        uploadedDays: -10,
        status: 'approved',
      },
      {
        type: 'biometric_appointment',
        fileName: 'Ahmed_Ali_Biometric_Appointment.pdf',
        description: 'Biometric appointment confirmation',
        mandatory: true,
        uploadedDays: -5,
        status: 'pending',
      }
    ];
    
    stage3Documents.forEach((doc, docIndex) => {
      const uploadDate = new Date(baseDate.getTime() + doc.uploadedDays * 24 * 60 * 60 * 1000);
      
      documents.push({
        id: `DOC-${applicationId}-S3-${docIndex + 1}`,
        applicationId,
        stage: 3,
        type: doc.type,
        fileName: doc.fileName,
        uploadedAt: uploadDate.toISOString(),
        uploadedBy: 'John Partner',
        status: doc.status as 'pending' | 'approved' | 'rejected',
        version: 1,
        url: `data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=`,
        size: Math.floor(Math.random() * 1500000) + 400000,
        mimeType: 'application/pdf',
        reviewedBy: 'System Administrator',
        reviewedAt: new Date(uploadDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      });
    });
  }
  
  console.log('🚀 Total documents generated:', documents.length, 'for application:', applicationId);
  return documents;
}

export class DataInitializationService {
  static initializeAllData(): Promise<void> {
    return new Promise((resolve) => {
      try {
        // Clear existing data
        this.clearAllData();
        
        // Generate and store sample data
        const partners = SAMPLE_PARTNERS;
        const students: Student[] = [];
        const applications: Application[] = [];
        const documents: Document[] = [];
        const payments: Payment[] = [];
        const visaRecords: VisaRecord[] = [];
        const arrivalRecords: ArrivalRecord[] = [];
        const commissions: Commission[] = [];
        const comments: Comment[] = [];
        const auditLog: AuditLogEntry[] = [];
        
        // Generate comprehensive applications with realistic data from requirements
        const partnerId = 'YOUR-UNI'; // Single partner
        
        // Create 2 applications with different profiles for variety
        const studentProfiles = [
          {
            firstName: 'Ahmed',
            lastName: 'Al-Mansouri', 
            email: 'ahmed.almansouri@gmail.com',
            phone: '+971-50-123-4567',
            dateOfBirth: '1999-03-15',
            nationality: 'UAE',
            passportNumber: 'AE1234567',
            address: '123 Al Karama Street, Dubai, United Arab Emirates',
            permanentAddress: '456 Sheikh Zayed Road, Abu Dhabi, United Arab Emirates',
            emergencyContact: {
              name: 'Fatima Al-Mansouri',
              phone: '+971-50-765-4321',
              relationship: 'Mother',
            },
            parentGuardian: {
              name: 'Mohammed Al-Mansouri',
              email: 'mohammed.almansouri@email.com',
              phone: '+971-50-987-6543',
              occupation: 'Business Manager'
            },
            program: 'Master of Computer Science',
            university: 'University of Technology Sydney',
            modeOfStudy: 'Coursework',
            intakeDate: '2024-09-01',
            tuitionFee: 42000,
            currency: 'AUD',
            englishProficiency: {
              testType: 'IELTS Academic',
              overallScore: '7.0',
              listeningScore: '7.5',
              readingScore: '7.0',
              writingScore: '6.5',
              speakingScore: '7.0',
              testDate: '2024-01-15',
              validUntil: '2026-01-15'
            }
          },
          {
            firstName: 'Priya',
            lastName: 'Sharma',
            email: 'priya.sharma@gmail.com',
            phone: '+91-98765-43210',
            dateOfBirth: '1998-07-22',
            nationality: 'India',
            passportNumber: 'IN9876543',
            address: '789 MG Road, Bangalore, Karnataka, India',
            permanentAddress: '321 Brigade Road, Bangalore, Karnataka, India',
            emergencyContact: {
              name: 'Rajesh Sharma',
              phone: '+91-98765-12345',
              relationship: 'Father',
            },
            parentGuardian: {
              name: 'Sunita Sharma',
              email: 'sunita.sharma@email.com',
              phone: '+91-98765-54321',
              occupation: 'Teacher'
            },
            program: 'Bachelor of Architecture',
            university: 'Melbourne University',
            modeOfStudy: 'Full-time',
            intakeDate: '2024-07-01',
            tuitionFee: 38000,
            currency: 'AUD',
            englishProficiency: {
              testType: 'IELTS Academic',
              overallScore: '6.5',
              listeningScore: '6.5',
              readingScore: '6.0',
              writingScore: '6.0',
              speakingScore: '7.0',
              testDate: '2023-11-20',
              validUntil: '2025-11-20'
            }
          }
        ];
        
        for (let i = 0; i < studentProfiles.length; i++) {
          const profile = studentProfiles[i];
          const studentId = `STU-${String(i + 1).padStart(3, '0')}`;
          const applicationId = `APP-2024-${String(i + 1).padStart(3, '0')}`;
          
          // Generate comprehensive student profile with realistic data from requirements
          const student: Student = {
            id: studentId,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            nationality: profile.nationality,
            passportNumber: profile.passportNumber,
            applicationIds: [applicationId], // Link to the application being created
            createdAt: new Date().toISOString(),
            // Legacy fields for backward compatibility
            dateOfBirth: profile.dateOfBirth,
            address: profile.address,
            emergencyContact: profile.emergencyContact,
            academicHistory: [
              {
                institution: profile.nationality === 'UAE' ? 'American University of Dubai' : 'Indian Institute of Technology',
                degree: profile.program.includes('Master') ? 'Bachelor of Engineering' : 'High School Diploma',
                startYear: profile.program.includes('Master') ? 2017 : 2014,
                endYear: profile.program.includes('Master') ? 2021 : 2018,
                gpa: profile.program.includes('Master') ? 3.8 : 3.6
              }
            ],
            englishProficiency: profile.englishProficiency ? {
              testType: profile.englishProficiency.testType,
              score: profile.englishProficiency.overallScore,
              testDate: profile.englishProficiency.testDate
            } : undefined,
          };
          students.push(student);
          
          // Generate comprehensive application using profile data
          const application: Application = {
            id: applicationId,
            studentId,
            partnerId,
            program: profile.program,
            university: profile.university,
            intakeDate: profile.intakeDate,
            tuitionFee: profile.tuitionFee,
            currentStage: 1,
            currentStatus: 'new_application',
            priority: i === 0 ? 'high' : 'medium', // Vary priorities
            nextAction: 'Admin review required',
            nextActor: 'Admin',
            createdAt: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000).toISOString(), // Stagger creation dates
            updatedAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000).toISOString(), // Stagger update dates
            stageHistory: [
              {
                stage: 1,
                status: 'new_application',
                timestamp: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000).toISOString(),
                actor: 'Partner',
                notes: `Initial ${profile.program} application submitted for ${profile.firstName} ${profile.lastName}`,
              }
            ]
          };
          
          // Generate realistic documents for this application
          const generatedDocs = generateMockDocuments(application.id, application.currentStage, application.currentStatus, i, profile);
          documents.push(...generatedDocs);
          console.log('📁 Added', generatedDocs.length, 'documents to collection. Total documents:', documents.length);
          applications.push(application);
          
          // Generate related records based on application stage
          if (application.currentStage >= 3) {
            visaRecords.push({
              id: `VISA-${i + 1}`,
              applicationId,
              trackingNumber: application.trackingNumber || `TRK-${i + 1}`,
              status: 'approved',
              visaNumber: `VISA-${Date.now()}-${i}`,
              issuedAt: new Date().toISOString(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            });
          }
          
          if (application.currentStage >= 4) {
            arrivalRecords.push({
              id: `ARR-${i + 1}`,
              applicationId,
              plannedArrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              actualArrivalDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'verified',
              verifiedBy: 'admin-001',
              verifiedAt: new Date().toISOString(),
            });
          }
          
          // Commission data is handled by initialize-v2.ts
          
          // Add comprehensive comments for testing
          comments.push(
            {
              id: `COMMENT-${applicationId}-1`,
              applicationId,
              stage: 1,
              author: 'John Partner',
              authorRole: 'partner',
              content: `Initial ${profile.program} application submitted for ${profile.firstName} ${profile.lastName}. Student has strong academic background with ${profile.nationality} nationality and ${profile.englishProficiency.testType} ${profile.englishProficiency.overallScore}. ${profile.program.includes('Architecture') ? 'Portfolio included for architecture program.' : ''} Looking forward to admin review.`,
              isInternal: false,
              createdAt: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: `COMMENT-${applicationId}-2`,
              applicationId,
              stage: 1,
              author: 'System Admin',
              authorRole: 'admin',
              content: `Application received and queued for review. All required documents for ${profile.program} appear to be uploaded. ${i === 0 ? 'Some documents still pending review.' : 'Documents look complete.'}`,
              isInternal: true,
              createdAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000).toISOString(),
            }
          );
          
          // Add comprehensive audit log entries for testing
          auditLog.push(
            {
              id: `AUDIT-${applicationId}-1`,
              applicationId,
              event: 'application_created',
              action: 'Application created and submitted by partner',
              actor: 'John Partner',
              actorRole: 'partner',
              timestamp: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000).toISOString(),
              newStatus: 'new_application',
              details: { 
                stage: 1, 
                notes: `Initial ${profile.program} application submission with all Stage 1 documents`,
                programName: profile.program,
                universityName: profile.university,
                studentName: `${profile.firstName} ${profile.lastName}`
              },
            },
            {
              id: `AUDIT-${applicationId}-2`,
              applicationId,
              event: 'documents_uploaded',
              action: 'Multiple documents uploaded for Stage 1',
              actor: 'John Partner',
              actorRole: 'partner',
              timestamp: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000).toISOString(),
              newStatus: 'new_application',
              details: { 
                stage: 1, 
                notes: `Documents uploaded: Passport, Academic Transcripts, ${profile.englishProficiency.testType}, Personal Statement, Bank Statement, Recommendation Letters${profile.program.includes('Master') ? ', CV' : ''}${profile.program.includes('Architecture') ? ', Portfolio' : ''}`,
                documentsCount: 6
              },
            },
            {
              id: `AUDIT-${applicationId}-3`,
              applicationId,
              event: 'status_update',
              action: 'Application status updated to awaiting admin review',
              actor: 'System',
              actorRole: 'admin',
              timestamp: new Date(Date.now() - (1 - i) * 12 * 60 * 60 * 1000).toISOString(),
              newStatus: 'new_application',
              details: { 
                stage: 1, 
                notes: `${profile.program} application queued for admin review. ${i === 0 ? 'Some documents still pending.' : 'All required documents submitted.'}`,
                priority: i === 0 ? 'high' : 'medium'
              },
            }
          );
        }

        // Generate sample document requests for the single application (if needed for testing)
        const documentRequests: DocumentRequest[] = [];
        
        // No document requests needed for initial testing - application is ready for admin review
        
        // Store all data in localStorage
        console.log('💾 Storing data in localStorage:');
        console.log('   - Applications:', applications.length);
        console.log('   - Documents:', documents.length);
        console.log('   - Students:', students.length);
        console.log('   - Partners:', partners.length);
        
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        
        // Verify storage
        const storedDocs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
        console.log('✅ Verified documents stored in localStorage:', storedDocs.length);
        localStorage.setItem(STORAGE_KEYS.DOCUMENT_REQUESTS, JSON.stringify(documentRequests));
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        localStorage.setItem(STORAGE_KEYS.VISA_RECORDS, JSON.stringify(visaRecords));
        localStorage.setItem(STORAGE_KEYS.ARRIVAL_RECORDS, JSON.stringify(arrivalRecords));
        localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(auditLog));
        localStorage.setItem(STORAGE_KEYS.APP_VERSION, '2.0');
        
        // Trigger storage event for real-time sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: STORAGE_KEYS.APPLICATIONS,
          newValue: JSON.stringify(applications),
        }));
        
        console.log('✅ Enhanced realistic data initialized successfully!');
        console.log(`Generated: ${applications.length} applications, ${students.length} students, ${partners.length} partners`);
        console.log('📊 Applications created:');
        applications.forEach((app, index) => {
          const student = students[index];
          console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} - ${app.program} at ${app.university} (${app.priority} priority)`);
        });
        
        resolve();
      } catch (error) {
        console.error('Error initializing data:', error);
        throw error;
      }
    });
  }
  
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  static isDataInitialized(): boolean {
    return localStorage.getItem(STORAGE_KEYS.APP_VERSION) === '2.0' &&
           localStorage.getItem(STORAGE_KEYS.APPLICATIONS) !== null;
  }
  
  static getDataStats(): { applications: number; partners: number; students: number } {
    try {
      const applications = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
      const partners = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTNERS) || '[]');
      const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
      
      return {
        applications: applications.length,
        partners: partners.length,
        students: students.length,
      };
    } catch {
      return { applications: 0, partners: 0, students: 0 };
    }
  }
}
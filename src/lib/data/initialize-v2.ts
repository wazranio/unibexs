import { StorageService } from './storage';
import { Application, Student, Partner, Document, Commission } from '@/types';
import { AuthService } from '@/lib/auth';
import { createCommissionFromApplication } from '@/lib/commission/commission-calculator';
import { initializeSamplePartners } from './sample-partners';
import { initializeSampleUniversities } from './sample-universities';
import { initializeSampleServices } from './sample-services';
import { initializeSampleLogisticsPartners } from './sample-logistics-partners';
import { initializeEnhancedProgramData } from './enhanced-program-data';

function initializeSampleCommissions(): void {
  console.log('📊 Initializing sample commission data...');
  
  try {
    // Create sample commissions for completed enrollments
    const applications = StorageService.getApplications();
    const commissions: Commission[] = [];
    
    // Create a commission paid (Omar Hassan - APP-2024-004)
    const paidApp = applications.find(app => app.id === 'APP-2024-004');
    if (paidApp) {
      const paidCommission = createCommissionFromApplication(paidApp, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      paidCommission.status = 'commission_paid';
      paidCommission.approvedAt = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      paidCommission.releasedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      paidCommission.paidAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      paidCommission.transferReference = 'TXN20241201001';
      paidCommission.transferDocumentUrl = 'https://example.com/transfers/receipt-001.pdf';
      paidCommission.approvedBy = 'admin@unibexs.com';
      paidCommission.releasedBy = 'admin@unibexs.com';
      commissions.push(paidCommission);
    }
    
    // Create a pending commission (Ahmed Ali - APP-2024-002)
    const pendingApp = applications.find(app => app.id === 'APP-2024-002');
    if (pendingApp) {
      const pendingCommission = createCommissionFromApplication(pendingApp, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      pendingCommission.status = 'commission_pending';
      commissions.push(pendingCommission);
    }
    
    // Create an approved commission (Sarah Chen - APP-2024-003)
    const approvedApp = applications.find(app => app.id === 'APP-2024-003');
    if (approvedApp) {
      const approvedCommission = createCommissionFromApplication(approvedApp, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
      approvedCommission.status = 'commission_approved';
      approvedCommission.approvedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      approvedCommission.approvedBy = 'admin@unibexs.com';
      commissions.push(approvedCommission);
    }
    
    // Save all commissions
    commissions.forEach(commission => {
      StorageService.saveCommission(commission);
    });
    
    console.log(`💰 Created ${commissions.length} sample commissions:`);
    commissions.forEach(comm => {
      console.log(`  - ${comm.status}: ${comm.commissionAmount.toLocaleString()} MYR (${comm.university})`);
    });

  } catch (error) {
    console.error('Failed to initialize sample commissions:', error);
  }
}

export async function initializeDataV2(): Promise<void> {
  console.log('🚀 Starting V2 Data Initialization...');

  try {
    // Clear existing data
    StorageService.clearAllData();
    
    // Initialize auth users (admin and partner users are handled by AuthService)
    AuthService.forceRefreshUsers();

    // Create Partner Organization (Gold tier for higher commission rates)
    const partner: Partner = {
      id: 'partner-techcorp-001',
      type: 'business',
      name: 'TechCorp Education Partners',
      email: 'partner@techcorp.com',
      phone: '+1-555-0123',
      country: 'Malaysia',
      businessName: 'TechCorp Education Services Sdn Bhd',
      status: 'approved',
      createdAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      address: '123 Business District, Tech City, TC 12345',
      contactPerson: 'Sarah Johnson',
      registrationNumber: 'TC-EDU-2024-001',
      totalApplications: 8,
      successfulPlacements: 5,
      pendingCommission: 0,
      tier: 'gold'
    };

    // Create 8 Diverse Students
    const students: Student[] = [
      // Stage 1 - New Application
      {
        id: 'student-michael-001',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@email.com',
        phone: '+1-555-0199',
        nationality: 'American',
        passportNumber: 'US123456789',
        applicationIds: ['APP-2024-001'],
        createdAt: new Date().toISOString(),
        dateOfBirth: '1998-03-15',
        address: '456 Student Lane, Hometown, HT 67890',
        emergencyContact: {
          name: 'Robert Johnson',
          relationship: 'Father',
          phone: '+1-555-0200',
        },
        academicHistory: [
          {
            institution: 'Hometown High School',
            degree: 'High School Diploma',
            startYear: 2014,
            endYear: 2018,
            gpa: 3.8
          }
        ],
        englishProficiency: {
          testType: 'TOEFL',
          score: '95',
          testDate: '2023-06-15'
        },
      },
      
      // Stage 5 - Commission Pending
      {
        id: 'student-ahmed-002',
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed.ali@email.com',
        phone: '+249-123-456789',
        nationality: 'Sudan',
        passportNumber: 'SD987654321',
        applicationIds: ['APP-2024-002'],
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1999-08-20',
        address: 'Khartoum North, Sudan',
        emergencyContact: {
          name: 'Hassan Ali',
          relationship: 'Father',
          phone: '+249-123-456700',
        },
        academicHistory: [
          {
            institution: 'Khartoum University',
            degree: 'Bachelor of Science',
            startYear: 2017,
            endYear: 2021,
            gpa: 3.6
          }
        ],
        englishProficiency: {
          testType: 'IELTS',
          score: '7.0',
          testDate: '2023-05-20'
        },
      },
      
      // Stage 5 - Commission Approved
      {
        id: 'student-sarah-003',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@email.com',
        phone: '+86-138-0013-8000',
        nationality: 'China',
        passportNumber: 'CN456789123',
        applicationIds: ['APP-2024-003'],
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1997-12-10',
        address: 'Beijing, China',
        emergencyContact: {
          name: 'Li Chen',
          relationship: 'Mother',
          phone: '+86-138-0013-8001',
        },
        academicHistory: [
          {
            institution: 'Beijing Institute of Technology',
            degree: 'Bachelor of Engineering',
            startYear: 2016,
            endYear: 2020,
            gpa: 3.9
          }
        ],
        englishProficiency: {
          testType: 'TOEFL',
          score: '105',
          testDate: '2023-04-15'
        },
      },
      
      // Stage 5 - Commission Paid
      {
        id: 'student-omar-004',
        firstName: 'Omar',
        lastName: 'Hassan',
        email: 'omar.hassan@email.com',
        phone: '+968-9123-4567',
        nationality: 'Oman',
        passportNumber: 'OM789123456',
        applicationIds: ['APP-2024-004'],
        createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1998-06-25',
        address: 'Muscat, Oman',
        emergencyContact: {
          name: 'Fatima Hassan',
          relationship: 'Mother',
          phone: '+968-9123-4568',
        },
        academicHistory: [
          {
            institution: 'Sultan Qaboos University',
            degree: 'Bachelor of Business Administration',
            startYear: 2016,
            endYear: 2020,
            gpa: 3.7
          }
        ],
        englishProficiency: {
          testType: 'IELTS',
          score: '7.5',
          testDate: '2023-03-10'
        },
      },
      
      // Stage 4 - Enrollment/Arrival
      {
        id: 'student-maria-005',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '+34-612-345-678',
        nationality: 'Spain',
        passportNumber: 'ES123456789',
        applicationIds: ['APP-2024-005'],
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1999-04-18',
        address: 'Madrid, Spain',
        emergencyContact: {
          name: 'Carlos Garcia',
          relationship: 'Father',
          phone: '+34-612-345-679',
        },
        academicHistory: [
          {
            institution: 'Universidad Complutense Madrid',
            degree: 'Bachelor of Arts',
            startYear: 2017,
            endYear: 2021,
            gpa: 3.8
          }
        ],
        englishProficiency: {
          testType: 'IELTS',
          score: '8.0',
          testDate: '2023-07-22'
        },
      },
      
      // Stage 3 - Visa Processing
      {
        id: 'student-raj-006',
        firstName: 'Raj',
        lastName: 'Patel',
        email: 'raj.patel@email.com',
        phone: '+91-98765-43210',
        nationality: 'India',
        passportNumber: 'IN987654321',
        applicationIds: ['APP-2024-006'],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1998-11-30',
        address: 'Mumbai, India',
        emergencyContact: {
          name: 'Priya Patel',
          relationship: 'Mother',
          phone: '+91-98765-43211',
        },
        academicHistory: [
          {
            institution: 'Indian Institute of Technology',
            degree: 'Bachelor of Technology',
            startYear: 2016,
            endYear: 2020,
            gpa: 3.9
          }
        ],
        englishProficiency: {
          testType: 'IELTS',
          score: '7.5',
          testDate: '2023-08-15'
        },
      },
      
      // Stage 2 - University Review
      {
        id: 'student-john-007',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+44-7700-900123',
        nationality: 'United Kingdom',
        passportNumber: 'GB123456789',
        applicationIds: ['APP-2024-007'],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1999-02-14',
        address: 'London, United Kingdom',
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Mother',
          phone: '+44-7700-900124',
        },
        academicHistory: [
          {
            institution: 'Oxford High School',
            degree: 'A-Levels',
            startYear: 2015,
            endYear: 2017,
            gpa: 3.9
          }
        ],
        englishProficiency: {
          testType: 'IELTS',
          score: '8.5',
          testDate: '2023-09-10'
        },
      },
      
      // Stage 1 - Under Review
      {
        id: 'student-fatima-008',
        firstName: 'Fatima',
        lastName: 'Ahmed',
        email: 'fatima.ahmed@email.com',
        phone: '+249-912-345678',
        nationality: 'Sudan',
        passportNumber: 'SD456789123',
        applicationIds: ['APP-2024-008'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '2000-01-05',
        address: 'Port Sudan, Sudan',
        emergencyContact: {
          name: 'Mohammed Ahmed',
          relationship: 'Father',
          phone: '+249-912-345679',
        },
        academicHistory: [
          {
            institution: 'Red Sea University',
            degree: 'High School Certificate',
            startYear: 2016,
            endYear: 2018,
            gpa: 3.7
          }
        ],
        englishProficiency: {
          testType: 'IELTS',
          score: '6.5',
          testDate: '2023-10-05'
        },
      }
    ];

    // Create 8 Applications Across All Stages
    const applications: Application[] = [
      // APP-2024-001: Stage 1 - New Application (Michael Johnson)
      {
        id: 'APP-2024-001',
        studentId: 'student-michael-001',
        partnerId: partner.id,
        university: 'Tech University',
        program: 'Computer Science - Bachelor',
        intakeDate: '2025-01-15',
        currentStage: 1,
        currentStatus: 'new_application',
        priority: 'medium',
        tuitionFee: 25000,
        currency: 'MYR',
        nextAction: 'Admin review required',
        nextActor: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // APP-2024-002: Stage 5 - Commission Pending (Ahmed Ali - Sudan)
      {
        id: 'APP-2024-002',
        studentId: 'student-ahmed-002',
        partnerId: partner.id,
        university: 'University of Malaya',
        program: 'Master of Science - Data Science',
        intakeDate: '2024-09-01',
        currentStage: 5,
        currentStatus: 'commission_pending',
        priority: 'high',
        tuitionFee: 25000,
        currency: 'MYR',
        nextAction: 'Commission review required',
        nextActor: 'Admin',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // APP-2024-003: Stage 5 - Commission Approved (Sarah Chen - China)
      {
        id: 'APP-2024-003',
        studentId: 'student-sarah-003',
        partnerId: partner.id,
        university: 'Universiti Teknologi Malaysia',
        program: 'Master of Engineering - Software Engineering',
        intakeDate: '2024-07-01',
        currentStage: 5,
        currentStatus: 'commission_approved',
        priority: 'high',
        tuitionFee: 30000,
        currency: 'MYR',
        nextAction: 'Payment release pending',
        nextActor: 'Admin',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // APP-2024-004: Stage 5 - Commission Paid (Omar Hassan - Oman)
      {
        id: 'APP-2024-004',
        studentId: 'student-omar-004',
        partnerId: partner.id,
        university: 'Taylor\'s University',
        program: 'Bachelor of Business Administration',
        intakeDate: '2024-05-01',
        currentStage: 5,
        currentStatus: 'commission_paid',
        priority: 'medium',
        tuitionFee: 35000,
        currency: 'MYR',
        nextAction: 'Application completed',
        nextActor: 'Admin',
        createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // APP-2024-005: Stage 4 - Enrollment Verification (Maria Garcia - Spain)
      {
        id: 'APP-2024-005',
        studentId: 'student-maria-005',
        partnerId: partner.id,
        university: 'International Islamic University Malaysia',
        program: 'Bachelor of Arts - International Relations',
        intakeDate: '2024-09-01',
        currentStage: 4,
        currentStatus: 'enrollment_verification',
        priority: 'high',
        tuitionFee: 22000,
        currency: 'MYR',
        nextAction: 'Verify enrollment documents',
        nextActor: 'Admin',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // APP-2024-006: Stage 3 - Visa Processing (Raj Patel - India)
      {
        id: 'APP-2024-006',
        studentId: 'student-raj-006',
        partnerId: partner.id,
        university: 'Universiti Putra Malaysia',
        program: 'Master of Engineering - Civil Engineering',
        intakeDate: '2025-02-01',
        currentStage: 3,
        currentStatus: 'visa_submitted',
        priority: 'medium',
        tuitionFee: 28000,
        currency: 'MYR',
        nextAction: 'Await visa decision',
        nextActor: 'Immigration',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // APP-2024-007: Stage 2 - University Review (John Smith - UK)
      {
        id: 'APP-2024-007',
        studentId: 'student-john-007',
        partnerId: partner.id,
        university: 'Multimedia University',
        program: 'Bachelor of Information Technology',
        intakeDate: '2025-03-01',
        currentStage: 2,
        currentStatus: 'university_processing',
        priority: 'medium',
        tuitionFee: 26000,
        currency: 'MYR',
        nextAction: 'University assessment pending',
        nextActor: 'University',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // APP-2024-008: Stage 1 - Under Review (Fatima Ahmed - Sudan)
      {
        id: 'APP-2024-008',
        studentId: 'student-fatima-008',
        partnerId: partner.id,
        university: 'Universiti Kebangsaan Malaysia',
        program: 'Bachelor of Medicine',
        intakeDate: '2025-07-01',
        currentStage: 1,
        currentStatus: 'under_review',
        priority: 'high',
        tuitionFee: 45000,
        currency: 'MYR',
        nextAction: 'Document verification in progress',
        nextActor: 'Admin',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    // Simple document placeholder - focus on applications and commissions for now
    const documents: Document[] = [];

    // Store all data
    StorageService.savePartner(partner);
    
    // Save all 8 students
    students.forEach(student => {
      StorageService.saveStudent(student);
    });
    
    // Save all 8 applications
    applications.forEach(application => {
      StorageService.saveApplication(application);
    });
    
    // Store documents separately (empty for now - focus on core functionality)
    documents.forEach(doc => {
      StorageService.addDocument(doc);
    });

    // Update partner statistics
    const updatedPartner = {
      ...partner,
      totalApplications: 8,
      successfulPlacements: 3  // 3 students in Stage 5
    };
    StorageService.updatePartner(updatedPartner);

    // Initialize additional sample partners for testing
    initializeSamplePartners();

    // Initialize universities and programs
    initializeSampleUniversities();

    // Initialize enhanced program management data
    initializeEnhancedProgramData();

    // Initialize service providers
    initializeSampleServices();
    initializeSampleLogisticsPartners();

    // Initialize sample commission data
    initializeSampleCommissions();

    console.log('✅ V2 Data Initialization Complete!');
    console.log('📊 Created:');
    console.log('  - Auth Users Refreshed (Admin + Partner)');
    console.log('  - 1 Partner Organization (Gold Tier)');
    console.log('  - 8 Students (Diverse Nationalities)');
    console.log('  - 8 Applications (Stage 1: 2, Stage 2: 1, Stage 3: 1, Stage 4: 1, Stage 5: 3)');
    console.log('  - 3 Commissions (Pending: 1, Approved: 1, Paid: 1)');
    console.log('  - Sample Universities, Services, and Logistics Partners');
    console.log('  - Enhanced Program Management: Fields of Study, Levels, Enhanced Programs');
    console.log('\n🔐 Login Credentials:');
    console.log('  - Admin: admin@unibexs.com / admin123');
    console.log('  - Partner: partner@techcorp.com / partner123');

  } catch (error) {
    console.error('Failed to initialize V2 data:', error);
  }
}
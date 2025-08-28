import { StorageService } from './storage';
import { Application, Student, Partner, Document, Commission } from '@/types';
import { AuthService } from '@/lib/auth';
import { createCommissionFromApplication } from '@/lib/commission/commission-calculator';
import { initializeSamplePartners } from './sample-partners';
import { initializeSampleUniversities } from './sample-universities';
import { initializeSampleServices } from './sample-services';
import { initializeSampleLogisticsPartners } from './sample-logistics-partners';

function initializeSampleCommissions(): void {
  console.log('📊 Initializing sample commission data...');
  
  try {
    // Create sample commissions for completed enrollments
    const applications = StorageService.getApplications();
    const commissions: Commission[] = [];
    
    // Create a completed commission (student enrolled and paid)
    const completedApp = applications.find(app => app.id === 'app-003');
    if (completedApp) {
      const completedCommission = createCommissionFromApplication(completedApp, new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
      completedCommission.status = 'commission_paid';
      completedCommission.approvedAt = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
      completedCommission.releasedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      completedCommission.paidAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      completedCommission.transferReference = 'TXN20241201001';
      completedCommission.transferDocumentUrl = 'https://example.com/transfers/receipt-001.pdf';
      completedCommission.approvedBy = 'admin@unibexs.com';
      completedCommission.releasedBy = 'admin@unibexs.com';
      commissions.push(completedCommission);
    }
    
    // Create a pending commission
    const pendingApp = applications.find(app => app.id === 'app-001');
    if (pendingApp) {
      const pendingCommission = createCommissionFromApplication(pendingApp, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
      pendingCommission.status = 'commission_pending';
      commissions.push(pendingCommission);
    }
    
    // Create an approved commission (ready for payment)
    const approvedApp = applications.find(app => app.id === 'app-002');
    if (approvedApp) {
      const approvedCommission = createCommissionFromApplication(approvedApp, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
      approvedCommission.status = 'commission_approved';
      approvedCommission.approvedAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
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

    // Create Partner Organization
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
      totalApplications: 0,
      successfulPlacements: 0,
      pendingCommission: 0
    };

    // Create Student
    const student: Student = {
      id: 'student-michael-001',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@email.com',
      phone: '+1-555-0199',
      nationality: 'American',
      passportNumber: 'US123456789',
      applicationIds: ['APP-2024-001'], // Will link to application being created
      createdAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
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
    };

    // Create Application (New Application - Start of Journey)
    const application: Application = {
      id: 'APP-2024-001',
      studentId: student.id,
      partnerId: partner.id,
      university: 'Tech University',
      program: 'Computer Science - Bachelor',
      intakeDate: '2024-09-01',
      currentStage: 1,
      currentStatus: 'new_application',
      priority: 'medium',
      tuitionFee: 25000,
      nextAction: 'Admin review required',
      nextActor: 'Admin',
      timeline: [
        {
          id: 'timeline-001',
          stage: 1,
          status: 'new_application',
          timestamp: new Date().toISOString(),
          actor: 'Partner',
          action: 'Application submitted with initial documents',
          notes: 'Partner TechCorp submitted application for Michael Johnson - Computer Science program at Tech University'
        }
      ],
      notes: 'Initial application submitted by TechCorp Education Partners. Student seeking Computer Science Bachelor degree at Tech University for Fall 2024 intake.',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        source: 'partner_portal',
        referenceNumber: 'TC-APP-2024-001',
        estimatedCommission: 2500,
        programFee: 25000,
        visaFeeRequired: 350
      }
    };

    // Create Documents separately using the Document interface
    const documents: Document[] = [
      {
        id: 'DOC-APP-2024-001-1',
        applicationId: application.id,
        stage: 1,
        type: 'passport',
        fileName: 'Michael_Johnson_Passport_Copy.pdf',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        uploadedBy: 'John Partner',
        status: 'approved',
        version: 1,
        url: 'data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=',
        size: 1024768,
        mimeType: 'application/pdf',
        reviewedBy: 'System Administrator',
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'DOC-APP-2024-001-2',
        applicationId: application.id,
        stage: 1,
        type: 'academic_transcripts',
        fileName: 'Michael_Johnson_Academic_Transcripts.pdf',
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'John Partner',
        status: 'approved',
        version: 1,
        url: 'data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=',
        size: 2048576,
        mimeType: 'application/pdf',
        reviewedBy: 'System Administrator',
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'DOC-APP-2024-001-3',
        applicationId: application.id,
        stage: 1,
        type: 'english_test',
        fileName: 'Michael_Johnson_TOEFL_Certificate.pdf',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'John Partner',
        status: 'approved',
        version: 1,
        url: 'data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=',
        size: 512384,
        mimeType: 'application/pdf',
        reviewedBy: 'System Administrator',
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'DOC-APP-2024-001-4',
        applicationId: application.id,
        stage: 1,
        type: 'personal_statement',
        fileName: 'Michael_Johnson_Personal_Statement.pdf',
        uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'John Partner',
        status: 'pending',
        version: 1,
        url: 'data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=',
        size: 768912,
        mimeType: 'application/pdf'
      }
    ];

    // Create Stage 2 Applications for Testing
    const stage2Student: Student = {
      id: 'student-sarah-002',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@email.com',
      phone: '+1-555-0298',
      nationality: 'Canadian',
      passportNumber: 'CA987654321',
      applicationIds: ['APP-2024-002'], // Will link to application being created
      createdAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      dateOfBirth: '1999-07-22',
      address: '789 Maple Street, Toronto, ON M1A 2B3',
      emergencyContact: {
        name: 'Jennifer Williams',
        relationship: 'Mother',
        phone: '+1-555-0299',
      },
      academicHistory: [
        {
          institution: 'Toronto High School',
          degree: 'High School Diploma',
          startYear: 2013,
          endYear: 2017,
          gpa: 3.8
        }
      ],
      englishProficiency: {
        testType: 'IELTS',
        score: '7.5',
        testDate: '2023-11-15'
      },
    };

    const stage2Application: Application = {
      id: 'APP-2024-002',
      studentId: stage2Student.id,
      partnerId: partner.id,
      university: 'International Business University',
      program: 'Business Administration - Master',
      intakeDate: '2024-09-01',
      currentStage: 2,
      currentStatus: 'sent_to_university',
      priority: 'high',
      tuitionFee: 35000,
      nextAction: 'Waiting for university response',
      nextActor: 'University',
      timeline: [
        {
          id: 'timeline-s2-001',
          stage: 1,
          status: 'approved_stage1',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          actor: 'Admin',
          action: 'Stage 1 approved',
          notes: 'All documents approved, moving to Stage 2'
        },
        {
          id: 'timeline-s2-002', 
          stage: 2,
          status: 'sent_to_university',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          actor: 'System',
          action: 'Application sent to university',
          notes: 'Application package submitted to International Business University'
        }
      ],
      notes: 'Strong candidate with excellent IELTS score. High priority for university.',
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    const stage2ApplicationPending: Application = {
      id: 'APP-2024-003',
      studentId: 'student-david-003',
      partnerId: partner.id,
      university: 'Science & Technology Institute',
      program: 'Engineering - Electrical',
      intakeDate: '2024-09-01',
      currentStage: 2,
      currentStatus: 'university_requested_corrections',
      priority: 'medium',
      tuitionFee: 28000,
      nextAction: 'Upload requested corrections',
      nextActor: 'Partner',
      timeline: [
        {
          id: 'timeline-s2p-001',
          stage: 1,
          status: 'approved_stage1',
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          actor: 'Admin',
          action: 'Stage 1 approved',
          notes: 'Documents approved after corrections'
        },
        {
          id: 'timeline-s2p-002',
          stage: 2,
          status: 'sent_to_university',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          actor: 'System',
          action: 'Application sent to university',
          notes: 'Application submitted to Science & Technology Institute'
        },
        {
          id: 'timeline-s2p-003',
          stage: 2,
          status: 'university_requested_corrections',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          actor: 'University',
          action: 'University requested additional documents',
          notes: 'University requires updated academic transcripts and English test'
        }
      ],
      notes: 'University requested additional information.',
      submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    };

    const stage2Student3: Student = {
      id: 'student-david-003',
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@email.com',
      phone: '+86-138-0013-8000',
      nationality: 'Chinese',
      passportNumber: 'E12345678',
      applicationIds: [], // Will be updated when applications are linked
      createdAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      dateOfBirth: '1998-12-10',
      address: 'Room 1205, Building A, Sunshine Community, Beijing, China',
      emergencyContact: {
        name: 'Li Chen',
        relationship: 'Father',
        phone: '+86-138-0013-8001',
      },
      academicHistory: [
        {
          institution: 'Beijing University of Technology',
          degree: 'Bachelor of Engineering',
          startYear: 2016,
          endYear: 2020,
          gpa: 3.6
        }
      ],
      englishProficiency: {
        testType: 'TOEFL',
        score: '95',
        testDate: '2023-10-20'
      },
    };

    // Store all data
    StorageService.savePartner(partner);
    StorageService.saveStudent(student);
    StorageService.saveStudent(stage2Student);
    StorageService.saveStudent(stage2Student3);
    StorageService.saveApplication(application);
    StorageService.saveApplication(stage2Application);
    StorageService.saveApplication(stage2ApplicationPending);
    
    // Store documents separately
    documents.forEach(doc => {
      StorageService.addDocument(doc);
    });

    // Update partner statistics
    const updatedPartner = {
      ...partner,
      totalApplications: 3
    };
    StorageService.updatePartner(updatedPartner);

    // Initialize additional sample partners for testing
    initializeSamplePartners();

    // Initialize universities and programs
    initializeSampleUniversities();

    // Initialize service providers
    initializeSampleServices();
    initializeSampleLogisticsPartners();

    // Initialize sample commission data
    initializeSampleCommissions();

    console.log('✅ V2 Data Initialization Complete!');
    console.log('📊 Created:');
    console.log('  - Auth Users Refreshed (Admin + Partner)');
    console.log('  - 1 Partner Organization');
    console.log('  - 3 Students (Michael, Sarah, David)');
    console.log('  - 3 Applications (1 Stage 1, 2 Stage 2)');
    console.log(`  - ${documents.length} Documents (${documents.filter(d => d.status === 'approved').length} approved, ${documents.filter(d => d.status === 'pending').length} pending)`);
    console.log('');
    console.log('🎯 Multi-Stage Journey Ready:');
    console.log('  📋 Stage 1: Michael Johnson (APP-2024-001) - New Application');
    console.log('  🏫 Stage 2: Sarah Williams (APP-2024-002) - Sent to University');  
    console.log('  📝 Stage 2: David Chen (APP-2024-003) - University Corrections Needed');
    console.log('');
    console.log('🧪 Test Workflow Engine:');
    console.log('  ✅ Zero hardcoded logic - All configuration-driven');
    console.log('  ✅ Stage 1 & Stage 2 statuses implemented'); 
    console.log('  ✅ Copy manager for easy text editing');
    console.log('  ✅ Authority matrix for permissions');
    console.log('');
    console.log('👤 Login Credentials:');
    console.log('  Partner: partner@unibexs.com / partner123');
    console.log('  Admin: admin@unibexs.com / admin123');

  } catch (error) {
    console.error('❌ V2 Data Initialization Failed:', error);
    throw error;
  }
}
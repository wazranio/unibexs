import {
  Application,
  Partner,
  Student,
  Comment,
  AuditLogEntry,
  DashboardStats,
  Document,
  DocumentRequest,
  University,
  College,
  Program,
  ServiceProvider,
  LogisticsPartner,
  PartnerAnalytics,
  StudentAnalytics,
  UniversityAnalytics,
  ServiceAnalytics,
} from '@/types';
import { SystemTriggers } from '../workflow/system-triggers';

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
  // New MVP entities
  UNIVERSITIES: 'unibexs_universities',
  COLLEGES: 'unibexs_colleges',
  PROGRAMS: 'unibexs_programs',
  SERVICES: 'unibexs_services',
  LOGISTICS_PARTNERS: 'unibexs_logistics_partners',
} as const;

export class StorageService {
  // Generic storage methods
  static getItem<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return [];
    }
  }

  static setItem<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Trigger storage event for real-time sync
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(data),
      }));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  // Applications
  static getApplications(partnerId?: string): Application[] {
    const applications = this.getItem<Application>(STORAGE_KEYS.APPLICATIONS);
    console.log('[StorageService] getApplications called with partnerId:', partnerId);
    console.log('[StorageService] Total applications in storage:', applications.length);
    
    if (partnerId) {
      const filtered = applications.filter(app => app.partnerId === partnerId);
      console.log('[StorageService] Filtered applications for partnerId', partnerId, ':', filtered.length);
      console.log('[StorageService] Sample applications partnerIds:', applications.slice(0, 5).map(app => ({ id: app.id, partnerId: app.partnerId })));
      return filtered;
    }
    
    return applications;
  }

  static getApplication(id: string): Application | undefined {
    const applications = this.getApplications();
    return applications.find(app => app.id === id);
  }

  static updateApplication(application: Application): void {
    const applications = this.getApplications();
    const index = applications.findIndex(app => app.id === application.id);
    
    if (index >= 0) {
      applications[index] = { ...application, updatedAt: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.APPLICATIONS, applications);
    }
  }

  /**
   * Update application status with System trigger support
   * This method should be used for admin status changes that might trigger System events
   */
  static updateApplicationStatus(
    applicationId: string, 
    newStatus: string, 
    actor: string,
    reason?: string,
    triggeredBy?: string
  ): { success: boolean; message: string; systemTriggered?: boolean } {
    const application = this.getApplication(applicationId);
    if (!application) {
      return { success: false, message: 'Application not found' };
    }

    const previousStatus = application.currentStatus;
    let systemTriggered = false;
    let triggerResult = null;

    // Check if this status change should trigger a System event
    switch (newStatus) {
      case 'documents_approved':
        // When admin approves documents, check if we should auto-approve Stage 1
        if (previousStatus === 'documents_under_review') {
          // Update to documents_approved first
          const updatedApp = {
            ...application,
            currentStatus: 'documents_approved',
            nextAction: 'Continue with application processing',
            nextActor: 'Admin' as const,
            updatedAt: new Date().toISOString(),
            stageHistory: [
              ...(application.stageHistory || []),
              {
                stage: 1,
                status: 'documents_approved',
                timestamp: new Date().toISOString(),
                actor,
                reason: reason || 'Documents approved by admin'
              }
            ]
          };
          this.updateApplication(updatedApp);
          
          // Then trigger Stage 1 final approval
          triggerResult = SystemTriggers.onStage1FinalApproval(applicationId, triggeredBy || actor);
          systemTriggered = triggerResult.success;
        }
        break;

      case 'documents_rejected':
        // When admin rejects documents completely, trigger final rejection
        triggerResult = SystemTriggers.onStage1FinalRejection(applicationId, triggeredBy || actor, reason);
        systemTriggered = triggerResult.success;
        break;

      default:
        // Regular status update without System trigger
        const updatedApp = {
          ...application,
          currentStatus: newStatus,
          updatedAt: new Date().toISOString(),
          stageHistory: [
            ...(application.stageHistory || []),
            {
              stage: application.currentStage,
              status: newStatus,
              timestamp: new Date().toISOString(),
              actor,
              reason: reason || `Status updated by ${actor}`
            }
          ]
        };

        if (reason && (newStatus.includes('rejected') || newStatus.includes('correction'))) {
          updatedApp.rejectionReason = reason;
        }

        this.updateApplication(updatedApp);
        break;
    }

    const message = systemTriggered && triggerResult
      ? `Status updated and System triggered: ${triggerResult.message}`
      : 'Status updated successfully';

    return { 
      success: true, 
      message,
      systemTriggered 
    };
  }

  static addApplication(application: Application): void {
    const applications = this.getApplications();
    applications.push(application);
    this.setItem(STORAGE_KEYS.APPLICATIONS, applications);

    // Trigger System status change when application is submitted
    if (application.currentStatus === 'draft' || application.currentStatus === '') {
      console.log('📝 StorageService: Application submitted, triggering System status change');
      SystemTriggers.onApplicationSubmitted(application.id, 'StorageService');
    }
  }

  static saveApplication(application: Application): void {
    this.addApplication(application);
  }

  // Partners
  static getPartners(): Partner[] {
    return this.getItem<Partner>(STORAGE_KEYS.PARTNERS);
  }

  static getPartner(id: string): Partner | undefined {
    const partners = this.getPartners();
    return partners.find(partner => partner.id === id);
  }

  static savePartner(partner: Partner): void {
    const partners = this.getPartners();
    partners.push(partner);
    this.setItem(STORAGE_KEYS.PARTNERS, partners);
  }

  static updatePartner(partner: Partner): void {
    const partners = this.getPartners();
    const index = partners.findIndex(p => p.id === partner.id);
    if (index >= 0) {
      partners[index] = partner;
      this.setItem(STORAGE_KEYS.PARTNERS, partners);
    }
  }

  // Students
  static getStudents(): Student[] {
    return this.getItem<Student>(STORAGE_KEYS.STUDENTS);
  }

  static getStudent(id: string): Student | undefined {
    const students = this.getStudents();
    return students.find(student => student.id === id);
  }

  static saveStudent(student: Student): void {
    const students = this.getStudents();
    students.push(student);
    this.setItem(STORAGE_KEYS.STUDENTS, students);
  }

  static getStudentByApplication(applicationId: string): Student | undefined {
    const application = this.getApplication(applicationId);
    if (!application) return undefined;
    return this.getStudent(application.studentId);
  }

  // Comments
  static getComments(applicationId: string): Comment[] {
    const comments = this.getItem<Comment>(STORAGE_KEYS.COMMENTS);
    return comments.filter(comment => comment.applicationId === applicationId);
  }

  static addComment(comment: Comment): void {
    const comments = this.getItem<Comment>(STORAGE_KEYS.COMMENTS);
    comments.push(comment);
    this.setItem(STORAGE_KEYS.COMMENTS, comments);
  }

  static deleteComment(commentId: string): void {
    const comments = this.getItem<Comment>(STORAGE_KEYS.COMMENTS);
    const filteredComments = comments.filter(comment => comment.id !== commentId);
    this.setItem(STORAGE_KEYS.COMMENTS, filteredComments);
  }

  // Audit Log
  static getAuditLog(applicationId?: string): AuditLogEntry[] {
    const auditLog = this.getItem<AuditLogEntry>(STORAGE_KEYS.AUDIT_LOG);
    return applicationId 
      ? auditLog.filter(entry => entry.applicationId === applicationId)
      : auditLog;
  }

  static addAuditLogEntry(entry: AuditLogEntry): void {
    const auditLog = this.getItem<AuditLogEntry>(STORAGE_KEYS.AUDIT_LOG);
    auditLog.push(entry);
    this.setItem(STORAGE_KEYS.AUDIT_LOG, auditLog);
  }

  // Dashboard Stats
  static getDashboardStats(partnerId?: string): DashboardStats {
    const applications = this.getApplications(partnerId);
    const auditLog = this.getAuditLog();
    
    const stats: DashboardStats = {
      totalApplications: applications.length,
      pendingReview: applications.filter(app => 
        app.nextActor === 'Admin' && !app.currentStatus.includes('rejected')
      ).length,
      approved: applications.filter(app => 
        app.currentStatus.includes('approved') || 
        app.currentStatus === 'commission_paid'
      ).length,
      rejected: applications.filter(app => 
        app.currentStatus.includes('rejected')
      ).length,
      byStage: applications.reduce((acc, app) => {
        acc[app.currentStage] = (acc[app.currentStage] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      byStatus: applications.reduce((acc, app) => {
        acc[app.currentStatus] = (acc[app.currentStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: auditLog
        .filter(entry => partnerId ? 
          applications.some(app => app.id === entry.applicationId) : true
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10),
    };

    return stats;
  }

  // Search and Filter
  static searchApplications(query: string, partnerId?: string): Application[] {
    const applications = this.getApplications(partnerId);
    const students = this.getStudents();
    const partners = this.getPartners();

    if (!query.trim()) return applications;

    const searchTerm = query.toLowerCase();
    
    return applications.filter(app => {
      const student = students.find(s => s.id === app.studentId);
      const partner = partners.find(p => p.id === app.partnerId);
      
      return (
        app.id.toLowerCase().includes(searchTerm) ||
        app.program.toLowerCase().includes(searchTerm) ||
        app.university.toLowerCase().includes(searchTerm) ||
        app.currentStatus.toLowerCase().includes(searchTerm) ||
        student?.firstName.toLowerCase().includes(searchTerm) ||
        student?.lastName.toLowerCase().includes(searchTerm) ||
        student?.email.toLowerCase().includes(searchTerm) ||
        partner?.name.toLowerCase().includes(searchTerm)
      );
    });
  }

  static filterApplications(
    applications: Application[],
    filters: {
      status?: string;
      stage?: number;
      partner?: string;
      priority?: string;
      dateRange?: { start: string; end: string };
    }
  ): Application[] {
    return applications.filter(app => {
      if (filters.status && app.currentStatus !== filters.status) return false;
      if (filters.stage && app.currentStage !== filters.stage) return false;
      if (filters.partner && app.partnerId !== filters.partner) return false;
      if (filters.priority && app.priority !== filters.priority) return false;
      
      if (filters.dateRange) {
        const appDate = new Date(app.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (appDate < startDate || appDate > endDate) return false;
      }
      
      return true;
    });
  }

  // Utility functions
  static generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`;
  }

  static addAuditEntry(
    applicationId: string,
    event: string,
    action: string,
    actor: string,
    actorRole: 'admin' | 'partner' | 'university' | 'immigration',
    previousStatus?: string,
    newStatus?: string,
    details?: Record<string, unknown>
  ): void {
    const entry: AuditLogEntry = {
      id: this.generateId('AUDIT'),
      applicationId,
      event,
      action,
      actor,
      actorRole,
      timestamp: new Date().toISOString(),
      previousStatus,
      newStatus,
      details,
    };
    
    this.addAuditLogEntry(entry);
  }

  // Document management
  static getDocuments(applicationId?: string): Document[] {
    const documents = this.getItem<Document>(STORAGE_KEYS.DOCUMENTS);
    if (applicationId) {
      return documents.filter(doc => doc.applicationId === applicationId);
    }
    return documents;
  }

  static getDocument(documentId: string): Document | null {
    const documents = this.getDocuments();
    return documents.find(doc => doc.id === documentId) || null;
  }

  static addDocument(document: Document): void {
    const documents = this.getDocuments();
    documents.push(document);
    this.setItem(STORAGE_KEYS.DOCUMENTS, documents);

    // Trigger System status change based on document upload
    console.log('📄 StorageService: Document uploaded, checking for status trigger');
    const result = SystemTriggers.onDocumentUpload(document.applicationId, 'StorageService');
    if (result.success) {
      console.log(`🚀 System triggered: ${result.previousStatus} → ${result.newStatus}`);
    } else {
      console.log(`⚠️ System trigger failed: ${result.message}`);
    }
  }

  static updateDocument(document: Document): void {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === document.id);
    if (index !== -1) {
      documents[index] = document;
      this.setItem(STORAGE_KEYS.DOCUMENTS, documents);

      // Trigger System status change when document is approved/updated
      if (document.status === 'approved') {
        console.log('✅ StorageService: Document approved, checking for status trigger');
        const result = SystemTriggers.onDocumentUpload(document.applicationId, 'StorageService');
        if (result.success) {
          console.log(`🚀 System triggered: ${result.previousStatus} → ${result.newStatus}`);
        } else {
          console.log(`⚠️ System trigger failed: ${result.message}`);
        }
      }
    }
  }

  // Document Request management
  static getDocumentRequests(applicationId?: string): DocumentRequest[] {
    const requests = this.getItem<DocumentRequest>(STORAGE_KEYS.DOCUMENT_REQUESTS);
    if (applicationId) {
      return requests.filter(req => req.applicationId === applicationId);
    }
    return requests;
  }

  static getDocumentRequest(requestId: string): DocumentRequest | null {
    const requests = this.getDocumentRequests();
    return requests.find(req => req.id === requestId) || null;
  }

  static addDocumentRequest(request: DocumentRequest): void {
    const requests = this.getDocumentRequests();
    requests.push(request);
    this.setItem(STORAGE_KEYS.DOCUMENT_REQUESTS, requests);
  }

  static updateDocumentRequest(request: DocumentRequest): void {
    const requests = this.getDocumentRequests();
    const index = requests.findIndex(r => r.id === request.id);
    if (index !== -1) {
      requests[index] = request;
      this.setItem(STORAGE_KEYS.DOCUMENT_REQUESTS, requests);
    }
  }

  static getActiveDocumentRequest(applicationId: string): DocumentRequest | null {
    const requests = this.getDocumentRequests(applicationId);
    // Return the most recent pending or partially submitted request
    return requests
      .filter(r => r.status === 'pending' || r.status === 'partially_submitted' || r.status === 'submitted')
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0] || null;
  }

  // Universities
  static getUniversities(): University[] {
    return this.getItem<University>(STORAGE_KEYS.UNIVERSITIES);
  }

  static getUniversity(id: string): University | undefined {
    const universities = this.getUniversities();
    return universities.find(uni => uni.id === id);
  }

  static saveUniversity(university: University): void {
    const universities = this.getUniversities();
    universities.push(university);
    this.setItem(STORAGE_KEYS.UNIVERSITIES, universities);
  }

  static updateUniversity(university: University): void {
    const universities = this.getUniversities();
    const index = universities.findIndex(u => u.id === university.id);
    if (index >= 0) {
      universities[index] = university;
      this.setItem(STORAGE_KEYS.UNIVERSITIES, universities);
    }
  }

  static deleteUniversity(id: string): void {
    const universities = this.getUniversities();
    const filtered = universities.filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.UNIVERSITIES, filtered);
    
    // Also delete related colleges and programs
    const colleges = this.getColleges().filter(c => c.universityId !== id);
    this.setItem(STORAGE_KEYS.COLLEGES, colleges);
    
    const programs = this.getPrograms().filter(p => p.universityId !== id);
    this.setItem(STORAGE_KEYS.PROGRAMS, programs);
  }

  // Colleges
  static getColleges(universityId?: string): College[] {
    const colleges = this.getItem<College>(STORAGE_KEYS.COLLEGES);
    if (universityId) {
      return colleges.filter(college => college.universityId === universityId);
    }
    return colleges;
  }

  static getCollege(id: string): College | undefined {
    const colleges = this.getColleges();
    return colleges.find(college => college.id === id);
  }

  static saveCollege(college: College): void {
    const colleges = this.getColleges();
    colleges.push(college);
    this.setItem(STORAGE_KEYS.COLLEGES, colleges);
  }

  static updateCollege(college: College): void {
    const colleges = this.getColleges();
    const index = colleges.findIndex(c => c.id === college.id);
    if (index >= 0) {
      colleges[index] = college;
      this.setItem(STORAGE_KEYS.COLLEGES, colleges);
    }
  }

  static deleteCollege(id: string): void {
    const colleges = this.getColleges();
    const filtered = colleges.filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.COLLEGES, filtered);
    
    // Also delete related programs
    const programs = this.getPrograms().filter(p => p.collegeId !== id);
    this.setItem(STORAGE_KEYS.PROGRAMS, programs);
  }

  // Programs
  static getPrograms(universityId?: string, collegeId?: string): Program[] {
    const programs = this.getItem<Program>(STORAGE_KEYS.PROGRAMS);
    if (universityId && collegeId) {
      return programs.filter(p => p.universityId === universityId && p.collegeId === collegeId);
    } else if (universityId) {
      return programs.filter(p => p.universityId === universityId);
    }
    return programs;
  }

  static getProgram(id: string): Program | undefined {
    const programs = this.getPrograms();
    return programs.find(program => program.id === id);
  }

  static saveProgram(program: Program): void {
    const programs = this.getPrograms();
    programs.push(program);
    this.setItem(STORAGE_KEYS.PROGRAMS, programs);
  }

  static updateProgram(program: Program): void {
    const programs = this.getPrograms();
    const index = programs.findIndex(p => p.id === program.id);
    if (index >= 0) {
      programs[index] = program;
      this.setItem(STORAGE_KEYS.PROGRAMS, programs);
    }
  }

  static deleteProgram(id: string): void {
    const programs = this.getPrograms();
    const filtered = programs.filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROGRAMS, filtered);
  }

  static searchPrograms(query: string): Program[] {
    const programs = this.getPrograms();
    const universities = this.getUniversities();
    
    if (!query.trim()) return programs;
    
    const searchTerm = query.toLowerCase();
    
    return programs.filter(program => {
      const university = universities.find(u => u.id === program.universityId);
      
      return (
        program.name.toLowerCase().includes(searchTerm) ||
        university?.name.toLowerCase().includes(searchTerm) ||
        program.duration.toLowerCase().includes(searchTerm) ||
        program.requirements?.some(req => req.toLowerCase().includes(searchTerm)) ||
        program.intakes.some(intake => intake.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Service Providers
  static getServiceProviders(type?: string): ServiceProvider[] {
    const services = this.getItem<ServiceProvider>(STORAGE_KEYS.SERVICES);
    if (type) {
      return services.filter(service => service.type === type);
    }
    return services;
  }

  static getServiceProvider(id: string): ServiceProvider | undefined {
    const services = this.getServiceProviders();
    return services.find(service => service.id === id);
  }

  static saveServiceProvider(service: ServiceProvider): void {
    const services = this.getServiceProviders();
    services.push(service);
    this.setItem(STORAGE_KEYS.SERVICES, services);
  }

  static updateServiceProvider(service: ServiceProvider): void {
    const services = this.getServiceProviders();
    const index = services.findIndex(s => s.id === service.id);
    if (index >= 0) {
      services[index] = service;
      this.setItem(STORAGE_KEYS.SERVICES, services);
    }
  }

  static deleteServiceProvider(id: string): void {
    const services = this.getServiceProviders();
    const filtered = services.filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SERVICES, filtered);
  }

  // Logistics Partners CRUD
  static getLogisticsPartners(): LogisticsPartner[] {
    return this.getItem<LogisticsPartner>(STORAGE_KEYS.LOGISTICS_PARTNERS);
  }

  static getLogisticsPartner(id: string): LogisticsPartner | undefined {
    const partners = this.getLogisticsPartners();
    return partners.find(partner => partner.id === id);
  }

  static saveLogisticsPartner(partner: LogisticsPartner): void {
    const partners = this.getLogisticsPartners();
    partners.push(partner);
    this.setItem(STORAGE_KEYS.LOGISTICS_PARTNERS, partners);
  }

  static updateLogisticsPartner(partner: LogisticsPartner): void {
    const partners = this.getLogisticsPartners();
    const index = partners.findIndex(p => p.id === partner.id);
    if (index >= 0) {
      partners[index] = partner;
      this.setItem(STORAGE_KEYS.LOGISTICS_PARTNERS, partners);
    }
  }

  static deleteLogisticsPartner(id: string): void {
    const partners = this.getLogisticsPartners();
    const filtered = partners.filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.LOGISTICS_PARTNERS, filtered);
  }


  // Analytics methods
  static getPartnerAnalytics(): PartnerAnalytics {
    const partners = this.getPartners();
    return {
      total: partners.length,
      pending: partners.filter(p => p.status === 'pending').length,
      approved: partners.filter(p => p.status === 'approved').length,
      rejected: partners.filter(p => p.status === 'rejected').length,
    };
  }

  static getStudentAnalytics(): StudentAnalytics {
    const students = this.getStudents();
    const applications = this.getApplications();
    const activeStudents = new Set(applications.map(app => app.studentId));
    const countries = new Set(students.map(s => s.nationality));
    const programs = new Set(applications.map(app => app.program));

    return {
      total: students.length,
      active: activeStudents.size,
      countries: countries.size,
      programs: programs.size,
    };
  }

  static getUniversityAnalytics(): UniversityAnalytics {
    const universities = this.getUniversities();
    const colleges = this.getColleges();
    const programs = this.getPrograms();
    const countries = new Set(universities.map(u => u.country));

    return {
      totalUniversities: universities.length,
      totalColleges: colleges.length,
      totalPrograms: programs.length,
      countries: countries.size,
    };
  }

  static getServiceAnalytics(): ServiceAnalytics {
    const services = this.getServiceProviders();
    const byType = services.reduce((acc, service) => {
      acc[service.type] = (acc[service.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: services.length,
      byType,
    };
  }

  // Clear all data
  static clearAllData(): void {
    console.log('🗑️ Clearing all data from localStorage...');
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✅ All data cleared successfully');
  }
}
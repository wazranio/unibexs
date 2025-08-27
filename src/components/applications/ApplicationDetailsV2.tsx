'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import Sidebar from '@/components/layout/Sidebar';
import { Application, Student, Partner, Comment, DocumentRequest } from '@/types';
import {
  ArrowLeft,
  Settings,
  Bell,
  Search,
  Filter,
} from 'lucide-react';

// Import new sub-components
import StatusHeroCard from './StatusHeroCard';
import InteractiveTimeline from './InteractiveTimeline';
import DocumentGrid from './DocumentGrid';
import FloatingActionPanel from './FloatingActionPanel';
import SmartSidebar from './SmartSidebar';
import CommentThread from './CommentThread';

interface ApplicationDetailsV2Props {
  applicationId?: string;
  application?: Application;
  student?: Student;
  partner?: Partner;
  isAdmin: boolean;
}

const ApplicationDetailsV2: React.FC<ApplicationDetailsV2Props> = ({ 
  applicationId, 
  application: initialApplication, 
  student: initialStudent, 
  partner: initialPartner, 
  isAdmin 
}) => {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(initialApplication || null);
  const [student, setStudent] = useState<Student | null>(initialStudent || null);
  const [partner, setPartner] = useState<Partner | null>(initialPartner || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [documentRequest, setDocumentRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(!initialApplication);
  
  // UI State
  const [selectedSection, setSelectedSection] = useState<'overview' | 'timeline' | 'documents' | 'activity'>('overview');
  const [showComments, setShowComments] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = AuthService.getCurrentUser();

  const loadApplicationData = useCallback(() => {
    if (initialApplication && initialStudent && initialPartner) {
      const commentsData = StorageService.getComments(initialApplication.id);
      const activeDocRequest = StorageService.getActiveDocumentRequest(initialApplication.id);
      
      setApplication(initialApplication);
      setStudent(initialStudent);
      setPartner(initialPartner);
      setComments(commentsData);
      setDocumentRequest(activeDocRequest);
      setLoading(false);
      return;
    }

    if (!applicationId) {
      setLoading(false);
      return;
    }

    try {
      const app = StorageService.getApplication(applicationId);
      if (!app) {
        router.push(isAdmin ? '/admin/applications' : '/partner/applications');
        return;
      }

      if (!isAdmin && currentUser?.partnerId !== app.partnerId) {
        router.push('/partner/applications');
        return;
      }

      const studentData = StorageService.getStudent(app.studentId);
      const partnerData = StorageService.getPartner(app.partnerId);
      const commentsData = StorageService.getComments(applicationId);
      const activeDocRequest = StorageService.getActiveDocumentRequest(applicationId);

      setApplication(app);
      setStudent(studentData || null);
      setPartner(partnerData || null);
      setComments(commentsData);
      setDocumentRequest(activeDocRequest);
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId, initialApplication, initialStudent, initialPartner, isAdmin, currentUser?.partnerId, router]);

  useEffect(() => {
    loadApplicationData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('application_') || e.key?.includes('appleaction_')) {
        loadApplicationData();
      }
    };

    const handleApplicationUpdate = (e: CustomEvent) => {
      const { applicationId: updatedAppId, force } = e.detail || {};
      const currentAppId = applicationId || initialApplication?.id;
      if (!updatedAppId || updatedAppId === currentAppId || force) {
        loadApplicationData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('applicationUpdated', handleApplicationUpdate as EventListener);
    };
  }, [applicationId, initialApplication?.id, loadApplicationData]);

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplication(updatedApplication);
    loadApplicationData();
  };

  const handleNewComment = (comment: Comment) => {
    setComments([...comments, comment]);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-indigo-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application || !student) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent mb-3">
              Application Not Found
            </h2>
            <p className="text-slate-600 mb-6 max-w-md">
              The requested application could not be found or you don&apos;t have permission to view it.
            </p>
            <Link
              href={isAdmin ? '/admin/applications' : '/partner/applications'}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300">
      <Sidebar isAdmin={isAdmin} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Breadcrumb and Title */}
              <div className="flex items-center space-x-4">
                <Link
                  href={isAdmin ? '/admin/applications' : '/partner/applications'}
                  className="flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Applications</span>
                </Link>
                <div className="text-slate-300">•</div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {application.id}
                  </h1>
                  <p className="text-sm text-slate-500">{student.firstName} {student.lastName}</p>
                </div>
              </div>

              {/* Right: Search and Actions */}
              <div className="flex items-center space-x-3">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search in application..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-all duration-200 ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-white/60 text-slate-600 hover:bg-white/80'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 bg-white/60 hover:bg-white/80 text-slate-600 rounded-xl transition-all duration-200">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button className="p-2 bg-white/60 hover:bg-white/80 text-slate-600 rounded-xl transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>

                {/* Comments Toggle */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${showComments ? 'bg-blue-600 text-white' : 'bg-white/60 text-slate-600 hover:bg-white/80'}`}
                >
                  Comments ({comments.length})
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Hero Card */}
            <StatusHeroCard 
              application={application}
              student={student}
              partner={partner}
              documentRequest={documentRequest}
              isAdmin={isAdmin}
              onUpdate={handleApplicationUpdate}
            />

            {/* Section Navigation */}
            <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'timeline', label: 'Timeline' },
                { key: 'documents', label: 'Documents' },
                { key: 'activity', label: 'Activity' },
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => setSelectedSection(section.key as typeof selectedSection)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    selectedSection === section.key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content Based on Selected Section */}
            <div className="transition-all duration-300">
              {selectedSection === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Overview Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Application Summary Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Application Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Program</label>
                            <p className="text-slate-800 font-medium">{application.program}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">University</label>
                            <p className="text-slate-800 font-medium">{application.university}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Intake Date</label>
                            <p className="text-slate-800 font-medium">{application.intakeDate ? new Date(application.intakeDate).toLocaleDateString() : 'TBD'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tuition Fee</label>
                            <p className="text-green-600 font-semibold">${application.tuitionFee?.toLocaleString() || 'TBD'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student Information Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                            <p className="text-slate-800 font-medium">{student.firstName} {student.lastName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                            <p className="text-slate-800">{student.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                            <p className="text-slate-800">{student.phone}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Nationality</label>
                            <p className="text-slate-800 font-medium">{student.nationality}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Passport</label>
                            <p className="text-slate-800">{student.passportNumber}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                            <p className="text-slate-800">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    <SmartSidebar 
                      student={student}
                      partner={partner}
                      application={application}
                      collapsed={sidebarCollapsed}
                      onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                  </div>
                </div>
              )}

              {selectedSection === 'timeline' && (
                <InteractiveTimeline 
                  application={application}
                  isAdmin={isAdmin}
                />
              )}

              {selectedSection === 'documents' && (
                <DocumentGrid
                  application={application}
                  isAdmin={isAdmin}
                  searchQuery={searchQuery}
                  onUpdate={handleApplicationUpdate}
                />
              )}

              {selectedSection === 'activity' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Feed</h3>
                  <div className="space-y-4">
                    {application.stageHistory && application.stageHistory.length > 0 ? (
                      application.stageHistory.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium">{entry.status?.replace(/_/g, ' ') || 'Status update'}</p>
                            <p className="text-sm text-slate-600">By {entry.actor || 'System'} • {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown time'}</p>
                            {entry.notes && <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No activity yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Right Panel - Comments */}
          {showComments && (
            <div className="w-80 bg-white/90 backdrop-blur-md border-l border-white/20 shadow-xl">
              <CommentThread
                comments={comments}
                application={application}
                onNewComment={handleNewComment}
                onClose={() => setShowComments(false)}
              />
            </div>
          )}
        </div>

        {/* Floating Action Panel */}
        <FloatingActionPanel 
          application={application}
          isAdmin={isAdmin}
          onUpdate={handleApplicationUpdate}
        />
      </div>
    </div>
  );
};

export default ApplicationDetailsV2;
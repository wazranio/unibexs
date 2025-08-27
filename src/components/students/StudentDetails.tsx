'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Student, Application, Document } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  GraduationCap,
  Globe,
  Edit,
  Download,
  Award,
  Users,
  IdCard,
  Home,
  Languages,
  Star,
} from 'lucide-react';

interface StudentDetailsProps {
  student: Student;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    const loadStudentData = () => {
      try {
        // Get all applications for this student
        const allApplications = StorageService.getApplications();
        const studentApplications = allApplications.filter(app => app.studentId === student.id);
        
        // Get all documents from those applications
        const allDocuments = StorageService.getDocuments();
        const studentApplicationIds = new Set(studentApplications.map(app => app.id));
        const studentDocuments = allDocuments.filter(doc => studentApplicationIds.has(doc.applicationId));
        
        setApplications(studentApplications);
        setDocuments(studentDocuments);
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [student.id]);

  const getStatusColor = (status: string) => {
    if (status.includes('approved') || status === 'commission_paid') {
      return 'text-green-300 bg-green-900 border-green-700';
    } else if (status.includes('rejected') || status.includes('cancelled')) {
      return 'text-red-300 bg-red-900 border-red-700';
    } else {
      return 'text-yellow-300 bg-yellow-900 border-yellow-700';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('approved') || status === 'commission_paid') {
      return <CheckCircle className="w-4 h-4 mr-1" />;
    } else if (status.includes('rejected') || status.includes('cancelled')) {
      return <XCircle className="w-4 h-4 mr-1" />;
    } else {
      return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getApplicationsStats = () => {
    const total = applications.length;
    const approved = applications.filter(app => 
      app.currentStatus.includes('approved') || 
      app.currentStatus === 'commission_paid'
    ).length;
    const rejected = applications.filter(app => 
      app.currentStatus.includes('rejected') || 
      app.currentStatus.includes('cancelled')
    ).length;
    const pending = total - approved - rejected;
    
    return { total, approved, rejected, pending };
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const approved = documents.filter(doc => doc.status === 'approved').length;
    const pending = documents.filter(doc => doc.status === 'pending').length;
    const rejected = documents.filter(doc => doc.status === 'rejected').length;
    
    return { total, approved, pending, rejected };
  };

  const stats = getApplicationsStats();
  const docStats = getDocumentStats();

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/admin/students"
                  className="flex items-center text-gray-400 hover:text-gray-200 transition-colors mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Students
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Student Details</h1>
                  <p className="text-gray-300">
                    Comprehensive profile for {student.firstName} {student.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Student Profile Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mr-6 border border-gray-600">
                    <User className="w-10 h-10 text-gray-300" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {student.firstName} {student.lastName}
                    </h2>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{student.nationality}</span>
                      </div>
                      {student.dateOfBirth && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-300">
                            Age {calculateAge(student.dateOfBirth)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <IdCard className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{student.passportNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">
                          Registered {formatDate(student.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-600 p-3 rounded-lg mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Total Applications</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-green-600 p-3 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-white">{stats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-600 p-3 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="bg-purple-600 p-3 rounded-lg mr-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Documents</p>
                    <p className="text-2xl font-bold text-white">{docStats.total}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-white">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white">{student.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    {student.dateOfBirth && (
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Date of Birth</p>
                          <p className="text-white">
                            {formatDate(student.dateOfBirth)} (Age {calculateAge(student.dateOfBirth)})
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {student.address && (
                      <div className="flex items-start">
                        <Home className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Address</p>
                          <p className="text-white">{student.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {student.emergencyContact && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Name</p>
                          <p className="text-white">{student.emergencyContact.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white">{student.emergencyContact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Relationship</p>
                          <p className="text-white">{student.emergencyContact.relationship}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* English Proficiency */}
                {student.englishProficiency && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">English Proficiency</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Languages className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Test Type</p>
                          <p className="text-white font-medium">{student.englishProficiency.testType}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Score</p>
                          <p className="text-white font-medium">{student.englishProficiency.score}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Test Date</p>
                          <p className="text-white">{formatDate(student.englishProficiency.testDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Academic History */}
                {student.academicHistory && student.academicHistory.length > 0 && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Academic History</h3>
                    <div className="space-y-4">
                      {student.academicHistory.map((education, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-start">
                            <GraduationCap className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{education.degree}</h4>
                              <p className="text-sm text-gray-300">{education.institution}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400">
                                  {education.startYear} - {education.endYear}
                                </p>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700">
                                  GPA: {education.gpa}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications Timeline */}
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Applications</h3>
                      <Link
                        href="/admin/applications"
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-300">No Applications</h3>
                        <p className="text-sm text-gray-400">This student hasn&apos;t submitted any applications yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 5).map((application) => (
                          <div key={application.id} className="border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-white font-medium">{application.program}</h4>
                                <p className="text-sm text-gray-300">{application.university}</p>
                                <p className="text-xs text-gray-400">
                                  Intake: {formatDate(application.intakeDate)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.currentStatus)}`}>
                                  {getStatusIcon(application.currentStatus)}
                                  Stage {application.currentStage}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(application.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Priority: <span className="capitalize">{application.priority}</span>
                              </span>
                              <Link
                                href={`/admin/applications/${application.id}`}
                                className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        ))}
                        {applications.length > 5 && (
                          <div className="text-center pt-4">
                            <Link
                              href="/admin/applications"
                              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                              View {applications.length - 5} more applications →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Documents Library</h3>
                  </div>
                  <div className="p-6">
                    {docStats.total === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-300">No Documents</h3>
                        <p className="text-sm text-gray-400">Documents will appear here when uploaded.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{docStats.approved}</p>
                          <p className="text-xs text-gray-400">Approved</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-6 h-6 text-yellow-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{docStats.pending}</p>
                          <p className="text-xs text-gray-400">Pending</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <XCircle className="w-6 h-6 text-red-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{docStats.rejected}</p>
                          <p className="text-xs text-gray-400">Rejected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDetails;
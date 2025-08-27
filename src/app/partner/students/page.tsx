'use client';

import React, { useState, useEffect } from 'react';
import { Student, Application } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  GraduationCap,
  Users,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
} from 'lucide-react';

const PartnerStudentsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!user || isAdmin) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  useEffect(() => {
    filterStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, searchQuery, selectedNationality]);

  const loadData = () => {
    try {
      // Get all applications for this partner
      const partnerId = user?.partnerId;
      if (!partnerId) return;

      const allApplications = StorageService.getApplications();
      const partnerApplications = allApplications.filter(app => app.partnerId === partnerId);
      
      // Get students from those applications
      const allStudents = StorageService.getStudents();
      const partnerStudentIds = new Set(partnerApplications.map(app => app.studentId));
      const partnerStudents = allStudents.filter(student => partnerStudentIds.has(student.id));
      
      setStudents(partnerStudents);
      setApplications(partnerApplications);
    } catch (error) {
      console.error('Error loading students data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.nationality.toLowerCase().includes(searchTerm) ||
        student.passportNumber.toLowerCase().includes(searchTerm)
      );
    }

    // Nationality filter
    if (selectedNationality) {
      filtered = filtered.filter(student => student.nationality === selectedNationality);
    }

    setFilteredStudents(filtered);
  };

  const getStudentApplications = (studentId: string) => {
    return applications.filter(app => app.studentId === studentId);
  };

  const getUniqueNationalities = () => {
    return Array.from(new Set(students.map(s => s.nationality))).sort();
  };

  if (!user || isAdmin) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">This page is only accessible to partner users.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">My Students</h1>
                <p className="text-gray-300">
                  Students from your submitted applications ({filteredStudents.length} total)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-900 px-3 py-2 rounded-lg border border-blue-700">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-300">{students.length} students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or passport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedNationality}
                onChange={(e) => setSelectedNationality(e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Nationalities</option>
                {getUniqueNationalities().map(nationality => (
                  <option key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">No students found</h3>
                <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => {
                    const studentApplications = getStudentApplications(student.id);
                    return (
                      <div key={student.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-lg font-semibold text-white">
                                {student.firstName} {student.lastName}
                              </h3>
                              <div className="flex items-center text-sm text-gray-300">
                                <MapPin className="w-4 h-4 mr-1" />
                                {student.nationality}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <Mail className="w-4 h-4 mr-2" />
                            {student.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Phone className="w-4 h-4 mr-2" />
                            {student.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <FileText className="w-4 h-4 mr-2" />
                            Passport: {student.passportNumber}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                            Applications ({studentApplications.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {studentApplications.slice(0, 2).map((app) => (
                              <span
                                key={app.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200"
                              >
                                Stage {app.currentStage}
                              </span>
                            ))}
                            {studentApplications.length > 2 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                +{studentApplications.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            Registered: {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Student Details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Student Header */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h3>
                    <div className="flex items-center text-gray-300 mt-1">
                      <MapPin className="w-5 h-5 mr-1" />
                      <span>{selectedStudent.nationality}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Email</span>
                  </div>
                  <p className="text-white">{selectedStudent.email}</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Phone</span>
                  </div>
                  <p className="text-white">{selectedStudent.phone}</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Passport Number</span>
                  </div>
                  <p className="text-white">{selectedStudent.passportNumber}</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Registered</span>
                  </div>
                  <p className="text-white">
                    {new Date(selectedStudent.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Applications */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Applications ({getStudentApplications(selectedStudent.id).length})
                </h4>
                <div className="space-y-4">
                  {getStudentApplications(selectedStudent.id).map((application) => (
                    <div key={application.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-white">{application.program}</h5>
                          <p className="text-sm text-gray-300">{application.university}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900 text-indigo-200">
                            Stage {application.currentStage}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className="ml-2 text-white">{application.currentStatus}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Intake:</span>
                          <span className="ml-2 text-white">{application.intakeDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact (if available) */}
              {selectedStudent.emergencyContact && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Emergency Contact</h4>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Name:</span>
                        <p className="text-white">{selectedStudent.emergencyContact.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Phone:</span>
                        <p className="text-white">{selectedStudent.emergencyContact.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Relationship:</span>
                        <p className="text-white">{selectedStudent.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PartnerStudentsPage;
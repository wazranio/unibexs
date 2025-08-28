'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Student } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  Download,
  Eye,
  User,
  GraduationCap,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
} from 'lucide-react';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  // const [applications, setApplications] = useState<Application[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    nationality: '',
    applicationCount: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'nationality' | 'applications'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    const loadData = () => {
      try {
        const studentsData = StorageService.getStudents();
        // const applicationsData = StorageService.getApplications();
        setStudents(studentsData);
        // setApplications(applicationsData);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('unibexs_students') || e.key?.includes('unibexs_applications')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    let filtered = [...students];

    // Apply search
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

    // Apply filters
    if (filters.nationality) {
      filtered = filtered.filter(student => student.nationality === filters.nationality);
    }
    if (filters.applicationCount) {
      filtered = filtered.filter(student => {
        const count = student.applicationIds.length;
        switch (filters.applicationCount) {
          case 'none': return count === 0;
          case 'single': return count === 1;
          case 'multiple': return count > 1;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'nationality':
          aValue = a.nationality.toLowerCase();
          bValue = b.nationality.toLowerCase();
          break;
        case 'applications':
          aValue = a.applicationIds.length;
          bValue = b.applicationIds.length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStudents(filtered);
  }, [students, searchQuery, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ nationality: '', applicationCount: '' });
    setSearchQuery('');
  };

  const handleSort = (field: 'date' | 'name' | 'nationality' | 'applications') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // const getStudentApplications = (studentId: string) => {
  //   return applications.filter(app => app.studentId === studentId);
  // };

  const getApplicationCountBadge = (count: number) => {
    if (count === 0) return 'bg-gray-900 text-gray-300 border-gray-700';
    if (count === 1) return 'bg-blue-900 text-blue-300 border-blue-700';
    return 'bg-green-900 text-green-300 border-green-700';
  };

  // Get unique values for filter dropdowns
  const uniqueNationalities = Array.from(new Set(students.map(s => s.nationality))).sort();

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map(student => student.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const clearSelections = () => {
    setSelectedStudents([]);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Students</h1>
                <p className="text-gray-300">
                  Manage student profiles and application history ({filteredStudents.length} total)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedStudents.length > 0 && (
                  <div className="flex items-center space-x-2 bg-blue-900 px-3 py-2 rounded-lg border border-blue-700">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">
                      {selectedStudents.length} selected
                    </span>
                    <button
                      onClick={clearSelections}
                      className="ml-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 mr-1 inline" />
                      Clear
                    </button>
                  </div>
                )}
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
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
                  placeholder="Search students by name, email, nationality, or passport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filters.nationality}
                onChange={(e) => handleFilterChange('nationality', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Nationalities</option>
                {uniqueNationalities.map(nationality => (
                  <option key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>

              <select
                value={filters.applicationCount}
                onChange={(e) => handleFilterChange('applicationCount', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Applications</option>
                <option value="none">No Applications</option>
                <option value="single">Single Application</option>
                <option value="multiple">Multiple Applications</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {paginatedStudents.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <GraduationCap className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No students found</h3>
                  <p className="text-gray-500">
                    {students.length === 0 
                      ? 'Students will appear here when applications are created.' 
                      : 'Try adjusting your search or filters.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800">
                <table className="min-w-full">
                  <thead className="bg-gray-750 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Student
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('nationality')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Nationality
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Passport
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('applications')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Applications
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('date')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Registered
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedStudents.map((student) => {
                      const isSelected = selectedStudents.includes(student.id);
                      const applicationCount = student.applicationIds.length;
                      
                      return (
                        <tr
                          key={student.id}
                          className={`${
                            isSelected
                              ? 'bg-blue-900/30 border-l-4 border-blue-500'
                              : 'hover:bg-gray-700'
                          } transition-colors`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectStudent(student.id)}
                              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                  <User className="h-5 w-5 text-gray-300" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {student.nationality}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{student.email}</div>
                            <div className="text-sm text-gray-400">{student.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {student.passportNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getApplicationCountBadge(applicationCount)}`}>
                              {applicationCount} application{applicationCount !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {formatDate(student.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/admin/students/${student.id}`}
                                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing <span className="font-medium text-white">{startIndex + 1}</span> to{' '}
                      <span className="font-medium text-white">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                      <span className="font-medium text-white">{filteredStudents.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-600 border-blue-600 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
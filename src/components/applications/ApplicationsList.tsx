'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import { WorkflowService } from '@/lib/workflow';
import { getStageName } from '@/lib/utils';
import { getStatusMessage } from '@/lib/utils/status-messages';
import Sidebar from '@/components/layout/Sidebar';
import BulkStatusUpdateModal from '@/components/workflow/BulkStatusUpdateModal';
import { Application, Student, Partner } from '@/types';
import {
  Search,
  Download,
  Eye,
  Edit,
  User,
  Building2,
  Calendar,
  Tag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Users,
  Settings,
  Trash2,
  Pause,
  X,
} from 'lucide-react';

interface ApplicationsListProps {
  isAdmin: boolean;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ isAdmin }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    stage: '',
    partner: '',
    priority: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'stage' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        const partnerId = currentUser?.partnerId;
        console.log('[ApplicationsList] Loading data for:', { isAdmin, partnerId, currentUser });
        
        const allApps = StorageService.getApplications();
        console.log('[ApplicationsList] All applications in storage:', allApps);
        console.log('[ApplicationsList] Application partnerIds:', allApps.map(app => ({ id: app.id, partnerId: app.partnerId })));
        
        // Show first application details for debugging
        if (allApps.length > 0) {
          console.log('[ApplicationsList] First application details:', {
            id: allApps[0].id,
            partnerId: allApps[0].partnerId,
            partnerIdType: typeof allApps[0].partnerId,
            partnerIdLength: allApps[0].partnerId?.length
          });
          console.log('[ApplicationsList] Looking for partnerId:', {
            value: partnerId,
            type: typeof partnerId,
            length: partnerId?.length
          });
          console.log('[ApplicationsList] partnerId comparison:', allApps[0].partnerId === partnerId);
        }
        
        const apps = isAdmin 
          ? allApps 
          : StorageService.getApplications(partnerId);
          
        console.log('[ApplicationsList] Filtered applications:', apps);
        console.log('[ApplicationsList] Filter used partnerId:', partnerId);
        
        const studentsData = StorageService.getStudents();
        const partnersData = StorageService.getPartners();

        setApplications(apps);
        setStudents(studentsData);
        setPartners(partnersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('appleaction_')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAdmin]);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    const partnerId = currentUser?.partnerId;
    let filtered = [...applications];

    // Apply search
    if (searchQuery.trim()) {
      filtered = StorageService.searchApplications(
        searchQuery, 
        isAdmin ? undefined : partnerId
      );
    }

    // Apply filters
    filtered = StorageService.filterApplications(filtered, {
      status: filters.status || undefined,
      stage: filters.stage ? parseInt(filters.stage) : undefined,
      partner: filters.partner || undefined,
      priority: filters.priority || undefined,
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'status':
          aValue = a.currentStatus;
          bValue = b.currentStatus;
          break;
        case 'stage':
          aValue = a.currentStage;
          bValue = b.currentStage;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    setFilteredApplications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applications, searchQuery, filters, sortBy, sortOrder, isAdmin]);



  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', stage: '', partner: '', priority: '' });
    setSearchQuery('');
  };

  const handleSort = (field: 'date' | 'status' | 'stage' | 'priority') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'application_cancelled') return 'text-red-300 bg-red-900 border-red-700';
    if (status === 'application_on_hold') return 'text-yellow-300 bg-yellow-900 border-yellow-700';
    if (status.includes('rejected')) return 'text-red-300 bg-red-900 border-red-700';
    if (status.includes('approved') || status === 'commission_paid') return 'text-green-300 bg-green-900 border-green-700';
    if (status.includes('waiting') || status.includes('pending')) return 'text-yellow-300 bg-yellow-900 border-yellow-700';
    return 'text-blue-300 bg-blue-900 border-blue-700';
  };

  const getRowStyling = (app: Application, isSelected: boolean) => {
    if (app.currentStatus === 'application_on_hold') {
      return isSelected 
        ? 'bg-yellow-900/30 border-l-4 border-yellow-500 hover:bg-yellow-900/40'
        : 'bg-yellow-900/20 border-l-4 border-yellow-500 hover:bg-yellow-900/30';
    }
    if (app.currentStatus === 'application_cancelled') {
      return isSelected
        ? 'bg-red-900/30 border-l-4 border-red-500 opacity-75 hover:bg-red-900/40'
        : 'bg-red-900/20 border-l-4 border-red-500 opacity-75 hover:bg-red-900/30';
    }
    if (isSelected) {
      return 'bg-blue-900/50 border-l-4 border-blue-500 hover:bg-blue-900/60';
    }
    return 'hover:bg-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'application_on_hold') {
      return <Pause className="w-3 h-3 text-yellow-400 mr-1" />;
    }
    if (status === 'application_cancelled') {
      return <X className="w-3 h-3 text-red-400 mr-1" />;
    }
    return null;
  };

  const getStageColor = (stage: number) => {
    const colors = [
      'bg-purple-900 text-purple-300 border-purple-700',
      'bg-blue-900 text-blue-300 border-blue-700',
      'bg-green-900 text-green-300 border-green-700',
      'bg-orange-900 text-orange-300 border-orange-700',
      'bg-pink-900 text-pink-300 border-pink-700',
    ];
    return colors[stage - 1] || colors[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-900 border-red-700';
      case 'medium': return 'text-yellow-300 bg-yellow-900 border-yellow-700';
      case 'low': return 'text-green-300 bg-green-900 border-green-700';
      default: return 'text-gray-300 bg-gray-800 border-gray-600';
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

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === paginatedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(paginatedApplications.map(app => app.id));
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleBulkUpdate = (updatedApplications: Application[]) => {
    // Update the applications in state
    setApplications(prev => 
      prev.map(app => {
        const updated = updatedApplications.find(u => u.id === app.id);
        return updated || app;
      })
    );
    
    // Clear selections
    setSelectedApplications([]);
    setShowBulkModal(false);
  };

  const clearSelections = () => {
    setSelectedApplications([]);
  };

  const selectedApplicationsData = applications.filter(app => selectedApplications.includes(app.id));

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
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
                <h1 className="text-2xl font-bold text-white">Applications</h1>
                <p className="text-gray-300">
                  {isAdmin 
                    ? `Manage all applications across partners (${filteredApplications.length} total)`
                    : `Your submitted applications (${filteredApplications.length} total)`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedApplications.length > 0 && (
                  <div className="flex items-center space-x-2 bg-blue-900 px-3 py-2 rounded-lg border border-blue-700">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">
                      {selectedApplications.length} selected
                    </span>
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      <Settings className="w-3 h-3 mr-1 inline" />
                      Bulk Update
                    </button>
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
                {!isAdmin && (
                  <Link
                    href="/partner/applications/new"
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <User className="w-4 h-4 mr-2" />
                    New Application
                  </Link>
                )}
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
                  placeholder="Search applications, students, or partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(WorkflowService.getAllStatuses()).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>

              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Stages</option>
                <option value="1">{getStageName(1)}</option>
                <option value="2">{getStageName(2)}</option>
                <option value="3">{getStageName(3)}</option>
                <option value="4">{getStageName(4)}</option>
                <option value="5">{getStageName(5)}</option>
              </select>

              {isAdmin && (
                <select
                  value={filters.partner}
                  onChange={(e) => handleFilterChange('partner', e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Partners</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
              )}

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
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

        {/* Applications Table */}
        <div className="flex-1 overflow-auto">
          <div className="bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0 ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Application
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Partner
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('stage')}
                        className="flex items-center space-x-1 hover:text-gray-300"
                      >
                        <span>Stage</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-gray-300"
                      >
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Next Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('priority')}
                        className="flex items-center space-x-1 hover:text-gray-300"
                      >
                        <span>Priority</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 hover:text-gray-300"
                      >
                        <span>Updated</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {paginatedApplications.map(app => {
                    const student = students.find(s => s.id === app.studentId);
                    const partner = partners.find(p => p.id === app.partnerId);
                    const statusDisplayName = WorkflowService.getStatusDisplayName(app.currentStage, app.currentStatus);
                    const isSelected = selectedApplications.includes(app.id);

                    return (
                      <tr key={app.id} className={`transition-colors ${
                        getRowStyling(app, isSelected)
                      }`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectApplication(app.id)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {student?.firstName} {student?.lastName}
                              </div>
                              <div className="text-sm text-gray-400">{student?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{app.id}</div>
                          <div className="text-sm text-gray-300">{app.program}</div>
                          <div className="text-xs text-gray-400">{app.university}</div>
                        </td>

                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-white">
                              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                              {partner?.name}
                            </div>
                          </td>
                        )}

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(app.currentStage)}`}>
                            {getStageName(app.currentStage)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(app.currentStatus)}`}>
                              {getStatusIcon(app.currentStatus)}
                              {statusDisplayName}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-xs text-xs text-gray-300">
                            {getStatusMessage(app, isAdmin, 'next')}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getPriorityColor(app.priority)}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {app.priority}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(app.updatedAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            href={`/${isAdmin ? 'admin' : 'partner'}/applications/${app.id}`}
                            className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Link>
                          <Link
                            href={`/${isAdmin ? 'admin' : 'partner'}/applications/${app.id}/edit`}
                            className="inline-flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-800 transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700">
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
                    <p className="text-sm text-gray-300">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredApplications.length)}</span> of{' '}
                      <span className="font-medium">{filteredApplications.length}</span> applications
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-900 border-blue-500 text-blue-400'
                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Bulk Status Update Modal */}
      {showBulkModal && selectedApplicationsData.length > 0 && (
        <BulkStatusUpdateModal
          selectedApplications={selectedApplicationsData}
          isAdmin={isAdmin}
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onUpdate={handleBulkUpdate}
        />
      )}
    </div>
  );
};

export default ApplicationsList;
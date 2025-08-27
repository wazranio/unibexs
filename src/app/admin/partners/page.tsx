'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Partner } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  Download,
  Eye,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
} from 'lucide-react';

const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    country: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    const loadData = () => {
      try {
        const partnersData = StorageService.getPartners();
        setPartners(partnersData);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('unibexs_partners')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    let filtered = [...partners];

    // Apply search
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(searchTerm) ||
        partner.email.toLowerCase().includes(searchTerm) ||
        partner.businessName?.toLowerCase().includes(searchTerm) ||
        partner.country.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(partner => partner.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(partner => partner.type === filters.type);
    }
    if (filters.country) {
      filtered = filtered.filter(partner => partner.country === filters.country);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPartners(filtered);
  }, [partners, searchQuery, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', type: '', country: '' });
    setSearchQuery('');
  };

  const handleSort = (field: 'date' | 'status' | 'name' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-300 bg-green-900 border-green-700';
      case 'rejected': return 'text-red-300 bg-red-900 border-red-700';
      case 'pending': return 'text-yellow-300 bg-yellow-900 border-yellow-700';
      default: return 'text-gray-300 bg-gray-800 border-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'business': return 'text-blue-300 bg-blue-900 border-blue-700';
      case 'individual': return 'text-purple-300 bg-purple-900 border-purple-700';
      default: return 'text-gray-300 bg-gray-800 border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3 text-green-400 mr-1" />;
      case 'rejected': return <XCircle className="w-3 h-3 text-red-400 mr-1" />;
      case 'pending': return <Clock className="w-3 h-3 text-yellow-400 mr-1" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleApprovePartner = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      const updatedPartner = { ...partner, status: 'approved' as const };
      StorageService.updatePartner(updatedPartner);
    }
  };

  const handleRejectPartner = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      const updatedPartner = { ...partner, status: 'rejected' as const };
      StorageService.updatePartner(updatedPartner);
    }
  };

  // Get unique values for filter dropdowns
  const uniqueCountries = Array.from(new Set(partners.map(p => p.country))).sort();

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSelectAll = () => {
    if (selectedPartners.length === paginatedPartners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(paginatedPartners.map(partner => partner.id));
    }
  };

  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartners(prev => 
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const clearSelections = () => {
    setSelectedPartners([]);
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
                <h1 className="text-2xl font-bold text-white">Partners</h1>
                <p className="text-gray-300">
                  Manage education agents and consultants ({filteredPartners.length} total)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedPartners.length > 0 && (
                  <div className="flex items-center space-x-2 bg-blue-900 px-3 py-2 rounded-lg border border-blue-700">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">
                      {selectedPartners.length} selected
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
                  placeholder="Search partners by name, email, or business..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>

              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
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
            {paginatedPartners.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No partners found</h3>
                  <p className="text-gray-500">
                    {partners.length === 0 
                      ? 'No partners have been added yet.' 
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
                          checked={selectedPartners.length === paginatedPartners.length && paginatedPartners.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Partner
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('type')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Type
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('status')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Status
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
                    {paginatedPartners.map((partner) => {
                      const isSelected = selectedPartners.includes(partner.id);
                      return (
                        <tr
                          key={partner.id}
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
                              onChange={() => handleSelectPartner(partner.id)}
                              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                  {partner.type === 'business' ? (
                                    <Building2 className="h-5 w-5 text-gray-300" />
                                  ) : (
                                    <User className="h-5 w-5 text-gray-300" />
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-white">
                                    {partner.name}
                                  </div>
                                  {partner.status === 'pending' && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                {partner.businessName && (
                                  <div className="text-sm text-gray-400">
                                    {partner.businessName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(partner.type)}`}>
                              {partner.type === 'business' ? 'Business' : 'Individual'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{partner.email}</div>
                            <div className="text-sm text-gray-400">{partner.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {partner.country}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(partner.status)}`}>
                              {getStatusIcon(partner.status)}
                              {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {formatDate(partner.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/admin/partners/${partner.id}`}
                                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Link>
                              {partner.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePartner(partner.id)}
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectPartner(partner.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
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
                      <span className="font-medium text-white">{Math.min(endIndex, filteredPartners.length)}</span> of{' '}
                      <span className="font-medium text-white">{filteredPartners.length}</span> results
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

export default PartnersPage;
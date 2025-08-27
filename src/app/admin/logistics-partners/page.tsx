'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LogisticsPartner } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  Download,
  Edit,
  Trash2,
  Plus,
  Truck,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

const LogisticsPartnersPage: React.FC = () => {
  const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<LogisticsPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    country: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'city' | 'country'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<LogisticsPartner | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    services: [] as string[],
    description: '',
  });

  const [serviceInput, setServiceInput] = useState('');

  const isAdmin = AuthService.isAdmin();

  // Common services for suggestions
  const commonServices = [
    'Airport pickup/drop-off',
    'House hunting',
    'Reception services',
    'Local transportation',
    'Document assistance',
    'City orientation',
    'SIM card setup',
    'Bank account opening assistance',
    'Accommodation booking',
    'Furniture rental',
    'Internet setup',
    'Utility connections',
    'Translation services',
    'Emergency assistance',
  ];

  const loadData = () => {
    try {
      const partnersData = StorageService.getLogisticsPartners();
      setLogisticsPartners(partnersData);
    } catch (error) {
      console.error('Error loading logistics partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = useCallback(() => {
    let filtered = [...logisticsPartners];

    // Apply search
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(searchTerm) ||
        partner.city.toLowerCase().includes(searchTerm) ||
        partner.country.toLowerCase().includes(searchTerm) ||
        partner.email.toLowerCase().includes(searchTerm) ||
        partner.services.some(service => service.toLowerCase().includes(searchTerm))
      );
    }

    // Apply filters
    if (filters.city) {
      filtered = filtered.filter(partner => partner.city === filters.city);
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
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'city':
          aValue = a.city.toLowerCase();
          bValue = b.city.toLowerCase();
          break;
        case 'country':
          aValue = a.country.toLowerCase();
          bValue = b.country.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPartners(filtered);
  }, [logisticsPartners, searchQuery, filters, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ city: '', country: '' });
    setSearchQuery('');
  };

  const handleSort = (field: 'date' | 'name' | 'city' | 'country') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCreate = () => {
    const newPartner: LogisticsPartner = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveLogisticsPartner(newPartner);
    loadData();
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (partner: LogisticsPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      city: partner.city,
      country: partner.country,
      phone: partner.phone,
      email: partner.email,
      services: [...partner.services],
      description: partner.description || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingPartner) return;

    const updatedPartner: LogisticsPartner = {
      ...editingPartner,
      ...formData,
    };

    StorageService.updateLogisticsPartner(updatedPartner);
    loadData();
    setShowEditModal(false);
    setEditingPartner(null);
    resetForm();
  };

  const handleDelete = (partner: LogisticsPartner) => {
    if (confirm(`Are you sure you want to delete "${partner.name}"?`)) {
      StorageService.deleteLogisticsPartner(partner.id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      services: [],
      description: '',
    });
    setServiceInput('');
  };

  const addService = () => {
    const service = serviceInput.trim();
    if (service && !formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
      setServiceInput('');
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  const addCommonService = (service: string) => {
    if (!formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get unique values for filter dropdowns
  const uniqueCities = Array.from(new Set(logisticsPartners.map(p => p.city))).sort();
  const uniqueCountries = Array.from(new Set(logisticsPartners.map(p => p.country))).sort();

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
                <h1 className="text-2xl font-bold text-white">Logistics Partners</h1>
                <p className="text-gray-300">
                  Manage people and companies providing logistic services ({filteredPartners.length} total)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Logistics Partner
                </button>
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
                  placeholder="Search by name, city, country, email, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
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
                  <Truck className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No logistics partners found</h3>
                  <p className="text-gray-500">
                    {logisticsPartners.length === 0 
                      ? 'Add your first logistics partner to get started.' 
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
                          onClick={() => handleSort('city')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Location
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSort('date')}
                          className="flex items-center hover:text-white transition-colors"
                        >
                          Added
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedPartners.map((partner) => (
                      <tr
                        key={partner.id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center border border-gray-600">
                                <Truck className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {partner.name}
                              </div>
                              {partner.description && (
                                <div className="text-sm text-gray-400">
                                  {partner.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {partner.city}, {partner.country}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            {partner.email}
                          </div>
                          <div className="text-sm text-gray-300 flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {partner.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {partner.services.slice(0, 2).map((service, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
                                {service}
                              </span>
                            ))}
                            {partner.services.length > 2 && (
                              <span className="text-xs text-gray-400">+{partner.services.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {formatDate(partner.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(partner)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(partner)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Logistics Partner</h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter partner name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Services</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addService()}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a service"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {/* Common Services */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Common services (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {commonServices.filter(service => !formData.services.includes(service)).slice(0, 6).map(service => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => addCommonService(service)}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 border border-gray-600"
                      >
                        + {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Added Services */}
                <div className="flex flex-wrap gap-2">
                  {formData.services.map(service => (
                    <div key={service} className="flex items-center bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm">
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="ml-2 text-blue-400 hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.country.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Logistics Partner</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingPartner(null); resetForm(); }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Services</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addService()}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a service"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {/* Common Services */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Common services (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {commonServices.filter(service => !formData.services.includes(service)).slice(0, 6).map(service => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => addCommonService(service)}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 border border-gray-600"
                      >
                        + {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Added Services */}
                <div className="flex flex-wrap gap-2">
                  {formData.services.map(service => (
                    <div key={service} className="flex items-center bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm">
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="ml-2 text-blue-400 hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingPartner(null); resetForm(); }}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.country.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsPartnersPage;
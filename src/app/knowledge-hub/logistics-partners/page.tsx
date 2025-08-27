'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsPartner } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  Truck,
  MapPin,
  Phone,
  Mail,
  Building2,
  Users,
  Eye,
} from 'lucide-react';

const KnowledgeHubLogisticsPartnersPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [logisticsPartners, setLogisticsPartners] = useState<LogisticsPartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<LogisticsPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<LogisticsPartner | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = () => {
    try {
      const partnersData = StorageService.getLogisticsPartners();
      setLogisticsPartners(partnersData);
      setFilteredPartners(partnersData);
    } catch (error) {
      console.error('Error loading logistics partners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  useEffect(() => {
    let filtered = logisticsPartners;

    if (searchQuery) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(partner => partner.country === selectedCountry);
    }

    setFilteredPartners(filtered);
  }, [logisticsPartners, searchQuery, selectedCountry]);

  const getUniqueCountries = () => {
    return Array.from(new Set(logisticsPartners.map(p => p.country))).sort();
  };

  const handleViewDetails = (partner: LogisticsPartner) => {
    setSelectedPartner(partner);
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">Please log in to access this page.</p>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-gray-800 shadow-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">Logistics Partners</h1>
                  <p className="text-gray-300 mt-1">Browse available logistics partners and their services</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Search and Filter */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search partners, cities, or services..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Countries</option>
                    {getUniqueCountries().map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Partners Grid */}
              {filteredPartners.length === 0 ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                  <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Partners Found</h3>
                  <p className="text-gray-400">
                    {searchQuery || selectedCountry 
                      ? 'Try adjusting your search criteria.' 
                      : 'No logistics partners are currently available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPartners.map((partner) => (
                    <div key={partner.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                            <div className="flex items-center text-sm text-gray-300">
                              <MapPin className="w-4 h-4 mr-1" />
                              {partner.city}, {partner.country}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="w-4 h-4 mr-2" />
                          {partner.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Phone className="w-4 h-4 mr-2" />
                          {partner.phone}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Services ({partner.services.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {partner.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900 text-indigo-200"
                            >
                              {service}
                            </span>
                          ))}
                          {partner.services.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                              +{partner.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDetails(partner)}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Partner Details</h2>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedPartner.name}</h3>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="w-5 h-5 mr-1" />
                      {selectedPartner.city}, {selectedPartner.country}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-300">Email</span>
                    </div>
                    <p className="text-white">{selectedPartner.email}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Phone className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-300">Phone</span>
                    </div>
                    <p className="text-white">{selectedPartner.phone}</p>
                  </div>
                </div>

                {selectedPartner.description && (
                  <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                    <p className="text-white">{selectedPartner.description}</p>
                  </div>
                )}

                <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Member Since</span>
                  </div>
                  <p className="text-white">
                    {new Date(selectedPartner.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Services Offered</h4>
                {selectedPartner.services.length === 0 ? (
                  <p className="text-gray-400">No services listed</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPartner.services.map((service, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-indigo-400 rounded-full mr-3"></div>
                          <span className="text-white">{service}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KnowledgeHubLogisticsPartnersPage;
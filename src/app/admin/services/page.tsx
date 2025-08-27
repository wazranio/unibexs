'use client';

import { useEffect, useState } from 'react';
import { ServiceProvider, ServiceAnalytics } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

interface ServiceAnalyticsCardProps {
  title: string;
  value: number;
  color: string;
  icon: string;
}

function ServiceAnalyticsCard({ title, value, color, icon }: ServiceAnalyticsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface ServiceTableRowProps {
  service: ServiceProvider;
  onView: (service: ServiceProvider) => void;
}

function ServiceTableRow({ service, onView }: ServiceTableRowProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accommodation': return 'bg-blue-900 text-blue-200';
      case 'transport': return 'bg-green-900 text-green-200';
      case 'insurance': return 'bg-red-900 text-red-200';
      case 'medical': return 'bg-purple-900 text-purple-200';
      case 'banking': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-gray-900 text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return '🏠';
      case 'transport': return '🚗';
      case 'insurance': return '🛡️';
      case 'medical': return '🏥';
      case 'banking': return '🏦';
      default: return '⚙️';
    }
  };

  return (
    <tr className="hover:bg-gray-700 border-b border-gray-700">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-xl">{getTypeIcon(service.type)}</span>
          </div>
          <div className="ml-4">
            <p className="font-medium text-white">{service.name}</p>
            <p className="text-sm text-gray-300">{service.description || 'No description'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
          {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-white">{service.country}</td>
      <td className="px-6 py-4 text-sm text-gray-300">{service.contactEmail}</td>
      <td className="px-6 py-4 text-sm text-gray-300">{service.contactPhone}</td>
      <td className="px-6 py-4 text-sm text-gray-300">{service.services.length} services</td>
      <td className="px-6 py-4 text-right text-sm font-medium">
        <button
          onClick={() => onView(service)}
          className="text-indigo-400 hover:text-indigo-300"
        >
          View Details
        </button>
      </td>
    </tr>
  );
}

export default function ServicesPage() {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [analytics, setAnalytics] = useState<ServiceAnalytics>({
    total: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = () => {
    try {
      const servicesData = StorageService.getServiceProviders();
      const analyticsData = StorageService.getServiceAnalytics();
      
      setServices(servicesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading services data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (service: ServiceProvider) => {
    setSelectedService(service);
  };

  const filteredServices = filterType 
    ? services.filter(service => service.type === filterType)
    : services;

  const getAnalyticsCards = () => {
    const cards = [
      {
        title: 'Total Providers',
        value: analytics.total,
        color: 'bg-blue-500',
        icon: '🏢'
      }
    ];

    // Add top 3 service types
    const sortedTypes = Object.entries(analytics.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    sortedTypes.forEach(([type, count]) => {
      const typeIcons = {
        accommodation: '🏠',
        transport: '🚗',
        insurance: '🛡️',
        medical: '🏥',
        banking: '🏦',
        other: '⚙️'
      };

      cards.push({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
        color: 'bg-green-500',
        icon: typeIcons[type as keyof typeof typeIcons] || '⚙️'
      });
    });

    return cards.slice(0, 4); // Ensure we don't exceed 4 cards
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">You need admin privileges to access this page.</p>
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
                  <h1 className="text-3xl font-bold text-white">Service Providers</h1>
                  <p className="text-gray-300 mt-1">Manage service providers for student support services</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {getAnalyticsCards().map((card, index) => (
                  <ServiceAnalyticsCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    color={card.color}
                    icon={card.icon}
                  />
                ))}
              </div>

              {/* Filter Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setFilterType('')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        filterType === ''
                          ? 'border-indigo-500 text-indigo-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      All Services ({analytics.total})
                    </button>
                    {Object.entries(analytics.byType).map(([type, count]) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                          filterType === type
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {type} ({count})
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Services Table */}
              <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white">
                    {filterType ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Providers` : 'All Service Providers'}
                  </h3>
                </div>
                
                {filteredServices.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-400">No service providers found.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {filterType ? `No ${filterType} providers available.` : 'Service providers will appear here when they are added to the system.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Provider
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Services
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800">
                        {filteredServices.map((service) => (
                          <ServiceTableRow
                            key={service.id}
                            service={service}
                            onView={handleView}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Service Provider Details</h2>
              <button
                onClick={() => setSelectedService(null)}
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
                <h3 className="text-lg font-medium text-white mb-4">{selectedService.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Type</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedService.type === 'accommodation' ? 'bg-blue-900 text-blue-200' :
                      selectedService.type === 'transport' ? 'bg-green-900 text-green-200' :
                      selectedService.type === 'insurance' ? 'bg-red-900 text-red-200' :
                      selectedService.type === 'medical' ? 'bg-purple-900 text-purple-200' :
                      selectedService.type === 'banking' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-gray-900 text-gray-200'
                    }`}>
                      {selectedService.type.charAt(0).toUpperCase() + selectedService.type.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Country</label>
                    <p className="text-sm text-white">{selectedService.country}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <p className="text-sm text-white">{selectedService.contactEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Phone</label>
                    <p className="text-sm text-white">{selectedService.contactPhone}</p>
                  </div>
                </div>
                
                {selectedService.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <p className="text-sm text-white mt-1">{selectedService.description}</p>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">Added</label>
                  <p className="text-sm text-white">
                    {new Date(selectedService.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">Services Offered</h4>
                {selectedService.services.length === 0 ? (
                  <p className="text-gray-400 text-sm">No services listed</p>
                ) : (
                  <div className="space-y-2 bg-gray-700 p-4 rounded-lg">
                    {selectedService.services.map((service, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                        <span className="text-sm text-white">{service}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="flex space-x-3">
                  <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Contact Provider
                  </button>
                  <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
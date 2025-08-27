'use client';

import React, { useState, useEffect } from 'react';
import { University, College, Program } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  Download,
  Edit,
  Trash2,
  Plus,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  School,
  X,
} from 'lucide-react';

type ViewState = 'universities' | 'colleges' | 'programs';

interface NavigationLevel {
  type: ViewState;
  id?: string;
  name: string;
}

const UniversitiesPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('universities');
  const [navigationPath, setNavigationPath] = useState<NavigationLevel[]>([
    { type: 'universities', name: 'Universities' }
  ]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'university',
    country: '',
    description: '',
    duration: '',
    fees: 0,
    currency: 'USD',
    intakes: [] as string[],
    requirements: [] as string[],
  });

  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentView, selectedUniversity, selectedCollege, universities, colleges, programs]);

  const loadData = () => {
    try {
      const universitiesData = StorageService.getUniversities();
      const collegesData = StorageService.getColleges();
      const programsData = StorageService.getPrograms();
      
      setUniversities(universitiesData);
      setColleges(collegesData);
      setPrograms(programsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let data: any[] = [];
    
    switch (currentView) {
      case 'universities':
        data = universities;
        break;
      case 'colleges':
        data = colleges.filter(c => c.universityId === selectedUniversity?.id);
        break;
      case 'programs':
        data = programs.filter(p => 
          p.universityId === selectedUniversity?.id && 
          p.collegeId === selectedCollege?.id
        );
        break;
    }

    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      data = data.filter((item: any) => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.country?.toLowerCase().includes(searchTerm) ||
        item.type?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredData(data);
  };

  const navigateToUniversity = (university: University) => {
    setSelectedUniversity(university);
    setSelectedCollege(null);
    setCurrentView('colleges');
    setNavigationPath([
      { type: 'universities', name: 'Universities' },
      { type: 'colleges', id: university.id, name: university.name }
    ]);
    setCurrentPage(1);
  };

  const navigateToCollege = (college: College) => {
    setSelectedCollege(college);
    setCurrentView('programs');
    setNavigationPath([
      { type: 'universities', name: 'Universities' },
      { type: 'colleges', id: selectedUniversity!.id, name: selectedUniversity!.name },
      { type: 'programs', id: college.id, name: college.name }
    ]);
    setCurrentPage(1);
  };

  const navigateToLevel = (levelIndex: number) => {
    // const targetLevel = navigationPath[levelIndex];
    
    if (levelIndex === 0) {
      setCurrentView('universities');
      setSelectedUniversity(null);
      setSelectedCollege(null);
      setNavigationPath([{ type: 'universities', name: 'Universities' }]);
    } else if (levelIndex === 1) {
      setCurrentView('colleges');
      setSelectedCollege(null);
      setNavigationPath(navigationPath.slice(0, 2));
    }
    setCurrentPage(1);
  };

  const handleCreate = () => {
    const newItem = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    switch (currentView) {
      case 'universities':
        const newUniversity: University = {
          ...newItem,
          type: formData.type as 'university' | 'college',
        };
        StorageService.saveUniversity(newUniversity);
        break;
      case 'colleges':
        const newCollege: College = {
          ...newItem,
          universityId: selectedUniversity!.id,
        };
        StorageService.saveCollege(newCollege);
        break;
      case 'programs':
        const newProgram: Program = {
          ...newItem,
          universityId: selectedUniversity!.id,
          collegeId: selectedCollege!.id,
          fees: Number(formData.fees),
        };
        StorageService.saveProgram(newProgram);
        break;
    }

    loadData();
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type || 'university',
      country: item.country || '',
      description: item.description || '',
      duration: item.duration || '',
      fees: item.fees || 0,
      currency: item.currency || 'USD',
      intakes: item.intakes || [],
      requirements: item.requirements || [],
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    const updatedItem = {
      ...editingItem,
      ...formData,
      fees: Number(formData.fees),
    };

    switch (currentView) {
      case 'universities':
        StorageService.updateUniversity(updatedItem);
        break;
      case 'colleges':
        StorageService.updateCollege(updatedItem);
        break;
      case 'programs':
        StorageService.updateProgram(updatedItem);
        break;
    }

    loadData();
    setShowEditModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDelete = (item: any) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      switch (currentView) {
        case 'universities':
          StorageService.deleteUniversity(item.id);
          break;
        case 'colleges':
          StorageService.deleteCollege(item.id);
          break;
        case 'programs':
          StorageService.deleteProgram(item.id);
          break;
      }
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'university',
      country: '',
      description: '',
      duration: '',
      fees: 0,
      currency: 'USD',
      intakes: [],
      requirements: [],
    });
  };

  const getItemIcon = (type: ViewState) => {
    switch (type) {
      case 'universities': return Building2;
      case 'colleges': return School;
      case 'programs': return BookOpen;
    }
  };

  const getCurrentTitle = () => {
    switch (currentView) {
      case 'universities': return 'Universities';
      case 'colleges': return 'Colleges';
      case 'programs': return 'Programs';
    }
  };

  const getCreateButtonText = () => {
    switch (currentView) {
      case 'universities': return 'Add University';
      case 'colleges': return 'Add College';
      case 'programs': return 'Add Program';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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

  const IconComponent = getItemIcon(currentView);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center space-x-2 mb-2">
                  {navigationPath.map((level, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      )}
                      <button
                        onClick={() => navigateToLevel(index)}
                        className={`text-sm ${
                          index === navigationPath.length - 1
                            ? 'text-white font-medium'
                            : 'text-gray-400 hover:text-white'
                        } transition-colors`}
                      >
                        {level.name}
                      </button>
                    </React.Fragment>
                  ))}
                </nav>
                
                <h1 className="text-2xl font-bold text-white">{getCurrentTitle()}</h1>
                <p className="text-gray-300">
                  {currentView === 'universities' && `Manage universities and their academic structure (${filteredData.length} total)`}
                  {currentView === 'colleges' && `Colleges in ${selectedUniversity?.name} (${filteredData.length} total)`}
                  {currentView === 'programs' && `Programs in ${selectedCollege?.name} (${filteredData.length} total)`}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {getCreateButtonText()}
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${currentView}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <IconComponent className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No {currentView} found</h3>
                  <p className="text-gray-500">
                    {filteredData.length === 0 
                      ? `Create your first ${currentView.slice(0, -1)} to get started.` 
                      : 'Try adjusting your search.'
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
                        Name
                      </th>
                      {currentView === 'universities' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Colleges
                          </th>
                        </>
                      )}
                      {currentView === 'colleges' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Programs
                        </th>
                      )}
                      {currentView === 'programs' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Fees
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Intakes
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedData.map((item: any) => {
                      let itemCollegesCount = 0;
                      let itemProgramsCount = 0;
                      
                      if (currentView === 'universities') {
                        itemCollegesCount = colleges.filter(c => c.universityId === item.id).length;
                      } else if (currentView === 'colleges') {
                        itemProgramsCount = programs.filter(p => p.collegeId === item.id).length;
                      }

                      return (
                        <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600">
                                  <IconComponent className="h-5 w-5 text-gray-300" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {currentView !== 'programs' ? (
                                    <button
                                      onClick={() => {
                                        if (currentView === 'universities') {
                                          navigateToUniversity(item);
                                        } else if (currentView === 'colleges') {
                                          navigateToCollege(item);
                                        }
                                      }}
                                      className="hover:text-blue-400 transition-colors"
                                    >
                                      {item.name}
                                    </button>
                                  ) : (
                                    item.name
                                  )}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-400">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {currentView === 'universities' && (
                            <>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-900 text-blue-300 border-blue-700">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {item.country}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {itemCollegesCount} colleges
                              </td>
                            </>
                          )}
                          
                          {currentView === 'colleges' && (
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {itemProgramsCount} programs
                            </td>
                          )}
                          
                          {currentView === 'programs' && (
                            <>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {item.duration}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {item.currency} {item.fees?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {item.intakes?.length || 0} intakes
                              </td>
                            </>
                          )}
                          
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                      <span className="font-medium text-white">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                      <span className="font-medium text-white">{filteredData.length}</span> results
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
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create {currentView.slice(0, -1)}</h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${currentView.slice(0, -1)} name`}
                />
              </div>

              {currentView === 'universities' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="university">University</option>
                      <option value="college">College</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter country"
                    />
                  </div>
                </>
              )}

              {currentView === 'programs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2 years"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Fees</label>
                      <input
                        type="number"
                        value={formData.fees}
                        onChange={(e) => setFormData({...formData, fees: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="MYR">MYR</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter description"
                />
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
                disabled={!formData.name.trim()}
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
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit {currentView.slice(0, -1)}</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {currentView === 'universities' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="university">University</option>
                      <option value="college">College</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {currentView === 'programs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Fees</label>
                      <input
                        type="number"
                        value={formData.fees}
                        onChange={(e) => setFormData({...formData, fees: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="MYR">MYR</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.name.trim()}
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

export default UniversitiesPage;
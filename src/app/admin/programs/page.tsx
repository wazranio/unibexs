'use client';

import React, { useState, useEffect } from 'react';
import { Level, FieldOfStudy, EnhancedProgram, University, College } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import { FIELDS_OF_STUDY } from '@/lib/constants/fields-of-study';
import { InheritanceManager } from '@/lib/utils/inheritance-manager';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  Download,
  Edit,
  Trash2,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  School,
  X,
  Users,
  Eye,
  Copy,
  Archive,
  RefreshCw,
  Settings,
  Layers,
  Target
} from 'lucide-react';

type ViewState = 'universities' | 'colleges' | 'levels' | 'programs';

interface NavigationLevel {
  type: ViewState;
  id?: string;
  name: string;
}

interface BulkActionModal {
  isOpen: boolean;
  type: 'field-of-study' | 'level-defaults' | 'activation' | 'commission' | 'english-requirements' | null;
  selectedPrograms: string[];
}

const AdminProgramsPage: React.FC = () => {
  // State management
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [programs, setPrograms] = useState<EnhancedProgram[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('universities');
  
  const [navigationPath, setNavigationPath] = useState<NavigationLevel[]>([
    { type: 'universities', name: 'Universities' }
  ]);
  
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  // Bulk operations
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [bulkActionModal, setBulkActionModal] = useState<BulkActionModal>({
    isOpen: false,
    type: null,
    selectedPrograms: []
  });

  // Filters
  const [filters, setFilters] = useState({
    fieldOfStudy: '',
    isActive: 'all' as 'all' | 'active' | 'inactive',
    hasOverrides: 'all' as 'all' | 'yes' | 'no'
  });

  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentView, selectedUniversity, selectedCollege, selectedLevel, universities, colleges, levels, programs, filters]);

  const loadData = () => {
    try {
      const universitiesData = StorageService.getUniversities();
      const collegesData = StorageService.getColleges();
      const levelsData = StorageService.getLevels();
      const programsData = StorageService.getEnhancedPrograms();
      const fieldsData = StorageService.getFieldsOfStudy();
      
      // Initialize field of study data if empty
      if (fieldsData.length === 0) {
        FIELDS_OF_STUDY.forEach(field => StorageService.saveFieldOfStudy(field));
        setFieldsOfStudy(FIELDS_OF_STUDY);
      } else {
        setFieldsOfStudy(fieldsData);
      }
      
      setUniversities(universitiesData);
      setColleges(collegesData);
      setLevels(levelsData);
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
      case 'levels':
        data = levels.filter(l => 
          l.universityId === selectedUniversity?.id && 
          l.collegeId === selectedCollege?.id
        );
        break;
      case 'programs':
        data = programs.filter(p => 
          p.universityId === selectedUniversity?.id && 
          p.collegeId === selectedCollege?.id &&
          p.levelId === selectedLevel?.id
        );
        
        // Apply program-specific filters
        if (filters.fieldOfStudy) {
          data = data.filter((p: EnhancedProgram) => p.fieldOfStudyId === filters.fieldOfStudy);
        }
        if (filters.isActive !== 'all') {
          const isActive = filters.isActive === 'active';
          data = data.filter((p: EnhancedProgram) => p.isActive === isActive);
        }
        if (filters.hasOverrides !== 'all') {
          const hasOverrides = filters.hasOverrides === 'yes';
          data = data.filter((p: EnhancedProgram) => InheritanceManager.hasOverrides(p) === hasOverrides);
        }
        break;
    }

    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      data = data.filter((item: any) => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.displayName?.toLowerCase().includes(searchTerm) ||
        item.shortDescription?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredData(data);
  };

  const navigateToUniversity = (university: University) => {
    setSelectedUniversity(university);
    setSelectedCollege(null);
    setSelectedLevel(null);
    setCurrentView('colleges');
    setNavigationPath([
      { type: 'universities', name: 'Universities' },
      { type: 'colleges', id: university.id, name: university.name }
    ]);
    setCurrentPage(1);
  };

  const navigateToCollege = (college: College) => {
    setSelectedCollege(college);
    setSelectedLevel(null);
    setCurrentView('levels');
    setNavigationPath([
      { type: 'universities', name: 'Universities' },
      { type: 'colleges', id: selectedUniversity!.id, name: selectedUniversity!.name },
      { type: 'levels', id: college.id, name: college.name }
    ]);
    setCurrentPage(1);
  };

  const navigateToLevel = (level: Level) => {
    setSelectedLevel(level);
    setCurrentView('programs');
    setNavigationPath([
      { type: 'universities', name: 'Universities' },
      { type: 'colleges', id: selectedUniversity!.id, name: selectedUniversity!.name },
      { type: 'levels', id: selectedCollege!.id, name: selectedCollege!.name },
      { type: 'programs', id: level.id, name: level.displayName }
    ]);
    setCurrentPage(1);
  };

  const navigateToLevelIndex = (levelIndex: number) => {
    setSelectedPrograms([]);
    
    if (levelIndex === 0) {
      setCurrentView('universities');
      setSelectedUniversity(null);
      setSelectedCollege(null);
      setSelectedLevel(null);
      setNavigationPath([{ type: 'universities', name: 'Universities' }]);
    } else if (levelIndex === 1) {
      setCurrentView('colleges');
      setSelectedCollege(null);
      setSelectedLevel(null);
      setNavigationPath(navigationPath.slice(0, 2));
    } else if (levelIndex === 2) {
      setCurrentView('levels');
      setSelectedLevel(null);
      setNavigationPath(navigationPath.slice(0, 3));
    }
    setCurrentPage(1);
  };

  const handleBulkAction = (actionType: BulkActionModal['type']) => {
    setBulkActionModal({
      isOpen: true,
      type: actionType,
      selectedPrograms: selectedPrograms
    });
  };

  const executeBulkAction = (updates: any) => {
    if (bulkActionModal.type && selectedPrograms.length > 0) {
      switch (bulkActionModal.type) {
        case 'field-of-study':
          StorageService.bulkUpdateEnhancedPrograms(selectedPrograms, { 
            fieldOfStudyId: updates.fieldOfStudyId 
          });
          break;
        case 'activation':
          StorageService.bulkUpdateEnhancedPrograms(selectedPrograms, { 
            isActive: updates.isActive 
          });
          break;
        case 'commission':
          StorageService.bulkUpdateEnhancedPrograms(selectedPrograms, { 
            commissionRate: updates.commissionRate
          });
          // Update inheritance separately
          InheritanceManager.bulkUpdateInheritance(selectedPrograms, {
            commission: false
          });
          break;
      }
      
      loadData();
      setSelectedPrograms([]);
      setBulkActionModal({ isOpen: false, type: null, selectedPrograms: [] });
    }
  };

  const getItemIcon = (type: ViewState) => {
    switch (type) {
      case 'universities': return Building2;
      case 'colleges': return School;
      case 'levels': return Layers;
      case 'programs': return BookOpen;
    }
  };

  const getCurrentTitle = () => {
    switch (currentView) {
      case 'universities': return 'Universities';
      case 'colleges': return 'Colleges';
      case 'levels': return 'Academic Levels';
      case 'programs': return 'Programs';
    }
  };

  // const getCreateButtonText = () => {
  //   switch (currentView) {
  //     case 'universities': return 'Add University';
  //     case 'colleges': return 'Add College';
  //     case 'levels': return 'Add Level';
  //     case 'programs': return 'Add Program';
  //   }
  // };

  const getFieldOfStudyName = (id: string) => {
    const field = fieldsOfStudy.find(f => f.id === id);
    return field ? field.name : 'Unknown';
  };

  const getFieldOfStudyIcon = (id: string) => {
    const field = fieldsOfStudy.find(f => f.id === id);
    return field ? field.icon : '📚';
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const IconComponent = getItemIcon(currentView);

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
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center space-x-2 mb-2">
                  {navigationPath.map((level, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <button
                        onClick={() => navigateToLevelIndex(index)}
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
                
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <IconComponent className="w-6 h-6 mr-2" />
                  {getCurrentTitle()}
                </h1>
                <p className="text-gray-300">
                  {currentView === 'universities' && `Manage universities and their academic structure (${filteredData.length} total)`}
                  {currentView === 'colleges' && `Colleges in ${selectedUniversity?.name} (${filteredData.length} total)`}
                  {currentView === 'levels' && `Academic levels in ${selectedCollege?.name} (${filteredData.length} total)`}
                  {currentView === 'programs' && `Programs in ${selectedLevel?.displayName} (${filteredData.length} total)`}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {currentView === 'programs' && selectedPrograms.length > 0 && (
                  <div className="flex items-center space-x-2 bg-blue-600 px-3 py-2 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {selectedPrograms.length} selected
                    </span>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleBulkAction('field-of-study')}
                        className="p-1 text-white hover:bg-blue-700 rounded"
                        title="Bulk assign field of study"
                      >
                        <Target className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleBulkAction('activation')}
                        className="p-1 text-white hover:bg-blue-700 rounded"
                        title="Bulk activate/deactivate"
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleBulkAction('commission')}
                        className="p-1 text-white hover:bg-blue-700 rounded"
                        title="Bulk update commission"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={loadData}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${currentView}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {currentView === 'programs' && (
              <>
                <select
                  value={filters.fieldOfStudy}
                  onChange={(e) => setFilters({...filters, fieldOfStudy: e.target.value})}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Fields</option>
                  {fieldsOfStudy.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.icon} {field.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({...filters, isActive: e.target.value as any})}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <select
                  value={filters.hasOverrides}
                  onChange={(e) => setFilters({...filters, hasOverrides: e.target.value as any})}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Programs</option>
                  <option value="yes">With Overrides</option>
                  <option value="no">Uses Defaults</option>
                </select>
              </>
            )}
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
                      : 'Try adjusting your search or filters.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800">
                {/* Programs Table with enhanced features */}
                {currentView === 'programs' ? (
                  <table className="min-w-full">
                    <thead className="bg-gray-750 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedPrograms.length === paginatedData.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPrograms(paginatedData.map((p: any) => p.id));
                              } else {
                                setSelectedPrograms([]);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Field of Study
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Fees
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Inheritance
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {paginatedData.map((program: EnhancedProgram) => {
                        const inheritanceStatus = InheritanceManager.getInheritanceStatus(program);
                        
                        return (
                          <tr key={program.id} className="hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPrograms.includes(program.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPrograms([...selectedPrograms, program.id]);
                                  } else {
                                    setSelectedPrograms(selectedPrograms.filter(id => id !== program.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600">
                                    <BookOpen className="h-5 w-5 text-gray-300" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {program.name}
                                  </div>
                                  {program.shortDescription && (
                                    <div className="text-sm text-gray-400">
                                      {program.shortDescription}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    Code: {program.programCode || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{getFieldOfStudyIcon(program.fieldOfStudyId)}</span>
                                <span className="text-sm text-white">{getFieldOfStudyName(program.fieldOfStudyId)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-300">{program.duration}</span>
                                {!inheritanceStatus.duration.inherited && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-300 border border-orange-700">
                                    Override
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {program.currency} {program.fees.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                program.isActive
                                  ? 'bg-green-900 text-green-300 border border-green-700'
                                  : 'bg-red-900 text-red-300 border border-red-700'
                              }`}>
                                {program.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-1">
                                <span className={`w-2 h-2 rounded-full ${inheritanceStatus.duration.inherited ? 'bg-green-500' : 'bg-orange-500'}`} title="Duration"></span>
                                <span className={`w-2 h-2 rounded-full ${inheritanceStatus.commission.inherited ? 'bg-green-500' : 'bg-orange-500'}`} title="Commission"></span>
                                <span className={`w-2 h-2 rounded-full ${inheritanceStatus.englishRequirements.inherited ? 'bg-green-500' : 'bg-orange-500'}`} title="English Requirements"></span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {InheritanceManager.hasOverrides(program) ? 'Has Overrides' : 'Uses Defaults'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button className="text-red-400 hover:text-red-300 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  // Standard table for other views (universities, colleges, levels)
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
                            Levels
                          </th>
                        )}
                        {currentView === 'levels' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Default Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Commission
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Programs
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
                      {paginatedData.map((item: any) => (
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
                                  {currentView !== 'levels' ? (
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
                                    <button
                                      onClick={() => navigateToLevel(item)}
                                      className="hover:text-blue-400 transition-colors"
                                    >
                                      {item.displayName}
                                    </button>
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
                                {colleges.filter(c => c.universityId === item.id).length} colleges
                              </td>
                            </>
                          )}
                          
                          {currentView === 'colleges' && (
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {levels.filter(l => l.collegeId === item.id).length} levels
                            </td>
                          )}
                          
                          {currentView === 'levels' && (
                            <>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {item.defaultDuration || 'Not set'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {item.defaultCommissionRate ? `${(item.defaultCommissionRate * 100).toFixed(1)}%` : 'Not set'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-300">
                                {programs.filter(p => p.levelId === item.id).length} programs
                              </td>
                            </>
                          )}
                          
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-400 hover:text-red-300 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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

      {/* Bulk Action Modal Placeholder */}
      {bulkActionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Bulk Action</h2>
              <button
                onClick={() => setBulkActionModal({ isOpen: false, type: null, selectedPrograms: [] })}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                Apply changes to {selectedPrograms.length} selected programs
              </p>
              
              {bulkActionModal.type === 'field-of-study' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Field of Study</label>
                  <select className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                    {fieldsOfStudy.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.icon} {field.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setBulkActionModal({ isOpen: false, type: null, selectedPrograms: [] })}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeBulkAction({})}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgramsPage;
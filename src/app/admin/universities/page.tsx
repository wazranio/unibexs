'use client';

import React, { useState, useEffect } from 'react';
import { University, College, Program, Level, EnhancedProgram, FieldOfStudy } from '@/types';
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
  Plus,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  School,
  X,
  Users,
  Eye,
  Copy,
  Archive,
  RefreshCw,
  Settings,
  Layers,
  Target,
  Filter
} from 'lucide-react';

type ViewState = 'universities' | 'colleges' | 'levels' | 'programs';

interface NavigationLevel {
  type: ViewState;
  id?: string;
  name: string;
}

const UniversitiesPage: React.FC = () => {
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Bulk operations for programs
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    fieldOfStudy: '',
    isActive: 'all' as 'all' | 'active' | 'inactive',
    hasOverrides: 'all' as 'all' | 'yes' | 'no'
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'university',
    country: '',
    description: '',
    logo: '',
    
    // Level-specific fields
    displayName: '',
    defaultDuration: '',
    defaultCommissionRate: 0.15,
    defaultEnglishRequirements: {
      ielts: 6.0,
      toefl: 78,
      pte: 50,
      duolingo: 100
    },
    
    // Program-specific fields
    duration: '',
    fees: 0,
    currency: 'USD',
    intakes: [] as string[],
    requirements: [] as string[],
    programUrl: '',
    fieldOfStudyId: '',
    programCode: '',
    isActive: true,
    shortDescription: '',
    highlights: [] as string[],
    searchKeywords: [] as string[],
    
    // English requirements override (for programs)
    englishRequirements: {
      ielts: undefined as number | undefined,
      toefl: undefined as number | undefined,
      pte: undefined as number | undefined,
      duolingo: undefined as number | undefined
    },
    commissionRate: undefined as number | undefined,
    
    // Inheritance flags (for programs)
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: true
    }
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
        item.shortDescription?.toLowerCase().includes(searchTerm) ||
        item.country?.toLowerCase().includes(searchTerm) ||
        item.type?.toLowerCase().includes(searchTerm)
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
          logo: formData.logo,
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
      case 'levels':
        const newLevel: Level = {
          ...newItem,
          universityId: selectedUniversity!.id,
          collegeId: selectedCollege!.id,
          name: formData.name as 'Bachelor' | 'Master' | 'PhD' | 'Foundation' | 'Diploma' | 'Certificate',
          displayName: formData.displayName,
          defaultDuration: formData.defaultDuration,
          defaultCommissionRate: formData.defaultCommissionRate,
          defaultEnglishRequirements: formData.defaultEnglishRequirements,
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveLevel(newLevel);
        break;
      case 'programs':
        const newProgram: EnhancedProgram = {
          ...newItem,
          universityId: selectedUniversity!.id,
          collegeId: selectedCollege!.id,
          levelId: selectedLevel!.id,
          fieldOfStudyId: formData.fieldOfStudyId,
          fees: Number(formData.fees),
          programCode: formData.programCode,
          isActive: formData.isActive,
          shortDescription: formData.shortDescription,
          highlights: formData.highlights,
          searchKeywords: formData.searchKeywords,
          programUrl: formData.programUrl,
          inheritsFromLevel: formData.inheritsFromLevel,
          englishRequirements: formData.englishRequirements.ielts || formData.englishRequirements.toefl || formData.englishRequirements.pte || formData.englishRequirements.duolingo ? formData.englishRequirements : undefined,
          commissionRate: formData.commissionRate,
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveEnhancedProgram(newProgram);
        break;
    }

    loadData();
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    
    // Base form data that applies to all entities
    const baseFormData = {
      name: item.name || item.displayName || '',
      type: item.type || 'university',
      country: item.country || '',
      description: item.description || '',
      logo: item.logo || '',
      
      // Level-specific fields
      displayName: item.displayName || '',
      defaultDuration: item.defaultDuration || '',
      defaultCommissionRate: item.defaultCommissionRate || 0.15,
      defaultEnglishRequirements: item.defaultEnglishRequirements || {
        ielts: 6.0,
        toefl: 78,
        pte: 50,
        duolingo: 100
      },
      
      // Program-specific fields
      duration: item.duration || '',
      fees: item.fees || 0,
      currency: item.currency || 'USD',
      intakes: item.intakes || [],
      requirements: item.requirements || [],
      programUrl: item.programUrl || '',
      fieldOfStudyId: item.fieldOfStudyId || '',
      programCode: item.programCode || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
      shortDescription: item.shortDescription || '',
      highlights: item.highlights || [],
      searchKeywords: item.searchKeywords || [],
      
      // English requirements override (for programs)
      englishRequirements: item.englishRequirements || {
        ielts: undefined as number | undefined,
        toefl: undefined as number | undefined,
        pte: undefined as number | undefined,
        duolingo: undefined as number | undefined
      },
      commissionRate: item.commissionRate,
      
      // Inheritance flags (for programs)
      inheritsFromLevel: item.inheritsFromLevel || {
        duration: true,
        commission: true,
        englishRequirements: true
      }
    };
    
    setFormData(baseFormData);
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
        const updatedUniversity = {
          ...updatedItem,
          logo: formData.logo,
        };
        StorageService.updateUniversity(updatedUniversity);
        break;
      case 'colleges':
        StorageService.updateCollege(updatedItem);
        break;
      case 'levels':
        const updatedLevel = {
          ...updatedItem,
          name: formData.name as 'Bachelor' | 'Master' | 'PhD' | 'Foundation' | 'Diploma' | 'Certificate',
          displayName: formData.displayName,
          defaultDuration: formData.defaultDuration,
          defaultCommissionRate: formData.defaultCommissionRate,
          defaultEnglishRequirements: formData.defaultEnglishRequirements,
          updatedAt: new Date().toISOString(),
        };
        StorageService.updateLevel(updatedLevel);
        break;
      case 'programs':
        const updatedProgram = {
          ...updatedItem,
          fieldOfStudyId: formData.fieldOfStudyId,
          fees: Number(formData.fees),
          programCode: formData.programCode,
          isActive: formData.isActive,
          shortDescription: formData.shortDescription,
          highlights: formData.highlights,
          searchKeywords: formData.searchKeywords,
          programUrl: formData.programUrl,
          inheritsFromLevel: formData.inheritsFromLevel,
          englishRequirements: formData.englishRequirements.ielts || formData.englishRequirements.toefl || formData.englishRequirements.pte || formData.englishRequirements.duolingo ? formData.englishRequirements : undefined,
          commissionRate: formData.commissionRate,
          updatedAt: new Date().toISOString(),
        };
        StorageService.updateEnhancedProgram(updatedProgram);
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
        case 'levels':
          StorageService.deleteLevel(item.id);
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
      logo: '',
      
      // Level-specific fields
      displayName: '',
      defaultDuration: '',
      defaultCommissionRate: 0.15,
      defaultEnglishRequirements: {
        ielts: 6.0,
        toefl: 78,
        pte: 50,
        duolingo: 100
      },
      
      // Program-specific fields
      duration: '',
      fees: 0,
      currency: 'USD',
      intakes: [],
      requirements: [],
      programUrl: '',
      fieldOfStudyId: '',
      programCode: '',
      isActive: true,
      shortDescription: '',
      highlights: [],
      searchKeywords: [],
      
      // English requirements override (for programs)
      englishRequirements: {
        ielts: undefined as number | undefined,
        toefl: undefined as number | undefined,
        pte: undefined as number | undefined,
        duolingo: undefined as number | undefined
      },
      commissionRate: undefined as number | undefined,
      
      // Inheritance flags (for programs)
      inheritsFromLevel: {
        duration: true,
        commission: true,
        englishRequirements: true
      }
    });
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

  const getCreateButtonText = () => {
    switch (currentView) {
      case 'universities': return 'Add University';
      case 'colleges': return 'Add College';
      case 'levels': return 'Add Level';
      case 'programs': return 'Add Program';
    }
  };

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
                
                <h1 className="text-2xl font-bold text-white">{getCurrentTitle()}</h1>
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
                        className="p-1 text-white hover:bg-blue-700 rounded"
                        title="Bulk assign field of study"
                      >
                        <Target className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-white hover:bg-blue-700 rounded"
                        title="Bulk activate/deactivate"
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                      <button
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
                      : 'Try adjusting your search.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800">
                {/* Enhanced Programs Table */}
                {currentView === 'programs' ? (
                  <table className="min-w-full">
                    <thead className="bg-gray-750 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedPrograms.length === paginatedData.length && paginatedData.length > 0}
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
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      Code: {program.programCode || 'N/A'}
                                    </div>
                                    {program.programUrl && (
                                      <a
                                        href={program.programUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        title="View Program Details"
                                      >
                                        More Info ↗
                                      </a>
                                    )}
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
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">{program.duration}</span>
                                {!inheritanceStatus.duration.inherited && (
                                  <span className={`w-1.5 h-1.5 rounded-full bg-blue-400`} title="Custom Duration"></span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {program.currency} {program.fees?.toLocaleString() || '0'}
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
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${inheritanceStatus.duration.inherited ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                                  <span className="text-xs text-gray-400">D</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${inheritanceStatus.commission.inherited ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                                  <span className="text-xs text-gray-400">C</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${inheritanceStatus.englishRequirements.inherited ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                                  <span className="text-xs text-gray-400">E</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {InheritanceManager.hasOverrides(program) ? 'Customized' : 'Standard'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleEdit(program)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit Program"
                                >
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
                              <button 
                                onClick={() => handleEdit(item)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit Item"
                              >
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://university.edu/logo.png"
                    />
                  </div>
                </>
              )}

              {currentView === 'levels' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Level Type</label>
                    <select
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Level Type</option>
                      <option value="Foundation">Foundation</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bachelor's Degree, Master's Degree"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default Duration</label>
                    <input
                      type="text"
                      value={formData.defaultDuration}
                      onChange={(e) => setFormData({...formData, defaultDuration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3 years, 2 years, 1.5-2 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={(formData.defaultCommissionRate * 100).toFixed(2)}
                      onChange={(e) => setFormData({...formData, defaultCommissionRate: Number(e.target.value) / 100})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="15.00"
                    />
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 bg-gray-750">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Default English Requirements</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">IELTS</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="9"
                          value={formData.defaultEnglishRequirements.ielts}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              ielts: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">TOEFL</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={formData.defaultEnglishRequirements.toefl}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              toefl: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">PTE</label>
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={formData.defaultEnglishRequirements.pte}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              pte: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Duolingo</label>
                        <input
                          type="number"
                          min="0"
                          max="160"
                          value={formData.defaultEnglishRequirements.duolingo}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              duolingo: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentView === 'programs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Field of Study</label>
                    <select
                      value={formData.fieldOfStudyId}
                      onChange={(e) => setFormData({...formData, fieldOfStudyId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Field of Study</option>
                      {fieldsOfStudy.map(field => (
                        <option key={field.id} value={field.id}>
                          {field.icon} {field.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Program Code</label>
                      <input
                        type="text"
                        value={formData.programCode}
                        onChange={(e) => setFormData({...formData, programCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., CS-101, ENG-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        value={formData.isActive.toString()}
                        onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief program description for listings"
                    />
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Program URL</label>
                    <input
                      type="url"
                      value={formData.programUrl}
                      onChange={(e) => setFormData({...formData, programUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://university.edu/programs/program-name"
                    />
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
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://university.edu/logo.png"
                    />
                  </div>
                </>
              )}

              {currentView === 'levels' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Level Type</label>
                    <select
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Level Type</option>
                      <option value="Foundation">Foundation</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bachelor's Degree, Master's Degree"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default Duration</label>
                    <input
                      type="text"
                      value={formData.defaultDuration}
                      onChange={(e) => setFormData({...formData, defaultDuration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3 years, 2 years, 1.5-2 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={(formData.defaultCommissionRate * 100).toFixed(2)}
                      onChange={(e) => setFormData({...formData, defaultCommissionRate: Number(e.target.value) / 100})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="15.00"
                    />
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 bg-gray-750">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Default English Requirements</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">IELTS</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="9"
                          value={formData.defaultEnglishRequirements.ielts}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              ielts: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">TOEFL</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={formData.defaultEnglishRequirements.toefl}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              toefl: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">PTE</label>
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={formData.defaultEnglishRequirements.pte}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              pte: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Duolingo</label>
                        <input
                          type="number"
                          min="0"
                          max="160"
                          value={formData.defaultEnglishRequirements.duolingo}
                          onChange={(e) => setFormData({
                            ...formData, 
                            defaultEnglishRequirements: {
                              ...formData.defaultEnglishRequirements,
                              duolingo: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Program URL</label>
                    <input
                      type="url"
                      value={formData.programUrl}
                      onChange={(e) => setFormData({...formData, programUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://university.edu/programs/program-name"
                    />
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
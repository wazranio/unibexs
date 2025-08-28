'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedProgram, University, College, Level, FieldOfStudy } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { InheritanceManager } from '@/lib/utils/inheritance-manager';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/auth';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  DollarSign,
  Calendar,
  Award,
  MapPin,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface ProgramAnalyticsCardProps {
  title: string;
  value: number;
  color: string;
  icon: string;
  subtitle?: string;
}

function ProgramAnalyticsCard({ title, value, color, icon, subtitle }: ProgramAnalyticsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
          {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

interface SmartSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  popularSearches: string[];
}

function SmartSearchBar({ query, onQueryChange, onSearch, popularSearches }: SmartSearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="What does your student want to study? (e.g., cybersecurity, business, medicine)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="w-full pl-12 pr-4 py-4 text-lg border border-gray-600 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg"
        />
        <button
          onClick={onSearch}
          className="absolute right-3 top-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
      
      {showSuggestions && popularSearches.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
          <div className="p-3 border-b border-gray-700">
            <p className="text-sm text-gray-400 font-medium">Popular Searches</p>
          </div>
          <div className="p-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  onQueryChange(search);
                  setShowSuggestions(false);
                  onSearch();
                }}
                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-blue-400 mr-2">🔍</span>
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterSidebarProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  fieldsOfStudy: FieldOfStudy[];
  universities: University[];
  countries: string[];
  resultCount: number;
}

function FilterSidebar({ filters, onFiltersChange, fieldsOfStudy, universities, countries, resultCount }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const clearFilters = () => {
    onFiltersChange({
      fieldOfStudyIds: [],
      levelNames: [],
      universityIds: [],
      countries: [],
      intakes: [],
      minFees: '',
      maxFees: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.fieldOfStudyIds.length > 0 || 
           filters.levelNames.length > 0 || 
           filters.universityIds.length > 0 ||
           filters.countries.length > 0 ||
           filters.intakes.length > 0 ||
           filters.minFees || 
           filters.maxFees;
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-400">{resultCount} programs found</p>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Field of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Field of Study</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fieldsOfStudy.map((field) => (
                <label key={field.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.fieldOfStudyIds.includes(field.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...filters.fieldOfStudyIds, field.id]
                        : filters.fieldOfStudyIds.filter((id: string) => id !== field.id);
                      onFiltersChange({ ...filters, fieldOfStudyIds: newIds });
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-300 flex items-center">
                    <span className="mr-2">{field.icon}</span>
                    {field.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Academic Level</label>
            <div className="space-y-2">
              {['Foundation', 'Bachelor', 'Master', 'PhD'].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.levelNames.includes(level)}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...filters.levelNames, level]
                        : filters.levelNames.filter((l: string) => l !== level);
                      onFiltersChange({ ...filters, levelNames: newLevels });
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-300">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Universities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">University</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {universities.map((university) => (
                <label key={university.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.universityIds.includes(university.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...filters.universityIds, university.id]
                        : filters.universityIds.filter((id: string) => id !== university.id);
                      onFiltersChange({ ...filters, universityIds: newIds });
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-300">{university.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Country</label>
            <div className="space-y-2">
              {countries.map((country) => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.countries.includes(country)}
                    onChange={(e) => {
                      const newCountries = e.target.checked
                        ? [...filters.countries, country]
                        : filters.countries.filter((c: string) => c !== country);
                      onFiltersChange({ ...filters, countries: newCountries });
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-300">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intakes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Intake Period</label>
            <div className="space-y-2">
              {['January', 'February', 'March', 'April', 'May', 'July', 'August', 'September', 'October', 'November'].map((intake) => (
                <label key={intake} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.intakes.includes(intake)}
                    onChange={(e) => {
                      const newIntakes = e.target.checked
                        ? [...filters.intakes, intake]
                        : filters.intakes.filter((i: string) => i !== intake);
                      onFiltersChange({ ...filters, intakes: newIntakes });
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-300">{intake}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tuition Fee Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Annual Tuition Fee (MYR)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minFees}
                onChange={(e) => onFiltersChange({ ...filters, minFees: e.target.value })}
                className="px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxFees}
                onChange={(e) => onFiltersChange({ ...filters, maxFees: e.target.value })}
                className="px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProgramCardProps {
  program: EnhancedProgram;
  university: University;
  college?: College;
  level: Level;
  fieldOfStudy: FieldOfStudy;
  onViewDetails: (program: EnhancedProgram) => void;
  onQuickApply: (program: EnhancedProgram) => void;
}

function ProgramCard({ program, university, college, level, fieldOfStudy, onViewDetails, onQuickApply }: ProgramCardProps) {
  const effectiveValues = InheritanceManager.getEffectiveValues(program);
  
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{program.name}</h3>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{university.name}</span>
              {college && <span className="mx-1">•</span>}
              {college && <span>{college.name}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-lg mr-2">{fieldOfStudy.icon}</span>
          <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded-full font-medium">
            {fieldOfStudy.name}
          </span>
        </div>
      </div>

      {/* Description */}
      {program.shortDescription && (
        <p className="text-gray-300 text-sm mb-4">{program.shortDescription}</p>
      )}

      {/* Highlights */}
      {program.highlights && program.highlights.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {program.highlights.slice(0, 3).map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full border border-green-700"
              >
                <Star className="w-3 h-3 mr-1" />
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Information Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-gray-400 text-xs">Duration</p>
            <p className="text-white text-sm font-medium">{effectiveValues.duration}</p>
          </div>
        </div>

        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-gray-400 text-xs">Annual Fee</p>
            <p className="text-white text-sm font-medium">
              {program.currency} {program.fees.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Award className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-gray-400 text-xs">Level</p>
            <p className="text-white text-sm font-medium">{level.displayName}</p>
          </div>
        </div>

        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-gray-400 text-xs">Next Intake</p>
            <p className="text-white text-sm font-medium">
              {program.intakes.length > 0 ? program.intakes[0] : 'TBA'}
            </p>
          </div>
        </div>
      </div>

      {/* Intakes */}
      {program.intakes.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">Available Intakes</p>
          <div className="flex flex-wrap gap-1">
            {program.intakes.map((intake, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-md border border-blue-700"
              >
                {intake}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* English Requirements */}
      {effectiveValues.englishRequirements && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">English Requirements</p>
          <div className="flex items-center space-x-4 text-sm">
            {effectiveValues.englishRequirements.ielts && (
              <span className="text-white">
                IELTS: <strong>{effectiveValues.englishRequirements.ielts}</strong>
              </span>
            )}
            {effectiveValues.englishRequirements.toefl && (
              <span className="text-white">
                TOEFL: <strong>{effectiveValues.englishRequirements.toefl}</strong>
              </span>
            )}
            {effectiveValues.englishRequirements.pte && (
              <span className="text-white">
                PTE: <strong>{effectiveValues.englishRequirements.pte}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => onViewDetails(program)}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
        </button>
        <button
          onClick={() => onQuickApply(program)}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Quick Apply
        </button>
      </div>
    </div>
  );
}

export default function PartnerKnowledgeHubPage() {
  const { isAdmin } = useAuth();
  
  // State
  const [programs, setPrograms] = useState<EnhancedProgram[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<EnhancedProgram[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    fieldOfStudyIds: [] as string[],
    levelNames: [] as string[],
    universityIds: [] as string[],
    countries: [] as string[],
    intakes: [] as string[],
    minFees: '',
    maxFees: ''
  });

  // Popular searches for suggestions
  const popularSearches = [
    'cybersecurity',
    'business administration',
    'computer science',
    'medicine',
    'engineering',
    'marketing',
    'data science',
    'artificial intelligence'
  ];

  // Analytics
  const analytics = {
    totalPrograms: programs.filter(p => p.isActive).length,
    universities: new Set(programs.filter(p => p.isActive).map(p => p.universityId)).size,
    countries: new Set(universities.map(u => u.country)).size,
    avgFees: programs.filter(p => p.isActive).length > 0 
      ? Math.round(programs.filter(p => p.isActive).reduce((sum, p) => sum + p.fees, 0) / programs.filter(p => p.isActive).length) 
      : 0
  };

  const countries = Array.from(new Set(universities.map(u => u.country))).sort();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [programs, searchQuery, filters]);

  const loadData = () => {
    try {
      const programsData = StorageService.getEnhancedPrograms({ isActive: true });
      const universitiesData = StorageService.getUniversities();
      const collegesData = StorageService.getColleges();
      const levelsData = StorageService.getLevels();
      const fieldsData = StorageService.getFieldsOfStudy();
      
      setPrograms(programsData);
      setUniversities(universitiesData);
      setColleges(collegesData);
      setLevels(levelsData);
      setFieldsOfStudy(fieldsData);
    } catch (error) {
      console.error('Error loading programs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    const searchFilters = {
      fieldOfStudyIds: filters.fieldOfStudyIds.length > 0 ? filters.fieldOfStudyIds : undefined,
      levelIds: filters.levelNames.length > 0 
        ? levels.filter(l => filters.levelNames.includes(l.name)).map(l => l.id)
        : undefined,
      universityIds: filters.universityIds.length > 0 ? filters.universityIds : undefined,
      countries: filters.countries.length > 0 ? filters.countries : undefined,
      intakes: filters.intakes.length > 0 ? filters.intakes : undefined,
      minFees: filters.minFees ? parseFloat(filters.minFees) : undefined,
      maxFees: filters.maxFees ? parseFloat(filters.maxFees) : undefined,
    };

    const filtered = StorageService.searchEnhancedPrograms(searchQuery, searchFilters);
    setFilteredPrograms(filtered);
  };

  const handleSearch = () => {
    filterPrograms();
  };

  const handleViewDetails = (program: EnhancedProgram) => {
    // Navigate to program details page
    console.log('View details for:', program.name);
  };

  const handleQuickApply = (program: EnhancedProgram) => {
    // Open quick application modal
    console.log('Quick apply for:', program.name);
  };

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
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex">
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          fieldsOfStudy={fieldsOfStudy}
          universities={universities}
          countries={countries}
          resultCount={filteredPrograms.length}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gray-800 shadow-sm border-b border-gray-700 p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-2">Program Discovery Hub</h1>
              <p className="text-gray-300 mb-6">Find the perfect academic program for your students</p>
              
              <SmartSearchBar
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
                popularSearches={popularSearches}
              />
            </div>
          </header>

          {/* Analytics */}
          <div className="p-6 border-b border-gray-700">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ProgramAnalyticsCard
                  title="Available Programs"
                  value={analytics.totalPrograms}
                  color="bg-purple-500"
                  icon="📚"
                />
                <ProgramAnalyticsCard
                  title="Universities"
                  value={analytics.universities}
                  color="bg-blue-500"
                  icon="🏛️"
                />
                <ProgramAnalyticsCard
                  title="Countries"
                  value={analytics.countries}
                  color="bg-green-500"
                  icon="🌍"
                />
                <ProgramAnalyticsCard
                  title="Avg Fee (MYR)"
                  value={analytics.avgFees}
                  color="bg-orange-500"
                  icon="💰"
                  subtitle="per year"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No programs found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or filters</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {filteredPrograms.length} Program{filteredPrograms.length !== 1 ? 's' : ''} Found
                    </h2>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Sorted by relevance</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPrograms.map((program) => {
                      const university = universities.find(u => u.id === program.universityId);
                      const college = colleges.find(c => c.id === program.collegeId);
                      const level = levels.find(l => l.id === program.levelId);
                      const fieldOfStudy = fieldsOfStudy.find(f => f.id === program.fieldOfStudyId);
                      
                      if (!university || !level || !fieldOfStudy) return null;
                      
                      return (
                        <ProgramCard
                          key={program.id}
                          program={program}
                          university={university}
                          college={college}
                          level={level}
                          fieldOfStudy={fieldOfStudy}
                          onViewDetails={handleViewDetails}
                          onQuickApply={handleQuickApply}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
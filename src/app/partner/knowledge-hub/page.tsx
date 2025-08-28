'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedProgram, University, College, Level, FieldOfStudy } from '@/types';
import { StorageService } from '@/lib/data/storage';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/auth';
import {
  Search,
  BookOpen,
  Clock,
  DollarSign,
  Calendar,
  Award,
  Star,
  ExternalLink,
  ChevronDown,
  Sparkles,
  TrendingUp,
  FileText,
  HelpCircle,
  Calculator,
  Download,
  Users,
  Building,
  GraduationCap,
  Globe
} from 'lucide-react';

type TabType = 'programs' | 'resources' | 'qa' | 'commission';

const PartnerKnowledgeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('programs');
  const [programs, setPrograms] = useState<EnhancedProgram[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Program discovery state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    fieldOfStudyIds: [] as string[],
    levelNames: [] as string[],
    universityIds: [] as string[],
    countries: [] as string[],
    intakes: [] as string[],
    minFees: '',
    maxFees: ''
  });
  const [filteredPrograms, setFilteredPrograms] = useState<EnhancedProgram[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'programs') {
      filterPrograms();
    }
  }, [programs, searchQuery, filters, activeTab]);

  const loadData = async () => {
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
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    // Apply search query
    if (searchQuery) {
      filtered = StorageService.searchEnhancedPrograms(searchQuery, {
        fieldOfStudyIds: filters.fieldOfStudyIds,
        universityIds: filters.universityIds,
        minFees: filters.minFees ? parseFloat(filters.minFees) : undefined,
        maxFees: filters.maxFees ? parseFloat(filters.maxFees) : undefined,
      });
    }

    setFilteredPrograms(filtered);
  };

  const tabs = [
    { id: 'programs' as TabType, name: 'Programs', icon: GraduationCap, count: programs.length },
    { id: 'resources' as TabType, name: 'Resources', icon: FileText, count: 24 },
    { id: 'qa' as TabType, name: 'Q&A', icon: HelpCircle, count: 47 },
    { id: 'commission' as TabType, name: 'Commission', icon: DollarSign, count: null }
  ];

  const renderProgramsTab = () => (
    <div className="flex flex-col min-h-full">
      {/* Search and Filters */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for programs, universities, or fields of study..."
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Field of Study Filter */}
              <div className="relative">
                <select 
                  onChange={(e) => {
                    const fieldId = e.target.value;
                    if (fieldId && !filters.fieldOfStudyIds.includes(fieldId)) {
                      setFilters({
                        ...filters,
                        fieldOfStudyIds: [...filters.fieldOfStudyIds, fieldId]
                      });
                    }
                    e.target.value = '';
                  }}
                  className="appearance-none bg-gray-700 border border-gray-600 text-white px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Field of Study</option>
                  {fieldsOfStudy.filter(f => !filters.fieldOfStudyIds.includes(f.id)).map((field) => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* University Filter */}
              <div className="relative">
                <select 
                  onChange={(e) => {
                    const uniId = e.target.value;
                    if (uniId && !filters.universityIds.includes(uniId)) {
                      setFilters({
                        ...filters,
                        universityIds: [...filters.universityIds, uniId]
                      });
                    }
                    e.target.value = '';
                  }}
                  className="appearance-none bg-gray-700 border border-gray-600 text-white px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">University</option>
                  {universities.filter(u => !filters.universityIds.includes(u.id)).map((university) => (
                    <option key={university.id} value={university.id}>{university.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Fee Range Inputs */}
              <input
                type="number"
                value={filters.minFees}
                onChange={(e) => setFilters({ ...filters, minFees: e.target.value })}
                className="w-24 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min Fee"
              />
              <input
                type="number"
                value={filters.maxFees}
                onChange={(e) => setFilters({ ...filters, maxFees: e.target.value })}
                className="w-24 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Max Fee"
              />
            </div>

            {/* Results Counter */}
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">{filteredPrograms.length}</span> programs found
            </div>
          </div>

          {/* Active Filter Pills */}
          {(filters.fieldOfStudyIds.length > 0 || filters.universityIds.length > 0 || filters.minFees || filters.maxFees) && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              
              {/* Field Pills */}
              {filters.fieldOfStudyIds.map((fieldId) => {
                const field = fieldsOfStudy.find(f => f.id === fieldId);
                return (
                  <span
                    key={fieldId}
                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                  >
                    {field?.name}
                    <button
                      onClick={() => setFilters({
                        ...filters,
                        fieldOfStudyIds: filters.fieldOfStudyIds.filter(id => id !== fieldId)
                      })}
                      className="ml-1 hover:text-gray-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}

              {/* University Pills */}
              {filters.universityIds.map((uniId) => {
                const university = universities.find(u => u.id === uniId);
                return (
                  <span
                    key={uniId}
                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                  >
                    {university?.name}
                    <button
                      onClick={() => setFilters({
                        ...filters,
                        universityIds: filters.universityIds.filter(id => id !== uniId)
                      })}
                      className="ml-1 hover:text-gray-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}

              {/* Fee Range Pill */}
              {(filters.minFees || filters.maxFees) && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  ${filters.minFees || '0'} - ${filters.maxFees || '∞'}
                  <button
                    onClick={() => setFilters({ ...filters, minFees: '', maxFees: '' })}
                    className="ml-1 hover:text-gray-300 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Clear All */}
              <button
                onClick={() => setFilters({
                  fieldOfStudyIds: [],
                  levelNames: [],
                  universityIds: [],
                  countries: [],
                  intakes: [],
                  minFees: '',
                  maxFees: ''
                })}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col bg-gray-900">
        {/* Stats Cards */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center">
                <GraduationCap className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Total Programs</p>
                  <p className="text-white text-xl font-bold">{programs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center">
                <Building className="w-6 h-6 text-green-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Universities</p>
                  <p className="text-white text-xl font-bold">{universities.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-purple-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Countries</p>
                  <p className="text-white text-xl font-bold">{new Set(universities.map(u => u.country)).size}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center">
                <Star className="w-6 h-6 text-yellow-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Fields of Study</p>
                  <p className="text-white text-xl font-bold">{fieldsOfStudy.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => {
              const university = universities.find(u => u.id === program.universityId);
              const college = colleges.find(c => c.id === program.collegeId);
              const field = fieldsOfStudy.find(f => f.id === program.fieldOfStudyId);
              const level = levels.find(l => l.id === program.levelId);
              
              return (
                <div key={program.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{field?.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{program.name}</h3>
                        <p className="text-gray-400 text-sm">{university?.name}</p>
                        <p className="text-gray-500 text-xs">{college?.name}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">{level?.name}</span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{program.shortDescription}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Duration</span>
                      </div>
                      <span className="text-white font-medium">{program.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>Fees</span>
                      </div>
                      <span className="text-white font-medium">{program.currency} {program.fees?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );

  const renderResourcesTab = () => (
    <div className="p-6 bg-gray-900 min-h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Resource Materials</h2>
        <p className="text-gray-400">Everything you need to guide your students successfully</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'University Guides', desc: 'Comprehensive guides for each university with detailed information about courses, facilities, and admission requirements', icon: Building, count: 24, iconColor: 'text-blue-400' },
          { title: 'Application Process', desc: 'Step-by-step application procedures and document requirements for different countries', icon: FileText, count: 18, iconColor: 'text-green-400' },
          { title: 'Visa Guidelines', desc: 'Country-specific visa requirements, processing times, and application procedures', icon: Globe, count: 12, iconColor: 'text-purple-400' },
          { title: 'Student Support', desc: 'Pre-departure briefings, accommodation guides, and student support resources', icon: Users, count: 15, iconColor: 'text-orange-400' },
          { title: 'Commission Guides', desc: 'Detailed commission structures, payment processes, and calculation methods', icon: DollarSign, count: 8, iconColor: 'text-yellow-400' },
          { title: 'Marketing Materials', desc: 'Brochures, presentations, and promotional materials for student recruitment', icon: Download, count: 32, iconColor: 'text-pink-400' }
        ].map((resource, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <resource.icon className={`w-6 h-6 ${resource.iconColor} mr-3`} />
              <div>
                <h3 className="text-white font-semibold text-lg">{resource.title}</h3>
                <span className="text-gray-400 text-sm">{resource.count} resources</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{resource.desc}</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
              View All
            </button>
          </div>
        ))}
      </div>

      {/* Featured Resources */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Featured Resources</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold">Quick Start Guide</h4>
                <p className="text-gray-400 text-sm">Get started with UniBexs platform</p>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold">Success Stories</h4>
                <p className="text-gray-400 text-sm">Learn from successful student placements</p>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Case Studies
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQATab = () => (
    <div className="p-6 bg-gray-900 min-h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Q&A Section</h2>
        <p className="text-gray-400">Find answers to frequently asked questions</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search questions and answers..."
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['All', 'Applications', 'Visa', 'Commission', 'Universities', 'Documents'].map((category, idx) => (
            <button
              key={idx}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                idx === 0 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {[
          { 
            q: 'What documents are required for UK university applications?', 
            a: 'UK university applications typically require: Academic transcripts and certificates, English proficiency test scores (IELTS/TOEFL), Personal statement, Two academic references, Passport copy, and Financial proof. Some courses may require additional documents like portfolios or work experience certificates.', 
            category: 'Applications',
            helpful: 142,
            updated: '2 days ago'
          },
          { 
            q: 'How long does visa processing take for Malaysia?', 
            a: 'Malaysian student visa (eVAL) processing typically takes 2-4 weeks from the date of submission. However, this can vary based on the university, completeness of documents, and current processing volumes. We recommend applying at least 6-8 weeks before your intended travel date.', 
            category: 'Visa',
            helpful: 98,
            updated: '1 week ago'
          },
          { 
            q: 'What are the commission rates for engineering programs?', 
            a: 'Engineering programs typically offer commission rates between 15-20% depending on the university and program level. Bachelor programs usually offer 15-18%, while Master programs can offer up to 20%. PhD programs may have different structures. Check the specific program details for exact rates.', 
            category: 'Commission',
            helpful: 76,
            updated: '3 days ago'
          },
          { 
            q: 'Can students apply for multiple programs simultaneously?', 
            a: 'Yes, students can apply for multiple programs through our platform. We recommend applying to 3-5 programs to maximize chances of acceptance. Each application is processed independently, and students can choose their preferred offer once acceptances are received.', 
            category: 'Applications',
            helpful: 134,
            updated: '5 days ago'
          },
          { 
            q: 'What support is available for visa interview preparation?', 
            a: 'We provide comprehensive visa interview preparation including: Mock interview sessions, Common question practice, Document preparation guidance, Tips for successful interviews, and Country-specific requirements briefing. Contact your assigned counselor to schedule a prep session.', 
            category: 'Visa',
            helpful: 89,
            updated: '1 week ago'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-semibold text-lg pr-4">{item.q}</h3>
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium whitespace-nowrap">
                {item.category}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{item.a}</p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-400">
                  <span className="mr-1">👍</span>
                  <span>{item.helpful} helpful</span>
                </div>
                <div className="text-gray-500">
                  Updated {item.updated}
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
                View Full Answer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question CTA */}
      <div className="mt-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <HelpCircle className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Can&apos;t find your answer?</h3>
          <p className="text-gray-400 mb-4">Ask our expert team and get personalized assistance</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
            Ask a Question
          </button>
        </div>
      </div>
    </div>
  );

  const renderCommissionTab = () => (
    <div className="p-6 bg-gray-900 min-h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Commission Structure</h2>
        <p className="text-gray-400">Understand your earning potential and commission rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commission Calculator */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Calculator className="w-6 h-6 text-blue-400 mr-3" />
            <div>
              <h3 className="text-white font-semibold text-lg">Commission Calculator</h3>
              <p className="text-gray-400 text-sm">Calculate your potential earnings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Program Fees (USD)</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter program fees"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Calculate Commission
            </button>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="w-6 h-6 text-green-400 mr-3" />
            <div>
              <h3 className="text-white font-semibold text-lg">Rate Structure</h3>
              <p className="text-gray-400 text-sm">Commission rates by program level</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { level: 'Foundation', rate: '12-15%', description: 'Pre-university programs' },
              { level: 'Bachelor', rate: '15-18%', description: 'Undergraduate degrees' },
              { level: 'Master', rate: '18-22%', description: 'Postgraduate programs' },
              { level: 'PhD', rate: '20-25%', description: 'Doctoral programs' }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">{item.level}</span>
                  <span className="text-white font-bold text-lg">{item.rate}</span>
                </div>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earning Potential */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Your Earning Potential</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Monthly Average</h4>
            <p className="text-white text-2xl font-bold mb-1">$2,400</p>
            <p className="text-gray-400 text-sm">Based on 8 applications</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Star className="w-6 h-6 text-orange-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Top Performers</h4>
            <p className="text-white text-2xl font-bold mb-1">$8,500</p>
            <p className="text-gray-400 text-sm">Per month average</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Award className="w-6 h-6 text-green-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Bonus Eligible</h4>
            <p className="text-white text-2xl font-bold mb-1">+25%</p>
            <p className="text-gray-400 text-sm">For 15+ applications</p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-blue-400 mr-3" />
            <div>
              <h3 className="text-white font-semibold text-lg">Payment Schedule</h3>
              <p className="text-gray-400 text-sm">When you get paid</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Application Submission</span>
              <span className="text-white font-medium">30% advance</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Visa Approval</span>
              <span className="text-white font-medium">50% payment</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">Student Arrival</span>
              <span className="text-white font-medium">20% final payment</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Download className="w-6 h-6 text-green-400 mr-3" />
            <div>
              <h3 className="text-white font-semibold text-lg">Resources</h3>
              <p className="text-gray-400 text-sm">Download helpful materials</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors text-left">
              <div>
                <p className="text-white font-medium">Commission Guide 2024</p>
                <p className="text-gray-400 text-sm">Complete commission handbook</p>
              </div>
              <Download className="w-4 h-4 text-green-400" />
            </button>
            
            <button className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors text-left">
              <div>
                <p className="text-white font-medium">Payment Terms</p>
                <p className="text-gray-400 text-sm">Detailed payment conditions</p>
              </div>
              <Download className="w-4 h-4 text-green-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={false} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <BookOpen className="w-6 h-6 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Knowledge Hub</h1>
              </div>
              <p className="text-gray-400 text-sm">Your comprehensive resource center for student success</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Welcome back,</p>
              <p className="text-white font-medium">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 px-8">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium transition-colors rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'programs' && renderProgramsTab()}
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'qa' && renderQATab()}
          {activeTab === 'commission' && renderCommissionTab()}
        </div>
      </div>
    </div>
  );
};

export default PartnerKnowledgeHub;
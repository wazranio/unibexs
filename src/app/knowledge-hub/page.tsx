'use client';

import React, { useState, useEffect } from 'react';
import { Program, University, College } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  BookOpen,
  Building,
  GraduationCap,
  Clock,
  DollarSign,
  Calendar,
  Eye,
  ChevronRight,
  Users,
} from 'lucide-react';

type TabType = 'programs' | 'guides' | 'tips' | 'success';

const KnowledgeHubPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('programs');
  const [loading, setLoading] = useState(true);

  // Programs data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Educational Resources data
  const [studyGuides] = useState([
    { id: 1, title: 'Complete Application Guide', category: 'Application', content: 'Step-by-step guide to submitting successful applications', duration: '30 min read' },
    { id: 2, title: 'Visa Interview Preparation', category: 'Visa', content: 'Master the visa interview process with confidence', duration: '45 min read' },
    { id: 3, title: 'IELTS Success Strategies', category: 'Language', content: 'Proven techniques to achieve your target IELTS score', duration: '60 min read' },
    { id: 4, title: 'Scholarship Hunting Guide', category: 'Finance', content: 'Find and secure scholarships for your students', duration: '40 min read' },
    { id: 5, title: 'Document Checklist Master', category: 'Documentation', content: 'Never miss a document with our comprehensive lists', duration: '25 min read' },
    { id: 6, title: 'SOP Writing Excellence', category: 'Writing', content: 'Craft compelling statements of purpose', duration: '50 min read' }
  ]);
  
  const [applicationTips] = useState([
    { id: 1, title: 'Best Application Timeline', tip: 'Start applications 8-12 months before intended start date', category: 'Timing' },
    { id: 2, title: 'Common Application Mistakes', tip: 'Avoid these 10 critical errors that lead to rejections', category: 'Mistakes' },
    { id: 3, title: 'University Selection Strategy', tip: 'Apply to 2 reach, 3 target, and 2 safety schools', category: 'Strategy' },
    { id: 4, title: 'Document Authentication', tip: 'Always get official translations and attestations', category: 'Documents' },
    { id: 5, title: 'Financial Planning', tip: 'Budget 20% extra for unexpected costs and delays', category: 'Finance' },
    { id: 6, title: 'Communication with Universities', tip: 'Professional emails can make a difference', category: 'Communication' }
  ]);

  const [successStories] = useState([
    { id: 1, student: 'Ahmad Hassan', country: 'Malaysia', university: 'University of Melbourne', program: 'Computer Science', story: 'Overcame financial challenges to secure a full scholarship through strategic application timing and exceptional SOP.' },
    { id: 2, student: 'Sarah Chen', country: 'Australia', university: 'Imperial College London', program: 'Biomedical Engineering', story: 'Transformed rejection into acceptance by improving English proficiency and reapplying with stronger profile.' },
    { id: 3, student: 'Mohamed Ali', country: 'UAE', university: 'University of Toronto', program: 'Business Administration', story: 'Leveraged professional experience and leadership skills to stand out among 5000+ applicants.' },
    { id: 4, student: 'Lisa Wang', country: 'Singapore', university: 'Harvard Medical School', program: 'Medicine', story: 'Combined research experience with community service to create a compelling narrative for admission.' }
  ]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  // Filter programs
  useEffect(() => {
    let filtered = programs;

    if (programSearchQuery) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(programSearchQuery.toLowerCase()) ||
        getUniversityName(program.universityId).toLowerCase().includes(programSearchQuery.toLowerCase()) ||
        program.duration.toLowerCase().includes(programSearchQuery.toLowerCase())
      );
    }

    if (selectedUniversity) {
      filtered = filtered.filter(program => program.universityId === selectedUniversity);
    }

    setFilteredPrograms(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs, programSearchQuery, selectedUniversity, universities]);


  const loadData = () => {
    try {
      // Load programs data
      const programsData = StorageService.getPrograms();
      const universitiesData = StorageService.getUniversities();
      const collegesData = StorageService.getColleges();
      
      setPrograms(programsData);
      setUniversities(universitiesData);
      setColleges(collegesData);
    } catch (error) {
      console.error('Error loading knowledge hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniversityName = (universityId: string) => {
    const university = universities.find(u => u.id === universityId);
    return university?.name || 'Unknown University';
  };

  const getCollegeName = (collegeId?: string) => {
    if (!collegeId) return null;
    const college = colleges.find(c => c.id === collegeId);
    return college?.name || 'Unknown College';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'application': return '📋';
      case 'visa': return '✈️';
      case 'language': return '🗣️';
      case 'finance': return '💰';
      case 'documentation': return '📄';
      case 'writing': return '✍️';
      case 'timing': return '⏰';
      case 'mistakes': return '⚠️';
      case 'strategy': return '🎯';
      case 'communication': return '💬';
      default: return '📚';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      // Fallback for invalid currency codes
      return `${currency} ${amount.toLocaleString()}`;
    }
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Knowledge Hub</h1>
                <p className="text-gray-300">
                  Access programs and educational resources for your applications
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-2">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('programs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'programs'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Programs ({programs.length})
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Study Guides ({studyGuides.length})
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tips'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Pro Tips ({applicationTips.length})
            </button>
            <button
              onClick={() => setActiveTab('success')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'success'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Success Stories ({successStories.length})
            </button>
          </nav>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          {activeTab === 'programs' && (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search programs, universities, or duration..."
                    value={programSearchQuery}
                    onChange={(e) => setProgramSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Universities</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'programs' && (
            <div className="px-6 py-6">
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-300">No programs found</h3>
                  <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map((program) => (
                    <div key={program.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-lg font-semibold text-white line-clamp-2">{program.name}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{getUniversityName(program.universityId)}</span>
                        </div>
                        
                        {getCollegeName(program.collegeId) && (
                          <div className="flex items-center text-sm text-gray-300">
                            <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{getCollegeName(program.collegeId)}</span>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          {program.duration}
                        </div>

                        <div className="flex items-center text-sm text-gray-300">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          {formatCurrency(program.fees, program.currency)}
                        </div>

                        <div className="flex items-center text-sm text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          {program.intakes.length} intakes: {program.intakes.slice(0, 2).join(', ')}
                          {program.intakes.length > 2 && '...'}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyGuides.map((guide) => (
                    <div key={guide.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">
                            {getCategoryIcon(guide.category)}
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-lg font-semibold text-white">{guide.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200 mt-1">
                              {guide.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{guide.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">{guide.duration}</span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Read Guide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {applicationTips.map((tip) => (
                    <div key={tip.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                      <div className="flex items-start mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl mr-3">
                          {getCategoryIcon(tip.category)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{tip.title}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                            {tip.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 bg-gray-700 p-4 rounded-lg italic">
                        💡 {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'success' && (
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {successStories.map((story) => (
                    <div key={story.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-semibold text-white">{story.student}</h3>
                          <p className="text-sm text-gray-300">{story.country} → {story.university}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200 mt-1">
                            {story.program}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">
                        &quot;{story.story}&quot;
                      </p>
                      <div className="flex justify-end mt-4">
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          Read Full Story →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Program Details</h2>
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Program Header */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{selectedProgram.name}</h3>
                    <div className="flex items-center text-gray-300 mt-1">
                      <Building className="w-5 h-5 mr-1" />
                      <span>{getUniversityName(selectedProgram.universityId)}</span>
                      {getCollegeName(selectedProgram.collegeId) && (
                        <>
                          <ChevronRight className="w-4 h-4 mx-2" />
                          <span>{getCollegeName(selectedProgram.collegeId)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Duration</span>
                  </div>
                  <p className="text-white text-lg">{selectedProgram.duration}</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Tuition Fees</span>
                  </div>
                  <p className="text-white text-lg">
                    {formatCurrency(selectedProgram.fees, selectedProgram.currency)}
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg md:col-span-2">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-300">Available Intakes</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.intakes.map((intake, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-900 text-indigo-200"
                      >
                        {intake}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {selectedProgram.requirements && selectedProgram.requirements.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Entry Requirements
                  </h4>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {selectedProgram.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-200">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default KnowledgeHubPage;
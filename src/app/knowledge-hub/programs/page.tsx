'use client';

import { useEffect, useState } from 'react';
import { Program, University, College } from '@/types';
import { StorageService } from '@/lib/data/storage';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/auth';

interface ProgramAnalyticsCardProps {
  title: string;
  value: number;
  color: string;
  icon: string;
}

function ProgramAnalyticsCard({ title, value, color, icon }: ProgramAnalyticsCardProps) {
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

interface ProgramTableRowProps {
  program: Program;
  university: University;
  college?: College;
  onView: (program: Program) => void;
}

function ProgramTableRow({ program, university, college, onView }: ProgramTableRowProps) {
  return (
    <tr className="hover:bg-gray-700 border-b border-gray-700">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {program.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
            </span>
          </div>
          <div className="ml-4">
            <p className="font-medium text-white">{program.name}</p>
            <p className="text-sm text-gray-300">{university.name}</p>
            {college && <p className="text-xs text-gray-400">{college.name}</p>}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-white">{university.country}</td>
      <td className="px-6 py-4 text-sm text-gray-300">{program.duration}</td>
      <td className="px-6 py-4 text-sm text-white">{program.currency} {program.fees.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-300">
        <div className="flex flex-wrap gap-1">
          {program.intakes.slice(0, 2).map((intake, index) => (
            <span key={index} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
              {intake}
            </span>
          ))}
          {program.intakes.length > 2 && (
            <span className="text-xs text-gray-400">+{program.intakes.length - 2}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right text-sm font-medium">
        <button
          onClick={() => onView(program)}
          className="text-indigo-400 hover:text-indigo-300"
        >
          View Details
        </button>
      </td>
    </tr>
  );
}

export default function ProgramsPage() {
  const { /* user, */ isAdmin } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  // Analytics
  const analytics = {
    totalPrograms: programs.length,
    universities: new Set(programs.map(p => p.universityId)).size,
    countries: new Set(programs.map(p => {
      const uni = universities.find(u => u.id === p.universityId);
      return uni?.country;
    }).filter(Boolean)).size,
    avgFees: programs.length > 0 ? Math.round(programs.reduce((sum, p) => sum + p.fees, 0) / programs.length) : 0
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs, searchQuery, selectedUniversity, selectedCountry, universities, colleges]);

  const loadData = () => {
    try {
      const programsData = StorageService.getPrograms();
      const universitiesData = StorageService.getUniversities();
      const collegesData = StorageService.getColleges();
      
      setPrograms(programsData);
      setUniversities(universitiesData);
      setColleges(collegesData);
    } catch (error) {
      console.error('Error loading programs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    // Search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(program => {
        const university = universities.find(u => u.id === program.universityId);
        const college = colleges.find(c => c.id === program.collegeId);
        
        return (
          program.name.toLowerCase().includes(searchTerm) ||
          university?.name.toLowerCase().includes(searchTerm) ||
          college?.name.toLowerCase().includes(searchTerm) ||
          program.duration.toLowerCase().includes(searchTerm) ||
          program.requirements?.some(req => req.toLowerCase().includes(searchTerm)) ||
          program.intakes.some(intake => intake.toLowerCase().includes(searchTerm))
        );
      });
    }

    // University filter
    if (selectedUniversity) {
      filtered = filtered.filter(program => program.universityId === selectedUniversity);
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(program => {
        const university = universities.find(u => u.id === program.universityId);
        return university?.country === selectedCountry;
      });
    }

    setFilteredPrograms(filtered);
  };

  const handleView = (program: Program) => {
    setSelectedProgram(program);
  };

  const clearFilters = () => {
    setSelectedUniversity('');
    setSelectedCountry('');
    setSearchQuery('');
  };

  const countries = Array.from(new Set(universities.map(u => u.country))).sort();

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
                  <h1 className="text-3xl font-bold text-white">Program Catalog</h1>
                  <p className="text-gray-300 mt-1">Browse and discover academic programs from universities and colleges</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProgramAnalyticsCard
                  title="Total Programs"
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
                  title="Avg Fee (USD)"
                  value={analytics.avgFees}
                  color="bg-orange-500"
                  icon="💰"
                />
              </div>

              {/* Filters */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Search programs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Universities</option>
                      {universities.map((university) => (
                        <option key={university.id} value={university.id}>
                          {university.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 border border-gray-600 rounded-md text-white transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Programs Table */}
              <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Available Programs</h3>
                    <p className="text-sm text-gray-300">
                      {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                </div>
                
                {filteredPrograms.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-400">No programs found.</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                    {programs.length === 0 && (
                      <p className="text-sm text-gray-600 mt-2">No programs have been added to the system yet.</p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Program
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Tuition Fee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Intakes
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800">
                        {filteredPrograms.map((program) => {
                          const university = universities.find(u => u.id === program.universityId);
                          const college = colleges.find(c => c.id === program.collegeId);
                          
                          if (!university) return null;
                          
                          return (
                            <ProgramTableRow
                              key={program.id}
                              program={program}
                              university={university}
                              college={college}
                              onView={handleView}
                            />
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-700">
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
            
            {(() => {
              const university = universities.find(u => u.id === selectedProgram.universityId);
              const college = colleges.find(c => c.id === selectedProgram.collegeId);
              
              return (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">{selectedProgram.name}</h3>
                    <p className="text-gray-300">{university?.name}</p>
                    {college && <p className="text-gray-400">{college.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Duration</label>
                      <p className="text-sm text-white">{selectedProgram.duration}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Tuition Fee</label>
                      <p className="text-sm text-white">{selectedProgram.currency} {selectedProgram.fees.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Country</label>
                      <p className="text-sm text-white">{university?.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Institution Type</label>
                      <p className="text-sm text-white capitalize">{university?.type}</p>
                    </div>
                  </div>

                  {selectedProgram.intakes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Available Intakes</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProgram.intakes.map((intake, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-900 text-blue-200 text-sm rounded-full">
                            {intake}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProgram.requirements && selectedProgram.requirements.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Entry Requirements</label>
                      <ul className="list-disc list-inside space-y-1 text-sm text-white bg-gray-700 p-4 rounded-lg">
                        {selectedProgram.requirements.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-t border-gray-600 pt-4">
                    <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Apply for This Program
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
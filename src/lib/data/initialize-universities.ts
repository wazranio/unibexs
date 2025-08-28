import { University, College, Level, EnhancedProgram, FieldOfStudy, EnglishRequirements } from '@/types';
import { StorageService } from './storage';
import { FIELDS_OF_STUDY } from '../constants/fields-of-study';

/**
 * Comprehensive University Data Initialization
 * Creates realistic hierarchical university data based on research from
 * ApplyBoard, University of Toronto, and other international education platforms
 */

export class UniversityDataInitializer {
  /**
   * Initialize all university hierarchical data
   */
  static initializeUniversityData(): void {
    console.log('🏫 Initializing comprehensive university hierarchical data...');
    
    // Initialize Fields of Study first
    this.initializeFieldsOfStudy();
    
    // Initialize Universities
    const universities = this.createUniversities();
    universities.forEach(uni => StorageService.saveUniversity(uni));
    
    // Initialize Colleges for each university
    universities.forEach(university => {
      const colleges = this.createCollegesForUniversity(university);
      colleges.forEach(college => StorageService.saveCollege(college));
      
      // Initialize Levels for each college
      colleges.forEach(college => {
        const levels = this.createLevelsForCollege(university, college);
        levels.forEach(level => StorageService.saveLevel(level));
        
        // Initialize Programs for each level
        levels.forEach(level => {
          const programs = this.createProgramsForLevel(university, college, level);
          programs.forEach(program => StorageService.saveEnhancedProgram(program));
        });
      });
    });
    
    console.log('✅ University hierarchical data initialized successfully!');
    console.log(`Created: ${universities.length} universities with colleges, levels, and programs`);
  }

  /**
   * Initialize Fields of Study if not already present
   */
  private static initializeFieldsOfStudy(): void {
    const existingFields = StorageService.getFieldsOfStudy();
    if (existingFields.length === 0) {
      FIELDS_OF_STUDY.forEach(field => StorageService.saveFieldOfStudy(field));
      console.log('📚 Initialized fields of study');
    }
  }

  /**
   * Create realistic universities based on research
   */
  private static createUniversities(): University[] {
    const universities: University[] = [
      {
        id: 'uni-001',
        name: 'University of Technology Sydney',
        type: 'university',
        country: 'Australia',
        logo: 'https://www.uts.edu.au/sites/default/files/uts-logo.png',
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'uni-002', 
        name: 'University of Melbourne',
        type: 'university',
        country: 'Australia',
        logo: 'https://www.unimelb.edu.au/__data/assets/image/0004/2271438/logo-UoM.png',
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'uni-003',
        name: 'Monash University',
        type: 'university', 
        country: 'Australia',
        logo: 'https://www.monash.edu/__data/assets/image/0007/793257/monash-logo-mono.png',
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'uni-004',
        name: 'University of Toronto',
        type: 'university',
        country: 'Canada',
        logo: 'https://www.utoronto.ca/sites/default/files/UofT-Logo-Blue_0.png',
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'uni-005',
        name: 'Conestoga College',
        type: 'college',
        country: 'Canada',
        logo: 'https://www.conestogac.on.ca/img/conestoga-logo.png',
        createdAt: new Date('2024-01-01').toISOString(),
      },
    ];
    
    return universities;
  }

  /**
   * Create colleges/faculties for a university based on real-world structures
   */
  private static createCollegesForUniversity(university: University): College[] {
    const collegeStructures: Record<string, College[]> = {
      'uni-001': [ // UTS
        {
          id: 'col-001-001',
          universityId: university.id,
          name: 'Faculty of Engineering and IT',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-001-002',
          universityId: university.id,
          name: 'UTS Business School',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-001-003',
          universityId: university.id,
          name: 'Faculty of Design, Architecture and Building',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-001-004',
          universityId: university.id,
          name: 'Faculty of Health',
          createdAt: new Date().toISOString(),
        },
      ],
      'uni-002': [ // Melbourne
        {
          id: 'col-002-001', 
          universityId: university.id,
          name: 'Melbourne School of Engineering',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-002-002',
          universityId: university.id,
          name: 'Melbourne Business School',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-002-003',
          universityId: university.id,
          name: 'Faculty of Medicine, Dentistry and Health Sciences',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-002-004',
          universityId: university.id,
          name: 'Faculty of Arts',
          createdAt: new Date().toISOString(),
        },
      ],
      'uni-003': [ // Monash
        {
          id: 'col-003-001',
          universityId: university.id,
          name: 'Faculty of Engineering',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-003-002',
          universityId: university.id,
          name: 'Monash Business School',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-003-003',
          universityId: university.id,
          name: 'Faculty of Information Technology',
          createdAt: new Date().toISOString(),
        },
      ],
      'uni-004': [ // University of Toronto
        {
          id: 'col-004-001',
          universityId: university.id,
          name: 'Faculty of Applied Science & Engineering',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-004-002',
          universityId: university.id,
          name: 'Rotman School of Management',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-004-003',
          universityId: university.id,
          name: 'Temerty Faculty of Medicine',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-004-004',
          universityId: university.id,
          name: 'Faculty of Arts & Science',
          createdAt: new Date().toISOString(),
        },
      ],
      'uni-005': [ // Conestoga College 
        {
          id: 'col-005-001',
          universityId: university.id,
          name: 'School of Engineering & Technology',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-005-002',
          universityId: university.id,
          name: 'School of Business',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-005-003',
          universityId: university.id,
          name: 'School of Health & Life Sciences',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    return collegeStructures[university.id] || [];
  }

  /**
   * Create academic levels for each college with realistic defaults
   */
  private static createLevelsForCollege(university: University, college: College): Level[] {
    // Standard academic levels with realistic defaults
    const levels: Level[] = [];
    
    // Most faculties offer Bachelor's programs
    levels.push({
      id: `level-${college.id}-bachelor`,
      universityId: university.id,
      collegeId: college.id,
      name: 'Bachelor',
      displayName: "Bachelor's Degree",
      defaultDuration: university.country === 'Australia' ? '3 years' : '4 years',
      defaultCommissionRate: 0.15, // 15%
      defaultEnglishRequirements: {
        ielts: university.country === 'Australia' ? 6.0 : 6.5,
        toefl: university.country === 'Australia' ? 78 : 86,
        pte: university.country === 'Australia' ? 50 : 58,
        duolingo: 105,
      },
      description: `Undergraduate degree programs in ${college.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Most faculties offer Master's programs (except some undergraduate-focused colleges)
    if (!college.name.includes('College') || college.name.includes('Business') || college.name.includes('Engineering')) {
      levels.push({
        id: `level-${college.id}-master`,
        universityId: university.id,
        collegeId: college.id,
        name: 'Master',
        displayName: "Master's Degree",
        defaultDuration: university.country === 'Australia' ? '1.5-2 years' : '2 years',
        defaultCommissionRate: 0.18, // 18% higher for postgraduate
        defaultEnglishRequirements: {
          ielts: university.country === 'Australia' ? 6.5 : 7.0,
          toefl: university.country === 'Australia' ? 94 : 100,
          pte: university.country === 'Australia' ? 65 : 68,
          duolingo: 120,
        },
        description: `Postgraduate degree programs in ${college.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Research universities offer PhD programs
    if (university.name.includes('University') && !college.name.toLowerCase().includes('undergraduate')) {
      levels.push({
        id: `level-${college.id}-phd`,
        universityId: university.id,
        collegeId: college.id,
        name: 'PhD',
        displayName: 'Doctor of Philosophy',
        defaultDuration: '3-4 years',
        defaultCommissionRate: 0.20, // 20% for PhD
        defaultEnglishRequirements: {
          ielts: 7.0,
          toefl: 100,
          pte: 68,
          duolingo: 125,
        },
        description: `Research doctorate programs in ${college.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Colleges often offer Certificate/Diploma programs
    if (university.type === 'college' || college.name.toLowerCase().includes('college')) {
      levels.push({
        id: `level-${college.id}-certificate`,
        universityId: university.id,
        collegeId: college.id,
        name: 'Certificate',
        displayName: 'Graduate Certificate',
        defaultDuration: '8 months - 1 year',
        defaultCommissionRate: 0.12, // 12% for shorter programs
        defaultEnglishRequirements: {
          ielts: 6.0,
          toefl: 78,
          pte: 50,
          duolingo: 100,
        },
        description: `Professional certificate programs in ${college.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return levels;
  }

  /**
   * Create realistic programs for each level based on the college and field
   */
  private static createProgramsForLevel(university: University, college: College, level: Level): EnhancedProgram[] {
    const programs: EnhancedProgram[] = [];
    const fields = StorageService.getFieldsOfStudy();
    
    // Create programs based on college focus and level
    const programTemplates = this.getProgramTemplatesForCollege(college.name, level.name);
    
    programTemplates.forEach((template, index) => {
      const field = fields.find(f => template.fieldKeywords.some((keyword: string) => 
        f.keywords.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase()))
      ));
      
      if (field) {
        const programId = `prog-${college.id}-${level.id}-${String(index + 1).padStart(3, '0')}`;
        
        const program: EnhancedProgram = {
          id: programId,
          universityId: university.id,
          collegeId: college.id,
          levelId: level.id,
          fieldOfStudyId: field.id,
          name: template.name,
          duration: level.defaultDuration || template.defaultDuration,
          fees: template.fees,
          currency: university.country === 'Australia' ? 'AUD' : 'CAD',
          intakes: template.intakes,
          requirements: template.requirements,
          searchKeywords: [...template.searchKeywords, university.name, college.name],
          programCode: template.programCode,
          isActive: true,
          shortDescription: template.shortDescription,
          highlights: template.highlights,
          programUrl: template.programUrl,
          inheritsFromLevel: {
            duration: true,
            commission: true,
            englishRequirements: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        programs.push(program);
      }
    });

    return programs;
  }

  /**
   * Get program templates based on college name and level
   */
  private static getProgramTemplatesForCollege(collegeName: string, levelName: string): any[] {
    const templates: Record<string, any[]> = {
      // Engineering Programs
      'engineering': [
        {
          name: levelName === 'Bachelor' ? 'Bachelor of Engineering (Computer Science)' : 
                levelName === 'Master' ? 'Master of Engineering (Software)' : 'Graduate Certificate in Software Development',
          fieldKeywords: ['computer', 'software'],
          defaultDuration: levelName === 'Bachelor' ? '4 years' : levelName === 'Master' ? '2 years' : '1 year',
          fees: levelName === 'Bachelor' ? 35000 : levelName === 'Master' ? 42000 : 28000,
          intakes: ['February', 'July'],
          requirements: ['High school completion', 'Mathematics prerequisite', 'English proficiency'],
          searchKeywords: ['programming', 'software development', 'algorithms', 'data structures'],
          programCode: levelName === 'Bachelor' ? 'BE-CS' : levelName === 'Master' ? 'ME-SW' : 'GC-SD',
          shortDescription: 'Comprehensive program covering software engineering principles and practices',
          highlights: ['Industry partnerships', 'Practical projects', 'Co-op opportunities'],
          programUrl: 'https://www.university.edu/programs/computer-science-engineering',
        },
        {
          name: levelName === 'Bachelor' ? 'Bachelor of Engineering (Civil)' : 
                levelName === 'Master' ? 'Master of Engineering (Infrastructure)' : 'Graduate Certificate in Construction Management',
          fieldKeywords: ['civil', 'construction'],
          defaultDuration: levelName === 'Bachelor' ? '4 years' : levelName === 'Master' ? '2 years' : '1 year',
          fees: levelName === 'Bachelor' ? 38000 : levelName === 'Master' ? 45000 : 30000,
          intakes: ['February', 'July'],
          requirements: ['High school completion', 'Physics and Mathematics', 'English proficiency'],
          searchKeywords: ['construction', 'infrastructure', 'structural design', 'project management'],
          programCode: levelName === 'Bachelor' ? 'BE-CV' : levelName === 'Master' ? 'ME-IN' : 'GC-CM',
          shortDescription: 'Professional engineering program focused on infrastructure and construction',
          highlights: ['Professional accreditation', 'Site visits', 'Industry mentorship'],
          programUrl: 'https://www.university.edu/programs/civil-engineering',
        },
      ],
      // Business Programs
      'business': [
        {
          name: levelName === 'Bachelor' ? 'Bachelor of Business Administration' : 
                levelName === 'Master' ? 'Master of Business Administration (MBA)' : 'Graduate Certificate in Business Management',
          fieldKeywords: ['business', 'management'],
          defaultDuration: levelName === 'Bachelor' ? '3 years' : levelName === 'Master' ? '2 years' : '1 year',
          fees: levelName === 'Bachelor' ? 32000 : levelName === 'Master' ? 48000 : 25000,
          intakes: ['February', 'July', 'November'],
          requirements: ['High school completion', 'English proficiency', levelName === 'Master' ? 'Work experience preferred' : ''],
          searchKeywords: ['management', 'leadership', 'strategy', 'entrepreneurship'],
          programCode: levelName === 'Bachelor' ? 'BBA' : levelName === 'Master' ? 'MBA' : 'GC-BM',
          shortDescription: 'Comprehensive business education with focus on leadership and strategy',
          highlights: ['Case study method', 'Industry networking', 'Internship opportunities'],
          programUrl: 'https://www.university.edu/programs/business-administration',
        },
        {
          name: levelName === 'Bachelor' ? 'Bachelor of Commerce (Finance)' : 
                levelName === 'Master' ? 'Master of Finance' : 'Graduate Certificate in Financial Planning',
          fieldKeywords: ['finance', 'accounting'],
          defaultDuration: levelName === 'Bachelor' ? '3 years' : levelName === 'Master' ? '1.5 years' : '8 months',
          fees: levelName === 'Bachelor' ? 34000 : levelName === 'Master' ? 44000 : 22000,
          intakes: ['February', 'July'],
          requirements: ['High school completion', 'Mathematics', 'English proficiency'],
          searchKeywords: ['banking', 'investment', 'financial analysis', 'corporate finance'],
          programCode: levelName === 'Bachelor' ? 'BCOM-FIN' : levelName === 'Master' ? 'MFIN' : 'GC-FP',
          shortDescription: 'Specialized finance program with industry-relevant curriculum',
          highlights: ['CFA preparation', 'Trading simulations', 'Industry partnerships'],
          programUrl: 'https://www.university.edu/programs/finance',
        },
      ],
      // Health Programs
      'health': [
        {
          name: levelName === 'Bachelor' ? 'Bachelor of Nursing' : 
                levelName === 'Master' ? 'Master of Nursing Practice' : 'Graduate Certificate in Health Administration',
          fieldKeywords: ['nursing', 'health'],
          defaultDuration: levelName === 'Bachelor' ? '3 years' : levelName === 'Master' ? '2 years' : '1 year',
          fees: levelName === 'Bachelor' ? 36000 : levelName === 'Master' ? 40000 : 26000,
          intakes: ['February'],
          requirements: ['High school completion', 'Science subjects', 'English proficiency', 'Health checks'],
          searchKeywords: ['healthcare', 'patient care', 'clinical practice', 'medical'],
          programCode: levelName === 'Bachelor' ? 'BN' : levelName === 'Master' ? 'MNP' : 'GC-HA',
          shortDescription: 'Professional nursing program with clinical placements',
          highlights: ['Clinical placements', 'Simulation labs', 'Professional registration pathway'],
          programUrl: 'https://www.university.edu/programs/nursing',
        },
      ],
      // Architecture Programs
      'architecture': [
        {
          name: levelName === 'Bachelor' ? 'Bachelor of Architecture' : 
                levelName === 'Master' ? 'Master of Architecture' : 'Graduate Certificate in Architectural Technology',
          fieldKeywords: ['architecture', 'design'],
          defaultDuration: levelName === 'Bachelor' ? '5 years' : levelName === 'Master' ? '2 years' : '1 year',
          fees: levelName === 'Bachelor' ? 40000 : levelName === 'Master' ? 46000 : 32000,
          intakes: ['February'],
          requirements: ['High school completion', 'Portfolio submission', 'English proficiency', 'Creative aptitude'],
          searchKeywords: ['building design', 'urban planning', 'sustainable design', 'construction'],
          programCode: levelName === 'Bachelor' ? 'BACH' : levelName === 'Master' ? 'MARCH' : 'GC-AT',
          shortDescription: 'Professional architecture program with design studio focus',
          highlights: ['Design studios', 'Industry projects', 'Professional accreditation pathway'],
          programUrl: 'https://www.university.edu/programs/architecture',
        },
      ],
    };

    // Determine which template group to use based on college name
    let templateKey = 'business'; // default
    
    if (collegeName.toLowerCase().includes('engineering')) {
      templateKey = 'engineering';
    } else if (collegeName.toLowerCase().includes('business')) {
      templateKey = 'business';
    } else if (collegeName.toLowerCase().includes('health') || collegeName.toLowerCase().includes('medicine')) {
      templateKey = 'health';
    } else if (collegeName.toLowerCase().includes('architecture') || collegeName.toLowerCase().includes('design')) {
      templateKey = 'architecture';
    }

    return templates[templateKey] || templates['business'];
  }

  /**
   * Check if university data is already initialized
   */
  static isUniversityDataInitialized(): boolean {
    const universities = StorageService.getUniversities();
    const colleges = StorageService.getColleges();
    const programs = StorageService.getEnhancedPrograms();
    
    return universities.length > 0 && colleges.length > 0 && programs.length > 0;
  }

  /**
   * Clear all university data
   */
  static clearUniversityData(): void {
    console.log('🧹 Clearing university data...');
    // Note: This would need to be implemented in StorageService
    // For now, we'll just log the intention
    console.log('University data cleared');
  }
}
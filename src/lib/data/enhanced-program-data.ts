import { Level, EnhancedProgram } from '@/types';
import { FIELDS_OF_STUDY } from '@/lib/constants/fields-of-study';
import { StorageService } from './storage';

// Sample Levels with realistic defaults
export const SAMPLE_LEVELS: Level[] = [
  // University of Malaya - Faculty of Engineering
  {
    id: 'level-um-eng-bachelor',
    universityId: 'uni-001',
    collegeId: 'col-001',
    name: 'Bachelor',
    displayName: "Bachelor's Degree",
    defaultDuration: '4 years',
    defaultCommissionRate: 0.15, // 15%
    defaultEnglishRequirements: {
      ielts: 6.0,
      toefl: 80,
      pte: 59
    },
    description: 'Undergraduate engineering programs with comprehensive technical training',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'level-um-eng-master',
    universityId: 'uni-001',
    collegeId: 'col-001',
    name: 'Master',
    displayName: "Master's Degree",
    defaultDuration: '2 years',
    defaultCommissionRate: 0.18, // 18%
    defaultEnglishRequirements: {
      ielts: 6.5,
      toefl: 90,
      pte: 65
    },
    description: 'Postgraduate engineering programs with research and advanced coursework',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // University of Malaya - Faculty of Computer Science & IT
  {
    id: 'level-um-cs-bachelor',
    universityId: 'uni-001',
    collegeId: 'col-002',
    name: 'Bachelor',
    displayName: "Bachelor's Degree",
    defaultDuration: '3 years',
    defaultCommissionRate: 0.16, // 16%
    defaultEnglishRequirements: {
      ielts: 6.0,
      toefl: 80,
      pte: 59
    },
    description: 'Undergraduate computer science and IT programs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'level-um-cs-master',
    universityId: 'uni-001',
    collegeId: 'col-002',
    name: 'Master',
    displayName: "Master's Degree",
    defaultDuration: '18 months',
    defaultCommissionRate: 0.20, // 20%
    defaultEnglishRequirements: {
      ielts: 6.5,
      toefl: 90,
      pte: 65
    },
    description: 'Postgraduate computer science and IT programs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // UTM - School of Computing
  {
    id: 'level-utm-comp-bachelor',
    universityId: 'uni-002',
    collegeId: 'col-003',
    name: 'Bachelor',
    displayName: "Bachelor's Degree",
    defaultDuration: '4 years',
    defaultCommissionRate: 0.14, // 14%
    defaultEnglishRequirements: {
      ielts: 5.5,
      toefl: 75,
      pte: 50
    },
    description: 'Undergraduate computing programs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Taylor's University - School of Engineering
  {
    id: 'level-taylor-eng-bachelor',
    universityId: 'uni-003',
    collegeId: 'col-004',
    name: 'Bachelor',
    displayName: "Bachelor's Degree",
    defaultDuration: '3 years',
    defaultCommissionRate: 0.20, // 20% (private university)
    defaultEnglishRequirements: {
      ielts: 6.0,
      toefl: 80,
      pte: 59
    },
    description: 'Undergraduate engineering programs at private university',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'level-taylor-eng-master',
    universityId: 'uni-003',
    collegeId: 'col-004',
    name: 'Master',
    displayName: "Master's Degree",
    defaultDuration: '18 months',
    defaultCommissionRate: 0.22, // 22%
    defaultEnglishRequirements: {
      ielts: 6.5,
      toefl: 90,
      pte: 65
    },
    description: 'Postgraduate engineering programs at private university',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Foundation and Diploma levels
  {
    id: 'level-foundation-general',
    universityId: 'uni-003',
    collegeId: 'col-004',
    name: 'Foundation',
    displayName: 'Foundation Program',
    defaultDuration: '1 year',
    defaultCommissionRate: 0.12, // 12%
    defaultEnglishRequirements: {
      ielts: 5.0,
      toefl: 60,
      pte: 42
    },
    description: 'Foundation program preparing students for degree studies',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

// Enhanced Programs with Field of Study integration
export const SAMPLE_ENHANCED_PROGRAMS: EnhancedProgram[] = [
  {
    id: 'enhanced-prog-001',
    universityId: 'uni-001',
    collegeId: 'col-002',
    levelId: 'level-um-cs-bachelor',
    fieldOfStudyId: 'field-engineering-tech',
    name: 'Bachelor of Computer Science (Cybersecurity)',
    duration: '3 years', // Inherited from level
    fees: 45000,
    currency: 'MYR',
    intakes: ['March', 'September'],
    requirements: [
      'SPM with minimum 5 credits including Mathematics',
      'Foundation or A-Level qualification',
      'Minimum age of 17 years'
    ],
    shortDescription: 'Comprehensive cybersecurity program focusing on network security, ethical hacking, and digital forensics',
    highlights: [
      'Industry-certified curriculum',
      'Hands-on lab experience',
      'Internship placement assistance',
      'Professional certification preparation'
    ],
    searchKeywords: [
      'cybersecurity', 'cyber security', 'information security', 'network security',
      'ethical hacking', 'digital forensics', 'IT security', 'computer security'
    ],
    programCode: 'CS-CYB-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'enhanced-prog-002',
    universityId: 'uni-001',
    collegeId: 'col-001',
    levelId: 'level-um-eng-bachelor',
    fieldOfStudyId: 'field-engineering-tech',
    name: 'Bachelor of Engineering (Civil)',
    duration: '4 years', // Inherited from level
    fees: 52000,
    currency: 'MYR',
    intakes: ['March', 'October'],
    requirements: [
      'SPM with minimum 5 credits including Mathematics and Physics',
      'Foundation in Engineering or A-Level',
      'Strong analytical skills'
    ],
    shortDescription: 'Comprehensive civil engineering program covering structures, transportation, and environmental engineering',
    highlights: [
      'ABET accredited program',
      'Industry partnerships',
      'Site visit opportunities',
      'Professional engineer pathway'
    ],
    searchKeywords: [
      'civil engineering', 'structural engineering', 'construction', 'infrastructure',
      'transportation engineering', 'environmental engineering', 'building design'
    ],
    programCode: 'CE-CIV-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'enhanced-prog-003',
    universityId: 'uni-002',
    collegeId: 'col-003',
    levelId: 'level-utm-comp-bachelor',
    fieldOfStudyId: 'field-engineering-tech',
    name: 'Bachelor of Computer Science (Data Science)',
    duration: '4 years', // Inherited from level
    fees: 38000,
    currency: 'MYR',
    intakes: ['February', 'September'],
    requirements: [
      'SPM with credits in Mathematics and Additional Mathematics',
      'Foundation or A-Level qualification',
      'Basic programming knowledge preferred'
    ],
    shortDescription: 'Advanced data science program with machine learning, AI, and big data analytics',
    highlights: [
      'Industry 4.0 aligned curriculum',
      'Real-world project experience',
      'AI and ML specialization',
      'Industry mentorship program'
    ],
    searchKeywords: [
      'data science', 'machine learning', 'artificial intelligence', 'AI',
      'big data', 'analytics', 'statistics', 'python', 'data analysis'
    ],
    programCode: 'CS-DS-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'enhanced-prog-004',
    universityId: 'uni-003',
    collegeId: 'col-004',
    levelId: 'level-taylor-eng-bachelor',
    fieldOfStudyId: 'field-business-mgmt',
    name: 'Bachelor of Engineering (Industrial Management)',
    duration: '3 years', // Inherited from level
    fees: 75000,
    currency: 'MYR',
    intakes: ['January', 'May', 'September'],
    requirements: [
      'Foundation or A-Level with Mathematics',
      'Good communication skills',
      'Interest in business and engineering'
    ],
    shortDescription: 'Unique blend of engineering principles and business management for industrial applications',
    highlights: [
      'Dual-focused curriculum',
      'Industry internship guaranteed',
      'Management skills development',
      'Graduate placement program'
    ],
    searchKeywords: [
      'industrial engineering', 'management', 'business engineering',
      'operations management', 'supply chain', 'lean manufacturing'
    ],
    programCode: 'IE-MG-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: false, // Override commission for this specialized program
      englishRequirements: true
    },
    commissionRate: 0.25, // Higher commission for specialized program
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'enhanced-prog-005',
    universityId: 'uni-001',
    collegeId: 'col-002',
    levelId: 'level-um-cs-master',
    fieldOfStudyId: 'field-engineering-tech',
    name: 'Master of Computer Science (Artificial Intelligence)',
    duration: '18 months', // Inherited from level
    fees: 65000,
    currency: 'MYR',
    intakes: ['February', 'July'],
    requirements: [
      'Bachelor degree in Computer Science or related field',
      'Minimum CGPA of 3.0',
      'Research proposal',
      'Programming experience required'
    ],
    shortDescription: 'Advanced AI research program covering deep learning, neural networks, and intelligent systems',
    highlights: [
      'Research-focused curriculum',
      'PhD pathway available',
      'International conference opportunities',
      'Industry collaboration projects'
    ],
    searchKeywords: [
      'artificial intelligence', 'AI', 'machine learning', 'deep learning',
      'neural networks', 'research', 'intelligent systems', 'NLP'
    ],
    programCode: 'MCS-AI-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: false // Override for higher requirements
    },
    englishRequirements: {
      ielts: 7.0,
      toefl: 100,
      pte: 70
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'enhanced-prog-006',
    universityId: 'uni-003',
    collegeId: 'col-004',
    levelId: 'level-foundation-general',
    fieldOfStudyId: 'field-engineering-tech',
    name: 'Foundation in Science and Engineering',
    duration: '1 year', // Inherited from level
    fees: 25000,
    currency: 'MYR',
    intakes: ['January', 'March', 'July', 'September'],
    requirements: [
      'SPM with minimum 3 credits',
      'Pass in Mathematics',
      'Minimum age of 16 years'
    ],
    shortDescription: 'Foundation program preparing students for engineering and science degree programs',
    highlights: [
      'Small class sizes',
      'Personal academic advisor',
      'Guaranteed progression pathway',
      'Strong mathematics foundation'
    ],
    searchKeywords: [
      'foundation', 'pre-university', 'science foundation',
      'engineering foundation', 'preparatory program'
    ],
    programCode: 'FN-SE-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Business programs
  {
    id: 'enhanced-prog-007',
    universityId: 'uni-003',
    collegeId: 'col-004',
    levelId: 'level-taylor-eng-bachelor',
    fieldOfStudyId: 'field-business-mgmt',
    name: 'Bachelor of Business Administration (Marketing)',
    duration: '3 years',
    fees: 68000,
    currency: 'MYR',
    intakes: ['January', 'April', 'August'],
    requirements: [
      'Foundation or A-Level qualification',
      'SPM with minimum 5 credits',
      'Good communication skills'
    ],
    shortDescription: 'Comprehensive business program with specialization in modern marketing strategies',
    highlights: [
      'Digital marketing focus',
      'Industry case studies',
      'Internship opportunities',
      'Professional certification tracks'
    ],
    searchKeywords: [
      'business administration', 'marketing', 'digital marketing',
      'business management', 'advertising', 'brand management'
    ],
    programCode: 'BBA-MKT-001',
    isActive: true,
    inheritsFromLevel: {
      duration: true,
      commission: true,
      englishRequirements: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Health Sciences programs
  {
    id: 'enhanced-prog-008',
    universityId: 'uni-001',
    collegeId: 'col-001', // Using existing college ID
    levelId: 'level-um-eng-bachelor', // Reusing level for demo
    fieldOfStudyId: 'field-health-medicine',
    name: 'Bachelor of Nursing Science',
    duration: '4 years',
    fees: 55000,
    currency: 'MYR',
    intakes: ['March', 'October'],
    requirements: [
      'SPM with Biology and Chemistry credits',
      'Foundation in Health Sciences or A-Level',
      'Medical fitness certificate',
      'Good interpersonal skills'
    ],
    shortDescription: 'Comprehensive nursing program preparing healthcare professionals for clinical practice',
    highlights: [
      'Clinical placement guaranteed',
      'Modern simulation labs',
      'International exchange programs',
      'Professional registration pathway'
    ],
    searchKeywords: [
      'nursing', 'healthcare', 'medical', 'clinical practice',
      'patient care', 'health sciences', 'registered nurse'
    ],
    programCode: 'NS-001',
    isActive: true,
    inheritsFromLevel: {
      duration: false, // Override duration for nursing
      commission: false, // Different commission for health programs
      englishRequirements: false // Different English requirements
    },
    commissionRate: 0.12, // Lower commission for health programs
    englishRequirements: {
      ielts: 6.5,
      toefl: 85,
      pte: 62
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Initialize enhanced program data in storage
 */
export function initializeEnhancedProgramData(): void {
  console.log('🚀 Initializing enhanced program data...');

  try {
    // Initialize Fields of Study first
    const existingFields = StorageService.getFieldsOfStudy();
    if (existingFields.length === 0) {
      FIELDS_OF_STUDY.forEach(field => {
        StorageService.saveFieldOfStudy(field);
      });
      console.log('✅ Fields of Study initialized:', FIELDS_OF_STUDY.length);
    } else {
      console.log('📂 Fields of Study already exist:', existingFields.length);
    }

    // Initialize Levels
    const existingLevels = StorageService.getLevels();
    if (existingLevels.length === 0) {
      SAMPLE_LEVELS.forEach(level => {
        StorageService.saveLevel(level);
      });
      console.log('✅ Levels initialized:', SAMPLE_LEVELS.length);
    } else {
      console.log('📂 Levels already exist:', existingLevels.length);
    }

    // Initialize Enhanced Programs
    const existingPrograms = StorageService.getEnhancedPrograms();
    if (existingPrograms.length === 0) {
      SAMPLE_ENHANCED_PROGRAMS.forEach(program => {
        StorageService.saveEnhancedProgram(program);
      });
      console.log('✅ Enhanced Programs initialized:', SAMPLE_ENHANCED_PROGRAMS.length);
    } else {
      console.log('📂 Enhanced Programs already exist:', existingPrograms.length);
    }

    console.log('🎉 Enhanced program data initialization complete!');

    // Log summary
    const fieldsCount = StorageService.getFieldsOfStudy().length;
    const levelsCount = StorageService.getLevels().length;
    const programsCount = StorageService.getEnhancedPrograms().length;
    
    console.log('📊 Summary:');
    console.log(`   - Fields of Study: ${fieldsCount}`);
    console.log(`   - Levels: ${levelsCount}`);
    console.log(`   - Enhanced Programs: ${programsCount}`);

  } catch (error) {
    console.error('❌ Error initializing enhanced program data:', error);
  }
}
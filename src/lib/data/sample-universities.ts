import { University, College, Program } from '@/types';
import { StorageService } from './storage';

export const SAMPLE_UNIVERSITIES: University[] = [
  {
    id: 'uni-001',
    name: 'University of Malaya',
    type: 'university',
    country: 'Malaysia',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'uni-002',
    name: 'Universiti Teknologi Malaysia',
    type: 'university',
    country: 'Malaysia',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'uni-003',
    name: 'Taylor\'s University',
    type: 'university',
    country: 'Malaysia',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'uni-004',
    name: 'Sunway College',
    type: 'college',
    country: 'Malaysia',
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_COLLEGES: College[] = [
  {
    id: 'col-001',
    universityId: 'uni-001',
    name: 'Faculty of Engineering',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-002',
    universityId: 'uni-001',
    name: 'Faculty of Computer Science & Information Technology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-003',
    universityId: 'uni-002',
    name: 'School of Computing',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-004',
    universityId: 'uni-003',
    name: 'School of Engineering',
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_PROGRAMS: Program[] = [
  {
    id: 'prog-001',
    universityId: 'uni-001',
    collegeId: 'col-002',
    name: 'Bachelor of Computer Science',
    duration: '3 years',
    fees: 45000,
    currency: 'MYR',
    intakes: ['February', 'September'],
    requirements: [
      'SPM with minimum 5 credits including Mathematics',
      'IELTS 6.0 or equivalent',
      'Foundation or A-Level qualification'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-002',
    universityId: 'uni-001',
    collegeId: 'col-001',
    name: 'Bachelor of Engineering (Civil)',
    duration: '4 years',
    fees: 52000,
    currency: 'MYR',
    intakes: ['March', 'October'],
    requirements: [
      'SPM with minimum 5 credits including Mathematics and Physics',
      'IELTS 6.0 or equivalent',
      'Foundation in Engineering or A-Level'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-003',
    universityId: 'uni-002',
    collegeId: 'col-003',
    name: 'Master of Computer Science',
    duration: '2 years',
    fees: 35000,
    currency: 'MYR',
    intakes: ['February', 'June', 'October'],
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'CGPA 3.0 or equivalent',
      'IELTS 6.5 or equivalent'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-004',
    universityId: 'uni-003',
    collegeId: 'col-004',
    name: 'Bachelor of Engineering (Software)',
    duration: '3.5 years',
    fees: 48000,
    currency: 'MYR',
    intakes: ['January', 'May', 'September'],
    requirements: [
      'SPM with minimum 5 credits',
      'Strong foundation in Mathematics',
      'IELTS 6.0 or TOEFL 550'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-005',
    universityId: 'uni-004',
    name: 'Diploma in Business Administration',
    duration: '2.5 years',
    fees: 28000,
    currency: 'MYR',
    intakes: ['January', 'April', 'July', 'October'],
    requirements: [
      'SPM with minimum 3 credits',
      'Basic English proficiency',
      'Interview may be required'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-006',
    universityId: 'uni-001',
    collegeId: 'col-002',
    name: 'Master of Information Technology',
    duration: '1.5 years',
    fees: 42000,
    currency: 'MYR',
    intakes: ['March', 'September'],
    requirements: [
      'Bachelor\'s degree in IT or related field',
      'Minimum 2 years work experience',
      'IELTS 6.5 or equivalent'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-007',
    universityId: 'uni-002',
    name: 'PhD in Computer Science',
    duration: '3-5 years',
    fees: 15000,
    currency: 'MYR',
    intakes: ['February', 'June', 'October'],
    requirements: [
      'Master\'s degree in Computer Science or related field',
      'Research proposal',
      'IELTS 6.5 or equivalent',
      'Interview required'
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prog-008',
    universityId: 'uni-003',
    name: 'Bachelor of Business (Marketing)',
    duration: '3 years',
    fees: 40000,
    currency: 'MYR',
    intakes: ['February', 'July'],
    requirements: [
      'SPM with minimum 5 credits',
      'IELTS 6.0 or equivalent',
      'Foundation or A-Level qualification'
    ],
    createdAt: new Date().toISOString(),
  }
];

export function initializeSampleUniversities() {
  console.log('🏫 Initializing sample universities and programs...');
  
  const existingUniversities = StorageService.getUniversities();
  // const existingPrograms = StorageService.getPrograms();
  
  if (existingUniversities.length === 0) {
    // Add universities
    SAMPLE_UNIVERSITIES.forEach(university => {
      StorageService.saveUniversity(university);
    });
    console.log(`✅ Created ${SAMPLE_UNIVERSITIES.length} universities`);

    // Add colleges
    SAMPLE_COLLEGES.forEach(college => {
      StorageService.saveCollege(college);
    });
    console.log(`✅ Created ${SAMPLE_COLLEGES.length} colleges`);

    // Add programs
    SAMPLE_PROGRAMS.forEach(program => {
      StorageService.saveProgram(program);
    });
    console.log(`✅ Created ${SAMPLE_PROGRAMS.length} programs`);
  } else {
    console.log('📝 Universities and programs already exist, skipping initialization');
  }
}
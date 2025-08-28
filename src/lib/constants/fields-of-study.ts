import { FieldOfStudy } from '@/types';

// Field of Study categories based on simplified ISCED-F 2013
export const FIELDS_OF_STUDY: FieldOfStudy[] = [
  {
    id: 'field-business-mgmt',
    name: 'Business & Management',
    code: 'BM',
    icon: '💼',
    description: 'Business administration, management, marketing, finance, and entrepreneurship',
    keywords: [
      'business', 'management', 'admin', 'mba', 'marketing', 'finance', 'accounting',
      'economics', 'entrepreneurship', 'commerce', 'trade', 'banking', 'investment',
      'strategy', 'leadership', 'operations', 'supply chain', 'hr', 'human resources'
    ],
    subcategories: [
      'Business Administration', 'Marketing', 'Finance', 'Accounting', 'Human Resources',
      'Supply Chain Management', 'Entrepreneurship', 'International Business'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-engineering-tech',
    name: 'Engineering & Technology',
    code: 'ET',
    icon: '⚙️',
    description: 'Computer science, engineering disciplines, and technology programs',
    keywords: [
      'engineering', 'computer', 'technology', 'software', 'hardware', 'programming',
      'coding', 'IT', 'information technology', 'civil', 'mechanical', 'electrical',
      'electronics', 'chemical', 'aerospace', 'automotive', 'robotics', 'AI',
      'artificial intelligence', 'cybersecurity', 'network', 'data science'
    ],
    subcategories: [
      'Computer Science', 'Information Technology', 'Civil Engineering', 
      'Mechanical Engineering', 'Electrical Engineering', 'Software Engineering',
      'Cybersecurity', 'Data Science', 'Artificial Intelligence'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-health-medicine',
    name: 'Health & Medicine',
    code: 'HM',
    icon: '🏥',
    description: 'Medical sciences, nursing, healthcare, and wellness programs',
    keywords: [
      'medicine', 'medical', 'health', 'healthcare', 'nursing', 'doctor', 'physician',
      'surgery', 'pharmacy', 'dentistry', 'veterinary', 'public health', 'nutrition',
      'physiotherapy', 'occupational therapy', 'psychology', 'counseling', 'mental health'
    ],
    subcategories: [
      'Medicine', 'Nursing', 'Dentistry', 'Pharmacy', 'Public Health',
      'Physiotherapy', 'Medical Sciences', 'Veterinary Medicine'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-arts-design',
    name: 'Arts & Design',
    code: 'AD',
    icon: '🎨',
    description: 'Fine arts, graphic design, architecture, media, and creative disciplines',
    keywords: [
      'art', 'arts', 'design', 'creative', 'graphic', 'visual', 'architecture',
      'interior design', 'fashion', 'photography', 'film', 'media', 'animation',
      'illustration', 'sculpture', 'painting', 'drawing', 'digital art'
    ],
    subcategories: [
      'Graphic Design', 'Architecture', 'Interior Design', 'Fine Arts',
      'Fashion Design', 'Photography', 'Film Studies', 'Animation'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-natural-sciences',
    name: 'Natural Sciences',
    code: 'NS',
    icon: '🔬',
    description: 'Physics, chemistry, biology, mathematics, and environmental sciences',
    keywords: [
      'science', 'physics', 'chemistry', 'biology', 'mathematics', 'math',
      'environmental', 'geology', 'geography', 'astronomy', 'statistics',
      'research', 'laboratory', 'experiment', 'analysis', 'theory'
    ],
    subcategories: [
      'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Environmental Science',
      'Geology', 'Geography', 'Statistics'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-social-sciences',
    name: 'Social Sciences',
    code: 'SS',
    icon: '👥',
    description: 'Psychology, sociology, political science, and international relations',
    keywords: [
      'social', 'psychology', 'sociology', 'political', 'politics', 'international',
      'relations', 'anthropology', 'history', 'philosophy', 'cultural', 'society',
      'behavior', 'development', 'policy', 'governance', 'diplomacy'
    ],
    subcategories: [
      'Psychology', 'Sociology', 'Political Science', 'International Relations',
      'Anthropology', 'History', 'Philosophy'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-education',
    name: 'Education',
    code: 'ED',
    icon: '📚',
    description: 'Teaching, educational management, and pedagogical studies',
    keywords: [
      'education', 'teaching', 'teacher', 'pedagogy', 'curriculum', 'instruction',
      'learning', 'educational management', 'early childhood', 'special education',
      'training', 'development', 'school', 'academic'
    ],
    subcategories: [
      'Teaching', 'Educational Management', 'Curriculum Development',
      'Early Childhood Education', 'Special Education'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-law-legal',
    name: 'Law & Legal Studies',
    code: 'LL',
    icon: '⚖️',
    description: 'Law, legal studies, criminal justice, and paralegal programs',
    keywords: [
      'law', 'legal', 'justice', 'criminal justice', 'paralegal', 'lawyer',
      'attorney', 'court', 'litigation', 'contract', 'corporate law',
      'international law', 'human rights', 'constitutional', 'criminal'
    ],
    subcategories: [
      'Law', 'Criminal Justice', 'International Law', 'Corporate Law',
      'Human Rights', 'Paralegal Studies'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-hospitality-tourism',
    name: 'Hospitality & Tourism',
    code: 'HT',
    icon: '🏨',
    description: 'Hotel management, culinary arts, tourism, and service industries',
    keywords: [
      'hospitality', 'tourism', 'hotel', 'management', 'culinary', 'cooking',
      'chef', 'restaurant', 'food', 'beverage', 'travel', 'resort',
      'event management', 'catering', 'service'
    ],
    subcategories: [
      'Hotel Management', 'Culinary Arts', 'Tourism Management',
      'Event Management', 'Food & Beverage'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-agriculture-env',
    name: 'Agriculture & Environment',
    code: 'AE',
    icon: '🌱',
    description: 'Agricultural sciences, environmental studies, and sustainability',
    keywords: [
      'agriculture', 'farming', 'environmental', 'environment', 'sustainability',
      'forestry', 'ecology', 'conservation', 'green', 'renewable', 'climate',
      'biodiversity', 'organic', 'crops', 'livestock'
    ],
    subcategories: [
      'Agricultural Sciences', 'Environmental Studies', 'Forestry',
      'Sustainability', 'Conservation', 'Ecology'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-languages-lit',
    name: 'Languages & Literature',
    code: 'LN',
    icon: '📖',
    description: 'Languages, linguistics, literature, and translation studies',
    keywords: [
      'language', 'languages', 'linguistics', 'literature', 'english',
      'translation', 'interpretation', 'communication', 'writing',
      'foreign language', 'multilingual', 'grammar', 'rhetoric'
    ],
    subcategories: [
      'English Literature', 'Linguistics', 'Translation Studies',
      'Modern Languages', 'Communication'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'field-media-communications',
    name: 'Media & Communications',
    code: 'MC',
    icon: '📺',
    description: 'Journalism, mass communication, digital media, and broadcasting',
    keywords: [
      'media', 'communication', 'communications', 'journalism', 'broadcast',
      'broadcasting', 'digital media', 'social media', 'public relations',
      'advertising', 'marketing communications', 'news', 'reporter'
    ],
    subcategories: [
      'Journalism', 'Mass Communication', 'Digital Media', 'Public Relations',
      'Broadcasting', 'Advertising'
    ],
    createdAt: new Date().toISOString()
  }
];

// Helper functions for field of study operations
export const getFieldOfStudyById = (id: string): FieldOfStudy | undefined => {
  return FIELDS_OF_STUDY.find(field => field.id === id);
};

export const getFieldOfStudyByKeyword = (keyword: string): FieldOfStudy[] => {
  const searchTerm = keyword.toLowerCase();
  return FIELDS_OF_STUDY.filter(field =>
    field.keywords.some(kw => kw.includes(searchTerm)) ||
    field.name.toLowerCase().includes(searchTerm)
  );
};

export const suggestFieldOfStudy = (programName: string): FieldOfStudy | null => {
  const searchTerm = programName.toLowerCase();
  
  // Find the best match based on keywords
  for (const field of FIELDS_OF_STUDY) {
    for (const keyword of field.keywords) {
      if (searchTerm.includes(keyword)) {
        return field;
      }
    }
  }
  
  return null;
};

// Level type mappings
export const LEVEL_TYPES = {
  FOUNDATION: 'Foundation',
  CERTIFICATE: 'Certificate', 
  DIPLOMA: 'Diploma',
  BACHELOR: 'Bachelor',
  MASTER: 'Master',
  PHD: 'PhD'
} as const;

export const LEVEL_DISPLAY_NAMES = {
  Foundation: "Foundation Program",
  Certificate: "Certificate Program", 
  Diploma: "Diploma Program",
  Bachelor: "Bachelor's Degree",
  Master: "Master's Degree",
  PhD: "Doctor of Philosophy"
} as const;
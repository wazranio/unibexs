import { ServiceProvider } from '@/types';
import { StorageService } from './storage';

export const SAMPLE_SERVICES: ServiceProvider[] = [
  {
    id: 'service-001',
    name: 'UniLiving Student Accommodation',
    type: 'accommodation',
    contactEmail: 'info@uniliving.com',
    contactPhone: '+60-3-7890-1234',
    country: 'Malaysia',
    services: [
      'On-campus dormitories',
      'Off-campus apartments',
      'Homestay arrangements',
      'Furniture rental',
      'Utility setup assistance'
    ],
    description: 'Premium student accommodation provider with 15+ years of experience in Malaysia.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-002',
    name: 'EduTransport Services',
    type: 'transport',
    contactEmail: 'booking@edutransport.my',
    contactPhone: '+60-12-345-6789',
    country: 'Malaysia',
    services: [
      'Airport pickup and drop-off',
      'University shuttle service',
      'Local area transportation',
      'Long-distance travel arrangements'
    ],
    description: 'Reliable transportation services for international students.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-003',
    name: 'Guardian Student Insurance',
    type: 'insurance',
    contactEmail: 'claims@guardian-insurance.com',
    contactPhone: '+60-3-5555-0123',
    country: 'Malaysia',
    services: [
      'Medical insurance coverage',
      'Personal accident insurance',
      'Travel insurance',
      '24/7 emergency assistance',
      'Dental and optical coverage'
    ],
    description: 'Comprehensive insurance solutions tailored for international students.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-004',
    name: 'HealthCare Plus Medical Center',
    type: 'medical',
    contactEmail: 'appointments@healthcareplus.my',
    contactPhone: '+60-3-7777-8888',
    country: 'Malaysia',
    services: [
      'General medical consultation',
      'Health screenings',
      'Vaccination services',
      'Emergency medical care',
      'Mental health support'
    ],
    description: 'Full-service medical center specializing in international student healthcare.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-005',
    name: 'EduBank Financial Services',
    type: 'banking',
    contactEmail: 'student@edubank.com.my',
    contactPhone: '+60-3-2222-3333',
    country: 'Malaysia',
    services: [
      'Student bank account opening',
      'International money transfers',
      'Currency exchange',
      'Education loans',
      'Credit card applications'
    ],
    description: 'Banking solutions designed specifically for international students.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-006',
    name: 'StudyMate Support Services',
    type: 'other',
    contactEmail: 'support@studymate.my',
    contactPhone: '+60-11-999-8888',
    country: 'Malaysia',
    services: [
      'SIM card and mobile plans',
      'Internet connection setup',
      'Academic tutoring',
      'Language support classes',
      'Cultural orientation programs'
    ],
    description: 'Comprehensive support services to help students settle in Malaysia.',
    createdAt: new Date().toISOString(),
  }
];

export function initializeSampleServices() {
  console.log('🛠️ Initializing sample service providers...');
  
  const existingServices = StorageService.getServiceProviders();
  if (existingServices.length === 0) {
    SAMPLE_SERVICES.forEach(service => {
      StorageService.saveServiceProvider(service);
    });
    console.log(`✅ Created ${SAMPLE_SERVICES.length} service providers`);
  } else {
    console.log('📝 Service providers already exist, skipping initialization');
  }
}
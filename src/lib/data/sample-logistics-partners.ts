import { LogisticsPartner } from '@/types';
import { StorageService } from './storage';

export const SAMPLE_LOGISTICS_PARTNERS: LogisticsPartner[] = [
  {
    id: 'logistics-001',
    name: 'KL Airport Express Services',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    phone: '+60-12-345-6789',
    email: 'pickup@klairportexpress.my',
    services: [
      'Airport pickup and drop-off',
      'University shuttle service',
      'Local area transportation',
      'Luggage assistance',
      'Emergency transport'
    ],
    description: 'Reliable airport transfer and local transportation services for international students in KL.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-002',
    name: 'Cyberjaya Student Housing Solutions',
    city: 'Cyberjaya',
    country: 'Malaysia',
    phone: '+60-3-7890-1234',
    email: 'housing@cyberjayastudent.com',
    services: [
      'House hunting assistance',
      'Rental negotiations',
      'Furniture arrangement',
      'Utility setup',
      'Property viewing coordination'
    ],
    description: 'Complete housing solutions for students in Cyberjaya tech hub area.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-003',
    name: 'Penang Island Welcome Services',
    city: 'George Town',
    country: 'Malaysia',
    phone: '+60-4-555-7777',
    email: 'welcome@penangisland.my',
    services: [
      'Airport reception',
      'City orientation tours',
      'Banking assistance',
      'Mobile SIM card setup',
      'University registration support'
    ],
    description: 'Welcome and orientation services for new students arriving in Penang.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-004',
    name: 'Johor Bahru Student Concierge',
    city: 'Johor Bahru',
    country: 'Malaysia',
    phone: '+60-7-321-9876',
    email: 'concierge@jbstudent.com.my',
    services: [
      'Document processing assistance',
      'Embassy appointment booking',
      'Medical checkup arrangements',
      'Insurance enrollment',
      'Student pass applications'
    ],
    description: 'Professional concierge services for student visa and documentation needs.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-005',
    name: 'Melaka Heritage Student Support',
    city: 'Melaka',
    country: 'Malaysia',
    phone: '+60-6-789-0123',
    email: 'support@melakastudent.my',
    services: [
      'Cultural integration programs',
      'Language exchange meetups',
      'Local internship connections',
      'Academic tutoring services',
      'Emergency assistance 24/7'
    ],
    description: 'Comprehensive student support services in the historic city of Melaka.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-006',
    name: 'Sydney Student Gateway',
    city: 'Sydney',
    country: 'Australia',
    phone: '+61-2-9876-5432',
    email: 'gateway@sydneystudent.com.au',
    services: [
      'Airport pickup service',
      'Temporary accommodation',
      'Bank account opening',
      'Phone plan setup',
      'University enrollment assistance'
    ],
    description: 'Complete arrival and settlement services for international students in Sydney.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-007',
    name: 'Melbourne Student Movers',
    city: 'Melbourne',
    country: 'Australia',
    phone: '+61-3-8765-4321',
    email: 'movers@melbournestudent.com.au',
    services: [
      'Accommodation relocation',
      'Furniture delivery',
      'Storage solutions',
      'Interstate moving',
      'Cleaning services'
    ],
    description: 'Professional moving and relocation services for students in Melbourne.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-008',
    name: 'London Student Connect',
    city: 'London',
    country: 'United Kingdom',
    phone: '+44-20-7123-4567',
    email: 'connect@londonstudent.co.uk',
    services: [
      'Heathrow airport reception',
      'National Insurance number application',
      'GP registration',
      'Council tax assistance',
      'Student discount card setup'
    ],
    description: 'Essential services for international students settling in London.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-009',
    name: 'Dubai Student Bridge',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971-4-987-6543',
    email: 'bridge@dubaistudent.ae',
    services: [
      'Emirates ID assistance',
      'Dubai Metro card setup',
      'Housing contract reviews',
      'Cultural adaptation programs',
      'Visa extension services'
    ],
    description: 'Bridge services connecting international students to Dubai lifestyle.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'logistics-010',
    name: 'Toronto Student Navigator',
    city: 'Toronto',
    country: 'Canada',
    phone: '+1-416-555-0199',
    email: 'navigator@torontostudent.ca',
    services: [
      'SIN application assistance',
      'Healthcare enrollment',
      'Winter clothing shopping',
      'Public transport orientation',
      'Job search support'
    ],
    description: 'Navigate your way to successful student life in Toronto with our expert guidance.',
    createdAt: new Date().toISOString(),
  }
];

export function initializeSampleLogisticsPartners() {
  console.log('🚛 Initializing sample logistics partners...');
  
  const existingPartners = StorageService.getLogisticsPartners();
  if (existingPartners.length === 0) {
    SAMPLE_LOGISTICS_PARTNERS.forEach(partner => {
      StorageService.saveLogisticsPartner(partner);
    });
    console.log(`✅ Created ${SAMPLE_LOGISTICS_PARTNERS.length} logistics partners`);
  } else {
    console.log('📝 Logistics partners already exist, skipping initialization');
  }
}
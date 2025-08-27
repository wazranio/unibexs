import { Partner } from '@/types';
import { StorageService } from './storage';

export const SAMPLE_PARTNERS: Partner[] = [
  {
    id: 'partner-001',
    type: 'business',
    name: 'EduGlobal Consultants',
    email: 'info@eduglobal.com',
    phone: '+60-3-1234-5678',
    country: 'Malaysia',
    businessName: 'EduGlobal Consultancy Sdn Bhd',
    tradingLicense: 'https://example.com/license-001.pdf',
    status: 'approved',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: 'partner-002',
    type: 'individual',
    name: 'Sarah Johnson',
    email: 'sarah@educonsult.com',
    phone: '+1-555-0199',
    country: 'United States',
    photo: 'https://example.com/photo-sarah.jpg',
    passport: 'https://example.com/passport-sarah.pdf',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'partner-003',
    type: 'business',
    name: 'StudyPath International',
    email: 'contact@studypath.com',
    phone: '+91-11-1234-5678',
    country: 'India',
    businessName: 'StudyPath International Pvt Ltd',
    tradingLicense: 'https://example.com/license-003.pdf',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'partner-004',
    type: 'individual',
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@educationcenter.ae',
    phone: '+971-4-123-4567',
    country: 'United Arab Emirates',
    photo: 'https://example.com/photo-ahmed.jpg',
    passport: 'https://example.com/passport-ahmed.pdf',
    status: 'approved',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: 'partner-005',
    type: 'business',
    name: 'Future Leaders Academy',
    email: 'info@futureleaders.com',
    phone: '+65-6123-4567',
    country: 'Singapore',
    businessName: 'Future Leaders Academy Pte Ltd',
    tradingLicense: 'https://example.com/license-005.pdf',
    status: 'rejected',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  }
];

export function initializeSamplePartners() {
  console.log('🚀 Initializing sample partners...');
  
  // Clear existing partners
  const existingPartners = StorageService.getPartners();
  if (existingPartners.length === 0) {
    SAMPLE_PARTNERS.forEach(partner => {
      StorageService.savePartner(partner);
    });
    console.log(`✅ Created ${SAMPLE_PARTNERS.length} sample partners`);
  } else {
    console.log('📝 Partners already exist, skipping initialization');
  }
}
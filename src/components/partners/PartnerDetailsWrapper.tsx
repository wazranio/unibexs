'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Partner } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import PartnerDetails from './PartnerDetails';
import Sidebar from '@/components/layout/Sidebar';

const PartnerDetailsWrapper: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const partnerId = params.id as string;
  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }

    const loadPartner = () => {
      try {
        const partners = StorageService.getPartners();
        const foundPartner = partners.find(p => p.id === partnerId);
        
        if (!foundPartner) {
          setError('Partner not found');
        } else {
          setPartner(foundPartner);
        }
      } catch (err) {
        console.error('Error loading partner:', err);
        setError('Failed to load partner details');
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, [partnerId, isAdmin, router]);

  if (!isAdmin) {
    return null;
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

  if (error || !partner) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              {error || 'Partner not found'}
            </h2>
            <p className="text-gray-300 mb-4">
              The requested partner could not be found.
            </p>
            <button
              onClick={() => router.push('/admin/partners')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Partners
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <PartnerDetails partner={partner} />;
};

export default PartnerDetailsWrapper;
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApplicationDetailsV3 from './ApplicationDetailsV3';
import { StorageService } from '@/lib/data/storage';
import { Application, Student, Partner } from '@/types';

const PartnerApplicationDetailsWrapper: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applicationId = params?.id as string;

  useEffect(() => {
    if (!applicationId) {
      setError('Application ID not found');
      setLoading(false);
      return;
    }

    try {
      // Get application data
      const app = StorageService.getApplication(applicationId);
      if (!app) {
        setError('Application not found');
        setLoading(false);
        return;
      }

      setApplication(app);

      // Get related data
      const studentData = StorageService.getStudent(app.studentId);
      const partnerData = StorageService.getPartner(app.partnerId);
      
      setStudent(studentData || null);
      setPartner(partnerData || null);
      
    } catch (err) {
      console.error('Error loading application data:', err);
      setError('Failed to load application data');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Application Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The requested application could not be found.'}</p>
          <button
            onClick={() => router.push('/partner/applications')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 btn-enhanced focus-ring"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApplicationDetailsV3 
      application={application}
      student={student || undefined}
      partner={partner || undefined}
      isAdmin={false}
    />
  );
};

export default PartnerApplicationDetailsWrapper;
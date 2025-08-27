'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const session = AuthService.getCurrentSession();
      console.log('[PartnerLayout] Checking auth, session:', session?.user);
      
      if (!session) {
        console.log('[PartnerLayout] No session, redirecting to login');
        router.push('/');
        return;
      }

      if (session.user.role !== 'partner') {
        console.log('[PartnerLayout] User is not partner, redirecting to admin');
        router.push('/admin/applications');
        return;
      }

      console.log('[PartnerLayout] Auth check passed, partnerId:', session.user.partnerId);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appleaction_session') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return children;
}
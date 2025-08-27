'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const session = AuthService.getCurrentSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      if (session.user.role !== 'admin') {
        router.push('/partner/applications');
        return;
      }

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
}
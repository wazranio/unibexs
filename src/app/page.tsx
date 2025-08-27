'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/auth/LoginPage';
import { AuthService } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (session) {
      // Redirect authenticated users to applications page
      if (AuthService.isAdmin()) {
        router.push('/admin/applications');
      } else {
        router.push('/partner/applications');
      }
    }
  }, [router]);

  return <LoginPage />;
}
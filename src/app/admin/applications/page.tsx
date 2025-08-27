'use client';

import ApplicationsList from '@/components/applications/ApplicationsList';

export default function AdminApplicationsPage() {
  return <ApplicationsList isAdmin={true} />;
}
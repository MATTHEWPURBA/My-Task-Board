// src/app/calendar-settings/page.tsx (same approach for login page)
import { Suspense } from 'react';
import CalendarSettingsClient from '@/components/CalendarSettingsClient';

export default function CalendarSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CalendarSettingsClient />
    </Suspense>
  );
}
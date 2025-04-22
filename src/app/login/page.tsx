// src/app/login/page.tsx

import LoginClient from '@/components/LoginClient';
import { Suspense } from 'react';


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
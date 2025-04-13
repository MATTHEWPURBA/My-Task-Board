// src/app/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // For demo purposes: auto-create a demo user after a short delay
    const timer = setTimeout(() => {
      handleDemoLogin();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDemoLogin = async () => {
    try {
      // Create a demo user 
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // If login was successful, redirect to home or the calendar settings
        const redirectTo = searchParams.get('redirectTo') || '/';
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Error during demo login:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Board</h1>
          <p className="text-gray-600 mb-6">Continuing as demo user</p>
          
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error === 'no_code' && 'No authorization code received from Google.'}
              {error === 'not_authenticated' && 'Authentication required to connect Google Calendar.'}
              {error === 'callback_failed' && 'Failed to complete Google authentication.'}
              {!['no_code', 'not_authenticated', 'callback_failed'].includes(error) && 
                'An error occurred during authentication.'}
            </div>
          )}
          
          <div className="animate-pulse mt-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Creating demo user account...</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-500 hover:text-blue-700 text-sm">
            Or continue without logging in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
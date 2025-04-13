// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key-for-development-only";

// Paths that require authentication
const PROTECTED_PATHS = [
  '/api/calendar-settings',
  '/api/tasks/*/calendar-sync',
  '/calendar-settings'
];

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => {
    if (protectedPath.includes('*')) {
      const basePath = protectedPath.replace('*', '');
      return path.startsWith(basePath);
    }
    return path === protectedPath;
  });
  
  // If this is not a protected path, don't apply middleware
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Get the JWT token from the cookies
  const authCookie = request.cookies.get("Authorization");
  
  // Redirect to login if no authentication cookie is found
  if (!authCookie) {
    // For API routes, return a JSON response
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For non-API routes, redirect to demo login
    const demoLoginUrl = new URL('/api/auth/demo-login', request.url);
    demoLoginUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(demoLoginUrl);
    
    // For regular routes, redirect to the login page
    // const loginUrl = new URL('/api/auth/demo-login', request.url);
    // loginUrl.searchParams.set('redirectTo', path);
    
    // const response = NextResponse.redirect(loginUrl);
    // return response;
  }
  
  try {
    // Verify the JWT token
    const token = decodeURIComponent(authCookie.value).split(" ")[1];
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    
    // If token is valid, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    
    // For API routes, return a JSON response
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    


     // For non-API routes, redirect to demo login to get a fresh token
     const demoLoginUrl = new URL('/api/auth/demo-login', request.url);
     demoLoginUrl.searchParams.set('redirectTo', path);
     return NextResponse.redirect(demoLoginUrl);


    // // For regular routes, redirect to the login page
    // const loginUrl = new URL('/api/auth/demo-login', request.url);
    // loginUrl.searchParams.set('redirectTo', path);
    
    // const response = NextResponse.redirect(loginUrl);
    // return response;
    
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/calendar-settings/:path*',
    '/api/tasks/:path*/calendar-sync',
    '/calendar-settings',
  ],
};
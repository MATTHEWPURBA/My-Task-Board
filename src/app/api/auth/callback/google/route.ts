// src/app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, storeUserTokens } from '@/lib/google-auth';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose'; // Added SignJWT to imports
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-for-development-only';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Get the current user ID from the authenticated session
    const cookieStore = cookies();
    const authCookie = cookieStore.get('Authorization');

    let userId: string;

    if (!authCookie) {
      // No authentication cookie found, create a demo user instead of redirecting
      // This is a simplified approach for the demo purposes
      const demoEmail = `demo-${uuidv4().substring(0, 8)}@taskboard.demo`;

      // Create a new demo user
      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: demoEmail,
          name: 'Demo User',
        },
      });

      userId = user.id;

      // Create a JWT token for this demo user
      const secret = new TextEncoder().encode(JWT_SECRET);
      const token = await new SignJWT({
        _id: userId,
        username: 'Demo User',
        email: demoEmail,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(secret);

      // Set the cookie
      cookies().set({
        name: 'Authorization',
        value: `Bearer ${token}`,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
      });
    } else {
      // Decode the JWT token to get the user ID
      try {
        const token = decodeURIComponent(authCookie.value).split(' ')[1];
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify<{ _id: string; username: string; email: string }>(token, secret);
        userId = payload._id;
      } catch (jwtError) {
        console.error('Error verifying JWT:', jwtError);
        // Create a new demo user if token validation fails
        const demoEmail = `demo-${uuidv4().substring(0, 8)}@taskboard.demo`;
        const user = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: demoEmail,
            name: 'Demo User',
          },
        });
        userId = user.id;
        // Create a new JWT token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({
          _id: userId,
          username: 'Demo User',
          email: demoEmail,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('1d')
          .sign(secret);

        // Set the cookie
        cookies().set({
          name: 'Authorization',
          value: `Bearer ${token}`,
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: 'lax',
        });
      }
    }

    try {
      // Exchange the code for tokens
      const tokens = await getTokensFromCode(code);

      // Store the tokens in the database
      await storeUserTokens(userId, tokens);

      // Check if the user has calendar settings, create if not
      const userSettings = await prisma.calendarSettings.findUnique({
        where: { userId },
      });

      if (!userSettings) {
        await prisma.calendarSettings.create({
          data: {
            userId,
            enabled: true,
            syncCompletedTasks: true,
            syncWontDoTasks: false,
          },
        });
      }

      // Redirect back to the application with success message
      return NextResponse.redirect(new URL('/calendar-settings?success=true', request.url));
    } catch (tokenError) {
      console.error('Error processing Google tokens:', tokenError);
      return NextResponse.redirect(new URL('/calendar-settings?error=token_processing', request.url));
    }
  } catch (error) {
    console.error('Error handling Google auth callback:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}

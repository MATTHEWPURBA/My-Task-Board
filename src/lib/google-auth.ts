// src/lib/google-auth.ts
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import prisma from './db';


// These would be environment variables in a real application
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';


// Create OAuth2 client
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}


// Generate authorization URL
export function getAuthorizationUrl() {
  const oauth2Client = getOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent', // Always prompt for consent to ensure we get a refresh token
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  
  // Calculate expiry time
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + (tokens.expiry_date || 3600));
  
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiryDate.getTime(),
    token_type: tokens.token_type,
  };
}

// Store tokens in database for the user
export async function storeUserTokens(userId: string, tokens: any) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleTokens: {
        upsert: {
          create: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(tokens.expires_at),
          },
          update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(tokens.expires_at),
          },
        },
      },
    },
  });
}

// Get authenticated Google Calendar API instance
export async function getCalendarApi(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { googleTokens: true },
  });
  
  if (!user?.googleTokens) {
    throw new Error('User not authenticated with Google');
  }
  
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.googleTokens.accessToken,
    refresh_token: user.googleTokens.refreshToken,
    expiry_date: user.googleTokens.expiresAt.getTime(),
  });
  


  // Set up token refresh callback
oauth2Client.on('tokens', async (tokens) => {
    // Create an update data object with only defined fields
    const updateData: any = {};
    
    // Only add fields that exist in the tokens object
    if (tokens.access_token) {
      updateData.accessToken = tokens.access_token;
    }
    
    if (tokens.refresh_token) {
      updateData.refreshToken = tokens.refresh_token;
    }
    
    // Always update expiry time
    updateData.expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 0) {
      await prisma.googleTokens.update({
        where: { userId: user.id },
        data: updateData
      });
    }
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}
// src/lib/google-auth.ts
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import prisma from './db';

// These would be environment variables in a real application
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

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

// Define an extended credentials interface to handle Google's actual response
interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string; 
  expires_in?: number;
  token_type?: string;
  id_token?: string;
  expiry_date?: number;
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  
  // Use type assertion to access expires_in
  const tokenData = tokens as unknown as GoogleTokenResponse;
  
  // Calculate a reasonable expiry time (1 hour from now if not provided)
  const expiresInSeconds = tokenData.expires_in || 3600; // Default to 1 hour
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + expiresInSeconds);
  
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiryDate.getTime(), // Return as timestamp
    token_type: tokens.token_type,
  };
}

// Store tokens in database for the user
export async function storeUserTokens(userId: string, tokens: any) {
  try {
    // Create a valid expiration date (ensure it's not too far in the future)
    let expiresAt: Date;
    
    if (tokens.expires_at) {
      // Use the provided expiration time, but validate it
      const expiresAtTimestamp = Number(tokens.expires_at);
      
      // Check if it's a reasonable date (not more than 1 year in the future)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (isNaN(expiresAtTimestamp) || expiresAtTimestamp > oneYearFromNow.getTime()) {
        // Use a default expiration of 1 hour from now if the date is invalid
        expiresAt = new Date(Date.now() + 3600 * 1000);
      } else {
        expiresAt = new Date(expiresAtTimestamp);
      }
    } else {
      // Default to 1 hour from now if no expiration provided
      expiresAt = new Date(Date.now() + 3600 * 1000);
    }
    
    // Update the user with the new tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleTokens: {
          upsert: {
            create: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: expiresAt,
            },
            update: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token ? tokens.refresh_token : undefined, // Only update if provided
              expiresAt: expiresAt,
            },
          },
        },
      },
    });
    
    console.log(`Successfully stored tokens for user ${userId} with expiration ${expiresAt.toISOString()}`);
  } catch (error) {
    console.error('Error storing user tokens:', error);
    throw error;
  }
}

// Get authenticated Google Calendar API instance
export async function getCalendarApi(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { googleTokens: true },
  });
  
  if (!user?.googleTokens) {
    console.log(`User ${userId} not authenticated with Google - returning null`);
    return null;
  }
  
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.googleTokens.accessToken,
    refresh_token: user.googleTokens.refreshToken,
    expiry_date: user.googleTokens.expiresAt.getTime(),
  });
  
  // Set up token refresh callback
  oauth2Client.on('tokens', async (tokens) => {
    try {
      // Use type assertion to access the Google token properties
      const tokenData = tokens as unknown as GoogleTokenResponse;
      
      // Create an update data object with only defined fields
      const updateData: any = {};
      
      // Only add fields that exist in the tokens object
      if (tokens.access_token) {
        updateData.accessToken = tokens.access_token;
      }
      
      if (tokens.refresh_token) {
        updateData.refreshToken = tokens.refresh_token;
      }
      
      // Calculate a reasonable expiry time
      const expiresIn = tokenData.expires_in || 3600; // Default to 1 hour
      updateData.expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      // Only update if we have data to update
      if (Object.keys(updateData).length > 0) {
        await prisma.googleTokens.update({
          where: { userId: user.id },
          data: updateData
        });
        console.log(`Token refreshed for user ${userId}`);
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    }
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}
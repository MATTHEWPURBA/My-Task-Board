// src/app/api/calendar-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listCalendars } from '@/lib/google-calendar';
import prisma from '@/lib/db';
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// The best solution is the first one using the Google API types
import { calendar_v3 } from 'googleapis';


// Secret key for JWT verification
const rahasia = process.env.JWT_SECRET as string;

// GET /api/calendar-settings - Get user's calendar settings and available calendars
export async function GET(request: NextRequest) {
  try {
    // Get the current user ID from the authenticated session
    const cookieStore = cookies();
    const authCookie = cookieStore.get("Authorization");
    
    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Decode the JWT token to get the user ID
    const token = decodeURIComponent(authCookie.value).split(" ")[1];
    const secret = new TextEncoder().encode(rahasia);
    const { payload } = await jwtVerify<{ _id: string; username: string; email: string }>(token, secret);
    const userId = payload._id;
    
    // Get the user's calendar settings
    const settings = await prisma.calendarSettings.findUnique({
      where: { userId },
    });
    
    // Get the user's available Google Calendars
    let calendars: calendar_v3.Schema$CalendarListEntry[] = [];

    try {
      calendars = await listCalendars(userId);
    } catch (error) {
      console.error("Error fetching calendars:", error);
      // If there's an error fetching calendars, continue with empty list
      // This could happen if the user hasn't connected their Google account yet
    }
    
    return NextResponse.json({ settings, calendars });
  } catch (error) {
    console.error('Error getting calendar settings:', error);
    return NextResponse.json({ error: 'Failed to get calendar settings' }, { status: 500 });
  }
}

// PUT /api/calendar-settings - Update user's calendar settings
export async function PUT(request: NextRequest) {
  try {
    // Get the current user ID from the authenticated session
    const cookieStore = cookies();
    const authCookie = cookieStore.get("Authorization");
    
    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Decode the JWT token to get the user ID
    const token = decodeURIComponent(authCookie.value).split(" ")[1];
    const secret = new TextEncoder().encode(rahasia);
    const { payload } = await jwtVerify<{ _id: string; username: string; email: string }>(token, secret);
    const userId = payload._id;
    
    // Get the settings from the request body
    const body = await request.json();
    const { enabled, defaultCalendarId, syncCompletedTasks, syncWontDoTasks } = body;
    
    // Update the settings
    const updatedSettings = await prisma.calendarSettings.upsert({
      where: { userId },
      update: {
        enabled,
        defaultCalendarId,
        syncCompletedTasks,
        syncWontDoTasks,
      },
      create: {
        userId,
        enabled,
        defaultCalendarId,
        syncCompletedTasks,
        syncWontDoTasks,
      },
    });
    
    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error('Error updating calendar settings:', error);
    return NextResponse.json({ error: 'Failed to update calendar settings' }, { status: 500 });
  }
}
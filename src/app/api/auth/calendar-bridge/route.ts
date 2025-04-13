// src/app/api/auth/calendar-bridge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || "task-board-secret-key-for-demo-purposes-only";

export async function GET(request: NextRequest) {
  try {
    // Create a demo user ID for calendar access
    const userId = uuidv4();
    const userEmail = `demo-${userId.substring(0, 8)}@taskboard.demo`;
    
    // Create a new user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: userEmail,
        name: "Demo User",
        // Create default calendar settings
        calendarSettings: {
          create: {
            enabled: true,
            syncCompletedTasks: true,
            syncWontDoTasks: false,
          },
        },
      },
    });
    
    // Create a JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ 
      _id: user.id,
      username: user.name || "Demo User", 
      email: user.email 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);
    
    // Set the cookie
    cookies().set({
      name: "Authorization",
      value: `Bearer ${token}`,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    });
    
    // Get the redirect URL from query params or default to calendar settings
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/api/auth/google';
    
    // Redirect to Google Auth or another specified location
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error("Error creating demo user:", error);
    return NextResponse.json({ error: "Failed to create demo user" }, { status: 500 });
  }
}
// src/app/api/auth/demo-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key-for-development-only";

// Add this GET handler to your existing file
export async function GET(request: NextRequest) {
    try {
      // Create a demo user ID
      const userId = uuidv4();
      const userEmail = `demo-${userId.substring(0, 8)}@taskboard.demo`;
      
      // Check if user already exists in database (for demo purposes, unlikely)
      let user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      
      // If user doesn't exist, create one
      if (!user) {
        user = await prisma.user.create({
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
      }
      
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
      
      // Get the redirect URL from query params or default to home
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
      
      // Redirect to the requested page
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } catch (error) {
      console.error("Error creating demo user:", error);
      return NextResponse.json({ error: "Failed to create demo user" }, { status: 500 });
    }
  }

export async function POST(request: NextRequest) {
  try {
    // Create a demo user ID
    const userId = uuidv4();
    const userEmail = `demo-${userId.substring(0, 8)}@taskboard.demo`;
    
    // Check if user already exists in database (for demo purposes, unlikely)
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    // If user doesn't exist, create one
    if (!user) {
      user = await prisma.user.create({
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
    }
    
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
    
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Error creating demo user:", error);
    return NextResponse.json({ error: "Failed to create demo user" }, { status: 500 });
  }
}
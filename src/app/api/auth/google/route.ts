// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/google-auth";

export async function GET(_request: NextRequest) {
  try {
    // Generate Google OAuth URL
    const authUrl = getAuthorizationUrl();
    
    // Redirect to Google's OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating Google auth:", error);
    return NextResponse.json({ error: "Failed to initiate Google authentication" }, { status: 500 });
  }
}
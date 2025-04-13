//src/app/api/boards/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key-for-development-only";

// POST /api/boards - Create a new board
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get the user ID from the JWT token
    let userId: string | null = null;
    
    // Try to get user from cookie
    try {
      const cookieStore = cookies();
      const authCookie = cookieStore.get("Authorization");
      
      if (authCookie) {
        const token = decodeURIComponent(authCookie.value).split(" ")[1];
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify<{ _id: string; username: string; email: string }>(token, secret);
        userId = payload._id;
      }
    } catch (authError) {
      console.error('Error authenticating user:', authError);
      // Continue without user ID - will create an unassociated board
    }
    
    // Create a new board with default tasks
    const newBoard = await prisma.board.create({
      data: {
        name: body.name || 'My Task Board',
        description: body.description,
        userId: userId, // Associate with user if we have one
        tasks: {
          create: [
            {
              name: 'Task To Do',
              description: 'This is a task that needs to be done.',
              status: 'To Do',
              icon: '📋'
            },
            {
              name: 'Task in Progress',
              description: 'This is a task currently in progress.',
              status: 'In Progress',
              icon: '🔄'
            },
            {
              name: 'Task Completed',
              description: 'This is a completed task.',
              status: 'Completed',
              icon: '✅'
            },
            {
              name: "Task Won't Do",
              description: 'This task will not be done.',
              status: "Won't do",
              icon: '❌'
            }
          ]
        }
      },
      include: {
        tasks: true
      }
    });
    
    return NextResponse.json(newBoard);
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating board:', error);
    
    // Return more specific error information
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown database error';
      
    return NextResponse.json(
      { error: 'Failed to create board', details: errorMessage }, 
      { status: 500 }
    );
  }
}
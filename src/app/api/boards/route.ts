import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/boards - Create a new board
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create a new board with default tasks
    const newBoard = await prisma.board.create({
      data: {
        name: body.name || 'My Task Board',
        description: body.description,
        tasks: {
          create: [
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
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}
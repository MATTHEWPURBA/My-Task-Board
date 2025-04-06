import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/boards/:board-id - Get a board by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { 'board-id': string } }
) {
  try {
    const boardId = params['board-id'];
    
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { tasks: true }
    });
    
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    
    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

// PUT /api/boards/:board-id - Update a board by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { 'board-id': string } }
) {
  try {
    const boardId = params['board-id'];
    const body = await request.json();
    
    // Check if this is a board update or task addition
    if (body.action === 'addTask') {
      // Adding a new task to the board
      const newTask = await prisma.task.create({
        data: {
          name: body.task.name || 'New Task',
          description: body.task.description || '',
          icon: body.task.icon || '📝',
          status: body.task.status,
          boardId: boardId
        }
      });
      
      // Return the updated board with all tasks
      const updatedBoard = await prisma.board.findUnique({
        where: { id: boardId },
        include: { tasks: true }
      });
      
      return NextResponse.json(updatedBoard);
    } else {
      // Regular board update
      const updatedBoard = await prisma.board.update({
        where: { id: boardId },
        data: {
          name: body.name,
          description: body.description
        },
        include: { tasks: true }
      });
      
      return NextResponse.json(updatedBoard);
    }
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

// DELETE /api/boards/:board-id - Delete a board by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { 'board-id': string } }
) {
  try {
    const boardId = params['board-id'];
    
    await prisma.board.delete({
      where: { id: boardId }
    });
    
    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
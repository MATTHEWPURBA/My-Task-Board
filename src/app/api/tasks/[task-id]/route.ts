//src/app/api/tasks/[task-id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// PUT /api/tasks/:task-id - Update a task by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { 'task-id': string } }
) {
  try {
    const taskId = params['task-id'];
    
    // If taskId is 'new', return an error
    if (taskId === 'new') {
      return NextResponse.json(
        { error: 'Cannot update a task with ID "new". Use the create task endpoint instead.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Try to find the task first
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });
    
    // If task doesn't exist, return a 404
    if (!existingTask) {
      return NextResponse.json(
        { error: `Task with ID ${taskId} not found` },
        { status: 404 }
      );
    }
    
    // Now update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        status: body.status
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/:task-id - Delete a task by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { 'task-id': string } }
) {
  try {
    const taskId = params['task-id'];
    
    // If taskId is 'new', just return success since it doesn't exist anyway
    if (taskId === 'new') {
      return NextResponse.json({ message: 'Task deleted successfully' });
    }
    
    // Try to find the task first
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });
    
    // If task doesn't exist, return a 404
    if (!existingTask) {
      return NextResponse.json(
        { error: `Task with ID ${taskId} not found` },
        { status: 404 }
      );
    }
    
    await prisma.task.delete({
      where: { id: taskId }
    });
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
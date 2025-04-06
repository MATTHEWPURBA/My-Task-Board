import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// PUT /api/tasks/:task-id - Update a task by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { 'task-id': string } }
) {
  try {
    const taskId = params['task-id'];
    const body = await request.json();
    
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
    
    await prisma.task.delete({
      where: { id: taskId }
    });
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
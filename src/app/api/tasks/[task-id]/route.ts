//src/app/api/tasks/[task-id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { syncTaskWithCalendar } from '@/lib/google-calendar';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const rahasia = process.env.JWT_SECRET as string;

// GET /api/tasks/:task-id - Get a task by ID
export async function GET(request: NextRequest, { params }: { params: { 'task-id': string } }) {
  try {
    const taskId = params['task-id'];
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/tasks/:task-id - Update a task by ID
export async function PUT(request: NextRequest, { params }: { params: { 'task-id': string } }) {
  try {
    const taskId = params['task-id'];

    // If taskId is 'new', return an error
    if (taskId === 'new') {
      return NextResponse.json({ error: 'Cannot update a task with ID "new". Use the create task endpoint instead.' }, { status: 400 });
    }

    const body = await request.json();

    // Try to find the task first
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    // If task doesn't exist, return a 404
    if (!existingTask) {
      return NextResponse.json({ error: `Task with ID ${taskId} not found` }, { status: 404 });
    }


// Get user ID from authentication token
let userId = null;
try {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("Authorization");
  
  if (authCookie) {
    const token = decodeURIComponent(authCookie.value).split(" ")[1];
    const secret = new TextEncoder().encode(rahasia);
    const { payload } = await jwtVerify<{ _id: string; username: string; email: string }>(token, secret);
    userId = payload._id;
  }
} catch (authError) {
  console.error('Error authenticating user:', authError);
  // Continue without user ID - calendar sync will be skipped
}


  // Now update the task with new fields for calendar support
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      name: body.name,
      description: body.description,
      icon: body.icon,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      reminderTime: body.reminderTime ? new Date(body.reminderTime) : undefined,
      isCalendarSynced: body.isCalendarSynced || false,
    },
  });

  // Sync with Google Calendar if needed and user is authenticated
  if (userId && updatedTask.dueDate && updatedTask.isCalendarSynced) {
    try {
      // Convert Prisma model to Task type for the calendar sync function
      const taskForSync = {
        id: updatedTask.id,
        name: updatedTask.name,
        description: updatedTask.description || "",
        icon: updatedTask.icon || "📝",
        status: updatedTask.status as any,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
        boardId: updatedTask.boardId,
        dueDate: updatedTask.dueDate,
        reminderTime: updatedTask.reminderTime,
        isCalendarSynced: updatedTask.isCalendarSynced,
        calendarEventId: updatedTask.calendarEventId || null,
      };
      
      // Sync with Google Calendar
      const syncedTask = await syncTaskWithCalendar(userId, taskForSync);
      
      // Update the task with any changes from the calendar sync
      if (syncedTask.calendarEventId !== updatedTask.calendarEventId) {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            calendarEventId: syncedTask.calendarEventId,
            isCalendarSynced: syncedTask.isCalendarSynced,
          },
        });
      }
    } catch (calendarError) {
      console.error('Error syncing with calendar:', calendarError);
      // Continue without failing the request - just log the error
    }
  }

  return NextResponse.json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/:task-id - Delete a task by ID
export async function DELETE(request: NextRequest, { params }: { params: { 'task-id': string } }) {
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
      return NextResponse.json({ error: `Task with ID ${taskId} not found` }, { status: 404 });
    }



// Get user ID from authentication token
let userId = null;
try {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("Authorization");
  
  if (authCookie) {
    const token = decodeURIComponent(authCookie.value).split(" ")[1];
    const secret = new TextEncoder().encode(rahasia);
    const { payload } = await jwtVerify<{ _id: string; username: string; email: string }>(token, secret);
    userId = payload._id;
  }
} catch (authError) {
  console.error('Error authenticating user:', authError);
  // Continue without user ID - calendar sync will be skipped
}

// Delete from Google Calendar if needed and user is authenticated
if (userId && existingTask.isCalendarSynced && existingTask.calendarEventId) {
  try {
    // Convert Prisma model to Task type for the calendar sync function
    const taskForSync = {
      id: existingTask.id,
      name: existingTask.name,
      description: existingTask.description || "",
      icon: existingTask.icon || "📝",
      status: existingTask.status as any,
      createdAt: existingTask.createdAt,
      updatedAt: existingTask.updatedAt,
      boardId: existingTask.boardId,
      dueDate: existingTask.dueDate,
      reminderTime: existingTask.reminderTime,
      isCalendarSynced: false, // Set to false to trigger deletion
      calendarEventId: existingTask.calendarEventId,
    };
    
    // This will delete the event from Google Calendar
    await syncTaskWithCalendar(userId, taskForSync);
  } catch (calendarError) {
    console.error('Error removing task from calendar:', calendarError);
    // Continue without failing the request - just log the error
  }
}









    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

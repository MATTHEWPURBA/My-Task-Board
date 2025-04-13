// src/app/api/tasks/[task-id]/calendar-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncTaskWithCalendar } from '@/lib/google-calendar';
import prisma from '@/lib/db';
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Secret key for JWT verification
const rahasia = process.env.JWT_SECRET as string;

export async function POST(
  request: NextRequest,
  { params }: { params: { 'task-id': string } }
) {
  try {
    // Get the task ID from the URL
    const taskId = params['task-id'];
    
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
    
    // Get the sync status from the request body
    const body = await request.json();
    const { syncWithCalendar } = body;
    
    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { board: true },
    });
    
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    // Modified ownership check - allow access if:
    // 1. The board has no owner (userId is null)
    // 2. The board owner matches the authenticated user
    if (task.board.userId !== null && task.board.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // If the board has no owner, assign it to this user
    if (task.board.userId === null) {
      await prisma.board.update({
        where: { id: task.board.id },
        data: { userId: userId }
      });
    }
    
    // Update the task's sync status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { isCalendarSynced: syncWithCalendar },
    });
    
    // If syncing is enabled, sync with Google Calendar
    if (syncWithCalendar) {
      // Convert Prisma model to Task type
      const taskToSync = {
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
      const syncedTask = await syncTaskWithCalendar(userId, taskToSync);
      
      // Update the task with the synced information
      await prisma.task.update({
        where: { id: taskId },
        data: {
          calendarEventId: syncedTask.calendarEventId,
          isCalendarSynced: syncedTask.isCalendarSynced,
        },
      });
      
      return NextResponse.json({ success: true, synced: true });
    } 
    // If syncing is disabled, remove from Google Calendar if it was previously synced
    else if (updatedTask.calendarEventId) {
      const taskToUnsync = {
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
        isCalendarSynced: false,
        calendarEventId: updatedTask.calendarEventId,
      };
      
      // Remove from Google Calendar
      await syncTaskWithCalendar(userId, taskToUnsync);
      
      // Update the task
      await prisma.task.update({
        where: { id: taskId },
        data: {
          calendarEventId: null,
        },
      });
    }
    
    return NextResponse.json({ success: true, synced: false });
  } catch (error) {
    console.error('Error syncing task with calendar:', error);
    return NextResponse.json({ error: 'Failed to sync task with calendar' }, { status: 500 });
  }
}
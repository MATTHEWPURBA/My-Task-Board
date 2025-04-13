// src/lib/google-calendar.ts
import { getCalendarApi } from './google-auth';
import { Task } from '@/types';
import { calendar_v3 } from 'googleapis';
import prisma from './db';

// Get a list of the user's calendars
export async function listCalendars(userId: string) {
  const calendar = await getCalendarApi(userId);
  const response = await calendar.calendarList.list();
  return response.data.items || [];
}

// Create a new event in Google Calendar
export async function createCalendarEvent(userId: string, task: Task): Promise<string | null> {
  try {
    if (!task.dueDate) {
      return null; // Cannot create calendar event without a due date
    }

    const calendar = await getCalendarApi(userId);
    
    // Get user's calendar settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { calendarSettings: true },
    });
    
    const calendarId = user?.calendarSettings?.defaultCalendarId || 'primary';
    
    // Create event resource
    const eventResource: calendar_v3.Schema$Event = {
      summary: task.name,
      description: task.description || '',
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(task.dueDate).getTime() + 30 * 60000).toISOString(), // Add 30 minutes by default
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      // Add task metadata as extended properties
      extendedProperties: {
        private: {
          taskId: task.id,
          boardId: task.boardId,
          status: task.status,
        },
      },
    };
    
    // Add reminder if set
    if (task.reminderTime) {
      eventResource.reminders = {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: Math.floor((task.dueDate.getTime() - task.reminderTime.getTime()) / 60000),
          },
        ],
      };
    } else {
      eventResource.reminders = {
        useDefault: true,
      };
    }
    
    // Create the event
    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventResource,
    });
    
    return response.data.id || null;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return null;
  }
}

// Update an existing event in Google Calendar
export async function updateCalendarEvent(userId: string, task: Task): Promise<boolean> {
  try {
    if (!task.calendarEventId || !task.dueDate) {
      return false;
    }

    const calendar = await getCalendarApi(userId);
    
    // Get user's calendar settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { calendarSettings: true },
    });
    
    const calendarId = user?.calendarSettings?.defaultCalendarId || 'primary';
    
    // Get the existing event
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId: task.calendarEventId,
    });
    
    if (!existingEvent.data) {
      return false;
    }
    
    // Update event resource
    const eventResource: calendar_v3.Schema$Event = {
      ...existingEvent.data,
      summary: task.name,
      description: task.description || '',
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(task.dueDate).getTime() + 30 * 60000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      extendedProperties: {
        private: {
          taskId: task.id,
          boardId: task.boardId,
          status: task.status,
        },
      },
    };
    
    // Update reminders if needed
    if (task.reminderTime) {
      eventResource.reminders = {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: Math.floor((task.dueDate.getTime() - task.reminderTime.getTime()) / 60000),
          },
        ],
      };
    }
    
    // Update the event
    await calendar.events.update({
      calendarId,
      eventId: task.calendarEventId,
      requestBody: eventResource,
    });
    
    return true;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    return false;
  }
}

// Delete an event from Google Calendar
export async function deleteCalendarEvent(userId: string, task: Task): Promise<boolean> {
  try {
    if (!task.calendarEventId) {
      return false;
    }

    const calendar = await getCalendarApi(userId);
    
    // Get user's calendar settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { calendarSettings: true },
    });
    
    const calendarId = user?.calendarSettings?.defaultCalendarId || 'primary';
    
    // Delete the event
    await calendar.events.delete({
      calendarId,
      eventId: task.calendarEventId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return false;
  }
}

// Sync a task with Google Calendar
export async function syncTaskWithCalendar(userId: string, task: Task): Promise<Task> {
  // If task is already synced, update the existing event
  if (task.isCalendarSynced && task.calendarEventId) {
    const success = await updateCalendarEvent(userId, task);
    if (!success) {
      // If update fails, try to create a new event
      const eventId = await createCalendarEvent(userId, task);
      if (eventId) {
        task.calendarEventId = eventId;
      } else {
        // If creation also fails, mark as not synced
        task.isCalendarSynced = false;
        task.calendarEventId = null;
      }
    }
  } 
  // If not synced but should be, create a new event
  else if (task.isCalendarSynced && !task.calendarEventId) {
    const eventId = await createCalendarEvent(userId, task);
    if (eventId) {
      task.calendarEventId = eventId;
    } else {
      // If creation fails, mark as not synced
      task.isCalendarSynced = false;
    }
  }
  // If should not be synced but has an event ID, delete the event
  else if (!task.isCalendarSynced && task.calendarEventId) {
    await deleteCalendarEvent(userId, task);
    task.calendarEventId = null;
  }
  
  return task;
}
// src/types/index.ts
export type Task = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  status: 'To Do' | 'In Progress' | 'Completed' | "Won't do";
  createdAt: Date;
  updatedAt: Date;
  boardId: string;
  
  // Calendar integration fields
  dueDate?: Date | null;
  reminderTime?: Date | null;
  isCalendarSynced?: boolean;
  calendarEventId?: string | null;
};

export type Board = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
};

export type TaskFormData = {
  name: string;
  description?: string;
  icon?: string;
  status: 'To Do' | 'In Progress' | 'Completed' | "Won't do";
  dueDate?: Date | null;
  reminderTime?: Date | null;
  isCalendarSynced?: boolean;
};

export type BoardFormData = {
  name: string;
  description?: string;
};

export type TaskStatus = "To Do" | "In Progress" | "Completed" | "Won't do";

// Google Calendar integration types
export type GoogleCalendarSettings = {
  enabled: boolean;
  defaultCalendarId?: string;
  syncCompletedTasks: boolean;
  syncWontDoTasks: boolean;
};

export type GoogleAuthToken = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
};
//src/store/use-board-store.ts
import { create } from 'zustand';
import { Board, TaskFormData, BoardFormData } from '@/types';

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
  hasGoogleCalendarAccess: boolean;


  // Board Actions
  setBoard: (board: Board) => void;
  fetchBoard: (boardId: string) => Promise<void>;
  updateBoard: (data: BoardFormData) => Promise<void>;
  createNewBoard: () => Promise<string>;

  // Task Actions
  addTask: (task: TaskFormData) => Promise<void>;
  updateTask: (id: string, task: TaskFormData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<void>;

    // Calendar Actions
    checkGoogleCalendarAccess: () => Promise<void>;
    toggleTaskCalendarSync: (taskId: string, sync: boolean) => Promise<void>;
}

const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  error: null,
  hasGoogleCalendarAccess: false,

  setBoard: (board) => set({ board }),


  fetchBoard: async (boardId) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/boards/${boardId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch board');
      }

      const board = await response.json();
      set({ board, loading: false });
      
      // Check if user has Google Calendar access
      get().checkGoogleCalendarAccess();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },

  updateBoard: async (data) => {
    try {
      const { board } = get();
      if (!board) return;

      set({ loading: true, error: null });

      const response = await fetch(`/api/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update board');
      }

      const updatedBoard = await response.json();
      set({ board: updatedBoard, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },

  createNewBoard: async () => {
    try {
      set({ loading: true, error: null });

      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Task Board',
          description: 'Manage your tasks here',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create board');
      }
  
      const newBoard = await response.json();
      set({ board: newBoard, loading: false });

      return newBoard.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
      return '';
    }
  },

  addTask: async (taskData) => {
    try {
      const { board } = get();
      if (!board) return;

      set({ loading: true, error: null });

      // Create new task through API
      const response = await fetch(`/api/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTask',
          task: taskData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const updatedBoard = await response.json();
      set({ board: updatedBoard, loading: false });
      
      // If calendar sync is enabled for this task, sync it with Google Calendar
      if (taskData.isCalendarSynced) {
        const newTaskId = updatedBoard.tasks[updatedBoard.tasks.length - 1].id;
        get().toggleTaskCalendarSync(newTaskId, true);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },

  updateTask: async (id, taskData) => {
    try {
      set({ loading: true, error: null });
      
      // Store the previous sync state
      const { board } = get();
      const previousTask = board?.tasks.find(task => task.id === id);
      const previouslySynced = previousTask?.isCalendarSynced || false;

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();

      // Update the task in the local state
      if (board) {
        const updatedTasks = board.tasks.map((task) => (task.id === id ? updatedTask : task));

        set({
          board: { ...board, tasks: updatedTasks },
          loading: false,
        });
      }
      
      // If calendar sync status changed, handle it
      if (previouslySynced !== taskData.isCalendarSynced) {
        get().toggleTaskCalendarSync(id, taskData.isCalendarSynced || false);
      }
      // If sync status didn't change but is synced and task details changed, update calendar event
      else if (taskData.isCalendarSynced) {
        get().toggleTaskCalendarSync(id, true);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },


  deleteTask: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // Get the task to check if it's synced with calendar
      const { board } = get();
      const task = board?.tasks.find(task => task.id === id);
      const isSynced = task?.isCalendarSynced || false;
      
      // If synced, remove from calendar first
      if (isSynced) {
        await get().toggleTaskCalendarSync(id, false);
      }

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove the task from the local state
      if (board) {
        const updatedTasks = board.tasks.filter((task) => task.id !== id);

        set({
          board: { ...board, tasks: updatedTasks },
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const { board } = get();
      if (!board) return;

      // Find the task in the current state
      const task = board.tasks.find((t) => t.id === id);
      if (!task) return;

      // Skip update if status hasn't changed
      if (task.status === status) return;

      set({ loading: true, error: null });

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();

      // Update the task in the local state
      const updatedTasks = board.tasks.map((t) => (t.id === id ? updatedTask : t));

      set({
        board: { ...board, tasks: updatedTasks },
        loading: false,
      });
      
      // If the task is synced with calendar, update the calendar event to reflect the new status
      if (task.isCalendarSynced) {
        get().toggleTaskCalendarSync(id, true);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },


  checkGoogleCalendarAccess: async () => {
    try {
      const response = await fetch('/api/calendar-settings');
      
      if (response.ok) {
        const data = await response.json();
        set({ 
          hasGoogleCalendarAccess: !!data.googleConnected 
        });
      } else if (response.status === 401) {
        // Don't show error for auth issues - just set to false
        set({ hasGoogleCalendarAccess: false });
      }
    } catch (error) {
      // Simply set to false without logging the error to avoid console noise
      console.log('Unable to check Google Calendar access - defaulting to false');
      set({ hasGoogleCalendarAccess: false });
    }
  },
  
  // Toggle task calendar sync
  toggleTaskCalendarSync: async (taskId, sync) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/calendar-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncWithCalendar: sync }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync task with calendar');
      }
      
      const { success, synced } = await response.json();
      
      if (success) {
        // Update the task in the local state
        const { board } = get();
        if (board) {
          const updatedTasks = board.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, isCalendarSynced: synced };
            }
            return task;
          });
          
          set({
            board: { ...board, tasks: updatedTasks },
          });
        }
      }
    } catch (error) {
      console.error('Error toggling task calendar sync:', error);
    }
  },
}));

export default useBoardStore;

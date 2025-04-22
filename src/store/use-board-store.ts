//src/store/use-board-store.ts
import { create } from 'zustand';
import { Board, Task,TaskFormData, BoardFormData } from '@/types';

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
    toggleTaskCalendarSync: (taskId: string, sync: boolean) => Promise<boolean>; // Changed from Promise<void> to Promise<boolean>
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

  // Enhanced addTask function for useBoardStore.ts
  addTask: async (taskData) => {
    try {
      const { board } = get();
      if (!board) return;

      set({ loading: true, error: null });

      // Store current task IDs before creating a new task
      const currentTaskIds = new Set(board.tasks.map(task => task.id));
      
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
      
      // If calendar sync is enabled, identify and sync the newly created task
      if (taskData.isCalendarSynced) {
        // Find new task IDs by comparing with previous task IDs
        const newTaskIds = updatedBoard.tasks
          .map((task: Task) => task.id)
          .filter((id: string) => !currentTaskIds.has(id));
        
        if (newTaskIds.length === 1) {
          // We found exactly one new task - perfect!
          await get().toggleTaskCalendarSync(newTaskIds[0], true);
        } else if (newTaskIds.length > 1) {
          // Multiple new tasks found - sync all that match our criteria
          const tasksToSync = updatedBoard.tasks.filter((task: Task) => 
            !currentTaskIds.has(task.id) && 
            task.name === taskData.name &&
            task.isCalendarSynced
          );
          
          for (const task of tasksToSync) {
            await get().toggleTaskCalendarSync(task.id, true);
          }
        } else {
          // No new tasks found by ID comparison - try to find by other criteria
          const potentialNewTasks = updatedBoard.tasks.filter((task: Task) => 
            task.name === taskData.name && 
            task.isCalendarSynced &&
            !task.calendarEventId // Not already synced
          );
          
          if (potentialNewTasks.length > 0) {
            // Sort by creation time (newest first) and sync the first one
            potentialNewTasks.sort((a: Task, b: Task) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            await get().toggleTaskCalendarSync(potentialNewTasks[0].id, true);
          }
        }
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
    } catch (_error) {
      // Simply set to false without logging the error to avoid console noise
      console.log('Unable to check Google Calendar access - defaulting to false');
      set({ hasGoogleCalendarAccess: false });
    }
  },
  
  // Enhanced toggleTaskCalendarSync function
toggleTaskCalendarSync: async (taskId, sync) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}/calendar-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncWithCalendar: sync }),
    });
    
    // Attempt to parse response regardless of status
    let data;
    try {
      data = await response.json();
    } catch (_e) {
      // If parsing fails, create a generic error object
      data = { error: 'Failed to parse response' };
    }
    
    if (!response.ok) {
      console.error(`Calendar sync failed for task ${taskId}:`, data.error || response.statusText);
      return false;
    }
    
    const { success, synced } = data;
    
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
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error toggling task calendar sync:', error);
    return false;
  }
},






}));

export default useBoardStore;

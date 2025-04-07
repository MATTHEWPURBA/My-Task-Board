//src/store/use-board-store.ts
import { create } from 'zustand';
import { Board, TaskFormData, BoardFormData } from '@/types';

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;

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
}

const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  error: null,

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
      const { board } = get();
      if (board) {
        const updatedTasks = board.tasks.map((task) => (task.id === id ? updatedTask : task));

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

  deleteTask: async (id) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove the task from the local state
      const { board } = get();
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

  // Add this new method
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
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
      });
    }
  },
}));

export default useBoardStore;

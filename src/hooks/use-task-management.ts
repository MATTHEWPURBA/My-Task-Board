// src/hooks/use-task-management.ts
import { useState, useCallback } from 'react';
import { Task, TaskStatus } from '@/types';
// import useBoardStore from '@/store/use-board-store';

interface UseTaskManagementReturn {
  selectedTask: Task | null;
  sidebarOpen: boolean;
  handleTaskSelect: (task: Task) => void;
  handleAddNewTask: (status?: TaskStatus) => void;
  handleCloseSidebar: () => void;
}

export function useTaskManagement(boardId: string, showNotification: (message: string, type: 'success' | 'info' | 'error') => void): UseTaskManagementReturn {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleTaskSelect = useCallback((task: Task) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  }, []);
  
  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedTask(null), 300); // Clear selected task after animation
  }, []);
  
  const handleAddNewTask = useCallback((status?: TaskStatus) => {
    // Create a template task with defaults
    setSelectedTask({
      id: 'new', // This is a temporary ID that will be replaced
      name: 'New Task',
      description: '',
      icon: '📝',
      status: status || 'To Do', // Use provided status or default to To Do
      createdAt: new Date(),
      updatedAt: new Date(),
      boardId
    });
    setSidebarOpen(true);
    
    // Show notification
    showNotification('Ready to create a new task', 'info');
  }, [boardId, showNotification]);
  
  return {
    selectedTask,
    sidebarOpen,
    handleTaskSelect,
    handleAddNewTask,
    handleCloseSidebar
  };
}
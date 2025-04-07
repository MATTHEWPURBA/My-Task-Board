// src/hooks/use-task-drag.ts
import { useState } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Task } from '@/types';
import useBoardStore from '@/store/use-board-store';

interface UseTaskDragProps {
  showNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  tasks: Task[];
}

interface UseTaskDragReturn {
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useTaskDrag({ showNotification, tasks }: UseTaskDragProps): UseTaskDragReturn {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateTaskStatus = useBoardStore(state => state.updateTaskStatus);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    
    // Find the task being dragged
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      // Dropped outside of any droppable
      setActiveTask(null);
      return;
    }
    
    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Update the task status if it was dropped in a different column
    if (newStatus && ['To Do', 'In Progress', 'Completed', "Won't do"].includes(newStatus)) {
      // Get the current task to check if status actually changed
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        updateTaskStatus(taskId, newStatus);
        
        // Show notification
        showNotification(`Task moved to ${newStatus}`, 'success');
      }
    }
    
    setActiveTask(null);
  };

  return {
    activeTask,
    handleDragStart,
    handleDragEnd
  };
}
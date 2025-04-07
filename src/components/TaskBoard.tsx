//src/components/TaskBoard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Board, Task, TaskStatus } from '@/types';
// import TaskComponent from './Task';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import DroppableColumn from './DroppableColumn';
import EmptyBoardNotification from './EmptyBoardNotification';
import { 
  DndContext, 
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// import { arrayMove } from '@dnd-kit/sortable';
import useBoardStore from '@/store/use-board-store';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskBoardProps {
  board: Board;
}

// Define statuses array with the proper type annotation
const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed', "Won't do"];

const TaskBoard: React.FC<TaskBoardProps> = ({ board }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [
    showEmptyNotification, 
    setShowEmptyNotification] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info' | 'error';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const updateTaskStatus = useBoardStore(state => state.updateTaskStatus);

  // Check if board is empty when it changes
  useEffect(() => {
    // Show empty notification if the board has no tasks
    const hasNoTasks = board.tasks.length === 0;
    setShowEmptyNotification(hasNoTasks);
  }, [board.tasks.length]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10px before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Group tasks by status
  // const toDoTasks = board.tasks.filter(task => task.status === 'To Do');
  // const inProgressTasks = board.tasks.filter(task => task.status === 'In Progress');
  // const completedTasks = board.tasks.filter(task => task.status === 'Completed');
  // const wontDoTasks = board.tasks.filter(task => task.status === "Won't do");
  
  const getTasksByStatus = (status: string) => 
  board.tasks.filter(task => task.status === status);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedTask(null), 300); // Clear selected task after animation
  };

  // Helper for creating the "add new task" button
  const handleAddNewTask = (status?: TaskStatus) => {
    // Create a template task with defaults
    setSelectedTask({
      id: 'new', // This is a temporary ID that will be replaced
      name: 'New Task',
      description: '',
      icon: '📝',
      status: status || 'To Do', // Use provided status or default to To Do
      createdAt: new Date(),
      updatedAt: new Date(),
      boardId: board.id
    });
    setSidebarOpen(true);
    
    // Show notification
    showNotification('Ready to create a new task', 'info');
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    
    // Find the task being dragged
    const task = board.tasks.find(t => t.id === taskId);
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
    const newStatus = over.id as TaskStatus; // Type assertion here is safe because we know the droppable IDs match our TaskStatus values
    
    // Update the task status if it was dropped in a different column
    if (newStatus && statuses.includes(newStatus)) {
      updateTaskStatus(taskId, newStatus);
      // Show notification
      showNotification(`Task moved to ${newStatus}`, 'success');
    }
    
    setActiveTask(null);
  };

  // Show notification for 3 seconds
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <BoardHeader board={board} />
      
      {showEmptyNotification ? (
        <EmptyBoardNotification 
          onAddTask={() => handleAddNewTask()} 
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statuses.map((status) => (
              <DroppableColumn
                key={status}
                id={status}
                title={status}
                tasks={getTasksByStatus(status)}
                onTaskSelect={handleTaskSelect}
                onCreateTask={(status) => handleAddNewTask(status as TaskStatus)}
              />
            ))}
          </div>
          
          {/* Drag Overlay - shows a preview of the task being dragged */}
          <DragOverlay>
            {activeTask ? (
              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-400 opacity-80 w-64">
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">
                    {activeTask.icon || '📝'}
                  </span>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{activeTask.name}</h3>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      
      {/* Add new task button */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 mt-8">
        <button
          onClick={() => handleAddNewTask()}
          className="flex items-center bg-orange-100 text-black py-4 px-5 rounded-2xl w-full justify-start text-xl font-semibold border border-gray-200 hover:bg-orange-200 transition-colors"
        >
          <span className="bg-orange-400 p-3 rounded-full mr-4 flex items-center justify-center text-white">
            +
          </span>
          Add New Task
        </button>
      </div>
      
      {/* Task Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        task={selectedTask}
      />
      
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg
              ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 
                notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 
                'bg-blue-100 text-blue-800 border border-blue-300'}`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === 'success' ? '✅' : 
                  notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <p>{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default TaskBoard;
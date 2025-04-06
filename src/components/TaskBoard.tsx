'use client';

import React, { useState } from 'react';
import { Board, Task } from '@/types';
import TaskComponent from './Task';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';


interface TaskBoardProps {
  board: Board;
}


const TaskBoard: React.FC<TaskBoardProps> = ({ board }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Group tasks by status
  const toDoTasks = board.tasks.filter(task => task.status === 'To Do');
  const inProgressTasks = board.tasks.filter(task => task.status === 'In Progress');
  const completedTasks = board.tasks.filter(task => task.status === 'Completed');
  const wontDoTasks = board.tasks.filter(task => task.status === "Won't do");
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  // Helper for creating the "add new task" button
  const handleAddNewTask = () => {
    // You can either create a template task with defaults
    // or you can navigate to a new task page
    // For now, let's open the sidebar with a new task template
    setSelectedTask({
      id: 'new', // This is a temporary ID that will be replaced
      name: 'New Task',
      description: '',
      icon: '📝',
      status: 'To Do', // Default to To Do for new tasks
      createdAt: new Date(),
      updatedAt: new Date(),
      boardId: board.id
    });
    setSidebarOpen(true);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <BoardHeader board={board} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* To Do Column */}
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-3">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <h2 className="font-bold">To Do</h2>
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
              {toDoTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {toDoTasks.map(task => (
              <TaskComponent 
                key={task.id} 
                task={task}
                onSelect={handleTaskSelect}
              />
            ))}
            {toDoTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No to-do tasks
              </div>
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center mb-3">
            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
            <h2 className="font-bold">In Progress</h2>
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskComponent 
                key={task.id} 
                task={task}
                onSelect={handleTaskSelect}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No tasks in progress
              </div>
            )}
          </div>
        </div>
        
        {/* Completed Column */}
        <div className="bg-green-100 p-4 rounded-lg border border-green-100">
          <div className="flex items-center mb-3">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            <h2 className="font-bold">Completed</h2>
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {completedTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskComponent 
                key={task.id} 
                task={task}
                onSelect={handleTaskSelect}
              />
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No completed tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Won't Do Column */}
        <div className="bg-red-100 p-4 rounded-lg border border-red-100">
          <div className="flex items-center mb-3">
            <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
            <h2 className="font-bold">Won't Do</h2>
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {wontDoTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {wontDoTasks.map(task => (
              <TaskComponent 
                key={task.id} 
                task={task}
                onSelect={handleTaskSelect}
              />
            ))}
            {wontDoTasks.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">
                No won't do tasks
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add new task button */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 mt-8">
        <button
          onClick={handleAddNewTask}
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
    </div>
  );
};

export default TaskBoard;
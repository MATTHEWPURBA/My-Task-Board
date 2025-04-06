//src/components/TaskBoard.tsx

'use client';

import React, { useState } from 'react';
import { Board, Task } from '@/types';
import TaskComponent from './Task';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import DroppableColumn from './DroppableColumn';
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
import { arrayMove } from '@dnd-kit/sortable';
import useBoardStore from '@/store/use-board-store';



interface TaskBoardProps {
  board: Board;
}

const statuses = ['To Do', 'In Progress', 'Completed', "Won't do"];



const TaskBoard: React.FC<TaskBoardProps> = ({ board }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const updateTaskStatus = useBoardStore(state => state.updateTaskStatus);

  

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
  const toDoTasks = board.tasks.filter(task => task.status === 'To Do');
  const inProgressTasks = board.tasks.filter(task => task.status === 'In Progress');
  const completedTasks = board.tasks.filter(task => task.status === 'Completed');
  const wontDoTasks = board.tasks.filter(task => task.status === "Won't do");
  
  const getTasksByStatus = (status: string) => 
  board.tasks.filter(task => task.status === status);


  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
    // Helper for creating a new task with specific status
    const handleAddNewTaskWithStatus = (status: 'To Do' | 'In Progress' | 'Completed' | "Won't do") => {
      // Create a template task with the specified status
      setSelectedTask({
        id: 'new', // This is a temporary ID that will be replaced
        name: `New ${status} Task`,
        description: '',
        icon: '📝',
        status: status,
        createdAt: new Date(),
        updatedAt: new Date(),
        boardId: board.id
      });
      setSidebarOpen(true);
    };
    
    // General helper for creating a new task (used by the bottom button)
    const handleAddNewTask = () => {
      setSelectedTask({
        id: 'new', 
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
      const newStatus = over.id as string;
      
      // Update the task status if it was dropped in a different column
      if (newStatus && statuses.includes(newStatus)) {
        updateTaskStatus(taskId, newStatus);
      }
      
      setActiveTask(null);
    };


  // // Function to render a droppable column
  // const renderColumn = (title: string, tasks: Task[]) => {
  //   let bgColor, borderColor, dotColor;
    
  //   switch (title) {
  //     case 'To Do':
  //       bgColor = 'bg-gray-100';
  //       borderColor = 'border-gray-200';
  //       dotColor = 'bg-gray-500';
  //       break;
  //     case 'In Progress':
  //       bgColor = 'bg-yellow-100';
  //       borderColor = 'border-yellow-100';
  //       dotColor = 'bg-yellow-400';
  //       break;
  //     case 'Completed':
  //       bgColor = 'bg-green-100';
  //       borderColor = 'border-green-100';
  //       dotColor = 'bg-green-400';
  //       break;
  //     case "Won't do":
  //       bgColor = 'bg-red-100';
  //       borderColor = 'border-red-100';
  //       dotColor = 'bg-red-400';
  //       break;
  //     default:
  //       bgColor = 'bg-gray-100';
  //       borderColor = 'border-gray-200';
  //       dotColor = 'bg-gray-500';
  //   }


  //   return (
  //     <div 
  //       id={title}
  //       className={`${bgColor} p-4 rounded-lg border ${borderColor} min-h-[12rem]`}
  //     >
  //       <div className="flex items-center mb-3">
  //         <span className={`w-3 h-3 ${dotColor} rounded-full mr-2`}></span>
  //         <h2 className="font-bold">{title}</h2>
  //         <span className={`ml-2 text-xs ${bgColor} px-2 py-1 rounded-full`}>
  //           {tasks.length}
  //         </span>
  //       </div>
        
  //       <div className="space-y-3 min-h-[8rem]">
  //         {tasks.map(task => (
  //           <TaskComponent 
  //             key={task.id} 
  //             task={task}
  //             onSelect={handleTaskSelect}
  //           />
  //         ))}
  //         {tasks.length === 0 && (
  //           <div className="text-center p-4 text-gray-500 text-sm h-20 flex items-center justify-center border-2 border-dashed rounded-lg">
  //             Drop tasks here
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  


  return (
    <div className="max-w-7xl mx-auto p-4">
      <BoardHeader board={board} />
      
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
              onAddNewTask={handleAddNewTaskWithStatus}
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
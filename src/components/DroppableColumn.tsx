'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task } from '@/types';
import TaskComponent from './Task';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { popIn, pulse } from '@/lib/animation';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useMergedRefs } from '@/hooks/use-merged-refs';





interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onAddNewTask: (status: 'To Do' | 'In Progress' | 'Completed' | "Won't do") => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  onTaskSelect,
  onAddNewTask
}) => {


 // Setup refs and state
  const columnRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Setup the droppable area
  const { setNodeRef, isOver } = useDroppable({
    id
  });
  
  // Create a merged ref for the column element
  const mergedRef = useMergedRefs<HTMLDivElement>(columnRef, setNodeRef);

  

 // Detect if we're on mobile
 useEffect(() => {
   const checkMobile = () => {
     setIsMobile(window.innerWidth < 768);
   };
   
   checkMobile();
   window.addEventListener('resize', checkMobile);
   
   return () => {
     window.removeEventListener('resize', checkMobile);
   };
 }, []);
 

   // Close popup when clicking outside (mobile)
   useClickOutside(popupRef, () => {
    setIsTouched(false);
  }, isTouched);


// Auto-dismiss the touch popup after a delay
useEffect(() => {
  if (isTouched) {
    const timer = setTimeout(() => {
      setIsTouched(false);
    }, 5000); // Dismiss after 5 seconds
    
    return () => clearTimeout(timer);
  }
}, [isTouched]);
  
  // Set column styles based on type
  let bgColor, borderColor, dotColor, hoverClass, buttonBgColor;

  
  switch (id) {
    case 'To Do':
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-200';
      dotColor = 'bg-gray-500';
      hoverClass = isOver ? 'bg-gray-200' : '';
      buttonBgColor = 'bg-gray-500 hover:bg-gray-600';
      break;
    case 'In Progress':
      bgColor = 'bg-yellow-100';
      borderColor = 'border-yellow-200';
      dotColor = 'bg-yellow-400';
      hoverClass = isOver ? 'bg-yellow-200' : '';
      buttonBgColor = 'bg-yellow-400 hover:bg-yellow-500';
      break;
    case 'Completed':
      bgColor = 'bg-green-100';
      borderColor = 'border-green-200';
      dotColor = 'bg-green-400';
      hoverClass = isOver ? 'bg-green-200' : '';
      buttonBgColor = 'bg-green-500 hover:bg-green-600';
      break;
    case "Won't do":
      bgColor = 'bg-red-100';
      borderColor = 'border-red-200';
      dotColor = 'bg-red-400';
      hoverClass = isOver ? 'bg-red-200' : '';
      buttonBgColor = 'bg-red-500 hover:bg-red-600';
      break;
    default:
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-200';
      dotColor = 'bg-gray-500';
      hoverClass = isOver ? 'bg-gray-200' : '';
      buttonBgColor = 'bg-gray-500 hover:bg-gray-600';
  }


 // Handle adding a new task with this column's status
 const handleAddTask = (e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent column click
  onAddNewTask(id as 'To Do' | 'In Progress' | 'Completed' | "Won't do");
  setIsTouched(false);
  setIsHovering(false);
};
    

 // Handle touch/click on column (for mobile)
 const handleColumnTouch = () => {
  if (isMobile && !isTouched) {
    setIsTouched(true);
  }
};



// Show notification popup?
const showNotification = (isHovering && !isMobile) || (isTouched && isMobile);


return (
  <div 
    ref={mergedRef}
    className={`${bgColor} ${hoverClass} p-4 rounded-lg border ${borderColor} min-h-[12rem] transition-colors duration-200 relative`}
    onMouseEnter={() => !isMobile && setIsHovering(true)}
    onMouseLeave={() => !isMobile && setIsHovering(false)}
    onClick={handleColumnTouch}
    role="region"
    aria-label={`${title} column`}
  >
    <div className="flex items-center mb-3">
      <span className={`w-3 h-3 ${dotColor} rounded-full mr-2`}></span>
      <h2 className="font-bold">{title}</h2>
      <span className="ml-2 text-xs bg-white/50 px-2 py-1 rounded-full">
        {tasks.length}
      </span>
    </div>
    
    <div className={`space-y-3 min-h-[8rem] ${isOver ? 'bg-white/30 rounded-lg p-2' : ''}`}>
      {tasks.map(task => (
        <TaskComponent 
          key={task.id} 
          task={task}
          onSelect={onTaskSelect}
        />
      ))}
      {tasks.length === 0 && (
        <div 
          className={`text-center p-4 text-gray-500 text-sm h-20 flex items-center justify-center border-2 border-dashed rounded-lg ${isOver ? 'bg-white/50 border-blue-300' : ''}`}
        >
          {isOver ? 'Drop here' : 'No tasks'}
        </div>
      )}
    </div>

    {/* Notification popup for adding a new task */}
    <AnimatePresence>
      {showNotification && (
        <motion.div 
          ref={popupRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          {...popIn}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white shadow-lg rounded-lg p-4 w-64 md:w-72 border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-2">Add a task to {title}?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create a new task with {title.toLowerCase()} status
            </p>
            <button
              onClick={handleAddTask}
              className={`w-full ${buttonBgColor} text-white py-2 px-4 rounded-md flex items-center justify-center transition-all duration-200 transform hover:scale-105`}
            >
              <span className="mr-2">+</span> Add task to {title}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Mobile indicator - subtle hint that column is tappable */}
    {isMobile && !isTouched && (
      <motion.div 
        className="absolute top-2 right-2"
        animate={pulse.animate}
      >
        <span className="flex h-2 w-2 relative">
          <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
        </span>
      </motion.div>
    )}
    
    {/* Background overlay when popup is shown */}
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/5 rounded-lg z-10"
        />
      )}
    </AnimatePresence>
  </div>
);
};


export default DroppableColumn;
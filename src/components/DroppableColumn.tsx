'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task } from '@/types';
import TaskComponent from './Task';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
// import { popIn, pulse } from '@/lib/animation';
import { useClickOutside } from '@/hooks/use-click-outside';
// import { useMergedRefs } from '@/hooks/use-merged-refs';





interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onCreateTask?: (status: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  onTaskSelect,
  onCreateTask
}) => {


 // Setup refs and state
  // const columnRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  // const [isMobile, setIsMobile] = useState(false);
  const [showAddHint, setShowAddHint] = useState(false);


  // Setup the droppable area
  const { setNodeRef, isOver } = useDroppable({
    id
  });
  






  // Create a merged ref for the column element
  // const mergedRef = useMergedRefs<HTMLDivElement>(columnRef, setNodeRef);

 // Detect if we're on mobile
//  useEffect(() => {
//    const checkMobile = () => {
//      setIsMobile(window.innerWidth < 768);
//    };
   
//    checkMobile();
//    window.addEventListener('resize', checkMobile);
   
//    return () => {
//      window.removeEventListener('resize', checkMobile);
//    };
//  }, []);
 

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
  let bgColor, 
  borderColor, 
  dotColor, 
  hoverClass
  // buttonBgColor
  ;

  
  switch (id) {
    case 'To Do':
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-200';
      dotColor = 'bg-gray-500';
      hoverClass = isOver ? 'bg-gray-200' : '';
      // buttonBgColor = 'bg-gray-500 hover:bg-gray-600';
      break;
    case 'In Progress':
      bgColor = 'bg-yellow-100';
      borderColor = 'border-yellow-200';
      dotColor = 'bg-yellow-400';
      hoverClass = isOver ? 'bg-yellow-200' : '';
      // buttonBgColor = 'bg-yellow-400 hover:bg-yellow-500';
      break;
    case 'Completed':
      bgColor = 'bg-green-100';
      borderColor = 'border-green-200';
      dotColor = 'bg-green-400';
      hoverClass = isOver ? 'bg-green-200' : '';
      // buttonBgColor = 'bg-green-500 hover:bg-green-600';
      break;
    case "Won't do":
      bgColor = 'bg-red-100';
      borderColor = 'border-red-200';
      dotColor = 'bg-red-400';
      hoverClass = isOver ? 'bg-red-200' : '';
      // buttonBgColor = 'bg-red-500 hover:bg-red-600';
      break;
    default:
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-200';
      dotColor = 'bg-gray-500';
      hoverClass = isOver ? 'bg-gray-200' : '';
      // buttonBgColor = 'bg-gray-500 hover:bg-gray-600';
  }


//  // Handle adding a new task with this column's status
//  const handleAddTask = (e: React.MouseEvent) => {
//   e.stopPropagation(); // Prevent column click
//   onAddNewTask(id as 'To Do' | 'In Progress' | 'Completed' | "Won't do");
//   setIsTouched(false);
//   setIsHovering(false);
// };
    

 // Handle touch/click on column (for mobile)
//  const handleColumnTouch = () => {
//   if (isMobile && !isTouched) {
//     setIsTouched(true);
//   }
// };


const handleCreateTask = () => {
  if (onCreateTask) {
    onCreateTask(id);
  }
};

  // Get status-specific emojis for empty state
  // const getEmptyStateEmoji = () => {
  //   switch (id) {
  //     case 'To Do': return '📋';
  //     case 'In Progress': return '⏳';
  //     case 'Completed': return '✅';
  //     case "Won't do": return '❌';
  //     default: return '📋';
  //   }
  // };


// Show notification popup?
// const showNotification = (isHovering && !isMobile) || (isTouched && isMobile);


return (
  <div 
    ref={setNodeRef}
    className={`${bgColor} ${hoverClass} p-4 rounded-lg border ${borderColor} min-h-[12rem] transition-colors duration-200`}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
  >
    <div className="flex items-center mb-3">
      <span className={`w-3 h-3 ${dotColor} rounded-full mr-2`}></span>
      <h2 className="font-bold">{title}</h2>
      <span className="ml-2 text-xs bg-white/50 px-2 py-1 rounded-full">
        {tasks.length}
      </span>
    </div>
    
    <div 
      className={`space-y-3 min-h-[8rem] ${isOver ? 'bg-white/30 rounded-lg p-2' : ''} relative`}
    >
      {tasks.map(task => (
        <TaskComponent 
          key={task.id} 
          task={task}
          onSelect={onTaskSelect}
        />
      ))}
      
      {/* Empty state with animation */}
      {tasks.length === 0 && (
        <motion.div 
          className={`text-center p-4 text-gray-500 text-sm h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer
            ${isOver ? 'bg-white/50 border-blue-300' : ''}
            ${isHovering ? 'border-blue-300 bg-blue-50/30' : ''}`}
          onClick={handleCreateTask}
          onHoverStart={() => setShowAddHint(true)}
          onHoverEnd={() => setShowAddHint(false)}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <AnimatePresence>
            {showAddHint || isHovering ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl mb-2">+</span>
                <p className="font-medium text-blue-600">Add a task</p>
                <p className="text-xs mt-1">Click to create a new task</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isOver ? 'Drop here' : 'No tasks'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Extra space for adding new tasks even when there are existing tasks */}
      {tasks.length > 0 && (
        <motion.div 
          className={`mt-4 h-16 border-2 border-dashed rounded-lg cursor-pointer flex items-center justify-center
            ${isHovering ? 'border-blue-300 bg-blue-50/30' : 'border-transparent bg-transparent'}
          `}
          onClick={handleCreateTask}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <AnimatePresence>
            {isHovering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center text-blue-600"
              >
                <span className="text-lg mr-1">+</span>
                <span className="text-sm">Add task</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  </div>
);
};

export default DroppableColumn;
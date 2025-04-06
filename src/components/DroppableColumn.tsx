'use client';

import React from 'react';
import { Task } from '@/types';
import TaskComponent from './Task';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  onTaskSelect 
}) => {
  // Setup the droppable area
  const { setNodeRef, isOver } = useDroppable({
    id
  });
  
  // Set column styles based on type
  let bgColor, borderColor, dotColor, hoverClass;
  
  switch (id) {
    case 'To Do':
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-200';
      dotColor = 'bg-gray-500';
      hoverClass = isOver ? 'bg-gray-200' : '';
      break;
    case 'In Progress':
      bgColor = 'bg-yellow-100';
      borderColor = 'border-yellow-200';
      dotColor = 'bg-yellow-400';
      hoverClass = isOver ? 'bg-yellow-200' : '';
      break;
    case 'Completed':
      bgColor = 'bg-green-100';
      borderColor = 'border-green-200';
      dotColor = 'bg-green-400';
      hoverClass = isOver ? 'bg-green-200' : '';
      break;
    case "Won't do":
      bgColor = 'bg-red-100';
      borderColor = 'border-red-200';
      dotColor = 'bg-red-400';
      hoverClass = isOver ? 'bg-red-200' : '';
      break;
    default:
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-200';
      dotColor = 'bg-gray-500';
      hoverClass = isOver ? 'bg-gray-200' : '';
  }
  
  return (
    <div 
      ref={setNodeRef}
      className={`${bgColor} ${hoverClass} p-4 rounded-lg border ${borderColor} min-h-[12rem] transition-colors duration-200`}
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
          <div className={`text-center p-4 text-gray-500 text-sm h-20 flex items-center justify-center border-2 border-dashed rounded-lg ${isOver ? 'bg-white/50 border-blue-300' : ''}`}>
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableColumn;
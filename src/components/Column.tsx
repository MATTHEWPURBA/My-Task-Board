//src/components/Column.tsx
import React from 'react';
import { Task as TaskType } from '@/types';
import Task from './Task';
import ColumnHeader from './ColumnHeader';

interface ColumnProps {
  title: string;
  tasks: TaskType[];
  onTaskSelect?: (task: TaskType) => void; // Optional prop to handle task selection at Column level

}

const Column: React.FC<ColumnProps> = ({ title, tasks,onTaskSelect }) => {
  // Filter tasks by status matching this column
  const columnTasks = tasks.filter(task => task.status === title);

    // Handle task selection
    const handleTaskSelect = (task: TaskType) => {
      if (onTaskSelect) {
        onTaskSelect(task);
      }
      // If no handler is provided, we do nothing when a task is selected
    };
  
    return (
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 min-h-[300px] w-full">
        <ColumnHeader title={title} count={columnTasks.length} />
        
        <div className="mt-4 space-y-3">
          {columnTasks.length > 0 ? (
            columnTasks.map(task => (
              <Task 
                key={task.id} 
                task={task} 
                onSelect={handleTaskSelect} // Pass the handler to each Task
              />
            ))
          ) : (
            <div className="py-8 flex items-center justify-center text-gray-400 text-sm">
              No tasks in this column
            </div>
          )}
        </div>
      </div>
    );
  };


  
export default Column;
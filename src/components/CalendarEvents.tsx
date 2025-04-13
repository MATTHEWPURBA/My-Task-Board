// src/components/CalendarEvents.tsx
'use client';

import React, { useEffect, useState } from 'react';
import useBoardStore from '@/store/use-board-store';
import { formatDate } from '@/lib/utils';
import { Task } from '@/types';

const CalendarEvents = () => {
  const { board } = useBoardStore();
  // Fix: Properly type the state as Task[]
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (board?.tasks) {
      // Get tasks with due dates
      const tasksWithDueDate = board.tasks
        .filter(task => task.dueDate)
        // Fix: Handle the date comparison safely
        .sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return dateA - dateB;
        })
        .slice(0, 5); // Get just the next 5 upcoming tasks
      
      setUpcomingTasks(tasksWithDueDate);
    }
  }, [board]);

  if (!upcomingTasks.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No upcoming tasks with due dates
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Upcoming Tasks</h3>
      <div className="space-y-2">
        {upcomingTasks.map(task => (
          <div key={task.id} className="flex items-center p-2 bg-white rounded-md shadow-sm">
            <span className="mr-2">{task.icon || '📝'}</span>
            <div className="flex-grow">
              <h4 className="font-medium">{task.name}</h4>
              {/* Fix: Safely handle the date formatting */}
              <p className="text-sm text-gray-500">
                {task.dueDate ? formatDate(new Date(task.dueDate)) : 'No due date'}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              task.status === 'Completed' ? 'bg-green-500' : 
              task.status === 'In Progress' ? 'bg-yellow-500' : 
              task.status === "Won't do" ? 'bg-red-500' : 'bg-gray-500'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarEvents;
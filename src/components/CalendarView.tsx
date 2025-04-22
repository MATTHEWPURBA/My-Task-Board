// src/components/CalendarView.tsx
'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

// Add this interface to type the tasksByDate object
interface TasksByDate {
    [date: string]: Task[];
  }

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Group tasks by date - Fixed with proper typing
  const tasksByDate: TasksByDate = tasks.reduce((acc: TasksByDate, task: Task) => {
    if (task.dueDate) {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {});

  
  const prevMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date);
  };
  
  const nextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          &larr; Prev
        </button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={nextMonth}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          Next &rarr;
        </button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentDay = isToday(day);
          
          return (
            <div 
              key={dateKey}
              className={`min-h-24 p-2 border rounded-md ${
                isCurrentDay ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-right">
                <span className={`inline-block rounded-full w-6 h-6 text-center ${
                  isCurrentDay ? 'bg-blue-500 text-white' : ''
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => onTaskSelect(task)}
                      className={`p-1 text-xs truncate rounded cursor-pointer ${
                        task.status === 'Completed' ? 'bg-green-100' :
                        task.status === 'In Progress' ? 'bg-yellow-100' :
                        task.status === "Won't do" ? 'bg-red-100' : 'bg-gray-100'
                      }`}
                    >
                      {task.icon} {task.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
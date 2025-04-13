//src/components/Sidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '@/types';
import useBoardStore from '@/store/use-board-store';
import DatePicker from 'react-datepicker'; // You need to install this package
import 'react-datepicker/dist/react-datepicker.css';
import IconPicker from '@/components/IconPicker'; // Import the IconPicker component
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, task }) => {
  const updateTask = useBoardStore((state) => state.updateTask);
  const addTask = useBoardStore((state) => state.addTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const loading = useBoardStore((state) => state.loading);
  const hasGoogleCalendarAccess = useBoardStore((state) => state.hasGoogleCalendarAccess);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    icon: string;
    status: 'To Do' | 'In Progress' | 'Completed' | "Won't do";
    dueDate: Date | null;
    reminderTime: Date | null;
    isCalendarSynced: boolean;
  }>({
    name: '',
    description: '',
    icon: '📝',
    status: 'To Do', // Default new tasks to "To Do"
    dueDate: null,
    reminderTime: null,
    isCalendarSynced: false,
  });

  const [showReminder, setShowReminder] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        icon: task.icon || '📝',
        status: task.status,
        dueDate: task.dueDate || null,
        reminderTime: task.reminderTime || null,
        isCalendarSynced: task.isCalendarSynced || false,
      });
      setShowReminder(!!task.reminderTime);
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Update the handleStatusChange type
  const handleStatusChange = (status: 'To Do' | 'In Progress' | 'Completed' | "Won't do") => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleDueDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, dueDate: date }));
  };

  const handleReminderTimeChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, reminderTime: date }));
  };

  const handleCalendarSyncChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isCalendarSynced: e.target.checked }));
  };

  const handleToggleReminder = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowReminder(e.target.checked);
    if (!e.target.checked) {
      setFormData((prev) => ({ ...prev, reminderTime: null }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    // If calendar sync is enabled, due date is required
    if (formData.isCalendarSynced && !formData.dueDate) {
      newErrors.dueDate = 'Due date is required for calendar sync';
    }

    // If reminder is shown but no time is set, show error
    if (showReminder && !formData.reminderTime) {
      newErrors.reminderTime = 'Reminder time is required';
    }

    // If reminder time is after due date, show error
    if (formData.dueDate && formData.reminderTime && formData.reminderTime > formData.dueDate) {
      newErrors.reminderTime = 'Reminder time must be before due date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!task) return;

    if (!validate()) {
      return;
    }

    // If reminder is disabled, clear the reminder time
    if (!showReminder) {
      formData.reminderTime = null;
    }

    // Check if this is a new task or an existing one
    if (task.id === 'new') {
      // This is a new task, use addTask instead of updateTask
      await addTask(formData);
    } else {
      // This is an existing task
      await updateTask(task.id, formData);
    }

    onClose();
  };

  const handleDelete = async () => {
    if (task?.id && task.id !== 'new') {
      await deleteTask(task.id);
      onClose();
    } else {
      // Just close the sidebar for new tasks since they don't exist in DB
      onClose();
    }
  };

  // Trap focus within sidebar when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Common emoji sets for task icons
  // const emojis = ['📝', '✅', '🔄', '❌', '⭐', '🔍', '📅', '📌', '⏰', '📚'];

  if (!task) return null;

  // Variants for animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40 sidebar-overlay" onClick={onClose} initial="hidden" animate="visible" exit="hidden" variants={overlayVariants} transition={{ duration: 0.2 }} />

          {/* Sidebar */}
          <motion.div id="sidebar" className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 overflow-y-auto" initial="hidden" animate="visible" exit="hidden" variants={sidebarVariants} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <div className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Task details</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full p-1 hover:bg-gray-100" aria-label="Close sidebar">
                  ✕
                </button>
              </div>

              {/* Task Form */}
              <div className="flex-grow overflow-y-auto">
                {/* Task name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter task name" />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter a short description" />
                </div>

                {/* Icon selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <div className="flex items-center">
                    <IconPicker selectedIcon={formData.icon} onChange={handleIconSelect} />
                    <p className="ml-3 text-sm text-gray-500">Click to select a different icon</p>
                  </div>
                </div>

                {/* Due Date Picker */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date & Time</label>
                  <DatePicker selected={formData.dueDate} onChange={handleDueDateChange} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholderText="Select due date and time" />
                  {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                </div>

                {/* Reminder Toggle and Time Picker */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center">
                    <input id="showReminder" type="checkbox" checked={showReminder} onChange={handleToggleReminder} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="showReminder" className="ml-2 block text-sm text-gray-700">
                      Set reminder
                    </label>
                  </div>

                  {showReminder && (
                    <div>
                      <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Time
                      </label>
                      <DatePicker selected={formData.reminderTime} onChange={handleReminderTimeChange} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholderText="Select reminder time" />
                      {errors.reminderTime && <p className="mt-1 text-sm text-red-600">{errors.reminderTime}</p>}
                    </div>
                  )}
                </div>

                {/* Status selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="space-y-2">
                    <button type="button" onClick={() => handleStatusChange('To Do')} className={`w-full flex items-center p-3 rounded-md ${formData.status === 'To Do' ? 'bg-gray-100 border-2 border-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
                      <span>To Do</span>
                    </button>

                    <button type="button" onClick={() => handleStatusChange('In Progress')} className={`w-full flex items-center p-3 rounded-md ${formData.status === 'In Progress' ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <span className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></span>
                      <span>In Progress</span>
                    </button>

                    <button type="button" onClick={() => handleStatusChange('Completed')} className={`w-full flex items-center p-3 rounded-md ${formData.status === 'Completed' ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <span className="w-4 h-4 rounded-full bg-green-400 mr-2"></span>
                      <span>Completed</span>
                    </button>

                    <button type="button" onClick={() => handleStatusChange("Won't do")} className={`w-full flex items-center p-3 rounded-md ${formData.status === "Won't do" ? 'bg-red-100 border-2 border-red-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <span className="w-4 h-4 rounded-full bg-red-400 mr-2"></span>
                      <span>Won&apos;t do</span>
                    </button>
                  </div>
                </div>

                {/* Google Calendar Integration - only if due date is set */}
                {formData.dueDate && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-md">
                    <h3 className="text-md font-medium text-blue-700 mb-2">Google Calendar Integration</h3>

                    {hasGoogleCalendarAccess ? (
                      <div className="flex items-center">
                        <input id="isCalendarSynced" type="checkbox" checked={formData.isCalendarSynced} onChange={handleCalendarSyncChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="isCalendarSynced" className="ml-2 block text-sm text-gray-700">
                          Sync with Google Calendar
                        </label>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-blue-700 mb-2">Connect your Google Calendar to sync tasks with your calendar.</p>
                        <a href="/api/auth/calendar-bridge" className="inline-block px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                          Connect Google Calendar
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center transition-colors">
                  🗑️ Delete
                </button>

                <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md flex items-center transition-colors">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    '✓ Save'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;

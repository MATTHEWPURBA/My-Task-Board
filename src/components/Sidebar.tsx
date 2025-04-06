//src/components/Sidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '@/types';
import useBoardStore from '@/store/use-board-store';
import IconPicker from '@/components/IconPicker'; // Import the IconPicker component


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

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    icon: string;
    status: 'To Do' | 'In Progress' | 'Completed' | "Won't do";
  }>({
    name: '',
    description: '',
    icon: '📝',
    status: 'To Do', // Default new tasks to "To Do"
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        icon: task.icon || '📝',
        status: task.status,
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update the handleStatusChange type
  const handleStatusChange = (status: 'To Do' | 'In Progress' | 'Completed' | "Won't do") => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleSave = async () => {
    if (!task) return;

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

  // Common emoji sets for task icons
  const emojis = ['📝', '✅', '🔄', '❌', '⭐', '🔍', '📅', '📌', '⏰', '📚'];

  if (!task) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 sidebar-overlay" onClick={onClose} />}

      {/* Sidebar */}
      <div id="sidebar" className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 overflow-y-auto ${isOpen ? 'open' : ''}`}>
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Task details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Task Form */}
          <div className="flex-grow">
            {/* Task name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter a short description" />
            </div>

            {/* Icon selection - Replaced with IconPicker component */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <div className="flex items-center">
                {/* <div className="mr-2 text-lg">{formData.icon}</div> */}
                <IconPicker 
                  selectedIcon={formData.icon} 
                  onChange={handleIconSelect} 
                />
                <p className="ml-3 text-sm text-gray-500">Click to select a different icon</p>
              </div>
            </div>

            {/* Status selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="space-y-2">
                <button type="button" onClick={() => handleStatusChange('To Do')} className={`w-full flex items-center p-3 rounded-md ${formData.status === 'To Do' ? 'bg-gray-100 border-2 border-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
                  <span>To Do</span>
                </button>

                <button type="button" onClick={() => handleStatusChange('In Progress')} className={`w-full flex items-center p-3 rounded-md ${formData.status === 'In Progress' ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></span>
                  <span>In Progress</span>
                </button>

                <button type="button" onClick={() => handleStatusChange('Completed')} className={`w-full flex items-center p-3 rounded-md ${formData.status === 'Completed' ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span className="w-4 h-4 rounded-full bg-green-400 mr-2"></span>
                  <span>Completed</span>
                </button>

                <button type="button" onClick={() => handleStatusChange("Won't do")} className={`w-full flex items-center p-3 rounded-md ${formData.status === "Won't do" ? 'bg-red-100 border-2 border-red-400' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <span className="w-4 h-4 rounded-full bg-red-400 mr-2"></span>
                  <span>Won't do</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center">
              🗑️ Delete
            </button>

            <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md flex items-center">
              {loading ? 'Saving...' : '✓ Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

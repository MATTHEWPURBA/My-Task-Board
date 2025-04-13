//src/components/TaskForm.tsx
import React, { useState } from 'react';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import { TaskFormData } from '@/types';
import IconPicker from './IconPicker';
import DatePicker from 'react-datepicker'; // You need to install this package
import 'react-datepicker/dist/react-datepicker.css';


interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
  hasGoogleCalendarAccess?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {
    name: '',
    description: '',
    icon: '📝',
    status: 'In Progress',
    dueDate: null,
    reminderTime: null,
    isCalendarSynced: false,

  },
  onSubmit,
  isLoading = false,
  hasGoogleCalendarAccess = false,
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReminder, setShowReminder] = useState(!!initialData.reminderTime);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleIconChange = (icon: string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // If reminder is disabled, clear the reminder time
      if (!showReminder) {
        formData.reminderTime = null;
      }
      
      onSubmit(formData);
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="mt-7">
          <IconPicker selectedIcon={formData.icon || '📝'} onChange={handleIconChange} />
        </div>
        <div className="flex-1">
          <Input label="Task Name" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Enter task name" error={errors.name} fullWidth required />
        </div>
      </div>

      <TextArea label="Description" name="description" id="description" value={formData.description} onChange={handleChange} placeholder="Enter task description (optional)" rows={3} fullWidth />

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Won't do">Won&apos;t do</option>
        </select>
      </div>
      
      {/* Due Date Picker */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date & Time
        </label>
        <DatePicker
          id="dueDate"
          selected={formData.dueDate}
          onChange={handleDueDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholderText="Select due date and time"
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
      </div>
      
      {/* Reminder Toggle and Time Picker */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            id="showReminder"
            type="checkbox"
            checked={showReminder}
            onChange={(e) => setShowReminder(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showReminder" className="ml-2 block text-sm text-gray-700">
            Set reminder
          </label>
        </div>
        
        {showReminder && (
          <div>
            <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Time
            </label>
            <DatePicker
              id="reminderTime"
              selected={formData.reminderTime}
              onChange={handleReminderTimeChange}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select reminder time"
            />
            {errors.reminderTime && <p className="mt-1 text-sm text-red-600">{errors.reminderTime}</p>}
          </div>
        )}
      </div>
      
      {/* Google Calendar Sync Toggle - only show if user has Google Calendar access */}
      {hasGoogleCalendarAccess && formData.dueDate && (
        <div className="flex items-center">
          <input
            id="isCalendarSynced"
            type="checkbox"
            checked={formData.isCalendarSynced}
            onChange={handleCalendarSyncChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isCalendarSynced" className="ml-2 block text-sm text-gray-700">
            Sync with Google Calendar
          </label>
        </div>
      )}
      
      {/* Connect Google Calendar message - only show if user doesn't have Google Calendar access */}
      {!hasGoogleCalendarAccess && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
          <p className="text-sm">
            <a href="/api/auth/google" className="font-medium text-blue-700 underline">
              Connect Google Calendar
            </a> to sync your tasks with your calendar.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" isLoading={isLoading} fullWidth>
          Save Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
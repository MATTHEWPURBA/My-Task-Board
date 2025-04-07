import React, { useState } from 'react';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import { TaskFormData } from '@/types';
import IconPicker from './IconPicker';

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {
    name: '',
    description: '',
    icon: '📝',
    status: 'In Progress',
  },
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
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
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Won't do">Won&apos;t do</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" isLoading={isLoading} fullWidth>
          Save Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
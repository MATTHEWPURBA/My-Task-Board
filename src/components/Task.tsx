import React, { useState } from 'react';
import { Task as TaskType } from '@/types';
import { truncateText } from '@/lib/utils';
import Modal from './ui/Modal';
import TaskForm from './TaskForm';
import DeleteTaskButton from './DeleteTaskButton';
import useBoardStore from '@/store/use-board-store';

interface TaskProps {
  task: TaskType;
}

const Task: React.FC<TaskProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateTask = useBoardStore(state => state.updateTask);
  const loading = useBoardStore(state => state.loading);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCloseModal = () => {
    setIsEditing(false);
  };
  
  const handleSubmit = async (formData: any) => {
    await updateTask(task.id, formData);
    setIsEditing(false);
  };
  
  // Get color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case "Won't do":
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <div
        className="bg-white p-4 rounded-lg shadow mb-3 border border-gray-200 cursor-pointer hover:shadow-md transition duration-200"
        onClick={handleEditClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Task icon">
              {task.icon || '📝'}
            </span>
            <h3 className="font-medium text-gray-900">{task.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>
        
        {task.description && (
          <p className="mt-2 text-gray-600 text-sm">
            {truncateText(task.description, 100)}
          </p>
        )}
        
        <div className="mt-3 flex justify-between items-center">
          <DeleteTaskButton taskId={task.id} />
        </div>
      </div>
      
      <Modal
        isOpen={isEditing}
        onClose={handleCloseModal}
        title="Edit Task"
      >
        <TaskForm
          initialData={{
            name: task.name,
            description: task.description || '',
            icon: task.icon || '📝',
            status: task.status as any
          }}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </Modal>
    </>
  );
};

export default Task;
// This component is responsible for rendering a button that allows users to delete a task.
// src/components/DeleteTaskButton.tsx
import React, { useState } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import useBoardStore from '@/store/use-board-store';

interface DeleteTaskButtonProps {
  taskId: string;
}

const DeleteTaskButton: React.FC<DeleteTaskButtonProps> = ({ taskId }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteTask = useBoardStore(state => state.deleteTask);
  const loading = useBoardStore(state => state.loading);
  
  const handleOpenConfirm = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task click handling
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };
  
  const handleDelete = async () => {
    await deleteTask(taskId);
    setIsConfirmOpen(false);
  };
  
  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={handleOpenConfirm}
      >
        Delete
      </Button>
      
      <Modal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={handleCloseConfirm}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeleteTaskButton;
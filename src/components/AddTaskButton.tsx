import React, { useState } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import TaskForm from './TaskForm';
import useBoardStore from '@/store/use-board-store';
import { getRandomEmoji } from '@/lib/utils';
import { TaskFormData } from '@/types';

const AddTaskButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addTask = useBoardStore(state => state.addTask);
  const loading = useBoardStore(state => state.loading);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleAddTask = async (formData: TaskFormData) => {
    await addTask(formData);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <Button
        onClick={openModal}
        className="w-full md:w-auto"
      >
        Add New Task
      </Button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add New Task"
      >
        <TaskForm
          initialData={{
            name: 'New Task',
            description: '',
            icon: getRandomEmoji(),
            status: 'In Progress'
          }}
          onSubmit={handleAddTask}
          isLoading={loading}
        />
      </Modal>
    </>
  );
};

export default AddTaskButton;
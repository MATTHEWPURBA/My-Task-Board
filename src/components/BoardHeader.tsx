//src/components/BornHeader.tsx
import React, { useState } from 'react';
import { Board } from '@/types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import useBoardStore from '@/store/use-board-store';
// import AddTaskButton from './AddTaskButton';

interface BoardHeaderProps {
  board: Board;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ board }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: board.name,
    description: board.description || ''
  });
  
  const updateBoard = useBoardStore(state => state.updateBoard);
  const loading = useBoardStore(state => state.loading);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOpenEdit = () => {
    setIsEditing(true);
  };
  
  const handleCloseEdit = () => {
    setIsEditing(false);
    // Reset form data to current board values
    setFormData({
      name: board.name,
      description: board.description || ''
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBoard(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white px-4 py-5 md:px-6 rounded-lg shadow-md border border-gray-50 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-normal text-gray-900 flex items-center">
            {board.name}
            <button 
              onClick={handleOpenEdit} 
              className="ml-2 text-3xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Edit board"
            >
              ✏️
            </button>
          </h1>
          {board.description && (
            <p className="mt-6 text-gray-600">{board.description}</p>
          )}
        </div>
        
        {/* Maintaining the column/spacing structure but without the button */}
        <div className="flex flex-col md:flex-row gap-2 invisible md:w-28">
          {/* Invisible placeholder to maintain layout spacing */}
        </div>
      </div>
      
      <Modal
        isOpen={isEditing}
        onClose={handleCloseEdit}
        title="Edit Board"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Board Name"
            name="name"
            id="boardName"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter board name"
            required
            fullWidth
          />
          
          <TextArea
            label="Description (Optional)"
            name="description"
            id="boardDescription"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter board description"
            rows={3}
            fullWidth
          />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={handleCloseEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BoardHeader;
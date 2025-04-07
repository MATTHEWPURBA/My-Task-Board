//src/components/BornHeader.tsx
import React, { useState } from 'react';
import { Board } from '@/types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import useBoardStore from '@/store/use-board-store';
// import AddTaskButton from './AddTaskButton';
import { motion } from 'framer-motion';


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
    <motion.div 
      className="bg-white px-4 py-5 md:px-6 rounded-lg shadow-md border border-gray-50 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center">
            <h1 className="text-3xl sm:text-4xl font-medium text-gray-900 break-words">
              {board.name}
            </h1>
            <motion.button 
              onClick={handleOpenEdit} 
              className="ml-2 text-xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Edit board"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ✏️
            </motion.button>
          </div>
          {board.description && (
            <p className="mt-3 text-gray-600 max-w-2xl">{board.description}</p>
          )}
        </div>
        
        <div className="flex mt-2 md:mt-0">
          <button 
            onClick={handleOpenEdit}
            className="text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-md hover:bg-blue-50 transition-colors md:hidden"
          >
            Edit Board
          </button>
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
    </motion.div>
  );
};

export default BoardHeader;
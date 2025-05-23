//src/components/Task.tsx
import React from 'react';
import { Task as TaskType } from '@/types';
import { truncateText,formatDate } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

// import Modal from './ui/Modal';
// import TaskForm from './TaskForm';
// import DeleteTaskButton from './DeleteTaskButton';
// import useBoardStore from '@/store/use-board-store';

interface TaskProps {
  task: TaskType;
  onSelect: (task: TaskType) => void;
}

const Task: React.FC<TaskProps> = ({ task, onSelect }) => {
  // const [isEditing, setIsEditing] = useState(false);
  // const updateTask = useBoardStore(state => state.updateTask);
  // const loading = useBoardStore(state => state.loading);

  // const handleEditClick = () => {
  //   setIsEditing(true);
  // };

  // const handleCloseModal = () => {
  //   setIsEditing(false);
  // };

  // const handleSubmit = async (formData: any) => {
  //   await updateTask(task.id, formData);
  //   setIsEditing(false);
  // };

  // // Get color for status badge
  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'In Progress':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'Completed':
  //       return 'bg-green-100 text-green-800';
  //     case "Won't do":
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  // return (
  //   <>
  //     <div
  //       className="bg-white p-4 rounded-lg shadow mb-3 border border-gray-200 cursor-pointer hover:shadow-md transition duration-200"
  //       onClick={handleEditClick}
  //     >
  //       <div className="flex justify-between items-start">
  //         <div className="flex items-center gap-2">
  //           <span className="text-2xl" role="img" aria-label="Task icon">
  //             {task.icon || '📝'}
  //           </span>
  //           <h3 className="font-medium text-gray-900">{task.name}</h3>
  //         </div>
  //         <div className="flex items-center gap-2">
  //           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
  //             {task.status}
  //           </span>
  //         </div>
  //       </div>

  //       {task.description && (
  //         <p className="mt-2 text-gray-600 text-sm">
  //           {truncateText(task.description, 100)}
  //         </p>
  //       )}

  //       <div className="mt-3 flex justify-between items-center">
  //         <DeleteTaskButton taskId={task.id} />
  //       </div>
  //     </div>

  //     <Modal
  //       isOpen={isEditing}
  //       onClose={handleCloseModal}
  //       title="Edit Task"
  //     >
  //       <TaskForm
  //         initialData={{
  //           name: task.name,
  //           description: task.description || '',
  //           icon: task.icon || '📝',
  //           status: task.status as any
  //         }}
  //         onSubmit={handleSubmit}
  //         isLoading={loading}
  //       />
  //     </Modal>
  //   </>
  // );

  // Set up draggable behavior
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0.5 : 1, // Make original semi-transparent while dragging
      }
    : undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800 border-gray-400';
      case 'In Progress':
        return 'bg-yellow-10 text-yellow-800 border-yellow-400';
      case 'Completed':
        return 'bg-green-10 text-green-800 border-green-400';
      case "Won't do":
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  // Don't apply click handler when dragging
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent event bubbling
  if (isDragging) return;
  onSelect(task);
};




return (
  <motion.div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${getStatusColor(task.status)} cursor-pointer hover:shadow-md transition duration-200 ${
      isDragging ? 'opacity-50' : ''
    }`}
    onClick={handleClick}
    whileHover={{ scale: 1.02, boxShadow: '0 5px 10px rgba(0,0,0,0.05)' }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    layout
  >
    <div className="flex items-start gap-2">
      <span className="text-xl flex-shrink-0" role="img" aria-label="Task icon">
        {task.icon || '📝'}
      </span>
      <div className="flex-grow">
        <h3 className="font-medium text-gray-900">{task.name}</h3>

        {task.description && <p className="mt-1 text-gray-600 text-sm">{truncateText(task.description, 100)}</p>}
        
        {/* Due date display */}
        {task.dueDate && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
      
      {/* Calendar sync indicator */}
      {task.isCalendarSynced && (
        <div className="flex-shrink-0 ml-2" title="Synced with Google Calendar">
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm-9 15H5a1 1 0 01-1-1v-5h6v6zm0-8H4V7a1 1 0 011-1h5v5zm10 7a1 1 0 01-1 1h-5v-6h6v5zm0-7h-6V6h5a1 1 0 011 1v4z" />
          </svg>
        </div>
      )}
    </div>

    {/* Draggable indicator */}
    <div className="mt-2 text-xs text-gray-400 flex items-center">
      {!isDragging && (
        <>
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 11V13H6V11H18Z" fill="currentColor" />
          </svg>
          <span>Drag to change status</span>
        </>
      )}
    </div>
  </motion.div>
);
};

export default Task;
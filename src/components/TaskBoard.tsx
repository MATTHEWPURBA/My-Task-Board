import React from 'react';
import { Board as BoardType } from '@/types';
import Column from './Column';
import BoardHeader from './BoardHeader';

interface TaskBoardProps {
  board: BoardType;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ board }) => {
  // Our predefined column statuses
  const columnTitles = ["In Progress", "Completed", "Won't do"];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BoardHeader board={board} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columnTitles.map(title => (
          <Column 
            key={title} 
            title={title}
            tasks={board.tasks}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
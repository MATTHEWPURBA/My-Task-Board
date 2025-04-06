//src/app/board/[board-id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TaskBoard from '@/components/TaskBoard';
import useBoardStore from '@/store/use-board-store';

export default function BoardPage() {
  const params = useParams();
  const boardId = params['board-id'] as string;

  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const board = useBoardStore((state) => state.board);
  const setBoard = useBoardStore((state) => state.setBoard);
  const loading = useBoardStore(state => state.loading);
  const error = useBoardStore(state => state.error);
  const fetchBoard = useBoardStore(state => state.fetchBoard);
  


  useEffect(() => {
    // Fetch board data when the component mounts
    fetchBoard(boardId);
  }, [boardId, fetchBoard]);



  // Show loading state
  if (loading && !board) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  // Show board not found state
  if (!board) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Board Not Found</h2>
          <p className="text-yellow-600">The board you're looking for does not exist.</p>
        </div>
      </div>
    );
  }
  
  // Show the task board
  return <TaskBoard board={board} />;
}
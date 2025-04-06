'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TaskBoard from '@/components/TaskBoard';
import useBoardStore from '@/store/use-board-store';

export default function BoardPage() {
  const params = useParams();
  const boardId = params['board-id'] as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const board = useBoardStore(state => state.board);
  const setBoard = useBoardStore(state => state.setBoard);
  
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/boards/${boardId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Board not found');
          }
          throw new Error('Failed to fetch board');
        }
        
        const data = await response.json();
        setBoard(data);
      } catch (error) {
        console.error('Error fetching board:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBoard();
  }, [boardId, setBoard]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
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
  
  return <TaskBoard board={board} />;
}
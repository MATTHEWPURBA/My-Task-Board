'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useBoardStore from '@/store/use-board-store';
import Button from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const createNewBoard = useBoardStore(state => state.createNewBoard);
  const loading = useBoardStore(state => state.loading);
  
  // When the app loads, automatically create a new board and redirect to it
  const handleCreateNewBoard = async () => {
    const boardId = await createNewBoard();
    if (boardId) {
      router.push(`/board/${boardId}`);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to My Task Board</h1>
        <p className="text-gray-600 mb-8">
          Create a new task board to get started with organizing your tasks.
        </p>
        <Button 
          onClick={handleCreateNewBoard} 
          isLoading={loading}
          fullWidth
        >
          Create New Board
        </Button>
      </div>
    </div>
  );
}
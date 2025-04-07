'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useBoardStore from '@/store/use-board-store'
import { motion } from 'framer-motion';

// import Button from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const createNewBoard = useBoardStore(state => state.createNewBoard);
  const loading = useBoardStore(state => state.loading);
  const [loadingProgress, setLoadingProgress] = useState(0);


 // Simulate loading progress
 useEffect(() => {
  if (loading) {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 90 ? 90 : newProgress; // Cap at 90% until actual completion
      });
    }, 400);
    
    return () => clearInterval(interval);
  } else if (loadingProgress > 0 && loadingProgress < 100) {
    // When loading completes, jump to 100%
    setLoadingProgress(100);
    
    // Reset after animation completes
    const timeout = setTimeout(() => {
      setLoadingProgress(0);
    }, 600);
    
    return () => clearTimeout(timeout);
  }
}, [loading, loadingProgress]);

  
  useEffect(() => {
    const createBoard = async () => {
      const boardCreationInProgress = localStorage.getItem('boardCreationInProgress');

      if (!boardCreationInProgress) {
        localStorage.setItem('boardCreationInProgress', 'true');
        const boardId = await createNewBoard();
        if (boardId) {
          router.push(`/board/${boardId}`);
        }
        localStorage.removeItem('boardCreationInProgress');
      }
    };
    
    createBoard();
  }, [createNewBoard, router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <motion.div 
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Task Board</h1>
          <p className="text-gray-600 mb-8">
            Creating a new board for you...
          </p>
        </motion.div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
          <motion.div 
            className="bg-blue-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="relative">
          <motion.div 
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-blue-500 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(loadingProgress)}%
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
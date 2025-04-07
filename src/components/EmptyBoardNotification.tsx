// src/components/EmptyBoardNotification.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmptyBoardNotificationProps {
  onAddTask: () => void;
}

const EmptyBoardNotification: React.FC<EmptyBoardNotificationProps> = ({ onAddTask }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show notification after a short delay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddTask = () => {
    setIsVisible(false);
    // Wait for closing animation before calling onAddTask
    setTimeout(onAddTask, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setIsVisible(false)}
          />

          {/* Notification card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-md z-50 relative"
          >
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Empty state animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0] 
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center"
              >
                <span className="text-4xl">📋</span>
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Your board is empty!</h2>
            <p className="text-gray-600 text-center mb-6">
              Start organizing your tasks by adding your first task to the board.
            </p>

            <button
              onClick={handleAddTask}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Create your first task</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmptyBoardNotification;
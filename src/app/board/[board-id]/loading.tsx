//src/app/board/[board-id]/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Skeleton loader for board header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-2/3">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-3"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
      </div>
      
      {/* Skeleton loader for columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 min-h-[300px] animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-8"></div>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, taskIndex) => (
                <div key={taskIndex} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-full"></div>
                  <div className="mt-1 h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
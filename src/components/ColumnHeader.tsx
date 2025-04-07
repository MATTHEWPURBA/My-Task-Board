// src/components/ColumnHeader.tsx
import React from 'react';

interface ColumnHeaderProps {
  title: string;
  count: number;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ title, count }) => {
  // Get color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case "Won't do":
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(title)}`}>
          {count}
        </span>
      </div>
    </div>
  );
};

export default ColumnHeader;
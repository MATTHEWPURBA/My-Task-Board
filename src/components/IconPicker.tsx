//src/components/IconPicker.tsx
import React, { useState, useRef } from 'react';
import { useClickOutside } from '@/hooks/use-click-outside';

interface IconPickerProps {
  selectedIcon: string;
  onChange: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ 
  selectedIcon,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Common emoji sets for tasks
  const emojis = [
    '📝', '✅', '🔄', '❌', '⭐', '🔍', '🚀', '📊', '💡', '🏆', '📌', '🎯',
    '📈', '📉', '🔔', '🔕', '📅', '🔒', '🔓', '🔑', '🔎', '📬', '📭', '📁',
    '📋', '📎', '🔗', '✂️', '📏', '📐', '🧮', '🔖', '📔', '📓', '📕', '📗',
    '📘', '📙', '📚', '📒', '📃', '📄', '📑', '📊', '📈', '📉', '📇', '💻',
    '🖥️', '📱', '⌨️', '🖱️', '🖨️', '🖋️', '✒️', '✏️', '📌', '📍', '📎', '🔍'
  ];
  
  useClickOutside(pickerRef, () => {
    setIsOpen(false);
  });
  
  const togglePicker = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSelectIcon = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center text-xl bg-gray-100 rounded-md hover:bg-gray-200 transition"
        onClick={togglePicker}
        aria-label="Select icon"
      >
        {selectedIcon}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-2 w-64">
          <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectIcon(emoji)}
                className={`w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-100 ${selectedIcon === emoji ? 'bg-blue-100' : ''}`}
                aria-label={`Emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate a random emoji for task icons
export function getRandomEmoji() {
  const emojis = ['📝', '✅', '🔄', '❌', '⭐', '🔍', '🚀', '📊', '💡', '🏆', '📌', '🎯'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Format date for display
export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Truncate text with ellipsis if it exceeds maxLength
export function truncateText(text: string, maxLength: number = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}


export function getStatusColor(status: string) {
  switch (status) {
    case 'In Progress':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-400',
        dot: 'bg-yellow-400'
      };
    case 'Completed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-400',
        dot: 'bg-green-400'
      };
    case "Won't do":
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-400',
        dot: 'bg-red-400'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-400',
        dot: 'bg-gray-400'
      };
  }
}

// Get status emoji
export function getStatusEmoji(status: string) {
  switch (status) {
    case 'In Progress':
      return '🔄';
    case 'Completed':
      return '✅';
    case "Won't do":
      return '❌';
    default:
      return '❓';
  }
}

// Get common task emojis - you can customize this list
export function getTaskEmojis() {
  return [
    '📝', '✅', '🔄', '❌', '⭐', '🔍', '📅', '📌', '⏰', '📚',
    '💡', '🏆', '🔑', '📊', '📈', '📉', '📋', '✏️', '📁', '🔔'
  ];
}

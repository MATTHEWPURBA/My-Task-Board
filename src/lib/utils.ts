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

// src/hooks/use-notification.ts
import { useState, useCallback } from 'react';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface UseNotificationReturn {
  notification: Notification;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideNotification: () => void;
}

export function useNotification(): UseNotificationReturn {
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'info'
  });
  
  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);
  
  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);
  
  return {
    notification,
    showNotification,
    hideNotification
  };
}

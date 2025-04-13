// src/components/ConnectCalendar.tsx
'use client';

import React from 'react';
import Button from './ui/Button';

interface ConnectCalendarProps {
  onConnect?: () => void;
}

const ConnectCalendar: React.FC<ConnectCalendarProps> = ({ onConnect }) => {
  const handleConnectClick = () => {
    // Call the callback if provided
    if (onConnect) {
      onConnect();
    }
    
    // Redirect to our auth bridge which creates a demo user automatically
    window.location.href = '/api/auth/calendar-bridge';
  };

  return (
    <div className="bg-blue-50 p-4 rounded-md mb-6">
      <h2 className="text-lg font-semibold text-blue-700 mb-2">Connect Google Calendar</h2>
      <p className="text-blue-600 mb-4">
        Connect your Google Calendar to sync tasks with your calendar.
      </p>
      <Button onClick={handleConnectClick}>
        Connect Google Calendar
      </Button>
    </div>
  );
};

export default ConnectCalendar;
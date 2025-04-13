// src/app/calendar-settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import ConnectCalendar from '@/components/ConnectCalendar';

interface CalendarSettings {
  enabled: boolean;
  defaultCalendarId?: string;
  syncCompletedTasks: boolean;
  syncWontDoTasks: boolean;
}

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

const CalendarSettingsPage = () => {
  const [settings, setSettings] = useState<CalendarSettings>({
    enabled: true,
    defaultCalendarId: undefined,
    syncCompletedTasks: true,
    syncWontDoTasks: false,
  });
  
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for success parameter in URL
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Google Calendar connected successfully!');
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);
  
  // Load calendar settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/calendar-settings');
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings || {
            enabled: true,
            syncCompletedTasks: true,
            syncWontDoTasks: false,
          });
          setCalendars(data.calendars || []);
          setGoogleConnected(data.calendars && data.calendars.length > 0);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load settings');
        }
      } catch (error) {
        setError('An error occurred while loading settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setSettings({
        ...settings,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendar-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setSuccessMessage('Settings saved successfully!');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      setError('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-6">Calendar Settings</h1>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Calendar Settings</h1>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {!googleConnected ? (
        <ConnectCalendar onConnect={() => setLoading(true)} />
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={settings.enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-gray-700">
                  Enable Google Calendar sync
                </label>
              </div>
              
              {settings.enabled && (
                <>
                  <div className="mb-4">
                    <label htmlFor="defaultCalendarId" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Calendar
                    </label>
                    <select
                      id="defaultCalendarId"
                      name="defaultCalendarId"
                      value={settings.defaultCalendarId || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a calendar</option>
                      {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.summary} {calendar.primary ? "(Primary)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Sync Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="syncCompletedTasks"
                          name="syncCompletedTasks"
                          checked={settings.syncCompletedTasks}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="syncCompletedTasks" className="ml-2 block text-sm text-gray-700">
                          Sync completed tasks
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="syncWontDoTasks"
                          name="syncWontDoTasks"
                          checked={settings.syncWontDoTasks}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="syncWontDoTasks" className="ml-2 block text-sm text-gray-700">
                          Sync "Won't do" tasks
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} isLoading={saving}>
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSettingsPage;
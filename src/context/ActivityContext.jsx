// src/context/ActivityContext.jsx
// Global Activity Tracking Context

import { createContext, useContext, useState, useEffect } from 'react';

const ActivityContext = createContext();

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem('recent_activities');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever activities change
  useEffect(() => {
    localStorage.setItem('recent_activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity
    };

    setActivities(prev => {
      const updated = [newActivity, ...prev];
      // Keep only last 50 activities
      return updated.slice(0, 50);
    });
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('recent_activities');
  };

  const getRecentActivities = (limit = 10) => {
    return activities.slice(0, limit);
  };

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      addActivity, 
      clearActivities,
      getRecentActivities 
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
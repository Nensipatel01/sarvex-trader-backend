import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [
      { ...notif, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() },
      ...prev
    ].slice(0, 50)); // Keep last 50
  }, []);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.alerts.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  const checkNotifications = useCallback(async () => {
    try {
      const newNotifs = await api.alerts.getNotifications();
      if (newNotifs && newNotifs.length > 0) {
        newNotifs.forEach(n => addNotification(n));
      }
    } catch (err) {
      console.error('Failed to check notifications:', err);
    }
  }, [addNotification]);

  // Polling for live notifications
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(checkNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [fetchAlerts, checkNotifications]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      alerts, 
      addNotification, 
      dismissNotification, 
      fetchAlerts 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Bell, X, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Toast = ({ notification, onDismiss }) => {
  const icons = {
    risk: <AlertCircle className="text-red-500" size={20} />,
    execution: <CheckCircle className="text-green-500" size={20} />,
    price: <Bell className="text-[var(--orange-primary)]" size={20} />,
    system: <Info className="text-blue-500" size={20} />,
  };

  const colors = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-orange-500/50 bg-orange-500/5',
    low: 'border-blue-500/50 bg-blue-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={`relative w-80 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${colors[notification.severity] || 'border-white/10 bg-white/5'}`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {icons[notification.type] || icons.system}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">
            {notification.title || 'System Notification'}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            {notification.message}
          </p>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-2 block">
            {notification.time}
          </span>
        </div>
        <button 
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 text-[var(--text-muted)] hover:text-white transition-colors h-fit"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default function ToastContainer() {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map(n => (
            <Toast 
              key={n.id} 
              notification={n} 
              onDismiss={dismissNotification} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

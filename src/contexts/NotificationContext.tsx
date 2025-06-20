'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'PAYMENT_DUE' | 'ATTENDANCE' | 'HAFALAN' | 'ANNOUNCEMENT';
  isRead: boolean;
  data?: any;
  createdAt: string;
  userId: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    // Simulate real-time notifications for demo
    const interval = setInterval(() => {
      if (user && Math.random() > 0.7) { // 30% chance every 30 seconds
        const mockNotifications = [
          {
            title: 'Pembayaran SPP Diterima',
            message: 'Pembayaran SPP Ahmad Fauzi telah berhasil diproses',
            type: 'SUCCESS' as const,
            data: { santriId: '1', amount: 500000 }
          },
          {
            title: 'Hafalan Baru Menunggu Review',
            message: 'Siti Aisyah telah mengumpulkan hafalan Al-Baqarah 1-20',
            type: 'HAFALAN' as const,
            data: { santriId: '2', surah: 'Al-Baqarah' }
          },
          {
            title: 'Donasi Baru Diterima',
            message: 'Donasi sebesar Rp 1.000.000 dari Bapak Ahmad',
            type: 'SUCCESS' as const,
            data: { amount: 1000000, donor: 'Bapak Ahmad' }
          },
          {
            title: 'Reminder Absensi',
            message: 'Jangan lupa melakukan absensi untuk halaqah hari ini',
            type: 'WARNING' as const,
            data: { halaqahId: '1' }
          },
          {
            title: 'Pengumuman Penting',
            message: 'Wisuda hafidz akan dilaksanakan pada tanggal 20 Februari 2024',
            type: 'ANNOUNCEMENT' as const,
            data: { eventDate: '2024-02-20' }
          }
        ];

        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        addNotification({
          ...randomNotification,
          userId: user.id
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep only last 50 notifications
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    // Show toast notification
    const toastMessage = `${notification.title}: ${notification.message}`;
    switch (notification.type) {
      case 'SUCCESS':
        toast.success(toastMessage, { duration: 4000 });
        break;
      case 'ERROR':
        toast.error(toastMessage, { duration: 5000 });
        break;
      case 'WARNING':
        toast(toastMessage, { 
          icon: '⚠️',
          duration: 4000,
          style: {
            background: '#FEF3C7',
            color: '#92400E'
          }
        });
        break;
      case 'INFO':
      case 'ANNOUNCEMENT':
        toast(toastMessage, { 
          icon: 'ℹ️',
          duration: 4000,
          style: {
            background: '#DBEAFE',
            color: '#1E40AF'
          }
        });
        break;
      case 'HAFALAN':
        toast(toastMessage, { 
          icon: '📖',
          duration: 4000,
          style: {
            background: '#D1FAE5',
            color: '#065F46'
          }
        });
        break;
      case 'PAYMENT_DUE':
        toast(toastMessage, { 
          icon: '💳',
          duration: 5000,
          style: {
            background: '#FEE2E2',
            color: '#991B1B'
          }
        });
        break;
      case 'ATTENDANCE':
        toast(toastMessage, { 
          icon: '📅',
          duration: 4000,
          style: {
            background: '#F3E8FF',
            color: '#6B21A8'
          }
        });
        break;
      default:
        toast(toastMessage);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

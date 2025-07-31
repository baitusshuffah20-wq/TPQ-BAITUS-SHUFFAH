import React, { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppConfig } from '../config/AppConfig';

interface NotificationHandlerProps {
  onNotificationReceived: () => void;
  appConfig: AppConfig;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({
  onNotificationReceived,
  appConfig,
}) => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Listen for notifications received while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        
        // Update unread count
        onNotificationReceived();
        
        // Handle different notification types
        handleNotificationReceived(notification);
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        handleNotificationResponse(response);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [onNotificationReceived]);

  const handleNotificationReceived = (notification: Notifications.Notification) => {
    const { title, body, data } = notification.request.content;
    
    // Handle different notification types
    switch (data?.type) {
      case 'payment_reminder':
        handlePaymentReminder(data);
        break;
      case 'progress_update':
        handleProgressUpdate(data);
        break;
      case 'message':
        handleNewMessage(data);
        break;
      case 'announcement':
        handleAnnouncement(data);
        break;
      default:
        // Generic notification handling
        break;
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'payment_reminder':
        // Navigate to payment screen
        console.log('Navigate to payment screen');
        break;
      case 'progress_update':
        // Navigate to child progress screen
        console.log('Navigate to progress screen');
        break;
      case 'message':
        // Navigate to messages screen
        console.log('Navigate to messages screen');
        break;
      case 'announcement':
        // Navigate to announcements screen
        console.log('Navigate to announcements screen');
        break;
      default:
        // Navigate to notifications screen
        console.log('Navigate to notifications screen');
        break;
    }
  };

  const handlePaymentReminder = (data: any) => {
    // Handle payment reminder notification
    if (appConfig.features.enablePaymentReminder) {
      // Show local alert or update UI
      console.log('Payment reminder received:', data);
    }
  };

  const handleProgressUpdate = (data: any) => {
    // Handle progress update notification
    if (appConfig.features.enableProgressTracking) {
      console.log('Progress update received:', data);
    }
  };

  const handleNewMessage = (data: any) => {
    // Handle new message notification
    if (appConfig.features.enableMessaging) {
      console.log('New message received:', data);
    }
  };

  const handleAnnouncement = (data: any) => {
    // Handle announcement notification
    console.log('Announcement received:', data);
  };

  // Schedule local notifications for reminders
  const schedulePaymentReminder = async (paymentData: any) => {
    if (!appConfig.features.enablePaymentReminder) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pengingat Pembayaran SPP',
          body: `Tagihan SPP ${paymentData.month} sebesar ${paymentData.amount} akan jatuh tempo besok.`,
          data: {
            type: 'payment_reminder',
            paymentId: paymentData.id,
          },
        },
        trigger: {
          seconds: 24 * 60 * 60, // 24 hours
        },
      });
    } catch (error) {
      console.error('Error scheduling payment reminder:', error);
    }
  };

  const scheduleProgressReminder = async () => {
    if (!appConfig.features.enableProgressTracking) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Cek Progress Anak',
          body: 'Lihat perkembangan hafalan dan nilai anak Anda minggu ini.',
          data: {
            type: 'progress_update',
          },
        },
        trigger: {
          weekday: 1, // Monday
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling progress reminder:', error);
    }
  };

  // Cancel all scheduled notifications
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  // Get notification permissions status
  const getPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'undetermined';
    }
  };

  // Request notification permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Izin Notifikasi',
          'Aplikasi memerlukan izin notifikasi untuk memberikan update terbaru tentang anak Anda.',
          [
            { text: 'Nanti', style: 'cancel' },
            { text: 'Buka Pengaturan', onPress: () => Notifications.openSettingsAsync() },
          ]
        );
      }
      
      return status;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return 'denied';
    }
  };

  // Expose methods for external use
  React.useImperativeHandle(ref => ({
    schedulePaymentReminder,
    scheduleProgressReminder,
    cancelAllNotifications,
    getPermissionStatus,
    requestPermissions,
  }));

  return null; // This component doesn't render anything
};

export default NotificationHandler;

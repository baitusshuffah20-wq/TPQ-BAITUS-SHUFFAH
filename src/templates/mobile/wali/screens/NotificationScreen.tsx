import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppConfig } from '../config/AppConfig';

interface NotificationScreenProps {
  appConfig: AppConfig;
  onNotificationUpdate: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'payment' | 'progress' | 'message' | 'announcement' | 'general';
  timestamp: string;
  read: boolean;
  data?: any;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  appConfig,
  onNotificationUpdate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    paymentReminders: true,
    progressUpdates: true,
    messages: true,
    announcements: true,
  });

  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/notifications/wali`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        // Fallback to mock data
        setNotifications(getMockNotifications());
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/notifications/settings`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.settings || notificationSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const getMockNotifications = (): NotificationItem[] => [
    {
      id: '1',
      title: 'Tagihan SPP Februari',
      body: 'Tagihan SPP bulan Februari sebesar Rp 150.000 akan jatuh tempo dalam 3 hari.',
      type: 'payment',
      timestamp: '2024-02-10T10:00:00Z',
      read: false,
    },
    {
      id: '2',
      title: 'Progress Hafalan Ahmad',
      body: 'Ahmad telah menyelesaikan hafalan Surah Al-Baqarah ayat 1-10 dengan nilai A.',
      type: 'progress',
      timestamp: '2024-02-09T15:30:00Z',
      read: false,
    },
    {
      id: '3',
      title: 'Pesan dari Ustadz Abdullah',
      body: 'Ahmad menunjukkan progress yang baik dalam hafalan. Terus semangat!',
      type: 'message',
      timestamp: '2024-02-08T14:20:00Z',
      read: true,
    },
    {
      id: '4',
      title: 'Pengumuman TPQ',
      body: 'Libur TPQ pada tanggal 15-17 Februari 2024 dalam rangka Isra Miraj.',
      type: 'announcement',
      timestamp: '2024-02-07T09:00:00Z',
      read: true,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${appConfig.apiBaseUrl}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      onNotificationUpdate();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${appConfig.apiBaseUrl}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
      });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      onNotificationUpdate();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Hapus Notifikasi',
      'Apakah Anda yakin ingin menghapus notifikasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${appConfig.apiBaseUrl}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  // Add authentication headers here
                },
              });

              setNotifications(prev =>
                prev.filter(notif => notif.id !== notificationId)
              );
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const updateNotificationSetting = async (setting: string, value: boolean) => {
    try {
      const newSettings = { ...notificationSettings, [setting]: value };
      setNotificationSettings(newSettings);

      await fetch(`${appConfig.apiBaseUrl}/api/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return 'card';
      case 'progress':
        return 'trending-up';
      case 'message':
        return 'chatbubble';
      case 'announcement':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment':
        return '#DC2626';
      case 'progress':
        return '#059669';
      case 'message':
        return '#3B82F6';
      case 'announcement':
        return '#7C3AED';
      default:
        return appConfig.primaryColor;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: appConfig.cardBackgroundColor },
        !item.read && styles.unreadItem,
      ]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) + '20' }
          ]}>
            <Ionicons
              name={getNotificationIcon(item.type)}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.notificationText}>
            <Text style={[
              styles.notificationTitle,
              { color: appConfig.textColor },
              !item.read && styles.unreadText,
            ]}>
              {item.title}
            </Text>
            <Text style={[
              styles.notificationBody,
              { color: appConfig.textColor + '80' },
            ]}>
              {item.body}
            </Text>
            <Text style={[
              styles.notificationTime,
              { color: appConfig.textColor + '60' },
            ]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#DC2626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: appConfig.textColor }]}>
        Notifikasi
      </Text>
      <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
        <Text style={[styles.markAllText, { color: appConfig.primaryColor }]}>
          Tandai Semua Dibaca
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSettings = () => (
    <View style={[styles.settingsContainer, { backgroundColor: appConfig.cardBackgroundColor }]}>
      <Text style={[styles.settingsTitle, { color: appConfig.textColor }]}>
        Pengaturan Notifikasi
      </Text>
      
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: appConfig.textColor }]}>
          Pengingat Pembayaran
        </Text>
        <Switch
          value={notificationSettings.paymentReminders}
          onValueChange={(value) => updateNotificationSetting('paymentReminders', value)}
          trackColor={{ false: '#E5E7EB', true: appConfig.primaryColor + '40' }}
          thumbColor={notificationSettings.paymentReminders ? appConfig.primaryColor : '#9CA3AF'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: appConfig.textColor }]}>
          Update Progress
        </Text>
        <Switch
          value={notificationSettings.progressUpdates}
          onValueChange={(value) => updateNotificationSetting('progressUpdates', value)}
          trackColor={{ false: '#E5E7EB', true: appConfig.primaryColor + '40' }}
          thumbColor={notificationSettings.progressUpdates ? appConfig.primaryColor : '#9CA3AF'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: appConfig.textColor }]}>
          Pesan Ustadz
        </Text>
        <Switch
          value={notificationSettings.messages}
          onValueChange={(value) => updateNotificationSetting('messages', value)}
          trackColor={{ false: '#E5E7EB', true: appConfig.primaryColor + '40' }}
          thumbColor={notificationSettings.messages ? appConfig.primaryColor : '#9CA3AF'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, { color: appConfig.textColor }]}>
          Pengumuman
        </Text>
        <Switch
          value={notificationSettings.announcements}
          onValueChange={(value) => updateNotificationSetting('announcements', value)}
          trackColor={{ false: '#E5E7EB', true: appConfig.primaryColor + '40' }}
          thumbColor={notificationSettings.announcements ? appConfig.primaryColor : '#9CA3AF'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appConfig.backgroundColor }]}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {renderHeader()}
            {renderSettings()}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[appConfig.primaryColor]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
  },
  notificationItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default NotificationScreen;

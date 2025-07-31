import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Import Screens
import DashboardScreen from './screens/DashboardScreen';
import ChildrenScreen from './screens/ChildrenScreen';
import PaymentScreen from './screens/PaymentScreen';
import DonationScreen from './screens/DonationScreen';
import NotificationScreen from './screens/NotificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import MessagesScreen from './screens/MessagesScreen';

// Import Components
import BottomNavigation from './components/BottomNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationHandler from './components/NotificationHandler';

// Import Configuration
import {
  defaultAppConfig,
  modernAppConfig,
  AppConfig,
} from './config/AppConfig';

const Tab = createBottomTabNavigator();

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface AppProps {
  theme?: "default" | "modern" | "blue" | "purple";
}

const WaliApp: React.FC<AppProps> = ({ theme = "default" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("Dashboard");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  // Select app configuration based on theme
  const getAppConfig = (): AppConfig => {
    switch (theme) {
      case "modern":
        return modernAppConfig;
      default:
        return defaultAppConfig;
    }
  };

  const appConfig = getAppConfig();

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadUnreadNotifications();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Izin Notifikasi', 'Izin notifikasi diperlukan untuk mendapatkan update terbaru!');
        return;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      
      // Send token to backend
      await sendTokenToBackend(token);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const sendTokenToBackend = async (token: string) => {
    try {
      await fetch(`${appConfig.apiBaseUrl}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userType: 'WALI',
          platform: 'mobile'
        }),
      });
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/notifications/unread-count`);
      const data = await response.json();
      setUnreadNotifications(data.count || 0);
    } catch (error) {
      console.error('Error loading unread notifications:', error);
    }
  };

  const handleNavigation = (routeName: string) => {
    setCurrentRoute(routeName);
  };

  const tabScreens = [
    {
      name: "Dashboard",
      component: DashboardScreen,
      title: "Beranda",
      icon: "home-outline",
      activeIcon: "home",
    },
    {
      name: "Children",
      component: ChildrenScreen,
      title: "Anak Saya",
      icon: "people-outline",
      activeIcon: "people",
    },
    {
      name: "Payment",
      component: PaymentScreen,
      title: "Pembayaran",
      icon: "card-outline",
      activeIcon: "card",
    },
    {
      name: "Donation",
      component: DonationScreen,
      title: "Donasi",
      icon: "heart-outline",
      activeIcon: "heart",
    },
    {
      name: "Profile",
      component: ProfileScreen,
      title: "Profil",
      icon: "person-outline",
      activeIcon: "person",
    },
  ];

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: appConfig.backgroundColor },
          ]}
        >
          <StatusBar
            style={appConfig.statusBarStyle}
            backgroundColor={appConfig.statusBarColor}
          />

          <NotificationHandler
            onNotificationReceived={loadUnreadNotifications}
            appConfig={appConfig}
          />

          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' },
            }}
            tabBar={() => (
              <BottomNavigation
                activeRoute={currentRoute}
                onNavigate={handleNavigation}
                appConfig={appConfig}
                unreadCount={unreadNotifications}
              />
            )}
          >
            {tabScreens.map((screen) => (
              <Tab.Screen
                key={screen.name}
                name={screen.name}
                component={() => (
                  <screen.component 
                    appConfig={appConfig}
                    unreadNotifications={unreadNotifications}
                    onNotificationUpdate={loadUnreadNotifications}
                  />
                )}
              />
            ))}
            
            {/* Additional Screens */}
            <Tab.Screen
              name="Notifications"
              component={() => (
                <NotificationScreen 
                  appConfig={appConfig}
                  onNotificationUpdate={loadUnreadNotifications}
                />
              )}
            />
            <Tab.Screen
              name="Messages"
              component={() => (
                <MessagesScreen 
                  appConfig={appConfig}
                />
              )}
            />
          </Tab.Navigator>

          <LoadingSpinner
            visible={isLoading}
            overlay={true}
            colors={[appConfig.primaryColor, appConfig.secondaryColor]}
          />
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WaliApp;

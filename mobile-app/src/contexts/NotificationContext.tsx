import React, { createContext, useContext, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  expoPushToken: string | null;
  notifications: NotificationData[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  requestPermissions: () => Promise<boolean>;
}

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: "payment" | "progress" | "announcement" | "message";
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync();
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const newNotification: NotificationData = {
          id: notification.request.identifier,
          title: notification.request.content.title || "",
          body: notification.request.content.body || "",
          data: notification.request.content.data,
          timestamp: new Date(),
          read: false,
          type:
            (notification.request.content.data?.type as
              | "payment"
              | "progress"
              | "announcement"
              | "message") || "announcement",
        };

        setNotifications((prev) => [newNotification, ...prev]);
      },
    );

    // Listen for notification responses (when user taps notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationId = response.notification.request.identifier;
        markAsRead(notificationId);

        // Handle navigation based on notification type
        const notificationType = response.notification.request.content.data
          ?.type as string;
        handleNotificationNavigation(
          notificationType,
          response.notification.request.content.data,
        );
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      // Send token to your server
      if (user && token) {
        await sendTokenToServer(token);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }
  };

  const sendTokenToServer = async (token: string) => {
    try {
      // Send the token to your backend server
      const response = await fetch(
        "http://localhost:3000/api/notifications/register-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify({
            token,
            userId: user?.id,
            platform: Platform.OS,
          }),
        },
      );

      if (!response.ok) {
        console.error("Failed to register push token");
      }
    } catch (error) {
      console.error("Error sending token to server:", error);
    }
  };

  const getAuthToken = async () => {
    // Get auth token from secure store
    const { default: SecureStore } = await import("expo-secure-store");
    return await SecureStore.getItemAsync("authToken");
  };

  const loadNotifications = async () => {
    try {
      // Load notifications from server
      const response = await fetch("http://localhost:3000/api/notifications", {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );

    // Update on server
    updateNotificationStatus(notificationId, true);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );

    // Update all on server
    updateAllNotificationsStatus(true);
  };

  const updateNotificationStatus = async (
    notificationId: string,
    read: boolean,
  ) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ read }),
      });
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const updateAllNotificationsStatus = async (read: boolean) => {
    try {
      await fetch("http://localhost:3000/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ read }),
      });
    } catch (error) {
      console.error("Error updating all notifications status:", error);
    }
  };

  const handleNotificationNavigation = (type: string, data: any) => {
    // This will be implemented when we have navigation setup
    console.log("Navigate to:", type, data);
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    expoPushToken,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    requestPermissions,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

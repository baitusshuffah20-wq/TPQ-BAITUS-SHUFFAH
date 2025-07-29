import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";

// Main Screens
import HomeScreen from "../screens/main/HomeScreen";
import ProgressScreen from "../screens/main/ProgressScreen";
import PaymentScreen from "../screens/main/PaymentScreen";
import MessagesScreen from "../screens/main/MessagesScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

// Detail Screens
import SantriDetailScreen from "../screens/detail/SantriDetailScreen";
import PaymentDetailScreen from "../screens/detail/PaymentDetailScreen";
import DonationScreen from "../screens/detail/DonationScreen";
import NotificationScreen from "../screens/detail/NotificationScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SantriDetail: { santriId: string };
  PaymentDetail: { paymentId: string };
  Donation: undefined;
  Notification: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Payment: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: { name: keyof MainTabParamList };
      }) => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Progress":
              iconName = focused ? "trending-up" : "trending-up-outline";
              break;
            case "Payment":
              iconName = focused ? "card" : "card-outline";
              break;
            case "Messages":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "home-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Beranda" }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarLabel: "Progress" }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ tabBarLabel: "Pembayaran" }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: "Pesan" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    // You can return a loading screen here
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SantriDetail"
            component={SantriDetailScreen}
            options={{
              title: "Detail Santri",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="PaymentDetail"
            component={PaymentDetailScreen}
            options={{
              title: "Detail Pembayaran",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Donation"
            component={DonationScreen}
            options={{
              title: "Donasi",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
            options={{
              title: "Notifikasi",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

import React, { useState } from "react";
import { StyleSheet, SafeAreaView, StatusBar } from "react-native";

// Navigation fallback components for when @react-navigation packages are not available
// In a real React Native project, replace these with:
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const NavigationContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
);

const createBottomTabNavigator = () => ({
  Navigator: ({
    children,
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <>{children}</>,
  Screen: ({
    children,
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <>{children}</>,
});

// Icon component fallback for when @expo/vector-icons is not available
// In a real React Native project, replace this with:
// import { Ionicons } from '@expo/vector-icons';
const Ionicons: React.FC<{
  name: string;
  size: number;
  color: string;
}> = ({ size, color }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
    }}
  />
);

// Import Screens
import HomeScreen from "./HomeScreen";
import ActivityScreen from "./screens/ActivityScreen";
import DonationScreen from "./screens/DonationScreen";
import InboxScreen from "./screens/InboxScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Import Components
import BottomNavigation from "./components/BottomNavigation";
import FloatingActionButton from "./components/FloatingActionButton";
import LoadingSpinner from "./components/LoadingSpinner";

// Import Configuration
import {
  defaultAppConfig,
  modernAppConfig,
  AppConfig,
} from "./config/AppConfig";

const Tab = createBottomTabNavigator();

interface AppProps {
  theme?: "default" | "modern" | "blue" | "purple";
}

const App: React.FC<AppProps> = ({ theme = "modern" }) => {
  const [currentRoute, setCurrentRoute] = useState("Home");
  const [isLoading] = useState(false);
  const [showFAB, setShowFAB] = useState(true);

  // Select theme configuration
  const getAppConfig = (): AppConfig => {
    switch (theme) {
      case "modern":
        return modernAppConfig;
      case "default":
      default:
        return defaultAppConfig;
    }
  };

  const appConfig = getAppConfig();

  const handleNavigation = (route: string) => {
    setCurrentRoute(route);
    // Hide FAB on certain screens
    setShowFAB(!["Profile", "Inbox"].includes(route));
  };

  const handleFABPress = () => {
    // Quick action based on current route
    switch (currentRoute) {
      case "Home":
        console.log("Quick add hafalan");
        break;
      case "Activity":
        console.log("Add new activity");
        break;
      case "Donation":
        console.log("Quick donate");
        break;
      default:
        console.log("Default FAB action");
    }
  };

  const tabScreens = [
    {
      name: "Home",
      component: HomeScreen,
      title: "Beranda",
      icon: "home",
      activeIcon: "home",
    },
    {
      name: "Activity",
      component: ActivityScreen,
      title: "Aktivitas",
      icon: "list-outline",
      activeIcon: "list",
    },
    {
      name: "Donation",
      component: DonationScreen,
      title: "Donasi",
      icon: "heart-outline",
      activeIcon: "heart",
    },
    {
      name: "Inbox",
      component: InboxScreen,
      title: "Inbox",
      icon: "mail-outline",
      activeIcon: "mail",
    },
    {
      name: "Profile",
      component: ProfileScreen,
      title: "Akun",
      icon: "person-outline",
      activeIcon: "person",
    },
  ];

  return (
    <NavigationContainer>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: appConfig.backgroundColor },
        ]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={appConfig.primaryColor}
        />

        <Tab.Navigator
          screenOptions={({ route }: { route: { name: string } }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: appConfig.primaryColor,
            tabBarInactiveTintColor: appConfig.textSecondaryColor,
            tabBarIcon: ({ focused, color, size }) => {
              const screen = tabScreens.find((s) => s.name === route.name);
              const iconName = focused ? screen?.activeIcon : screen?.icon;
              return (
                <Ionicons name={iconName || "home"} size={size} color={color} />
              );
            },
            tabBarLabel: () => {
              const screen = tabScreens.find((s) => s.name === route.name);
              return screen?.title || route.name;
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "500",
            },
          })}
          tabBar={() => (
            <BottomNavigation
              activeRoute={currentRoute}
              onNavigate={handleNavigation}
              appConfig={appConfig}
            />
          )}
        >
          {tabScreens.map((screen) => (
            <Tab.Screen
              key={screen.name}
              name={screen.name}
              component={() => <screen.component appConfig={appConfig} />}
            />
          ))}
        </Tab.Navigator>

        {/* Floating Action Button */}
        {showFAB && (
          <FloatingActionButton
            onPress={handleFABPress}
            icon="add"
            colors={[appConfig.primaryColor, appConfig.secondaryColor]}
            position="bottom-right"
            bottom={100}
          />
        )}

        {/* Loading Spinner */}
        <LoadingSpinner
          visible={isLoading}
          overlay={true}
          colors={[appConfig.primaryColor, appConfig.secondaryColor]}
        />
      </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingBottom: 20,
    height: 80,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});

export default App;

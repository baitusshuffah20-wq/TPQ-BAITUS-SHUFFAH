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
  Navigator: ({ children, screenOptions, tabBar }: any) => (
    <SafeAreaView style={{ flex: 1 }}>
      {children}
      {tabBar && tabBar()}
    </SafeAreaView>
  ),
  Screen: ({ children }: any) => children,
});

// Mock Ionicons for web preview
const Ionicons = ({ name, size, color }: any) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.6,
      color: "white",
    }}
  >
    {name?.charAt(0)?.toUpperCase()}
  </div>
);

// Import Screens
import DashboardScreen from "./screens/DashboardScreen";
import SantriScreen from "./screens/SantriScreen";
import HafalanScreen from "./screens/HafalanScreen";
import WalletScreen from "./screens/WalletScreen";
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
  const [currentRoute, setCurrentRoute] = useState("Dashboard");
  const [showFAB, setShowFAB] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getAppConfig = (): AppConfig => {
    switch (theme) {
      case "modern":
        return modernAppConfig;
      case "blue":
        return { ...modernAppConfig, primaryColor: "#3B82F6", secondaryColor: "#60A5FA" };
      case "purple":
        return { ...modernAppConfig, primaryColor: "#8B5CF6", secondaryColor: "#A78BFA" };
      default:
        return defaultAppConfig;
    }
  };

  const appConfig = getAppConfig();

  const handleNavigation = (route: string) => {
    setCurrentRoute(route);
    // Hide FAB on certain screens
    setShowFAB(!["Profile", "Wallet"].includes(route));
  };

  const handleFABPress = () => {
    switch (currentRoute) {
      case "Dashboard":
        console.log("Quick action from Dashboard");
        break;
      case "Santri":
        console.log("Add new santri assessment");
        break;
      case "Hafalan":
        console.log("Add new hafalan entry");
        break;
      default:
        console.log("Default FAB action");
    }
  };

  const tabScreens = [
    {
      name: "Dashboard",
      component: DashboardScreen,
      title: "Dashboard",
      icon: "analytics-outline",
      activeIcon: "analytics",
    },
    {
      name: "Santri",
      component: SantriScreen,
      title: "Santri",
      icon: "people-outline",
      activeIcon: "people",
    },
    {
      name: "Hafalan",
      component: HafalanScreen,
      title: "Hafalan",
      icon: "book-outline",
      activeIcon: "book",
    },
    {
      name: "Wallet",
      component: WalletScreen,
      title: "Wallet",
      icon: "wallet-outline",
      activeIcon: "wallet",
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
          initialRouteName="Dashboard"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: appConfig.primaryColor,
            tabBarInactiveTintColor: appConfig.textSecondaryColor,
            tabBarIcon: ({ focused, color, size }) => {
              const screen = tabScreens.find((s) => s.name === route.name);
              const iconName = focused ? screen?.activeIcon : screen?.icon;
              return (
                <Ionicons name={iconName || "analytics"} size={size} color={color} />
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

        {showFAB && (
          <FloatingActionButton
            onPress={handleFABPress}
            backgroundColor={appConfig.primaryColor}
            icon="add"
          />
        )}

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
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
});

export default App;

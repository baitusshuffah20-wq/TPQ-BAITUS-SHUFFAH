import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// Icon component fallback for when @expo/vector-icons is not available
// In a real React Native project, replace this with:
// import { Ionicons } from '@expo/vector-icons';
// and replace all IconComponent usage with Ionicons
const IconComponent: React.FC<{
  name: string;
  size: number;
  color: string;
}> = ({ size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
    }}
  />
);

interface NavItem {
  id: string;
  title: string;
  icon: string;
  activeIcon: string;
  route: string;
}

interface AppConfig {
  primaryColor: string;
  [key: string]: unknown;
}

interface BottomNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  appConfig: AppConfig;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeRoute,
  onNavigate,
  appConfig,
}) => {
  const navItems: NavItem[] = [
    {
      id: "1",
      title: "Beranda",
      icon: "home-outline",
      activeIcon: "home",
      route: "Home",
    },
    {
      id: "2",
      title: "Aktivitas",
      icon: "list-outline",
      activeIcon: "list",
      route: "Activity",
    },
    {
      id: "3",
      title: "Donasi",
      icon: "heart-outline",
      activeIcon: "heart",
      route: "Donation",
    },
    {
      id: "4",
      title: "Inbox",
      icon: "mail-outline",
      activeIcon: "mail",
      route: "Inbox",
    },
    {
      id: "5",
      title: "Akun",
      icon: "person-outline",
      activeIcon: "person",
      route: "Profile",
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = activeRoute === item.route;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.navItem}
        onPress={() => onNavigate(item.route)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            isActive && { backgroundColor: appConfig.primaryColor + "15" },
          ]}
        >
          <IconComponent
            name={isActive ? item.activeIcon : item.icon}
            size={24}
            color={isActive ? appConfig.primaryColor : "#7f8c8d"}
          />
        </View>
        <Text
          style={[
            styles.navText,
            { color: isActive ? appConfig.primaryColor : "#7f8c8d" },
          ]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>{navItems.map(renderNavItem)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingBottom: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default BottomNavigation;

import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Import screens based on enabled features
import DashboardScreen from "./src/screens/DashboardScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AttendanceScreen from "./src/screens/AttendanceScreen";
import ScheduleScreen from "./src/screens/ScheduleScreen";
import AchievementsScreen from "./src/screens/AchievementsScreen";
import DonationsScreen from "./src/screens/DonationsScreen";
import EventsScreen from "./src/screens/EventsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#eca825",
          tabBarInactiveTintColor: "gray",
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Payment" component={PaymentScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Achievements" component={AchievementsScreen} />
        <Tab.Screen name="Donations" component={DonationsScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

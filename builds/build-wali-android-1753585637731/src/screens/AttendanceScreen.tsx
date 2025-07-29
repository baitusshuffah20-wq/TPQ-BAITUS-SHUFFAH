import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AttendanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance - WALI</Text>
      <Text style={styles.subtitle}>Fitur Attendance untuk aplikasi wali</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

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

// LinearGradient component fallback for when expo-linear-gradient is not available
// In a real React Native project, replace this with:
// import { LinearGradient } from 'expo-linear-gradient';
const LinearGradientComponent: React.FC<{
  colors: string[];
  style?: object;
  children?: React.ReactNode;
}> = ({ colors, style, children }) => (
  <View style={[{ backgroundColor: colors[0] }, style]}>{children}</View>
);

import CustomHeader from "../components/CustomHeader";

interface Activity {
  id: string;
  title: string;
  description: string;
  type: "payment" | "progress" | "achievement" | "attendance";
  date: string;
  status: "completed" | "pending" | "failed";
  amount?: number;
}

interface AppConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textSecondaryColor: string;
  textPrimaryColor: string;
  cardBackgroundColor: string;
}

interface FilterItem {
  id: string;
  title: string;
  icon: string;
}

interface ActivityScreenProps {
  appConfig: AppConfig;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({ appConfig }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const activities: Activity[] = [
    {
      id: "1",
      title: "Pembayaran SPP Bulan September",
      description: "Pembayaran SPP berhasil dilakukan",
      type: "payment",
      date: "2024-09-20T10:30:00Z",
      status: "completed",
      amount: 150000,
    },
    {
      id: "2",
      title: "Hafalan Surah Al-Baqarah Ayat 1-10",
      description: "Hafalan baru berhasil disetor",
      type: "progress",
      date: "2024-09-19T14:15:00Z",
      status: "completed",
    },
    {
      id: "3",
      title: "Juara 1 Lomba Tahfidz",
      description: "Meraih juara 1 dalam lomba tahfidz tingkat kecamatan",
      type: "achievement",
      date: "2024-09-18T16:00:00Z",
      status: "completed",
    },
    {
      id: "4",
      title: "Absensi Hari Ini",
      description: "Hadir tepat waktu",
      type: "attendance",
      date: "2024-09-20T07:00:00Z",
      status: "completed",
    },
    {
      id: "5",
      title: "Pembayaran SPP Bulan Oktober",
      description: "Menunggu konfirmasi pembayaran",
      type: "payment",
      date: "2024-09-20T11:00:00Z",
      status: "pending",
      amount: 150000,
    },
  ];

  const filters = [
    { id: "all", title: "Semua", icon: "list" },
    { id: "payment", title: "Pembayaran", icon: "card" },
    { id: "progress", title: "Progress", icon: "trending-up" },
    { id: "achievement", title: "Prestasi", icon: "trophy" },
    { id: "attendance", title: "Absensi", icon: "checkmark-circle" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "card";
      case "progress":
        return "trending-up";
      case "achievement":
        return "trophy";
      case "attendance":
        return "checkmark-circle";
      default:
        return "document";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "payment":
        return "#3498DB";
      case "progress":
        return "#2ECC71";
      case "achievement":
        return "#F39C12";
      case "attendance":
        return "#9B59B6";
      default:
        return "#95A5A6";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#2ECC71";
      case "pending":
        return "#F39C12";
      case "failed":
        return "#E74C3C";
      default:
        return "#95A5A6";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "pending":
        return "Menunggu";
      case "failed":
        return "Gagal";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredActivities =
    selectedFilter === "all"
      ? activities
      : activities.filter((activity) => activity.type === selectedFilter);

  const renderFilter = ({ item }: { item: FilterItem }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.id && {
          backgroundColor: appConfig.primaryColor,
        },
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <IconComponent
        name={item.icon}
        size={16}
        color={
          selectedFilter === item.id ? "#fff" : appConfig.textSecondaryColor
        }
      />
      <Text
        style={[
          styles.filterText,
          {
            color:
              selectedFilter === item.id
                ? "#fff"
                : appConfig.textSecondaryColor,
          },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View
          style={[
            styles.activityIcon,
            { backgroundColor: getActivityColor(item.type) + "20" },
          ]}
        >
          <IconComponent
            name={getActivityIcon(item.type)}
            size={20}
            color={getActivityColor(item.type)}
          />
        </View>

        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDescription}>{item.description}</Text>
          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.activityStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {item.amount && (
            <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: appConfig.backgroundColor }]}
    >
      <CustomHeader
        title="Aktivitas"
        subtitle="Riwayat aktivitas Anda"
        showNotification={true}
        appConfig={appConfig}
        notificationCount={3}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <FlatList
            data={filters}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderFilter}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.filterContainer}
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <LinearGradientComponent
              colors={["#2ECC71", "#27AE60"]}
              style={styles.summaryCard}
            >
              <IconComponent name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.summaryNumber}>24</Text>
              <Text style={styles.summaryLabel}>Aktivitas Selesai</Text>
            </LinearGradientComponent>

            <LinearGradientComponent
              colors={["#F39C12", "#E67E22"]}
              style={styles.summaryCard}
            >
              <IconComponent name="time" size={24} color="#fff" />
              <Text style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>Menunggu</Text>
            </LinearGradientComponent>
          </View>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === "all"
              ? "Semua Aktivitas"
              : filters.find((f) => f.id === selectedFilter)?.title}
          </Text>

          <FlatList
            data={filteredActivities}
            renderItem={renderActivity}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginRight: 10,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },
  activitiesSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 11,
    color: "#95a5a6",
  },
  activityStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  amountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});

export default ActivityScreen;

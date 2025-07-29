import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
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

interface DonationCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  target: number;
  collected: number;
}

interface AppConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textSecondaryColor: string;
  textPrimaryColor: string;
  cardBackgroundColor: string;
}

interface DonationScreenProps {
  appConfig: AppConfig;
}

const DonationScreen: React.FC<DonationScreenProps> = ({ appConfig }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const donationCategories: DonationCategory[] = [
    {
      id: "1",
      title: "Pembangunan Masjid",
      description: "Bantuan untuk pembangunan masjid TPQ",
      icon: "business",
      color: "#2ECC71",
      target: 500000000,
      collected: 350000000,
    },
    {
      id: "2",
      title: "Beasiswa Santri",
      description: "Program beasiswa untuk santri kurang mampu",
      icon: "school",
      color: "#3498DB",
      target: 100000000,
      collected: 75000000,
    },
    {
      id: "3",
      title: "Operasional TPQ",
      description: "Bantuan operasional harian TPQ",
      icon: "home",
      color: "#F39C12",
      target: 50000000,
      collected: 30000000,
    },
    {
      id: "4",
      title: "Kegiatan Ramadhan",
      description: "Dana untuk kegiatan bulan Ramadhan",
      icon: "moon",
      color: "#9B59B6",
      target: 25000000,
      collected: 20000000,
    },
  ];

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  const renderDonationCategory = ({ item }: { item: DonationCategory }) => {
    const progress = calculateProgress(item.collected, item.target);

    return (
      <TouchableOpacity style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: item.color + "20" },
            ]}
          >
            <IconComponent name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{item.title}</Text>
            <Text style={styles.categoryDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.collectedAmount}>
              {formatCurrency(item.collected)}
            </Text>
            <Text style={styles.targetAmount}>
              dari {formatCurrency(item.target)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: item.color },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.toFixed(1)}% tercapai
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.donateButton, { backgroundColor: item.color }]}
        >
          <Text style={styles.donateButtonText}>Donasi Sekarang</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderQuickAmount = (amount: number) => (
    <TouchableOpacity
      key={amount}
      style={[
        styles.quickAmountButton,
        selectedAmount === amount && {
          backgroundColor: appConfig.primaryColor,
          borderColor: appConfig.primaryColor,
        },
      ]}
      onPress={() => {
        setSelectedAmount(amount);
        setCustomAmount("");
      }}
    >
      <Text
        style={[
          styles.quickAmountText,
          selectedAmount === amount && { color: "#fff" },
        ]}
      >
        {formatCurrency(amount)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: appConfig.backgroundColor }]}
    >
      <CustomHeader
        title="Donasi"
        subtitle="Berbagi kebaikan untuk TPQ"
        showNotification={true}
        appConfig={appConfig}
        notificationCount={3}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradientComponent
          colors={[appConfig.primaryColor, appConfig.secondaryColor]}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <IconComponent name="heart" size={40} color="#fff" />
            <Text style={styles.heroTitle}>Mari Berdonasi</Text>
            <Text style={styles.heroSubtitle}>
              Setiap donasi Anda akan membantu kemajuan TPQ Baitus Shuffah
            </Text>
          </View>
        </LinearGradientComponent>

        {/* Quick Donation */}
        <View style={styles.quickDonationSection}>
          <Text style={styles.sectionTitle}>Donasi Cepat</Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map(renderQuickAmount)}
          </View>

          <View style={styles.customAmountSection}>
            <Text style={styles.customAmountLabel}>
              Atau masukkan nominal lain:
            </Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="Masukkan nominal"
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.donateNowButton,
              { backgroundColor: appConfig.primaryColor },
            ]}
          >
            <Text style={styles.donateNowText}>Donasi Sekarang</Text>
            <IconComponent name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Donation Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Program Donasi</Text>
          <FlatList
            data={donationCategories}
            renderItem={renderDonationCategory}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Recent Donations */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Donasi Terbaru</Text>
          <View style={styles.recentDonation}>
            <View style={styles.donorInfo}>
              <View style={styles.donorAvatar}>
                <Text style={styles.donorInitial}>A</Text>
              </View>
              <View>
                <Text style={styles.donorName}>Ahmad Fauzi</Text>
                <Text style={styles.donationTime}>2 jam yang lalu</Text>
              </View>
            </View>
            <Text style={styles.donationAmount}>{formatCurrency(500000)}</Text>
          </View>

          <View style={styles.recentDonation}>
            <View style={styles.donorInfo}>
              <View style={styles.donorAvatar}>
                <Text style={styles.donorInitial}>S</Text>
              </View>
              <View>
                <Text style={styles.donorName}>Siti Aminah</Text>
                <Text style={styles.donationTime}>5 jam yang lalu</Text>
              </View>
            </View>
            <Text style={styles.donationAmount}>{formatCurrency(250000)}</Text>
          </View>
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
  heroSection: {
    margin: 20,
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 20,
  },
  quickDonationSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  quickAmountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickAmountButton: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 10,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  customAmountSection: {
    marginBottom: 20,
  },
  customAmountLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  customAmountInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  donateNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  donateNowText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#7f8c8d",
    lineHeight: 16,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  collectedAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  targetAmount: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e9ecef",
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#7f8c8d",
    textAlign: "right",
  },
  donateButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  recentDonation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  donorInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  donorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  donationTime: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  donationAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2ECC71",
  },
});

export default DonationScreen;

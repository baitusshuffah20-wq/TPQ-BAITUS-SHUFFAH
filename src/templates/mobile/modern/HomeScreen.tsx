import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Animated,
  RefreshControl,
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

const { width } = Dimensions.get("window");

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  backgroundColor: string[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  category: string;
}

interface AppConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textSecondaryColor: string;
  textPrimaryColor: string;
  cardBackgroundColor: string;
}

const HomeScreen = ({ appConfig }: { appConfig: AppConfig }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats] = useState({
    totalHafalan: 15,
    targetBulanIni: 20,
    kehadiran: 95,
    prestasi: 3,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample data - akan diganti dengan data dari API
  const banners: BannerItem[] = [
    {
      id: "1",
      title: "Selamat Datang di TPQ Baitus Shuffah",
      subtitle: "Rumah Tahfidz Al-Qur'an Terbaik untuk Putra-Putri Anda",
      image: "/images/banner1.jpg",
      backgroundColor: ["#667eea", "#764ba2"],
    },
    {
      id: "2",
      title: "Program Tahfidz Intensif",
      subtitle: "Metode pembelajaran yang efektif dan menyenangkan",
      image: "/images/banner2.jpg",
      backgroundColor: ["#f093fb", "#f5576c"],
    },
    {
      id: "3",
      title: "Prestasi Santri Terbaik",
      subtitle: "Bangga dengan pencapaian santri-santri berprestasi",
      image: "/images/banner3.jpg",
      backgroundColor: ["#4facfe", "#00f2fe"],
    },
  ];

  const menuItems: MenuItem[] = [
    {
      id: "1",
      title: "Dashboard",
      icon: "home",
      color: "#667eea",
      route: "Dashboard",
    },
    {
      id: "2",
      title: "Progress",
      icon: "trending-up",
      color: "#f093fb",
      route: "Progress",
    },
    {
      id: "3",
      title: "Pembayaran",
      icon: "card",
      color: "#4facfe",
      route: "Payment",
    },
    {
      id: "4",
      title: "Pesan",
      icon: "chatbubble",
      color: "#43e97b",
      route: "Messages",
    },
    {
      id: "5",
      title: "Profil",
      icon: "person",
      color: "#fa709a",
      route: "Profile",
    },
    {
      id: "6",
      title: "Absensi",
      icon: "checkmark-circle",
      color: "#ffecd2",
      route: "Attendance",
    },
    {
      id: "7",
      title: "Jadwal",
      icon: "calendar",
      color: "#a8edea",
      route: "Schedule",
    },
    {
      id: "8",
      title: "Prestasi",
      icon: "trophy",
      color: "#ffd89b",
      route: "Achievements",
    },
  ];

  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "Peringatan Maulid Nabi Muhammad SAW",
      subtitle:
        "Acara peringatan Maulid Nabi akan dilaksanakan pada tanggal 28 September 2024",
      image: "/images/news1.jpg",
      date: "2024-09-20",
      category: "Kegiatan",
    },
    {
      id: "2",
      title: "Wisuda Tahfidz Angkatan 15",
      subtitle:
        "Selamat kepada 25 santri yang berhasil menyelesaikan hafalan 30 juz",
      image: "/images/news2.jpg",
      date: "2024-09-18",
      category: "Prestasi",
    },
    {
      id: "3",
      title: "Program Beasiswa untuk Santri Berprestasi",
      subtitle:
        "TPQ membuka program beasiswa untuk santri yang berprestasi akademik",
      image: "/images/news3.jpg",
      date: "2024-09-15",
      category: "Pengumuman",
    },
  ];

  useEffect(() => {
    // Animasi masuk
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto banner slider
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderStatsCard = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.statsTitle}>Progress Anda</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <LinearGradientComponent
            colors={["#2ECC71", "#27AE60"]}
            style={styles.statCard}
          >
            <IconComponent name="book" size={20} color="#fff" />
            <Text style={styles.statNumber}>{userStats.totalHafalan}</Text>
            <Text style={styles.statLabel}>Juz Hafalan</Text>
          </LinearGradientComponent>
        </View>
        <View style={styles.statItem}>
          <LinearGradientComponent
            colors={["#3498DB", "#2980B9"]}
            style={styles.statCard}
          >
            <IconComponent name="target" size={20} color="#fff" />
            <Text style={styles.statNumber}>{userStats.targetBulanIni}</Text>
            <Text style={styles.statLabel}>Target Bulan</Text>
          </LinearGradientComponent>
        </View>
        <View style={styles.statItem}>
          <LinearGradientComponent
            colors={["#F39C12", "#E67E22"]}
            style={styles.statCard}
          >
            <IconComponent name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.statNumber}>{userStats.kehadiran}%</Text>
            <Text style={styles.statLabel}>Kehadiran</Text>
          </LinearGradientComponent>
        </View>
        <View style={styles.statItem}>
          <LinearGradientComponent
            colors={["#9B59B6", "#8E44AD"]}
            style={styles.statCard}
          >
            <IconComponent name="trophy" size={20} color="#fff" />
            <Text style={styles.statNumber}>{userStats.prestasi}</Text>
            <Text style={styles.statLabel}>Prestasi</Text>
          </LinearGradientComponent>
        </View>
      </View>
    </Animated.View>
  );

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <FlatList
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentBanner(index);
        }}
        renderItem={({ item }) => (
          <LinearGradientComponent
            colors={item.backgroundColor}
            style={[styles.banner, { width }]}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.bannerImageContainer}>
              <IconComponent
                name="book"
                size={80}
                color="rgba(255,255,255,0.3)"
              />
            </View>
          </LinearGradientComponent>
        )}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.bannerIndicator}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentBanner ? "#fff" : "rgba(255,255,255,0.5)",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity style={styles.menuItem}>
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: item.color + "20" },
        ]}
      >
        <IconComponent name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.menuText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.newsItem}>
      <View style={styles.newsImageContainer}>
        <LinearGradientComponent
          colors={["#667eea", "#764ba2"]}
          style={styles.newsImagePlaceholder}
        >
          <IconComponent name="newspaper" size={24} color="#fff" />
        </LinearGradientComponent>
      </View>
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsCategory}>{item.category}</Text>
          <Text style={styles.newsDate}>
            {new Date(item.date).toLocaleDateString("id-ID")}
          </Text>
        </View>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={appConfig.primaryColor}
      />

      {/* Header */}
      <LinearGradientComponent
        colors={[appConfig.primaryColor, appConfig.secondaryColor]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Assalamu'alaikum</Text>
            <Text style={styles.userName}>Ahmad Fauzi</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <IconComponent name="notifications" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradientComponent>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[appConfig.primaryColor]}
            tintColor={appConfig.primaryColor}
          />
        }
      >
        {/* Banner Slider */}
        {renderBanner()}

        {/* Stats Cards */}
        {renderStatsCard()}

        {/* Quick Actions */}
        <Animated.View
          style={[styles.quickActionsSection, { opacity: fadeAnim }]}
        >
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: "#2ECC71" + "15" },
              ]}
            >
              <IconComponent name="add-circle" size={24} color="#2ECC71" />
              <Text style={[styles.quickActionText, { color: "#2ECC71" }]}>
                Setor Hafalan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: "#3498DB" + "15" },
              ]}
            >
              <IconComponent name="calendar" size={24} color="#3498DB" />
              <Text style={[styles.quickActionText, { color: "#3498DB" }]}>
                Jadwal Hari Ini
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: "#F39C12" + "15" },
              ]}
            >
              <IconComponent name="card" size={24} color="#F39C12" />
              <Text style={[styles.quickActionText, { color: "#F39C12" }]}>
                Bayar SPP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: "#9B59B6" + "15" },
              ]}
            >
              <IconComponent name="chatbubble" size={24} color="#9B59B6" />
              <Text style={[styles.quickActionText, { color: "#9B59B6" }]}>
                Chat Ustadz
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Menu Grid */}
        <Animated.View style={[styles.menuSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Menu Utama</Text>
          <FlatList
            data={menuItems}
            numColumns={4}
            scrollEnabled={false}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.menuGrid}
          />
        </Animated.View>

        {/* News Section */}
        <Animated.View style={[styles.newsSection, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Berita Terkini</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={newsItems}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4757",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: 12,
  },
  statCard: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  bannerContainer: {
    height: 180,
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  banner: {
    height: 180,
    justifyContent: "space-between",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  bannerImageContainer: {
    marginLeft: 20,
  },
  bannerIndicator: {
    position: "absolute",
    bottom: 15,
    left: 20,
    flexDirection: "row",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  menuSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  menuGrid: {
    paddingBottom: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
    maxWidth: width / 4,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuText: {
    fontSize: 12,
    color: "#2c3e50",
    textAlign: "center",
    fontWeight: "500",
  },
  newsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  newsItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  newsImageContainer: {
    marginRight: 15,
  },
  newsImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  newsCategory: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "500",
  },
  newsDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
    lineHeight: 18,
  },
  newsSubtitle: {
    fontSize: 12,
    color: "#7f8c8d",
    lineHeight: 16,
  },
});

export default HomeScreen;

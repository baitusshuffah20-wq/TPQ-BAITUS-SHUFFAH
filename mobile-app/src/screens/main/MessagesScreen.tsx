import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Card from "../../components/ui/Card";
import {
  Heading3,
  Heading4,
  Body1,
  Body2,
  Caption,
} from "../../components/ui/Typography";
import { SPACING, BORDER_RADIUS } from "../../constants/theme";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: "ustadz" | "admin" | "system";
    avatar?: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
  type: "personal" | "announcement" | "notification";
  santriId?: string;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    role: "ustadz" | "admin";
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unreadCount: number;
  santriId?: string;
  santriName?: string;
}

const MessagesScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [announcements, setAnnouncements] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<"conversations" | "announcements">(
    "conversations",
  );

  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setConversations([
        {
          id: "1",
          participant: {
            id: "ustadz1",
            name: "Ustadz Ahmad",
            role: "ustadz",
          },
          lastMessage: {
            content:
              "Alhamdulillah, Ahmad sudah menyelesaikan hafalan Al-Baqarah ayat 150-155",
            timestamp: "2024-02-10 14:30",
            sender: "ustadz1",
          },
          unreadCount: 2,
          santriId: "santri1",
          santriName: "Ahmad Fauzi",
        },
        {
          id: "2",
          participant: {
            id: "admin1",
            name: "Admin TPQ",
            role: "admin",
          },
          lastMessage: {
            content:
              "Pembayaran SPP bulan Februari telah diterima. Terima kasih.",
            timestamp: "2024-02-09 10:15",
            sender: "admin1",
          },
          unreadCount: 0,
        },
        {
          id: "3",
          participant: {
            id: "ustadz2",
            name: "Ustadzah Fatimah",
            role: "ustadz",
          },
          lastMessage: {
            content: "Siti Aisyah menunjukkan progress yang baik dalam tajwid",
            timestamp: "2024-02-08 16:45",
            sender: "ustadz2",
          },
          unreadCount: 1,
          santriId: "santri2",
          santriName: "Siti Aisyah",
        },
      ]);

      setAnnouncements([
        {
          id: "1",
          sender: {
            id: "admin",
            name: "Admin TPQ",
            role: "admin",
          },
          content:
            "Libur Hari Raya Idul Fitri akan dimulai tanggal 10-17 April 2024. Kegiatan TPQ akan kembali normal pada tanggal 18 April 2024.",
          timestamp: "2024-02-10 08:00",
          read: false,
          type: "announcement",
        },
        {
          id: "2",
          sender: {
            id: "system",
            name: "Sistem TPQ",
            role: "system",
          },
          content:
            "Reminder: Pembayaran SPP bulan Februari akan jatuh tempo pada tanggal 15 Februari 2024.",
          timestamp: "2024-02-08 07:00",
          read: true,
          type: "notification",
        },
        {
          id: "3",
          sender: {
            id: "admin",
            name: "Admin TPQ",
            role: "admin",
          },
          content:
            "Kegiatan Khataman Al-Quran akan dilaksanakan pada hari Sabtu, 17 Februari 2024 pukul 08:00 WIB. Diharapkan kehadiran seluruh wali santri.",
          timestamp: "2024-02-07 15:30",
          read: true,
          type: "announcement",
        },
      ]);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ustadz":
        return "person-circle";
      case "admin":
        return "shield-checkmark";
      case "system":
        return "settings";
      default:
        return "person";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ustadz":
        return colors.islamic;
      case "admin":
        return colors.primary;
      case "system":
        return colors.secondary;
      default:
        return colors.gray400;
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    // Navigate to chat screen
    console.log("Open conversation:", conversation.id);
  };

  const renderHeader = () => (
    <LinearGradient colors={colors.gradientPrimary} style={styles.header}>
      <View style={styles.headerContent}>
        <Heading3 color={colors.white}>Pesan</Heading3>
        <Body2 color={colors.white} style={styles.headerSubtitle}>
          Komunikasi dengan ustadz dan admin TPQ
        </Body2>
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("conversations")}
        style={[styles.tab, activeTab === "conversations" && styles.tabActive]}
      >
        <Body1
          color={
            activeTab === "conversations"
              ? colors.primary
              : colors.textSecondary
          }
          weight={activeTab === "conversations" ? "semiBold" : "regular"}
        >
          Percakapan ({conversations.length})
        </Body1>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("announcements")}
        style={[styles.tab, activeTab === "announcements" && styles.tabActive]}
      >
        <Body1
          color={
            activeTab === "announcements"
              ? colors.primary
              : colors.textSecondary
          }
          weight={activeTab === "announcements" ? "semiBold" : "regular"}
        >
          Pengumuman ({announcements.filter((a) => !a.read).length})
        </Body1>
      </TouchableOpacity>
    </View>
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity onPress={() => handleConversationPress(item)}>
      <Card variant="flat" style={styles.conversationCard}>
        <View style={styles.conversationContent}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name={getRoleIcon(item.participant.role)}
              size={40}
              color={getRoleColor(item.participant.role)}
            />
          </View>

          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Body1
                color={colors.textPrimary}
                weight="semiBold"
                numberOfLines={1}
              >
                {item.participant.name}
              </Body1>
              <Caption color={colors.textSecondary}>
                {formatTime(item.lastMessage.timestamp)}
              </Caption>
            </View>

            {item.santriName && (
              <Caption color={colors.textSecondary} style={styles.santriName}>
                Tentang: {item.santriName}
              </Caption>
            )}

            <Body2
              color={colors.textSecondary}
              numberOfLines={2}
              style={styles.lastMessage}
            >
              {item.lastMessage.content}
            </Body2>
          </View>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Caption color={colors.white} style={styles.unreadText}>
                {item.unreadCount}
              </Caption>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderAnnouncementItem = ({ item }: { item: Message }) => (
    <Card
      variant={item.read ? "flat" : "default"}
      style={styles.announcementCard}
    >
      <View style={styles.announcementHeader}>
        <View style={styles.announcementSender}>
          <Ionicons
            name={getRoleIcon(item.sender.role)}
            size={20}
            color={getRoleColor(item.sender.role)}
          />
          <Body2
            color={colors.textPrimary}
            weight="medium"
            style={styles.senderName}
          >
            {item.sender.name}
          </Body2>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  item.type === "announcement" ? colors.info : colors.warning,
              },
            ]}
          >
            <Caption color={colors.white}>
              {item.type === "announcement" ? "Pengumuman" : "Notifikasi"}
            </Caption>
          </View>
        </View>
        <Caption color={colors.textSecondary}>
          {formatTime(item.timestamp)}
        </Caption>
      </View>

      <Body2 color={colors.textPrimary} style={styles.announcementContent}>
        {item.content}
      </Body2>

      {!item.read && <View style={styles.unreadIndicator} />}
    </Card>
  );

  const renderConversations = () => (
    <FlatList
      data={conversations}
      renderItem={renderConversationItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );

  const renderAnnouncements = () => (
    <FlatList
      data={announcements}
      renderItem={renderAnnouncementItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderHeader()}
      {renderTabs()}
      <View style={styles.content}>
        {activeTab === "conversations"
          ? renderConversations()
          : renderAnnouncements()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: "center",
  },
  headerSubtitle: {
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING["2xl"],
  },
  conversationCard: {
    marginBottom: SPACING.md,
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  santriName: {
    marginBottom: SPACING.xs,
  },
  lastMessage: {
    marginTop: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.sm,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  announcementCard: {
    marginBottom: SPACING.md,
    position: "relative",
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  announcementSender: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  senderName: {
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  announcementContent: {
    lineHeight: 20,
  },
  unreadIndicator: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
});

export default MessagesScreen;

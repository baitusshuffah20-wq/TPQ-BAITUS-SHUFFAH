import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
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

import CustomHeader from "../components/CustomHeader";

interface Message {
  id: string;
  sender: string;
  senderRole: "ustadz" | "admin" | "system";
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  category: "announcement" | "personal" | "payment" | "achievement";
}

interface AppConfig {
  primaryColor: string;
  backgroundColor: string;
  textSecondaryColor: string;
}

interface CategoryItem {
  id: string;
  title: string;
  icon: string;
  count: number;
}

interface InboxScreenProps {
  appConfig: AppConfig;
}

const InboxScreen: React.FC<InboxScreenProps> = ({ appConfig }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const messages: Message[] = [
    {
      id: "1",
      sender: "Ustadz Ahmad",
      senderRole: "ustadz",
      subject: "Perbaikan Hafalan Surah Al-Baqarah",
      message:
        "Assalamu'alaikum, untuk hafalan Surah Al-Baqarah ayat 10-20 perlu diperbaiki lagi. Silakan datang ke ruang ustadz setelah sholat Maghrib.",
      timestamp: "2024-09-20T14:30:00Z",
      isRead: false,
      isImportant: true,
      category: "personal",
    },
    {
      id: "2",
      sender: "Admin TPQ",
      senderRole: "admin",
      subject: "Pembayaran SPP Bulan Oktober",
      message:
        "Reminder pembayaran SPP bulan Oktober. Batas pembayaran tanggal 10 Oktober 2024.",
      timestamp: "2024-09-19T10:00:00Z",
      isRead: true,
      isImportant: false,
      category: "payment",
    },
    {
      id: "3",
      sender: "Sistem TPQ",
      senderRole: "system",
      subject: "Selamat! Anda Meraih Prestasi",
      message:
        "Selamat atas pencapaian hafalan 15 juz Al-Qur'an. Semoga terus istiqomah dalam menghafal.",
      timestamp: "2024-09-18T16:45:00Z",
      isRead: false,
      isImportant: false,
      category: "achievement",
    },
    {
      id: "4",
      sender: "Admin TPQ",
      senderRole: "admin",
      subject: "Pengumuman Libur Hari Raya",
      message:
        "TPQ akan libur pada tanggal 28-30 September 2024 dalam rangka peringatan Maulid Nabi Muhammad SAW.",
      timestamp: "2024-09-17T09:00:00Z",
      isRead: true,
      isImportant: true,
      category: "announcement",
    },
  ];

  const categories = [
    { id: "all", title: "Semua", icon: "mail", count: messages.length },
    {
      id: "personal",
      title: "Personal",
      icon: "person",
      count: messages.filter((m) => m.category === "personal").length,
    },
    {
      id: "announcement",
      title: "Pengumuman",
      icon: "megaphone",
      count: messages.filter((m) => m.category === "announcement").length,
    },
    {
      id: "payment",
      title: "Pembayaran",
      icon: "card",
      count: messages.filter((m) => m.category === "payment").length,
    },
    {
      id: "achievement",
      title: "Prestasi",
      icon: "trophy",
      count: messages.filter((m) => m.category === "achievement").length,
    },
  ];

  const getSenderIcon = (role: string) => {
    switch (role) {
      case "ustadz":
        return "person-circle";
      case "admin":
        return "shield-checkmark";
      case "system":
        return "settings";
      default:
        return "mail";
    }
  };

  const getSenderColor = (role: string) => {
    switch (role) {
      case "ustadz":
        return "#2ECC71";
      case "admin":
        return "#3498DB";
      case "system":
        return "#9B59B6";
      default:
        return "#95A5A6";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMessages = messages.filter((message) => {
    const matchesCategory =
      selectedCategory === "all" || message.category === selectedCategory;
    const matchesSearch =
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && {
          backgroundColor: appConfig.primaryColor,
        },
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <IconComponent
        name={item.icon}
        size={16}
        color={
          selectedCategory === item.id ? "#fff" : appConfig.textSecondaryColor
        }
      />
      <Text
        style={[
          styles.categoryText,
          {
            color:
              selectedCategory === item.id
                ? "#fff"
                : appConfig.textSecondaryColor,
          },
        ]}
      >
        {item.title}
      </Text>
      {item.count > 0 && (
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor:
                selectedCategory === item.id ? "#fff" : appConfig.primaryColor,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryBadgeText,
              {
                color:
                  selectedCategory === item.id
                    ? appConfig.primaryColor
                    : "#fff",
              },
            ]}
          >
            {item.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[styles.messageCard, !item.isRead && styles.unreadMessage]}
      onPress={() => {
        setSelectedMessage(item);
        setShowMessageModal(true);
      }}
    >
      <View style={styles.messageHeader}>
        <View style={styles.senderInfo}>
          <View
            style={[
              styles.senderIcon,
              { backgroundColor: getSenderColor(item.senderRole) + "20" },
            ]}
          >
            <IconComponent
              name={getSenderIcon(item.senderRole)}
              size={20}
              color={getSenderColor(item.senderRole)}
            />
          </View>
          <View style={styles.senderDetails}>
            <Text
              style={[styles.senderName, !item.isRead && styles.unreadText]}
            >
              {item.sender}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
        <View style={styles.messageStatus}>
          {item.isImportant && (
            <IconComponent name="star" size={16} color="#F39C12" />
          )}
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>

      <Text
        style={[styles.messageSubject, !item.isRead && styles.unreadText]}
        numberOfLines={1}
      >
        {item.subject}
      </Text>
      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  const renderMessageModal = () => (
    <Modal
      visible={showMessageModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowMessageModal(false)}
          >
            <IconComponent name="close" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Pesan</Text>
          <TouchableOpacity style={styles.modalActionButton}>
            <IconComponent name="star-outline" size={24} color="#F39C12" />
          </TouchableOpacity>
        </View>

        {selectedMessage && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalMessageHeader}>
              <View style={styles.modalSenderInfo}>
                <View
                  style={[
                    styles.modalSenderIcon,
                    {
                      backgroundColor:
                        getSenderColor(selectedMessage.senderRole) + "20",
                    },
                  ]}
                >
                  <IconComponent
                    name={getSenderIcon(selectedMessage.senderRole)}
                    size={24}
                    color={getSenderColor(selectedMessage.senderRole)}
                  />
                </View>
                <View>
                  <Text style={styles.modalSenderName}>
                    {selectedMessage.sender}
                  </Text>
                  <Text style={styles.modalTimestamp}>
                    {formatTimestamp(selectedMessage.timestamp)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.modalSubject}>{selectedMessage.subject}</Text>
            <Text style={styles.modalMessage}>{selectedMessage.message}</Text>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: appConfig.backgroundColor }]}
    >
      <CustomHeader
        title="Inbox"
        subtitle={`${unreadCount} pesan belum dibaca`}
        showNotification={false}
        showSearch={true}
        appConfig={appConfig}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconComponent name="search" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari pesan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {renderMessageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#2c3e50",
  },
  categoriesSection: {
    paddingBottom: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  categoryBadge: {
    marginLeft: 6,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageCard: {
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
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  senderIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  timestamp: {
    fontSize: 11,
    color: "#7f8c8d",
    marginTop: 2,
  },
  messageStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667eea",
    marginLeft: 8,
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 12,
    color: "#7f8c8d",
    lineHeight: 16,
  },
  unreadText: {
    fontWeight: "bold",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalActionButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalMessageHeader: {
    marginBottom: 20,
  },
  modalSenderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalSenderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  modalSenderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalTimestamp: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  modalSubject: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    lineHeight: 24,
  },
  modalMessage: {
    fontSize: 14,
    color: "#2c3e50",
    lineHeight: 22,
  },
});

export default InboxScreen;

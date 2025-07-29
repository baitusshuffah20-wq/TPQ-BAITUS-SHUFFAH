import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  date: string;
  category: string;
  author?: string;
  readTime?: string;
  isBookmarked?: boolean;
}

interface NewsCardProps {
  newsItems: NewsItem[];
  onNewsPress: (item: NewsItem) => void;
  onBookmarkPress?: (item: NewsItem) => void;
  title?: string;
  showTitle?: boolean;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
  cardType?: "horizontal" | "vertical";
}

const NewsCard: React.FC<NewsCardProps> = ({
  newsItems,
  onNewsPress,
  onBookmarkPress,
  title = "Berita Terkini",
  showTitle = true,
  showSeeAll = true,
  onSeeAllPress,
  cardType = "horizontal",
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderHorizontalCard = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.horizontalCard}
      onPress={() => onNewsPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.newsImage} />
        ) : (
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.imagePlaceholder}
          >
            <Ionicons name="newspaper" size={24} color="#fff" />
          </LinearGradient>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.newsHeader}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <View style={styles.metaContainer}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            {item.readTime && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.readTime}>{item.readTime}</Text>
              </>
            )}
          </View>
        </View>

        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.newsSubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>

        <View style={styles.footer}>
          {item.author && <Text style={styles.author}>By {item.author}</Text>}
          {onBookmarkPress && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => onBookmarkPress(item)}
            >
              <Ionicons
                name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={16}
                color={item.isBookmarked ? "#667eea" : "#7f8c8d"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVerticalCard = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={() => onNewsPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.verticalImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.verticalImage} />
        ) : (
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.verticalImagePlaceholder}
          >
            <Ionicons name="newspaper" size={32} color="#fff" />
          </LinearGradient>
        )}
        {onBookmarkPress && (
          <TouchableOpacity
            style={styles.verticalBookmark}
            onPress={() => onBookmarkPress(item)}
          >
            <Ionicons
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={16}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.verticalContent}>
        <View style={styles.newsHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>

        <Text style={styles.verticalTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.verticalSubtitle} numberOfLines={3}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (!showTitle) return null;

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={newsItems}
        renderItem={
          cardType === "horizontal" ? renderHorizontalCard : renderVerticalCard
        }
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },

  // Horizontal Card Styles
  horizontalCard: {
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
  imageContainer: {
    marginRight: 15,
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryContainer: {
    backgroundColor: "#667eea20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  category: {
    fontSize: 11,
    color: "#667eea",
    fontWeight: "600",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 11,
    color: "#7f8c8d",
  },
  separator: {
    fontSize: 11,
    color: "#7f8c8d",
    marginHorizontal: 4,
  },
  readTime: {
    fontSize: 11,
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
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  author: {
    fontSize: 11,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  bookmarkButton: {
    padding: 4,
  },

  // Vertical Card Styles
  verticalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  verticalImageContainer: {
    position: "relative",
    height: 120,
  },
  verticalImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f9fa",
  },
  verticalImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  verticalBookmark: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  verticalContent: {
    padding: 15,
  },
  verticalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 20,
  },
  verticalSubtitle: {
    fontSize: 13,
    color: "#7f8c8d",
    lineHeight: 18,
  },
});

export default NewsCard;

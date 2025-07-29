import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
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

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  badge?: number;
  isNew?: boolean;
}

interface MenuGridProps {
  menuItems: MenuItem[];
  numColumns?: number;
  onMenuPress: (item: MenuItem) => void;
  title?: string;
  showTitle?: boolean;
}

const MenuGrid: React.FC<MenuGridProps> = ({
  menuItems,
  numColumns = 4,
  onMenuPress,
  title = "Menu Utama",
  showTitle = true,
}) => {
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={[styles.menuItem, { maxWidth: width / numColumns }]}
      onPress={() => onMenuPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <LinearGradientComponent
          colors={[item.color + "20", item.color + "10"]}
          style={styles.iconBackground}
        >
          <IconComponent name={item.icon} size={24} color={item.color} />
        </LinearGradientComponent>

        {/* Badge for notifications */}
        {item.badge && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.badge > 99 ? "99+" : item.badge.toString()}
            </Text>
          </View>
        )}

        {/* New indicator */}
        {item.isNew && (
          <View style={styles.newIndicator}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>

      <Text style={styles.menuText} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.sectionTitle}>{title}</Text>}

      <FlatList
        data={menuItems}
        numColumns={numColumns}
        scrollEnabled={false}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuGrid}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 30,
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
  row: {
    justifyContent: "space-around",
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  menuIconContainer: {
    position: "relative",
    marginBottom: 8,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4757",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  newIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  menuText: {
    fontSize: 12,
    color: "#2c3e50",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 16,
  },
});

export default MenuGrid;

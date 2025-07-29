import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from "react-native";

// LinearGradient component fallback for when expo-linear-gradient is not available
// In a real React Native project, replace this with:
// import { LinearGradient } from 'expo-linear-gradient';
const LinearGradientComponent: React.FC<{
  colors: string[];
  style?: object;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}> = ({ colors, style, children }) => (
  <View style={[{ backgroundColor: colors[0] }, style]}>{children}</View>
);

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

const { width } = Dimensions.get("window");

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  backgroundColor: string[];
  buttonText?: string;
  onPress?: () => void;
}

interface BannerSliderProps {
  banners: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  height?: number;
}

const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 4000,
  showIndicators = true,
  height = 180,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (autoPlay && banners.length > 1 && !isPaused) {
      const timer = setInterval(() => {
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          const nextIndex = (currentIndex + 1) % banners.length;
          setCurrentIndex(nextIndex);
          scrollViewRef.current?.scrollTo({
            x: nextIndex * width,
            animated: true,
          });

          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, autoPlayInterval);

      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlay, autoPlayInterval, banners.length, isPaused]);

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const renderBanner = (item: BannerItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.bannerContainer, { width }]}
      onPress={item.onPress}
      onPressIn={() => setIsPaused(true)}
      onPressOut={() => setIsPaused(false)}
      activeOpacity={0.9}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <LinearGradientComponent
          colors={item.backgroundColor}
          style={[styles.banner, { height }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={3}>
                {item.subtitle}
              </Text>
              {item.buttonText && (
                <TouchableOpacity style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
                  <IconComponent name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.imageContainer}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.bannerImage}
                />
              ) : (
                <View style={styles.iconPlaceholder}>
                  <IconComponent
                    name="book"
                    size={60}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Progress bar for current banner */}
          {autoPlay && index === currentIndex && (
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { backgroundColor: "rgba(255,255,255,0.5)" },
                ]}
              />
            </View>
          )}
        </LinearGradientComponent>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderIndicators = () => {
    if (!showIndicators || banners.length <= 1) return null;

    return (
      <View style={styles.indicatorContainer}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
                width: index === currentIndex ? 20 : 8,
              },
            ]}
            onPress={() => {
              setCurrentIndex(index);
              scrollViewRef.current?.scrollTo({
                x: index * width,
                animated: true,
              });
            }}
          />
        ))}
      </View>
    );
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { height: height + 40 }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {banners.map(renderBanner)}
      </ScrollView>
      {renderIndicators()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    overflow: "hidden",
  },
  banner: {
    justifyContent: "center",
    padding: 20,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    paddingRight: 15,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 15,
  },
  bannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 15,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    // Note: CSS transitions are not supported in React Native StyleSheet
    // Use Animated API for animations instead
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressBar: {
    height: "100%",
    borderRadius: 1.5,
  },
});

export default BannerSlider;

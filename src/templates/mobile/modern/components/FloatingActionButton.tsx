import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
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
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}> = ({ colors, style, children }) => (
  <View style={[{ backgroundColor: colors[0] }, style]}>{children}</View>
);

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
  colors?: string[];
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  bottom?: number;
  right?: number;
  left?: number;
  animated?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = "add",
  size = 56,
  colors = ["#667eea", "#764ba2"],
  position = "bottom-right",
  bottom = 100,
  right = 20,
  left = 20,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Entrance animation
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [animated]);

  const handlePress = () => {
    if (animated) {
      // Press animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    onPress();
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      bottom,
    };

    switch (position) {
      case "bottom-left":
        return { ...baseStyle, left };
      case "bottom-center": {
        const { width } = Dimensions.get("window");
        return { ...baseStyle, left: width / 2 - size / 2 };
      }
      case "bottom-right":
      default:
        return { ...baseStyle, right };
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        getPositionStyle(),
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradientComponent
          colors={colors}
          style={[
            styles.gradient,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              animated && { transform: [{ rotate: rotation }] },
            ]}
          >
            <IconComponent name={icon} size={size * 0.4} color="#fff" />
          </Animated.View>
        </LinearGradientComponent>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  gradient: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FloatingActionButton;

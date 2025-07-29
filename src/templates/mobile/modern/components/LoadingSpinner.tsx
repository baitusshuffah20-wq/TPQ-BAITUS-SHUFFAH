import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

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

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  colors?: string[];
  overlay?: boolean;
  visible?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  colors = ["#667eea", "#764ba2"],
  overlay = false,
  visible = true,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  const getSizeValue = () => {
    switch (size) {
      case "small":
        return 24;
      case "large":
        return 64;
      case "medium":
      default:
        return 40;
    }
  };

  const sizeValue = getSizeValue();

  useEffect(() => {
    if (visible) {
      // Scale in animation
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();

      // Continuous spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      spinAnimation.start();

      return () => {
        spinAnimation.stop();
      };
    } else {
      // Scale out animation
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  const spinnerContent = (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }, { rotate: spin }],
        },
      ]}
    >
      <LinearGradientComponent
        colors={colors}
        style={[
          styles.spinner,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: sizeValue * 0.7,
              height: sizeValue * 0.7,
              borderRadius: (sizeValue * 0.7) / 2,
            },
          ]}
        />
      </LinearGradientComponent>
    </Animated.View>
  );

  if (overlay) {
    return <View style={styles.overlay}>{spinnerContent}</View>;
  }

  return spinnerContent;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    backgroundColor: "#fff",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default LoadingSpinner;

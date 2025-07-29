import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  placeholderColor?: string;
  iconColor?: string;
  borderRadius?: number;
  height?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Cari...",
  value = "",
  onChangeText,
  onSearch,
  onFocus,
  onBlur,
  autoFocus = false,
  showCancel = false,
  onCancel,
  backgroundColor = "#fff",
  borderColor = "#e9ecef",
  textColor = "#2c3e50",
  placeholderColor = "#7f8c8d",
  iconColor = "#7f8c8d",
  borderRadius = 10,
  height = 45,
  marginHorizontal = 20,
  marginVertical = 10,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const animatedWidth = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  useEffect(() => {
    if (isFocused && showCancel) {
      Animated.parallel([
        Animated.timing(animatedWidth, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedWidth, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, showCancel]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    setSearchText(text);
    onChangeText?.(text);
  };

  const handleSearch = () => {
    onSearch?.(searchText);
    Keyboard.dismiss();
  };

  const handleCancel = () => {
    setSearchText("");
    setIsFocused(false);
    inputRef.current?.blur();
    onCancel?.();
    onChangeText?.("");
  };

  const handleClear = () => {
    setSearchText("");
    onChangeText?.("");
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { marginHorizontal, marginVertical }]}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor,
            borderColor: isFocused ? "#667eea" : borderColor,
            borderRadius,
            height,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      >
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={20} color={iconColor} />
        </View>

        <TextInput
          ref={inputRef}
          style={[styles.textInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={searchText}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never"
        />

        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {showCancel && (
        <Animated.View
          style={[styles.cancelContainer, { opacity: animatedOpacity }]}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close" size={20} color={iconColor} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 10,
    padding: 2,
  },
  cancelContainer: {
    marginLeft: 10,
  },
  cancelButton: {
    padding: 10,
  },
});

export default SearchBar;

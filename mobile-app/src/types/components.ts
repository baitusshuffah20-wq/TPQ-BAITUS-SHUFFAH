import { ViewStyle, TextStyle } from "react-native";

// Button Component Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

// Card Component Types
export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "flat" | "gradient";
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  onPress?: () => void;
}

// Typography Component Types
export interface TypographyProps {
  children: React.ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body1"
    | "body2"
    | "caption"
    | "overline";
  color?: string;
  align?: "left" | "center" | "right";
  weight?: "regular" | "medium" | "semiBold" | "bold";
  style?: TextStyle;
  numberOfLines?: number;
}

// Input Component Types
export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// Modal Component Types
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  animationType?: "slide" | "fade" | "none";
  transparent?: boolean;
  style?: ViewStyle;
}

// Loading Component Types
export interface LoadingProps {
  visible: boolean;
  text?: string;
  overlay?: boolean;
  size?: "small" | "large";
  color?: string;
}

// Avatar Component Types
export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

// Badge Component Types
export interface BadgeProps {
  count?: number;
  text?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Progress Bar Component Types
export interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  showText?: boolean;
  style?: ViewStyle;
}

// Skeleton Component Types
export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

// Empty State Component Types
export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

// Error Boundary Component Types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
}

// Search Bar Component Types
export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// Tab Component Types
export interface TabProps {
  tabs: Array<{
    key: string;
    title: string;
    icon?: string;
  }>;
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: ViewStyle;
}

// List Item Component Types
export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// Swipe Action Component Types
export interface SwipeActionProps {
  children: React.ReactNode;
  leftActions?: Array<{
    text: string;
    color: string;
    onPress: () => void;
  }>;
  rightActions?: Array<{
    text: string;
    color: string;
    onPress: () => void;
  }>;
}

// Pull to Refresh Component Types
export interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  tintColor?: string;
  title?: string;
}

// Floating Action Button Types
export interface FABProps {
  icon: string;
  onPress: () => void;
  size?: "small" | "medium" | "large";
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

// Header Component Types
export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

// Bottom Sheet Component Types
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
  style?: ViewStyle;
}

// Calendar Component Types
export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  markedDates?: { [key: string]: any };
  style?: ViewStyle;
}

// Chart Component Types
export interface ChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type?: "line" | "bar" | "pie" | "doughnut";
  width?: number;
  height?: number;
  style?: ViewStyle;
}

// Image Picker Component Types
export interface ImagePickerProps {
  onImageSelect: (uri: string) => void;
  multiple?: boolean;
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
}

// File Picker Component Types
export interface FilePickerProps {
  onFileSelect: (file: { uri: string; name: string; type: string }) => void;
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface MobileComponent {
  id: string;
  name: string;
  category: "layout" | "input" | "display" | "navigation" | "media";
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  previewComponent: React.ComponentType<any>;
  configSchema: ComponentConfigSchema[];
}

export interface ComponentConfigSchema {
  key: string;
  label: string;
  type:
    | "text"
    | "number"
    | "color"
    | "select"
    | "boolean"
    | "slider"
    | "textarea";
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

export interface CanvasElement {
  id: string;
  type: string;
  props: Record<string, any>;
  children: CanvasElement[];
  position: {
    x: number;
    y: number;
  };
  size: {
    width: string | number;
    height: string | number;
  };
  style?: React.CSSProperties;
}

export interface BuilderState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  draggedElementId: string | null;
  canvasSettings: CanvasSettings;
  appSettings: AppSettings;
}

export interface CanvasSettings {
  deviceType: "mobile" | "tablet";
  orientation: "portrait" | "landscape";
  width: number;
  height: number;
  backgroundColor: string;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface AppSettings {
  name: string;
  version: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  theme: "light" | "dark" | "auto";
  statusBarStyle: "default" | "light-content" | "dark-content";
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: MobileComponent[];
}

export interface DragData {
  type: "component" | "canvas-element";
  componentType?: string;
  elementId?: string;
  defaultProps?: Record<string, any>;
}

export interface ExportOptions {
  format: "react-native" | "expo" | "template";
  includeAssets: boolean;
  includeStyles: boolean;
  minify: boolean;
  typescript: boolean;
}

export interface PreviewOptions {
  device: "iphone" | "android" | "tablet";
  orientation: "portrait" | "landscape";
  showStatusBar: boolean;
  showNavigationBar: boolean;
}

// Component-specific prop types
export interface HeaderProps {
  title: string;
  backgroundColor: string;
  textColor: string;
  height: number;
  showBackButton: boolean;
  showMenuButton: boolean;
  elevation: number;
}

export interface ButtonProps {
  text: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  padding: number;
  fontSize: number;
  fontWeight:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  disabled: boolean;
  fullWidth: boolean;
  variant: "solid" | "outline" | "ghost";
  size: "small" | "medium" | "large";
}

export interface TextProps {
  content: string;
  fontSize: number;
  fontWeight:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  color: string;
  textAlign: "left" | "center" | "right" | "justify";
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface ImageProps {
  source: string;
  width: string | number;
  height: string | number;
  borderRadius: number;
  resizeMode: "cover" | "contain" | "stretch" | "repeat" | "center";
  opacity: number;
}

export interface CardProps {
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  margin: number;
  elevation: number;
  borderWidth: number;
  borderColor: string;
}

export interface ListProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
  }>;
  itemHeight: number;
  showDivider: boolean;
  dividerColor: string;
  backgroundColor: string;
  selectable: boolean;
}

export interface InputProps {
  placeholder: string;
  value: string;
  multiline: boolean;
  numberOfLines: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  placeholderColor: string;
}

export interface ContainerProps {
  backgroundColor: string;
  padding: number;
  margin: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  flexDirection: "row" | "column";
  justifyContent:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  flex: number;
}

export interface NavigationProps {
  type: "tab" | "drawer" | "stack";
  backgroundColor: string;
  activeColor: string;
  inactiveColor: string;
  showLabels: boolean;
  position: "top" | "bottom";
  items: Array<{ id: string; label: string; icon: string; screen: string }>;
}

// Template types
export interface MobileTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  elements: CanvasElement[];
  settings: AppSettings;
  tags: string[];
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: MobileTemplate[];
}

// Builder events
export interface BuilderEvent {
  type:
    | "element-added"
    | "element-removed"
    | "element-updated"
    | "element-selected"
    | "canvas-updated";
  payload: any;
  timestamp: number;
}

export interface BuilderHistory {
  states: BuilderState[];
  currentIndex: number;
  maxStates: number;
}

// Export and generation types
export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
    type: "component" | "screen" | "style" | "config";
  }>;
  dependencies: string[];
  instructions: string[];
}

export interface BuildConfiguration {
  platform: "android" | "ios" | "both";
  buildType: "development" | "preview" | "production";
  appName: string;
  packageName: string;
  version: string;
  buildNumber: number;
  icon: string;
  splashScreen: string;
  orientation: "portrait" | "landscape" | "both";
  permissions: string[];
}

export interface ComponentData {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentData[];
  style?: React.CSSProperties;
  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
  propertySchema: PropertySchema[];
  previewComponent: React.ComponentType<Record<string, unknown>>;
}

export interface PropertySchema {
  key: string;
  label: string;
  type:
    | "text"
    | "number"
    | "color"
    | "select"
    | "boolean"
    | "range"
    | "textarea"
    | "image"
    | "icon";
  options?: Array<{ label: string; value: string | number | boolean }>;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  conditional?: {
    dependsOn: string;
    value: string | number | boolean;
  };
}

export type ComponentCategory =
  | "layout"
  | "input"
  | "display"
  | "navigation"
  | "media"
  | "charts"
  | "tpq-specific";

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  components: ComponentData[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    version: string;
    tags: string[];
  };
}

export interface BuilderState {
  components: ComponentData[];
  selectedComponentId: string | null;
  draggedComponent: ComponentData | null;
  canvasSize: {
    width: number;
    height: number;
  };
  zoom: number;
  gridEnabled: boolean;
  snapToGrid: boolean;
}

export interface ExportOptions {
  platform: "react-native" | "flutter" | "pwa";
  includeStyles: boolean;
  includeAssets: boolean;
  minify: boolean;
}

export interface PreviewDevice {
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TemplateAPI {
  save: (
    template: Omit<Template, "id" | "metadata">,
  ) => Promise<APIResponse<Template>>;
  load: (id: string) => Promise<APIResponse<Template>>;
  list: (filters?: {
    category?: string;
    author?: string;
  }) => Promise<APIResponse<Template[]>>;
  delete: (id: string) => Promise<APIResponse<void>>;
  share: (id: string, permissions: string[]) => Promise<APIResponse<void>>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    componentId: string;
    property: string;
    message: string;
  }>;
  warnings: Array<{
    componentId: string;
    property: string;
    message: string;
  }>;
}

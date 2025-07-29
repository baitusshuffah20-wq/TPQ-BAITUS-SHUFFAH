"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { ComponentDefinition, ComponentCategory } from "./types";
import {
  Type,
  Square,
  Image,
  List,
  Calendar,
  User,
  Navigation,
  BarChart3,
  PieChart,
  LineChart,
  Camera,
  Video,
  Music,
  FileText,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  CreditCard,
  Settings,
  Search,
  Filter,
  Grid,
  Layers,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  BookOpen,
  GraduationCap,
  Award,
  Target,
  TrendingUp,
} from "lucide-react";

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // Layout Components
  {
    type: "container",
    label: "Container",
    icon: Square,
    category: "layout",
    defaultProps: {
      backgroundColor: "#ffffff",
      padding: 16,
      margin: 8,
      borderRadius: 8,
      borderWidth: 0,
      borderColor: "#e5e7eb",
    },
    propertySchema: [
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "padding", label: "Padding", type: "number", min: 0, max: 50 },
      { key: "margin", label: "Margin", type: "number", min: 0, max: 50 },
      {
        key: "borderRadius",
        label: "Border Radius",
        type: "number",
        min: 0,
        max: 50,
      },
      {
        key: "borderWidth",
        label: "Border Width",
        type: "number",
        min: 0,
        max: 10,
      },
      { key: "borderColor", label: "Border Color", type: "color" },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          padding: props.padding,
          margin: props.margin,
          borderRadius: props.borderRadius,
          border: `${props.borderWidth}px solid ${props.borderColor}`,
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Container
      </div>
    ),
  },
  {
    type: "flexbox",
    label: "Flex Container",
    icon: Layout,
    category: "layout",
    defaultProps: {
      direction: "row",
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: 8,
      wrap: false,
    },
    propertySchema: [
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { label: "Row", value: "row" },
          { label: "Column", value: "column" },
        ],
      },
      {
        key: "justifyContent",
        label: "Justify Content",
        type: "select",
        options: [
          { label: "Flex Start", value: "flex-start" },
          { label: "Center", value: "center" },
          { label: "Flex End", value: "flex-end" },
          { label: "Space Between", value: "space-between" },
          { label: "Space Around", value: "space-around" },
        ],
      },
      {
        key: "alignItems",
        label: "Align Items",
        type: "select",
        options: [
          { label: "Stretch", value: "stretch" },
          { label: "Flex Start", value: "flex-start" },
          { label: "Center", value: "center" },
          { label: "Flex End", value: "flex-end" },
        ],
      },
      { key: "gap", label: "Gap", type: "number", min: 0, max: 50 },
      { key: "wrap", label: "Wrap", type: "boolean" },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          display: "flex",
          flexDirection: props.direction,
          justifyContent: props.justifyContent,
          alignItems: props.alignItems,
          gap: props.gap,
          flexWrap: props.wrap ? "wrap" : "nowrap",
          border: "2px dashed #d1d5db",
          padding: 16,
          minHeight: 80,
        }}
      >
        <div
          style={{ padding: 8, backgroundColor: "#f3f4f6", borderRadius: 4 }}
        >
          Item 1
        </div>
        <div
          style={{ padding: 8, backgroundColor: "#f3f4f6", borderRadius: 4 }}
        >
          Item 2
        </div>
      </div>
    ),
  },
  {
    type: "grid",
    label: "Grid",
    icon: Grid,
    category: "layout",
    defaultProps: {
      columns: 2,
      gap: 16,
      padding: 16,
    },
    propertySchema: [
      { key: "columns", label: "Columns", type: "number", min: 1, max: 6 },
      { key: "gap", label: "Gap", type: "number", min: 0, max: 50 },
      { key: "padding", label: "Padding", type: "number", min: 0, max: 50 },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
          gap: props.gap,
          padding: props.padding,
          border: "2px dashed #d1d5db",
        }}
      >
        {Array.from({ length: props.columns * 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: 8,
              backgroundColor: "#f3f4f6",
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    ),
  },

  // Display Components
  {
    type: "text",
    label: "Text",
    icon: Type,
    category: "display",
    defaultProps: {
      text: "Sample Text",
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "left",
      lineHeight: 1.5,
    },
    propertySchema: [
      { key: "text", label: "Text", type: "textarea", required: true },
      { key: "fontSize", label: "Font Size", type: "number", min: 8, max: 72 },
      {
        key: "fontWeight",
        label: "Font Weight",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Bold", value: "bold" },
          { label: "100", value: "100" },
          { label: "200", value: "200" },
          { label: "300", value: "300" },
          { label: "400", value: "400" },
          { label: "500", value: "500" },
          { label: "600", value: "600" },
          { label: "700", value: "700" },
          { label: "800", value: "800" },
          { label: "900", value: "900" },
        ],
      },
      { key: "color", label: "Color", type: "color" },
      {
        key: "textAlign",
        label: "Text Align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
          { label: "Justify", value: "justify" },
        ],
      },
      {
        key: "lineHeight",
        label: "Line Height",
        type: "number",
        min: 1,
        max: 3,
        step: 0.1,
      },
    ],
    previewComponent: ({ props }) => (
      <p
        style={{
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          color: props.color,
          textAlign: props.textAlign,
          lineHeight: props.lineHeight,
          margin: 0,
        }}
      >
        {props.text}
      </p>
    ),
  },
  {
    type: "heading",
    label: "Heading",
    icon: Type,
    category: "display",
    defaultProps: {
      text: "Heading",
      level: 1,
      color: "#000000",
      textAlign: "left",
    },
    propertySchema: [
      { key: "text", label: "Text", type: "text", required: true },
      {
        key: "level",
        label: "Level",
        type: "select",
        options: [
          { label: "H1", value: 1 },
          { label: "H2", value: 2 },
          { label: "H3", value: 3 },
          { label: "H4", value: 4 },
          { label: "H5", value: 5 },
          { label: "H6", value: 6 },
        ],
      },
      { key: "color", label: "Color", type: "color" },
      {
        key: "textAlign",
        label: "Text Align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    previewComponent: ({ props }) => {
      const Tag = `h${props.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          style={{
            color: props.color,
            textAlign: props.textAlign,
            margin: 0,
            fontSize: `${2.5 - props.level * 0.25}rem`,
          }}
        >
          {props.text}
        </Tag>
      );
    },
  },

  // Input Components
  {
    type: "button",
    label: "Button",
    icon: Square,
    category: "input",
    defaultProps: {
      text: "Button",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      disabled: false,
      variant: "primary",
    },
    propertySchema: [
      { key: "text", label: "Text", type: "text", required: true },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "color", label: "Text Color", type: "color" },
      {
        key: "borderRadius",
        label: "Border Radius",
        type: "number",
        min: 0,
        max: 50,
      },
      { key: "padding", label: "Padding", type: "number", min: 0, max: 50 },
      { key: "fontSize", label: "Font Size", type: "number", min: 8, max: 32 },
      { key: "disabled", label: "Disabled", type: "boolean" },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
          { label: "Ghost", value: "ghost" },
        ],
      },
    ],
    previewComponent: ({ props }) => (
      <button
        style={{
          backgroundColor:
            props.variant === "outline" || props.variant === "ghost"
              ? "transparent"
              : props.backgroundColor,
          color:
            props.variant === "outline" ? props.backgroundColor : props.color,
          border:
            props.variant === "outline"
              ? `2px solid ${props.backgroundColor}`
              : "none",
          borderRadius: props.borderRadius,
          padding: props.padding,
          fontSize: props.fontSize,
          cursor: props.disabled ? "not-allowed" : "pointer",
          opacity: props.disabled ? 0.6 : 1,
        }}
        disabled={props.disabled}
      >
        {props.text}
      </button>
    ),
  },
  {
    type: "input",
    label: "Text Input",
    icon: Type,
    category: "input",
    defaultProps: {
      placeholder: "Enter text...",
      type: "text",
      label: "Input Label",
      required: false,
      disabled: false,
      borderColor: "#d1d5db",
      borderRadius: 8,
      padding: 12,
    },
    propertySchema: [
      { key: "label", label: "Label", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Text", value: "text" },
          { label: "Email", value: "email" },
          { label: "Password", value: "password" },
          { label: "Number", value: "number" },
          { label: "Tel", value: "tel" },
          { label: "URL", value: "url" },
        ],
      },
      { key: "required", label: "Required", type: "boolean" },
      { key: "disabled", label: "Disabled", type: "boolean" },
      { key: "borderColor", label: "Border Color", type: "color" },
      {
        key: "borderRadius",
        label: "Border Radius",
        type: "number",
        min: 0,
        max: 50,
      },
      { key: "padding", label: "Padding", type: "number", min: 0, max: 50 },
    ],
    previewComponent: ({ props }) => (
      <div>
        {props.label && (
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {props.label}{" "}
            {props.required && <span style={{ color: "red" }}>*</span>}
          </label>
        )}
        <input
          type={props.type}
          placeholder={props.placeholder}
          disabled={props.disabled}
          style={{
            width: "100%",
            padding: props.padding,
            border: `1px solid ${props.borderColor}`,
            borderRadius: props.borderRadius,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
    ),
  },

  // TPQ Specific Components
  {
    type: "attendance-card",
    label: "Attendance Card",
    icon: Calendar,
    category: "tpq-specific",
    defaultProps: {
      studentName: "Ahmad Fauzi",
      date: new Date().toLocaleDateString(),
      status: "Present",
      time: "08:00",
      backgroundColor: "#f0fdf4",
      borderColor: "#22c55e",
    },
    propertySchema: [
      {
        key: "studentName",
        label: "Student Name",
        type: "text",
        required: true,
      },
      { key: "date", label: "Date", type: "text" },
      { key: "time", label: "Time", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Present", value: "Present" },
          { label: "Absent", value: "Absent" },
          { label: "Late", value: "Late" },
          { label: "Excused", value: "Excused" },
        ],
      },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderColor", label: "Border Color", type: "color" },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          border: `2px solid ${props.borderColor}`,
          borderRadius: 8,
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {props.studentName}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {props.date} • {props.time}
          </div>
        </div>
        <div
          style={{
            backgroundColor:
              props.status === "Present"
                ? "#22c55e"
                : props.status === "Absent"
                  ? "#ef4444"
                  : "#f59e0b",
            color: "white",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {props.status}
        </div>
      </div>
    ),
  },
  {
    type: "progress-tracker",
    label: "Progress Tracker",
    icon: TrendingUp,
    category: "tpq-specific",
    defaultProps: {
      title: "Hafalan Progress",
      current: 15,
      total: 30,
      unit: "Surah",
      color: "#22c55e",
      showPercentage: true,
    },
    propertySchema: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "current", label: "Current Value", type: "number", min: 0 },
      { key: "total", label: "Total Value", type: "number", min: 1 },
      { key: "unit", label: "Unit", type: "text" },
      { key: "color", label: "Color", type: "color" },
      { key: "showPercentage", label: "Show Percentage", type: "boolean" },
    ],
    previewComponent: ({ props }) => {
      const percentage = Math.round((props.current / props.total) * 100);
      return (
        <div
          style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{props.title}</span>
            {props.showPercentage && (
              <span style={{ fontSize: 14, color: "#6b7280" }}>
                {percentage}%
              </span>
            )}
          </div>
          <div
            style={{
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: props.color,
                height: "100%",
                width: `${percentage}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
            {props.current} / {props.total} {props.unit}
          </div>
        </div>
      );
    },
  },
];

interface DraggableComponentProps {
  definition: ComponentDefinition;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  definition,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `component-${definition.type}`,
      data: {
        type: definition.type,
        definition,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const Icon = definition.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 border rounded-lg cursor-move flex items-center gap-2 hover:bg-gray-50 transition-colors"
    >
      <Icon size={16} className="text-gray-600" />
      <span className="text-sm font-medium">{definition.label}</span>
    </div>
  );
};

interface ComponentLibraryProps {
  onComponentSelect?: (definition: ComponentDefinition) => void;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onComponentSelect,
}) => {
  const categories: { [key in ComponentCategory]: string } = {
    layout: "Layout",
    input: "Input",
    display: "Display",
    navigation: "Navigation",
    media: "Media",
    charts: "Charts",
    "tpq-specific": "TPQ Specific",
  };

  const groupedComponents = COMPONENT_DEFINITIONS.reduce(
    (acc, def) => {
      if (!acc[def.category]) {
        acc[def.category] = [];
      }
      acc[def.category].push(def);
      return acc;
    },
    {} as Record<ComponentCategory, ComponentDefinition[]>,
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">
          Component Library
        </h3>
        <p className="text-sm text-gray-600 mt-1">Drag components to canvas</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category} className="mb-6">
            <h4 className="font-medium text-sm text-gray-700 mb-3 uppercase tracking-wide">
              {categories[category as ComponentCategory]}
            </h4>
            <div className="space-y-2">
              {components.map((definition) => (
                <DraggableComponent
                  key={definition.type}
                  definition={definition}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

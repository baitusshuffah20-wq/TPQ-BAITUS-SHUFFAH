"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Layout,
  Type,
  Square,
  Image,
  List,
  Grid3X3,
  Navigation,
  Search,
  Plus,
  Smartphone,
  Monitor,
  MousePointer,
  ToggleLeft,
  Calendar,
  Star,
  Heart,
  Bell,
  Settings,
  User,
  Home,
  Menu,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { MobileComponent, ComponentCategory } from "./types";

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    id: "layout",
    name: "Layout",
    icon: "Layout",
    components: [
      {
        id: "container",
        name: "Container",
        category: "layout",
        icon: "Square",
        description: "Flexible container untuk menampung komponen lain",
        defaultProps: {
          backgroundColor: "#ffffff",
          padding: 16,
          margin: 8,
          borderRadius: 8,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "backgroundColor",
            label: "Background Color",
            type: "color",
            defaultValue: "#ffffff",
          },
          {
            key: "padding",
            label: "Padding",
            type: "slider",
            defaultValue: 16,
            min: 0,
            max: 50,
          },
          {
            key: "margin",
            label: "Margin",
            type: "slider",
            defaultValue: 8,
            min: 0,
            max: 50,
          },
          {
            key: "borderRadius",
            label: "Border Radius",
            type: "slider",
            defaultValue: 8,
            min: 0,
            max: 30,
          },
          {
            key: "flexDirection",
            label: "Direction",
            type: "select",
            defaultValue: "column",
            options: [
              { label: "Column", value: "column" },
              { label: "Row", value: "row" },
            ],
          },
        ],
      },
      {
        id: "header",
        name: "Header",
        category: "layout",
        icon: "Monitor",
        description: "Header bar dengan title dan navigation",
        defaultProps: {
          title: "Header Title",
          backgroundColor: "#2563eb",
          textColor: "#ffffff",
          height: 60,
          showBackButton: false,
          showMenuButton: true,
          elevation: 4,
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "title",
            label: "Title",
            type: "text",
            defaultValue: "Header Title",
          },
          {
            key: "backgroundColor",
            label: "Background Color",
            type: "color",
            defaultValue: "#2563eb",
          },
          {
            key: "textColor",
            label: "Text Color",
            type: "color",
            defaultValue: "#ffffff",
          },
          {
            key: "height",
            label: "Height",
            type: "slider",
            defaultValue: 60,
            min: 40,
            max: 100,
          },
          {
            key: "showBackButton",
            label: "Show Back Button",
            type: "boolean",
            defaultValue: false,
          },
          {
            key: "showMenuButton",
            label: "Show Menu Button",
            type: "boolean",
            defaultValue: true,
          },
        ],
      },
      {
        id: "card",
        name: "Card",
        category: "layout",
        icon: "Square",
        description: "Card container dengan shadow dan border",
        defaultProps: {
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 16,
          margin: 8,
          elevation: 2,
          borderWidth: 0,
          borderColor: "#e5e7eb",
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "backgroundColor",
            label: "Background Color",
            type: "color",
            defaultValue: "#ffffff",
          },
          {
            key: "borderRadius",
            label: "Border Radius",
            type: "slider",
            defaultValue: 12,
            min: 0,
            max: 30,
          },
          {
            key: "padding",
            label: "Padding",
            type: "slider",
            defaultValue: 16,
            min: 0,
            max: 50,
          },
          {
            key: "elevation",
            label: "Shadow",
            type: "slider",
            defaultValue: 2,
            min: 0,
            max: 10,
          },
        ],
      },
    ],
  },
  {
    id: "input",
    name: "Input",
    icon: "MousePointer",
    components: [
      {
        id: "button",
        name: "Button",
        category: "input",
        icon: "MousePointer",
        description: "Tombol interaktif dengan berbagai style",
        defaultProps: {
          text: "Button",
          backgroundColor: "#2563eb",
          textColor: "#ffffff",
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          fontWeight: "600",
          disabled: false,
          fullWidth: false,
          variant: "solid",
          size: "medium",
        },
        previewComponent: () => null,
        configSchema: [
          { key: "text", label: "Text", type: "text", defaultValue: "Button" },
          {
            key: "backgroundColor",
            label: "Background Color",
            type: "color",
            defaultValue: "#2563eb",
          },
          {
            key: "textColor",
            label: "Text Color",
            type: "color",
            defaultValue: "#ffffff",
          },
          {
            key: "borderRadius",
            label: "Border Radius",
            type: "slider",
            defaultValue: 8,
            min: 0,
            max: 30,
          },
          {
            key: "fontSize",
            label: "Font Size",
            type: "slider",
            defaultValue: 16,
            min: 10,
            max: 24,
          },
          {
            key: "variant",
            label: "Variant",
            type: "select",
            defaultValue: "solid",
            options: [
              { label: "Solid", value: "solid" },
              { label: "Outline", value: "outline" },
              { label: "Ghost", value: "ghost" },
            ],
          },
          {
            key: "size",
            label: "Size",
            type: "select",
            defaultValue: "medium",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ],
          },
          {
            key: "fullWidth",
            label: "Full Width",
            type: "boolean",
            defaultValue: false,
          },
          {
            key: "disabled",
            label: "Disabled",
            type: "boolean",
            defaultValue: false,
          },
        ],
      },
      {
        id: "textinput",
        name: "Text Input",
        category: "input",
        icon: "Type",
        description: "Input field untuk text",
        defaultProps: {
          placeholder: "Enter text...",
          value: "",
          multiline: false,
          numberOfLines: 1,
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          backgroundColor: "#ffffff",
          textColor: "#374151",
          placeholderColor: "#9ca3af",
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "placeholder",
            label: "Placeholder",
            type: "text",
            defaultValue: "Enter text...",
          },
          {
            key: "multiline",
            label: "Multiline",
            type: "boolean",
            defaultValue: false,
          },
          {
            key: "borderColor",
            label: "Border Color",
            type: "color",
            defaultValue: "#d1d5db",
          },
          {
            key: "borderRadius",
            label: "Border Radius",
            type: "slider",
            defaultValue: 8,
            min: 0,
            max: 20,
          },
          {
            key: "fontSize",
            label: "Font Size",
            type: "slider",
            defaultValue: 16,
            min: 12,
            max: 20,
          },
        ],
      },
      {
        id: "switch",
        name: "Switch",
        category: "input",
        icon: "ToggleLeft",
        description: "Toggle switch untuk boolean values",
        defaultProps: {
          value: false,
          activeColor: "#2563eb",
          inactiveColor: "#d1d5db",
          size: "medium",
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "value",
            label: "Default Value",
            type: "boolean",
            defaultValue: false,
          },
          {
            key: "activeColor",
            label: "Active Color",
            type: "color",
            defaultValue: "#2563eb",
          },
          {
            key: "inactiveColor",
            label: "Inactive Color",
            type: "color",
            defaultValue: "#d1d5db",
          },
        ],
      },
    ],
  },
  {
    id: "display",
    name: "Display",
    icon: "Type",
    components: [
      {
        id: "text",
        name: "Text",
        category: "display",
        icon: "Type",
        description: "Text element dengan styling options",
        defaultProps: {
          content: "Sample Text",
          fontSize: 16,
          fontWeight: "400",
          color: "#374151",
          textAlign: "left",
          lineHeight: 1.5,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "content",
            label: "Content",
            type: "textarea",
            defaultValue: "Sample Text",
          },
          {
            key: "fontSize",
            label: "Font Size",
            type: "slider",
            defaultValue: 16,
            min: 10,
            max: 32,
          },
          {
            key: "color",
            label: "Color",
            type: "color",
            defaultValue: "#374151",
          },
          {
            key: "textAlign",
            label: "Text Align",
            type: "select",
            defaultValue: "left",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ],
          },
          {
            key: "fontWeight",
            label: "Font Weight",
            type: "select",
            defaultValue: "400",
            options: [
              { label: "Normal", value: "400" },
              { label: "Medium", value: "500" },
              { label: "Semibold", value: "600" },
              { label: "Bold", value: "700" },
            ],
          },
        ],
      },
      {
        id: "image",
        name: "Image",
        category: "display",
        icon: "Image",
        description: "Image component dengan resize options",
        defaultProps: {
          source: "https://via.placeholder.com/300x200",
          width: "100%",
          height: 200,
          borderRadius: 8,
          resizeMode: "cover",
          opacity: 1,
        },
        previewComponent: () => null,
        configSchema: [
          {
            key: "source",
            label: "Image URL",
            type: "text",
            defaultValue: "https://via.placeholder.com/300x200",
          },
          {
            key: "height",
            label: "Height",
            type: "slider",
            defaultValue: 200,
            min: 50,
            max: 500,
          },
          {
            key: "borderRadius",
            label: "Border Radius",
            type: "slider",
            defaultValue: 8,
            min: 0,
            max: 30,
          },
          {
            key: "resizeMode",
            label: "Resize Mode",
            type: "select",
            defaultValue: "cover",
            options: [
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Stretch", value: "stretch" },
            ],
          },
          {
            key: "opacity",
            label: "Opacity",
            type: "slider",
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.1,
          },
        ],
      },
    ],
  },
];

interface DraggableComponentProps {
  component: MobileComponent;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: component.id,
      data: {
        type: "component",
        componentType: component.id,
        defaultProps: component.defaultProps,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Square,
      Type,
      Image,
      List,
      Grid3X3,
      Layout,
      MousePointer,
      ToggleLeft,
      Monitor,
    };
    const IconComponent = icons[iconName] || Square;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 border border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-600 group-hover:text-blue-600">
          {getIcon(component.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
            {component.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {component.description}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCategories = COMPONENT_CATEGORIES.map((category) => ({
    ...category,
    components: category.components.filter(
      (component) =>
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  })).filter(
    (category) =>
      selectedCategory === "all" || category.id === selectedCategory,
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Badge>
        {COMPONENT_CATEGORIES.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Components */}
      <div className="space-y-4">
        {filteredCategories.map(
          (category) =>
            category.components.length > 0 && (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.components.map((component) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                    />
                  ))}
                </CardContent>
              </Card>
            ),
        )}
      </div>

      {filteredCategories.every((cat) => cat.components.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No components found</div>
        </div>
      )}
    </div>
  );
};

export default ComponentLibrary;

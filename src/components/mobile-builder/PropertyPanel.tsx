"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Palette,
  Type,
  Layout,
  Trash2,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { CanvasElement, ComponentConfigSchema } from "./types";

interface PropertyPanelProps {
  selectedElement: CanvasElement | null;
  onUpdateProps: (elementId: string, newProps: any) => void;
}

// Component configuration schemas
const COMPONENT_SCHEMAS: { [key: string]: ComponentConfigSchema[] } = {
  container: [
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
  header: [
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
    {
      key: "elevation",
      label: "Shadow",
      type: "slider",
      defaultValue: 4,
      min: 0,
      max: 10,
    },
  ],
  card: [
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
      key: "margin",
      label: "Margin",
      type: "slider",
      defaultValue: 8,
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
    {
      key: "borderWidth",
      label: "Border Width",
      type: "slider",
      defaultValue: 0,
      min: 0,
      max: 5,
    },
    {
      key: "borderColor",
      label: "Border Color",
      type: "color",
      defaultValue: "#e5e7eb",
    },
  ],
  button: [
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
      key: "padding",
      label: "Padding",
      type: "slider",
      defaultValue: 12,
      min: 4,
      max: 24,
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
  text: [
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
    { key: "color", label: "Color", type: "color", defaultValue: "#374151" },
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
    {
      key: "lineHeight",
      label: "Line Height",
      type: "slider",
      defaultValue: 1.5,
      min: 1,
      max: 3,
      step: 0.1,
    },
  ],
  image: [
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
  textinput: [
    {
      key: "placeholder",
      label: "Placeholder",
      type: "text",
      defaultValue: "Enter text...",
    },
    { key: "value", label: "Default Value", type: "text", defaultValue: "" },
    {
      key: "multiline",
      label: "Multiline",
      type: "boolean",
      defaultValue: false,
    },
    {
      key: "numberOfLines",
      label: "Number of Lines",
      type: "slider",
      defaultValue: 1,
      min: 1,
      max: 10,
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
      key: "padding",
      label: "Padding",
      type: "slider",
      defaultValue: 12,
      min: 4,
      max: 24,
    },
    {
      key: "fontSize",
      label: "Font Size",
      type: "slider",
      defaultValue: 16,
      min: 12,
      max: 20,
    },
    {
      key: "backgroundColor",
      label: "Background Color",
      type: "color",
      defaultValue: "#ffffff",
    },
  ],
  switch: [
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
};

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedElement,
  onUpdateProps,
}) => {
  if (!selectedElement) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">
                No Element Selected
              </div>
              <div className="text-sm">
                Select an element from the canvas to edit its properties
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const schema = COMPONENT_SCHEMAS[selectedElement.type] || [];

  const handlePropertyChange = (key: string, value: any) => {
    onUpdateProps(selectedElement.id, { [key]: value });
  };

  const renderPropertyInput = (config: ComponentConfigSchema) => {
    const currentValue =
      selectedElement.props[config.key] ?? config.defaultValue;

    switch (config.type) {
      case "text":
        return (
          <Input
            value={currentValue || ""}
            onChange={(e) => handlePropertyChange(config.key, e.target.value)}
            placeholder={config.placeholder}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={currentValue || ""}
            onChange={(e) => handlePropertyChange(config.key, e.target.value)}
            placeholder={config.placeholder}
            rows={3}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={currentValue || ""}
            onChange={(e) =>
              handlePropertyChange(config.key, Number(e.target.value))
            }
            min={config.min}
            max={config.max}
            step={config.step}
          />
        );

      case "color":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={currentValue || config.defaultValue}
              onChange={(e) => handlePropertyChange(config.key, e.target.value)}
              className="w-12 h-8 p-1 border rounded"
            />
            <Input
              value={currentValue || config.defaultValue}
              onChange={(e) => handlePropertyChange(config.key, e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );

      case "boolean":
        return (
          <Switch
            checked={currentValue || false}
            onCheckedChange={(checked) =>
              handlePropertyChange(config.key, checked)
            }
          />
        );

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[currentValue || config.defaultValue]}
              onValueChange={(values) =>
                handlePropertyChange(config.key, values[0])
              }
              min={config.min || 0}
              max={config.max || 100}
              step={config.step || 1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentValue || config.defaultValue}
            </div>
          </div>
        );

      case "select":
        return (
          <Select
            value={currentValue || config.defaultValue}
            onValueChange={(value) => handlePropertyChange(config.key, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Element Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="capitalize">{selectedElement.type}</span>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500">ID: {selectedElement.id}</div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Properties</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {schema.length > 0 ? (
            schema.map((config) => (
              <div key={config.key} className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  {config.label}
                </Label>
                {renderPropertyInput(config)}
                {config.description && (
                  <div className="text-xs text-gray-500">
                    {config.description}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              No properties available for this component
            </div>
          )}
        </CardContent>
      </Card>

      {/* Layout Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Layout</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Position X
            </Label>
            <Input
              type="number"
              value={selectedElement.position.x}
              onChange={(e) => {
                const newPosition = {
                  ...selectedElement.position,
                  x: Number(e.target.value),
                };
                onUpdateProps(selectedElement.id, { position: newPosition });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Position Y
            </Label>
            <Input
              type="number"
              value={selectedElement.position.y}
              onChange={(e) => {
                const newPosition = {
                  ...selectedElement.position,
                  y: Number(e.target.value),
                };
                onUpdateProps(selectedElement.id, { position: newPosition });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyPanel;

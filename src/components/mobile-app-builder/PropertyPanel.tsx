"use client";

import React, { useState, useCallback } from "react";
import { ComponentData, PropertySchema } from "./types";
import { COMPONENT_DEFINITIONS } from "./ComponentLibrary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";

interface PropertyPanelProps {
  component: ComponentData | null;
  onUpdate: (component: ComponentData) => void;
}

interface PropertyGroupProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const PropertyGroup: React.FC<PropertyGroupProps> = ({
  title,
  children,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-xs">{title}</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isExpanded && <div className="p-2 pt-0 space-y-2">{children}</div>}
    </div>
  );
};

interface PropertyInputProps {
  schema: PropertySchema;
  value: any;
  onChange: (value: any) => void;
  component: ComponentData;
}

const PropertyInput: React.FC<PropertyInputProps> = ({
  schema,
  value,
  onChange,
  component,
}) => {
  // Check conditional rendering
  if (schema.conditional) {
    const dependentValue = component.props[schema.conditional.dependsOn];
    if (dependentValue !== schema.conditional.value) {
      return null;
    }
  }

  const renderInput = () => {
    switch (schema.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${schema.label.toLowerCase()}...`}
            className="text-xs h-8"
          />
        );

      case "textarea":
        return (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md resize-none min-h-[60px] text-xs"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${schema.label.toLowerCase()}...`}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            min={schema.min}
            max={schema.max}
            step={schema.step || 1}
            className="text-xs h-8"
          />
        );

      case "range":
        return (
          <div className="space-y-2">
            <Slider
              value={[value || 0]}
              onValueChange={(values) => onChange(values[0])}
              min={schema.min || 0}
              max={schema.max || 100}
              step={schema.step || 1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {value || 0}{" "}
              {schema.min !== undefined &&
                schema.max !== undefined &&
                `(${schema.min}-${schema.max})`}
            </div>
          </div>
        );

      case "color":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 p-1 border rounded"
            />
            <Input
              type="text"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );

      case "select":
        return (
          <select
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {schema.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={value || false} onCheckedChange={onChange} />
            <span className="text-sm text-gray-600">
              {value ? "Enabled" : "Disabled"}
            </span>
          </div>
        );

      case "image":
        return (
          <div className="space-y-2">
            <Input
              type="url"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter image URL..."
            />
            <Button size="sm" variant="outline" className="w-full">
              Upload Image
            </Button>
            {value && (
              <div className="mt-2">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-20 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium flex items-center gap-1">
        {schema.label}
        {schema.required && <span className="text-red-500">*</span>}
      </Label>
      {renderInput()}
    </div>
  );
};

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  component,
  onUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handlePropertyChange = useCallback(
    (key: string, value: any) => {
      if (!component) return;

      const updatedComponent: ComponentData = {
        ...component,
        props: {
          ...component.props,
          [key]: value,
        },
      };

      onUpdate(updatedComponent);
    },
    [component, onUpdate],
  );

  const handleDuplicateComponent = useCallback(() => {
    if (!component) return;

    const duplicatedComponent: ComponentData = {
      ...component,
      id: `${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    onUpdate(duplicatedComponent);
  }, [component, onUpdate]);

  if (!component) {
    return (
      <div className="h-full p-4 bg-gray-50 flex flex-col items-center justify-center text-center">
        <Settings className="mb-3 text-gray-400" size={32} />
        <h3 className="font-semibold text-gray-700 mb-2 text-sm">
          No Component Selected
        </h3>
        <p className="text-xs text-gray-500">
          Select a component from the canvas to edit its properties
        </p>
      </div>
    );
  }

  const definition = COMPONENT_DEFINITIONS.find(
    (def) => def.type === component.type,
  );
  if (!definition) {
    return (
      <div className="w-80 p-6 border-l bg-gray-50">
        <div className="text-center text-red-500">
          <p>Unknown component type: {component.type}</p>
        </div>
      </div>
    );
  }

  const filteredProperties = definition.propertySchema.filter(
    (schema) =>
      schema.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.key.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Properties</h3>
            <p className="text-xs text-gray-600 mt-1">
              Edit component properties
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDuplicateComponent}
              className="h-6 w-6 p-0"
            >
              <Copy size={12} />
            </Button>
            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
              <Eye size={12} />
            </Button>
            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
              <Lock size={12} />
            </Button>
          </div>
        </div>

        {/* Component Info */}
        <div className="bg-blue-50 p-2 rounded">
          <div className="flex items-center gap-2 mb-1">
            <definition.icon size={14} className="text-blue-600" />
            <span className="font-medium text-blue-900 text-xs">
              {definition.label}
            </span>
          </div>
          <div className="text-xs text-blue-700 truncate">ID: {component.id}</div>
        </div>

        {/* Search */}
        <div className="mt-2">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs h-7"
          />
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredProperties.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No properties found</p>
          </div>
        ) : (
          <>
            {/* Basic Properties */}
            <PropertyGroup title="Basic Properties">
              {filteredProperties
                .filter(
                  (schema) =>
                    !schema.key.includes("style") &&
                    !schema.key.includes("layout"),
                )
                .map((schema) => (
                  <PropertyInput
                    key={schema.key}
                    schema={schema}
                    value={component.props[schema.key]}
                    onChange={(value) =>
                      handlePropertyChange(schema.key, value)
                    }
                    component={component}
                  />
                ))}
            </PropertyGroup>

            {/* Style Properties */}
            {filteredProperties.some(
              (schema) =>
                schema.key.includes("style") ||
                schema.key.includes("Color") ||
                schema.key.includes("border") ||
                schema.key.includes("padding") ||
                schema.key.includes("margin"),
            ) && (
              <PropertyGroup title="Style Properties">
                {filteredProperties
                  .filter(
                    (schema) =>
                      schema.key.includes("style") ||
                      schema.key.includes("Color") ||
                      schema.key.includes("border") ||
                      schema.key.includes("padding") ||
                      schema.key.includes("margin") ||
                      schema.key.includes("background") ||
                      schema.key.includes("radius"),
                  )
                  .map((schema) => (
                    <PropertyInput
                      key={schema.key}
                      schema={schema}
                      value={component.props[schema.key]}
                      onChange={(value) =>
                        handlePropertyChange(schema.key, value)
                      }
                      component={component}
                    />
                  ))}
              </PropertyGroup>
            )}

            {/* Layout Properties */}
            {filteredProperties.some(
              (schema) =>
                schema.key.includes("layout") ||
                schema.key.includes("flex") ||
                schema.key.includes("grid"),
            ) && (
              <PropertyGroup title="Layout Properties">
                {filteredProperties
                  .filter(
                    (schema) =>
                      schema.key.includes("layout") ||
                      schema.key.includes("flex") ||
                      schema.key.includes("grid") ||
                      schema.key.includes("direction") ||
                      schema.key.includes("justify") ||
                      schema.key.includes("align"),
                  )
                  .map((schema) => (
                    <PropertyInput
                      key={schema.key}
                      schema={schema}
                      value={component.props[schema.key]}
                      onChange={(value) =>
                        handlePropertyChange(schema.key, value)
                      }
                      component={component}
                    />
                  ))}
              </PropertyGroup>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <div className="text-xs text-gray-500 text-center">
          Component: {definition.label} • Type: {component.type}
        </div>
      </div>
    </div>
  );
};

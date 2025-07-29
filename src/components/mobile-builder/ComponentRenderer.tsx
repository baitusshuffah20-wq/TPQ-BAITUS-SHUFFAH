"use client";

import React from "react";
import { CanvasElement } from "./types";
import {
  ArrowLeft,
  Menu,
  MoreVertical,
  User,
  Home,
  Search,
  Bell,
  Settings,
  Heart,
  Star,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface ComponentRendererProps {
  element: CanvasElement;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ element }) => {
  const { type, props } = element;

  const renderComponent = () => {
    switch (type) {
      case "container":
        return (
          <div
            style={{
              backgroundColor: props.backgroundColor || "#ffffff",
              padding: `${props.padding || 16}px`,
              margin: `${props.margin || 8}px`,
              borderRadius: `${props.borderRadius || 8}px`,
              display: "flex",
              flexDirection: props.flexDirection || "column",
              justifyContent: props.justifyContent || "flex-start",
              alignItems: props.alignItems || "stretch",
              minHeight: "60px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div className="text-xs text-gray-400 text-center py-2">
              Container
            </div>
          </div>
        );

      case "header":
        return (
          <div
            style={{
              backgroundColor: props.backgroundColor || "#2563eb",
              color: props.textColor || "#ffffff",
              height: `${props.height || 60}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              boxShadow: props.elevation
                ? `0 ${props.elevation}px ${props.elevation * 2}px rgba(0,0,0,0.1)`
                : "none",
            }}
          >
            <div className="flex items-center space-x-3">
              {props.showBackButton && <ArrowLeft className="h-5 w-5" />}
              <span className="font-medium text-base">
                {props.title || "Header Title"}
              </span>
            </div>
            {props.showMenuButton && <Menu className="h-5 w-5" />}
          </div>
        );

      case "card":
        return (
          <div
            style={{
              backgroundColor: props.backgroundColor || "#ffffff",
              borderRadius: `${props.borderRadius || 12}px`,
              padding: `${props.padding || 16}px`,
              margin: `${props.margin || 8}px`,
              boxShadow: props.elevation
                ? `0 ${props.elevation}px ${props.elevation * 2}px rgba(0,0,0,0.1)`
                : "none",
              border: props.borderWidth
                ? `${props.borderWidth}px solid ${props.borderColor || "#e5e7eb"}`
                : "none",
              minHeight: "80px",
            }}
          >
            <div className="text-xs text-gray-400 text-center py-4">
              Card Content
            </div>
          </div>
        );

      case "button":
        const getButtonStyle = () => {
          const baseStyle = {
            backgroundColor:
              props.variant === "outline"
                ? "transparent"
                : props.backgroundColor || "#2563eb",
            color:
              props.variant === "outline"
                ? props.backgroundColor || "#2563eb"
                : props.textColor || "#ffffff",
            borderRadius: `${props.borderRadius || 8}px`,
            padding: `${props.padding || 12}px 24px`,
            fontSize: `${props.fontSize || 16}px`,
            fontWeight: props.fontWeight || "600",
            border:
              props.variant === "outline"
                ? `2px solid ${props.backgroundColor || "#2563eb"}`
                : "none",
            opacity: props.disabled ? 0.5 : 1,
            cursor: props.disabled ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: props.fullWidth ? "100%" : "auto",
            margin: "4px",
          };

          if (props.variant === "ghost") {
            baseStyle.backgroundColor = "transparent";
            baseStyle.color = props.backgroundColor || "#2563eb";
          }

          return baseStyle;
        };

        return (
          <button style={getButtonStyle()} disabled={props.disabled}>
            {props.text || "Button"}
          </button>
        );

      case "text":
        return (
          <div
            style={{
              fontSize: `${props.fontSize || 16}px`,
              fontWeight: props.fontWeight || "400",
              color: props.color || "#374151",
              textAlign: props.textAlign || "left",
              lineHeight: props.lineHeight || 1.5,
              marginTop: `${props.marginTop || 0}px`,
              marginBottom: `${props.marginBottom || 0}px`,
              marginLeft: `${props.marginLeft || 0}px`,
              marginRight: `${props.marginRight || 0}px`,
              padding: "8px",
            }}
          >
            {props.content || "Sample Text"}
          </div>
        );

      case "image":
        return (
          <div
            style={{
              width:
                typeof props.width === "string"
                  ? props.width
                  : `${props.width}px`,
              height: `${props.height || 200}px`,
              borderRadius: `${props.borderRadius || 8}px`,
              overflow: "hidden",
              opacity: props.opacity || 1,
              margin: "4px",
            }}
          >
            <img
              src={props.source || "https://via.placeholder.com/300x200"}
              alt="Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: props.resizeMode || "cover",
              }}
            />
          </div>
        );

      case "textinput":
        return (
          <div style={{ margin: "4px" }}>
            {props.multiline ? (
              <textarea
                placeholder={props.placeholder || "Enter text..."}
                value={props.value || ""}
                rows={props.numberOfLines || 3}
                style={{
                  width: "100%",
                  borderWidth: `${props.borderWidth || 1}px`,
                  borderColor: props.borderColor || "#d1d5db",
                  borderStyle: "solid",
                  borderRadius: `${props.borderRadius || 8}px`,
                  padding: `${props.padding || 12}px`,
                  fontSize: `${props.fontSize || 16}px`,
                  backgroundColor: props.backgroundColor || "#ffffff",
                  color: props.textColor || "#374151",
                  resize: "vertical",
                  outline: "none",
                }}
                readOnly
              />
            ) : (
              <input
                type="text"
                placeholder={props.placeholder || "Enter text..."}
                value={props.value || ""}
                style={{
                  width: "100%",
                  borderWidth: `${props.borderWidth || 1}px`,
                  borderColor: props.borderColor || "#d1d5db",
                  borderStyle: "solid",
                  borderRadius: `${props.borderRadius || 8}px`,
                  padding: `${props.padding || 12}px`,
                  fontSize: `${props.fontSize || 16}px`,
                  backgroundColor: props.backgroundColor || "#ffffff",
                  color: props.textColor || "#374151",
                  outline: "none",
                }}
                readOnly
              />
            )}
          </div>
        );

      case "switch":
        const SwitchIcon = props.value ? ToggleRight : ToggleLeft;
        return (
          <div style={{ margin: "8px", display: "flex", alignItems: "center" }}>
            <SwitchIcon
              className="h-8 w-8"
              style={{
                color: props.value
                  ? props.activeColor || "#2563eb"
                  : props.inactiveColor || "#d1d5db",
              }}
            />
          </div>
        );

      default:
        return (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f3f4f6",
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              textAlign: "center",
              color: "#6b7280",
              margin: "4px",
            }}
          >
            <div className="text-sm">Unknown Component</div>
            <div className="text-xs">{type}</div>
          </div>
        );
    }
  };

  return <div className="relative">{renderComponent()}</div>;
};

export default ComponentRenderer;

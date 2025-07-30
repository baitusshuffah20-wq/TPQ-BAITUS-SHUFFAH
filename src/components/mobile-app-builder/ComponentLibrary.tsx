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
  BookOpen,
  Wallet,
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
  Menu,
  Grid3X3,
  Home,
  Bell,
  MessageCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
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
      isContainer: true,
      allowChildren: true,
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
      isContainer: true,
      allowChildren: true,
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

  // TPQ Specific Components
  {
    type: "wallet-card",
    label: "Wallet Card",
    icon: CreditCard,
    category: "tpq-specific",
    defaultProps: {
      balance: 150000,
      currency: "Rp",
      cardTitle: "Saldo Wallet",
      showTopUp: true,
      showWithdraw: true,
      backgroundColor: "#ECA825",
      textColor: "#ffffff",
      buttonColor: "#FFD700",
    },
    propertySchema: [
      { key: "balance", label: "Balance", type: "number", min: 0 },
      { key: "currency", label: "Currency", type: "text" },
      { key: "cardTitle", label: "Card Title", type: "text" },
      { key: "showTopUp", label: "Show Top Up", type: "boolean" },
      { key: "showWithdraw", label: "Show Withdraw", type: "boolean" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "textColor", label: "Text Color", type: "color" },
      { key: "buttonColor", label: "Button Color", type: "color" },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          color: props.textColor,
          padding: 20,
          borderRadius: 12,
          minHeight: 120,
        }}
      >
        <div style={{ fontSize: 14, marginBottom: 8 }}>{props.cardTitle}</div>
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          {props.currency} {props.balance?.toLocaleString()}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {props.showTopUp && (
            <div
              style={{
                backgroundColor: props.buttonColor,
                color: "#000",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Top Up
            </div>
          )}
          {props.showWithdraw && (
            <div
              style={{
                backgroundColor: props.buttonColor,
                color: "#000",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Withdraw
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    type: "donation-card",
    label: "Donation Card",
    icon: Heart,
    category: "tpq-specific",
    defaultProps: {
      title: "Donasi Pembangunan Masjid",
      description: "Mari berpartisipasi dalam pembangunan masjid",
      targetAmount: 50000000,
      currentAmount: 25000000,
      currency: "Rp",
      showProgress: true,
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      progressColor: "#ECA825",
    },
    propertySchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "targetAmount", label: "Target Amount", type: "number", min: 0 },
      { key: "currentAmount", label: "Current Amount", type: "number", min: 0 },
      { key: "currency", label: "Currency", type: "text" },
      { key: "showProgress", label: "Show Progress", type: "boolean" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderColor", label: "Border Color", type: "color" },
      { key: "progressColor", label: "Progress Color", type: "color" },
    ],
    previewComponent: ({ props }) => {
      const progress = (props.currentAmount / props.targetAmount) * 100;
      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            border: `1px solid ${props.borderColor}`,
            borderRadius: 12,
            padding: 16,
            minHeight: 140,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
            {props.title}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            {props.description}
          </div>
          {props.showProgress && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>{props.currency} {props.currentAmount?.toLocaleString()}</span>
                <span>{props.currency} {props.targetAmount?.toLocaleString()}</span>
              </div>
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 4,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: props.progressColor,
                    height: "100%",
                    width: `${Math.min(progress, 100)}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                {progress.toFixed(1)}% tercapai
              </div>
            </div>
          )}
          <div
            style={{
              backgroundColor: props.progressColor,
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: 6,
              textAlign: "center",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            Donasi Sekarang
          </div>
        </div>
      );
    },
  },
  {
    type: "halaqah-card",
    label: "Kartu Halaqah",
    icon: BookOpen,
    category: "tpq-specific",
    defaultProps: {
      halaqahName: "Halaqah Al-Fatihah",
      musyrifName: "Ustadz Ahmad",
      studentCount: 15,
      schedule: "Senin, Rabu, Jumat - 16:00",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      showProgress: true,
      progressValue: 75,
    },
    propertySchema: [
      { key: "halaqahName", label: "Nama Halaqah", type: "text" },
      { key: "musyrifName", label: "Nama Musyrif", type: "text" },
      { key: "studentCount", label: "Jumlah Santri", type: "number", min: 1, max: 50 },
      { key: "schedule", label: "Jadwal", type: "text" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderRadius", label: "Border Radius", type: "number", min: 0, max: 20 },
      { key: "showProgress", label: "Tampilkan Progress", type: "boolean" },
      { key: "progressValue", label: "Nilai Progress", type: "number", min: 0, max: 100 },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          borderRadius: props.borderRadius,
          padding: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>{props.halaqahName}</h3>
          <span style={{ fontSize: 12, color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 12 }}>
            {props.studentCount} santri
          </span>
        </div>
        <p style={{ margin: "4px 0", fontSize: 14, color: "#6b7280" }}>
          Musyrif: {props.musyrifName}
        </p>
        <p style={{ margin: "4px 0", fontSize: 12, color: "#9ca3af" }}>
          {props.schedule}
        </p>
        {props.showProgress && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Progress Hafalan</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{props.progressValue}%</span>
            </div>
            <div style={{ backgroundColor: "#e5e7eb", borderRadius: 4, height: 6 }}>
              <div
                style={{
                  backgroundColor: "#10b981",
                  height: "100%",
                  width: `${props.progressValue}%`,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        )}
      </div>
    ),
  },



  {
    type: "assessment-card",
    label: "Kartu Penilaian",
    icon: Star,
    category: "tpq-specific",
    defaultProps: {
      studentName: "Ahmad Fauzi",
      surahName: "Al-Fatihah",
      grade: "A",
      score: 85,
      date: "2024-01-15",
      notes: "Bacaan sudah lancar, tajwid perlu diperbaiki",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      showScore: true,
    },
    propertySchema: [
      { key: "studentName", label: "Nama Santri", type: "text" },
      { key: "surahName", label: "Nama Surah", type: "text" },
      { key: "grade", label: "Nilai Huruf", type: "select", options: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
        { label: "D", value: "D" },
      ]},
      { key: "score", label: "Nilai Angka", type: "number", min: 0, max: 100 },
      { key: "date", label: "Tanggal", type: "text" },
      { key: "notes", label: "Catatan", type: "textarea" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderRadius", label: "Border Radius", type: "number", min: 0, max: 20 },
      { key: "showScore", label: "Tampilkan Skor", type: "boolean" },
    ],
    previewComponent: ({ props }) => {
      const getGradeColor = (grade: string) => {
        switch (grade) {
          case "A": return "#10b981";
          case "B": return "#3b82f6";
          case "C": return "#f59e0b";
          case "D": return "#ef4444";
          default: return "#6b7280";
        }
      };

      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            borderRadius: props.borderRadius,
            padding: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>{props.studentName}</h3>
              <p style={{ margin: "2px 0", fontSize: 14, color: "#6b7280" }}>
                Surah: {props.surahName}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  backgroundColor: getGradeColor(props.grade),
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {props.grade}
              </span>
              {props.showScore && (
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#6b7280" }}>
                  Skor: {props.score}
                </p>
              )}
            </div>
          </div>
          <p style={{ margin: "8px 0", fontSize: 12, color: "#9ca3af" }}>
            {props.date}
          </p>
          {props.notes && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: 8,
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>
                "{props.notes}"
              </p>
            </div>
          )}
        </div>
      );
    },
  },

  {
    type: "news-card",
    label: "Kartu Berita",
    icon: FileText,
    category: "tpq-specific",
    defaultProps: {
      title: "Kegiatan Tahfidz Bersama",
      excerpt: "TPQ Baitus Shuffah mengadakan kegiatan tahfidz bersama untuk meningkatkan semangat menghafal Al-Quran",
      date: "2024-01-15",
      author: "Admin TPQ",
      imageUrl: "/placeholder-news.jpg",
      category: "Kegiatan",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      showImage: true,
      showAuthor: true,
    },
    propertySchema: [
      { key: "title", label: "Judul Berita", type: "text" },
      { key: "excerpt", label: "Ringkasan", type: "textarea" },
      { key: "date", label: "Tanggal", type: "text" },
      { key: "author", label: "Penulis", type: "text" },
      { key: "imageUrl", label: "URL Gambar", type: "text" },
      { key: "category", label: "Kategori", type: "text" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderRadius", label: "Border Radius", type: "number", min: 0, max: 20 },
      { key: "showImage", label: "Tampilkan Gambar", type: "boolean" },
      { key: "showAuthor", label: "Tampilkan Penulis", type: "boolean" },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          borderRadius: props.borderRadius,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {props.showImage && (
          <div
            style={{
              height: 120,
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 12,
            }}
          >
            Gambar Berita
          </div>
        )}
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
            <span
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {props.category}
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {props.date}
            </span>
          </div>
          <h3 style={{ fontWeight: 600, fontSize: 16, margin: "0 0 8px 0", lineHeight: 1.3 }}>
            {props.title}
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#6b7280", lineHeight: 1.4 }}>
            {props.excerpt}
          </p>
          {props.showAuthor && (
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
              Oleh: {props.author}
            </p>
          )}
        </div>
      </div>
    ),
  },

  {
    type: "attendance-summary-card",
    label: "Kartu Ringkasan Kehadiran",
    icon: Calendar,
    category: "tpq-specific",
    defaultProps: {
      studentName: "Fatimah Zahra",
      date: "2024-01-15",
      status: "Hadir",
      time: "16:00",
      notes: "",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      showTime: true,
      showNotes: true,
    },
    propertySchema: [
      { key: "studentName", label: "Nama Santri", type: "text" },
      { key: "date", label: "Tanggal", type: "text" },
      { key: "status", label: "Status", type: "select", options: [
        { label: "Hadir", value: "Hadir" },
        { label: "Tidak Hadir", value: "Tidak Hadir" },
        { label: "Izin", value: "Izin" },
        { label: "Sakit", value: "Sakit" },
      ]},
      { key: "time", label: "Waktu", type: "text" },
      { key: "notes", label: "Catatan", type: "textarea" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderRadius", label: "Border Radius", type: "number", min: 0, max: 20 },
      { key: "showTime", label: "Tampilkan Waktu", type: "boolean" },
      { key: "showNotes", label: "Tampilkan Catatan", type: "boolean" },
    ],
    previewComponent: ({ props }) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case "Hadir": return "#10b981";
          case "Tidak Hadir": return "#ef4444";
          case "Izin": return "#f59e0b";
          case "Sakit": return "#8b5cf6";
          default: return "#6b7280";
        }
      };

      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            borderRadius: props.borderRadius,
            padding: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>{props.studentName}</h3>
              <p style={{ margin: "2px 0", fontSize: 14, color: "#6b7280" }}>
                {props.date}
                {props.showTime && ` - ${props.time}`}
              </p>
            </div>
            <span
              style={{
                backgroundColor: getStatusColor(props.status),
                color: "white",
                padding: "4px 12px",
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {props.status}
            </span>
          </div>
          {props.showNotes && props.notes && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: 8,
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                {props.notes}
              </p>
            </div>
          )}
        </div>
      );
    },
  },

  // Menu Components
  {
    type: "menu-grid",
    label: "Menu Grid",
    icon: Grid3X3,
    category: "navigation",
    defaultProps: {
      columns: 3,
      menuItems: [
        { icon: "📚", label: "Halaqah", color: "#3b82f6" },
        { icon: "📊", label: "Penilaian", color: "#10b981" },
        { icon: "💰", label: "Wallet", color: "#f59e0b" },
        { icon: "❤️", label: "Donasi", color: "#ef4444" },
        { icon: "📰", label: "Berita", color: "#8b5cf6" },
        { icon: "📅", label: "Kehadiran", color: "#06b6d4" },
      ],
      backgroundColor: "#ffffff",
      borderRadius: 12,
      spacing: 12,
      showLabels: true,
    },
    propertySchema: [
      { key: "columns", label: "Columns", type: "number", min: 2, max: 4 },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "borderRadius", label: "Border Radius", type: "number", min: 0, max: 20 },
      { key: "spacing", label: "Spacing", type: "number", min: 4, max: 24 },
      { key: "showLabels", label: "Show Labels", type: "boolean" },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          borderRadius: props.borderRadius,
          padding: 16,
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
            gap: props.spacing,
          }}
        >
          {props.menuItems.slice(0, 6).map((item: any, index: number) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  marginBottom: props.showLabels ? 8 : 0,
                }}
              >
                {item.icon}
              </div>
              {props.showLabels && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#374151",
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
  },

  {
    type: "bottom-navigation",
    label: "Bottom Navigation",
    icon: Navigation,
    category: "navigation",
    defaultProps: {
      items: [
        { icon: "🏠", label: "Home", active: true },
        { icon: "📚", label: "Halaqah", active: false },
        { icon: "💰", label: "Wallet", active: false },
        { icon: "👤", label: "Profile", active: false },
      ],
      backgroundColor: "#ffffff",
      activeColor: "#3b82f6",
      inactiveColor: "#9ca3af",
      showLabels: true,
      height: 60,
    },
    propertySchema: [
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "activeColor", label: "Active Color", type: "color" },
      { key: "inactiveColor", label: "Inactive Color", type: "color" },
      { key: "showLabels", label: "Show Labels", type: "boolean" },
      { key: "height", label: "Height", type: "number", min: 50, max: 80 },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          height: props.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          borderTop: "1px solid #e5e7eb",
          padding: "8px 0",
        }}
      >
        {props.items.map((item: any, index: number) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: 20,
                marginBottom: props.showLabels ? 4 : 0,
                color: item.active ? props.activeColor : props.inactiveColor,
              }}
            >
              {item.icon}
            </div>
            {props.showLabels && (
              <span
                style={{
                  fontSize: 10,
                  color: item.active ? props.activeColor : props.inactiveColor,
                  fontWeight: item.active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    ),
  },

  {
    type: "header-menu",
    label: "Header Menu",
    icon: Menu,
    category: "navigation",
    defaultProps: {
      title: "TPQ Baitus Shuffah",
      showLogo: true,
      logoIcon: "🕌",
      showNotification: true,
      showProfile: true,
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      height: 60,
    },
    propertySchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "showLogo", label: "Show Logo", type: "boolean" },
      { key: "logoIcon", label: "Logo Icon", type: "text" },
      { key: "showNotification", label: "Show Notification", type: "boolean" },
      { key: "showProfile", label: "Show Profile", type: "boolean" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "textColor", label: "Text Color", type: "color" },
      { key: "height", label: "Height", type: "number", min: 50, max: 80 },
    ],
    previewComponent: ({ props }) => (
      <div
        style={{
          backgroundColor: props.backgroundColor,
          height: props.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          color: props.textColor,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {props.showLogo && (
            <div style={{ fontSize: 24 }}>{props.logoIcon}</div>
          )}
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            {props.title}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {props.showNotification && (
            <div style={{ fontSize: 20, cursor: "pointer" }}>🔔</div>
          )}
          {props.showProfile && (
            <div style={{ fontSize: 20, cursor: "pointer" }}>👤</div>
          )}
        </div>
      </div>
    ),
  },

  {
    type: "icon-button",
    label: "Icon Button",
    icon: Plus,
    category: "navigation",
    defaultProps: {
      icon: "➕",
      label: "Add",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      borderRadius: 8,
      size: "medium",
      showLabel: true,
    },
    propertySchema: [
      { key: "icon", label: "Icon", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "textColor", label: "Text Color", type: "color" },
      { key: "borderRadius", label: "Border Radius", type: "number", min: 0, max: 20 },
      {
        key: "size",
        label: "Size",
        type: "select",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" }
        ]
      },
      { key: "showLabel", label: "Show Label", type: "boolean" },
    ],
    previewComponent: ({ props }) => {
      const sizeMap = {
        small: { padding: "8px 12px", fontSize: 14, iconSize: 16 },
        medium: { padding: "12px 16px", fontSize: 16, iconSize: 18 },
        large: { padding: "16px 20px", fontSize: 18, iconSize: 20 },
      };
      const size = sizeMap[props.size as keyof typeof sizeMap] || sizeMap.medium;

      return (
        <button
          style={{
            backgroundColor: props.backgroundColor,
            color: props.textColor,
            borderRadius: props.borderRadius,
            padding: size.padding,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: size.fontSize,
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: size.iconSize }}>{props.icon}</span>
          {props.showLabel && <span>{props.label}</span>}
        </button>
      );
    },
  },

  {
    type: "floating-action-button",
    label: "Floating Action Button",
    icon: Plus,
    category: "navigation",
    defaultProps: {
      icon: "➕",
      backgroundColor: "#3b82f6",
      size: 56,
      position: "bottom-right",
    },
    propertySchema: [
      { key: "icon", label: "Icon", type: "text" },
      { key: "backgroundColor", label: "Background Color", type: "color" },
      { key: "size", label: "Size", type: "number", min: 40, max: 72 },
      {
        key: "position",
        label: "Position",
        type: "select",
        options: [
          { value: "bottom-right", label: "Bottom Right" },
          { value: "bottom-left", label: "Bottom Left" },
          { value: "bottom-center", label: "Bottom Center" }
        ]
      },
    ],
    previewComponent: ({ props }) => (
      <div style={{ position: "relative", height: 80, width: "100%" }}>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: props.position === "bottom-right" ? 16 :
                   props.position === "bottom-left" ? 16 : "50%",
            left: props.position === "bottom-left" ? 16 :
                  props.position === "bottom-center" ? "50%" : "auto",
            transform: props.position === "bottom-center" ? "translateX(-50%)" : "none",
            width: props.size,
            height: props.size,
            backgroundColor: props.backgroundColor,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: 20,
            color: "#ffffff",
          }}
        >
          {props.icon}
        </div>
      </div>
    ),
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
      className="p-2 border rounded cursor-move flex items-center gap-2 hover:bg-gray-50 transition-colors text-xs"
    >
      <Icon size={14} className="text-gray-600 flex-shrink-0" />
      <span className="font-medium truncate">{definition.label}</span>
    </div>
  );
};

interface ComponentLibraryProps {
  appType: "wali" | "musyrif";
  onComponentSelect?: (definition: ComponentDefinition) => void;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  appType,
  onComponentSelect,
}) => {
  const categories: { [key in ComponentCategory]: string } = {
    layout: "Layout",
    input: "Input",
    display: "Display",
    navigation: "Navigation",
    media: "Media",
    charts: "Charts",
    "tpq-specific": appType === "wali" ? "Komponen Wali" : "Komponen Musyrif",
  };

  // Filter components based on app type
  const getFilteredComponents = () => {
    return COMPONENT_DEFINITIONS.filter(def => {
      // Always show basic components
      if (def.category !== "tpq-specific") {
        return true;
      }

      // For TPQ-specific components, show based on app type
      const waliComponents = ["donation-card", "news-card", "attendance-summary-card"];
      const musyrifComponents = ["wallet-card", "donation-card", "halaqah-card", "assessment-card", "news-card", "attendance-card"];

      if (appType === "wali") {
        return waliComponents.includes(def.type);
      } else if (appType === "musyrif") {
        return musyrifComponents.includes(def.type);
      }

      return true;
    });
  };

  const groupedComponents = getFilteredComponents().reduce(
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
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">
          Components
        </h3>
        <p className="text-xs text-gray-600 mt-1">Drag to canvas</p>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category} className="mb-4">
            <h4 className="font-medium text-xs text-gray-700 mb-2 uppercase tracking-wide px-1">
              {categories[category as ComponentCategory]}
            </h4>
            <div className="space-y-1">
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

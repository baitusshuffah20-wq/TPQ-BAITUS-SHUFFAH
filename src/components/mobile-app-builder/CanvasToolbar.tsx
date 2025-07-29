"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Code,
  Save,
  Smartphone,
  Tablet,
  Monitor,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  Undo,
  Redo,
  Download,
  Upload,
  Share2,
  Settings,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
} from "lucide-react";

interface CanvasToolbarProps {
  onPreview: () => void;
  onExport: () => void;
  onSave: () => void;
  onLoad: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canvasSize: { width: number; height: number };
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
}

const DEVICE_PRESETS = [
  { name: "iPhone SE", width: 375, height: 667, icon: Smartphone },
  { name: "iPhone 12", width: 390, height: 844, icon: Smartphone },
  { name: "iPhone 12 Pro Max", width: 428, height: 926, icon: Smartphone },
  { name: "Android", width: 360, height: 640, icon: Smartphone },
  { name: "Android Large", width: 412, height: 732, icon: Smartphone },
  { name: "iPad", width: 768, height: 1024, icon: Tablet },
  { name: "iPad Pro", width: 1024, height: 1366, icon: Tablet },
  { name: "Desktop", width: 1200, height: 800, icon: Monitor },
];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onPreview,
  onExport,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  canvasSize,
  onCanvasSizeChange,
}) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    onZoomChange(newZoom);
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  return (
    <div className="border-b bg-white p-4 flex items-center justify-between">
      {/* Left Section - File Operations */}
      <div className="flex items-center gap-2">
        <Button onClick={onSave} size="sm" className="gap-2">
          <Save size={16} />
          Save
        </Button>

        <Button onClick={onLoad} size="sm" variant="outline" className="gap-2">
          <Upload size={16} />
          Load
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <Button
          onClick={onUndo}
          size="sm"
          variant="outline"
          disabled={!canUndo}
          className="gap-2"
        >
          <Undo size={16} />
          Undo
        </Button>

        <Button
          onClick={onRedo}
          size="sm"
          variant="outline"
          disabled={!canRedo}
          className="gap-2"
        >
          <Redo size={16} />
          Redo
        </Button>
      </div>

      {/* Center Section - Device Presets */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Device:</span>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DEVICE_PRESETS.map((device) => {
            const Icon = device.icon;
            const isActive =
              canvasSize.width === device.width &&
              canvasSize.height === device.height;

            return (
              <button
                key={device.name}
                onClick={() =>
                  onCanvasSizeChange({
                    width: device.width,
                    height: device.height,
                  })
                }
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title={`${device.name} (${device.width}x${device.height})`}
              >
                <Icon size={14} />
                {device.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Section - View Controls and Actions */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors min-w-[50px]"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Action Buttons */}
        <Button
          onClick={onPreview}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Eye size={16} />
          Preview
        </Button>

        <Button
          onClick={onExport}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Code size={16} />
          Export
        </Button>

        {/* Additional Tools */}
        <div className="flex items-center gap-1 ml-2">
          <button
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Grid"
          >
            <Grid size={16} />
          </button>

          <button
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Layers"
          >
            <Layers size={16} />
          </button>

          <button
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ComponentData } from "./types";
import { COMPONENT_DEFINITIONS } from "./ComponentLibrary";
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
} from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: ComponentData[];
  canvasSize: { width: number; height: number };
}

interface PreviewDeviceProps {
  components: ComponentData[];
  width: number;
  height: number;
  zoom: number;
  orientation: "portrait" | "landscape";
}

const PreviewDevice: React.FC<PreviewDeviceProps> = ({
  components,
  width,
  height,
  zoom,
  orientation,
}) => {
  const renderComponent = (component: ComponentData) => {
    const definition = COMPONENT_DEFINITIONS.find(
      (def) => def.type === component.type,
    );
    if (!definition) return null;

    const PreviewComponent = definition.previewComponent;
    return (
      <div key={component.id} className="mb-2">
        <PreviewComponent props={component.props} />
      </div>
    );
  };

  const deviceWidth = orientation === "portrait" ? width : height;
  const deviceHeight = orientation === "portrait" ? height : width;

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="bg-black rounded-3xl shadow-2xl overflow-hidden"
        style={{
          width: (deviceWidth + 40) * zoom,
          height: (deviceHeight + 80) * zoom,
          transform: `scale(${zoom})`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: zoom, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Device Frame */}
        <div className="p-5">
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ width: deviceWidth, height: deviceHeight }}
          >
            {/* Status Bar */}
            <div className="bg-black text-white text-xs px-4 py-2 flex justify-between items-center">
              <span>9:41</span>
              <span>Carrier</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3 h-1 bg-white rounded-sm" />
                </div>
                <span>100%</span>
              </div>
            </div>

            {/* App Content */}
            <div
              className="p-4 overflow-auto"
              style={{ height: deviceHeight - 32 }}
            >
              {components.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Smartphone className="mx-auto mb-4" size={48} />
                    <p className="text-lg font-medium mb-2">No Components</p>
                    <p className="text-sm">Add components to see the preview</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {components.map(renderComponent)}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  components,
  canvasSize,
}) => {
  const [selectedDevice, setSelectedDevice] = useState("iPhone 12");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [zoom, setZoom] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const devices = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 12", width: 390, height: 844 },
    { name: "iPhone 12 Pro Max", width: 428, height: 926 },
    { name: "iPad", width: 768, height: 1024 },
    { name: "iPad Pro", width: 1024, height: 1366 },
    { name: "Custom", width: canvasSize.width, height: canvasSize.height },
  ];

  const currentDevice =
    devices.find((d) => d.name === selectedDevice) || devices[1];

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 1.5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.3));
  const handleZoomReset = () => setZoom(0.8);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${
          isFullscreen ? "p-0" : "p-4"
        }`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-lg shadow-xl overflow-hidden ${
            isFullscreen
              ? "w-full h-full rounded-none"
              : "max-w-7xl w-full max-h-[95vh]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Preview</h2>

              {/* Device Selector */}
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {devices.map((device) => (
                  <option key={device.name} value={device.name}>
                    {device.name} ({device.width}×{device.height})
                  </option>
                ))}
              </select>

              {/* Orientation Toggle */}
              <div className="flex border rounded-md">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`p-2 ${orientation === "portrait" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                  title="Portrait"
                >
                  <Smartphone size={16} />
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`p-2 ${orientation === "landscape" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                  title="Landscape"
                >
                  <Tablet size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
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

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div
            className="bg-gray-100 overflow-auto"
            style={{ height: isFullscreen ? "calc(100vh - 73px)" : "70vh" }}
          >
            <div className="p-8 min-h-full flex items-center justify-center">
              <PreviewDevice
                components={components}
                width={currentDevice.width}
                height={currentDevice.height}
                zoom={zoom}
                orientation={orientation}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {components.length} component{components.length !== 1 ? "s" : ""}{" "}
              •{selectedDevice} • {orientation} • {Math.round(zoom * 100)}% zoom
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

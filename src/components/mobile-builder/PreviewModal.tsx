"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Download,
  Share,
  QrCode,
  Eye,
  Code,
  X,
} from "lucide-react";
import { CanvasElement } from "./types";
import ComponentRenderer from "./ComponentRenderer";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  title?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  elements,
  title = "App Preview",
}) => {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet">("mobile");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [activeTab, setActiveTab] = useState("preview");

  const getDeviceStyles = () => {
    const baseStyles = {
      mobile: {
        portrait: { width: 375, height: 667 },
        landscape: { width: 667, height: 375 },
      },
      tablet: {
        portrait: { width: 768, height: 1024 },
        landscape: { width: 1024, height: 768 },
      },
    };

    return baseStyles[deviceType][orientation];
  };

  const generateQRCode = () => {
    // In a real implementation, you would generate a QR code
    // that links to a preview URL or Expo snack
    alert("QR Code generation would be implemented here");
  };

  const sharePreview = () => {
    // In a real implementation, you would create a shareable link
    alert("Share functionality would be implemented here");
  };

  const downloadPreview = () => {
    // Generate and download preview as image or PDF
    alert("Download functionality would be implemented here");
  };

  const deviceStyles = getDeviceStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{title}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateQRCode}
                className="flex items-center space-x-1"
              >
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sharePreview}
                className="flex items-center space-x-1"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPreview}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Controls */}
          <div className="w-80 border-r bg-gray-50 p-6 space-y-6">
            {/* Device Selection */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Device Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={deviceType === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeviceType("mobile")}
                    className="flex items-center space-x-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile</span>
                  </Button>
                  <Button
                    variant={deviceType === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeviceType("tablet")}
                    className="flex items-center space-x-1"
                  >
                    <Tablet className="h-4 w-4" />
                    <span>Tablet</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orientation */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Orientation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orientation === "portrait" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrientation("portrait")}
                    className="flex items-center space-x-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Portrait</span>
                  </Button>
                  <Button
                    variant={
                      orientation === "landscape" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setOrientation("landscape")}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Landscape</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Device Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Device Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span>
                      {deviceStyles.width} × {deviceStyles.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orientation:</span>
                    <span className="capitalize">{orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Components:</span>
                    <span>{elements.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Options */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Preview Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Show Status Bar</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Show Navigation Bar</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Show Safe Area</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Show Grid</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Preview Area */}
          <div className="flex-1 p-6 bg-gray-100 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger
                  value="preview"
                  className="flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="flex items-center space-x-1"
                >
                  <Code className="h-4 w-4" />
                  <span>Generated Code</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <div className="flex justify-center">
                  {/* Device Frame */}
                  <div className="relative">
                    {/* Device Bezel */}
                    <div
                      className="bg-gray-800 rounded-3xl p-4 shadow-2xl"
                      style={{
                        width: deviceStyles.width + 32,
                        height: deviceStyles.height + 64,
                      }}
                    >
                      {/* Status Bar */}
                      <div className="bg-black rounded-t-2xl px-4 py-2 flex justify-between items-center text-white text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <span className="ml-2">Carrier</span>
                        </div>
                        <div>9:41 AM</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-2 border border-white rounded-sm">
                            <div className="w-3 h-1 bg-white rounded-sm"></div>
                          </div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>

                      {/* Screen Content */}
                      <div
                        className="bg-white rounded-b-2xl overflow-hidden relative"
                        style={{
                          width: deviceStyles.width,
                          height: deviceStyles.height - 32,
                        }}
                      >
                        <div className="h-full overflow-auto">
                          {elements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <Smartphone className="h-16 w-16 mb-4" />
                              <div className="text-lg font-medium">
                                Empty Screen
                              </div>
                              <div className="text-sm text-center px-8">
                                No components to preview
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0">
                              {elements.map((element) => (
                                <ComponentRenderer
                                  key={element.id}
                                  element={element}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Device Label */}
                    <div className="mt-4 text-center text-sm text-gray-500">
                      {deviceType === "mobile" ? "iPhone 14 Pro" : "iPad Pro"} -{" "}
                      {orientation}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code">
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                      <div className="text-gray-400 mb-2">
                        // Generated React Native Code Preview
                      </div>
                      <div>import React from 'react';</div>
                      <div>
                        import &#123; View, Text, StyleSheet &#125; from
                        'react-native';
                      </div>
                      <div className="mt-2">
                        const GeneratedScreen = () =&gt; &#123;
                      </div>
                      <div className="ml-4">return (</div>
                      <div className="ml-8">
                        &lt;View style=&#123;styles.container&#125;&gt;
                      </div>
                      {elements.map((element, index) => (
                        <div key={element.id} className="ml-12 text-blue-400">
                          &lt;
                          {element.type.charAt(0).toUpperCase() +
                            element.type.slice(1)}{" "}
                          /&gt;
                        </div>
                      ))}
                      <div className="ml-8">&lt;/View&gt;</div>
                      <div className="ml-4">);</div>
                      <div>&#125;;</div>
                      <div className="mt-2 text-gray-400">
                        // Styles and export...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;

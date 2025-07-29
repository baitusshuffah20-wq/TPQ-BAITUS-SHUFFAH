"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExportOptions } from "./types";
import {
  X,
  Download,
  Code,
  Smartphone,
  Monitor,
  Globe,
  FileText,
  Settings,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

interface PlatformCardProps {
  platform: "react-native" | "flutter" | "pwa";
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  title,
  description,
  icon: Icon,
  features,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
        }`}
        onClick={onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icon size={24} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "react-native" | "flutter" | "pwa"
  >("react-native");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    platform: "react-native",
    includeStyles: true,
    includeAssets: true,
    minify: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const platforms = [
    {
      platform: "react-native" as const,
      title: "React Native",
      description: "Cross-platform mobile app development",
      icon: Smartphone,
      features: [
        "iOS & Android compatible",
        "Native performance",
        "Hot reload development",
        "Large ecosystem",
        "TypeScript support",
      ],
    },
    {
      platform: "flutter" as const,
      title: "Flutter",
      description: "Google's UI toolkit for mobile",
      icon: Smartphone,
      features: [
        "Single codebase",
        "Fast development",
        "Beautiful UIs",
        "Hot reload",
        "Dart language",
      ],
    },
    {
      platform: "pwa" as const,
      title: "Progressive Web App",
      description: "Web-based mobile experience",
      icon: Globe,
      features: [
        "Works on any device",
        "No app store needed",
        "Offline capabilities",
        "Easy deployment",
        "SEO friendly",
      ],
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const options: ExportOptions = {
        ...exportOptions,
        platform: selectedPlatform,
      };

      await onExport(options);
      setExportComplete(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Code size={24} />
                  Export Code
                </h2>
                <p className="text-gray-600 mt-1">
                  Generate production-ready code for your mobile app
                </p>
              </div>
              <Button variant="outline" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {exportComplete ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Export Complete!</h3>
                <p className="text-gray-600">
                  Your code has been generated and downloaded.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Choose Platform
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {platforms.map((platform) => (
                      <PlatformCard
                        key={platform.platform}
                        {...platform}
                        isSelected={selectedPlatform === platform.platform}
                        onSelect={() => setSelectedPlatform(platform.platform)}
                      />
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings size={20} />
                    Export Options
                  </h3>
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="includeStyles"
                            className="font-medium"
                          >
                            Include Styles
                          </Label>
                          <p className="text-sm text-gray-600">
                            Export with complete styling information
                          </p>
                        </div>
                        <Switch
                          id="includeStyles"
                          checked={exportOptions.includeStyles}
                          onCheckedChange={(checked) =>
                            handleOptionChange("includeStyles", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="includeAssets"
                            className="font-medium"
                          >
                            Include Assets
                          </Label>
                          <p className="text-sm text-gray-600">
                            Export with image and media references
                          </p>
                        </div>
                        <Switch
                          id="includeAssets"
                          checked={exportOptions.includeAssets}
                          onCheckedChange={(checked) =>
                            handleOptionChange("includeAssets", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="minify" className="font-medium">
                            Minify Code
                          </Label>
                          <p className="text-sm text-gray-600">
                            Compress code for production use
                          </p>
                        </div>
                        <Switch
                          id="minify"
                          checked={exportOptions.minify}
                          onCheckedChange={(checked) =>
                            handleOptionChange("minify", checked)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform-specific Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    What You'll Get
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      {selectedPlatform === "react-native" && (
                        <div className="space-y-2">
                          <p className="font-medium">React Native Files:</p>
                          <ul className="text-sm text-gray-600 space-y-1 ml-4">
                            <li>• Screen component (.tsx)</li>
                            <li>• StyleSheet definitions</li>
                            <li>• Component imports</li>
                            <li>• Navigation setup (if applicable)</li>
                          </ul>
                        </div>
                      )}

                      {selectedPlatform === "flutter" && (
                        <div className="space-y-2">
                          <p className="font-medium">Flutter Files:</p>
                          <ul className="text-sm text-gray-600 space-y-1 ml-4">
                            <li>• Dart widget file (.dart)</li>
                            <li>• Material Design components</li>
                            <li>• Theme configurations</li>
                            <li>• State management setup</li>
                          </ul>
                        </div>
                      )}

                      {selectedPlatform === "pwa" && (
                        <div className="space-y-2">
                          <p className="font-medium">PWA Files:</p>
                          <ul className="text-sm text-gray-600 space-y-1 ml-4">
                            <li>• HTML structure</li>
                            <li>• CSS styles</li>
                            <li>• JavaScript functionality</li>
                            <li>• Service worker (for offline)</li>
                            <li>• Manifest file</li>
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!exportComplete && (
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Platform:{" "}
                {platforms.find((p) => p.platform === selectedPlatform)?.title}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="min-w-[120px]"
                >
                  {isExporting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download size={16} />
                      Export Code
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

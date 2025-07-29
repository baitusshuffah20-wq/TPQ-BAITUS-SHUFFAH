"use client";

import React, { useState, useEffect } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  Apple,
  Upload,
  Download,
  Settings,
  Eye,
  Palette,
  Users,
  UserCheck,
  RefreshCw,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import BuildProgressModal from "@/components/BuildProgressModal";
import ImagePreview from "@/components/ImagePreview";
import ImageDebugInfo from "@/components/ImageDebugInfo";

interface AppConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  buildNumber: number;
  icon: string | null;
  splashScreen: string | null;
  primaryColor: string;
  secondaryColor: string;
  features: {
    [key: string]: boolean;
  };
  template: string;
}

interface BuildStatus {
  isBuilding: boolean;
  platform: string | null;
  appType: string | null;
  progress: number;
  status: string;
  logs: string[];
  downloadUrl: string | null;
  buildId: string | null;
}

const AVAILABLE_FEATURES = {
  wali: {
    dashboard: {
      name: "Dashboard Utama",
      description: "Dashboard dengan ringkasan informasi santri",
    },
    progress: {
      name: "Progress Santri",
      description: "Melihat perkembangan belajar santri",
    },
    payment: {
      name: "Pembayaran SPP",
      description: "Sistem pembayaran SPP online",
    },
    messages: {
      name: "Pesan & Notifikasi",
      description: "Komunikasi dengan musyrif dan admin",
    },
    profile: {
      name: "Profil Wali",
      description: "Manajemen profil dan data wali",
    },
    attendance: {
      name: "Absensi Santri",
      description: "Melihat kehadiran santri",
    },
    schedule: {
      name: "Jadwal Pelajaran",
      description: "Melihat jadwal pelajaran santri",
    },
    achievements: {
      name: "Prestasi Santri",
      description: "Melihat pencapaian dan prestasi",
    },
    donations: { name: "Donasi", description: "Sistem donasi untuk TPQ" },
    events: {
      name: "Event & Kegiatan",
      description: "Informasi event dan kegiatan TPQ",
    },
  },
  musyrif: {
    dashboard: {
      name: "Dashboard Musyrif",
      description: "Dashboard khusus untuk musyrif",
    },
    students: {
      name: "Manajemen Santri",
      description: "Kelola data dan progress santri",
    },
    attendance: {
      name: "Input Absensi",
      description: "Input kehadiran santri",
    },
    grades: {
      name: "Input Nilai",
      description: "Input nilai dan penilaian santri",
    },
    schedule: {
      name: "Jadwal Mengajar",
      description: "Melihat dan kelola jadwal mengajar",
    },
    reports: {
      name: "Laporan",
      description: "Generate laporan progress santri",
    },
    messages: {
      name: "Komunikasi",
      description: "Komunikasi dengan wali dan admin",
    },
    profile: {
      name: "Profil Musyrif",
      description: "Manajemen profil musyrif",
    },
    materials: {
      name: "Materi Pelajaran",
      description: "Kelola materi dan kurikulum",
    },
    assessments: {
      name: "Penilaian",
      description: "Sistem penilaian komprehensif",
    },
  },
};

const TEMPLATES = {
  modern: {
    name: "Modern",
    description: "Design modern dengan warna-warna cerah",
  },
  classic: {
    name: "Classic",
    description: "Design klasik dengan warna tradisional",
  },
  islamic: {
    name: "Islamic",
    description: "Design bernuansa islami dengan warna hijau",
  },
  minimal: { name: "Minimal", description: "Design minimalis dan clean" },
};

export default function MobileAppGenerator() {
  // Add breadcrumb data
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Mobile Apps", href: "#" },
    { label: "App Generator", href: "/dashboard/admin/mobile-app-generator" },
  ];
  const [activeTab, setActiveTab] = useState("wali");
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    isBuilding: false,
    platform: null,
    appType: null,
    progress: 0,
    status: "idle",
    logs: [],
    downloadUrl: null,
    buildId: null,
  });

  const [imageErrors, setImageErrors] = useState<{
    [key: string]: boolean;
  }>({});

  const [waliConfig, setWaliConfig] = useState<AppConfig>({
    id: "wali",
    name: "TPQ Wali Santri",
    displayName: "TPQ Wali",
    description: "Aplikasi untuk wali santri TPQ Baitus Shuffah",
    version: "1.0.0",
    buildNumber: 1,
    icon: null,
    splashScreen: null,
    primaryColor: "#1e40af",
    secondaryColor: "#3b82f6",
    features: Object.keys(AVAILABLE_FEATURES.wali).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as { [key: string]: boolean },
    ),
    template: "modern",
  });

  const [musyrifConfig, setMusyrifConfig] = useState<AppConfig>({
    id: "musyrif",
    name: "TPQ Musyrif",
    displayName: "TPQ Musyrif",
    description: "Aplikasi untuk musyrif TPQ Baitus Shuffah",
    version: "1.0.0",
    buildNumber: 1,
    icon: null,
    splashScreen: null,
    primaryColor: "#059669",
    secondaryColor: "#10b981",
    features: Object.keys(AVAILABLE_FEATURES.musyrif).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as { [key: string]: boolean },
    ),
    template: "islamic",
  });

  const [buildHistory, setBuildHistory] = useState<any[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<"android" | "ios">(
    "android",
  );
  const [currentAppType, setCurrentAppType] = useState<"wali" | "musyrif">(
    "wali",
  );

  useEffect(() => {
    loadBuildHistory();
    // Setup WebSocket for real-time updates
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    // WebSocket connection for real-time build updates
    const ws = new WebSocket("ws://localhost:3002");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    return () => ws.close();
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "build_started":
        setBuildStatus((prev) => ({
          ...prev,
          isBuilding: true,
          status: "building",
          progress: 0,
          buildId: data.buildId,
        }));
        break;
      case "build_progress":
        setBuildStatus((prev) => ({
          ...prev,
          progress: data.progress,
          logs: [...prev.logs, data.message],
        }));
        break;
      case "build_completed":
        setBuildStatus((prev) => ({
          ...prev,
          isBuilding: false,
          status: "completed",
          progress: 100,
          downloadUrl: data.downloadUrl,
        }));
        toast.success("Build completed successfully!");
        loadBuildHistory();
        break;
      case "build_failed":
        setBuildStatus((prev) => ({
          ...prev,
          isBuilding: false,
          status: "failed",
          logs: [...prev.logs, `Error: ${data.error}`],
        }));
        toast.error("Build failed: " + data.error);
        break;
    }
  };

  const loadBuildHistory = async () => {
    try {
      const response = await fetch("/api/mobile-builds/history");
      const data = await response.json();
      setBuildHistory(data.builds || []);
    } catch (error) {
      console.error("Failed to load build history:", error);
    }
  };

  const updateConfig = (
    type: "wali" | "musyrif",
    updates: Partial<AppConfig>,
  ) => {
    if (type === "wali") {
      setWaliConfig((prev) => ({ ...prev, ...updates }));
    } else {
      setMusyrifConfig((prev) => ({ ...prev, ...updates }));
    }
  };

  const toggleFeature = (type: "wali" | "musyrif", feature: string) => {
    const config = type === "wali" ? waliConfig : musyrifConfig;
    const newFeatures = {
      ...config.features,
      [feature]: !config.features[feature],
    };
    updateConfig(type, { features: newFeatures });
  };

  const handleFileUpload = async (
    type: "wali" | "musyrif",
    fileType: "icon" | "splashScreen",
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("appType", type);
    formData.append("fileType", fileType);

    try {
      const response = await fetch("/api/mobile-builds/upload-asset", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", data);

      if (data.success) {
        updateConfig(type, { [fileType]: data.filePath });
        toast.success(`${fileType} uploaded successfully!`);

        // Test image access
        setTimeout(async () => {
          try {
            const testResponse = await fetch(`/api/mobile-builds/test-image?path=${encodeURIComponent(data.filePath)}`);
            const testData = await testResponse.json();
            console.log("Image test result:", testData);
          } catch (testError) {
            console.error("Image test error:", testError);
          }
        }, 1000);
      } else {
        console.error("Upload failed:", data.error);
        toast.error("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error);
    }
  };

  const resetAsset = async (
    type: "wali" | "musyrif",
    fileType: "icon" | "splashScreen",
  ) => {
    try {
      const response = await fetch("/api/mobile-builds/reset-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appType: type, fileType }),
      });

      const data = await response.json();
      if (data.success) {
        updateConfig(type, { [fileType]: null });
        toast.success(`${fileType} reset successfully!`);
      } else {
        toast.error("Reset failed: " + data.error);
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Reset failed: " + error);
    }
  };

  const generateApp = async (
    platform: "android" | "ios",
    appType: "wali" | "musyrif",
  ) => {
    const config = appType === "wali" ? waliConfig : musyrifConfig;

    // Generate unique build ID
    const buildId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Set current build info and show modal
    setCurrentBuildId(buildId);
    setCurrentPlatform(platform);
    setCurrentAppType(appType);
    setShowProgressModal(true);

    setBuildStatus({
      isBuilding: true,
      platform,
      appType,
      progress: 0,
      status: "starting",
      logs: [`Starting ${platform} build for ${appType} app...`],
      downloadUrl: null,
      buildId,
    });

    try {
      const response = await fetch("/api/mobile-builds/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          appType,
          config,
          buildId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(`${platform} build started for ${appType} app!`);
    } catch (error) {
      setBuildStatus((prev) => ({
        ...prev,
        isBuilding: false,
        status: "failed",
        logs: [...prev.logs, `Error: ${error}`],
      }));
      toast.error("Failed to start build: " + error);
    }
  };

  const previewApp = (appType: "wali" | "musyrif") => {
    const config = appType === "wali" ? waliConfig : musyrifConfig;
    // Force refresh preview with current config
    const previewUrl = `/api/mobile-builds/preview?appType=${appType}&config=${encodeURIComponent(JSON.stringify(config))}&t=${Date.now()}`;
    window.open(previewUrl, "_blank");
  };

  const renderAppConfig = (type: "wali" | "musyrif") => {
    const config = type === "wali" ? waliConfig : musyrifConfig;
    const features = AVAILABLE_FEATURES[type];
    const isWali = type === "wali";

    return (
      <div className="space-y-6">
        {/* Basic Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Konfigurasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${type}-name`}>Nama Aplikasi</Label>
                <Input
                  id={`${type}-name`}
                  value={config.displayName}
                  onChange={(e) =>
                    updateConfig(type, { displayName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor={`${type}-version`}>Versi</Label>
                <Input
                  id={`${type}-version`}
                  value={config.version}
                  onChange={(e) =>
                    updateConfig(type, { version: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`${type}-description`}>Deskripsi</Label>
              <Input
                id={`${type}-description`}
                value={config.description}
                onChange={(e) =>
                  updateConfig(type, { description: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Konfigurasi Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <div>
              <Label>Template Design</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={config.template === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConfig(type, { template: key })}
                    className={`h-auto p-3 flex flex-col items-center transition-all duration-200 ${
                      config.template === key
                        ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs opacity-80 text-center">
                      {template.description}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${type}-primary`}>Warna Primer</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`${type}-primary`}
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) =>
                      updateConfig(type, { primaryColor: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) =>
                      updateConfig(type, { primaryColor: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`${type}-secondary`}>Warna Sekunder</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`${type}-secondary`}
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) =>
                      updateConfig(type, { secondaryColor: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.secondaryColor}
                    onChange={(e) =>
                      updateConfig(type, { secondaryColor: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Asset Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Icon Aplikasi</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {config.icon ? (
                    <div className="space-y-2">
                      <ImagePreview
                        src={config.icon}
                        alt="App Icon"
                        className="w-16 h-16 mx-auto rounded object-cover"
                        fallbackClassName="w-16 h-16"
                        onError={() => {
                          setImageErrors(prev => ({
                            ...prev,
                            [`${type}-icon`]: true
                          }));
                        }}
                        onLoad={() => {
                          setImageErrors(prev => ({
                            ...prev,
                            [`${type}-icon`]: false
                          }));
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById(`${type}-icon-upload`)
                              ?.click()
                          }
                          className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          Ganti Icon
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetAsset(type, "icon")}
                          className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <ImageDebugInfo
                        imagePath={config.icon}
                        appType={type}
                        fileType="icon"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <Button
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`${type}-icon-upload`)
                            ?.click()
                        }
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Upload Icon
                      </Button>
                    </div>
                  )}
                  <input
                    id={`${type}-icon-upload`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(type, "icon", file);
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Splash Screen</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {config.splashScreen ? (
                    <div className="space-y-2">
                      <ImagePreview
                        src={config.splashScreen}
                        alt="Splash Screen"
                        className="w-16 h-24 mx-auto rounded object-cover"
                        fallbackClassName="w-16 h-24"
                        onError={() => {
                          setImageErrors(prev => ({
                            ...prev,
                            [`${type}-splash`]: true
                          }));
                        }}
                        onLoad={() => {
                          setImageErrors(prev => ({
                            ...prev,
                            [`${type}-splash`]: false
                          }));
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById(`${type}-splash-upload`)
                              ?.click()
                          }
                          className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          Ganti Splash
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetAsset(type, "splashScreen")}
                          className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <ImageDebugInfo
                        imagePath={config.splashScreen}
                        appType={type}
                        fileType="splashScreen"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <Button
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`${type}-splash-upload`)
                            ?.click()
                        }
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Upload Splash
                      </Button>
                    </div>
                  )}
                  <input
                    id={`${type}-splash-upload`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(type, "splashScreen", file);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isWali ? (
                <Users className="h-5 w-5" />
              ) : (
                <UserCheck className="h-5 w-5" />
              )}
              Fitur Aplikasi {isWali ? "Wali" : "Musyrif"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(features).map(([key, feature]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                  <Switch
                    checked={config.features[key]}
                    onCheckedChange={() => toggleFeature(type, key)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Aplikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => previewApp(type)}
                variant="outline"
                className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={() => generateApp("android", type)}
                disabled={buildStatus.isBuilding}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                <Smartphone className="h-4 w-4" />
                Generate Android APK
              </Button>
              <Button
                onClick={() => generateApp("ios", type)}
                disabled={buildStatus.isBuilding}
                variant="outline"
                className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Apple className="h-4 w-4" />
                Generate iOS IPA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <iframe
                src={`/api/mobile-builds/preview?appType=${type}&config=${encodeURIComponent(JSON.stringify(config))}&inline=true&t=${Date.now()}`}
                className="w-full h-[500px] border-0 rounded-lg"
                title={`Preview ${config.displayName}`}
                key={`${type}-${config.primaryColor}-${config.secondaryColor}-${config.template}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <a
                  href={item.href}
                  className={`ml-1 text-sm font-medium ${
                    index === breadcrumbItems.length - 1
                      ? "text-gray-500 cursor-default"
                      : "text-gray-700 hover:text-blue-600"
                  } md:ml-2`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  window.open(
                    "/dashboard/admin/mobile-app-generator/builder",
                    "_blank",
                  )
                }
                className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
              >
                <Settings className="h-4 w-4" />
                Open Drag & Drop Builder
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("history")}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                View Build History
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mobile App Generator</h1>
            <p className="text-muted-foreground">
              Generate aplikasi mobile terpisah untuk Wali dan Musyrif dengan
              kustomisasi penuh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={buildStatus.isBuilding ? "default" : "secondary"}
              className={
                buildStatus.isBuilding
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }
            >
              {buildStatus.isBuilding ? "Building..." : "Ready"}
            </Badge>
          </div>
        </div>

        {/* Build Status */}
        {buildStatus.isBuilding && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Building {buildStatus.appType} for {buildStatus.platform}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={buildStatus.progress} className="w-full" />
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-40 overflow-y-auto">
                  {buildStatus.logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        {buildStatus.downloadUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Build Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <p>
                  Your {buildStatus.appType} app for {buildStatus.platform} is
                  ready!
                </p>
                <Button
                  asChild
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <a href={buildStatus.downloadUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger
              value="wali"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Aplikasi Wali
            </TabsTrigger>
            <TabsTrigger
              value="musyrif"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <UserCheck className="h-4 w-4" />
              Aplikasi Musyrif
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4" />
              Riwayat Build
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wali">{renderAppConfig("wali")}</TabsContent>

          <TabsContent value="musyrif">
            {renderAppConfig("musyrif")}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Build</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buildHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada riwayat build
                    </p>
                  ) : (
                    buildHistory.map((build, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {build.platform === "android" ? (
                              <Smartphone className="h-5 w-5" />
                            ) : (
                              <Apple className="h-5 w-5" />
                            )}
                            <span className="font-medium">{build.appType}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(build.createdAt).toLocaleString()}
                          </div>
                          <Badge
                            variant={
                              build.status === "completed"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              build.status === "completed"
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }
                          >
                            {build.status}
                          </Badge>
                        </div>
                        {build.downloadUrl && (
                          <Button
                            size="sm"
                            asChild
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <a href={build.downloadUrl} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Build Progress Modal */}
      <BuildProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        buildId={currentBuildId}
        platform={currentPlatform}
        appType={currentAppType}
      />
    </DashboardLayout>
  );
}

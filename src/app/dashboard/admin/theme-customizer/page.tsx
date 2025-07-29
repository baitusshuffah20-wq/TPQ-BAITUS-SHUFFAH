"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Palette,
  Save,
  RefreshCw,
  Check,
  Undo2,
  Eye,
  Layout,
  Type,
  Image,
  Sliders,
  Brush,
  Layers,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  List,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme, ThemeConfig, defaultTheme } from "@/lib/theme-context";

type TabType =
  | "colors"
  | "buttons"
  | "typography"
  | "layout"
  | "branding"
  | "saved";

export default function ThemeCustomizerPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const {
    theme: currentTheme,
    activeTheme,
    allThemes,
    isLoading,
    saveTheme,
    updateTheme,
    deleteTheme,
    activateTheme,
    applyTheme,
    resetTheme,
  } = useTheme();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?callbackUrl=/dashboard/admin/theme-customizer");
    } else if (!loading && user && user.role !== "ADMIN") {
      router.push("/dashboard");
      toast.error("Only administrators can access the theme customizer");
    }
  }, [user, isAuthenticated, loading, router]);

  const [theme, setTheme] = useState<ThemeConfig>(currentTheme);
  const [originalTheme, setOriginalTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("colors");
  const [themeName, setThemeName] = useState("");
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    // Ensure buttons field exists
    const themeWithButtons = {
      ...currentTheme,
      buttons: currentTheme.buttons || {
        primary: currentTheme.colors.primary,
        secondary: currentTheme.colors.secondary,
        accent: currentTheme.colors.accent,
        danger: currentTheme.colors.error,
        info: "#3B82F6",
      },
    };

    setTheme(themeWithButtons);
    setOriginalTheme(themeWithButtons);
  }, [currentTheme]);

  // Color synchronization function
  const syncRelatedColors = (colorKey: string, value: string) => {
    const updatedTheme = { ...theme };

    switch (colorKey) {
      case "primary":
        // Sync primary color with button
        updatedTheme.buttons.primary = value;
        break;
      case "secondary":
        // Sync secondary color with button
        updatedTheme.buttons.secondary = value;
        break;
      case "accent":
        // Sync accent color with success and button
        updatedTheme.colors.success = value;
        updatedTheme.buttons.accent = value;
        break;
      case "error":
        // Sync error color with danger button
        updatedTheme.buttons.danger = value;
        break;
    }

    return updatedTheme;
  };

  // Update color handler
  const handleColorChange = (key: string, value: string) => {
    const updatedTheme = syncRelatedColors(key, value);

    setTheme({
      ...updatedTheme,
      colors: {
        ...updatedTheme.colors,
        [key]: value,
      },
    });

    if (previewMode) {
      applyTheme(updatedTheme);
    }
  };

  // Update button color handler
  const handleButtonColorChange = (key: string, value: string) => {
    setTheme((prev) => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [key]: value,
      },
    }));

    if (previewMode) {
      applyTheme({
        ...theme,
        buttons: {
          ...theme.buttons,
          [key]: value,
        },
      });
    }
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }

    if (!user || user.role !== "ADMIN") {
      toast.error("Only administrators can save themes");
      return;
    }

    try {
      setSaving(true);
      // Pastikan semua field required selalu ada
      const themeToSave = {
        name: themeName.trim(),
        colors: {
          primary: theme.colors.primary || defaultTheme.colors.primary,
          secondary: theme.colors.secondary || defaultTheme.colors.secondary,
          accent: theme.colors.accent || defaultTheme.colors.accent,
          background: theme.colors.background || defaultTheme.colors.background,
          text: theme.colors.text || defaultTheme.colors.text,
          success: theme.colors.success || defaultTheme.colors.success,
          warning: theme.colors.warning || defaultTheme.colors.warning,
          error: theme.colors.error || defaultTheme.colors.error,
        },
        buttons: {
          primary:
            theme.buttons.primary ||
            theme.colors.primary ||
            defaultTheme.buttons.primary,
          secondary:
            theme.buttons.secondary ||
            theme.colors.secondary ||
            defaultTheme.buttons.secondary,
          accent:
            theme.buttons.accent ||
            theme.colors.accent ||
            defaultTheme.buttons.accent,
          danger:
            theme.buttons.danger ||
            theme.colors.error ||
            defaultTheme.buttons.danger,
          info:
            theme.buttons.info ||
            theme.colors.accent ||
            defaultTheme.buttons.info,
        },
        fonts: {
          heading: theme.fonts.heading || defaultTheme.fonts.heading,
          body: theme.fonts.body || defaultTheme.fonts.body,
          arabic: theme.fonts.arabic || defaultTheme.fonts.arabic,
        },
        layout: {
          borderRadius:
            theme.layout.borderRadius || defaultTheme.layout.borderRadius,
          containerWidth:
            theme.layout.containerWidth || defaultTheme.layout.containerWidth,
          sidebarStyle:
            theme.layout.sidebarStyle || defaultTheme.layout.sidebarStyle,
        },
        logo: {
          main: theme.logo.main || defaultTheme.logo.main,
          alt: theme.logo.alt || defaultTheme.logo.alt,
          favicon: theme.logo.favicon || defaultTheme.logo.favicon,
        },
      };

      let savedTheme;
      if (editingThemeId) {
        savedTheme = await updateTheme(editingThemeId, themeToSave);
      } else {
        savedTheme = await saveTheme(themeToSave);
      }

      if (savedTheme) {
        setOriginalTheme(themeToSave);
        setShowSaveModal(false);
        setEditingThemeId(null);
        setThemeName("");
        if (previewMode) {
          applyTheme(themeToSave);
        }
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      // Error handling is done in theme context
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = () => {
    if (originalTheme) {
      setTheme({ ...originalTheme });
      toast.success("Theme reset to last saved settings");
    } else {
      resetTheme();
      toast.success("Theme reset to default settings");
    }
  };

  const handleFontChange = (
    fontKey: keyof ThemeConfig["fonts"],
    value: string,
  ) => {
    setTheme((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
    }));
  };

  const handleLayoutChange = (
    layoutKey: keyof ThemeConfig["layout"],
    value: string,
  ) => {
    setTheme((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [layoutKey]: value,
      },
    }));
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);

    if (!previewMode) {
      // Apply the current theme for preview, ensuring button colors are set
      const previewTheme = {
        ...theme,
        buttons: {
          primary: theme.buttons.primary || theme.colors.primary,
          secondary: theme.buttons.secondary || theme.colors.secondary,
          accent: theme.buttons.accent || theme.colors.accent,
          danger: theme.buttons.danger || theme.colors.error,
          info: theme.buttons.info || theme.colors.accent,
        },
      };
      applyTheme(previewTheme);
      toast.success("Preview mode active - changes temporarily applied");
    } else {
      // Revert to the original theme
      if (originalTheme) {
        const originalWithButtons = {
          ...originalTheme,
          buttons: originalTheme.buttons || {
            primary: originalTheme.colors.primary,
            secondary: originalTheme.colors.secondary,
            accent: originalTheme.colors.accent,
            danger: originalTheme.colors.error,
            info: originalTheme.colors.accent,
          },
        };
        applyTheme(originalWithButtons);
        toast.success("Preview mode deactivated - reverted to saved theme");
      }
    }
  };

  const handleEditTheme = (themeId: string) => {
    const themeToEdit = allThemes.find((t) => t.id === themeId);
    if (themeToEdit) {
      setTheme({
        colors: themeToEdit.colors,
        buttons: themeToEdit.buttons || {
          primary: themeToEdit.colors.primary,
          secondary: themeToEdit.colors.secondary,
          accent: themeToEdit.colors.accent,
          danger: themeToEdit.colors.error,
          info: themeToEdit.colors.accent,
        },
        fonts: themeToEdit.fonts,
        layout: themeToEdit.layout,
        logo: themeToEdit.logo,
      });
      setThemeName(themeToEdit.name);
      setEditingThemeId(themeId);
      setShowSaveModal(true);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (window.confirm("Are you sure you want to delete this theme?")) {
      await deleteTheme(themeId);
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    // Check if user is authenticated and is an admin
    if (!user || user.role !== "ADMIN") {
      toast.error("Only administrators can activate themes");
      return;
    }

    // Ensure auth_user cookie is set
    if (typeof window !== "undefined") {
      // Store user data in cookie for server-side access
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))};path=/;max-age=86400`;

      // Ensure auth_token is set
      const authToken = localStorage.getItem("auth_token");
      if (authToken) {
        document.cookie = `auth_token=${authToken};path=/;max-age=86400`;
      }
    }

    try {
      const success = await activateTheme(themeId);
      if (success) {
        toast.success("Theme activated successfully");
      }
    } catch (error) {
      console.error("Error activating theme:", error);
      // Error messages are already handled in the theme context
    }
  };

  const handleApplyChanges = () => {
    // Ensure buttons are updated based on colors if not explicitly set
    const updatedTheme = {
      ...theme,
      buttons: {
        ...theme.buttons,
        primary: theme.buttons.primary || theme.colors.primary,
        secondary: theme.buttons.secondary || theme.colors.secondary,
        accent: theme.buttons.accent || theme.colors.accent,
        danger: theme.buttons.danger || theme.colors.error,
        info: theme.buttons.info || theme.colors.accent,
      },
    };
    setTheme(updatedTheme);
    applyTheme(updatedTheme);
  };

  const fontOptions = [
    { value: "Inter", label: "Inter (Default)" },
    { value: "Poppins", label: "Poppins" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Montserrat", label: "Montserrat" },
  ];

  const arabicFontOptions = [
    { value: "Amiri", label: "Amiri (Default)" },
    { value: "Scheherazade New", label: "Scheherazade New" },
    { value: "Noto Naskh Arabic", label: "Noto Naskh Arabic" },
    { value: "Lateef", label: "Lateef" },
  ];

  const sidebarStyleOptions = [
    { value: "default", label: "Default" },
    { value: "compact", label: "Compact" },
    { value: "expanded", label: "Expanded" },
  ];

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Theme Customizer
            </h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-gray-600">
              Loading theme configuration...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render the page content if not authenticated or not an admin
  if (!isAuthenticated || (user && user.role !== "ADMIN")) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Theme Customizer
            </h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600">
                Only administrators can access the theme customizer.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Palette className="h-8 w-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Theme Customizer
              </h1>
              <p className="text-gray-600">
                Customize the appearance of TPQ Baitus Shuffah
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleResetTheme}
              className="flex items-center gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant={previewMode ? "primary" : "outline"}
              onClick={togglePreviewMode}
              className={`flex items-center gap-2`}
            >
              <Eye className="h-4 w-4" />
              {previewMode ? "Preview Active" : "Preview"}
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Theme</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("colors")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "colors"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Palette className="h-4 w-4" />
              Colors
            </button>
            <button
              onClick={() => setActiveTab("buttons")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "buttons"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Sliders className="h-4 w-4" />
              Buttons
            </button>
            <button
              onClick={() => setActiveTab("typography")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "typography"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Type className="h-4 w-4" />
              Typography
            </button>
            <button
              onClick={() => setActiveTab("layout")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "layout"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Layout className="h-4 w-4" />
              Layout
            </button>
            <button
              onClick={() => setActiveTab("branding")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "branding"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Image className="h-4 w-4" />
              Branding
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "saved"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <List className="h-4 w-4" />
              Saved Themes
            </button>
          </nav>
        </div>

        {/* Colors Tab */}
        {activeTab === "colors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-2">Brand Colors</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Primary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.primary}
                      onChange={(e) =>
                        handleColorChange("primary", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.primary}
                      onChange={(e) =>
                        handleColorChange("primary", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Secondary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.secondary}
                      onChange={(e) =>
                        handleColorChange("secondary", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.secondary}
                      onChange={(e) =>
                        handleColorChange("secondary", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.accent}
                      onChange={(e) =>
                        handleColorChange("accent", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.accent}
                      onChange={(e) =>
                        handleColorChange("accent", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-2">State Colors</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Success</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.success}
                      onChange={(e) =>
                        handleColorChange("success", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.success}
                      onChange={(e) =>
                        handleColorChange("success", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Warning</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.warning}
                      onChange={(e) =>
                        handleColorChange("warning", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.warning}
                      onChange={(e) =>
                        handleColorChange("warning", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Error</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.error}
                      onChange={(e) =>
                        handleColorChange("error", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.error}
                      onChange={(e) =>
                        handleColorChange("error", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-2">Interface Colors</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.background}
                      onChange={(e) =>
                        handleColorChange("background", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.background}
                      onChange={(e) =>
                        handleColorChange("background", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors.text}
                      onChange={(e) =>
                        handleColorChange("text", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.colors.text}
                      onChange={(e) =>
                        handleColorChange("text", e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTheme((prev) => ({
                      ...defaultTheme,
                      fonts: prev.fonts,
                      layout: prev.layout,
                      logo: prev.logo,
                    }));
                    if (previewMode) {
                      applyTheme(defaultTheme);
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Colors
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Buttons Tab */}
        {activeTab === "buttons" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-2">Button Colors</h3>
              <div className="space-y-3">
                {Object.entries(theme.buttons).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium capitalize">
                      {key}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          handleButtonColorChange(key, e.target.value)
                        }
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={value}
                        onChange={(e) =>
                          handleButtonColorChange(key, e.target.value)
                        }
                        className="font-mono"
                      />
                    </div>
                    <Button variant={key as any} size="sm" className="mt-1">
                      Preview {key}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-2">Preview</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="info">Info</Button>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTheme((prev) => ({
                      ...prev,
                      buttons: defaultTheme.buttons,
                    }));
                    if (previewMode) {
                      applyTheme({ ...theme, buttons: defaultTheme.buttons });
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Buttons
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === "typography" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-teal-600" />
                  Font Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading Font
                    </label>
                    <select
                      value={theme.fonts.heading}
                      onChange={(e) =>
                        handleFontChange("heading", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Font used for headings and titles
                    </p>
                    <div
                      className="mt-3 p-3 border rounded-md"
                      style={{ fontFamily: theme.fonts.heading }}
                    >
                      <h3 className="text-lg font-bold">Heading Preview</h3>
                      <p className="text-sm">
                        This is how your headings will look
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Font
                    </label>
                    <select
                      value={theme.fonts.body}
                      onChange={(e) => handleFontChange("body", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Font used for body text and general content
                    </p>
                    <div
                      className="mt-3 p-3 border rounded-md"
                      style={{ fontFamily: theme.fonts.body }}
                    >
                      <p>
                        This is a preview of your body text. It should be easy
                        to read and comfortable for long passages of text.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arabic Font
                    </label>
                    <select
                      value={theme.fonts.arabic}
                      onChange={(e) =>
                        handleFontChange("arabic", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      {arabicFontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Font used for Arabic text and Quran content
                    </p>
                    <div
                      className="mt-3 p-3 border rounded-md"
                      style={{ fontFamily: theme.fonts.arabic }}
                    >
                      <p className="text-right">
                        ?????? ??????? ??????????? ??????????
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === "layout" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-teal-600" />
                  Layout Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Radius
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="text"
                        value={theme.layout.borderRadius}
                        onChange={(e) =>
                          handleLayoutChange("borderRadius", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Roundness of corners (e.g., 0.5rem, 8px)
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div
                        className="p-3 border rounded-md text-center"
                        style={{ borderRadius: theme.layout.borderRadius }}
                      >
                        Preview
                      </div>
                      <div
                        className="p-3 border rounded-md text-center"
                        style={{ borderRadius: theme.layout.borderRadius }}
                      >
                        Preview
                      </div>
                      <div
                        className="p-3 border rounded-md text-center"
                        style={{ borderRadius: theme.layout.borderRadius }}
                      >
                        Preview
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Container Width
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="text"
                        value={theme.layout.containerWidth}
                        onChange={(e) =>
                          handleLayoutChange("containerWidth", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum width of content (e.g., 1280px, 80rem)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sidebar Style
                    </label>
                    <select
                      value={theme.layout.sidebarStyle}
                      onChange={(e) =>
                        handleLayoutChange(
                          "sidebarStyle",
                          e.target.value as "default" | "compact" | "expanded",
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                      {sidebarStyleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Style of the sidebar navigation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-teal-600" />
                  Logo Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={theme.logo.main}
                          onChange={(e) =>
                            setTheme((prev) => ({
                              ...prev,
                              logo: { ...prev.logo, main: e.target.value },
                            }))
                          }
                          placeholder="/logo.png"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          toast.success("Upload feature coming soon")
                        }
                      >
                        Upload
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Main logo for light backgrounds
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-200" />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={theme.logo.alt}
                          onChange={(e) =>
                            setTheme((prev) => ({
                              ...prev,
                              logo: { ...prev.logo, alt: e.target.value },
                            }))
                          }
                          placeholder="/logo-alt.png"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          toast.success("Upload feature coming soon")
                        }
                      >
                        Upload
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Alternative logo for dark backgrounds
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={theme.logo.favicon}
                          onChange={(e) =>
                            setTheme((prev) => ({
                              ...prev,
                              logo: { ...prev.logo, favicon: e.target.value },
                            }))
                          }
                          placeholder="/favicon.ico"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          toast.success("Upload feature coming soon")
                        }
                      >
                        Upload
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Icon for browser tabs (32x32 or 64x64 size)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Saved Themes Tab */}
        {activeTab === "saved" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-teal-600" />
                  Saved Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allThemes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No saved themes yet. Create and save a theme to see it
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allThemes.map((savedTheme) => (
                      <div
                        key={savedTheme.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-full"
                            style={{
                              backgroundColor: savedTheme.colors.primary,
                            }}
                          ></div>
                          <div>
                            <h3 className="font-medium">{savedTheme.name}</h3>
                            <p className="text-sm text-gray-500">
                              Created:{" "}
                              {new Date(
                                savedTheme.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {savedTheme.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTheme(savedTheme.id)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          {!savedTheme.isActive && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleActivateTheme(savedTheme.id)
                                }
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Activate
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTheme(savedTheme.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Save Theme Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingThemeId ? "Update Theme" : "Save Theme"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Name
              </label>
              <Input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="My Custom Theme"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveModal(false);
                  setEditingThemeId(null);
                  setThemeName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTheme}
                disabled={saving || !themeName.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingThemeId ? "Update" : "Save"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

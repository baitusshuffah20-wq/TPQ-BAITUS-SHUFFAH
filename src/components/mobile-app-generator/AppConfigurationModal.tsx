import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit3 } from "lucide-react";
import MenuItemEditor from "./MenuItemEditor";
import BottomTabEditor from "./BottomTabEditor";

interface MenuGridItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  route: string;
}

interface BottomTabItem {
  name: string;
  title: string;
  icon: string;
}

interface AppConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appType: "wali" | "musyrif";
  onSave: (config: any) => void;
}

const AppConfigurationModal: React.FC<AppConfigurationModalProps> = ({
  isOpen,
  onClose,
  appType,
  onSave,
}) => {
  // Default menu grid untuk musyrif
  const [menuGrid, setMenuGrid] = useState<MenuGridItem[]>([
    { id: 1, title: "Data Santri", icon: "people", color: "#3B82F6", route: "santri" },
    { id: 2, title: "Halaqah", icon: "book", color: "#059669", route: "halaqah" },
    { id: 3, title: "Hafalan", icon: "library", color: "#DC2626", route: "hafalan" },
    { id: 4, title: "Absensi", icon: "checkmark-circle", color: "#F59E0B", route: "attendance" },
    { id: 5, title: "Penilaian", icon: "star", color: "#8B5CF6", route: "assessment" },
    { id: 6, title: "Perilaku", icon: "heart", color: "#EC4899", route: "behavior" },
    { id: 7, title: "Prestasi", icon: "trophy", color: "#10B981", route: "achievements" },
    { id: 8, title: "Laporan", icon: "document-text", color: "#6B7280", route: "reports" },
  ]);

  // Default bottom tabs untuk musyrif
  const [bottomTabs, setBottomTabs] = useState<BottomTabItem[]>([
    { name: "Dashboard", title: "Dashboard", icon: "analytics" },
    { name: "Santri", title: "Santri", icon: "people" },
    { name: "Hafalan", title: "Hafalan", icon: "book" },
    { name: "Wallet", title: "Wallet", icon: "wallet" },
    { name: "Profile", title: "Profil", icon: "person" },
  ]);

  const [editingMenuItem, setEditingMenuItem] = useState<MenuGridItem | null>(null);
  const [editingTabItem, setEditingTabItem] = useState<BottomTabItem | null>(null);
  const [editingTabIndex, setEditingTabIndex] = useState<number>(-1);

  // Helper function to get emoji for icon
  const getIconEmoji = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      "people": "👥",
      "book": "📚",
      "library": "📖",
      "checkmark-circle": "✅",
      "star": "⭐",
      "heart": "❤️",
      "trophy": "🏆",
      "document-text": "📄",
      "analytics": "📊",
      "wallet": "💰",
      "person": "👤",
      "calendar": "📅",
      "settings": "⚙️",
      "notifications": "🔔",
      "home": "🏠",
      "search": "🔍",
      "add": "➕",
      "edit": "✏️",
      "save": "💾",
      "share": "📤",
      "download": "⬇️",
      "upload": "⬆️",
      "camera": "📷",
      "image": "🖼️",
      "video": "🎥",
      "music": "🎵",
      "mail": "📧",
      "call": "📞",
      "location": "📍",
      "time": "⏰",
      "lock": "🔒",
      "unlock": "🔓",
      "eye": "👁️",
      "eye-off": "🙈"
    };
    return iconMap[iconName] || "📱";
  };

  // Available icons
  const availableIcons = [
    "people", "book", "library", "checkmark-circle", "star", "heart", "trophy", 
    "document-text", "analytics", "wallet", "person", "calendar", "settings",
    "notifications", "home", "search", "add", "remove", "edit", "save",
    "share", "download", "upload", "camera", "image", "video", "music",
    "mail", "call", "location", "time", "lock", "unlock", "eye", "eye-off"
  ];

  // Available colors
  const availableColors = [
    "#3B82F6", "#059669", "#DC2626", "#F59E0B", "#8B5CF6", "#EC4899",
    "#10B981", "#6B7280", "#EF4444", "#F97316", "#84CC16", "#06B6D4",
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"
  ];

  const handleSaveMenuItem = (item: MenuGridItem) => {
    if (editingMenuItem) {
      setMenuGrid(prev => prev.map(menu => menu.id === item.id ? item : menu));
    } else {
      setMenuGrid(prev => [...prev, { ...item, id: Date.now() }]);
    }
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = (id: number) => {
    setMenuGrid(prev => prev.filter(menu => menu.id !== id));
  };

  const handleSaveTabItem = (item: BottomTabItem) => {
    if (editingTabIndex >= 0) {
      setBottomTabs(prev => prev.map((tab, i) => i === editingTabIndex ? item : tab));
    }
    setEditingTabItem(null);
    setEditingTabIndex(-1);
  };

  const handleSaveConfiguration = () => {
    const config = {
      appType,
      menuGrid,
      bottomTabs,
      updatedAt: new Date().toISOString(),
    };
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Konfigurasi Aplikasi Mobile {appType === "musyrif" ? "Musyrif" : "Wali"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="menu-grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu-grid">Menu Grid</TabsTrigger>
            <TabsTrigger value="bottom-tabs">Bottom Navigation</TabsTrigger>
          </TabsList>

          <TabsContent value="menu-grid" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Menu Grid Items</h3>
              <Button
                onClick={() => setEditingMenuItem({ id: 0, title: "", icon: "people", color: "#3B82F6", route: "" })}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Menu
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {menuGrid.map((menu) => (
                <Card key={menu.id} className="relative">
                  <CardContent className="p-4 text-center">
                    <div
                      className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: menu.color + "20" }}
                    >
                      <span className="text-lg" style={{ color: menu.color }}>
                        {getIconEmoji(menu.icon)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{menu.title}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {menu.icon}
                    </Badge>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMenuItem(menu)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMenuItem(menu.id)}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bottom-tabs" className="space-y-4">
            <h3 className="text-lg font-semibold">Bottom Navigation Tabs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {bottomTabs.map((tab, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center bg-green-100">
                      <span className="text-lg text-green-600">
                        {getIconEmoji(tab.icon)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{tab.title}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tab.icon}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingTabItem(tab);
                        setEditingTabIndex(index);
                      }}
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSaveConfiguration}>
            Simpan Konfigurasi
          </Button>
        </DialogFooter>

        {/* Menu Item Editor Modal */}
        <MenuItemEditor
          isOpen={!!editingMenuItem}
          onClose={() => setEditingMenuItem(null)}
          item={editingMenuItem}
          onSave={handleSaveMenuItem}
        />

        {/* Bottom Tab Editor Modal */}
        <BottomTabEditor
          isOpen={!!editingTabItem}
          onClose={() => {
            setEditingTabItem(null);
            setEditingTabIndex(-1);
          }}
          item={editingTabItem}
          onSave={handleSaveTabItem}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppConfigurationModal;

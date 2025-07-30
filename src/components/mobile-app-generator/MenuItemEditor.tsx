import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenuGridItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  route: string;
}

interface MenuItemEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuGridItem | null;
  onSave: (item: MenuGridItem) => void;
}

const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  const [formData, setFormData] = useState<MenuGridItem>({
    id: 0,
    title: "",
    icon: "people",
    color: "#3B82F6",
    route: "",
  });

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
    { value: "people", label: "People (👥)" },
    { value: "book", label: "Book (📚)" },
    { value: "library", label: "Library (📖)" },
    { value: "checkmark-circle", label: "Checkmark (✅)" },
    { value: "star", label: "Star (⭐)" },
    { value: "heart", label: "Heart (❤️)" },
    { value: "trophy", label: "Trophy (🏆)" },
    { value: "document-text", label: "Document (📄)" },
    { value: "analytics", label: "Analytics (📊)" },
    { value: "wallet", label: "Wallet (💰)" },
    { value: "person", label: "Person (👤)" },
    { value: "calendar", label: "Calendar (📅)" },
    { value: "settings", label: "Settings (⚙️)" },
    { value: "notifications", label: "Notifications (🔔)" },
    { value: "home", label: "Home (🏠)" },
    { value: "search", label: "Search (🔍)" },
    { value: "add", label: "Add (➕)" },
    { value: "edit", label: "Edit (✏️)" },
    { value: "save", label: "Save (💾)" },
    { value: "share", label: "Share (📤)" },
    { value: "download", label: "Download (⬇️)" },
    { value: "upload", label: "Upload (⬆️)" },
    { value: "camera", label: "Camera (📷)" },
    { value: "image", label: "Image (🖼️)" },
    { value: "video", label: "Video (🎥)" },
    { value: "music", label: "Music (🎵)" },
    { value: "mail", label: "Mail (📧)" },
    { value: "call", label: "Call (📞)" },
    { value: "location", label: "Location (📍)" },
    { value: "time", label: "Time (⏰)" },
    { value: "lock", label: "Lock (🔒)" },
    { value: "unlock", label: "Unlock (🔓)" },
    { value: "eye", label: "Eye (👁️)" },
    { value: "eye-off", label: "Eye Off (🙈)" },
  ];

  // Available colors
  const availableColors = [
    { value: "#3B82F6", label: "Blue", preview: "#3B82F6" },
    { value: "#059669", label: "Green", preview: "#059669" },
    { value: "#DC2626", label: "Red", preview: "#DC2626" },
    { value: "#F59E0B", label: "Yellow", preview: "#F59E0B" },
    { value: "#8B5CF6", label: "Purple", preview: "#8B5CF6" },
    { value: "#EC4899", label: "Pink", preview: "#EC4899" },
    { value: "#10B981", label: "Emerald", preview: "#10B981" },
    { value: "#6B7280", label: "Gray", preview: "#6B7280" },
    { value: "#EF4444", label: "Rose", preview: "#EF4444" },
    { value: "#F97316", label: "Orange", preview: "#F97316" },
    { value: "#84CC16", label: "Lime", preview: "#84CC16" },
    { value: "#06B6D4", label: "Cyan", preview: "#06B6D4" },
  ];

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: 0,
        title: "",
        icon: "people",
        color: "#3B82F6",
        route: "",
      });
    }
  }, [item]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.route.trim()) {
      alert("Judul dan Route harus diisi!");
      return;
    }
    onSave(formData);
  };

  const handleInputChange = (field: keyof MenuGridItem, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item?.id ? "Edit Menu Item" : "Tambah Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: formData.color + "20" }}
              >
                <span className="text-2xl" style={{ color: formData.color }}>
                  {getIconEmoji(formData.icon)}
                </span>
              </div>
              <p className="text-sm font-medium">{formData.title || "Menu Title"}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Judul Menu</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Contoh: Data Santri"
              />
            </div>

            <div>
              <Label htmlFor="route">Route/Path</Label>
              <Input
                id="route"
                value={formData.route}
                onChange={(e) => handleInputChange("route", e.target.value)}
                placeholder="Contoh: santri"
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => handleInputChange("icon", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih icon" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Warna</Label>
              <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih warna" />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.preview }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemEditor;

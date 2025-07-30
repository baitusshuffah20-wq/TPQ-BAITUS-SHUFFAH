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

interface BottomTabItem {
  name: string;
  title: string;
  icon: string;
}

interface BottomTabEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: BottomTabItem | null;
  onSave: (item: BottomTabItem) => void;
}

const BottomTabEditor: React.FC<BottomTabEditorProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  const [formData, setFormData] = useState<BottomTabItem>({
    name: "",
    title: "",
    icon: "home",
  });

  // Available icons for bottom tabs
  const availableIcons = [
    { value: "home", label: "Home (🏠)" },
    { value: "people", label: "People (👥)" },
    { value: "book", label: "Book (📚)" },
    { value: "wallet", label: "Wallet (💰)" },
    { value: "person", label: "Person (👤)" },
    { value: "analytics", label: "Analytics (📊)" },
    { value: "calendar", label: "Calendar (📅)" },
    { value: "settings", label: "Settings (⚙️)" },
    { value: "notifications", label: "Notifications (🔔)" },
    { value: "search", label: "Search (🔍)" },
    { value: "heart", label: "Heart (❤️)" },
    { value: "star", label: "Star (⭐)" },
    { value: "trophy", label: "Trophy (🏆)" },
    { value: "mail", label: "Mail (📧)" },
    { value: "camera", label: "Camera (📷)" },
  ];

  // Helper function to get emoji for icon
  const getIconEmoji = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      "home": "🏠",
      "people": "👥",
      "book": "📚", 
      "wallet": "💰",
      "person": "👤",
      "analytics": "📊",
      "calendar": "📅",
      "settings": "⚙️",
      "notifications": "🔔",
      "search": "🔍",
      "heart": "❤️",
      "star": "⭐",
      "trophy": "🏆",
      "mail": "📧",
      "camera": "📷",
    };
    return iconMap[iconName] || "📱";
  };

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        name: "",
        title: "",
        icon: "home",
      });
    }
  }, [item]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.name.trim()) {
      alert("Nama dan Judul harus diisi!");
      return;
    }
    onSave(formData);
  };

  const handleInputChange = (field: keyof BottomTabItem, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bottom Tab</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center bg-green-100">
                <span className="text-2xl text-green-600">
                  {getIconEmoji(formData.icon)}
                </span>
              </div>
              <p className="text-sm font-medium">{formData.title || "Tab Title"}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nama Tab (Internal)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Contoh: Dashboard"
              />
            </div>

            <div>
              <Label htmlFor="title">Judul Tab (Tampilan)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Contoh: Dashboard"
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

export default BottomTabEditor;

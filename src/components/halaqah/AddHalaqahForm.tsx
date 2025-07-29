"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Users,
  Clock,
  MapPin,
  UserCheck,
  X,
  Calendar,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AddHalaqahFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface HalaqahResources {
  musyrif: {
    available: any[];
    total: number;
  };
  santri: {
    available: any[];
    total: number;
  };
  rooms: string[];
  schedulePatterns: any[];
  capacityRecommendations: any[];
}

export default function AddHalaqahForm({
  isOpen,
  onClose,
  onSuccess,
}: AddHalaqahFormProps) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<HalaqahResources | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 15,
    room: "",
    schedule: {
      pattern: "",
      days: [] as string[],
      time: "",
      customDays: [] as string[],
      customTime: "",
    },
    musyrifId: "",
    santriIds: [] as string[],
  });

  // Load resources when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadResources();
    }
  }, [isOpen]);

  const loadResources = async () => {
    try {
      const response = await fetch("/api/halaqah/resources");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setResources(result.data);
        }
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      toast.error("Gagal memuat data resources");
    }
  };

  const handleSchedulePatternChange = (patternId: string) => {
    const pattern = resources?.schedulePatterns.find((p) => p.id === patternId);
    if (pattern) {
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          pattern: patternId,
          days: pattern.days,
          time: pattern.time,
        },
      }));
    }
  };

  const handleCustomDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        customDays: prev.schedule.customDays.includes(day)
          ? prev.schedule.customDays.filter((d) => d !== day)
          : [...prev.schedule.customDays, day],
      },
    }));
  };

  const handleSantriToggle = (santriId: string) => {
    setFormData((prev) => ({
      ...prev,
      santriIds: prev.santriIds.includes(santriId)
        ? prev.santriIds.filter((id) => id !== santriId)
        : [...prev.santriIds, santriId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama halaqah harus diisi");
      return;
    }

    if (!formData.musyrifId) {
      toast.error("Musyrif harus dipilih");
      return;
    }

    setLoading(true);

    try {
      // Prepare schedule data
      const scheduleData =
        formData.schedule.pattern === "custom"
          ? {
              type: "custom",
              days: formData.schedule.customDays,
              time: formData.schedule.customTime,
            }
          : {
              type: "pattern",
              pattern: formData.schedule.pattern,
              days: formData.schedule.days,
              time: formData.schedule.time,
            };

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        capacity: formData.capacity,
        room: formData.room.trim() || null,
        schedule: scheduleData,
        musyrifId: formData.musyrifId,
        santriIds: formData.santriIds,
      };

      const response = await fetch("/api/halaqah/comprehensive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Halaqah berhasil dibuat");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: "",
          description: "",
          capacity: 15,
          room: "",
          schedule: {
            pattern: "",
            days: [],
            time: "",
            customDays: [],
            customTime: "",
          },
          musyrifId: "",
          santriIds: [],
        });
      } else {
        toast.error(result.error || "Gagal membuat halaqah");
      }
    } catch (error) {
      console.error("Error creating halaqah:", error);
      toast.error("Terjadi kesalahan saat membuat halaqah");
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Halaqah Baru
          </DialogTitle>
          <DialogDescription>
            Buat halaqah baru dengan mengisi informasi dasar, jadwal, dan
            menugaskan musyrif serta santri
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Halaqah *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: Al-Fatihah, Al-Baqarah"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Kapasitas Santri</Label>
                  <Select
                    value={formData.capacity.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        capacity: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resources?.capacityRecommendations.map((cap) => (
                        <SelectItem
                          key={cap.value}
                          value={cap.value.toString()}
                        >
                          {cap.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Deskripsi singkat tentang halaqah ini..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="room">Ruangan</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room: e.target.value }))
                  }
                  placeholder="Contoh: Ruang A, Masjid Lantai 2"
                  list="room-suggestions"
                />
                <datalist id="room-suggestions">
                  {resources?.rooms.map((room) => (
                    <option key={room} value={room} />
                  ))}
                </datalist>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Halaqah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pola Jadwal</Label>
                <Select
                  value={formData.schedule.pattern}
                  onValueChange={handleSchedulePatternChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pola jadwal" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources?.schedulePatterns.map((pattern) => (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        {pattern.name} ({pattern.time})
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Jadwal Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.schedule.pattern === "custom" && (
                <div className="space-y-4">
                  <div>
                    <Label>Hari</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {weekDays.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day}`}
                            checked={formData.schedule.customDays.includes(day)}
                            onCheckedChange={() => handleCustomDayToggle(day)}
                          />
                          <Label htmlFor={`day-${day}`} className="text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customTime">Waktu</Label>
                    <Input
                      id="customTime"
                      value={formData.schedule.customTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            customTime: e.target.value,
                          },
                        }))
                      }
                      placeholder="Contoh: 16:00-17:30"
                    />
                  </div>
                </div>
              )}

              {formData.schedule.pattern &&
                formData.schedule.pattern !== "custom" && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Jadwal:</strong>{" "}
                      {formData.schedule.days.join(", ")} pada{" "}
                      {formData.schedule.time}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Musyrif Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Penugasan Musyrif *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Pilih Musyrif</Label>
                <Select
                  value={formData.musyrifId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, musyrifId: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih musyrif untuk halaqah ini" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources?.musyrif.available.map((musyrif) => (
                      <SelectItem key={musyrif.id} value={musyrif.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{musyrif.name}</span>
                          {musyrif.currentHalaqahName && (
                            <Badge variant="secondary" className="ml-2">
                              {musyrif.currentHalaqahName}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {resources?.musyrif.available.length} musyrif tersedia
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Santri Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pendaftaran Santri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    Pilih Santri ({formData.santriIds.length} dipilih)
                  </Label>
                  <Badge variant="outline">
                    {resources?.santri.available.length} santri tersedia
                  </Badge>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {resources?.santri.available.map((santri) => (
                      <div
                        key={santri.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                          formData.santriIds.includes(santri.id)
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSantriToggle(santri.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={formData.santriIds.includes(santri.id)}
                            onCheckedChange={() =>
                              handleSantriToggle(santri.id)
                            }
                          />
                          <div>
                            <p className="font-medium">{santri.name}</p>
                            <p className="text-sm text-gray-600">
                              NIS: {santri.nis} � {santri.gender} � {santri.age}{" "}
                              tahun
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Grade: {santri.averageGrade}
                          </p>
                          <p className="text-xs text-gray-600">
                            {santri.totalHafalan} hafalan
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Membuat..." : "Buat Halaqah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

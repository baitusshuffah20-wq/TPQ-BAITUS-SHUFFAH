"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Star,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ManageSantriFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  halaqah: {
    id: string;
    name: string;
    capacity: number;
    santri: any[];
    totalSantri: number;
  };
}

interface SantriData {
  id: string;
  nis: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  address: string;
  enrollmentDate: string;
  currentHalaqah: {
    id: string;
    name: string;
  } | null;
  averageGrade: number;
  totalHafalan: number;
}

export default function ManageSantriForm({
  isOpen,
  onClose,
  onSuccess,
  halaqah,
}: ManageSantriFormProps) {
  const [loading, setLoading] = useState(false);
  const [availableSantri, setAvailableSantri] = useState<SantriData[]>([]);
  const [assignedSantri, setAssignedSantri] = useState<SantriData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadSantriData();
    }
  }, [isOpen]);

  const loadSantriData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/halaqah/resources");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAvailableSantri(result.data.santri.available);
          setAssignedSantri(halaqah.santri);
        }
      }
    } catch (error) {
      console.error("Error loading santri data:", error);
      toast.error("Gagal memuat data santri");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSantri = async () => {
    if (selectedAvailable.length === 0) {
      toast.error("Pilih santri yang akan ditugaskan");
      return;
    }

    // Check capacity
    const newTotal = assignedSantri.length + selectedAvailable.length;
    if (newTotal > halaqah.capacity) {
      toast.error(
        `Kapasitas halaqah hanya ${halaqah.capacity} santri. Saat ini: ${assignedSantri.length}, akan ditambah: ${selectedAvailable.length}`,
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/halaqah/resources/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          halaqahId: halaqah.id,
          santriIds: selectedAvailable,
          action: "assign_santri",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`${selectedAvailable.length} santri berhasil ditugaskan`);

        // Move santri from available to assigned
        const movedSantri = availableSantri.filter((s) =>
          selectedAvailable.includes(s.id),
        );
        setAssignedSantri((prev) => [...prev, ...movedSantri]);
        setAvailableSantri((prev) =>
          prev.filter((s) => !selectedAvailable.includes(s.id)),
        );
        setSelectedAvailable([]);

        onSuccess();
      } else {
        toast.error(result.error || "Gagal menugaskan santri");
      }
    } catch (error) {
      console.error("Error assigning santri:", error);
      toast.error("Terjadi kesalahan saat menugaskan santri");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSantri = async () => {
    if (selectedAssigned.length === 0) {
      toast.error("Pilih santri yang akan dihapus");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/halaqah/resources/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          halaqahId: halaqah.id,
          santriIds: selectedAssigned,
          action: "remove_santri",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`${selectedAssigned.length} santri berhasil dihapus`);

        // Move santri from assigned to available
        const movedSantri = assignedSantri.filter((s) =>
          selectedAssigned.includes(s.id),
        );
        setAvailableSantri((prev) => [...prev, ...movedSantri]);
        setAssignedSantri((prev) =>
          prev.filter((s) => !selectedAssigned.includes(s.id)),
        );
        setSelectedAssigned([]);

        onSuccess();
      } else {
        toast.error(result.error || "Gagal menghapus santri");
      }
    } catch (error) {
      console.error("Error removing santri:", error);
      toast.error("Terjadi kesalahan saat menghapus santri");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailableSelection = (santriId: string) => {
    setSelectedAvailable((prev) =>
      prev.includes(santriId)
        ? prev.filter((id) => id !== santriId)
        : [...prev, santriId],
    );
  };

  const toggleAssignedSelection = (santriId: string) => {
    setSelectedAssigned((prev) =>
      prev.includes(santriId)
        ? prev.filter((id) => id !== santriId)
        : [...prev, santriId],
    );
  };

  const filteredAvailable = availableSantri.filter(
    (santri) =>
      santri.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
      santri.nis.includes(searchAvailable),
  );

  const filteredAssigned = assignedSantri.filter(
    (santri) =>
      santri.name.toLowerCase().includes(searchAssigned.toLowerCase()) ||
      santri.nis.includes(searchAssigned),
  );

  const SantriCard = ({
    santri,
    isSelected,
    onToggle,
    showCurrentHalaqah = false,
  }: {
    santri: SantriData;
    isSelected: boolean;
    onToggle: () => void;
    showCurrentHalaqah?: boolean;
  }) => (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox checked={isSelected} onChange={onToggle} />
          <div>
            <p className="font-medium">{santri.name}</p>
            <p className="text-sm text-gray-600">
              NIS: {santri.nis} � {santri.gender} � {santri.age} tahun
            </p>
            {showCurrentHalaqah && santri.currentHalaqah && (
              <Badge variant="secondary" className="text-xs mt-1">
                {santri.currentHalaqah.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-sm font-medium">
              {typeof santri.averageGrade === "number"
                ? santri.averageGrade.toFixed(1)
                : "0.0"}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {santri.totalHafalan || 0} hafalan
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kelola Santri - {halaqah.name}
          </DialogTitle>
          <DialogDescription>
            Tambah atau hapus santri dari halaqah ini. Kapasitas:{" "}
            {assignedSantri.length}/{halaqah.capacity}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Santri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Santri Tersedia ({filteredAvailable.length})</span>
                <Badge variant="outline">
                  {selectedAvailable.length} dipilih
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari santri..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailable.map((santri) => (
                  <SantriCard
                    key={santri.id}
                    santri={santri}
                    isSelected={selectedAvailable.includes(santri.id)}
                    onToggle={() => toggleAvailableSelection(santri.id)}
                    showCurrentHalaqah={true}
                  />
                ))}
                {filteredAvailable.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada santri tersedia</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Santri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Santri di Halaqah ({filteredAssigned.length})</span>
                <Badge variant="outline">
                  {selectedAssigned.length} dipilih
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari santri..."
                  value={searchAssigned}
                  onChange={(e) => setSearchAssigned(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAssigned.map((santri) => (
                  <SantriCard
                    key={santri.id}
                    santri={santri}
                    isSelected={selectedAssigned.includes(santri.id)}
                    onToggle={() => toggleAssignedSelection(santri.id)}
                  />
                ))}
                {filteredAssigned.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Belum ada santri di halaqah ini</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Button
            onClick={handleAssignSantri}
            disabled={loading || selectedAvailable.length === 0}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Tugaskan ({selectedAvailable.length})
          </Button>

          <Button
            variant="outline"
            onClick={handleRemoveSantri}
            disabled={loading || selectedAssigned.length === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Hapus ({selectedAssigned.length})
          </Button>
        </div>

        {/* Capacity Warning */}
        {assignedSantri.length + selectedAvailable.length >
          halaqah.capacity && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              ?? Peringatan: Total santri akan melebihi kapasitas halaqah (
              {halaqah.capacity})
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

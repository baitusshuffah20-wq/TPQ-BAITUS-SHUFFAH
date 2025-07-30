"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";
import {
  QrCode,
  Calendar,
  Clock,
  User,
  Download,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface Halaqah {
  id: string;
  name: string;
  level: string;
  musyrif?: {
    id: string;
    name: string;
    user?: {
      id: string;
      name: string;
    };
  };
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }>;
}

interface QRSession {
  id: string;
  halaqahId: string;
  sessionDate: string;
  sessionType: string;
  qrCode: string;
  isActive: boolean;
  expiresAt: string;
  usageCount: number;
  maxUsage: number;
  halaqah: {
    id: string;
    name: string;
    musyrif: {
      id: string;
      name: string;
      user: {
        id: string;
        name: string;
      };
    };
  };
}

export default function QRGeneratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [activeQRSessions, setActiveQRSessions] = useState<QRSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [selectedHalaqah, setSelectedHalaqah] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionType, setSessionType] = useState("REGULAR");
  
  // QR display state
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load halaqah list
      const halaqahResponse = await fetch("/api/halaqah");
      const halaqahData = await halaqahResponse.json();
      
      if (halaqahData.success) {
        setHalaqahList(halaqahData.halaqah);
      }

      // Load active QR sessions
      const qrResponse = await fetch("/api/attendance/qr-generate");
      const qrData = await qrResponse.json();
      
      if (qrData.success) {
        setActiveQRSessions(qrData.qrSessions);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!selectedHalaqah || !sessionDate) {
      toast.error("Pilih halaqah dan tanggal sesi");
      return;
    }

    try {
      setGenerating(true);
      
      const response = await fetch("/api/attendance/qr-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          halaqahId: selectedHalaqah,
          sessionDate,
          sessionType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        
        // Generate QR code image
        const qrDataUrl = await QRCode.toDataURL(data.qrSession.qrCode, {
          width: 300,
          margin: 2,
        });
        setQrDataUrl(qrDataUrl);
        setShowQRCode(true);
        
        // Reload active sessions
        loadData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Gagal membuat QR Code");
    } finally {
      setGenerating(false);
    }
  };

  const copyQRCode = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
    toast.success("QR Code berhasil disalin!");
  };

  const downloadQRCode = async (qrCode: string, halaqahName: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(qrCode, {
        width: 400,
        margin: 2,
      });
      
      const link = document.createElement("a");
      link.download = `QR-${halaqahName}-${sessionDate}.png`;
      link.href = qrDataUrl;
      link.click();
      
      toast.success("QR Code berhasil diunduh!");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Gagal mengunduh QR Code");
    }
  };

  const deactivateQRSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/attendance/qr-generate/${sessionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("QR Session berhasil dinonaktifkan");
        loadData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deactivating QR session:", error);
      toast.error("Gagal menonaktifkan QR Session");
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[dayOfWeek];
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Generator QR Code Absensi</h1>
        <p className="text-gray-600">
          Buat QR Code untuk absensi musyrif pada jadwal halaqah
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Buat QR Code Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="halaqah">Pilih Halaqah</Label>
              <Select value={selectedHalaqah} onValueChange={setSelectedHalaqah}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih halaqah..." />
                </SelectTrigger>
                <SelectContent>
                  {halaqahList.map((halaqah) => (
                    <SelectItem key={halaqah.id} value={halaqah.id}>
                      <div className="flex flex-col">
                        <span>{halaqah.name}</span>
                        <span className="text-xs text-gray-500">
                          {halaqah.musyrif?.name || "Belum ada musyrif"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sessionDate">Tanggal Sesi</Label>
              <Input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="sessionType">Jenis Sesi</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Reguler</SelectItem>
                  <SelectItem value="EXTRA">Tambahan</SelectItem>
                  <SelectItem value="MAKEUP">Pengganti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateQRCode}
              disabled={generating || !selectedHalaqah || !sessionDate}
              className="w-full gap-2"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              {generating ? "Membuat..." : "Buat QR Code"}
            </Button>

            {/* Generated QR Code Display */}
            {showQRCode && qrDataUrl && (
              <div className="border-t pt-4 space-y-4">
                <div className="text-center">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="mx-auto border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQRCode(false)}
                    className="flex-1 gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    Sembunyikan
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active QR Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              QR Sessions Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeQRSessions.length > 0 ? (
              <div className="space-y-4">
                {activeQRSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.halaqah.name}</h4>
                        <p className="text-sm text-gray-600">
                          {session.halaqah.musyrif.name}
                        </p>
                      </div>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Tanggal:</span>
                        <p>{new Date(session.sessionDate).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Jenis:</span>
                        <p>{session.sessionType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Berakhir:</span>
                        <p>{formatDateTime(session.expiresAt)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Penggunaan:</span>
                        <p>{session.usageCount}/{session.maxUsage}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyQRCode(session.qrCode)}
                        className="flex-1 gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Salin
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(session.qrCode, session.halaqah.name)}
                        className="flex-1 gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Unduh
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Belum ada QR Session aktif
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

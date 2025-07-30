"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  QrCode,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";

interface MusyrifQRScannerProps {
  musyrifId: string;
  musyrifName: string;
  halaqahId?: string;
  halaqahName?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  checkInTime: string;
  sessionType: string;
  halaqah: {
    id: string;
    name: string;
  };
  isLate: boolean;
}

export default function MusyrifQRScanner({
  musyrifId,
  musyrifName,
  halaqahId,
  halaqahName,
}: MusyrifQRScannerProps) {
  const [qrCode, setQrCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Gagal mendapatkan lokasi");
        }
      );
    }

    // Load recent attendance
    loadRecentAttendance();
  }, [musyrifId]);

  const loadRecentAttendance = async () => {
    try {
      const response = await fetch(
        `/api/attendance/musyrif?musyrifId=${musyrifId}&limit=5`
      );
      const data = await response.json();

      if (data.success) {
        setRecentAttendance(data.attendance);
        
        // Check if already attended today
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = data.attendance.find((record: AttendanceRecord) =>
          record.date.startsWith(today)
        );
        setTodayAttendance(todayRecord || null);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Gagal mengakses kamera");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualScan = async () => {
    if (!qrCode.trim()) {
      toast.error("Masukkan kode QR");
      return;
    }

    await processQRCode(qrCode.trim());
  };

  const processQRCode = async (code: string) => {
    try {
      const response = await fetch("/api/attendance/qr-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCode: code,
          latitude: location?.latitude,
          longitude: location?.longitude,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setQrCode("");
        setNotes("");
        setTodayAttendance(data.attendance);
        loadRecentAttendance();
        stopCamera();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Gagal memproses absensi");
    }
  };

  const getStatusBadge = (status: string, isLate?: boolean) => {
    if (status === "PRESENT") {
      return (
        <Badge variant={isLate ? "destructive" : "default"} className="gap-1">
          <CheckCircle className="h-3 w-3" />
          {isLate ? "Hadir (Terlambat)" : "Hadir"}
        </Badge>
      );
    } else if (status === "LATE") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Terlambat
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          Tidak Hadir
        </Badge>
      );
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Absensi Musyrif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama Musyrif</p>
              <p className="font-medium">{musyrifName}</p>
            </div>
            {halaqahName && (
              <div>
                <p className="text-sm text-gray-600">Halaqah</p>
                <p className="font-medium">{halaqahName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Tanggal</p>
              <p className="font-medium">{formatDate(new Date().toISOString())}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status Hari Ini</p>
              {todayAttendance ? (
                getStatusBadge(todayAttendance.status, todayAttendance.isLate)
              ) : (
                <Badge variant="outline">Belum Absen</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner */}
      {!todayAttendance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code Absensi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Scanner */}
            <div className="space-y-4">
              {!isScanning ? (
                <Button onClick={startCamera} className="w-full gap-2">
                  <Camera className="h-4 w-4" />
                  Buka Kamera
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg"
                      autoPlay
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <Button onClick={stopCamera} variant="outline" className="w-full">
                    Tutup Kamera
                  </Button>
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium">Atau masukkan kode manual:</label>
                <Input
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Masukkan kode QR"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Catatan (opsional):</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleManualScan}
                disabled={!qrCode.trim()}
                className="w-full gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Absen Sekarang
              </Button>
            </div>

            {/* Location Info */}
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <MapPin className="h-4 w-4" />
                Lokasi: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riwayat Absensi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatDate(record.date)}</p>
                    <p className="text-sm text-gray-600">
                      {record.halaqah.name} • {formatTime(record.checkInTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(record.status, record.isLate)}
                    <p className="text-xs text-gray-500 mt-1">{record.sessionType}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Belum ada riwayat absensi</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

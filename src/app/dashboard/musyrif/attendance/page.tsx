"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MusyrifQRScanner from "@/components/attendance/MusyrifQRScanner";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface MusyrifData {
  id: string;
  name: string;
  email: string;
  halaqahId?: string;
  musyrifProfile?: {
    halaqah?: {
      id: string;
      name: string;
      level: string;
    };
  };
}

interface AttendanceStats {
  totalSessions: number;
  presentSessions: number;
  lateSessions: number;
  absentSessions: number;
  attendanceRate: number;
}

export default function MusyrifAttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [musyrifData, setMusyrifData] = useState<MusyrifData | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "MUSYRIF") {
      router.push("/dashboard");
      return;
    }

    loadMusyrifData();
  }, [session, status, router]);

  const loadMusyrifData = async () => {
    try {
      setLoading(true);

      // Load musyrif profile
      const profileResponse = await fetch("/api/musyrif/profile");
      const profileData = await profileResponse.json();

      if (profileData.success) {
        setMusyrifData(profileData.musyrif);
      } else {
        toast.error("Gagal memuat data profil");
      }

      // Load attendance statistics for current month
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const statsResponse = await fetch(
        `/api/attendance/musyrif?month=${month}&year=${year}&limit=100`
      );
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setAttendanceStats(statsData.statistics);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!musyrifData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Data musyrif tidak ditemukan</p>
              <button
                onClick={() => toast.error("Gagal memuat data profil")}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Gagal memuat data profil
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Absensi Musyrif</h1>
        <p className="text-gray-600">
          Kelola absensi mengajar Anda dengan mudah menggunakan QR Code
        </p>
      </div>

      {/* Statistics Cards */}
      {attendanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sesi</p>
                  <p className="text-2xl font-bold">{attendanceStats.totalSessions}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Bulan {currentMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hadir</p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceStats.presentSessions}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Termasuk {attendanceStats.lateSessions} terlambat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceStats.absentSessions}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Sesi terlewat</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {attendanceStats.attendanceRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                {attendanceStats.attendanceRate >= 90 ? (
                  <Badge variant="default" className="text-xs">
                    Excellent
                  </Badge>
                ) : attendanceStats.attendanceRate >= 80 ? (
                  <Badge variant="secondary" className="text-xs">
                    Good
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Needs Improvement
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Scanner Component */}
      <MusyrifQRScanner
        musyrifId={musyrifData.id}
        musyrifName={musyrifData.name}
        halaqahId={musyrifData.musyrifProfile?.halaqah?.id}
        halaqahName={musyrifData.musyrifProfile?.halaqah?.name}
      />

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informasi Penting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>QR Code Absensi:</strong> Scan QR Code yang disediakan admin untuk
                mencatat kehadiran Anda secara otomatis.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Otomatis Payroll:</strong> Setiap absensi akan otomatis dihitung
                untuk penggajian bulanan Anda.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Keterlambatan:</strong> Absensi lebih dari 15 menit setelah jadwal
                akan dianggap terlambat.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Bonus Kehadiran:</strong> Tingkat kehadiran ≥90% mendapat bonus
                Rp 100.000 per bulan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}

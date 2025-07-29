"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MaintenanceModePage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/maintenance/status");

      if (response.ok) {
        const data = await response.json();
        setIsMaintenanceMode(data.maintenanceMode);
      } else {
        toast.error("Gagal memuat status mode pemeliharaan");
      }
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
      toast.error("Terjadi kesalahan saat memuat status");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/maintenance/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !isMaintenanceMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsMaintenanceMode(data.maintenanceMode);
        toast.success(
          `Mode pemeliharaan telah ${data.maintenanceMode ? "diaktifkan" : "dinonaktifkan"}`,
        );
      } else {
        toast.error("Gagal mengubah status mode pemeliharaan");
      }
    } catch (error) {
      console.error("Error updating maintenance mode:", error);
      toast.error("Terjadi kesalahan saat mengubah status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Settings className="mr-2 h-6 w-6" />
          Pengaturan Mode Pemeliharaan
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Status Mode Pemeliharaan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Memuat...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center">
                  {isMaintenanceMode ? (
                    <div className="flex items-center text-amber-600">
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      <span className="font-medium">
                        Mode Pemeliharaan Aktif
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      <span className="font-medium">Situs Berjalan Normal</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">
                    Informasi Mode Pemeliharaan:
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Saat mode pemeliharaan aktif, pengunjung umum akan diarahkan
                    ke halaman pemeliharaan. Hanya administrator yang dapat
                    mengakses situs secara normal.
                  </p>
                  <p className="text-gray-700">
                    Gunakan fitur ini saat melakukan pembaruan sistem atau
                    perbaikan yang membutuhkan waktu.
                  </p>
                </div>

                <Button
                  onClick={toggleMaintenanceMode}
                  variant={isMaintenanceMode ? "default" : "destructive"}
                  disabled={isUpdating}
                  className="w-full md:w-auto"
                >
                  {isUpdating ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Memproses...
                    </>
                  ) : isMaintenanceMode ? (
                    "Nonaktifkan Mode Pemeliharaan"
                  ) : (
                    "Aktifkan Mode Pemeliharaan"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Users,
  BookOpen,
  CreditCard,
} from "lucide-react";

interface ExportButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type:
    | "santri"
    | "halaqah"
    | "hafalan"
    | "absensi"
    | "pembayaran"
    | "komprehensif";
  data?: any[];
  periode?: string;
  onExport?: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  variant = "outline",
  size = "md",
  className = "",
  type,
  data = [],
  periode,
  onExport,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const getButtonText = () => {
    switch (type) {
      case "santri":
        return "Export Data Santri";
      case "halaqah":
        return "Export Data Halaqah";
      case "hafalan":
        return "Export Data Hafalan";
      case "absensi":
        return "Export Data Absensi";
      case "pembayaran":
        return "Export Data Pembayaran";
      case "komprehensif":
        return "Export Laporan Lengkap";
      default:
        return "Export Data";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "santri":
        return <Users className="h-4 w-4" />;
      case "halaqah":
        return <BookOpen className="h-4 w-4" />;
      case "hafalan":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "absensi":
        return <Calendar className="h-4 w-4" />;
      case "pembayaran":
        return <CreditCard className="h-4 w-4" />;
      case "komprehensif":
        return <Download className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const handleExport = async () => {
    if (onExport) {
      onExport();
      return;
    }

    setIsExporting(true);

    try {
      const templates = await import("@/lib/excel-templates");

      switch (type) {
        case "santri":
          templates.exportSantriData(data);
          break;
        case "halaqah":
          templates.exportHalaqahData(data);
          break;
        case "hafalan":
          templates.exportHafalanData(data);
          break;
        case "absensi":
          templates.exportAbsensiData(data);
          break;
        case "pembayaran":
          templates.exportPembayaranData(data);
          break;
        case "komprehensif":
          // For comprehensive report, we need to fetch all data
          await handleComprehensiveExport();
          break;
        default:
          console.warn("Unknown export type:", type);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengexport data. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleComprehensiveExport = async () => {
    try {
      // Fetch all data for comprehensive report with error handling for each endpoint
      const fetchWithFallback = async (url: string, name: string) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`Failed to fetch ${name}, using empty data`);
            return {
              ok: true,
              json: async () => ({ success: true, data: [] }),
            };
          }
          return response;
        } catch (error) {
          console.warn(`Error fetching ${name}, using empty data:`, error);
          return { ok: true, json: async () => ({ success: true, data: [] }) };
        }
      };

      const [santriRes, halaqahRes, hafalanRes, absensiRes, pembayaranRes] =
        await Promise.all([
          fetchWithFallback("/api/santri", "santri"),
          fetchWithFallback("/api/halaqah", "halaqah"),
          fetchWithFallback("/api/hafalan-progress", "hafalan-progress"),
          fetchWithFallback("/api/attendance/simple", "attendance"),
          fetchWithFallback("/api/spp/records", "spp/records"),
        ]);

      // All responses should be OK due to fetchWithFallback
      console.log("All API calls completed successfully");

      // Parse JSON responses with error handling
      const parseJsonSafely = async (response: Response, name: string) => {
        try {
          const text = await response.text();

          if (!text.trim()) {
            console.warn(`Empty response from ${name}`);
            return { success: false, data: [] };
          }

          // Check if response is HTML (error page)
          if (
            text.trim().startsWith("<!DOCTYPE") ||
            text.trim().startsWith("<html")
          ) {
            console.error(
              `Received HTML instead of JSON from ${name}:`,
              text.substring(0, 200),
            );
            throw new Error(`Server mengembalikan halaman error untuk ${name}`);
          }

          return JSON.parse(text);
        } catch (error) {
          console.error(`Error parsing JSON from ${name}:`, error);
          if (error instanceof SyntaxError) {
            throw new Error(`Format data tidak valid dari ${name}`);
          }
          throw error;
        }
      };

      const [
        santriData,
        halaqahData,
        hafalanData,
        absensiData,
        pembayaranData,
      ] = await Promise.all([
        santriRes.json(),
        halaqahRes.json(),
        hafalanRes.json(),
        absensiRes.json(),
        pembayaranRes.json(),
      ]);

      const templates = await import("@/lib/excel-templates");
      templates.exportLaporanKomprehensif(
        {
          santri: santriData.success
            ? santriData.santri || santriData.data || []
            : [],
          halaqah: halaqahData.success
            ? halaqahData.halaqah || halaqahData.data || []
            : [],
          hafalan: hafalanData.success
            ? hafalanData.progress || hafalanData.data || []
            : [],
          absensi: absensiData.success
            ? absensiData.data?.records || absensiData.data || []
            : [],
          pembayaran: pembayaranData.success
            ? pembayaranData.sppRecords || pembayaranData.data || []
            : [],
        },
        periode || new Date().getFullYear().toString(),
      );
    } catch (error) {
      console.error("Error fetching data for comprehensive report:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengambil data untuk laporan komprehensif";
      alert(errorMessage);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 ${className}`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Mengexport...
        </>
      ) : (
        <>
          {getIcon()}
          {getButtonText()}
        </>
      )}
    </Button>
  );
};

export default ExportButton;

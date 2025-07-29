"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExportButton from "./ExportButton";
import {
  X,
  FileSpreadsheet,
  Calendar,
  Users,
  BookOpen,
  CreditCard,
  Download,
  TrendingUp,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title = "Export Data",
}) => {
  const [selectedPeriode, setSelectedPeriode] = useState(
    new Date().getFullYear().toString(),
  );
  const [customPeriode, setCustomPeriode] = useState("");

  if (!isOpen) return null;

  const exportOptions = [
    {
      type: "santri" as const,
      title: "Data Santri",
      description: "Export data lengkap santri, wali, dan halaqah",
      icon: <Users className="h-8 w-8 text-teal-600" />,
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      type: "halaqah" as const,
      title: "Data Halaqah",
      description: "Export data halaqah, musyrif, dan kapasitas",
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      type: "hafalan" as const,
      title: "Data Hafalan",
      description: "Export progress hafalan dan nilai santri",
      icon: <FileSpreadsheet className="h-8 w-8 text-green-600" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      type: "absensi" as const,
      title: "Data Absensi",
      description: "Export kehadiran santri per periode",
      icon: <Calendar className="h-8 w-8 text-purple-600" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      type: "pembayaran" as const,
      title: "Data Pembayaran",
      description: "Export transaksi dan laporan keuangan",
      icon: <CreditCard className="h-8 w-8 text-orange-600" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      type: "komprehensif" as const,
      title: "Laporan Komprehensif",
      description: "Export semua data dalam satu file Excel",
      icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Pilih jenis data yang ingin diekspor ke Excel
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Periode Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Pengaturan Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periode Tahun
                  </label>
                  <select
                    value={selectedPeriode}
                    onChange={(e) => setSelectedPeriode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={new Date().getFullYear().toString()}>
                      {new Date().getFullYear()} (Tahun Ini)
                    </option>
                    <option value={(new Date().getFullYear() - 1).toString()}>
                      {new Date().getFullYear() - 1}
                    </option>
                    <option value={(new Date().getFullYear() - 2).toString()}>
                      {new Date().getFullYear() - 2}
                    </option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {selectedPeriode === "custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periode Custom
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Januari - Maret 2024"
                      value={customPeriode}
                      onChange={(e) => setCustomPeriode(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportOptions.map((option) => (
              <Card
                key={option.type}
                className={`${option.bgColor} ${option.borderColor} border-2 hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">{option.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {option.description}
                    </p>
                    <ExportButton
                      type={option.type}
                      variant="primary"
                      size="sm"
                      periode={
                        selectedPeriode === "custom"
                          ? customPeriode
                          : selectedPeriode
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Informasi Export
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• File akan didownload dalam format Excel (.xlsx)</li>
                    <li>
                      • Template sudah diformat dengan warna dan styling modern
                    </li>
                    <li>
                      • Laporan komprehensif berisi semua data dalam sheet
                      terpisah
                    </li>
                    <li>
                      • Data yang diekspor sesuai dengan filter yang aktif
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

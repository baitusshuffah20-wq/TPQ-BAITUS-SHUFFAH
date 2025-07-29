"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

interface SantriExcelUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SantriData {
  nis: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  gender: "MALE" | "FEMALE";
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  waliId?: string;
  halaqahId?: string;
  enrollmentDate: string;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function SantriExcelUpload({
  isOpen,
  onClose,
  onSuccess,
}: SantriExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState<SantriData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    try {
      toast.loading("Mengunduh template...");

      const response = await fetch("/api/santri/template");

      if (!response.ok) {
        throw new Error("Gagal mengunduh template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Template_Import_Santri_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Template Excel berhasil didownload");
    } catch (error) {
      toast.dismiss();
      console.error("Error downloading template:", error);
      toast.error("Gagal mengunduh template Excel");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
        processExcelFile(selectedFile);
      } else {
        toast.error("Hanya file Excel (.xlsx, .xls) yang diperbolehkan");
      }
    }
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = processRawData(jsonData);
        setPreviewData(processedData.data);
        setValidationErrors(processedData.errors);
        setShowPreview(true);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast.error("Gagal memproses file Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processRawData = (
    rawData: any[],
  ): { data: SantriData[]; errors: ValidationError[] } => {
    const processedData: SantriData[] = [];
    const errors: ValidationError[] = [];
    const nisSet = new Set<string>(); // Track NIS to prevent duplicates

    // Validate data count limit
    if (rawData.length > 1000) {
      errors.push({
        row: 0,
        field: "General",
        message:
          "Maksimal 1000 data per upload. File ini memiliki " +
          rawData.length +
          " data.",
      });
      return { data: [], errors };
    }

    if (rawData.length === 0) {
      errors.push({
        row: 0,
        field: "General",
        message: "File Excel kosong atau tidak memiliki data",
      });
      return { data: [], errors };
    }

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (header is row 1)

      // Map Excel columns to our data structure
      const santriData: Partial<SantriData> = {
        nis: row["NIS"]?.toString().trim(),
        name: row["Nama Lengkap"]?.toString().trim(),
        birthDate: formatDate(row["Tanggal Lahir"]),
        birthPlace: row["Tempat Lahir"]?.toString().trim(),
        gender: row["Jenis Kelamin"]?.toString().toUpperCase() as
          | "MALE"
          | "FEMALE",
        address: row["Alamat"]?.toString().trim(),
        parentName: row["Nama Orang Tua"]?.toString().trim(),
        parentPhone: row["No. HP Orang Tua"]?.toString().trim(),
        parentEmail: row["Email Orang Tua"]?.toString().trim(),
        enrollmentDate: formatDate(row["Tanggal Masuk"]),
        status: (row["Status"]?.toString().toUpperCase() || "ACTIVE") as
          | "ACTIVE"
          | "INACTIVE",
        notes: row["Catatan"]?.toString().trim(),
      };

      // Validate required fields
      if (!santriData.nis) {
        errors.push({
          row: rowNumber,
          field: "NIS",
          message: "NIS wajib diisi",
        });
      } else if (santriData.nis.length < 3) {
        errors.push({
          row: rowNumber,
          field: "NIS",
          message: "NIS minimal 3 karakter",
        });
      } else if (nisSet.has(santriData.nis)) {
        errors.push({
          row: rowNumber,
          field: "NIS",
          message: `NIS ${santriData.nis} sudah ada di file ini`,
        });
      } else {
        nisSet.add(santriData.nis);
      }

      if (!santriData.name) {
        errors.push({
          row: rowNumber,
          field: "Nama Lengkap",
          message: "Nama lengkap wajib diisi",
        });
      } else if (santriData.name.length < 2) {
        errors.push({
          row: rowNumber,
          field: "Nama Lengkap",
          message: "Nama minimal 2 karakter",
        });
      }

      if (!santriData.birthDate) {
        errors.push({
          row: rowNumber,
          field: "Tanggal Lahir",
          message: "Tanggal lahir wajib diisi",
        });
      } else if (!isValidDate(santriData.birthDate)) {
        errors.push({
          row: rowNumber,
          field: "Tanggal Lahir",
          message: "Format tanggal tidak valid (gunakan YYYY-MM-DD)",
        });
      } else {
        // Check if age is reasonable (between 3-25 years old)
        const age = calculateAge(santriData.birthDate);
        if (age < 3 || age > 25) {
          errors.push({
            row: rowNumber,
            field: "Tanggal Lahir",
            message: `Umur tidak wajar (${age} tahun). Periksa tanggal lahir`,
          });
        }
      }

      if (
        !santriData.gender ||
        !["MALE", "FEMALE"].includes(santriData.gender)
      ) {
        errors.push({
          row: rowNumber,
          field: "Jenis Kelamin",
          message: "Jenis kelamin harus MALE atau FEMALE",
        });
      }

      if (!santriData.parentName) {
        errors.push({
          row: rowNumber,
          field: "Nama Orang Tua",
          message: "Nama orang tua wajib diisi",
        });
      } else if (santriData.parentName.length < 2) {
        errors.push({
          row: rowNumber,
          field: "Nama Orang Tua",
          message: "Nama orang tua minimal 2 karakter",
        });
      }

      if (!santriData.parentPhone) {
        errors.push({
          row: rowNumber,
          field: "No. HP Orang Tua",
          message: "No. HP orang tua wajib diisi",
        });
      } else if (!isValidPhone(santriData.parentPhone)) {
        errors.push({
          row: rowNumber,
          field: "No. HP Orang Tua",
          message: "Format nomor HP tidak valid (gunakan 08xxxxxxxxxx)",
        });
      }

      // Validate email format if provided
      if (
        santriData.parentEmail &&
        santriData.parentEmail.trim() &&
        !isValidEmail(santriData.parentEmail)
      ) {
        errors.push({
          row: rowNumber,
          field: "Email Orang Tua",
          message: "Format email tidak valid",
        });
      }

      // Validate enrollment date
      if (
        santriData.enrollmentDate &&
        !isValidDate(santriData.enrollmentDate)
      ) {
        errors.push({
          row: rowNumber,
          field: "Tanggal Masuk",
          message: "Format tanggal masuk tidak valid (gunakan YYYY-MM-DD)",
        });
      }

      // Validate status
      if (
        santriData.status &&
        !["ACTIVE", "INACTIVE"].includes(santriData.status)
      ) {
        errors.push({
          row: rowNumber,
          field: "Status",
          message: "Status harus ACTIVE atau INACTIVE",
        });
      }

      if (
        Object.values(santriData).some(
          (value) => value !== undefined && value !== "",
        )
      ) {
        processedData.push(santriData as SantriData);
      }
    });

    return { data: processedData, errors };
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "";

    try {
      let date: Date;

      if (typeof dateValue === "number") {
        // Excel date serial number
        date = new Date((dateValue - 25569) * 86400 * 1000);
      } else if (typeof dateValue === "string") {
        date = new Date(dateValue);
      } else {
        return "";
      }

      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleUpload = async () => {
    if (!file || previewData.length === 0) {
      toast.error("Tidak ada data untuk diupload");
      return;
    }

    if (validationErrors.length > 0) {
      toast.error("Perbaiki error validasi terlebih dahulu");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      toast.loading("Memproses data...", { id: "upload-progress" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("data", JSON.stringify(previewData));

      setUploadProgress(30);
      toast.loading("Mengirim data ke server...", { id: "upload-progress" });

      const response = await fetch("/api/santri/import", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);
      toast.loading("Menyimpan data...", { id: "upload-progress" });

      const result = await response.json();

      setUploadProgress(100);
      toast.dismiss("upload-progress");

      if (result.success) {
        toast.success(
          `Berhasil mengimport ${result.imported} data santri` +
            (result.skipped > 0 ? `, ${result.skipped} data dilewati` : ""),
        );

        // Show detailed results if there are errors or duplicates
        if (result.errors?.length > 0 || result.duplicates?.length > 0) {
          console.log("Import warnings:", {
            errors: result.errors,
            duplicates: result.duplicates,
          });
          toast.error(
            `Ada ${result.errors?.length || 0} error dan ${result.duplicates?.length || 0} duplikasi. Periksa console untuk detail.`,
          );
        }

        onSuccess();
        onClose();
        resetForm();
      } else {
        toast.error(result.message || "Gagal mengimport data");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      toast.dismiss("upload-progress");
      toast.error(
        "Gagal mengupload file: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Import Data Santri dari Excel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Download Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Download Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Download template Excel untuk memastikan format data sesuai
                  </p>
                  <Button onClick={downloadTemplate} variant="outline">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download Template Excel
                  </Button>
                </CardContent>
              </Card>

              {/* Upload File */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File Excel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Pilih file Excel (.xlsx, .xls) yang berisi data santri
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih File Excel
                    </Button>
                    {file && (
                      <p className="mt-2 text-sm text-green-600">
                        File terpilih: {file.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Total Data</p>
                        <p className="text-2xl font-bold">
                          {previewData.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Data Valid</p>
                        <p className="text-2xl font-bold text-green-600">
                          {previewData.length - validationErrors.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Error</p>
                        <p className="text-2xl font-bold text-red-600">
                          {validationErrors.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      Error Validasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-40 overflow-y-auto">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 mb-1">
                          Baris {error.row}, {error.field}: {error.message}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Preview Data ({previewData.length} records)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">NIS</th>
                          <th className="text-left p-2">Nama</th>
                          <th className="text-left p-2">Jenis Kelamin</th>
                          <th className="text-left p-2">Tempat Lahir</th>
                          <th className="text-left p-2">Nama Orang Tua</th>
                          <th className="text-left p-2">No. HP</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((santri, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{santri.nis}</td>
                            <td className="p-2">{santri.name}</td>
                            <td className="p-2">{santri.gender}</td>
                            <td className="p-2">{santri.birthPlace}</td>
                            <td className="p-2">{santri.parentName}</td>
                            <td className="p-2">{santri.parentPhone}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  santri.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {santri.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
                        ... dan {previewData.length - 10} data lainnya
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    resetForm();
                  }}
                  variant="outline"
                >
                  Pilih File Lain
                </Button>

                <div className="space-x-2">
                  <Button onClick={onClose} variant="outline">
                    Batal
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || validationErrors.length > 0}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengupload... {uploadProgress}%
                      </div>
                    ) : (
                      "Import Data"
                    )}
                  </Button>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress Upload</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Camera,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ProofUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  showPreview?: boolean;
}

export default function ProofUpload({
  onFileSelect,
  onFileRemove,
  selectedFile = null,
  maxSize = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
  className = "",
  disabled = false,
  required = true,
  showPreview = true,
}: ProofUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Format file tidak didukung. Gunakan: ${allowedTypes
        .map((type) => {
          switch (type) {
            case "image/jpeg":
            case "image/jpg":
              return "JPG";
            case "image/png":
              return "PNG";
            case "application/pdf":
              return "PDF";
            default:
              return type.split("/")[1].toUpperCase();
          }
        })
        .join(", ")}`;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Ukuran file terlalu besar. Maksimal ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setUploading(true);

      // Create preview for images
      if (file.type.startsWith("image/") && showPreview) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

      onFileSelect(file);
      toast.success("File berhasil dipilih");
    } catch (error) {
      console.error("Error handling file:", error);
      toast.error("Gagal memproses file");
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("File dihapus");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-600" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-600" />;
    }
    return <FileText className="h-8 w-8 text-gray-600" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith("image/")) {
      return "Gambar";
    } else if (file.type === "application/pdf") {
      return "PDF";
    }
    return "File";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(",")}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Bukti Transfer
                {required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag & drop file atau klik untuk memilih
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  JPG, PNG, PDF
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Maks {maxSize}MB
                </Badge>
              </div>

              <Button
                type="button"
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                disabled={disabled || uploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? "Memproses..." : "Pilih File"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                File Terpilih
              </div>
              <Button
                onClick={handleFileRemove}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{getFileIcon(selectedFile)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{getFileTypeLabel(selectedFile)}</span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">
                        Siap diupload
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Preview for images */}
                {previewUrl &&
                  selectedFile.type.startsWith("image/") &&
                  showPreview && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </h5>
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-48 rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            onClick={() => window.open(previewUrl, "_blank")}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">
                Petunjuk Upload Bukti Transfer:
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Pastikan bukti transfer terlihat jelas dan tidak buram</li>
                <li>
                  Foto harus menampilkan nama penerima, jumlah, dan tanggal
                  transfer
                </li>
                <li>Format yang didukung: JPG, PNG, atau PDF</li>
                <li>Ukuran file maksimal {maxSize}MB</li>
                <li>Bukti transfer akan diverifikasi dalam 1x24 jam</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  uploadEndpoint?: string;
  preview?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUploadComplete,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    'application/pdf': ['.pdf']
  },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false,
  multiple = false,
  uploadEndpoint = '/api/upload',
  preview = true
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    // Validate file size
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    onFileSelect(validFiles);

    // Create preview for images
    const filesWithPreview = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...filesWithPreview]);
    setIsUploading(true);

    // Upload files
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'rumah-tahfidz');

        try {
          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            setUploadedFiles(prev => 
              prev.map((uploadedFile, i) => 
                uploadedFile.file === file 
                  ? { ...uploadedFile, status: 'success', url: result.url }
                  : uploadedFile
              )
            );
            return result.url;
          } else {
            throw new Error(result.error || 'Upload failed');
          }
        } catch (error) {
          setUploadedFiles(prev => 
            prev.map((uploadedFile, i) => 
              uploadedFile.file === file 
                ? { ...uploadedFile, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
                : uploadedFile
            )
          );
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as string[];
      
      if (successfulUploads.length > 0 && onUploadComplete) {
        onUploadComplete(successfulUploads);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onFileSelect, onUploadComplete, maxSize, disabled, uploadEndpoint]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: disabled || isUploading
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(uploadedFile => uploadedFile.file !== fileToRemove);
      // Revoke object URLs to prevent memory leaks
      prev.forEach(uploadedFile => {
        if (uploadedFile.preview) {
          URL.revokeObjectURL(uploadedFile.preview);
        }
      });
      return updated;
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive 
            ? 'border-teal-500 bg-teal-50' 
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-teal-600 font-medium">Lepaskan file di sini...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-2">
              Klik atau seret file ke sini untuk upload
            </p>
            <p className="text-sm text-gray-500">
              Maksimal {maxSize / 1024 / 1024}MB • {Object.values(accept).flat().join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-lg border"
            >
              {/* File Icon/Preview */}
              <div className="flex-shrink-0 mr-3">
                {preview && uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(uploadedFile.file)
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadedFile.error && (
                  <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                {getStatusIcon(uploadedFile.status)}
                
                {uploadedFile.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(uploadedFile.file)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-blue-700">Mengupload file...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

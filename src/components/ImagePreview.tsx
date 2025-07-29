"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function ImagePreview({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  onError,
  onLoad,
}: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  const handleImageError = () => {
    console.error("Image failed to load:", currentSrc);

    // Try fallback URLs
    if (currentSrc.startsWith('/api/mobile-builds/assets/')) {
      // Try direct static file access
      const staticSrc = currentSrc.replace('/api/mobile-builds/assets/', '/uploads/mobile-assets/');
      console.log("Trying static fallback:", staticSrc);
      setCurrentSrc(staticSrc);
      setIsLoading(true);
      return;
    } else if (currentSrc.startsWith('/uploads/mobile-assets/') && retryCount < 2) {
      // Try API endpoint
      const apiSrc = currentSrc.replace('/uploads/mobile-assets/', '/api/mobile-builds/assets/');
      console.log("Trying API fallback:", apiSrc);
      setCurrentSrc(apiSrc);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      return;
    }

    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", currentSrc);
    setImageError(false);
    setIsLoading(false);
    onLoad?.();
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setImageError(false);
      setIsLoading(true);

      // Force reload by adding timestamp and cache busting
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = `${src}?t=${Date.now()}&retry=${retryCount + 1}`;
    }
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-2 ${fallbackClassName}`}>
        <AlertCircle className="w-6 h-6 text-gray-400 mb-1" />
        <span className="text-xs text-gray-500 text-center mb-2">
          Gambar tidak dapat dimuat
        </span>
        {retryCount < 3 && (
          <button
            onClick={handleRetry}
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-100 rounded flex items-center justify-center ${className}`}>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={`${currentSrc}?t=${Date.now()}&retry=${retryCount}`}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}

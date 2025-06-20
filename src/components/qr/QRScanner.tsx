'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
  continuous?: boolean;
  facingMode?: 'user' | 'environment';
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  className = '',
  title = 'QR Scanner',
  description = 'Arahkan kamera ke QR code untuk scan',
  continuous = false,
  facingMode = 'environment'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScan, setLastScan] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ data: string; timestamp: number } | null>(null);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simple QR code detection (for demo purposes)
  // In production, you would use a proper QR code library like qr-scanner
  const detectQRCode = (imageData: ImageData): string | null => {
    // This is a mock implementation
    // In real app, you would use a proper QR detection library
    const mockQRData = [
      'attendance_2024-02-12_halaqah-1',
      'santri_24001_ahmad-fauzi',
      'payment_spp_2024-02',
      'event_wisuda_2024-02-20'
    ];
    
    // Simulate QR detection with random success
    if (Math.random() > 0.8) { // 20% chance of detection
      return mockQRData[Math.floor(Math.random() * mockQRData.length)];
    }
    
    return null;
  };

  const startCamera = async () => {
    try {
      setError('');
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setHasPermission(true);
      setIsScanning(true);
      
      // Start scanning
      startScanning();
      
    } catch (error) {
      console.error('Camera access error:', error);
      setHasPermission(false);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      
      if (onError) {
        onError('Camera access denied');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrData = detectQRCode(imageData);
        
        if (qrData && qrData !== lastScan) {
          setLastScan(qrData);
          setScanResult({ data: qrData, timestamp: Date.now() });
          onScan(qrData);
          
          if (!continuous) {
            stopCamera();
          }
        }
      }
    }, 100); // Scan every 100ms
  };

  const resetScanner = () => {
    setLastScan('');
    setScanResult(null);
    setError('');
    
    if (!isScanning) {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetScanner}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            {isScanning ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopCamera}
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={startCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      
      <CardContent>
        {/* Camera View */}
        <div className="relative mb-4">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-teal-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-500"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-teal-500 animate-pulse"></div>
                </div>
              </div>
            )}
            
            {/* Status Overlay */}
            {!isScanning && hasPermission !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center text-white">
                  {hasPermission === false ? (
                    <>
                      <CameraOff className="h-12 w-12 mx-auto mb-2" />
                      <p>Kamera tidak dapat diakses</p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 mx-auto mb-2" />
                      <p>Klik Start untuk memulai scan</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Hidden Canvas for Processing */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-700">QR Code Detected!</span>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-mono break-all">{scanResult.data}</p>
              <p className="text-xs mt-1">
                Scanned at: {new Date(scanResult.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500">
          <p>Posisikan QR code di dalam frame untuk scan otomatis</p>
          {continuous && (
            <p className="mt-1">Mode continuous: Scanner akan terus berjalan</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;

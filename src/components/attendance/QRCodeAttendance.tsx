'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  QrCode,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  QRCodeSession,
  AttendanceRecord,
  SessionType,
  getSessionTypeText,
  getSessionTypeColor,
  generateQRCode,
  validateQRCode
} from '@/lib/attendance-data';

interface QRCodeAttendanceProps {
  halaqahId: string;
  halaqahName: string;
  sessionType: SessionType;
  onAttendanceScanned: (attendanceData: Partial<AttendanceRecord>) => void;
}

export default function QRCodeAttendance({
  halaqahId,
  halaqahName,
  sessionType,
  onAttendanceScanned
}: QRCodeAttendanceProps) {
  const [qrSession, setQrSession] = useState<QRCodeSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const generateQRSession = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split('T')[0];
      const qrCode = generateQRCode(halaqahId, sessionType, currentDate);
      
      const newSession: QRCodeSession = {
        id: `qr_${Date.now()}`,
        halaqahId,
        sessionType,
        date: currentDate,
        qrCode,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        createdBy: 'current_user_id',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        maxUsage: 50
      };

      setQrSession(newSession);
      setIsActive(true);
      setTimeRemaining(30 * 60); // 30 minutes in seconds
      setScannedCount(0);
      setRecentScans([]);
      
      toast.success('QR Code berhasil dibuat!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Gagal membuat QR Code');
    } finally {
      setLoading(false);
    }
  };

  const stopQRSession = () => {
    setIsActive(false);
    setTimeRemaining(0);
    if (qrSession) {
      setQrSession({ ...qrSession, isActive: false });
    }
    toast.success('Sesi QR Code dihentikan');
  };

  const copyQRCode = () => {
    if (qrSession?.qrCode) {
      navigator.clipboard.writeText(qrSession.qrCode);
      toast.success('QR Code berhasil disalin!');
    }
  };

  const downloadQRCode = () => {
    if (qrSession?.qrCode) {
      // Create QR code image and download
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 300;
        canvas.height = 300;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code Absensi', 150, 20);
        ctx.fillText(halaqahName, 150, 35);
        ctx.fillText(getSessionTypeText(sessionType), 150, 50);
        
        // Simple QR representation (in real app, use QR library)
        ctx.fillRect(50, 70, 200, 200);
        ctx.fillStyle = 'white';
        ctx.fillRect(60, 80, 180, 180);
        ctx.fillStyle = 'black';
        ctx.font = '10px monospace';
        ctx.fillText(qrSession.qrCode.substring(0, 20), 150, 170);
        
        const link = document.createElement('a');
        link.download = `qr-attendance-${halaqahId}-${sessionType}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const mockRecentScans: AttendanceRecord[] = [
    {
      id: 'scan_1',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      santriNis: 'TPQ001',
      halaqahId,
      halaqahName,
      musyrifId: 'musyrif_1',
      musyrifName: 'Ustadz Ahmad',
      date: new Date().toISOString().split('T')[0],
      sessionType,
      status: 'PRESENT',
      checkInTime: new Date().toTimeString().split(' ')[0],
      method: 'QR_CODE',
      recordedBy: 'system',
      recordedAt: new Date().toISOString(),
      metadata: {
        qrCodeId: qrSession?.id,
        deviceId: 'mobile_001'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* QR Code Generator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-teal-600" />
                <span>QR Code Absensi</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {halaqahName} - {getSessionTypeText(sessionType)}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSessionTypeColor(sessionType)}`}>
              {getSessionTypeText(sessionType)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isActive ? (
            <div className="text-center py-8">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Sesi Aktif
              </h3>
              <p className="text-gray-600 mb-6">
                Buat QR Code untuk memulai sesi absensi
              </p>
              <Button 
                onClick={generateQRSession} 
                disabled={loading}
                className="px-8"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                Buat QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                  <div className="w-48 h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">QR Code</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {qrSession?.qrCode.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" onClick={copyQRCode}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadQRCode}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">Waktu Tersisa</p>
                  <p className="text-xl font-bold text-blue-900">{formatTime(timeRemaining)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">Sudah Scan</p>
                  <p className="text-xl font-bold text-green-900">{scannedCount}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-600 font-medium">Status</p>
                  <p className="text-sm font-bold text-purple-900">
                    {isActive ? 'Aktif' : 'Tidak Aktif'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={generateQRSession} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh QR
                </Button>
                <Button variant="outline" onClick={stopQRSession} className="text-red-600 border-red-600 hover:bg-red-50">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Stop Sesi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <span>Scan Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada santri yang scan QR Code</p>
                <p className="text-sm text-gray-500">Scan akan muncul di sini secara real-time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{scan.santriName}</p>
                        <p className="text-sm text-gray-500">{scan.santriNis}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {scan.checkInTime && new Date(`1970-01-01T${scan.checkInTime}`).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">Baru saja</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Petunjuk Penggunaan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p>Klik "Buat QR Code" untuk memulai sesi absensi</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p>Tampilkan QR Code di layar atau cetak untuk ditempel di kelas</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p>Santri scan QR Code menggunakan aplikasi mobile TPQ</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <p>Absensi otomatis tercatat dengan timestamp dan lokasi</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <p>QR Code berlaku selama 30 menit atau hingga sesi dihentikan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

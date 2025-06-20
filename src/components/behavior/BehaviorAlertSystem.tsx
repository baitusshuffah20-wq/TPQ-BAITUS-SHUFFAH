'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Target,
  Users,
  Eye,
  X,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BehaviorAlert,
  BehaviorSeverity,
  getBehaviorSeverityColor,
  getBehaviorSeverityText,
  formatBehaviorDate,
  formatBehaviorTime
} from '@/lib/behavior-data';

interface BehaviorAlertSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BehaviorAlertSystem({ isOpen, onClose }: BehaviorAlertSystemProps) {
  const [alerts, setAlerts] = useState<BehaviorAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<BehaviorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showResolved, setShowResolved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock alerts data
  const mockAlerts: BehaviorAlert[] = [
    {
      id: 'alert_1',
      santriId: 'santri_3',
      santriName: 'Muhammad Rizki',
      alertType: 'PATTERN',
      title: 'Pola Perilaku Negatif Berulang',
      message: 'Muhammad Rizki menunjukkan pola mengganggu kelas selama 3 hari berturut-turut',
      severity: 'HIGH',
      triggerCriteria: {
        type: 'CONSECUTIVE_NEGATIVE',
        threshold: 3,
        period: 'DAILY'
      },
      isRead: false,
      isResolved: false,
      actionRequired: true,
      assignedTo: ['musyrif_2', 'admin_1'],
      createdAt: '2024-01-15T10:30:00Z',
      metadata: {
        behaviorCount: 3,
        pointsTotal: -12,
        patternDays: 3,
        relatedRecords: ['beh_3', 'beh_8', 'beh_12']
      }
    },
    {
      id: 'alert_2',
      santriId: 'santri_7',
      santriName: 'Umar Ibn Khattab',
      alertType: 'FREQUENCY',
      title: 'Keterlambatan Berulang',
      message: 'Umar Ibn Khattab terlambat 5 kali dalam 2 minggu terakhir',
      severity: 'MEDIUM',
      triggerCriteria: {
        type: 'LATE_FREQUENCY',
        threshold: 5,
        period: 'WEEKLY'
      },
      isRead: true,
      isResolved: false,
      actionRequired: true,
      assignedTo: ['musyrif_1'],
      createdAt: '2024-01-14T08:15:00Z',
      metadata: {
        behaviorCount: 5,
        pointsTotal: -10,
        patternDays: 14
      }
    },
    {
      id: 'alert_3',
      santriId: 'santri_1',
      santriName: 'Ahmad Fauzi',
      alertType: 'IMPROVEMENT',
      title: 'Peningkatan Signifikan',
      message: 'Ahmad Fauzi menunjukkan peningkatan konsisten dalam 2 minggu terakhir',
      severity: 'LOW',
      triggerCriteria: {
        type: 'POSITIVE_TREND',
        threshold: 80,
        period: 'WEEKLY'
      },
      isRead: true,
      isResolved: true,
      actionRequired: false,
      assignedTo: ['musyrif_1'],
      createdAt: '2024-01-13T14:20:00Z',
      resolvedAt: '2024-01-14T09:00:00Z',
      resolution: 'Apresiasi diberikan kepada santri dan orang tua diberitahu tentang perkembangan positif',
      metadata: {
        behaviorCount: 8,
        pointsTotal: 24,
        patternDays: 14
      }
    },
    {
      id: 'alert_4',
      santriId: 'santri_12',
      santriName: 'Zaynab Binti Ahmad',
      alertType: 'GOAL_RISK',
      title: 'Target Karakter Berisiko',
      message: 'Progress target pengembangan karakter Zaynab di bawah 50% menjelang deadline',
      severity: 'MEDIUM',
      triggerCriteria: {
        type: 'GOAL_PROGRESS',
        threshold: 50,
        period: 'MONTHLY'
      },
      isRead: false,
      isResolved: false,
      actionRequired: true,
      assignedTo: ['musyrif_2', 'admin_1'],
      createdAt: '2024-01-12T16:45:00Z',
      metadata: {
        behaviorCount: 2,
        pointsTotal: 4
      }
    },
    {
      id: 'alert_5',
      santriId: 'santri_15',
      santriName: 'Ali Ibn Abi Thalib',
      alertType: 'SEVERITY',
      title: 'Perilaku Kritis',
      message: 'Ali Ibn Abi Thalib melakukan perilaku dengan tingkat keparahan tinggi',
      severity: 'CRITICAL',
      triggerCriteria: {
        type: 'HIGH_SEVERITY',
        threshold: 1,
        period: 'IMMEDIATE'
      },
      isRead: false,
      isResolved: false,
      actionRequired: true,
      assignedTo: ['musyrif_1', 'musyrif_2', 'admin_1'],
      createdAt: '2024-01-15T11:00:00Z',
      metadata: {
        behaviorCount: 1,
        pointsTotal: -10
      }
    }
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedSeverity, selectedType, showResolved, searchTerm]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Gagal memuat alert');
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.alertType === selectedType);
    }

    // Filter by resolved status
    if (!showResolved) {
      filtered = filtered.filter(alert => !alert.isResolved);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    toast.success('Alert ditandai sebagai sudah dibaca');
  };

  const resolveAlert = (alertId: string, resolution: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? {
        ...alert,
        isResolved: true,
        resolvedAt: new Date().toISOString(),
        resolution
      } : alert
    ));
    toast.success('Alert berhasil diselesaikan');
  };

  const getAlertIcon = (alertType: BehaviorAlert['alertType']) => {
    switch (alertType) {
      case 'PATTERN': return <TrendingDown className="h-5 w-5" />;
      case 'FREQUENCY': return <Clock className="h-5 w-5" />;
      case 'SEVERITY': return <AlertTriangle className="h-5 w-5" />;
      case 'GOAL_RISK': return <Target className="h-5 w-5" />;
      case 'IMPROVEMENT': return <TrendingUp className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertTypeColor = (alertType: BehaviorAlert['alertType']) => {
    switch (alertType) {
      case 'PATTERN': return 'text-red-600 bg-red-100';
      case 'FREQUENCY': return 'text-orange-600 bg-orange-100';
      case 'SEVERITY': return 'text-red-600 bg-red-100';
      case 'GOAL_RISK': return 'text-yellow-600 bg-yellow-100';
      case 'IMPROVEMENT': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertTypeText = (alertType: BehaviorAlert['alertType']) => {
    switch (alertType) {
      case 'PATTERN': return 'Pola Perilaku';
      case 'FREQUENCY': return 'Frekuensi';
      case 'SEVERITY': return 'Tingkat Keparahan';
      case 'GOAL_RISK': return 'Risiko Target';
      case 'IMPROVEMENT': return 'Peningkatan';
      default: return alertType;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead && !alert.isResolved).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'CRITICAL' && !alert.isResolved).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-teal-600" />
              <div>
                <CardTitle>Sistem Alert Perilaku</CardTitle>
                <p className="text-sm text-gray-600">
                  {unreadCount} alert belum dibaca
                  {criticalCount > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                      {criticalCount} kritis
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari alert atau santri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Tingkat</option>
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
                <option value="CRITICAL">Kritis</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="PATTERN">Pola Perilaku</option>
                <option value="FREQUENCY">Frekuensi</option>
                <option value="SEVERITY">Tingkat Keparahan</option>
                <option value="GOAL_RISK">Risiko Target</option>
                <option value="IMPROVEMENT">Peningkatan</option>
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Tampilkan yang selesai</span>
              </label>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada alert</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedSeverity !== 'all' || selectedType !== 'all'
                    ? 'Tidak ada alert yang sesuai dengan filter'
                    : 'Semua alert sudah ditangani'
                  }
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg transition-all ${
                    alert.isResolved
                      ? 'border-gray-200 bg-gray-50'
                      : alert.severity === 'CRITICAL'
                      ? 'border-red-300 bg-red-50'
                      : alert.severity === 'HIGH'
                      ? 'border-orange-300 bg-orange-50'
                      : alert.isRead
                      ? 'border-gray-200 bg-white'
                      : 'border-teal-300 bg-teal-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.alertType)}`}>
                        {getAlertIcon(alert.alertType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          {!alert.isRead && !alert.isResolved && (
                            <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Santri: {alert.santriName}</span>
                          <span>{formatBehaviorDate(alert.createdAt.split('T')[0])}</span>
                          <span>{formatBehaviorTime(alert.createdAt.split('T')[1])}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorSeverityColor(alert.severity)}`}>
                        {getBehaviorSeverityText(alert.severity)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAlertTypeColor(alert.alertType)}`}>
                        {getAlertTypeText(alert.alertType)}
                      </span>
                    </div>
                  </div>

                  {/* Alert Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {alert.isResolved ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Selesai</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Perlu Tindakan</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!alert.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                        >
                          Tandai Dibaca
                        </Button>
                      )}
                      {!alert.isResolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id, 'Ditangani oleh musyrif')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Selesaikan
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Tindak Lanjut
                      </Button>
                    </div>
                  </div>

                  {/* Resolution */}
                  {alert.isResolved && alert.resolution && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Penyelesaian:</strong> {alert.resolution}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Diselesaikan pada: {alert.resolvedAt && formatBehaviorDate(alert.resolvedAt.split('T')[0])}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

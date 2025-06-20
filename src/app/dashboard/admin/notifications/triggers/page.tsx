'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  Play,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Target,
  Activity,
  Settings,
  BarChart3,
  Timer,
  Bell,
  Users,
  CreditCard,
  BookOpen,
  Gift,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Trigger {
  type: string;
  name: string;
  description: string;
  category: string;
  requiresTarget: boolean;
  targetType?: string;
  schedule: string;
}

interface TriggerLog {
  id: string;
  triggerType: string;
  executedAt: string;
  status: string;
  notificationsSent: number;
  duration: number;
}

export default function NotificationTriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTrigger, setRunningTrigger] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTriggers: 0,
    activeTriggers: 0,
    lastRun: null as string | null,
    nextRun: null as string | null
  });

  useEffect(() => {
    loadTriggers();
    loadTriggerStatus();
  }, []);

  const loadTriggers = async () => {
    try {
      const response = await fetch('/api/notifications/triggers');
      if (response.ok) {
        const data = await response.json();
        setTriggers(data.data.triggers);
      }
    } catch (error) {
      console.error('Error loading triggers:', error);
      toast.error('Gagal memuat daftar trigger');
    }
  };

  const loadTriggerStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cron/notifications');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data.recentLogs);
        setStats({
          totalTriggers: data.data.triggers.length,
          activeTriggers: data.data.triggers.filter((t: any) => t.enabled).length,
          lastRun: data.data.recentLogs[0]?.executedAt || null,
          nextRun: data.data.nextScheduledRun
        });
      }
    } catch (error) {
      console.error('Error loading trigger status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTrigger = async (triggerType: string) => {
    setRunningTrigger(triggerType);
    try {
      const response = await fetch('/api/notifications/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Trigger berhasil dijalankan! ${data.data.notificationsSent} notifikasi dikirim`);
        loadTriggerStatus();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menjalankan trigger');
      }
    } catch (error) {
      console.error('Error running trigger:', error);
      toast.error('Gagal menjalankan trigger');
    } finally {
      setRunningTrigger(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Payment':
        return <CreditCard className="h-5 w-5" />;
      case 'Attendance':
        return <Users className="h-5 w-5" />;
      case 'Academic':
        return <BookOpen className="h-5 w-5" />;
      case 'Reports':
        return <FileText className="h-5 w-5" />;
      case 'Social':
        return <Gift className="h-5 w-5" />;
      case 'System':
        return <Settings className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Payment':
        return 'bg-green-100 text-green-800';
      case 'Attendance':
        return 'bg-blue-100 text-blue-800';
      case 'Academic':
        return 'bg-purple-100 text-purple-800';
      case 'Reports':
        return 'bg-orange-100 text-orange-800';
      case 'Social':
        return 'bg-pink-100 text-pink-800';
      case 'System':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success">Berhasil</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Gagal</Badge>;
      case 'RUNNING':
        return <Badge variant="warning">Berjalan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Trigger Notifikasi</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat trigger...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trigger Notifikasi</h1>
            <p className="text-gray-600">Kelola trigger otomatis untuk notifikasi sistem</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadTriggerStatus}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => runTrigger('ALL_SCHEDULED')}
              disabled={runningTrigger === 'ALL_SCHEDULED'}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              {runningTrigger === 'ALL_SCHEDULED' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="h-4 w-4" />
              )}
              Jalankan Semua
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trigger</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTriggers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trigger Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeTriggers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terakhir Dijalankan</p>
                  <p className="text-sm font-bold text-gray-900">
                    {stats.lastRun ? formatDate(stats.lastRun) : 'Belum pernah'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jadwal Berikutnya</p>
                  <p className="text-sm font-bold text-gray-900">
                    {stats.nextRun ? formatDate(stats.nextRun) : 'Tidak terjadwal'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Triggers List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Trigger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {triggers.map((trigger) => (
                <div
                  key={trigger.type}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(trigger.category)}`}>
                        {getCategoryIcon(trigger.category)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{trigger.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {trigger.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{trigger.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Timer className="h-3 w-3" />
                    <span>{trigger.schedule}</span>
                  </div>

                  {trigger.requiresTarget && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 mb-3">
                      <Target className="h-3 w-3" />
                      <span>Memerlukan target ID</span>
                    </div>
                  )}

                  <Button
                    onClick={() => runTrigger(trigger.type)}
                    disabled={runningTrigger === trigger.type || trigger.requiresTarget}
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                    variant={trigger.requiresTarget ? "outline" : "default"}
                  >
                    {runningTrigger === trigger.type ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    {trigger.requiresTarget ? 'Manual Only' : 'Jalankan'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Log Eksekusi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada log eksekusi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{log.triggerType}</span>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        <span>{log.notificationsSent} notifikasi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        <span>{log.duration}ms</span>
                      </div>
                      <span>{formatDate(log.executedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  Mail,
  Smartphone,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Notification,
  getNotificationStatusColor,
  getNotificationStatusText
} from '@/lib/quran-data';

// Using Notification interface from quran-data.ts

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    priority: '',
    channel: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: 'admin-user',
        limit: '50',
        offset: '0'
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        toast.error('Gagal memuat notifikasi');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams({
        userId: 'admin-user',
        statsOnly: 'true'
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          action: 'mark_read'
        })
      });

      if (response.ok) {
        toast.success('Notifikasi ditandai sudah dibaca');
        loadNotifications();
        loadStats();
      } else {
        toast.error('Gagal menandai notifikasi');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Gagal menandai notifikasi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="success">Terkirim</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Menunggu</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Gagal</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary">Terjadwal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="warning">Tinggi</Badge>;
      case 'NORMAL':
        return <Badge variant="secondary">Normal</Badge>;
      case 'LOW':
        return <Badge variant="outline">Rendah</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getChannelIcons = (channels: string) => {
    const channelList = channels.split(',');
    return (
      <div className="flex gap-1">
        {channelList.map((channel, index) => {
          switch (channel.trim()) {
            case 'IN_APP':
              return <Bell key={index} className="h-4 w-4 text-blue-600" title="In-App" />;
            case 'EMAIL':
              return <Mail key={index} className="h-4 w-4 text-green-600" title="Email" />;
            case 'WHATSAPP':
              return <MessageSquare key={index} className="h-4 w-4 text-green-500" title="WhatsApp" />;
            case 'SMS':
              return <Smartphone key={index} className="h-4 w-4 text-purple-600" title="SMS" />;
            default:
              return null;
          }
        })}
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Notifikasi</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat notifikasi...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Notifikasi</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = '/dashboard/admin/notifications/send'}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Kirim Notifikasi
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard/admin/notifications/templates'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Template
            </Button>
            <Button
              onClick={loadNotifications}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <a
              href="/dashboard/admin/notifications"
              className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
            >
              Daftar Notifikasi
            </a>
            <a
              href="/dashboard/admin/notifications/templates"
              className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Template
            </a>
            <a
              href="/dashboard/admin/notifications/send"
              className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Kirim Notifikasi
            </a>
          </nav>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifikasi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Belum Dibaca</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Terkirim</p>
                    <p className="text-2xl font-bold text-green-600">{stats.byStatus.SENT || 0}</p>
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
                    <p className="text-sm font-medium text-gray-600">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.PENDING || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Cari notifikasi..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Tipe</option>
                  <option value="PAYMENT_REMINDER">Pengingat Pembayaran</option>
                  <option value="PAYMENT_CONFIRMATION">Konfirmasi Pembayaran</option>
                  <option value="SPP_OVERDUE">SPP Terlambat</option>
                  <option value="ATTENDANCE_ALERT">Alert Absensi</option>
                  <option value="HAFALAN_PROGRESS">Progress Hafalan</option>
                  <option value="SYSTEM_ANNOUNCEMENT">Pengumuman</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="SENT">Terkirim</option>
                  <option value="FAILED">Gagal</option>
                  <option value="SCHEDULED">Terjadwal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritas
                </label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Prioritas</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Rendah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <select
                  name="channel"
                  value={filters.channel}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Channel</option>
                  <option value="IN_APP">In-App</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Notifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      notification.readAt ? 'bg-white' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {getStatusBadge(notification.status)}
                          {getPriorityBadge(notification.priority)}
                          {getChannelIcons(notification.channels)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Dibuat: {formatDate(notification.createdAt)}</span>
                          {notification.sentAt && (
                            <span>Dikirim: {formatDate(notification.sentAt)}</span>
                          )}
                          {notification.recipient && (
                            <span>Penerima: {notification.recipient.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.readAt && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Tandai Dibaca
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Detail
                        </Button>
                      </div>
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

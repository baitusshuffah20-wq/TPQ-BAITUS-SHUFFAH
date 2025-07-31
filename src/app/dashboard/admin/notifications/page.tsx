"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Bell,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Database Notification interface
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  priority?: string;
  status?: string;
  channels?: string;
  recipientId?: string;
  recipientType?: string;
  relatedId?: string;
  metadata?: string;
  scheduledAt?: string;
  sentAt?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug session
  console.log("🔐 Session data:", session);
  console.log("🔐 Session status:", session ? "authenticated" : "not authenticated");

  // Force initial load on mount
  useEffect(() => {
    console.log("🚀 Component mounted, forcing data load...");
    loadNotifications();
    loadStats();
  }, []);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    priority: "",
    channel: "",
  });
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Separate useEffect for filter changes
  useEffect(() => {
    if (filters.search || filters.type || filters.status || filters.priority || filters.channel) {
      console.log("🔄 Filters changed, reloading data...", filters);
      loadNotifications();
    }
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Get current user session to determine role-based access
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();

      let targetUserId;
      if (sessionData?.user?.role === "ADMIN") {
        // Admin can see all notifications
        targetUserId = "all";
        console.log("🔍 Loading ALL notifications for ADMIN user");
      } else {
        // Non-admin users only see their own notifications
        targetUserId = sessionData?.user?.id || "cmdqxjrs100005w6299z3eesl";
        console.log("🔍 Loading notifications for user:", targetUserId, "Role:", sessionData?.user?.role);
      }

      console.log("🔍 Current filters:", filters);

      const params = new URLSearchParams({
        userId: targetUserId,
        limit: "50",
        offset: "0",
      });

      // Add filter parameters if they exist
      if (filters.search) params.append("search", filters.search);
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.channel) params.append("channel", filters.channel);

      console.log("📡 Fetching notifications with filters:", `/api/notifications?${params}`);
      const response = await fetch(`/api/notifications?${params}`);

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Notifications data received:", data);
        console.log("✅ Notifications array:", data.notifications);
        console.log("✅ Notifications length:", data.notifications?.length);
        setNotifications(data.notifications || []);
        console.log("✅ State updated, notifications should be:", data.notifications || []);
      } else {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);
        toast.error("Gagal memuat notifikasi");
      }
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get current user session to determine role-based access
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();

      let targetUserId;
      if (sessionData?.user?.role === "ADMIN") {
        // Admin can see stats for all notifications
        targetUserId = "all";
      } else {
        // Non-admin users only see stats for their own notifications
        targetUserId = sessionData?.user?.id || "cmdqxjrs100005w6299z3eesl";
      }

    try {
      console.log("📊 Loading stats for user:", targetUserId);

      const params = new URLSearchParams({
        userId: targetUserId,
        statsOnly: "true",
      });

      const response = await fetch(`/api/notifications?${params}`);
      console.log("📊 Stats response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Stats data received:", data);
        setStats(data.stats);
      } else {
        const errorText = await response.text();
        console.error("❌ Stats API Error:", response.status, errorText);
      }
    } catch (error) {
      console.error("❌ Error loading stats:", error);
    }
    } catch (error) {
      console.error("❌ Error in loadStats:", error);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    console.log("🔄 Filter changed:", { name, value });
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    console.log("🧹 Clearing all filters");
    setFilters({
      search: "",
      type: "",
      status: "",
      priority: "",
      channel: "",
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId,
          action: "mark_read",
        }),
      });

      if (response.ok) {
        toast.success("Notifikasi ditandai sudah dibaca");
        loadNotifications();
        loadStats();
      } else {
        toast.error("Gagal menandai notifikasi");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Gagal menandai notifikasi");
    }
  };

  const handleViewDetail = (notification: Notification) => {
    console.log("📋 Opening detail for notification:", notification.id);
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedNotification(null);
    setShowDetailModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge variant="success">Terkirim</Badge>;
      case "PENDING":
        return <Badge variant="warning">Menunggu</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Gagal</Badge>;
      case "SCHEDULED":
        return <Badge variant="secondary">Terjadwal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>;
      case "HIGH":
        return <Badge variant="warning">Tinggi</Badge>;
      case "NORMAL":
        return <Badge variant="secondary">Normal</Badge>;
      case "LOW":
        return <Badge variant="outline">Rendah</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getChannelIcons = (channels: string | string[]) => {
    const channelList = Array.isArray(channels)
      ? channels
      : channels.split(",");
    return (
      <div className="flex gap-1">
        {channelList.map((channel, index) => {
          switch (channel.trim()) {
            case "IN_APP":
              return (
                <span key={index} title="In-App">
                  <Bell className="h-4 w-4 text-blue-600" />
                </span>
              );
            case "EMAIL":
              return (
                <span key={index} title="Email">
                  <Mail className="h-4 w-4 text-green-600" />
                </span>
              );
            case "WHATSAPP":
              return (
                <span key={index} title="WhatsApp">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                </span>
              );
            case "SMS":
              return (
                <span key={index} title="SMS">
                  <Smartphone className="h-4 w-4 text-purple-600" />
                </span>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Debug render state
  console.log("🎨 Render - Loading:", loading);
  console.log("🎨 Render - Notifications:", notifications);
  console.log("🎨 Render - Notifications length:", notifications.length);
  console.log("🎨 Render - Stats:", stats);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Notifikasi
            </h1>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Notifikasi
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() =>
                (window.location.href = "/dashboard/admin/notifications/send")
              }
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Kirim Notifikasi
            </Button>
            <Button
              onClick={() =>
                (window.location.href =
                  "/dashboard/admin/notifications/templates")
              }
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
                    <p className="text-sm font-medium text-gray-600">
                      Total Notifikasi
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Belum Dibaca
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.unread}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Terkirim
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.byStatus.SENT || 0}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Menunggu
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.byStatus.PENDING || 0}
                    </p>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Notifikasi
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
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
                  <option value="PAYMENT_CONFIRMATION">
                    Konfirmasi Pembayaran
                  </option>
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
                      notification.readAt
                        ? "bg-white"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {getStatusBadge(notification.status)}
                          {getPriorityBadge(notification.priority)}
                          {getChannelIcons(notification.channels)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Dibuat: {formatDate(notification.createdAt)}
                          </span>
                          {notification.sentAt && (
                            <span>
                              Dikirim: {formatDate(notification.sentAt)}
                            </span>
                          )}
                          {notification.user && (
                            <span className="text-blue-600 font-medium">
                              Untuk: {notification.user.name} ({notification.user.role})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
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
                          onClick={() => handleViewDetail(notification)}
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

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Notifikasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang notifikasi ini
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedNotification.type === 'URGENT' ? 'destructive' : 'secondary'}>
                      {selectedNotification.type}
                    </Badge>
                    <Badge variant={selectedNotification.status === 'SENT' ? 'default' : 'secondary'}>
                      {selectedNotification.status}
                    </Badge>
                    {selectedNotification.priority && (
                      <Badge variant={selectedNotification.priority === 'HIGH' ? 'destructive' : 'outline'}>
                        {selectedNotification.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Pesan:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informasi Pengiriman:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Dibuat:</span> {new Date(selectedNotification.createdAt).toLocaleString('id-ID')}</p>
                    {selectedNotification.sentAt && (
                      <p><span className="font-medium">Dikirim:</span> {new Date(selectedNotification.sentAt).toLocaleString('id-ID')}</p>
                    )}
                    {selectedNotification.readAt && (
                      <p><span className="font-medium">Dibaca:</span> {new Date(selectedNotification.readAt).toLocaleString('id-ID')}</p>
                    )}
                    <p><span className="font-medium">Status Baca:</span> {selectedNotification.isRead ? 'Sudah dibaca' : 'Belum dibaca'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Channel:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedNotification.channels && (
                      <p>{selectedNotification.channels}</p>
                    )}
                    {selectedNotification.recipientType && (
                      <p><span className="font-medium">Tipe Penerima:</span> {selectedNotification.recipientType}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {!selectedNotification.isRead && (
                  <Button
                    onClick={() => {
                      markAsRead(selectedNotification.id);
                      closeDetailModal();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tandai Dibaca
                  </Button>
                )}
                <Button onClick={closeDetailModal} variant="default" size="sm">
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

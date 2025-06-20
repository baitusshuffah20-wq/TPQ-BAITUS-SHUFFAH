'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Send,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Eye,
  TrendingUp,
  AtSign,
  Calendar,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailMessage {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  status: string;
  messageId?: string;
  priority: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  bouncedAt?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface EmailStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export default function EmailDashboard() {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    dateRange: ''
  });
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Simulate data for now since API might not be ready
      setMessages([
        {
          id: '1',
          recipient: 'parent@example.com',
          subject: 'Progress Hafalan Ahmad',
          content: 'Assalamu\'alaikum, berikut adalah laporan progress hafalan Ahmad...',
          status: 'SENT',
          messageId: 'msg_123',
          priority: 'NORMAL',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          user: { name: 'Admin', email: 'admin@tpq.com' }
        }
      ]);
    } catch (error) {
      console.error('Error loading email messages:', error);
      toast.error('Gagal memuat pesan email');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulate stats for now
      setStats({
        total: 250,
        byStatus: {
          SENT: 200,
          DELIVERED: 180,
          FAILED: 10,
          BOUNCED: 5,
          PENDING: 35
        },
        byPriority: {
          NORMAL: 180,
          HIGH: 50,
          URGENT: 15,
          LOW: 5
        }
      });
    } catch (error) {
      console.error('Error loading email stats:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const sendTestEmail = async () => {
    if (!testEmail.to) {
      toast.error('Email tujuan wajib diisi');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail.to
        })
      });

      if (response.ok) {
        toast.success('Email test berhasil dikirim');
        setTestEmail({ to: '', subject: '', message: '' });
        loadMessages();
        loadStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal mengirim email test');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Gagal mengirim email test');
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="success">Terkirim</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Tersampaikan</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Menunggu</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Gagal</Badge>;
      case 'BOUNCED':
        return <Badge variant="destructive">Bounce</Badge>;
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
        return <Badge variant="outline">Normal</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Rendah</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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
            <h1 className="text-2xl font-bold text-gray-900">Email Dashboard</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat data email...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Email Dashboard</h1>
          <div className="flex gap-3">
            <Button
              onClick={loadMessages}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Email</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Mail className="h-6 w-6 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600">Tersampaikan</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.byStatus.DELIVERED || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Eye className="h-6 w-6 text-blue-600" />
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gagal</p>
                    <p className="text-2xl font-bold text-red-600">{(stats.byStatus.FAILED || 0) + (stats.byStatus.BOUNCED || 0)}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Kirim Email Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Tujuan
                </label>
                <Input
                  type="email"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={sendTestEmail}
                  disabled={sendingTest}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {sendingTest ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendingTest ? 'Mengirim...' : 'Kirim Email Test'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Email</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada email yang dikirim</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <AtSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {message.recipient}
                            </span>
                          </div>
                          {getStatusBadge(message.status)}
                          {getPriorityBadge(message.priority)}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{message.subject}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{message.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Dikirim: {formatDate(message.createdAt)}</span>
                          {message.sentAt && (
                            <span>Terkirim: {formatDate(message.sentAt)}</span>
                          )}
                          {message.deliveredAt && (
                            <span>Tersampaikan: {formatDate(message.deliveredAt)}</span>
                          )}
                          {message.user && (
                            <span>Oleh: {message.user.name}</span>
                          )}
                        </div>
                        {message.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            Error: {message.errorMessage}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
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

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
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
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WhatsAppMessage {
  id: string;
  recipient: string;
  messageType: string;
  content: string;
  status: string;
  whatsappMessageId?: string;
  templateName?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface WhatsAppStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export default function WhatsAppDashboard() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateRange: ''
  });
  const [testMessage, setTestMessage] = useState({
    to: '',
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
          recipient: '+6281234567890',
          messageType: 'TEXT',
          content: 'Assalamu\'alaikum, ini adalah pesan test dari TPQ Baitus Shuffah',
          status: 'SENT',
          whatsappMessageId: 'wamid.123',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          user: { name: 'Admin', email: 'admin@tpq.com' }
        }
      ]);
    } catch (error) {
      console.error('Error loading WhatsApp messages:', error);
      toast.error('Gagal memuat pesan WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulate stats for now
      setStats({
        total: 150,
        byStatus: {
          SENT: 120,
          DELIVERED: 100,
          READ: 80,
          FAILED: 5,
          PENDING: 25
        },
        byType: {
          TEXT: 100,
          TEMPLATE: 50
        }
      });
    } catch (error) {
      console.error('Error loading WhatsApp stats:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const sendTestMessage = async () => {
    if (!testMessage.to || !testMessage.message) {
      toast.error('Nomor telepon dan pesan wajib diisi');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testMessage.to,
          message: testMessage.message,
          type: 'text'
        })
      });

      if (response.ok) {
        toast.success('Pesan test berhasil dikirim');
        setTestMessage({ to: '', message: '' });
        loadMessages();
        loadStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal mengirim pesan test');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Gagal mengirim pesan test');
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
      case 'READ':
        return <Badge variant="success">Dibaca</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Menunggu</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Gagal</Badge>;
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

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone.startsWith('62')) {
      return '+' + phone;
    }
    return phone;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Dashboard</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Memuat data WhatsApp...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Dashboard</h1>
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
                    <p className="text-sm font-medium text-gray-600">Total Pesan</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600">Dibaca</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.byStatus.READ || 0}</p>
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
                    <p className="text-2xl font-bold text-red-600">{stats.byStatus.FAILED || 0}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Kirim Pesan Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp
                </label>
                <Input
                  type="text"
                  value={testMessage.to}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="628123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan
                </label>
                <Input
                  type="text"
                  value={testMessage.message}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Masukkan pesan test..."
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={sendTestMessage}
                  disabled={sendingTest}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  {sendingTest ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendingTest ? 'Mengirim...' : 'Kirim Test'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pesan WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada pesan WhatsApp</p>
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
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {formatPhoneNumber(message.recipient)}
                            </span>
                          </div>
                          {getStatusBadge(message.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{message.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Dikirim: {formatDate(message.createdAt)}</span>
                          {message.user && (
                            <span>Oleh: {message.user.name}</span>
                          )}
                        </div>
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

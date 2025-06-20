'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WhatsAppSettings from './WhatsAppSettings';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WhatsAppLog {
  id: string;
  recipientId: string;
  messageType: string;
  messageData: string;
  messageId: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  recipient: {
    name: string;
    phone?: string;
  };
}

interface WhatsAppStats {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}

export default function WhatsAppManager() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('custom_message');

  useEffect(() => {
    loadWhatsAppData();
  }, []);

  const loadWhatsAppData = async () => {
    try {
      setLoading(true);
      
      // Load WhatsApp logs
      const logsResponse = await fetch('/api/whatsapp/logs');
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData);
      }

      // Load WhatsApp statistics
      const statsResponse = await fetch('/api/whatsapp/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
      toast.error('Gagal memuat data WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkMessage = async () => {
    if (!messageText.trim() || selectedRecipients.length === 0) {
      toast.error('Pilih penerima dan tulis pesan');
      return;
    }

    try {
      setLoading(true);
      
      const promises = selectedRecipients.map(recipientId =>
        fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: messageType,
            recipientId,
            data: { message: messageText }
          })
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} pesan berhasil dikirim`);
        if (failed > 0) {
          toast.error(`${failed} pesan gagal dikirim`);
        }
        setMessageText('');
        setSelectedRecipients([]);
        loadWhatsAppData();
      } else {
        toast.error('Semua pesan gagal dikirim');
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast.error('Gagal mengirim pesan');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message dari Rumah Tahfidz Baitus Shuffah'
        })
      });

      if (response.ok) {
        toast.success('Pesan test berhasil dikirim');
      } else {
        toast.error('Gagal mengirim pesan test');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Gagal mengirim pesan test');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Terkirim</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Diterima</Badge>;
      case 'read':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Dibaca</Badge>;
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Terkirim</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tingkat Pengiriman</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tingkat Baca</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.readRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gagal</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Kirim Pesan</TabsTrigger>
          <TabsTrigger value="logs">Riwayat Pesan</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Kirim Pesan WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Pesan</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="custom_message">Pesan Kustom</option>
                  <option value="hafalan_progress">Laporan Hafalan</option>
                  <option value="attendance_notification">Notifikasi Absensi</option>
                  <option value="payment_reminder">Pengingat Pembayaran</option>
                  <option value="monthly_report">Laporan Bulanan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pesan</label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Tulis pesan WhatsApp..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Penerima ({selectedRecipients.length} dipilih)
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {/* Recipient selection would go here */}
                  <p className="text-sm text-gray-500">
                    Pilih penerima dari daftar wali santri...
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={sendBulkMessage}
                  disabled={loading || !messageText.trim() || selectedRecipients.length === 0}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Kirim Pesan
                </Button>
                
                <Button
                  variant="outline"
                  onClick={sendTestMessage}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Test Koneksi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Riwayat Pesan WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada riwayat pesan WhatsApp
                  </p>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <p className="font-medium">{log.recipient.name}</p>
                            <p className="text-sm text-gray-500">
                              {log.recipient.phone} • {log.messageType}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(log.sentAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(log.status)}
                          {log.readAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Dibaca: {new Date(log.readAt).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <WhatsAppSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  template: string;
  sentAt: string;
  error?: string;
}

interface EmailStats {
  totalSent: number;
  successful: number;
  failed: number;
  successRate: number;
  failureRate: number;
}

export default function EmailManager() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailType, setEmailType] = useState('custom');

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      setLoading(true);
      
      // Load email logs
      const logsResponse = await fetch('/api/email/logs');
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs);
      }

      // Load email statistics
      const statsResponse = await fetch('/api/email/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.overview);
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      toast.error('Gagal memuat data email');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim() || selectedRecipients.length === 0) {
      toast.error('Lengkapi semua field dan pilih penerima');
      return;
    }

    try {
      setLoading(true);
      
      const promises = selectedRecipients.map(recipientId =>
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: emailType,
            recipientId,
            data: { 
              subject: emailSubject,
              html: emailContent.replace(/\n/g, '<br>'),
              text: emailContent
            }
          })
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} email berhasil dikirim`);
        if (failed > 0) {
          toast.error(`${failed} email gagal dikirim`);
        }
        setEmailSubject('');
        setEmailContent('');
        setSelectedRecipients([]);
        loadEmailData();
      } else {
        toast.error('Semua email gagal dikirim');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast.error('Gagal mengirim email');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Test Email dari Rumah Tahfidz',
          message: 'Test email untuk memastikan konfigurasi SMTP berfungsi dengan baik.'
        })
      });

      if (response.ok) {
        toast.success('Test email berhasil dikirim');
      } else {
        const error = await response.json();
        toast.error(`Gagal mengirim test email: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Gagal mengirim test email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terkirim</Badge>;
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'welcome':
        return <Users className="h-4 w-4" />;
      case 'hafalan_progress':
        return <FileText className="h-4 w-4" />;
      case 'monthly_report':
        return <BarChart3 className="h-4 w-4" />;
      case 'payment_invoice':
      case 'payment_confirmation':
        return <CreditCard className="h-4 w-4" />;
      case 'attendance_notification':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
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
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Berhasil</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tingkat Sukses</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
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
          <TabsTrigger value="send">Kirim Email</TabsTrigger>
          <TabsTrigger value="logs">Riwayat Email</TabsTrigger>
          <TabsTrigger value="templates">Template</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Kirim Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Email</label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="custom">Email Kustom</option>
                  <option value="welcome">Email Selamat Datang</option>
                  <option value="hafalan_progress">Laporan Hafalan</option>
                  <option value="monthly_report">Laporan Bulanan</option>
                  <option value="payment_invoice">Invoice Pembayaran</option>
                  <option value="attendance_notification">Notifikasi Absensi</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Masukkan subject email..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Konten Email</label>
                <Textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Tulis konten email..."
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Penerima ({selectedRecipients.length} dipilih)
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-500">
                    Pilih penerima dari daftar pengguna...
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={sendBulkEmail}
                  disabled={loading || !emailSubject.trim() || !emailContent.trim() || selectedRecipients.length === 0}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Kirim Email
                </Button>
                
                <Button
                  variant="outline"
                  onClick={sendTestEmail}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Riwayat Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada riwayat email
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
                          {getTemplateIcon(log.template)}
                          <div>
                            <p className="font-medium">{log.subject}</p>
                            <p className="text-sm text-gray-500">
                              To: {log.recipient}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(log.sentAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(log.status)}
                          {log.error && (
                            <p className="text-xs text-red-500 mt-1 max-w-xs truncate">
                              {log.error}
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

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'welcome', name: 'Selamat Datang', icon: Users, description: 'Email untuk pengguna baru' },
                  { id: 'hafalan_progress', name: 'Laporan Hafalan', icon: FileText, description: 'Progress hafalan santri' },
                  { id: 'monthly_report', name: 'Laporan Bulanan', icon: BarChart3, description: 'Laporan bulanan lengkap' },
                  { id: 'payment_invoice', name: 'Invoice Pembayaran', icon: CreditCard, description: 'Tagihan pembayaran' },
                  { id: 'attendance_notification', name: 'Notifikasi Absensi', icon: Calendar, description: 'Pemberitahuan kehadiran' },
                  { id: 'newsletter', name: 'Newsletter', icon: Mail, description: 'Berita dan pengumuman' }
                ].map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <template.icon className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pengaturan Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                <Input
                  placeholder="smtp.gmail.com"
                  defaultValue={process.env.SMTP_HOST || ''}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SMTP Port</label>
                <Input
                  placeholder="587"
                  defaultValue={process.env.SMTP_PORT || ''}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Pengirim</label>
                <Input
                  placeholder="noreply@rumahtahfidz.com"
                  defaultValue={process.env.EMAIL_FROM || ''}
                  readOnly
                />
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Catatan Konfigurasi:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Konfigurasi email diatur melalui environment variables</li>
                  <li>• Untuk Gmail: gunakan App Password, bukan password biasa</li>
                  <li>• Pastikan SMTP settings sesuai dengan provider email Anda</li>
                  <li>• Test koneksi secara berkala untuk memastikan email berfungsi</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

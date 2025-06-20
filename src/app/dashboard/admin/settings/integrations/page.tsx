'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  MessageSquare,
  Mail,
  Phone,
  Key,
  Server,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IntegrationConfig {
  whatsapp: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    appSecret: string;
    apiVersion: string;
    isConfigured: boolean;
    status: 'connected' | 'disconnected' | 'error';
  };
  email: {
    host: string;
    port: string;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromAddress: string;
    isConfigured: boolean;
    status: 'connected' | 'disconnected' | 'error';
  };
}

export default function IntegrationsPage() {
  const [config, setConfig] = useState<IntegrationConfig>({
    whatsapp: {
      accessToken: '',
      phoneNumberId: '',
      businessAccountId: '',
      webhookVerifyToken: '',
      appSecret: '',
      apiVersion: 'v18.0',
      isConfigured: false,
      status: 'disconnected'
    },
    email: {
      host: 'smtp.gmail.com',
      port: '587',
      secure: false,
      user: '',
      pass: '',
      fromName: 'TPQ Baitus Shuffah',
      fromAddress: '',
      isConfigured: false,
      status: 'disconnected'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ whatsapp: false, email: false });
  const [showPasswords, setShowPasswords] = useState({ whatsapp: false, email: false });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      // Load configuration from API or environment
      // For now, simulate loading from environment variables
      const response = await fetch('/api/settings/integrations');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      } else {
        // Simulate configuration check
        checkCurrentConfiguration();
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      checkCurrentConfiguration();
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentConfiguration = () => {
    // Check if configurations are available (simulate)
    const whatsappConfigured = Boolean(
      process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN ||
      config.whatsapp.accessToken
    );
    
    const emailConfigured = Boolean(
      process.env.NEXT_PUBLIC_EMAIL_USER ||
      config.email.user
    );

    setConfig(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        isConfigured: whatsappConfigured,
        status: whatsappConfigured ? 'connected' : 'disconnected'
      },
      email: {
        ...prev.email,
        isConfigured: emailConfigured,
        status: emailConfigured ? 'connected' : 'disconnected'
      }
    }));
  };

  const handleWhatsAppChange = (field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        [field]: value
      }
    }));
  };

  const handleEmailChange = (field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: value
      }
    }));
  };

  const saveWhatsAppConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/integrations/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.whatsapp)
      });

      if (response.ok) {
        toast.success('Konfigurasi WhatsApp berhasil disimpan');
        setConfig(prev => ({
          ...prev,
          whatsapp: {
            ...prev.whatsapp,
            isConfigured: true,
            status: 'connected'
          }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menyimpan konfigurasi WhatsApp');
      }
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast.error('Gagal menyimpan konfigurasi WhatsApp');
    } finally {
      setSaving(false);
    }
  };

  const saveEmailConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/integrations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.email)
      });

      if (response.ok) {
        toast.success('Konfigurasi Email berhasil disimpan');
        setConfig(prev => ({
          ...prev,
          email: {
            ...prev.email,
            isConfigured: true,
            status: 'connected'
          }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menyimpan konfigurasi Email');
      }
    } catch (error) {
      console.error('Error saving Email config:', error);
      toast.error('Gagal menyimpan konfigurasi Email');
    } finally {
      setSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    setTesting(prev => ({ ...prev, whatsapp: true }));
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: config.whatsapp.phoneNumberId, // Test with own number
          message: 'Test koneksi WhatsApp dari TPQ Baitus Shuffah'
        })
      });

      if (response.ok) {
        toast.success('Test WhatsApp berhasil! Pesan test telah dikirim');
        setConfig(prev => ({
          ...prev,
          whatsapp: { ...prev.whatsapp, status: 'connected' }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Test WhatsApp gagal');
        setConfig(prev => ({
          ...prev,
          whatsapp: { ...prev.whatsapp, status: 'error' }
        }));
      }
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      toast.error('Test WhatsApp gagal');
      setConfig(prev => ({
        ...prev,
        whatsapp: { ...prev.whatsapp, status: 'error' }
      }));
    } finally {
      setTesting(prev => ({ ...prev, whatsapp: false }));
    }
  };

  const testEmailConnection = async () => {
    setTesting(prev => ({ ...prev, email: true }));
    try {
      const response = await fetch('/api/email/send', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: config.email.user // Test with own email
        })
      });

      if (response.ok) {
        toast.success('Test Email berhasil! Email test telah dikirim');
        setConfig(prev => ({
          ...prev,
          email: { ...prev.email, status: 'connected' }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Test Email gagal');
        setConfig(prev => ({
          ...prev,
          email: { ...prev.email, status: 'error' }
        }));
      }
    } catch (error) {
      console.error('Error testing Email:', error);
      toast.error('Test Email gagal');
      setConfig(prev => ({
        ...prev,
        email: { ...prev.email, status: 'error' }
      }));
    } finally {
      setTesting(prev => ({ ...prev, email: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Terhubung
        </Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Error
        </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Tidak Terhubung
        </Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Integrasi Sistem</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Memuat konfigurasi...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Integrasi Sistem</h1>
            <p className="text-gray-600">Konfigurasi WhatsApp Business API dan Email SMTP</p>
          </div>
          <Button
            onClick={loadConfiguration}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* WhatsApp Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span>WhatsApp Business API</span>
                  {getStatusBadge(config.whatsapp.status)}
                </div>
                <p className="text-sm text-gray-600 font-normal">
                  Konfigurasi untuk mengirim notifikasi via WhatsApp
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token *
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.whatsapp ? "text" : "password"}
                    value={config.whatsapp.accessToken}
                    onChange={(e) => handleWhatsAppChange('accessToken', e.target.value)}
                    placeholder="EAAxxxxxxxxxx..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.whatsapp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID *
                </label>
                <Input
                  type="text"
                  value={config.whatsapp.phoneNumberId}
                  onChange={(e) => handleWhatsAppChange('phoneNumberId', e.target.value)}
                  placeholder="1234567890123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Account ID *
                </label>
                <Input
                  type="text"
                  value={config.whatsapp.businessAccountId}
                  onChange={(e) => handleWhatsAppChange('businessAccountId', e.target.value)}
                  placeholder="1234567890123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Verify Token *
                </label>
                <Input
                  type="text"
                  value={config.whatsapp.webhookVerifyToken}
                  onChange={(e) => handleWhatsAppChange('webhookVerifyToken', e.target.value)}
                  placeholder="your_verify_token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Secret
                </label>
                <Input
                  type="password"
                  value={config.whatsapp.appSecret}
                  onChange={(e) => handleWhatsAppChange('appSecret', e.target.value)}
                  placeholder="your_app_secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Version
                </label>
                <Input
                  type="text"
                  value={config.whatsapp.apiVersion}
                  onChange={(e) => handleWhatsAppChange('apiVersion', e.target.value)}
                  placeholder="v18.0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveWhatsAppConfig}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Konfigurasi
              </Button>

              <Button
                onClick={testWhatsAppConnection}
                disabled={testing.whatsapp || !config.whatsapp.isConfigured}
                variant="outline"
                className="flex items-center gap-2"
              >
                {testing.whatsapp ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                Test Koneksi
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Cara Setup WhatsApp Business API:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Buat akun di <a href="https://developers.facebook.com" target="_blank" className="underline">Facebook Developers</a></li>
                <li>Buat aplikasi baru dan aktifkan WhatsApp Business API</li>
                <li>Dapatkan Access Token dari dashboard</li>
                <li>Setup webhook URL: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/api/whatsapp/webhook</code></li>
                <li>Verifikasi nomor telepon bisnis Anda</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Email Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span>Email SMTP</span>
                  {getStatusBadge(config.email.status)}
                </div>
                <p className="text-sm text-gray-600 font-normal">
                  Konfigurasi untuk mengirim email notifikasi
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host *
                </label>
                <Input
                  type="text"
                  value={config.email.host}
                  onChange={(e) => handleEmailChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port *
                </label>
                <Input
                  type="text"
                  value={config.email.port}
                  onChange={(e) => handleEmailChange('port', e.target.value)}
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={config.email.user}
                  onChange={(e) => handleEmailChange('user', e.target.value)}
                  placeholder="admin@tpqbaitusshuffah.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password / App Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.email ? "text" : "password"}
                    value={config.email.pass}
                    onChange={(e) => handleEmailChange('pass', e.target.value)}
                    placeholder="your_app_password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, email: !prev.email }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.email ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <Input
                  type="text"
                  value={config.email.fromName}
                  onChange={(e) => handleEmailChange('fromName', e.target.value)}
                  placeholder="TPQ Baitus Shuffah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Address
                </label>
                <Input
                  type="email"
                  value={config.email.fromAddress}
                  onChange={(e) => handleEmailChange('fromAddress', e.target.value)}
                  placeholder="noreply@tpqbaitusshuffah.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="secure"
                checked={config.email.secure}
                onChange={(e) => handleEmailChange('secure', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="secure" className="text-sm text-gray-700">
                Gunakan SSL/TLS (port 465)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveEmailConfig}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Konfigurasi
              </Button>

              <Button
                onClick={testEmailConnection}
                disabled={testing.email || !config.email.isConfigured}
                variant="outline"
                className="flex items-center gap-2"
              >
                {testing.email ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                Test Koneksi
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">📧 Cara Setup Email SMTP:</h4>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li><strong>Gmail:</strong> Aktifkan 2FA, buat App Password di Google Account</li>
                <li><strong>Outlook:</strong> Gunakan smtp-mail.outlook.com, port 587</li>
                <li><strong>Custom SMTP:</strong> Hubungi provider hosting untuk detail SMTP</li>
                <li>Pastikan "Less secure app access" diaktifkan (jika diperlukan)</li>
                <li>Test koneksi setelah menyimpan konfigurasi</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

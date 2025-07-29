"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface IntegrationConfig {
  whatsapp: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    appSecret: string;
    apiVersion: string;
    isConfigured: boolean;
    status: "connected" | "disconnected" | "error";
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
    status: "connected" | "disconnected" | "error";
  };
}

export default function IntegrationsPage() {
  const [config, setConfig] = useState<IntegrationConfig>({
    whatsapp: {
      accessToken: "",
      phoneNumberId: "",
      businessAccountId: "",
      webhookVerifyToken: "",
      appSecret: "",
      apiVersion: "v18.0",
      isConfigured: false,
      status: "disconnected",
    },
    email: {
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
      user: "",
      pass: "",
      fromName: "TPQ Baitus Shuffah",
      fromAddress: "",
      isConfigured: false,
      status: "disconnected",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ whatsapp: false, email: false });
  const [showPasswords, setShowPasswords] = useState({
    whatsapp: false,
    email: false,
  });

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/integrations");
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
      toast.error("Gagal memuat konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  const saveWhatsAppConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings/integrations/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.whatsapp),
      });

      if (response.ok) {
        toast.success("Konfigurasi WhatsApp berhasil disimpan!");
        setConfig(prev => ({
          ...prev,
          whatsapp: { ...prev.whatsapp, isConfigured: true }
        }));
      } else {
        throw new Error("Failed to save WhatsApp configuration");
      }
    } catch (error) {
      console.error("Error saving WhatsApp config:", error);
      toast.error("Gagal menyimpan konfigurasi WhatsApp");
    } finally {
      setSaving(false);
    }
  };

  const saveEmailConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings/integrations/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.email),
      });

      if (response.ok) {
        toast.success("Konfigurasi Email berhasil disimpan!");
        setConfig(prev => ({
          ...prev,
          email: { ...prev.email, isConfigured: true }
        }));
      } else {
        throw new Error("Failed to save Email configuration");
      }
    } catch (error) {
      console.error("Error saving Email config:", error);
      toast.error("Gagal menyimpan konfigurasi Email");
    } finally {
      setSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    try {
      setTesting(prev => ({ ...prev, whatsapp: true }));
      const response = await fetch("/api/settings/integrations/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.whatsapp),
      });

      if (response.ok) {
        toast.success("Koneksi WhatsApp berhasil!");
        setConfig(prev => ({
          ...prev,
          whatsapp: { ...prev.whatsapp, status: "connected" }
        }));
      } else {
        throw new Error("WhatsApp connection test failed");
      }
    } catch (error) {
      console.error("Error testing WhatsApp connection:", error);
      toast.error("Gagal menguji koneksi WhatsApp");
      setConfig(prev => ({
        ...prev,
        whatsapp: { ...prev.whatsapp, status: "error" }
      }));
    } finally {
      setTesting(prev => ({ ...prev, whatsapp: false }));
    }
  };

  const testEmailConnection = async () => {
    try {
      setTesting(prev => ({ ...prev, email: true }));
      const response = await fetch("/api/settings/integrations/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.email),
      });

      if (response.ok) {
        toast.success("Koneksi Email berhasil!");
        setConfig(prev => ({
          ...prev,
          email: { ...prev.email, status: "connected" }
        }));
      } else {
        throw new Error("Email connection test failed");
      }
    } catch (error) {
      console.error("Error testing Email connection:", error);
      toast.error("Gagal menguji koneksi Email");
      setConfig(prev => ({
        ...prev,
        email: { ...prev.email, status: "error" }
      }));
    } finally {
      setTesting(prev => ({ ...prev, email: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terhubung
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Settings className="h-3 w-3 mr-1" />
            Belum Dikonfigurasi
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">
              Integrasi Sistem
            </h1>
            <p className="text-gray-600">
              Konfigurasi WhatsApp Business API dan Email SMTP
            </p>
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
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, accessToken: e.target.value }
                      }))
                    }
                    placeholder="EAAxxxxxxxxxx..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords(prev => ({ ...prev, whatsapp: !prev.whatsapp }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.whatsapp ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      whatsapp: { ...prev.whatsapp, phoneNumberId: e.target.value }
                    }))
                  }
                  placeholder="123456789012345"
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
                  <span>Email SMTP Configuration</span>
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
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      email: { ...prev.email, host: e.target.value }
                    }))
                  }
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
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      email: { ...prev.email, port: e.target.value }
                    }))
                  }
                  placeholder="587"
                />
              </div>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

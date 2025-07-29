"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Mail,
  CreditCard,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const IntegrationSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const [settings, setSettings] = useState({
    // WhatsApp Integration
    whatsappEnabled: true,
    whatsappProvider: "wablas",
    whatsappToken: "wh_123456789abcdef",
    whatsappNumber: "628123456789",

    // Email Integration
    emailEnabled: true,
    emailProvider: "smtp",
    emailHost: "smtp.gmail.com",
    emailPort: "587",
    emailUsername: "info@tpqbaitusshuffah.ac.id",
    emailPassword: "password123",
    emailFromName: "TPQ Baitus Shuffah",

    // Payment Gateway Integration
    paymentEnabled: true,
    paymentProvider: "midtrans",
    paymentMode: "sandbox",
    paymentClientKey: "SB-Mid-client-12345678",
    paymentServerKey: "SB-Mid-server-12345678",

    // Google Integration
    googleEnabled: false,
    googleClientId: "",
    googleClientSecret: "",

    // Social Media Integration
    socialMediaEnabled: true,
    facebookPageId: "123456789",
    instagramUsername: "tpq_baitusshuffah",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggle = (field: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Pengaturan integrasi berhasil disimpan!");
    } catch (error) {
      console.error("Error saving integration settings:", error);
      toast.error("Gagal menyimpan pengaturan integrasi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* WhatsApp Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
            Integrasi WhatsApp
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.whatsappEnabled}
              onChange={() => handleToggle("whatsappEnabled")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {settings.whatsappEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider WhatsApp
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.whatsappProvider}
                onChange={(e) =>
                  handleInputChange("whatsappProvider", e.target.value)
                }
              >
                <option value="wablas">Wablas</option>
                <option value="fonnte">Fonnte</option>
                <option value="watzap">WatZap</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token API
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.whatsappToken}
                  onChange={(e) =>
                    handleInputChange("whatsappToken", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.whatsappNumber}
                onChange={(e) =>
                  handleInputChange("whatsappNumber", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 628xxxxxxxxxx (tanpa tanda + atau 0 di depan)
              </p>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm">
                Test Koneksi WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Email Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-500" />
            Integrasi Email
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.emailEnabled}
              onChange={() => handleToggle("emailEnabled")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {settings.emailEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Email
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.emailProvider}
                onChange={(e) =>
                  handleInputChange("emailProvider", e.target.value)
                }
              >
                <option value="smtp">SMTP</option>
                <option value="mailgun">Mailgun</option>
                <option value="sendgrid">SendGrid</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.emailHost}
                  onChange={(e) =>
                    handleInputChange("emailHost", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.emailPort}
                  onChange={(e) =>
                    handleInputChange("emailPort", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.emailUsername}
                  onChange={(e) =>
                    handleInputChange("emailUsername", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={settings.emailPassword}
                    onChange={(e) =>
                      handleInputChange("emailPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pengirim
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.emailFromName}
                  onChange={(e) =>
                    handleInputChange("emailFromName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm">
                Test Koneksi Email
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Gateway Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
            Integrasi Payment Gateway
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.paymentEnabled}
              onChange={() => handleToggle("paymentEnabled")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {settings.paymentEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Payment
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.paymentProvider}
                onChange={(e) =>
                  handleInputChange("paymentProvider", e.target.value)
                }
              >
                <option value="midtrans">Midtrans</option>
                <option value="xendit">Xendit</option>
                <option value="duitku">Duitku</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-teal-600"
                    name="paymentMode"
                    value="sandbox"
                    checked={settings.paymentMode === "sandbox"}
                    onChange={() => handleInputChange("paymentMode", "sandbox")}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Sandbox (Testing)
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-teal-600"
                    name="paymentMode"
                    value="production"
                    checked={settings.paymentMode === "production"}
                    onChange={() =>
                      handleInputChange("paymentMode", "production")
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">Production</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.paymentClientKey}
                  onChange={(e) =>
                    handleInputChange("paymentClientKey", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={settings.paymentServerKey}
                  onChange={(e) =>
                    handleInputChange("paymentServerKey", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm">
                Test Koneksi Payment Gateway
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Integrasi
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default IntegrationSettings;

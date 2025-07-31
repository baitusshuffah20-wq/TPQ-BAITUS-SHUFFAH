"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Search,
  Filter,
  RefreshCw,
  Settings,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string | null;
  content?: string; // For backward compatibility
  type: string | null;
  channels: string | string[] | null; // Support both formats
  variables: string | string[] | null; // Support both formats
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: {
    name: string;
    email: string;
  };
  // For predefined templates
  description?: string;
  category?: string;
}

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [predefinedTemplates, setPredefinedTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPredefined, setShowPredefined] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    isActive: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
    loadPredefinedTemplates();
  }, [filters]);

  useEffect(() => {
    if (showPredefined) {
      loadPredefinedTemplates();
    }
  }, [selectedCategory, filters.search, showPredefined]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Remove type filter since database model doesn't have type field
      // if (filters.type) params.append("type", filters.type);
      if (filters.isActive) params.append("isActive", filters.isActive);

      const response = await fetch(`/api/notifications/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Database templates loaded:", data.templates?.length || 0);
        // Validate template data
        const validTemplates = (data.templates || []).filter((template: any) => {
          if (!template || !template.id || !template.name) {
            console.warn("Invalid database template:", template);
            return false;
          }
          return true;
        });
        setTemplates(validTemplates);
      } else {
        toast.error("Gagal memuat template notifikasi");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Gagal memuat template notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const loadPredefinedTemplates = async () => {
    try {
      const params = new URLSearchParams();
      params.append("source", "predefined");
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/notifications/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Predefined templates loaded:", data.templates?.length || 0);
        // Validate predefined template data
        const validPredefinedTemplates = (data.templates || []).filter((template: any) => {
          if (!template || !template.id || !template.name) {
            console.warn("Invalid predefined template:", template);
            return false;
          }
          return true;
        });
        setPredefinedTemplates(validPredefinedTemplates);
        if (data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error("Error loading predefined templates:", error);
    }
  };

  const setupDefaultTemplates = async () => {
    try {
      const response = await fetch("/api/notifications/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdBy: "admin-user" }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Berhasil membuat ${data.results.created} template default`,
        );
        loadTemplates();
      } else {
        toast.error("Gagal membuat template default");
      }
    } catch (error) {
      console.error("Error setting up templates:", error);
      toast.error("Gagal membuat template default");
    }
  };

  const sendPredefinedNotification = async (template: any) => {
    const recipientId = prompt("Masukkan ID penerima:");
    if (!recipientId) return;

    const recipientType = prompt("Masukkan tipe penerima (SANTRI/WALI/MUSYRIF/ADMIN):", "SANTRI");
    if (!recipientType) return;

    // Collect variables
    const variables: Record<string, string> = {};
    if (template.variables && template.variables.length > 0) {
      for (const variable of template.variables) {
        const value = prompt(`Masukkan nilai untuk ${variable}:`);
        if (value) {
          variables[variable] = value;
        }
      }
    }

    try {
      const response = await fetch("/api/notifications/templates/predefined", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: template.id,
          recipientId,
          recipientType,
          variables,
          createdBy: "admin-user",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Notifikasi berhasil dikirim!");
        console.log("Notification sent:", data);
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal mengirim notifikasi");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Terjadi kesalahan saat mengirim notifikasi");
    }
  };

  const toggleTemplateStatus = async (
    templateId: string,
    isActive: boolean,
  ) => {
    try {
      const response = await fetch("/api/notifications/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: templateId,
          isActive: !isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Template ${!isActive ? "diaktifkan" : "dinonaktifkan"}`);
        loadTemplates();
      } else {
        toast.error("Gagal mengubah status template");
      }
    } catch (error) {
      console.error("Error toggling template status:", error);
      toast.error("Gagal mengubah status template");
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/notifications/templates?id=${templateId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Template berhasil dihapus");
        loadTemplates();
      } else {
        toast.error("Gagal menghapus template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Gagal menghapus template");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to safely get variable count
  const getVariableCount = (variables: string | string[] | null | undefined): number => {
    try {
      if (!variables) return 0;

      if (Array.isArray(variables)) {
        // Predefined template format
        return variables.length;
      } else if (typeof variables === 'string') {
        // Database template format (JSON string)
        const parsed = JSON.parse(variables);
        return parsed && typeof parsed === 'object' ? Object.keys(parsed).length : 0;
      } else {
        console.warn("Unexpected variables format:", typeof variables, variables);
        return 0;
      }
    } catch (error) {
      console.error("Error parsing variables:", error);
      return 0;
    }
  };

  // Helper function to safely format variables for display
  const formatVariablesForDisplay = (variables: string | string[] | null | undefined): string => {
    try {
      if (!variables) return 'No variables';

      if (Array.isArray(variables)) {
        // Predefined template format
        const variableObj = variables.reduce((acc, variable) => {
          acc[variable] = 'string';
          return acc;
        }, {} as Record<string, string>);
        return JSON.stringify(variableObj, null, 2);
      } else if (typeof variables === 'string') {
        // Database template format (JSON string)
        const parsed = JSON.parse(variables);
        return JSON.stringify(parsed, null, 2);
      } else {
        return `Unexpected variables format: ${typeof variables}`;
      }
    } catch (error) {
      console.error("Error formatting variables:", error);
      return `Error parsing variables: ${variables}`;
    }
  };

  const getChannelIcons = (channels: string | string[] | undefined | null) => {
    // Handle cases where channels is not a string or array
    if (!channels) {
      return <div className="flex gap-1"></div>;
    }

    // Handle array format (predefined templates)
    let channelList: string[];
    if (Array.isArray(channels)) {
      channelList = channels;
    } else if (typeof channels === 'string') {
      channelList = channels.split(",");
    } else {
      console.error("Unexpected channels format:", channels);
      return <div className="flex gap-1"></div>;
    }
    return (
      <div className="flex gap-1">
        {channelList.map((channel, index) => {
          switch (channel.trim()) {
            case "IN_APP":
              return (
                <Bell
                  key={index}
                  className="h-4 w-4 text-blue-600"
                  title="In-App"
                />
              );
            case "EMAIL":
              return (
                <Mail
                  key={index}
                  className="h-4 w-4 text-green-600"
                  title="Email"
                />
              );
            case "WHATSAPP":
              return (
                <MessageSquare
                  key={index}
                  className="h-4 w-4 text-green-500"
                  title="WhatsApp"
                />
              );
            case "SMS":
              return (
                <Smartphone
                  key={index}
                  className="h-4 w-4 text-purple-600"
                  title="SMS"
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const getTypeLabel = (type: string | null) => {
    if (!type) return "Tidak ada tipe";
    const typeLabels: Record<string, string> = {
      PAYMENT_REMINDER: "Pengingat Pembayaran",
      PAYMENT_CONFIRMATION: "Konfirmasi Pembayaran",
      SPP_OVERDUE: "SPP Terlambat",
      ATTENDANCE_ALERT: "Alert Absensi",
      HAFALAN_PROGRESS: "Progress Hafalan",
      SYSTEM_ANNOUNCEMENT: "Pengumuman Sistem",
      ACCOUNT_UPDATE: "Update Akun",
      REPORT_READY: "Laporan Siap",
      MAINTENANCE_NOTICE: "Pemberitahuan Maintenance",
      EMERGENCY_ALERT: "Peringatan Darurat",
    };
    return typeLabels[type] || type;
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !filters.search ||
      template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.title.toLowerCase().includes(filters.search.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Template Notifikasi
            </h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat template...</span>
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
            Template Notifikasi
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={setupDefaultTemplates}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Setup Default
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Buat Template
            </Button>
            <Button
              onClick={loadTemplates}
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
              className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Daftar Notifikasi
            </a>
            <a
              href="/dashboard/admin/notifications/templates"
              className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
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

        {/* Template Type Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowPredefined(true)}
            className={`px-4 py-2 rounded-md font-medium ${
              showPredefined
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Template Bawaan ({predefinedTemplates.length})
          </button>
          <button
            onClick={() => setShowPredefined(false)}
            className={`px-4 py-2 rounded-md font-medium ${
              !showPredefined
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Template Kustom ({templates.length})
          </button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showPredefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Template
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Cari nama atau judul template..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Template
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
                  <option value="SYSTEM_ANNOUNCEMENT">Pengumuman Sistem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showPredefined ? "Template Bawaan" : "Template Kustom"} (
              {showPredefined ? predefinedTemplates.length : filteredTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(showPredefined ? predefinedTemplates : filteredTemplates).length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {showPredefined
                    ? "Tidak ada template bawaan yang sesuai filter"
                    : "Belum ada template kustom"
                  }
                </p>
                {!showPredefined && (
                  <Button
                    onClick={setupDefaultTemplates}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Setup Template Default
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(showPredefined ? predefinedTemplates : filteredTemplates).map((template) => {
                  // Add safety check for template data
                  if (!template || !template.id || !template.name) {
                    console.warn('Invalid template data:', template);
                    return null;
                  }

                  return (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          {showPredefined ? (
                            <>
                              <Badge variant="outline">
                                {template.category}
                              </Badge>
                              <Badge variant="outline">
                                {template.type}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Badge
                                variant={
                                  template.isActive ? "success" : "secondary"
                                }
                              >
                                {template.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                              <Badge variant="outline">
                                {getTypeLabel(template.type)}
                              </Badge>
                            </>
                          )}
                          {getChannelIcons(template.channels)}
                        </div>
                        <h4 className="font-medium text-gray-800 mb-1">
                          {template.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {showPredefined ? template.description : (template.message || template.content)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {showPredefined ? (
                            <>
                              <span>Template Bawaan</span>
                              {template.variables && (
                                <span>
                                  Variables: {getVariableCount(template.variables)}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span>Dibuat: {formatDate(template.createdAt)}</span>
                              <span>Oleh: {template.creator?.name}</span>
                              {template.variables && (
                                <span>
                                  Variables: {getVariableCount(template.variables)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setSelectedTemplate(template)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Lihat
                        </Button>
                        {showPredefined ? (
                          <Button
                            onClick={() => sendPredefinedNotification(template)}
                            size="sm"
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Kirim
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              onClick={() =>
                                toggleTemplateStatus(template.id, template.isActive)
                              }
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Settings className="h-3 w-3" />
                              {template.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              onClick={() => deleteTemplate(template.id)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                }).filter(Boolean)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Detail Template</h2>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  variant="outline"
                  size="sm"
                >
                  Tutup
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Template
                  </label>
                  <p className="text-gray-900">{selectedTemplate.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul
                  </label>
                  <p className="text-gray-900">{selectedTemplate.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900">
                      {selectedTemplate.message || selectedTemplate.content}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe
                    </label>
                    <p className="text-gray-900">
                      {getTypeLabel(selectedTemplate.type)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Channel
                    </label>
                    <div className="flex items-center gap-2">
                      {getChannelIcons(selectedTemplate.channels)}
                      <span className="text-sm text-gray-600">
                        {selectedTemplate.channels || 'Tidak ada channel'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTemplate.variables && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variables
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-sm text-gray-900">
                        {formatVariablesForDisplay(selectedTemplate.variables)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

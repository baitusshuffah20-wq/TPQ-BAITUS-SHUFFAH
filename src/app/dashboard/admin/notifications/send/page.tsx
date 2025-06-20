'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Users,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  channels: string;
  variables: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SendNotificationPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    method: 'template', // 'template' or 'direct'
    templateId: '',
    title: '',
    message: '',
    type: 'SYSTEM_ANNOUNCEMENT',
    priority: 'NORMAL',
    channels: ['IN_APP'],
    recipientType: 'specific', // 'specific', 'all_users', 'all_wali', 'all_musyrif'
    recipientIds: [] as string[],
    variables: {} as Record<string, string>,
    scheduledAt: ''
  });

  useEffect(() => {
    loadTemplates();
    loadUsers();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/notifications/templates?isActive=true');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'channels') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        channels: checkbox.checked 
          ? [...prev.channels, value]
          : prev.channels.filter(c => c !== value)
      }));
    } else if (name === 'recipientIds') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        recipientIds: checkbox.checked 
          ? [...prev.recipientIds, value]
          : prev.recipientIds.filter(id => id !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        title: template.title,
        message: template.message,
        type: template.type,
        channels: template.channels.split(',').map(c => c.trim())
      }));

      // Parse variables if available
      if (template.variables) {
        try {
          const variables = JSON.parse(template.variables);
          const variableDefaults: Record<string, string> = {};
          Object.keys(variables).forEach(key => {
            variableDefaults[key] = '';
          });
          setFormData(prev => ({ ...prev, variables: variableDefaults }));
        } catch (error) {
          console.error('Error parsing template variables:', error);
        }
      }
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variables: { ...prev.variables, [key]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.method === 'template' && !formData.templateId) {
        toast.error('Pilih template notifikasi');
        return;
      }

      if (formData.method === 'direct' && (!formData.title || !formData.message)) {
        toast.error('Judul dan pesan wajib diisi');
        return;
      }

      if (formData.channels.length === 0) {
        toast.error('Pilih minimal satu channel');
        return;
      }

      if (formData.recipientType === 'specific' && formData.recipientIds.length === 0) {
        toast.error('Pilih minimal satu penerima');
        return;
      }

      const payload: any = {
        createdBy: 'admin-user'
      };

      if (formData.method === 'template') {
        payload.templateName = templates.find(t => t.id === formData.templateId)?.name;
        payload.variables = formData.variables;
      } else {
        payload.title = formData.title;
        payload.message = formData.message;
        payload.type = formData.type;
        payload.channels = formData.channels;
        payload.priority = formData.priority;
      }

      if (formData.scheduledAt) {
        payload.scheduledAt = formData.scheduledAt;
      }

      let endpoint = '/api/notifications/send';
      
      if (formData.recipientType === 'specific') {
        // Send to specific users
        if (formData.recipientIds.length === 1) {
          payload.recipientId = formData.recipientIds[0];
        } else {
          // Bulk send
          endpoint = '/api/notifications/send';
          payload.recipientIds = formData.recipientIds;
        }
      } else {
        // Bulk send to user groups
        endpoint = '/api/notifications/send';
        payload.recipientType = formData.recipientType.toUpperCase();
      }

      const response = await fetch(endpoint, {
        method: formData.recipientIds.length > 1 || formData.recipientType !== 'specific' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Notifikasi berhasil dikirim');
        
        // Reset form
        setFormData({
          method: 'template',
          templateId: '',
          title: '',
          message: '',
          type: 'SYSTEM_ANNOUNCEMENT',
          priority: 'NORMAL',
          channels: ['IN_APP'],
          recipientType: 'specific',
          recipientIds: [],
          variables: {},
          scheduledAt: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal mengirim notifikasi');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Gagal mengirim notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'IN_APP':
        return <Bell className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4" />;
      case 'SMS':
        return <Smartphone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const selectedTemplate = templates.find(t => t.id === formData.templateId);
  const templateVariables = selectedTemplate?.variables ? JSON.parse(selectedTemplate.variables) : {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Kirim Notifikasi</h1>
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
              className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Template
            </a>
            <a
              href="/dashboard/admin/notifications/send"
              className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
            >
              Kirim Notifikasi
            </a>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Notification Content */}
            <div className="space-y-6">
              {/* Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Metode Pengiriman</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="method"
                        value="template"
                        checked={formData.method === 'template'}
                        onChange={handleInputChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-sm font-medium">Gunakan Template</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="method"
                        value="direct"
                        checked={formData.method === 'direct'}
                        onChange={handleInputChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-sm font-medium">Tulis Langsung</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Template Selection */}
              {formData.method === 'template' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pilih Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      name="templateId"
                      value={formData.templateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.method === 'template'}
                    >
                      <option value="">Pilih template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.title}
                        </option>
                      ))}
                    </select>

                    {selectedTemplate && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-2">{selectedTemplate.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{selectedTemplate.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{selectedTemplate.type}</Badge>
                          <div className="flex gap-1">
                            {selectedTemplate.channels.split(',').map((channel, index) => (
                              <div key={index} className="flex items-center gap-1">
                                {getChannelIcon(channel.trim())}
                                <span className="text-xs">{channel.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Direct Message */}
              {formData.method === 'direct' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Konten Notifikasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul *
                      </label>
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Masukkan judul notifikasi"
                        required={formData.method === 'direct'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pesan *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tulis pesan notifikasi..."
                        required={formData.method === 'direct'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipe
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="SYSTEM_ANNOUNCEMENT">Pengumuman Sistem</option>
                          <option value="PAYMENT_REMINDER">Pengingat Pembayaran</option>
                          <option value="ATTENDANCE_ALERT">Alert Absensi</option>
                          <option value="HAFALAN_PROGRESS">Progress Hafalan</option>
                          <option value="EMERGENCY_ALERT">Peringatan Darurat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prioritas
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="LOW">Rendah</option>
                          <option value="NORMAL">Normal</option>
                          <option value="HIGH">Tinggi</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Variables */}
              {formData.method === 'template' && selectedTemplate && Object.keys(templateVariables).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Isi Variabel Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(templateVariables).map(([key, description]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {key} <span className="text-gray-500">({String(description)})</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.variables[key] || ''}
                            onChange={(e) => handleVariableChange(key, e.target.value)}
                            placeholder={`Masukkan ${String(description).toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Channels */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Pengiriman</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { value: 'IN_APP', label: 'In-App Notification', icon: Bell },
                      { value: 'EMAIL', label: 'Email', icon: Mail },
                      { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                      { value: 'SMS', label: 'SMS', icon: Smartphone }
                    ].map((channel) => {
                      const Icon = channel.icon;
                      return (
                        <label key={channel.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="channels"
                            value={channel.value}
                            checked={formData.channels.includes(channel.value)}
                            onChange={handleInputChange}
                            className="form-checkbox text-blue-600"
                          />
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{channel.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Recipients & Settings */}
            <div className="space-y-6">
              {/* Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle>Penerima Notifikasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Penerima
                      </label>
                      <select
                        name="recipientType"
                        value={formData.recipientType}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="specific">Pilih Pengguna Spesifik</option>
                        <option value="all_users">Semua Pengguna</option>
                        <option value="all_wali">Semua Wali</option>
                        <option value="all_musyrif">Semua Musyrif</option>
                      </select>
                    </div>

                    {formData.recipientType === 'specific' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pilih Pengguna
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                          {users.map((user) => (
                            <label key={user.id} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                name="recipientIds"
                                value={user.id}
                                checked={formData.recipientIds.includes(user.id)}
                                onChange={handleInputChange}
                                className="form-checkbox text-blue-600"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({user.role})</span>
                                <div className="text-xs text-gray-400">{user.email}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {formData.recipientIds.length} pengguna dipilih
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Penjadwalan (Opsional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jadwalkan Pengiriman
                    </label>
                    <Input
                      type="datetime-local"
                      name="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Kosongkan untuk mengirim sekarang
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview Notifikasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {formData.title || selectedTemplate?.title || 'Judul Notifikasi'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {formData.message || selectedTemplate?.message || 'Isi pesan notifikasi akan tampil di sini...'}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">
                        {formData.type || selectedTemplate?.type || 'SYSTEM_ANNOUNCEMENT'}
                      </Badge>
                      <Badge variant="secondary">
                        {formData.priority}
                      </Badge>
                      <div className="flex gap-1">
                        {formData.channels.map((channel, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading ? 'Mengirim...' : (formData.scheduledAt ? 'Jadwalkan Notifikasi' : 'Kirim Notifikasi')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

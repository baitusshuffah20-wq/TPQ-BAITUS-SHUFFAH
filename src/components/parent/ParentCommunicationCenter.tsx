'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Calendar,
  Clock,
  User,
  Bell,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Target,
  Award,
  FileText,
  Image,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  from: string;
  fromRole: 'PARENT' | 'MUSYRIF' | 'ADMIN';
  to: string;
  toRole: 'PARENT' | 'MUSYRIF' | 'ADMIN';
  subject: string;
  content: string;
  type: 'TEXT' | 'PROGRESS_UPDATE' | 'BEHAVIOR_REPORT' | 'GOAL_UPDATE' | 'ANNOUNCEMENT' | 'QUESTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  attachments?: {
    type: 'IMAGE' | 'DOCUMENT' | 'VIDEO';
    url: string;
    name: string;
  }[];
  relatedTo?: {
    type: 'BEHAVIOR' | 'GOAL' | 'ATTENDANCE' | 'ACHIEVEMENT';
    id: string;
    title: string;
  };
}

interface ParentCommunicationCenterProps {
  santriId: string;
  santriName: string;
  musyrifId: string;
  musyrifName: string;
}

export default function ParentCommunicationCenter({
  santriId,
  santriName,
  musyrifId,
  musyrifName
}: ParentCommunicationCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<Message['type']>('TEXT');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock messages data
  const mockMessages: Message[] = [
    {
      id: 'msg_1',
      from: musyrifName,
      fromRole: 'MUSYRIF',
      to: 'Orang Tua Ahmad',
      toRole: 'PARENT',
      subject: 'Progress Hafalan Ahmad Minggu Ini',
      content: 'Assalamu\'alaikum Bapak/Ibu. Alhamdulillah Ahmad menunjukkan progress yang sangat baik dalam hafalan minggu ini. Dia berhasil menghafal 15 ayat dari Surah Al-Mulk dengan tartil yang baik. Semangat belajarnya juga meningkat dan aktif bertanya saat pembelajaran.',
      type: 'PROGRESS_UPDATE',
      priority: 'MEDIUM',
      isRead: false,
      sentAt: '2024-02-12T15:30:00Z',
      relatedTo: {
        type: 'ACHIEVEMENT',
        id: 'achievement_1',
        title: 'Hafalan Surah Al-Mulk'
      }
    },
    {
      id: 'msg_2',
      from: 'Orang Tua Ahmad',
      fromRole: 'PARENT',
      to: musyrifName,
      toRole: 'MUSYRIF',
      subject: 'Terima kasih atas bimbingannya',
      content: 'Assalamu\'alaikum Ustadz. Jazakallahu khairan atas bimbingan dan perhatiannya kepada Ahmad. Di rumah juga Ahmad semakin rajin muroja\'ah dan sering menceritakan pembelajaran di TPQ. Apakah ada yang perlu kami bantu untuk mendukung progress Ahmad?',
      type: 'TEXT',
      priority: 'LOW',
      isRead: true,
      sentAt: '2024-02-12T19:45:00Z',
      readAt: '2024-02-12T20:00:00Z'
    },
    {
      id: 'msg_3',
      from: musyrifName,
      fromRole: 'MUSYRIF',
      to: 'Orang Tua Ahmad',
      toRole: 'PARENT',
      subject: 'Goal Kepemimpinan Ahmad',
      content: 'Assalamu\'alaikum. Kami telah menetapkan goal pengembangan kepemimpinan untuk Ahmad. Dia menunjukkan potensi yang baik untuk memimpin teman-temannya. Mohon dukungan di rumah dengan memberikan tanggung jawab kecil seperti memimpin doa atau mengatur jadwal adik-adiknya.',
      type: 'GOAL_UPDATE',
      priority: 'MEDIUM',
      isRead: true,
      sentAt: '2024-02-11T10:15:00Z',
      readAt: '2024-02-11T18:30:00Z',
      relatedTo: {
        type: 'GOAL',
        id: 'goal_1',
        title: 'Mengembangkan Kepemimpinan'
      }
    },
    {
      id: 'msg_4',
      from: 'Admin TPQ',
      fromRole: 'ADMIN',
      to: 'Orang Tua Ahmad',
      toRole: 'PARENT',
      subject: 'Undangan Pertemuan Wali Santri',
      content: 'Assalamu\'alaikum Bapak/Ibu Wali Santri. Kami mengundang untuk menghadiri pertemuan wali santri pada:\n\nHari/Tanggal: Sabtu, 17 Februari 2024\nWaktu: 09:00 - 11:00 WIB\nTempat: Aula TPQ Baitus Shuffah\n\nAgenda: Evaluasi semester dan program pengembangan karakter. Mohon konfirmasi kehadiran.',
      type: 'ANNOUNCEMENT',
      priority: 'HIGH',
      isRead: false,
      sentAt: '2024-02-10T08:00:00Z'
    },
    {
      id: 'msg_5',
      from: 'Orang Tua Ahmad',
      fromRole: 'PARENT',
      to: musyrifName,
      toRole: 'MUSYRIF',
      subject: 'Pertanyaan tentang metode hafalan',
      content: 'Assalamu\'alaikum Ustadz. Saya ingin bertanya tentang metode hafalan yang efektif untuk Ahmad di rumah. Apakah ada teknik khusus yang Ustadz rekomendasikan? Dan berapa lama idealnya Ahmad muroja\'ah setiap hari?',
      type: 'QUESTION',
      priority: 'MEDIUM',
      isRead: true,
      sentAt: '2024-02-09T20:30:00Z',
      readAt: '2024-02-10T07:15:00Z'
    }
  ];

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Mohon tulis pesan terlebih dahulu');
      return;
    }

    const message: Message = {
      id: `msg_${Date.now()}`,
      from: 'Orang Tua Ahmad', // Should be from auth context
      fromRole: 'PARENT',
      to: musyrifName,
      toRole: 'MUSYRIF',
      subject: messageType === 'TEXT' ? 'Pesan dari Orang Tua' : `${messageType} - ${santriName}`,
      content: newMessage,
      type: messageType,
      priority: 'MEDIUM',
      isRead: false,
      sentAt: new Date().toISOString()
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
    toast.success('Pesan berhasil dikirim!');
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
    ));
  };

  const getMessageTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'PROGRESS_UPDATE': return 'text-blue-600 bg-blue-100';
      case 'BEHAVIOR_REPORT': return 'text-green-600 bg-green-100';
      case 'GOAL_UPDATE': return 'text-purple-600 bg-purple-100';
      case 'ANNOUNCEMENT': return 'text-red-600 bg-red-100';
      case 'QUESTION': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMessageTypeText = (type: Message['type']) => {
    switch (type) {
      case 'PROGRESS_UPDATE': return 'Update Progress';
      case 'BEHAVIOR_REPORT': return 'Laporan Perilaku';
      case 'GOAL_UPDATE': return 'Update Goal';
      case 'ANNOUNCEMENT': return 'Pengumuman';
      case 'QUESTION': return 'Pertanyaan';
      default: return 'Pesan';
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || message.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(msg => !msg.isRead && msg.fromRole !== 'PARENT').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Komunikasi dengan TPQ</h2>
            <p className="text-sm text-gray-600">
              Santri: {santriName} • Musyrif: {musyrifName}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">{unreadCount} pesan baru</span>
              </div>
            )}
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              Telepon
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-1" />
              Video Call
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari pesan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Semua Tipe</option>
            <option value="PROGRESS_UPDATE">Update Progress</option>
            <option value="BEHAVIOR_REPORT">Laporan Perilaku</option>
            <option value="GOAL_UPDATE">Update Goal</option>
            <option value="ANNOUNCEMENT">Pengumuman</option>
            <option value="QUESTION">Pertanyaan</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pesan</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all'
                ? 'Tidak ada pesan yang sesuai dengan filter'
                : 'Belum ada komunikasi dengan TPQ'
              }
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                message.isRead
                  ? 'border-gray-200 bg-white hover:bg-gray-50'
                  : 'border-teal-200 bg-teal-50 hover:bg-teal-100'
              }`}
              onClick={() => {
                setSelectedConversation(message.id);
                if (!message.isRead) markAsRead(message.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{message.subject}</h4>
                    {!message.isRead && message.fromRole !== 'PARENT' && (
                      <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMessageTypeColor(message.type)}`}>
                      {getMessageTypeText(message.type)}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Dari: {message.from} • {formatDate(message.sentAt)}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                  
                  {message.relatedTo && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
                      {message.relatedTo.type === 'GOAL' && <Target className="h-3 w-3" />}
                      {message.relatedTo.type === 'BEHAVIOR' && <Heart className="h-3 w-3" />}
                      {message.relatedTo.type === 'ACHIEVEMENT' && <Award className="h-3 w-3" />}
                      <span>Terkait: {message.relatedTo.title}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {message.isRead && message.readAt && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Composer */}
      <div className="border-t border-gray-200 p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as Message['type'])}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="TEXT">Pesan Umum</option>
              <option value="QUESTION">Pertanyaan</option>
              <option value="PROGRESS_UPDATE">Update Progress</option>
            </select>
            <span className="text-sm text-gray-600">Kepada: {musyrifName}</span>
          </div>
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pesan Anda..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

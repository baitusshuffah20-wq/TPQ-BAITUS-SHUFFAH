"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  TrendingUp
} from "lucide-react";

interface Musyrif {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  isOnline: boolean;
  halaqah: string;
  userId: string;
  children: Array<{
    id: string;
    name: string;
    nis: string;
  }>;
}

interface Communication {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  title: string;
  timestamp: string;
  isRead: boolean;
  type: string;
}

interface CommunicationData {
  musyrifList: Musyrif[];
  recentCommunications: Communication[];
  statistics: {
    totalMessages: number;
    unreadMessages: number;
    sentMessages: number;
    averageResponseTime: string;
  };
  children: Array<{
    id: string;
    name: string;
    nis: string;
    halaqah: {
      name: string;
    } | null;
  }>;
}

const WaliCommunicationPage = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<CommunicationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunicationData();
  }, []);

  const fetchCommunicationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/wali/communication');

      if (!response.ok) {
        throw new Error('Failed to fetch communication data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        // Set first musyrif as selected if available
        if (result.data.musyrifList.length > 0 && !selectedChat) {
          setSelectedChat(result.data.musyrifList[0].userId);
        }
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      const response = await fetch('/api/dashboard/wali/communication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedChat,
          message: message.trim(),
          type: 'COMMUNICATION'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      if (result.success) {
        setMessage("");
        // Refresh communication data to show new message
        await fetchCommunicationData();
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchCommunicationData} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedMusyrif = data?.musyrifList.find(m => m.userId === selectedChat);
  const filteredMessages = data?.recentCommunications.filter(comm =>
    comm.senderId === selectedChat || comm.senderRole === "WALI"
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Komunikasi dengan Musyrif</h1>
            <p className="text-gray-600">Berkomunikasi langsung dengan musyrif anak Anda</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Pesan</p>
                    <p className="text-2xl font-bold">{data.statistics.totalMessages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Belum Dibaca</p>
                    <p className="text-2xl font-bold">{data.statistics.unreadMessages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Send className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pesan Terkirim</p>
                    <p className="text-2xl font-bold">{data.statistics.sentMessages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Respon</p>
                    <p className="text-2xl font-bold">{data.statistics.averageResponseTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Musyrif List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Daftar Musyrif ({data?.musyrifList.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {data?.musyrifList.map((musyrif) => (
                  <div
                    key={musyrif.id}
                    onClick={() => setSelectedChat(musyrif.userId)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      selectedChat === musyrif.userId ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={musyrif.avatar || undefined} />
                          <AvatarFallback>
                            {musyrif.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {musyrif.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{musyrif.name}</h3>
                          <span className="text-xs text-gray-500">
                            {musyrif.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{musyrif.role}</p>
                        <p className="text-xs text-gray-500">Halaqah: {musyrif.halaqah}</p>
                        <div className="mt-1">
                          <p className="text-xs text-blue-600">
                            Anak: {musyrif.children.map(child => child.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="p-4 text-center text-gray-500">
                    Tidak ada musyrif ditemukan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedMusyrif ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        {selectedMusyrif.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedMusyrif.name}</h3>
                        <p className="text-sm text-gray-600">{selectedMusyrif.halaqah}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.senderRole === "WALI" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.senderRole === "WALI"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">{msg.title}</p>
                            <p className="text-sm">{msg.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {msg.senderRole === "WALI" && (
                                <CheckCircle className="h-3 w-3 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada percakapan dengan musyrif ini</p>
                        <p className="text-sm">Mulai percakapan dengan mengirim pesan</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center space-x-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan untuk musyrif..."
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Pilih musyrif untuk memulai percakapan</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Anda dapat berkomunikasi dengan musyrif yang mengajar anak Anda
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Recent Communications */}
        {data?.recentCommunications && data.recentCommunications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Komunikasi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentCommunications.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {comm.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{comm.senderName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comm.timestamp).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{comm.title}</p>
                      <p className="text-sm text-gray-500 truncate">{comm.message}</p>
                      {!comm.isRead && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Belum dibaca
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WaliCommunicationPage;

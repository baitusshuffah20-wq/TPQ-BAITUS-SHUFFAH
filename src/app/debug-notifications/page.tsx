"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DebugNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("🔍 Debug: Loading notifications...");
      
      const response = await fetch('/api/notifications?userId=cmdqxjrs100005w6299z3eesl&limit=50&offset=0');
      console.log("📡 Debug: Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Debug: Data received:", data);
        setNotifications(data.notifications || []);
        setStats(data.stats || null);
      } else {
        const errorText = await response.text();
        console.error("❌ Debug: API Error:", response.status, errorText);
        setError(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("❌ Debug: Fetch Error:", err);
      setError(`Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Debug Notifications</h1>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="p-4 bg-blue-50 rounded">
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Total Notifikasi</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Belum Dibaca</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Terkirim</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.byStatus?.SENT || 0}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Menunggu</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.byStatus?.PENDING || 0}</p>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Daftar Notifikasi ({notifications.length})</h2>
              </div>
              
              <div className="p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada notifikasi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {notification.type}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {notification.status}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                notification.isRead 
                                  ? 'bg-gray-100 text-gray-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {notification.isRead ? 'Dibaca' : 'Belum dibaca'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Dibuat: {new Date(notification.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

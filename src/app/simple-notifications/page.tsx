"use client";

import { useState, useEffect } from "react";

export default function SimpleNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("🔍 Loading notifications...");
      
      // Load notifications
      const notifResponse = await fetch('/api/notifications?userId=cmdqxjrs100005w6299z3eesl&limit=50&offset=0');
      console.log("📡 Notifications response status:", notifResponse.status);
      
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        console.log("✅ Notifications data:", notifData);
        setNotifications(notifData.notifications || []);
        setStats(notifData.stats || null);
      } else {
        console.error("❌ Failed to load notifications");
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Notifications Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Notifications Test</h1>
      
      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="text-lg font-semibold mb-2">Stats:</h2>
          <p>Total: {stats.total}</p>
          <p>Unread: {stats.unread}</p>
        </div>
      )}
      
      {/* Notifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Notifications ({notifications.length}):</h2>
        
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found</p>
        ) : (
          notifications.map((notification, index) => (
            <div key={index} className="p-4 border rounded bg-white">
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-gray-600">{notification.message}</p>
              <div className="text-sm text-gray-500 mt-2">
                <span>Type: {notification.type}</span> | 
                <span> Status: {notification.status}</span> | 
                <span> Read: {notification.isRead ? 'Yes' : 'No'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

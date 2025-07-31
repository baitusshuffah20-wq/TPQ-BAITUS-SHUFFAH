"use client";

import { useState, useEffect } from "react";

export default function TestNotificationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 Testing API call...");
        console.log("🔍 Current window location:", window.location.href);

        const url = '/api/notifications?userId=cmdqxjrs100005w6299z3eesl&limit=50&offset=0';
        console.log("📡 Fetching URL:", url);

        const response = await fetch(url);
        console.log("📡 Response status:", response.status);
        console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Data received:", result);
          setData(result);
        } else {
          const errorText = await response.text();
          console.error("❌ API Error:", response.status, errorText);
          setError(`API Error: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError(`Fetch Error: ${err.message}`);
      } finally {
        console.log("🏁 Setting loading to false");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Notifications API</h1>
      
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <p><strong>Total notifications:</strong> {data.notifications?.length || 0}</p>
          <p><strong>Stats total:</strong> {data.stats?.total || 0}</p>
          <p><strong>Stats unread:</strong> {data.stats?.unread || 0}</p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Notifications:</h3>
          <ul className="list-disc pl-6">
            {data.notifications?.map((notification, index) => (
              <li key={index} className="mb-1">
                <strong>{notification.title}</strong> - {notification.type} - {notification.status}
              </li>
            ))}
          </ul>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Raw Data:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

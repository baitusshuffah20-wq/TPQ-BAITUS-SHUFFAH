'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

const AuthStatusPage = () => {
  const { user, loading, logout } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    // Check localStorage
    if (typeof window !== 'undefined') {
      try {
        const authUser = localStorage.getItem('auth_user');
        const authToken = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        
        setLocalStorageData({
          auth_user: authUser ? JSON.parse(authUser) : null,
          auth_token: authToken,
          user: userData ? JSON.parse(userData) : null
        });
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Status
        </h1>
        
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Auth Context Status</h2>
            {loading ? (
              <div className="text-gray-600">Loading authentication state...</div>
            ) : user ? (
              <div>
                <div className="text-green-600 font-medium">Authenticated</div>
                <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">Not authenticated</div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">LocalStorage Data</h2>
            {localStorageData ? (
              <div>
                <div className="mb-2">
                  <span className="font-medium">auth_user:</span>
                  {localStorageData.auth_user ? (
                    <pre className="mt-1 p-3 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(localStorageData.auth_user, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-red-600 ml-2">Not found</span>
                  )}
                </div>
                
                <div className="mb-2">
                  <span className="font-medium">auth_token:</span>
                  {localStorageData.auth_token ? (
                    <span className="text-green-600 ml-2">{localStorageData.auth_token}</span>
                  ) : (
                    <span className="text-red-600 ml-2">Not found</span>
                  )}
                </div>
                
                <div>
                  <span className="font-medium">user:</span>
                  {localStorageData.user ? (
                    <pre className="mt-1 p-3 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(localStorageData.user, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-red-600 ml-2">Not found</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-600">No localStorage data found</div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
            
            <button
              onClick={clearLocalStorage}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear LocalStorage
            </button>
            
            <Link href="/quick-login">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Go to Quick Login
              </button>
            </Link>
            
            <Link href="/dashboard/admin">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Go to Admin Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusPage;
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleRedirectPath } from '@/components/providers/AuthProvider';

const QuickLoginPage = () => {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const redirectPath = getRoleRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginStatus(`Logging in as ${email}...`);
      const success = await login(email, password);

      if (success) {
        setLoginStatus(`Login successful! Redirecting...`);
      } else {
        setLoginStatus('Login failed. Invalid credentials.');
      }
    } catch (error) {
      setLoginStatus('Error during login. Please try again.');
      console.error('Login error:', error);
    }
  };

  const accounts = [
    { role: 'Admin', email: 'admin@rumahtahfidz.com', password: 'admin123' },
    { role: 'Musyrif', email: 'musyrif@rumahtahfidz.com', password: 'musyrif123' },
    { role: 'Wali', email: 'wali@rumahtahfidz.com', password: 'wali123' },
    { role: 'Santri', email: 'santri@rumahtahfidz.com', password: 'santri123' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Quick Login
        </h1>
        
        <p className="text-gray-600 mb-6">
          Choose an account to login quickly for testing purposes.
        </p>
        
        <div className="space-y-4">
          {accounts.map((account) => (
            <button
              key={account.role}
              onClick={() => handleLogin(account.email, account.password)}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Login as {account.role}</div>
              <div className="text-sm text-gray-500">{account.email}</div>
            </button>
          ))}
        </div>
        
        {loginStatus && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
            {loginStatus}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickLoginPage;
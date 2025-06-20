'use client';

import React from 'react';

export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Test Simple Page
        </h1>
        <p className="text-gray-600 mb-4">
          This is a simple test page to check if Next.js is working properly.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <strong>Status:</strong> ✅ Working
          </p>
          <p className="text-sm text-gray-500">
            <strong>Time:</strong> {new Date().toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
          </p>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => alert('Button clicked!')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Test Button
          </button>
        </div>
        
        <div className="mt-4">
          <a 
            href="/"
            className="block text-center text-blue-500 hover:text-blue-600 underline"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}

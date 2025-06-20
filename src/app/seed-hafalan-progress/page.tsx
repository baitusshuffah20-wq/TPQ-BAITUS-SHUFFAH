'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SeedHafalanProgressPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [santriCount, setSantriCount] = useState<number | null>(null);
  const [existingRecords, setExistingRecords] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for active santri and existing records when the page loads
    const checkData = async () => {
      try {
        setIsChecking(true);
        
        // Check for active santri
        const santriResponse = await fetch('/api/santri?status=ACTIVE', {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const santriData = await santriResponse.json();
        if (santriData.success) {
          setSantriCount(santriData.santri.length);
        }
        
        // Check for existing hafalan progress records
        const progressResponse = await fetch('/api/check-hafalan-progress', {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const progressData = await progressResponse.json();
        if (progressData.success) {
          setExistingRecords(progressData.count);
        }
        
      } catch (error) {
        console.error('Error checking data:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkData();
  }, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/seed-hafalan-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      setResult(data);
      
      // Update existing records count after seeding
      if (data.success) {
        setExistingRecords(data.count);
      }
      
    } catch (error) {
      console.error('Error seeding data:', error);
      setResult({ 
        success: false, 
        message: 'An error occurred while seeding data',
        error: String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Seed Hafalan Progress Data
        </h1>
        
        <p className="text-gray-600 mb-6">
          This page will seed the database with sample hafalan progress data for testing purposes.
        </p>
        
        {isChecking ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className={`p-4 rounded-lg ${santriCount && santriCount > 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              <p className="font-medium">Active Santri:</p>
              <p>{santriCount !== null ? `${santriCount} santri found` : 'Unable to check santri data'}</p>
            </div>
            
            <div className={`p-4 rounded-lg ${existingRecords !== null ? 'bg-blue-50 text-blue-800' : 'bg-yellow-50 text-yellow-800'}`}>
              <p className="font-medium">Existing Hafalan Progress Records:</p>
              <p>{existingRecords !== null ? `${existingRecords} records found` : 'Unable to check existing records'}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={loading || (santriCount !== null && santriCount === 0)}
            className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Seeding...' : 'Seed Hafalan Progress Data'}
          </button>
          
          {santriCount !== null && santriCount === 0 && (
            <div className="p-4 rounded-lg bg-red-50 text-red-800">
              <p className="font-medium">Warning!</p>
              <p>No active santri found. Cannot seed hafalan progress data without active santri.</p>
            </div>
          )}
          
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">{result.success ? 'Success!' : 'Error!'}</p>
              <p>{result.message}</p>
              {result.count !== undefined && <p>Created {result.count} records</p>}
              {result.error && (
                <div className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
                  <pre className="text-xs">{result.error}</pre>
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/check-hafalan-progress')}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Check Data
            </button>
            
            <button
              onClick={() => router.push('/dashboard/musyrif/progress-hafalan')}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Go to Progress Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedHafalanProgressPage;
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CheckHafalanProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/check-hafalan-progress', {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          setError(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check Hafalan Progress Data
        </h1>
        
        <p className="text-gray-600 mb-6">
          This page shows the current data in the hafalan_progress table.
        </p>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg">
            <p className="font-medium">Error!</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
              <p className="font-medium">Total Records: {data?.count || 0}</p>
            </div>
            
            {data?.count > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Santri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.records?.map((record: any) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.santri?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">NIS: {record.santri?.nis || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.surahName}</div>
                          <div className="text-sm text-gray-500">{record.totalAyah} ayat</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.memorized} / {record.totalAyah} ayat</div>
                          <div className="text-sm text-gray-500">
                            {Math.round((record.memorized / record.totalAyah) * 100)}% complete
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                              record.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                              'bg-orange-100 text-orange-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No records found in the hafalan_progress table.</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/seed-hafalan-progress')}
                className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                Seed Data
              </button>
              
              <button
                onClick={() => router.push('/dashboard/musyrif/progress-hafalan')}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Go to Progress Hafalan Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckHafalanProgressPage;
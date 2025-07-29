"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const RawHafalanProgressPage = () => {
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    try {
      setCheckLoading(true);

      const response = await fetch("/api/raw-hafalan-progress", {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error checking data:", error);
      setData({
        success: false,
        message: "An error occurred while checking data",
        error: String(error),
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/raw-hafalan-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);

      // Refresh data after seeding
      if (data.success) {
        await checkData();
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      setResult({
        success: false,
        message: "An error occurred while seeding data",
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Raw Hafalan Progress Data
        </h1>

        <p className="text-gray-600 mb-6">
          This page uses raw SQL queries to check and seed hafalan progress
          data.
        </p>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current Data</h2>

            {checkLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : data?.success ? (
              <div>
                <p className="font-medium">Found {data.count} records</p>

                {data.count > 0 ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Santri
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Surah
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Progress
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.records.map((record: any) => (
                          <tr key={record.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {typeof record.id === "string"
                                ? record.id.substring(0, 8)
                                : record.id}
                              ...
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {record.santriName}
                              </div>
                              <div className="text-sm text-gray-500">
                                NIS: {record.santriNis}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {record.surahName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.totalAyah} ayat
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {record.memorized} / {record.totalAyah} ayat
                              </div>
                              <div className="text-sm text-gray-500">
                                {Math.round(
                                  (record.memorized / record.totalAyah) * 100,
                                )}
                                % complete
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  record.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "IN_PROGRESS"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">
                    No records found in the hafalan_progress table.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-medium">Error checking data:</p>
                <p>{data?.message || "Unknown error"}</p>
                {data?.error && (
                  <pre className="mt-2 p-2 bg-red-50 text-xs overflow-auto max-h-40 rounded">
                    {data.error}
                  </pre>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Seeding..." : "Seed Hafalan Progress Data (Raw SQL)"}
            </button>

            {result && (
              <div
                className={`p-4 rounded-lg ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
              >
                <p className="font-medium">
                  {result.success ? "Success!" : "Error!"}
                </p>
                <p>{result.message}</p>
                {result.count !== undefined && (
                  <p>Created {result.count} records</p>
                )}
                {result.error && (
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40 text-xs">
                    {result.error}
                  </pre>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => checkData()}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Refresh Data
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard/musyrif/progress-hafalan")
                }
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Go to Progress Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawHafalanProgressPage;

"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface DatabaseInfo {
  type: string;
  version: string;
  tables: Record<string, number>;
}

interface DatabaseTestResult {
  status: "success" | "error";
  message: string;
  database?: DatabaseInfo;
  error?: string | object;
}

export default function DatabaseTestPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DatabaseTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin role
  if (!user || user.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600">
              Hanya administrator yang dapat mengakses halaman Database Test.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/db-test");
      const data = await response.json();

      setResult(data);

      if (data.status === "error") {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error testing database connection:", err);
      setError("Failed to test database connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Database Connection Test
            </h1>
            <p className="text-gray-600">Test koneksi ke database MySQL</p>
          </div>
          <Button onClick={testConnection} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-gray-600">
                  Testing database connection...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Connection Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                      {result?.error && (
                        <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto text-xs">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      )}
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-red-800">
                        Troubleshooting Steps:
                      </h4>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        <li>Make sure MySQL server is running</li>
                        <li>Check if database "tpq_baitus_shuffah" exists</li>
                        <li>Verify credentials in .env file</li>
                        <li>See DATABASE_SETUP.md for detailed instructions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : result?.status === "success" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-medium text-green-800">
                      Connection Successful
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      {result.message}
                    </p>

                    {result.database && (
                      <div className="mt-4 border-t border-green-200 pt-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          Database Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-green-600">
                              Database Type
                            </p>
                            <p className="text-sm font-medium">
                              {result.database.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600">
                              MySQL Version
                            </p>
                            <p className="text-sm font-medium">
                              {result.database.version}
                            </p>
                          </div>
                        </div>

                        <h4 className="text-sm font-medium text-green-800 mt-4 mb-2">
                          Table Records
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {result.database.tables &&
                            Object.entries(result.database.tables).map(
                              ([table, count]) => (
                                <div
                                  key={table}
                                  className="bg-white p-3 rounded-lg border border-green-100 shadow-sm"
                                >
                                  <p className="text-xs text-green-600 capitalize">
                                    {table}
                                  </p>
                                  <p className="text-lg font-bold">{count}</p>
                                </div>
                              ),
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No connection test results yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Database Provider
                </h3>
                <p className="mt-1 text-sm text-gray-900">MySQL</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Database Name
                </h3>
                <p className="mt-1 text-sm text-gray-900">tpq_baitus_shuffah</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Host</h3>
                <p className="mt-1 text-sm text-gray-900">localhost:3306</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Connection String Format
                </h3>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  mysql://username:password@localhost:3306/tpq_baitus_shuffah
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

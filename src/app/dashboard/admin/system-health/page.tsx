"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Database, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Settings,
  Loader2
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface HealthCheck {
  timestamp: string;
  status: "healthy" | "warning" | "unhealthy";
  checks: {
    [key: string]: {
      status: "healthy" | "warning" | "unhealthy";
      message?: string;
      data?: any;
      warnings?: string[];
      error?: string;
    };
  };
  summary: {
    totalChecks: number;
    healthy: number;
    warnings: number;
    unhealthy: number;
    overallStatus: string;
    recommendations: string[];
  };
}

export default function SystemHealthPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check if user has admin role
  if (!user || user.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600">
              Hanya administrator yang dapat mengakses halaman ini.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/system-health");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch system health");
      }

      if (result.success) {
        setHealthData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.message || "Failed to load system health");
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("id-ID");
  };

  if (loading && !healthData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat status sistem...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !healthData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchHealthData} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600">
              Monitor kesehatan sistem salary management
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Terakhir diperbarui: {lastUpdated.toLocaleTimeString("id-ID")}
              </p>
            )}
          </div>
          <Button onClick={fetchHealthData} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {healthData && (
          <>
            {/* Overall Status */}
            <Card className={`border-2 ${
              healthData.status === 'healthy' ? 'border-green-200 bg-green-50' :
              healthData.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(healthData.status)}
                  <span className="ml-2">Status Sistem</span>
                  <Badge className={`ml-auto ${getStatusColor(healthData.status)}`}>
                    {healthData.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {healthData.summary.healthy}
                    </div>
                    <div className="text-sm text-gray-600">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {healthData.summary.warnings}
                    </div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {healthData.summary.unhealthy}
                    </div>
                    <div className="text-sm text-gray-600">Unhealthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {healthData.summary.totalChecks}
                    </div>
                    <div className="text-sm text-gray-600">Total Checks</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(healthData.checks).map(([checkName, check]) => (
                <Card key={checkName}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      {checkName === 'database' && <Database className="h-5 w-5 mr-2" />}
                      {checkName === 'salarySystem' && <DollarSign className="h-5 w-5 mr-2" />}
                      {checkName === 'cache' && <Activity className="h-5 w-5 mr-2" />}
                      {checkName === 'recentActivity' && <TrendingUp className="h-5 w-5 mr-2" />}
                      {checkName === 'performance' && <Settings className="h-5 w-5 mr-2" />}
                      <span className="capitalize">
                        {checkName.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge className={`ml-auto ${getStatusColor(check.status)}`}>
                        {check.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {check.message && (
                      <p className="text-sm text-gray-600 mb-3">{check.message}</p>
                    )}
                    
                    {check.data && (
                      <div className="space-y-2">
                        {Object.entries(check.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              {key.includes('Time') && 'ms'}
                              {key.includes('Coverage') && '%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {check.warnings && check.warnings.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-yellow-700">Warnings:</p>
                        {check.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-yellow-600">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    )}

                    {check.error && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-700">Error:</p>
                        <p className="text-sm text-red-600">{check.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            {healthData.summary.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    Rekomendasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {healthData.summary.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Last Check:</span>
                    <span className="ml-2 font-medium">
                      {formatTimestamp(healthData.timestamp)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Auto Refresh:</span>
                    <span className="ml-2 font-medium">Every 30 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

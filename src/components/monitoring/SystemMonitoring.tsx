'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Database, 
  Mail, 
  MessageSquare,
  CreditCard,
  Cloud,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Server,
  Monitor
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
  error?: string;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  responseTime: number;
  version: string;
  environment: string;
  system: {
    nodeVersion: string;
    platform: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      external: number;
    };
  };
  services: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  checks: HealthCheck[];
}

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  details?: any;
  error?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  successRate: number;
  duration: number;
}

export default function SystemMonitoring() {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [testResults, setTestResults] = useState<{
    summary: TestSummary;
    results: TestResult[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      } else {
        toast.error('Gagal memuat data kesehatan sistem');
      }
    } catch (error) {
      console.error('Error loading health data:', error);
      toast.error('Gagal memuat data kesehatan sistem');
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveTest = async () => {
    try {
      setTesting(true);
      toast.loading('Menjalankan test suite...', { id: 'testing' });
      
      const response = await fetch('/api/test/comprehensive', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
        toast.success(`Test selesai: ${data.summary.passed}/${data.summary.total} passed`, { id: 'testing' });
      } else {
        toast.error('Gagal menjalankan test suite', { id: 'testing' });
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Gagal menjalankan test suite', { id: 'testing' });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'storage':
        return <Cloud className="h-5 w-5" />;
      case 'authentication':
        return <Shield className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skip':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (mb: number) => {
    return `${mb} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600">Monitor kesehatan dan performa sistem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
          <Button
            onClick={loadHealthData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={runComprehensiveTest}
            disabled={testing}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Run Tests
          </Button>
        </div>
      </div>

      {/* System Overview */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(healthData.status)}
                    <span className="text-lg font-semibold capitalize">{healthData.status}</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{healthData.responseTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatUptime(healthData.system.uptime)}
                  </p>
                </div>
                <Server className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMemory(healthData.system.memory.used)}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {formatMemory(healthData.system.memory.total)}
                  </p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Health */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>Services Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthData.checks.map((check, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(check.service)}
                      <h4 className="font-medium capitalize">{check.service}</h4>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">{check.responseTime}ms</span>
                    </div>
                    
                    {check.details && (
                      <div className="space-y-1">
                        {Object.entries(check.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-medium">
                              {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {check.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                        {check.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Test Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{testResults.summary.total}</p>
                <p className="text-sm text-gray-600">Total Tests</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{testResults.summary.passed}</p>
                <p className="text-sm text-gray-600">Passed</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{testResults.summary.failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{testResults.summary.skipped}</p>
                <p className="text-sm text-gray-600">Skipped</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{testResults.summary.successRate}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="space-y-3">
              {testResults.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTestStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium">{result.test}</h4>
                      <p className="text-sm text-gray-500">Duration: {result.duration}ms</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={
                        result.status === 'pass' ? 'success' : 
                        result.status === 'fail' ? 'destructive' : 'warning'
                      }
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                    
                    {result.error && (
                      <p className="text-xs text-red-500 mt-1 max-w-xs truncate">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Environment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{healthData.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-medium">{healthData.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Node.js:</span>
                    <span className="font-medium">{healthData.system.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-medium">{healthData.system.platform}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Check:</span>
                    <span className="font-medium">
                      {new Date(healthData.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services:</span>
                    <span className="font-medium">
                      {healthData.services.healthy}/{healthData.services.total} healthy
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory Usage:</span>
                    <span className="font-medium">
                      {Math.round((healthData.system.memory.used / healthData.system.memory.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

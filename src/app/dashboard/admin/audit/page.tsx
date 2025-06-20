'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AuditData {
  success: boolean;
  counts: {
    users: number;
    santri: number;
    halaqah: number;
    hafalan: number;
    attendance: number;
    payments: number;
  };
  samples: {
    user: any;
    santri: any;
  };
  database: {
    connected: boolean;
    type: string;
    location: string;
  };
}

export default function AuditPage() {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/audit/simple');
      const data = await response.json();
      
      if (data.success) {
        setAuditData(data);
        toast.success('Audit data loaded successfully');
      } else {
        setError(data.details || 'Failed to load audit data');
        toast.error('Failed to load audit data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getCountIcon = (type: string) => {
    switch (type) {
      case 'users':
        return <Users className="h-8 w-8 text-blue-500" />;
      case 'santri':
        return <GraduationCap className="h-8 w-8 text-green-500" />;
      case 'halaqah':
        return <BookOpen className="h-8 w-8 text-purple-500" />;
      case 'hafalan':
        return <BookOpen className="h-8 w-8 text-orange-500" />;
      case 'attendance':
        return <Calendar className="h-8 w-8 text-teal-500" />;
      case 'payments':
        return <CreditCard className="h-8 w-8 text-pink-500" />;
      default:
        return <Database className="h-8 w-8 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audit data...</p>
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
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Audit</h1>
              <p className="text-gray-600">Database connectivity and data verification</p>
            </div>
          </div>
          <Button
            onClick={loadAuditData}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="font-medium text-red-900">Database Connection Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <div className="mt-3">
                    <p className="text-sm text-red-600">
                      This might be due to:
                    </p>
                    <ul className="text-sm text-red-600 mt-1 ml-4 list-disc">
                      <li>Database file not found or corrupted</li>
                      <li>Prisma client not generated properly</li>
                      <li>Environment variables not configured</li>
                      <li>Database schema mismatch</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Database Status */}
        {auditData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(auditData.database.connected)}
                  <div>
                    <p className="font-medium">Connection</p>
                    <p className="text-sm text-gray-600">
                      {auditData.database.connected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Database Type</p>
                  <p className="text-sm text-gray-600">{auditData.database.type}</p>
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-gray-600">{auditData.database.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Counts */}
        {auditData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(auditData.counts).map(([key, count]) => (
              <Card key={key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {key === 'santri' ? 'Students' : key}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <Badge variant={count > 0 ? 'success' : 'secondary'} className="mt-1">
                        {count > 0 ? 'Has Data' : 'No Data'}
                      </Badge>
                    </div>
                    {getCountIcon(key)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sample Data */}
        {auditData && (auditData.samples.user || auditData.samples.santri) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sample User */}
            {auditData.samples.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Sample User Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{auditData.samples.user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{auditData.samples.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{auditData.samples.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <Badge variant="outline">{auditData.samples.user.role}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Santri */}
            {auditData.samples.santri && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Sample Student Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{auditData.samples.santri.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NIS:</span>
                      <span className="font-medium">{auditData.samples.santri.nis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{auditData.samples.santri.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline">{auditData.samples.santri.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Data Summary */}
        {auditData && (
          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Database Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tables:</span>
                      <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tables with Data:</span>
                      <span className="font-medium">
                        {Object.values(auditData.counts).filter(count => count > 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Records:</span>
                      <span className="font-medium">
                        {Object.values(auditData.counts).reduce((sum, count) => sum + count, 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">System Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database:</span>
                      <Badge variant={auditData.database.connected ? 'success' : 'destructive'}>
                        {auditData.database.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Integrity:</span>
                      <Badge variant="success">Good</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Check:</span>
                      <span className="font-medium">{new Date().toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => window.open('/dashboard/admin/santri', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Students
              </Button>
              <Button
                onClick={() => window.open('/dashboard/admin/users', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Users
              </Button>
              <Button
                onClick={() => window.open('/dashboard/admin/hafalan', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Hafalan
              </Button>
              <Button
                onClick={() => window.open('/dashboard/admin/monitoring', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                System Monitoring
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

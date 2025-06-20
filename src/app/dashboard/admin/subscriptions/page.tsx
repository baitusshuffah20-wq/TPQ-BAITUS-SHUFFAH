'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  X,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Subscription {
  id: string;
  studentId: string;
  planType: string;
  amount: number;
  status: string;
  billingCycle: string;
  nextBillingDate: string;
  autoRenewal: boolean;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  billings: any[];
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    billingCycle: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadSubscriptions();
  }, [pagination.page, filters]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.billingCycle) queryParams.append('billingCycle', filters.billingCycle);

      const response = await fetch(`/api/subscriptions?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.data.subscriptions);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }));
      } else {
        toast.error('Gagal memuat data subscription');
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Gagal memuat data subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        toast.success(`Subscription ${action} berhasil`);
        loadSubscriptions();
      } else {
        const error = await response.json();
        toast.error(error.message || `Gagal ${action} subscription`);
      }
    } catch (error) {
      console.error(`Error ${action} subscription:`, error);
      toast.error(`Gagal ${action} subscription`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'success' as const, icon: CheckCircle, label: 'Active' },
      TRIAL: { variant: 'warning' as const, icon: Clock, label: 'Trial' },
      PAUSED: { variant: 'warning' as const, icon: Pause, label: 'Paused' },
      CANCELLED: { variant: 'destructive' as const, icon: X, label: 'Cancelled' },
      EXPIRED: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getBillingCycleBadge = (cycle: string) => {
    const cycleConfig = {
      MONTHLY: { label: 'Bulanan', color: 'bg-blue-100 text-blue-800' },
      QUARTERLY: { label: 'Triwulan', color: 'bg-green-100 text-green-800' },
      YEARLY: { label: 'Tahunan', color: 'bg-purple-100 text-purple-800' }
    };

    const config = cycleConfig[cycle as keyof typeof cycleConfig] || cycleConfig.MONTHLY;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Calculate overview stats
  const overviewStats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'ACTIVE').length,
    trial: subscriptions.filter(s => s.status === 'TRIAL').length,
    paused: subscriptions.filter(s => s.status === 'PAUSED').length,
    totalRevenue: subscriptions
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + s.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Kelola subscription SPP bulanan santri</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadSubscriptions}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Subscription
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{overviewStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-xl font-bold text-gray-900">{overviewStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trial</p>
                <p className="text-xl font-bold text-gray-900">{overviewStats.trial}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Pause className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paused</p>
                <p className="text-xl font-bold text-gray-900">{overviewStats.paused}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(overviewStats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama santri..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
            
            <select
              value={filters.billingCycle}
              onChange={(e) => setFilters(prev => ({ ...prev, billingCycle: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Siklus</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="QUARTERLY">Triwulan</option>
              <option value="YEARLY">Tahunan</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Daftar Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Tidak ada subscription</p>
              <p className="text-sm text-gray-500">Subscription akan muncul di sini setelah dibuat</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{subscription.student.name}</h4>
                      {getStatusBadge(subscription.status)}
                      {getBillingCycleBadge(subscription.billingCycle)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Plan: {subscription.planType}</span>
                      <span>•</span>
                      <span>{formatCurrency(subscription.amount)}</span>
                      <span>•</span>
                      <span>Next: {formatDate(subscription.nextBillingDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {/* View details */}}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    {subscription.status === 'ACTIVE' && (
                      <Button
                        onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {subscription.status === 'PAUSED' && (
                      <Button
                        onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

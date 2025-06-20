'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Calendar,
  DollarSign,
  Users,
  Star,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  billingCycle: string;
  trialDays: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data);
      } else {
        toast.error('Gagal memuat subscription plans');
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Gagal memuat subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels = {
      MONTHLY: 'Bulanan',
      QUARTERLY: 'Triwulan',
      YEARLY: 'Tahunan'
    };
    return labels[cycle as keyof typeof labels] || cycle;
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

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/subscriptions/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, isActive: !isActive })
      });

      if (response.ok) {
        toast.success(`Plan ${!isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
        loadPlans();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal mengubah status plan');
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Gagal mengubah status plan');
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus plan ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subscriptions/plans?id=${planId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Plan berhasil dihapus');
        loadPlans();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menghapus plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Gagal menghapus plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600">Kelola paket subscription SPP</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadPlans}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Buat Plan Baru
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Belum ada subscription plan</p>
            <p className="text-sm text-gray-500 mb-4">Buat plan pertama untuk memulai subscription system</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Plan Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.isActive ? 'border-blue-200' : 'border-gray-200 opacity-75'}`}>
              {plan.isActive && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="success" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => setEditingPlan(plan)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deletePlan(plan.id)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(plan.amount)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {getBillingCycleBadge(plan.billingCycle)}
                    {plan.trialDays > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {plan.trialDays} hari trial
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Fitur:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Order: {plan.sortOrder}
                    </div>
                    <Button
                      onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                      variant={plan.isActive ? "outline" : "default"}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {plan.isActive ? (
                        <>
                          <X className="h-3 w-3" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          Aktifkan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Plans</p>
                <p className="text-xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-xl font-bold text-gray-900">
                  {plans.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Plans</p>
                <p className="text-xl font-bold text-gray-900">
                  {plans.filter(p => p.billingCycle === 'MONTHLY').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-lg font-bold text-gray-900">
                  {plans.length > 0 ? formatCurrency(
                    plans.reduce((sum, p) => sum + p.amount, 0) / plans.length
                  ) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Settings,
  Key,
  Lock,
  Globe,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Edit,
  TestTube,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  mode: 'SANDBOX' | 'PRODUCTION';
  clientKey: string;
  serverKey: string;
  merchantId: string;
  callbackUrl: string;
  redirectUrl: string;
  notificationUrl: string;
  supportedMethods: string[];
  lastTested: string | null;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  gateway: string;
  isActive: boolean;
  icon: string;
  description: string;
  fees: number;
  minAmount: number;
  maxAmount: number;
}

export default function PaymentGatewayPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'gateways' | 'methods'>('gateways');
  const [testingGateway, setTestingGateway] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentGateways();
  }, []);

  const loadPaymentGateways = async () => {
    try {
      setLoading(true);
      
      // Fetch payment gateway settings from API
      const response = await fetch('/api/settings/integrations/payment');
      
      // Check if response is unauthorized
      if (response.status === 401) {
        toast.error('Anda tidak memiliki izin untuk mengakses halaman ini');
        // Redirect to dashboard or login page
        window.location.href = '/dashboard';
        return;
      }
      
      // Check if response is not OK
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGateways(data.gateways || []);
        setMethods(data.methods || []);
      } else {
        throw new Error(data.error || 'Failed to load payment gateway data');
      }
      
      // If no gateways are configured, add a default Midtrans gateway
      if (!data.gateways || data.gateways.length === 0) {
        const defaultGateway: PaymentGateway = {
          id: 'MIDTRANS',
          name: 'Midtrans',
          code: 'MIDTRANS',
          isActive: false,
          mode: 'SANDBOX',
          clientKey: '',
          serverKey: '',
          merchantId: '',
          callbackUrl: `${window.location.origin}/api/payment/callback`,
          redirectUrl: `${window.location.origin}/payment/success`,
          notificationUrl: `${window.location.origin}/api/payment/webhook`,
          supportedMethods: ['CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'QRIS'],
          lastTested: null,
          status: 'DISCONNECTED'
        };
        
        setGateways([defaultGateway]);
      }
      
      // If no payment methods are configured, add default methods
      if (!data.methods || data.methods.length === 0) {
        const defaultMethods: PaymentMethod[] = [
          {
            id: 'credit_card',
            name: 'Credit Card',
            code: 'CREDIT_CARD',
            gateway: 'MIDTRANS',
            isActive: true,
            icon: '/icons/credit-card.svg',
            description: 'Pay with Visa, Mastercard, or JCB',
            fees: 2.9,
            minAmount: 10000,
            maxAmount: 50000000
          },
          {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            code: 'BANK_TRANSFER',
            gateway: 'MIDTRANS',
            isActive: true,
            icon: '/icons/bank-transfer.svg',
            description: 'Pay via bank transfer (BCA, BNI, BRI, Mandiri)',
            fees: 4000,
            minAmount: 10000,
            maxAmount: 100000000
          },
          {
            id: 'e_wallet',
            name: 'E-Wallet',
            code: 'E_WALLET',
            gateway: 'MIDTRANS',
            isActive: true,
            icon: '/icons/e-wallet.svg',
            description: 'Pay with GoPay, OVO, DANA, or LinkAja',
            fees: 1.5,
            minAmount: 10000,
            maxAmount: 10000000
          },
          {
            id: 'qris',
            name: 'QRIS',
            code: 'QRIS',
            gateway: 'MIDTRANS',
            isActive: true,
            icon: '/icons/qris.svg',
            description: 'Pay with any QRIS-compatible app',
            fees: 0.7,
            minAmount: 1000,
            maxAmount: 5000000
          }
        ];
        
        setMethods(defaultMethods);
      }
    } catch (error) {
      console.error('Error loading payment gateways:', error);
      
      // Show more specific error message
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          toast.error('Anda tidak memiliki izin untuk mengakses halaman ini');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        } else {
          toast.error(`Gagal memuat data payment gateway: ${error.message}`);
        }
      } else {
        toast.error('Gagal memuat data payment gateway');
      }
      
      // Set default values if API fails
      const defaultGateway: PaymentGateway = {
        id: 'MIDTRANS',
        name: 'Midtrans',
        code: 'MIDTRANS',
        isActive: false,
        mode: 'SANDBOX',
        clientKey: '',
        serverKey: '',
        merchantId: '',
        callbackUrl: `${window.location.origin}/api/payment/callback`,
        redirectUrl: `${window.location.origin}/payment/success`,
        notificationUrl: `${window.location.origin}/api/payment/webhook`,
        supportedMethods: ['CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'QRIS'],
        lastTested: null,
        status: 'DISCONNECTED'
      };
      
      setGateways([defaultGateway]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGateway = async (gateway: PaymentGateway) => {
    try {
      // Save gateway configuration via API
      const response = await fetch('/api/settings/integrations/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gateway }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to save gateway configuration');
      }
      
      // Update the gateway in the list
      const updatedGateways = gateways.map(g => {
        if (g.id === gateway.id) {
          return gateway;
        }
        return g;
      });
      
      setGateways(updatedGateways);
      setEditingGateway(null);
      toast.success(`Payment gateway ${gateway.name} berhasil disimpan`);
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      toast.error('Gagal menyimpan konfigurasi payment gateway');
    }
  };

  const handleTestGateway = async (gatewayId: string) => {
    try {
      setTestingGateway(gatewayId);
      
      // Test gateway connection via API
      const response = await fetch('/api/settings/integrations/payment', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gatewayCode: gatewayId }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Test connection failed');
      }
      
      // Update the gateway status
      const updatedGateways = gateways.map(gateway => {
        if (gateway.id === gatewayId) {
          return {
            ...gateway,
            status: data.status || 'CONNECTED',
            lastTested: data.lastTested || new Date().toISOString()
          };
        }
        return gateway;
      });
      
      setGateways(updatedGateways);
      toast.success('Test koneksi berhasil');
    } catch (error) {
      console.error('Error testing gateway:', error);
      toast.error('Test koneksi gagal');
      
      // Update the gateway status to ERROR
      const updatedGateways = gateways.map(gateway => {
        if (gateway.id === gatewayId) {
          return {
            ...gateway,
            status: 'ERROR' as const,
            lastTested: new Date().toISOString()
          };
        }
        return gateway;
      });
      
      setGateways(updatedGateways);
    } finally {
      setTestingGateway(null);
    }
  };

  const handleToggleGateway = async (gatewayId: string) => {
    try {
      // Find the gateway to toggle
      const gateway = gateways.find(g => g.id === gatewayId);
      if (!gateway) return;
      
      // Create updated gateway object
      const updatedGateway = {
        ...gateway,
        isActive: !gateway.isActive
      };
      
      // Save the updated gateway
      await handleSaveGateway(updatedGateway);
      
      toast.success(`Payment gateway ${gateway.name} ${gateway.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
    } catch (error) {
      console.error('Error toggling gateway:', error);
      toast.error('Gagal mengubah status payment gateway');
    }
  };

  const handleToggleMethod = async (methodId: string) => {
    try {
      // Find the method to toggle
      const method = methods.find(m => m.id === methodId);
      if (!method) return;
      
      // Create updated method object
      const updatedMethod = {
        ...method,
        isActive: !method.isActive
      };
      
      // Save the updated method via API
      const response = await fetch(`/api/payment/methods/${methodId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: updatedMethod.isActive }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update payment method');
      }
      
      // Update the methods list
      const updatedMethods = methods.map(m => {
        if (m.id === methodId) {
          return updatedMethod;
        }
        return m;
      });
      
      setMethods(updatedMethods);
      
      toast.success(`Metode pembayaran ${method.name} ${method.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
    } catch (error) {
      console.error('Error toggling payment method:', error);
      toast.error('Gagal mengubah status metode pembayaran');
      
      // If API call fails, show a more detailed error message
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      }
      
      // For now, just update the UI without API call
      const updatedMethods = methods.map(method => {
        if (method.id === methodId) {
          return {
            ...method,
            isActive: !method.isActive
          };
        }
        return method;
      });
      
      setMethods(updatedMethods);
      
      const method = methods.find(m => m.id === methodId);
      if (method) {
        toast.success(`Metode pembayaran ${method.name} ${method.isActive ? 'dinonaktifkan' : 'diaktifkan'} (mode offline)`);
      }
    }
  };

  const toggleShowSecret = (gatewayId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Terhubung
        </Badge>;
      case 'ERROR':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Error
        </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Tidak Terhubung
        </Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Payment Gateway</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat konfigurasi payment gateway...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (editingGateway) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Payment Gateway: {editingGateway.name}
            </h1>
            <Button
              variant="outline"
              onClick={() => setEditingGateway(null)}
            >
              Batal
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Gateway
                  </label>
                  <Input
                    type="text"
                    value={editingGateway.name}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      name: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Gateway
                  </label>
                  <Input
                    type="text"
                    value={editingGateway.code}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      code: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <select
                    value={editingGateway.mode}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      mode: e.target.value as 'SANDBOX' | 'PRODUCTION'
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white w-full"
                  >
                    <option value="SANDBOX">Sandbox (Testing)</option>
                    <option value="PRODUCTION">Production (Live)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant ID
                  </label>
                  <Input
                    type="text"
                    value={editingGateway.merchantId}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      merchantId: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showSecrets[editingGateway.id] ? "text" : "password"}
                      value={editingGateway.clientKey}
                      onChange={(e) => setEditingGateway({
                        ...editingGateway,
                        clientKey: e.target.value
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(editingGateway.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[editingGateway.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showSecrets[editingGateway.id] ? "text" : "password"}
                      value={editingGateway.serverKey}
                      onChange={(e) => setEditingGateway({
                        ...editingGateway,
                        serverKey: e.target.value
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(editingGateway.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[editingGateway.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Callback URL
                  </label>
                  <Input
                    type="text"
                    value={editingGateway.callbackUrl}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      callbackUrl: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redirect URL
                  </label>
                  <Input
                    type="text"
                    value={editingGateway.redirectUrl}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      redirectUrl: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification URL
                  </label>
                  <Input
                    type="text"
                    value={editingGateway.notificationUrl}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      notificationUrl: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center h-10">
                    {getStatusBadge(editingGateway.status)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingGateway(null)}
                >
                  Batal
                </Button>
                <Button
                  onClick={() => handleSaveGateway(editingGateway)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Gateway</h1>
            <p className="text-gray-600">Kelola konfigurasi payment gateway dan metode pembayaran</p>
          </div>
          <Button
            onClick={loadPaymentGateways}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('gateways')}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gateways'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="h-4 w-4" />
              Payment Gateways
            </button>
            <button
              onClick={() => setActiveTab('methods')}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'methods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Metode Pembayaran
            </button>
          </nav>
        </div>

        {/* Payment Gateways Tab */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  toast.success('Fitur tambah payment gateway akan segera tersedia');
                }}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Gateway
              </Button>
            </div>
            
            {gateways.map((gateway) => (
              <Card key={gateway.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{gateway.name}</h3>
                          {getStatusBadge(gateway.status)}
                          <Badge variant={gateway.mode === 'PRODUCTION' ? 'default' : 'outline'}>
                            {gateway.mode === 'PRODUCTION' ? 'Production' : 'Sandbox'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Merchant ID: {gateway.merchantId} • Last Tested: {formatDate(gateway.lastTested)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestGateway(gateway.id)}
                        disabled={testingGateway === gateway.id}
                        className="flex items-center gap-1"
                      >
                        {testingGateway === gateway.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span>Testing...</span>
                          </>
                        ) : (
                          <>
                            <TestTube className="h-3 w-3" />
                            <span>Test</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingGateway(gateway)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      
                      <Button
                        variant={gateway.isActive ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleGateway(gateway.id)}
                        className={`flex items-center gap-1 ${
                          gateway.isActive ? 'bg-green-600 hover:bg-green-700' : ''
                        }`}
                      >
                        {gateway.isActive ? (
                          <>
                            <ToggleRight className="h-3 w-3" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-3 w-3" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Metode Pembayaran yang Didukung</h4>
                    <div className="flex flex-wrap gap-2">
                      {gateway.supportedMethods.map((method) => (
                        <Badge key={method} variant="outline">
                          {method.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  toast.success('Fitur tambah metode pembayaran akan segera tersedia');
                }}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Metode
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {methods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">
                            Gateway: {method.gateway} • Fee: {typeof method.fees === 'number' && method.fees < 10 ? `${method.fees}%` : `Rp${method.fees.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant={method.isActive ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleMethod(method.id)}
                        className={`flex items-center gap-1 ${
                          method.isActive ? 'bg-green-600 hover:bg-green-700' : ''
                        }`}
                      >
                        {method.isActive ? (
                          <>
                            <ToggleRight className="h-3 w-3" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-3 w-3" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Min. Amount</p>
                        <p className="text-sm font-medium text-gray-900">
                          Rp{method.minAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Max. Amount</p>
                        <p className="text-sm font-medium text-gray-900">
                          Rp{method.maxAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => toast.success(`Edit ${method.name} akan segera tersedia`)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => toast.success(`Hapus ${method.name} akan segera tersedia`)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
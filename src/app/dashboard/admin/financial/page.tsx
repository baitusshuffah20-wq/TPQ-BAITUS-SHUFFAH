'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import FinancialAccountForm from '@/components/forms/FinancialAccountForm';
import TransactionForm from '@/components/forms/TransactionForm';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FinancialAccount {
  id: string;
  name: string;
  type: string;
  accountNumber?: string;
  balance: number;
  actualBalance: number;
  isActive: boolean;
  description?: string;
  transactions: any[];
  _count: {
    transactions: number;
  };
}

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  transactionDate: string;
  account: {
    id: string;
    name: string;
    type: string;
  };
  santri?: {
    id: string;
    nis: string;
    name: string;
  };
  createdByUser: {
    id: string;
    name: string;
  };
}

export default function FinancialPage() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions'>('overview');
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Load accounts
      const accountsResponse = await fetch('/api/financial/accounts');
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData.accounts || []);
      }

      // Load recent transactions
      const transactionsResponse = await fetch('/api/financial/transactions?limit=10');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
        setSummary(transactionsData.summary || { totalIncome: 0, totalExpense: 0, netIncome: 0 });
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (accountData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/financial/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });

      if (response.ok) {
        toast.success('Akun keuangan berhasil dibuat');
        setShowAccountForm(false);
        loadFinancialData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat akun keuangan');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Gagal membuat akun keuangan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateTransaction = async (transactionData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (response.ok) {
        toast.success('Transaksi berhasil dibuat');
        setShowTransactionForm(false);
        loadFinancialData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat transaksi');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Gagal membuat transaksi');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'BANK': return <CreditCard className="h-5 w-5" />;
      case 'DIGITAL_WALLET': return <Wallet className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.actualBalance, 0);
  };

  if (showAccountForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <FinancialAccountForm
            account={editingAccount || undefined}
            onSubmit={handleCreateAccount}
            onCancel={() => {
              setShowAccountForm(false);
              setEditingAccount(null);
            }}
            isLoading={formLoading}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (showTransactionForm) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <TransactionForm
            transaction={editingTransaction || undefined}
            onSubmit={handleCreateTransaction}
            onCancel={() => {
              setShowTransactionForm(false);
              setEditingTransaction(null);
            }}
            isLoading={formLoading}
            currentUserId="admin-user-id" // TODO: Get from auth context
          />
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
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Keuangan</h1>
              <p className="text-gray-600">Kelola keuangan TPQ Baitus Shuffah</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAccountForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Akun Baru
            </Button>
            <Button
              onClick={() => setShowTransactionForm(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Transaksi Baru
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Saldo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(getTotalBalance())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Laba Bersih</p>
                  <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.netIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'accounts', label: 'Akun Keuangan', icon: <CreditCard className="h-4 w-4" /> },
              { id: 'transactions', label: 'Transaksi', icon: <DollarSign className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Transaksi Terbaru</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                  >
                    Lihat Semua
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat transaksi...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada transaksi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">{transaction.account.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.transactionDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ringkasan Akun</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('accounts')}
                  >
                    Kelola Akun
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat akun...</p>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada akun keuangan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getAccountTypeIcon(account.type)}
                          <div>
                            <p className="font-medium text-gray-900">{account.name}</p>
                            <p className="text-sm text-gray-600">{account.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(account.actualBalance)}
                          </p>
                          <Badge variant={account.isActive ? 'success' : 'secondary'} className="text-xs">
                            {account.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'accounts' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daftar Akun Keuangan</span>
                <Button
                  onClick={() => setShowAccountForm(true)}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Akun
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat akun...</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada akun keuangan</h3>
                  <p className="text-gray-600 mb-6">Mulai dengan membuat akun keuangan pertama Anda</p>
                  <Button
                    onClick={() => setShowAccountForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Buat Akun Pertama
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAccountTypeIcon(account.type)}
                          <h3 className="font-medium text-gray-900">{account.name}</h3>
                        </div>
                        <Badge variant={account.isActive ? 'success' : 'secondary'}>
                          {account.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tipe:</span>
                          <span className="font-medium">{account.type}</span>
                        </div>
                        {account.accountNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">No. Rekening:</span>
                            <span className="font-medium">{account.accountNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Saldo:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(account.actualBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Transaksi:</span>
                          <span className="font-medium">{account._count.transactions}</span>
                        </div>
                      </div>

                      {account.description && (
                        <p className="text-sm text-gray-600 mb-4">{account.description}</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAccount(account);
                            setShowAccountForm(true);
                          }}
                          className="flex-1 flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daftar Transaksi</span>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button
                    onClick={() => setShowTransactionForm(true)}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Transaksi
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat transaksi...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
                  <p className="text-gray-600 mb-6">Mulai dengan membuat transaksi pertama Anda</p>
                  <Button
                    onClick={() => setShowTransactionForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Buat Transaksi Pertama
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Tipe</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Kategori</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Deskripsi</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Akun</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Jumlah</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(transaction.transactionDate).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {transaction.type === 'INCOME' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <Badge
                                variant={transaction.type === 'INCOME' ? 'success' : 'destructive'}
                                className="text-xs"
                              >
                                {transaction.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{transaction.category}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">
                            {transaction.description}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{transaction.account.name}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingTransaction(transaction);
                                  setShowTransactionForm(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Download,
  Eye,
  Check,
  DollarSign,
  Settings,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import GeneratePayrollModal from "@/components/payroll/GeneratePayrollModal";
import PaymentModal from "@/components/payroll/PaymentModal";
import SalarySettingsModal from "@/components/payroll/SalarySettingsModal";

interface PayrollData {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_position: string;
  period_month: number;
  period_year: number;
  period_display: string;
  total_sessions: number;
  attended_sessions: number;
  absent_sessions: number;
  late_sessions: number;
  base_salary: number;
  session_rate: number;
  attendance_bonus: number;
  overtime_pay: number;
  allowances: number;
  deductions: number;
  gross_salary: number;
  net_salary: number;
  status: "DRAFT" | "APPROVED" | "PAID" | "CANCELLED";
  status_text: string;
  attendance_percentage: number;
  generated_at: string;
  approved_at?: string;
  paid_at?: string;
  calculation_details: any;
}

interface SalarySetting {
  id: string;
  position: string;
  salary_type: "FIXED" | "PER_SESSION" | "HOURLY";
  base_amount: number;
  overtime_rate: number;
  allowances: any;
  deductions: any;
  is_active: boolean;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollData[]>([]);
  const [salarySettings, setSalarySettings] = useState<SalarySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollData | null>(
    null,
  );

  useEffect(() => {
    loadPayrolls();
    loadSalarySettings();
  }, [monthFilter, yearFilter, statusFilter]);

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: monthFilter.toString(),
        year: yearFilter.toString(),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const response = await fetch(`/api/payroll?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayrolls(data.payrolls);
      } else {
        console.error("Failed to load payrolls:", data.message);
      }
    } catch (error) {
      console.error("Error loading payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalarySettings = async () => {
    try {
      const response = await fetch("/api/salary-settings");
      const data = await response.json();

      if (data.success) {
        setSalarySettings(data.settings);
      }
    } catch (error) {
      console.error("Error loading salary settings:", error);
    }
  };

  const handleGeneratePayroll = async (data: {
    month: number;
    year: number;
    employee_ids: string[];
  }) => {
    try {
      const response = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          generated_by: "current-user-id", // Replace with actual user ID
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `Payroll berhasil digenerate untuk ${result.results.filter((r: any) => r.status === "success").length} karyawan`,
        );
        setShowGenerateModal(false);
        loadPayrolls();
      } else {
        alert("Gagal generate payroll: " + result.message);
      }
    } catch (error) {
      console.error("Error generating payroll:", error);
      alert("Gagal generate payroll");
    }
  };

  const handleApprovePayroll = async (payrollId: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui payroll ini?")) return;

    try {
      const response = await fetch("/api/payroll", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: payrollId,
          status: "APPROVED",
          approved_by: "current-user-id", // Replace with actual user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Payroll berhasil disetujui");
        loadPayrolls();
      } else {
        alert("Gagal menyetujui payroll: " + data.message);
      }
    } catch (error) {
      console.error("Error approving payroll:", error);
      alert("Gagal menyetujui payroll");
    }
  };

  const handlePaySalary = async (paymentData: any) => {
    try {
      const response = await fetch("/api/payroll/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentData,
          paid_by: "current-user-id", // Replace with actual user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Gaji berhasil dibayar dan dicatat ke keuangan");
        setShowPaymentModal(false);
        setSelectedPayroll(null);
        loadPayrolls();
      } else {
        alert("Gagal membayar gaji: " + data.message);
      }
    } catch (error) {
      console.error("Error paying salary:", error);
      alert("Gagal membayar gaji");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "default"; // Green
      case "APPROVED":
        return "secondary"; // Blue
      case "DRAFT":
        return "outline"; // Gray
      case "CANCELLED":
        return "destructive"; // Red
      default:
        return "outline";
    }
  };

  const filteredPayrolls = payrolls.filter((payroll: PayrollData) => {
    const matchesSearch = payroll.employee_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || payroll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGrossSalary = filteredPayrolls.reduce(
    (sum, p) => sum + p.gross_salary,
    0,
  );
  const totalNetSalary = filteredPayrolls.reduce(
    (sum, p) => sum + p.net_salary,
    0,
  );
  const totalDeductions = filteredPayrolls.reduce(
    (sum, p) => sum + p.deductions,
    0,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistem Penggajian
            </h1>
            <p className="text-gray-600">
              Kelola gaji karyawan berdasarkan kehadiran dan pengaturan
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Pengaturan Gaji
            </Button>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Karyawan</p>
                  <p className="text-2xl font-bold">
                    {filteredPayrolls.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gaji Kotor</p>
                  <p className="text-2xl font-bold">
                    Rp {totalGrossSalary.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gaji Bersih</p>
                  <p className="text-2xl font-bold">
                    Rp {totalNetSalary.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Potongan</p>
                  <p className="text-2xl font-bold">
                    Rp {totalDeductions.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Karyawan
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Nama karyawan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("id-ID", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="PAID">Sudah Dibayar</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Export payroll data
                    alert("Fitur export akan segera tersedia");
                  }}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Belum ada data payroll untuk periode ini
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Karyawan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Periode
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Kehadiran
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Gaji Kotor
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Potongan
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Gaji Bersih
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayrolls.map((payroll) => (
                      <tr
                        key={payroll.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {payroll.employee_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payroll.employee_position}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">
                            {payroll.period_display}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="text-gray-900">
                              {payroll.attended_sessions}/
                              {payroll.total_sessions}
                            </p>
                            <p className="text-gray-500">
                              {payroll.attendance_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-medium text-gray-900">
                            Rp {payroll.gross_salary.toLocaleString("id-ID")}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="text-red-600">
                            Rp {payroll.deductions.toLocaleString("id-ID")}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-bold text-green-600">
                            Rp {payroll.net_salary.toLocaleString("id-ID")}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={getStatusBadgeColor(payroll.status) as any}
                          >
                            {payroll.status_text}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                // Show detail modal
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            {payroll.status === "DRAFT" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprovePayroll(payroll.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}

                            {payroll.status === "APPROVED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setShowPaymentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CreditCard className="h-3 w-3" />
                              </Button>
                            )}
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

        {/* Modals */}
        <GeneratePayrollModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGeneratePayroll}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayroll(null);
          }}
          payroll={selectedPayroll}
          onPay={handlePaySalary}
        />

        <SalarySettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onRefresh={loadSalarySettings}
        />
      </div>
    </DashboardLayout>
  );
}

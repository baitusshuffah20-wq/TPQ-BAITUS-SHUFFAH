"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  DollarSign,
  Calendar,
  Download,
  Printer,
  FileText,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Types
interface PayrollReport {
  id: string;
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  totalMusyrifs: number;
  totalSchedules: number;
  totalAttendance: {
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
  totalPayroll: number;
  totalBaseAmount: number;
  totalDeductions: number;
  totalBonuses: number;
  attendanceRate: number;
  punctualityRate: number;
  status: "DRAFT" | "FINALIZED";
  generatedAt: string;
  finalizedAt?: string;
  musyrifBreakdown: {
    musyrifId: string;
    musyrifName: string;
    position: string;
    totalAmount: number;
    attendanceRate: number;
  }[];
}

export default function PayrollReportsPage() {
  const [payrollReports, setPayrollReports] = useState<PayrollReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReport, setSelectedReport] = useState<PayrollReport | null>(
    null,
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedMonth, selectedYear]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock reports for the last 6 months
      const reports: PayrollReport[] = [];

      for (let i = 0; i < 6; i++) {
        const date = new Date(selectedYear, selectedMonth - 1 - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Random data
        const totalMusyrifs = 3;
        const totalSchedules = 12 * totalMusyrifs;
        const present = Math.floor(
          totalSchedules * (0.8 + Math.random() * 0.15),
        );
        const late = Math.floor((totalSchedules - present) * 0.6);
        const absent = Math.floor((totalSchedules - present - late) * 0.8);
        const excused = totalSchedules - present - late - absent;

        const baseAmount = 50000 * totalSchedules;
        const deductions = 10000 * late + 50000 * absent;
        const bonuses = 100000 * totalMusyrifs;
        const totalPayroll = baseAmount - deductions + bonuses;

        reports.push({
          id: `report_${year}_${month}`,
          period: {
            month,
            year,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
          totalMusyrifs,
          totalSchedules,
          totalAttendance: {
            present,
            late,
            absent,
            excused,
          },
          totalPayroll,
          totalBaseAmount: baseAmount,
          totalDeductions: deductions,
          totalBonuses: bonuses,
          attendanceRate: Math.round(((present + late) / totalSchedules) * 100),
          punctualityRate: Math.round((present / (present + late)) * 100),
          status: i === 0 ? "DRAFT" : "FINALIZED",
          generatedAt: new Date(
            year,
            month - 1,
            endDate.getDate() - 2,
          ).toISOString(),
          finalizedAt:
            i === 0
              ? undefined
              : new Date(year, month - 1, endDate.getDate()).toISOString(),
          musyrifBreakdown: [
            {
              musyrifId: "musyrif_1",
              musyrifName: "Ahmad Fauzi",
              position: "Musyrif Senior",
              totalAmount: Math.round(totalPayroll * 0.4),
              attendanceRate: Math.round(85 + Math.random() * 10),
            },
            {
              musyrifId: "musyrif_2",
              musyrifName: "Fatimah Azzahra",
              position: "Musyrifah",
              totalAmount: Math.round(totalPayroll * 0.35),
              attendanceRate: Math.round(80 + Math.random() * 15),
            },
            {
              musyrifId: "musyrif_3",
              musyrifName: "Muhammad Rizki",
              position: "Musyrif",
              totalAmount: Math.round(totalPayroll * 0.25),
              attendanceRate: Math.round(75 + Math.random() * 20),
            },
          ],
        });
      }

      setPayrollReports(reports);
    } catch (error) {
      console.error("Error loading payroll reports:", error);
      toast.error("Gagal memuat laporan penggajian");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("id-ID", {
      month: "long",
    });
  };

  // Handle view report
  const handleViewReport = (report: PayrollReport) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  // Handle finalize report
  const handleFinalizeReport = (reportId: string) => {
    try {
      setPayrollReports((prev) =>
        prev.map((report) => {
          if (report.id === reportId) {
            return {
              ...report,
              status: "FINALIZED",
              finalizedAt: new Date().toISOString(),
            };
          }
          return report;
        }),
      );

      toast.success("Laporan penggajian berhasil difinalisasi");
    } catch (error) {
      console.error("Error finalizing payroll report:", error);
      toast.error("Gagal memfinalisasi laporan penggajian");
    }
  };

  // Handle export report
  const handleExportReport = (format: "pdf" | "excel") => {
    toast.success(`Laporan berhasil diekspor ke ${format.toUpperCase()}`);
  };

  // Handle print report
  const handlePrintReport = () => {
    toast.success("Mencetak laporan...");
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "FINALIZED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case "FINALIZED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get trend icon
  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < previousValue) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat laporan penggajian...</p>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan Penggajian
            </h1>
            <p className="text-gray-600">
              Laporan penggajian musyrif berdasarkan periode
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport("excel")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">
                  Periode:
                </label>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - 2 + i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={loadReports}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {payrollReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Penggajian
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(payrollReports[0].totalPayroll)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Musyrif
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {payrollReports[0].totalMusyrifs}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Tingkat Kehadiran
                    </p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {payrollReports[0].attendanceRate}%
                      </p>
                      {payrollReports.length > 1 && (
                        <span className="ml-2">
                          {getTrendIcon(
                            payrollReports[0].attendanceRate,
                            payrollReports[1].attendanceRate,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Tingkat Ketepatan
                    </p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {payrollReports[0].punctualityRate}%
                      </p>
                      {payrollReports.length > 1 && (
                        <span className="ml-2">
                          {getTrendIcon(
                            payrollReports[0].punctualityRate,
                            payrollReports[1].punctualityRate,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Gaji
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Musyrif
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jadwal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kehadiran
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrollReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getMonthName(report.period.month)}{" "}
                          {report.period.year}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(report.period.startDate)} -{" "}
                          {formatDate(report.period.endDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(report.totalPayroll)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.totalMusyrifs} musyrif
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.totalSchedules} jadwal
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="text-green-600">
                              {report.attendanceRate}%
                            </span>
                            <span className="mx-1">•</span>
                            <span className="text-xs text-gray-600">
                              {report.totalAttendance.present} hadir,{" "}
                              {report.totalAttendance.late} terlambat
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                        >
                          {getStatusIcon(report.status)}
                          <span className="ml-1">
                            {report.status === "DRAFT" ? "Draft" : "Finalisasi"}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(report.generatedAt.split("T")[0])}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportReport("pdf")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {report.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFinalizeReport(report.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {payrollReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada laporan penggajian
                  </h3>
                  <p className="text-gray-600">
                    Belum ada laporan penggajian untuk periode ini
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Detail Modal */}
        {isReportModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Laporan Penggajian -{" "}
                      {getMonthName(selectedReport.period.month)}{" "}
                      {selectedReport.period.year}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedReport.period.startDate)} -{" "}
                      {formatDate(selectedReport.period.endDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintReport}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Cetak
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport("excel")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsReportModalOpen(false)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}
                    >
                      {getStatusIcon(selectedReport.status)}
                      <span className="ml-1">
                        {selectedReport.status === "DRAFT"
                          ? "Draft"
                          : "Finalisasi"}
                      </span>
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      Dibuat pada{" "}
                      {formatDate(selectedReport.generatedAt.split("T")[0])}
                    </span>
                    {selectedReport.finalizedAt && (
                      <>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          Difinalisasi pada{" "}
                          {formatDate(selectedReport.finalizedAt.split("T")[0])}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total Gaji
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(selectedReport.totalPayroll)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Tingkat Kehadiran
                            </p>
                            <p className="text-xl font-bold text-green-600">
                              {selectedReport.attendanceRate}%
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Tingkat Ketepatan
                            </p>
                            <p className="text-xl font-bold text-yellow-600">
                              {selectedReport.punctualityRate}%
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Attendance Breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Ringkasan Kehadiran
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Jadwal
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {selectedReport.totalSchedules}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Hadir
                          </p>
                          <p className="text-lg font-medium text-green-600">
                            {selectedReport.totalAttendance.present}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Terlambat
                          </p>
                          <p className="text-lg font-medium text-yellow-600">
                            {selectedReport.totalAttendance.late}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Tidak Hadir
                          </p>
                          <p className="text-lg font-medium text-red-600">
                            {selectedReport.totalAttendance.absent}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Ringkasan Keuangan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Honor Jadwal Halaqah
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {formatCurrency(selectedReport.totalBaseAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Potongan
                          </p>
                          <p className="text-lg font-medium text-red-600">
                            -{formatCurrency(selectedReport.totalDeductions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Bonus
                          </p>
                          <p className="text-lg font-medium text-green-600">
                            +{formatCurrency(selectedReport.totalBonuses)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Musyrif Breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Rincian per Musyrif
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Musyrif
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Posisi
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kehadiran
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Honor
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedReport.musyrifBreakdown.map((musyrif) => (
                            <tr
                              key={musyrif.musyrifId}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {musyrif.musyrifName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {musyrif.position}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      musyrif.attendanceRate >= 90
                                        ? "bg-green-100 text-green-800"
                                        : musyrif.attendanceRate >= 80
                                          ? "bg-blue-100 text-blue-800"
                                          : musyrif.attendanceRate >= 70
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {musyrif.attendanceRate}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(musyrif.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setIsReportModalOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

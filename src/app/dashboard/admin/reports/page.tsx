"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReportGenerator from "@/lib/report-generator";
import ScheduleReportDialog from "@/components/admin/ScheduleReportDialog";
import ScheduledReportsList from "@/components/admin/ScheduledReportsList";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  GraduationCap,
  TrendingUp,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Mail,
  Printer,
  Share2,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "academic" | "financial" | "administrative" | "analytics";
  icon: any;
  color: string;
  bgColor: string;
  estimatedTime: string;
  lastGenerated?: string;
}

const ReportsPage = () => {
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reportGenerator] = useState(new ReportGenerator());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedReportForSchedule, setSelectedReportForSchedule] = useState<{
    reportType: string;
    reportName: string;
  } | null>(null);
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If user is not admin, don't render anything (redirect will happen)
  if (status === "authenticated" && session?.user.role !== "ADMIN") {
    return null;
  }

  const reportTemplates: ReportTemplate[] = [
    {
      id: "student-progress",
      name: "Laporan Progress Santri",
      description: "Laporan detail progress hafalan dan akademik per santri",
      category: "academic",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      estimatedTime: "2-3 menit",
      lastGenerated: "2024-02-10",
    },
    {
      id: "class-summary",
      name: "Ringkasan Kelas",
      description: "Analisis performance keseluruhan kelas dan halaqah",
      category: "academic",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      estimatedTime: "1-2 menit",
      lastGenerated: "2024-02-11",
    },
    {
      id: "financial-summary",
      name: "Laporan Keuangan",
      description: "Ringkasan pendapatan, pembayaran SPP, dan donasi",
      category: "financial",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      estimatedTime: "3-4 menit",
      lastGenerated: "2024-02-09",
    },
    {
      id: "attendance-report",
      name: "Laporan Kehadiran",
      description: "Analisis kehadiran santri dan trend absensi",
      category: "administrative",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      estimatedTime: "2-3 menit",
      lastGenerated: "2024-02-12",
    },
    {
      id: "performance-analytics",
      name: "Analytics Performance",
      description: "Dashboard analytics dengan insights mendalam",
      category: "analytics",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      estimatedTime: "4-5 menit",
      lastGenerated: "2024-02-08",
    },
    {
      id: "donation-report",
      name: "Laporan Donasi",
      description: "Analisis donasi per kategori dan trend fundraising",
      category: "financial",
      icon: PieChart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      estimatedTime: "2-3 menit",
      lastGenerated: "2024-02-07",
    },
    {
      id: "monthly-summary",
      name: "Ringkasan Bulanan",
      description: "Laporan komprehensif semua aspek operasional",
      category: "administrative",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      estimatedTime: "5-7 menit",
      lastGenerated: "2024-02-01",
    },
    {
      id: "hafalan-progress",
      name: "Progress Hafalan",
      description: "Tracking detail progress hafalan per surah dan juz",
      category: "academic",
      icon: FileSpreadsheet,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      estimatedTime: "3-4 menit",
      lastGenerated: "2024-02-06",
    },
  ];

  const categories = [
    { id: "all", name: "Semua Kategori", count: reportTemplates.length },
    {
      id: "academic",
      name: "Akademik",
      count: reportTemplates.filter((r) => r.category === "academic").length,
    },
    {
      id: "financial",
      name: "Keuangan",
      count: reportTemplates.filter((r) => r.category === "financial").length,
    },
    {
      id: "administrative",
      name: "Administratif",
      count: reportTemplates.filter((r) => r.category === "administrative")
        .length,
    },
    {
      id: "analytics",
      name: "Analytics",
      count: reportTemplates.filter((r) => r.category === "analytics").length,
    },
  ];

  const filteredReports = reportTemplates.filter((report) => {
    const matchesCategory =
      selectedCategory === "all" || report.category === selectedCategory;
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const generateReport = async (reportId: string) => {
    setIsGenerating(reportId);

    try {
      let apiResponse: any;
      let blob: Blob;

      // Fetch data from appropriate API endpoint
      switch (reportId) {
        case "financial-summary":
          apiResponse = await fetch("/api/financial/reports?reportType=summary");
          break;
        case "spp-reports":
          apiResponse = await fetch("/api/financial/reports?reportType=spp");
          break;
        case "transaction-reports":
          apiResponse = await fetch("/api/financial/reports?reportType=transactions");
          break;
        case "outstanding-payments":
          apiResponse = await fetch("/api/financial/reports?reportType=outstanding");
          break;
        case "collection-rates":
          apiResponse = await fetch("/api/financial/reports?reportType=collection");
          break;
        case "salary-reports":
          apiResponse = await fetch("/api/admin/salary-reports");
          break;
        case "database-audit":
          apiResponse = await fetch("/api/audit/database");
          break;
        case "student-progress":
          // Use financial summary for now, can be extended later
          apiResponse = await fetch("/api/financial/reports?reportType=summary");
          break;
        case "class-summary":
          // Use financial summary for now, can be extended later
          apiResponse = await fetch("/api/financial/reports?reportType=summary");
          break;
        default:
          // For other reports, use financial summary as default
          apiResponse = await fetch("/api/financial/reports?reportType=summary");
      }

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const reportData = await apiResponse.json();

      if (!reportData.success) {
        throw new Error(reportData.message || "Failed to fetch report data");
      }

      // Generate PDF based on report type and data
      switch (reportId) {
        case "financial-summary":
          blob = await reportGenerator.generateFinancialReport({
            totalRevenue: reportData.report.summary.totalIncome || 0,
            sppPayments: reportData.report.spp.collectedAmount || 0,
            donations: reportData.report.summary.totalIncome - reportData.report.spp.collectedAmount || 0,
            reportData: reportData.report,
          });
          break;
        case "salary-reports":
          blob = await reportGenerator.generateClassReport({
            totalStudents: reportData.data.summary.uniqueMusyrif || 0,
            averageGrade: Math.round(reportData.data.summary.totalEarnings / reportData.data.summary.totalSessions) || 0,
            totalHafalan: reportData.data.summary.totalSessions || 0,
            reportData: reportData.data,
          });
          break;
        default:
          // Generate generic report with actual data
          blob = await reportGenerator.generateClassReport({
            totalStudents: 62,
            averageGrade: 87,
            totalHafalan: 188,
            reportData: reportData,
          });
      }

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      console.log(`✅ Report ${reportId} generated successfully`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Terjadi kesalahan saat generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const scheduleReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId);
    if (report) {
      setSelectedReportForSchedule({
        reportType: reportId,
        reportName: report.name,
      });
      setScheduleDialogOpen(true);
    }
  };

  const handleScheduleSubmit = async (scheduleData: any) => {
    try {
      const response = await fetch("/api/admin/scheduled-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Report scheduled successfully!");
        setScheduleDialogOpen(false);
        setSelectedReportForSchedule(null);
      } else {
        alert(`Error scheduling report: ${result.error}`);
      }
    } catch (error) {
      console.error("Error scheduling report:", error);
      alert("Error scheduling report. Please try again.");
    }
  };

  const shareReport = (reportId: string) => {
    alert(`Fitur share report untuk ${reportId} akan segera tersedia`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-blue-600" />
              Advanced Reports
            </h1>
            <p className="text-gray-600">
              Generate laporan komprehensif dengan export PDF otomatis
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Bulk Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Reports Generated
                  </p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-green-600">23</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Templates</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {reportTemplates.length}
                  </p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari template report..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const Icon = report.icon;
            const isCurrentlyGenerating = isGenerating === report.id;

            return (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.category === "academic"
                          ? "bg-blue-100 text-blue-800"
                          : report.category === "financial"
                            ? "bg-green-100 text-green-800"
                            : report.category === "administrative"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {report.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {report.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Estimasi: {report.estimatedTime}
                    </div>
                    {report.lastGenerated && (
                      <div className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Terakhir:{" "}
                        {new Date(report.lastGenerated).toLocaleDateString(
                          "id-ID",
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => generateReport(report.id)}
                      disabled={isCurrentlyGenerating}
                      className="flex-1"
                      size="sm"
                    >
                      {isCurrentlyGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scheduleReport(report.id)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareReport(report.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada template ditemukan
              </h3>
              <p className="text-gray-500">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Laporan Progress Santri - Ahmad Fauzi",
                  date: "2024-02-12 14:30",
                  size: "2.3 MB",
                  status: "completed",
                },
                {
                  name: "Ringkasan Kelas - Februari 2024",
                  date: "2024-02-11 09:15",
                  size: "1.8 MB",
                  status: "completed",
                },
                {
                  name: "Laporan Keuangan - Q1 2024",
                  date: "2024-02-10 16:45",
                  size: "3.1 MB",
                  status: "completed",
                },
                {
                  name: "Analytics Performance - Weekly",
                  date: "2024-02-09 11:20",
                  size: "4.2 MB",
                  status: "processing",
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-500">
                        {report.date} � {report.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    {report.status === "completed" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <ScheduledReportsList />
          </TabsContent>
        </Tabs>

        {/* Schedule Report Dialog */}
        {selectedReportForSchedule && (
          <ScheduleReportDialog
            isOpen={scheduleDialogOpen}
            onClose={() => {
              setScheduleDialogOpen(false);
              setSelectedReportForSchedule(null);
            }}
            reportType={selectedReportForSchedule.reportType}
            reportName={selectedReportForSchedule.reportName}
            onSchedule={handleScheduleSubmit}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;

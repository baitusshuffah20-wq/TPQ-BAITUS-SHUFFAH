"use client";
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BehaviorAssessmentForm from "@/components/behavior/BehaviorAssessmentForm";
import {
  Heart,
  AlertTriangle,
  Users,
  Calendar,
  Search,
  Plus,
  Eye,
  Edit,
  Target,
  Bell,
  Download,
  BarChart3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  BehaviorRecord,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  getBehaviorTypeColor,
  getBehaviorTypeText,
  getBehaviorStatusColor,
  getBehaviorStatusText,
  formatBehaviorDate,
  formatBehaviorTime,
} from "@/lib/behavior-data";

// Interface for API response data
interface ApiBehaviorRecord {
  id: string;
  santri_id?: string;
  santriId?: string;
  santri?: {
    name?: string;
    nis?: string;
  };
  santriName?: string;
  santriNis?: string;
  halaqah_id?: string;
  halaqahId?: string;
  halaqah?: {
    name?: string;
  };
  halaqahName?: string;
  criteria_id?: string;
  criteriaId?: string;
  criteriaName?: string;
  category: string;
  type: string;
  severity: string;
  points: number;
  date: string;
  time?: string;
  description: string;
  context?: string;
  location?: string;
  status: string;
  recorded_by?: string;
  recordedBy?: string;
  recordedByUser?: {
    name?: string;
  };
  recordedByName?: string;
  recorded_at?: string;
  recordedAt?: string;
  follow_up_required?: boolean;
  followUpRequired?: boolean;
  parent_notified?: boolean;
  parentNotified?: boolean;
  parent_notified_at?: string;
  parentNotifiedAt?: string;
  metadata?: unknown;
}

// Interface for behavior form data - using Partial<BehaviorRecord> for compatibility
type BehaviorFormData = Partial<BehaviorRecord>;
export default function BehaviorPage() {
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BehaviorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBehavior, setSelectedBehavior] =
    useState<BehaviorRecord | null>(null);
  const [editingBehavior, setEditingBehavior] = useState<BehaviorRecord | null>(
    null,
  );
  // Calculate statistics from real data
  const behaviorStats = useMemo(() => {
    const records = behaviorRecords;
    console.log(
      "?? Calculating stats from records:",
      records.length,
      "records",
    );
    console.log("?? Using real data:", behaviorRecords.length > 0);
    const stats = {
      totalRecords: records.length,
      positiveCount: records.filter((r) => r.type === "POSITIVE").length,
      negativeCount: records.filter((r) => r.type === "NEGATIVE").length,
      neutralCount: records.filter((r) => r.type === "NEUTRAL").length,
      totalPoints: records.reduce((sum, r) => sum + (r.points || 0), 0),
      averageScore:
        records.length > 0
          ? Math.round(
              records.reduce((sum, r) => sum + (r.points || 0), 0) /
                records.length,
            )
          : 0,
      followUpRequired: records.filter((r) => Boolean(r.followUpRequired))
        .length,
      parentNotifications: records.filter((r) => Boolean(r.parentNotified))
        .length,
    };
    console.log("?? Calculated stats:", stats);
    return stats;
  }, [behaviorRecords]);
  useEffect(() => {
    loadBehaviorData();
  }, [selectedDate]);
  useEffect(() => {
    filterRecords();
  }, [behaviorRecords, searchTerm, categoryFilter, typeFilter, severityFilter]);
  const loadBehaviorData = async () => {
    try {
      setLoading(true);
      console.log("?? Loading behavior data...");
      const response = await fetch("/api/behavior");
      const data = await response.json();
      if (data.success) {
        const behaviorRecords = data.data?.behaviorRecords || [];
        console.log(
          "? Behavior data loaded:",
          behaviorRecords.length,
          "records",
        );
        // Transform API data to match component expectations
        const transformedData = behaviorRecords.map(
          (item: ApiBehaviorRecord) => ({
            id: item.id,
            santriId: item.santri_id || item.santriId,
            santriName: item.santri?.name || item.santriName || "Unknown",
            santriNis: item.santri?.nis || item.santriNis || "",
            halaqahId: item.halaqah_id || item.halaqahId,
            halaqahName:
              item.halaqah?.name || item.halaqahName || "Unknown Halaqah",
            criteriaId: item.criteria_id || item.criteriaId,
            criteriaName: item.criteriaName || "Unknown Criteria",
            category: item.category,
            type: item.type,
            severity: item.severity,
            points: item.points,
            date: new Date(item.date).toISOString().split("T")[0],
            time:
              item.time ||
              new Date(item.date).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            description: item.description,
            context: item.context || "",
            location: item.location || "",
            status: item.status,
            recordedBy: item.recorded_by || item.recordedBy,
            recordedByName:
              item.recordedByUser?.name || item.recordedByName || "Unknown",
            recordedAt: item.recorded_at || item.recordedAt,
            followUpRequired: item.follow_up_required || item.followUpRequired,
            parentNotified: item.parent_notified || item.parentNotified,
            parentNotifiedAt: item.parent_notified_at || item.parentNotifiedAt,
            metadata: item.metadata,
          }),
        );
        setBehaviorRecords(transformedData);
      } else {
        console.error("? Failed to load behavior data:", data.message);
        // Fallback to empty array if API fails
        console.log("?? Using empty data as fallback");
        setBehaviorRecords([]);
      }
    } catch (error) {
      console.error("? Error loading behavior:", error);
      // Fallback to empty array on error
      console.log("?? Using empty data as fallback due to error");
      setBehaviorRecords([]);
    } finally {
      setLoading(false);
    }
  };
  const filterRecords = () => {
    let filtered = behaviorRecords;
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.santriNis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.criteriaName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.category === categoryFilter,
      );
    }
    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((record) => record.type === typeFilter);
    }
    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.severity === severityFilter,
      );
    }
    setFilteredRecords(filtered);
  };
  // Button handler functions
  const handleAddBehavior = () => {
    console.log("?? Opening add behavior modal...");
    setEditingBehavior(null);
    setShowAddModal(true);
  };
  const handleViewBehavior = (behavior: BehaviorRecord) => {
    console.log("??? Viewing behavior:", behavior.id);
    setSelectedBehavior(behavior);
    setShowDetailModal(true);
  };
  const handleEditBehavior = (behavior: BehaviorRecord) => {
    console.log("?? Editing behavior:", behavior.id);
    setEditingBehavior(behavior);
    setSelectedBehavior(behavior);
    setShowAddModal(true);
  };

  const handleAnalytics = () => {
    console.log("?? Opening analytics...");
    // Generate basic analytics from current data
    const analytics = {
      totalRecords: behaviorStats.totalRecords,
      positivePercentage:
        behaviorStats.totalRecords > 0
          ? Math.round(
              (behaviorStats.positiveCount / behaviorStats.totalRecords) * 100,
            )
          : 0,
      negativePercentage:
        behaviorStats.totalRecords > 0
          ? Math.round(
              (behaviorStats.negativeCount / behaviorStats.totalRecords) * 100,
            )
          : 0,
      averagePoints: behaviorStats.averageScore,
      topCategories: getTopCategories(),
    };
    console.log("?? Analytics data:", analytics);
    toast.success(
      `Analytics: ${analytics.positivePercentage}% positif, ${analytics.negativePercentage}% negatif, rata-rata ${analytics.averagePoints} poin`,
    );
  };
  const getTopCategories = () => {
    const records = behaviorRecords;
    const categoryCount = records.reduce(
      (acc, record) => {
        acc[record.category] = (acc[record.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  };
  const handleExportXLSX = async () => {
    console.log("?? Exporting XLSX data...");
    try {
      const records = behaviorRecords;
      // Validate data before export
      if (!records || records.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      console.log("?? Preparing to export:", records.length, "records");
      console.log("?? Sample record:", records[0]);
      // Import the modern Excel template system
      const { exportBehaviorRecordsData } = await import(
        "@/lib/excel-templates"
      );
      // Export using the modern template system (same as santri and analytics)
      exportBehaviorRecordsData(records);
      console.log(
        "?? Modern Excel Export completed:",
        records.length,
        "records",
      );
      toast.success(
        `?? Laporan Excel berhasil diekspor dengan template modern! (${records.length} records)`,
      );
    } catch (error) {
      console.error("? Error exporting Excel:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("? Error details:", errorMessage);
      toast.error(`Gagal mengekspor Excel file: ${errorMessage}`);
    }
  };
  // Test function for debugging Excel export
  const handleTestExport = async () => {
    console.log("?? Testing Excel export...");
    try {
      const { testExcelExport, testBehaviorExport } = await import(
        "@/lib/excel-test"
      );
      // Test basic Excel functionality
      const basicTest = testExcelExport();
      if (basicTest) {
        toast.success("? Basic Excel test passed");
      }
      // Test behavior export specifically
      setTimeout(() => {
        testBehaviorExport();
        toast.success("? Behavior export test initiated");
      }, 1000);
    } catch (error) {
      console.error("? Test export failed:", error);
      toast.error("Test export gagal");
    }
  };
  const handleExportCSV = () => {
    console.log("?? Exporting CSV data...");
    try {
      const records = behaviorRecords;
      // Prepare CSV data
      const csvData = records.map((record) => ({
        No: "",
        Tanggal: record.date || new Date().toISOString().split("T")[0],
        Santri: record.santriName || "",
        NIS: record.santriNis || "",
        Halaqah: record.halaqahName || "",
        Kategori: record.category || "",
        Tipe: record.type || "",
        Kriteria: record.criteriaName || "",
        Deskripsi: record.description || "",
        Poin: record.points || 0,
        Status: record.status || "ACTIVE",
        "Tindak Lanjut": record.followUpRequired ? "Ya" : "Tidak",
        "Ortu Diberitahu": record.parentNotified ? "Ya" : "Tidak",
        "Dicatat Oleh": record.recordedByName || "",
      }));
      // Add row numbers
      csvData.forEach((row, index) => {
        row["No"] = (index + 1).toString();
      });
      // Convert to CSV string
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row] || "";
              return typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}`
                : value;
            })
            .join(","),
        ),
      ].join("\n");
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `behavior-records-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Data CSV berhasil diekspor (${csvData.length} records)`);
    } catch (error) {
      console.error("? Error exporting CSV:", error);
      toast.error("Gagal mengekspor CSV");
    }
  };
  const handleExport = () => {
    console.log("?? Exporting behavior data...");
    try {
      const records = behaviorRecords;
      // Create modern Excel-style HTML template
      const createExcelHTML = (data: BehaviorRecord[]) => {
        const currentDate = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const stats = {
          total: data.length,
          positive: data.filter((r) => r.type === "POSITIVE").length,
          negative: data.filter((r) => r.type === "NEGATIVE").length,
          followUp: data.filter((r) => r.followUpRequired).length,
        };
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Perilaku Santri - TPQ Baitus Shuffahh</title>
    <style>
        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .stats-container {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .stat-card {
            flex: 1;
            min-width: 200px;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            color: white;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-total { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .stat-positive { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .stat-negative { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .stat-followup { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }
        .stat-number {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .table-container {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        tr:hover {
            background-color: #e3f2fd;
            transition: background-color 0.2s;
        }
        .type-positive {
            background: #d4edda;
            color: #155724;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        .type-negative {
            background: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        .type-neutral {
            background: #fff3cd;
            color: #856404;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        .points-positive { color: #28a745; font-weight: 600; }
        .points-negative { color: #dc3545; font-weight: 600; }
        .points-neutral { color: #6c757d; font-weight: 600; }
        .status-active {
            background: #d1ecf1;
            color: #0c5460;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            padding: 20px;
            background: white;
            border-radius: 10px;
        }
        .description {
            max-width: 200px;
            word-wrap: break-word;
            line-height: 1.4;
        }
        .santri-info {
            font-weight: 600;
            color: #495057;
        }
        .nis {
            font-size: 12px;
            color: #6c757d;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>?? LAPORAN PERILAKU SANTRI</h1>
        <p>TPQ Baitus Shuffahh - Rumah Tahfidz Al-Qur"an</p>
        <p>Digenerate pada: ${currentDate}</p>
    </div>
    <div class="stats-container">
        <div class="stat-card stat-total">
            <div class="stat-number">${stats.total}</div>
            <div>Total Catatan</div>
        </div>
        <div class="stat-card stat-positive">
            <div class="stat-number">${stats.positive}</div>
            <div>Perilaku Positif</div>
        </div>
        <div class="stat-card stat-negative">
            <div class="stat-number">${stats.negative}</div>
            <div>Perlu Perhatian</div>
        </div>
        <div class="stat-card stat-followup">
            <div class="stat-number">${stats.followUp}</div>
            <div>Tindak Lanjut</div>
        </div>
    </div>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Santri</th>
                    <th>Halaqah</th>
                    <th>Kategori</th>
                    <th>Tipe</th>
                    <th>Kriteria</th>
                    <th>Deskripsi</th>
                    <th>Poin</th>
                    <th>Status</th>
                    <th>Tindak Lanjut</th>
                    <th>Dicatat Oleh</th>
                </tr>
            </thead>
            <tbody>
                ${data
                  .map(
                    (record, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${record.date || "-"}</td>
                        <td class="santri-info">
                            ${record.santriName || "-"}
                            <span class="nis">NIS: ${record.santriNis || "-"}</span>
                        </td>
                        <td>${record.halaqahName || "-"}</td>
                        <td>${record.category || "-"}</td>
                        <td>
                            <span class="type-${(record.type || "").toLowerCase()}">
                                ${
                                  record.type === "POSITIVE"
                                    ? "? Positif"
                                    : record.type === "NEGATIVE"
                                      ? "?? Negatif"
                                      : record.type === "NEUTRAL"
                                        ? "? Netral"
                                        : record.type || "-"
                                }
                            </span>
                        </td>
                        <td>${record.criteriaName || "-"}</td>
                        <td class="description">${record.description || "-"}</td>
                        <td class="points-${(record.type || "").toLowerCase()}">
                            ${record.points > 0 ? "+" : ""}${record.points || 0}
                        </td>
                        <td>
                            <span class="status-active">${record.status || "ACTIVE"}</span>
                        </td>
                        <td>${record.followUpRequired ? "?? Ya" : "? Tidak"}</td>
                        <td>${record.recordedByName || "-"}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
    <div class="footer">
        <p><strong>TPQ Baitus Shuffahh</strong> - Sistem Informasi Manajemen Santri</p>
        <p>Laporan ini digenerate secara otomatis pada ${new Date().toLocaleString("id-ID")}</p>
        <p>?? info@tpqbaitusshuffahh.com | ?? +62 xxx-xxxx-xxxx</p>
    </div>
</body>
</html>`;
      };
      // Generate HTML content
      const htmlContent = createExcelHTML(records);
      // Create and download file
      const blob = new Blob([htmlContent], {
        type: "text/html;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Laporan-Perilaku-Santri-${new Date().toISOString().split("T")[0]}.html`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("?? Export completed:", records.length, "records");
      toast.success(
        `Laporan perilaku berhasil diekspor (${records.length} records)`,
      );
    } catch (error) {
      console.error("? Error exporting data:", error);
      toast.error("Gagal mengekspor data");
    }
  };
  const handleSaveBehavior = async (behaviorData: BehaviorFormData) => {
    try {
      console.log("?? Saving behavior data:", behaviorData);
      // Ensure required fields are present
      if (
        !behaviorData.santriId ||
        !behaviorData.category ||
        !behaviorData.type ||
        !behaviorData.description
      ) {
        toast.error(
          "Data tidak lengkap. Pastikan semua field wajib telah diisi.",
        );
        return;
      }
      if (editingBehavior) {
        // Update existing behavior
        const updatePayload = {
          id: editingBehavior.id,
          ...behaviorData,
          recordedBy: behaviorData.recordedBy || "admin_1", // Ensure recordedBy is present
        };
        const response = await fetch("/api/behavior", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        });
        const data = await response.json();
        if (data.success) {
          console.log("? Behavior updated successfully");
          toast.success("Catatan perilaku berhasil diperbarui");
          await loadBehaviorData(); // Reload data
        } else {
          console.error("? Failed to update behavior:", data.message);
          toast.error(data.message || "Gagal memperbarui catatan perilaku");
        }
      } else {
        // Add new behavior
        const response = await fetch("/api/behavior", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...behaviorData,
            recordedBy: behaviorData.recordedBy || "admin_1", // Mock user ID - should be from session
          }),
        });
        const data = await response.json();
        if (data.success) {
          console.log("? Behavior created successfully");
          toast.success("Catatan perilaku berhasil ditambahkan");
          await loadBehaviorData(); // Reload data
        } else {
          console.error("? Failed to create behavior:", data.message);
          toast.error(data.message || "Gagal menambahkan catatan perilaku");
        }
      }
      setShowAddModal(false);
      setEditingBehavior(null);
    } catch (error) {
      console.error("? Error saving behavior:", error);
      toast.error("Gagal menyimpan catatan perilaku");
    }
  };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Evaluasi Perilaku Santri
            </h1>
            <p className="text-gray-600">
              Pantau dan evaluasi perkembangan akhlaq santri
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleAnalytics}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <div className="relative group">
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleExportXLSX}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">Excel XLS (Recommended)</div>
                      <div className="text-xs text-gray-500">
                        Template modern & cantik
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">Laporan HTML</div>
                      <div className="text-xs text-gray-500">
                        Untuk preview & print
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">Data CSV</div>
                      <div className="text-xs text-gray-500">
                        Format sederhana
                      </div>
                    </div>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleTestExport}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">?? Test Export</div>
                      <div className="text-xs text-gray-500">
                        Debug Excel export
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <Button onClick={handleAddBehavior}>
              <Plus className="h-4 w-4 mr-2" />
              Catat Perilaku
            </Button>
          </div>
        </div>
        {/* Date Selector */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">
                  Tanggal:
                </label>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Catatan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {behaviorStats.totalRecords}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Perilaku Positif
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {behaviorStats.positiveCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Perlu Perhatian
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {behaviorStats.negativeCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tindak Lanjut
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {behaviorStats.followUpRequired}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari santri, kriteria, atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="AKHLAQ">Akhlaq</option>
                  <option value="IBADAH">Ibadah</option>
                  <option value="ACADEMIC">Akademik</option>
                  <option value="SOCIAL">Sosial</option>
                  <option value="DISCIPLINE">Disiplin</option>
                  <option value="LEADERSHIP">Kepemimpinan</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="POSITIVE">Positif</option>
                  <option value="NEGATIVE">Negatif</option>
                  <option value="NEUTRAL">Netral</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Semua Level</option>
                  <option value="LOW">Rendah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="CRITICAL">Kritis</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Behavior Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Catatan Perilaku - {formatBehaviorDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Santri
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Kriteria
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Tipe
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Poin
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Waktu
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.santriName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.santriNis}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.criteriaName}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {record.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorCategoryColor(record.category)}`}
                        >
                          {getBehaviorCategoryText(record.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorTypeColor(record.type)}`}
                        >
                          {getBehaviorTypeText(record.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${record.points > 0 ? "text-green-600" : record.points < 0 ? "text-red-600" : "text-gray-600"}`}
                        >
                          {record.points > 0 ? "+" : ""}
                          {record.points}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {formatBehaviorTime(record.time)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getBehaviorStatusColor(record.status)}`}
                        >
                          {getBehaviorStatusText(record.status)}
                        </span>
                        {record.followUpRequired && (
                          <div className="flex items-center mt-1">
                            <Bell className="h-3 w-3 text-yellow-600 mr-1" />
                            <span className="text-xs text-yellow-600">
                              Tindak Lanjut
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBehavior(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBehavior(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada catatan perilaku
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ||
                    categoryFilter !== "all" ||
                    typeFilter !== "all" ||
                    severityFilter !== "all"
                      ? "Tidak ada catatan yang sesuai dengan filter"
                      : "Belum ada catatan perilaku untuk tanggal ini"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Modal Form Catat Perilaku */}
        <BehaviorAssessmentForm
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingBehavior(null);
          }}
          onSave={handleSaveBehavior}
          editData={editingBehavior}
        />
        {/* Modal Detail Perilaku */}
        {showDetailModal && selectedBehavior && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-medium mb-6">
                Detail Catatan Perilaku
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Santri
                    </label>
                    <p className="text-gray-900">
                      {selectedBehavior.santriName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      NIS
                    </label>
                    <p className="text-gray-900">
                      {selectedBehavior.santriNis}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Halaqah
                  </label>
                  <p className="text-gray-900">
                    {selectedBehavior.halaqahName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Kategori
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getBehaviorCategoryColor(selectedBehavior.category)}`}
                    >
                      {getBehaviorCategoryText(selectedBehavior.category)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tipe
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getBehaviorTypeColor(selectedBehavior.type)}`}
                    >
                      {getBehaviorTypeText(selectedBehavior.type)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Kriteria
                  </label>
                  <p className="text-gray-900">
                    {selectedBehavior.criteriaName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Deskripsi
                  </label>
                  <p className="text-gray-900">
                    {selectedBehavior.description}
                  </p>
                </div>
                {selectedBehavior.context && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Konteks
                    </label>
                    <p className="text-gray-900">{selectedBehavior.context}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Poin
                    </label>
                    <p
                      className={`font-medium ${selectedBehavior.points > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {selectedBehavior.points > 0 ? "+" : ""}
                      {selectedBehavior.points}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tanggal
                    </label>
                    <p className="text-gray-900">{selectedBehavior.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Waktu
                    </label>
                    <p className="text-gray-900">{selectedBehavior.time}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Dicatat oleh
                  </label>
                  <p className="text-gray-900">
                    {selectedBehavior.recordedByName}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditBehavior(selectedBehavior);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

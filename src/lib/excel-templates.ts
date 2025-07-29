import { ExcelColumn, ExcelExportOptions, exportToExcel } from "./excel-export";
import * as XLSX from "xlsx";

// Modern color scheme untuk template Excel
export const MODERN_COLORS = {
  // Primary colors
  primary: "FF0F172A", // Slate 900 - Dark header
  primaryLight: "FF334155", // Slate 700 - Sub header
  secondary: "FF0EA5E9", // Sky 500 - Accent
  secondaryLight: "FF7DD3FC", // Sky 300 - Light accent

  // Status colors
  success: "FF10B981", // Emerald 500
  successLight: "FF6EE7B7", // Emerald 300
  warning: "FFF59E0B", // Amber 500
  warningLight: "FFFCD34D", // Amber 300
  danger: "FFEF4444", // Red 500
  dangerLight: "FFFC8181", // Red 300
  info: "FF3B82F6", // Blue 500
  infoLight: "FF93C5FD", // Blue 300

  // Neutral colors
  white: "FFFFFFFF",
  gray50: "FFF8FAFC", // Very light background
  gray100: "FFF1F5F9", // Light background
  gray200: "FFE2E8F0", // Border
  gray300: "FFCBD5E1", // Light border
  gray400: "FF94A3B8", // Muted text
  gray500: "FF64748B", // Secondary text
  gray600: "FF475569", // Primary text
  gray700: "FF334155", // Dark text
  gray800: "FF1E293B", // Very dark text
  gray900: "FF0F172A", // Darkest text

  // Gradient colors for charts
  gradient1: "FF8B5CF6", // Purple 500
  gradient2: "FFEC4899", // Pink 500
  gradient3: "FF06B6D4", // Cyan 500
  gradient4: "FF84CC16", // Lime 500
  gradient5: "FFF97316", // Orange 500
};

// Modern Excel styles
export const MODERN_STYLES = {
  // Header styles
  mainHeader: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.white },
      size: 12,
      name: "Segoe UI",
    },
    fill: { fgColor: { rgb: MODERN_COLORS.primary } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: MODERN_COLORS.primary } },
      bottom: { style: "medium", color: { rgb: MODERN_COLORS.primary } },
      left: { style: "medium", color: { rgb: MODERN_COLORS.primary } },
      right: { style: "medium", color: { rgb: MODERN_COLORS.primary } },
    },
  },

  subHeader: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.white },
      size: 11,
      name: "Segoe UI",
    },
    fill: { fgColor: { rgb: MODERN_COLORS.primaryLight } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray300 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray300 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray300 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray300 } },
    },
  },

  // Title styles
  title: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.primary },
      size: 18,
      name: "Segoe UI",
    },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: MODERN_COLORS.gray50 } },
  },

  subtitle: {
    font: { color: { rgb: MODERN_COLORS.gray600 }, size: 12, name: "Segoe UI" },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: MODERN_COLORS.gray50 } },
  },

  // Data styles
  dataEven: {
    font: { color: { rgb: MODERN_COLORS.gray700 }, size: 10, name: "Segoe UI" },
    fill: { fgColor: { rgb: MODERN_COLORS.white } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
    },
  },

  dataOdd: {
    font: { color: { rgb: MODERN_COLORS.gray700 }, size: 10, name: "Segoe UI" },
    fill: { fgColor: { rgb: MODERN_COLORS.gray50 } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
    },
  },

  // Status styles
  statusSuccess: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.white },
      size: 10,
      name: "Segoe UI",
    },
    fill: { fgColor: { rgb: MODERN_COLORS.success } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
    },
  },

  statusWarning: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.white },
      size: 10,
      name: "Segoe UI",
    },
    fill: { fgColor: { rgb: MODERN_COLORS.warning } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
    },
  },

  statusDanger: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.white },
      size: 10,
      name: "Segoe UI",
    },
    fill: { fgColor: { rgb: MODERN_COLORS.danger } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
    },
  },

  statusInfo: {
    font: {
      bold: true,
      color: { rgb: MODERN_COLORS.white },
      size: 10,
      name: "Segoe UI",
    },
    fill: { fgColor: { rgb: MODERN_COLORS.info } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      bottom: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      left: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
      right: { style: "thin", color: { rgb: MODERN_COLORS.gray200 } },
    },
  },
};

// Interface untuk modern Excel export
export interface ModernExcelSheet {
  name: string;
  title: string;
  subtitle?: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  summary?: {
    title: string;
    data: { label: string; value: string | number | boolean; type?: string }[];
  };
}

export interface ModernExcelExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  sheets: ModernExcelSheet[];
  includeTimestamp?: boolean;
  includeSummary?: boolean;
}

// Modern Excel Exporter Class
export class ModernExcelExporter {
  private workbook: XLSX.WorkBook;

  constructor() {
    this.workbook = XLSX.utils.book_new();
  }

  public exportData(options: ModernExcelExportOptions): void {
    // Create cover sheet
    this.createCoverSheet(options);

    // Create data sheets
    options.sheets.forEach((sheet) => {
      this.createDataSheet(sheet);
    });

    // Download file
    this.downloadFile(options.filename);
  }

  private createCoverSheet(options: ModernExcelExportOptions): void {
    const wsData: (string | number | boolean)[][] = [];

    // Add header space
    wsData.push([""]);
    wsData.push([""]);

    // Add main title
    wsData.push([options.title]);

    // Add subtitle
    if (options.subtitle) {
      wsData.push([options.subtitle]);
    }

    // Add timestamp
    if (options.includeTimestamp !== false) {
      wsData.push([""]);
      wsData.push([
        `Diekspor pada: ${new Date().toLocaleString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      ]);
    }

    // Add summary info
    wsData.push([""]);
    wsData.push(["RINGKASAN LAPORAN"]);
    wsData.push([""]);

    options.sheets.forEach((sheet, index) => {
      wsData.push([
        `${index + 1}. ${sheet.title}`,
        `${sheet.data.length} records`,
      ]);
    });

    // Add footer
    wsData.push([""]);
    wsData.push([""]);
    wsData.push(["TPQ Baitus Shuffah - Sistem Informasi Manajemen"]);
    wsData.push(["Generated by Modern Excel Export System"]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles
    this.applyCoverStyles(worksheet, options);

    // Add to workbook
    XLSX.utils.book_append_sheet(this.workbook, worksheet, "Cover");
  }

  private applyCoverStyles(
    worksheet: XLSX.WorkSheet,
    options: ModernExcelExportOptions,
  ): void {
    // Set column widths
    worksheet["!cols"] = [{ wch: 50 }, { wch: 20 }];

    // Apply title style
    if (worksheet["A3"]) {
      worksheet["A3"].s = MODERN_STYLES.title;
    }

    // Apply subtitle style
    if (worksheet["A4"] && options.subtitle) {
      worksheet["A4"].s = MODERN_STYLES.subtitle;
    }
  }

  private createDataSheet(sheet: ModernExcelSheet): void {
    const wsData: (string | number | boolean)[][] = [];
    let currentRow = 0;

    // Add sheet title
    wsData.push([sheet.title]);
    currentRow++;

    // Add subtitle if provided
    if (sheet.subtitle) {
      wsData.push([sheet.subtitle]);
      currentRow++;
    }

    // Add empty row
    wsData.push([]);
    currentRow++;

    // Add headers
    const headers = sheet.columns.map((col) => col.title);
    wsData.push(headers);
    const headerRow = currentRow;
    currentRow++;

    // Add data rows
    sheet.data.forEach((item) => {
      const row = sheet.columns.map((col) => {
        const value = this.getNestedValue(item, col.key);
        return this.formatCellValue(value, col.type);
      });
      wsData.push(row);
      currentRow++;
    });

    // Add summary if provided
    if (sheet.summary) {
      wsData.push([]);
      wsData.push([sheet.summary.title]);
      currentRow += 2;

      sheet.summary.data.forEach((item) => {
        wsData.push([item.label, item.value]);
        currentRow++;
      });
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles
    this.applyDataSheetStyles(worksheet, sheet, headerRow);

    // Add to workbook
    XLSX.utils.book_append_sheet(this.workbook, worksheet, sheet.name);
  }

  private applyDataSheetStyles(
    worksheet: XLSX.WorkSheet,
    sheet: ModernExcelSheet,
    headerRow: number,
  ): void {
    // Set column widths
    const colWidths = sheet.columns.map((col) => ({ wch: col.width || 15 }));
    worksheet["!cols"] = colWidths;

    // Apply title style
    if (worksheet["A1"]) {
      worksheet["A1"].s = MODERN_STYLES.title;
    }

    // Apply subtitle style
    if (worksheet["A2"] && sheet.subtitle) {
      worksheet["A2"].s = MODERN_STYLES.subtitle;
    }

    // Apply header styles
    sheet.columns.forEach((col, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = MODERN_STYLES.mainHeader;
      }
    });

    // Apply data styles with alternating colors
    sheet.data.forEach((item, rowIndex) => {
      const isEven = rowIndex % 2 === 0;

      sheet.columns.forEach((col, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({
          r: headerRow + 1 + rowIndex,
          c: colIndex,
        });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = this.getCellStyle(col, item[col.key], isEven);
        }
      });
    });
  }

  private getCellStyle(column: ExcelColumn, value: any, isEven: boolean): any {
    if (column.type === "status") {
      return this.getStatusStyle(value);
    }

    return isEven ? MODERN_STYLES.dataEven : MODERN_STYLES.dataOdd;
  }

  private getStatusStyle(status: string): any {
    const statusLower = status?.toLowerCase();
    if (
      [
        "active",
        "aktif",
        "paid",
        "lunas",
        "approved",
        "disetujui",
        "excellent",
        "a",
      ].includes(statusLower)
    ) {
      return MODERN_STYLES.statusSuccess;
    } else if (
      [
        "inactive",
        "nonaktif",
        "unpaid",
        "belum lunas",
        "rejected",
        "ditolak",
        "poor",
        "e",
      ].includes(statusLower)
    ) {
      return MODERN_STYLES.statusDanger;
    } else if (
      [
        "pending",
        "menunggu",
        "review",
        "proses",
        "needs attention",
        "d",
      ].includes(statusLower)
    ) {
      return MODERN_STYLES.statusWarning;
    }
    return MODERN_STYLES.statusInfo;
  }

  private formatCellValue(value: any, type?: string): any {
    if (value === null || value === undefined) return "";

    switch (type) {
      case "date":
        return value instanceof Date ? value : new Date(value);
      case "number":
      case "currency":
        return typeof value === "number" ? value : parseFloat(value) || 0;
      default:
        return String(value);
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private downloadFile(filename: string): void {
    try {
      // Write workbook with proper options
      const wbout = XLSX.write(this.workbook, {
        bookType: "xlsx",
        type: "array",
        compression: true,
      });

      // Create blob with correct MIME type for Excel files
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log("✅ Excel file downloaded successfully:", filename);
    } catch (error) {
      console.error("❌ Error downloading Excel file:", error);
      throw error;
    }
  }
}

// Helper function untuk export modern Excel
export const exportModernExcel = (options: ModernExcelExportOptions): void => {
  const exporter = new ModernExcelExporter();
  exporter.exportData(options);
};

// Template untuk Behavior Analytics
export const createBehaviorAnalyticsTemplate = (
  analyticsData: any,
  filters: any,
): ModernExcelExportOptions => {
  const sheets: ModernExcelSheet[] = [];

  // Sheet 1: Overview & Summary
  if (analyticsData.overview) {
    sheets.push({
      name: "Overview",
      title: "RINGKASAN ANALYTICS PERILAKU",
      subtitle: `Periode: ${filters.period || "MONTHLY"} | Halaqah: ${filters.halaqah === "all" ? "Semua" : filters.halaqah} | Kategori: ${filters.category === "all" ? "Semua" : filters.category}`,
      columns: [
        { key: "metric", title: "METRIK", width: 25, type: "text" },
        { key: "value", title: "NILAI", width: 15, type: "number" },
        { key: "description", title: "KETERANGAN", width: 40, type: "text" },
        { key: "status", title: "STATUS", width: 15, type: "status" },
      ],
      data: [
        {
          metric: "Total Santri Aktif",
          value: analyticsData.overview.totalStudents || 0,
          description: "Jumlah santri yang terdaftar dan aktif dalam sistem",
          status:
            analyticsData.overview.totalStudents > 0 ? "EXCELLENT" : "POOR",
        },
        {
          metric: "Total Record Perilaku",
          value: analyticsData.overview.totalRecords || 0,
          description:
            "Jumlah catatan perilaku yang tercatat dalam periode ini",
          status:
            analyticsData.overview.totalRecords > 10
              ? "EXCELLENT"
              : analyticsData.overview.totalRecords > 5
                ? "GOOD"
                : "NEEDS ATTENTION",
        },
        {
          metric: "Rata-rata Skor Perilaku",
          value: analyticsData.overview.averageScore || 0,
          description: "Skor rata-rata perilaku santri (skala 0-100)",
          status:
            analyticsData.overview.averageScore >= 80
              ? "EXCELLENT"
              : analyticsData.overview.averageScore >= 70
                ? "GOOD"
                : analyticsData.overview.averageScore >= 60
                  ? "NEEDS ATTENTION"
                  : "POOR",
        },
        {
          metric: "Santri Mengalami Peningkatan",
          value: analyticsData.overview.improvingStudents || 0,
          description: "Jumlah santri yang menunjukkan tren perilaku positif",
          status:
            analyticsData.overview.improvingStudents > 0
              ? "EXCELLENT"
              : "NEEDS ATTENTION",
        },
        {
          metric: "Santri Perlu Perhatian",
          value: analyticsData.overview.needsAttention || 0,
          description: "Jumlah santri dengan skor perilaku di bawah 60",
          status:
            analyticsData.overview.needsAttention === 0
              ? "EXCELLENT"
              : analyticsData.overview.needsAttention <= 2
                ? "GOOD"
                : "NEEDS ATTENTION",
        },
        {
          metric: "Santri Perilaku Sempurna",
          value: analyticsData.overview.perfectBehavior || 0,
          description: "Jumlah santri dengan skor perilaku 95 atau lebih",
          status:
            analyticsData.overview.perfectBehavior > 0 ? "EXCELLENT" : "GOOD",
        },
      ],
      summary: {
        title: "KESIMPULAN ANALYTICS",
        data: [
          {
            label: "Tingkat Partisipasi",
            value: `${Math.round((analyticsData.overview.totalRecords / analyticsData.overview.totalStudents) * 100) || 0}%`,
          },
          {
            label: "Indeks Perilaku Positif",
            value:
              analyticsData.overview.averageScore >= 75
                ? "BAIK"
                : analyticsData.overview.averageScore >= 60
                  ? "CUKUP"
                  : "PERLU PERBAIKAN",
          },
          {
            label: "Rekomendasi",
            value:
              analyticsData.overview.needsAttention > 0
                ? "Fokus pada santri yang perlu perhatian"
                : "Pertahankan kualitas pembinaan",
          },
        ],
      },
    });
  }

  // Sheet 2: Category Statistics
  if (analyticsData.categoryStats && analyticsData.categoryStats.length > 0) {
    sheets.push({
      name: "Category Stats",
      title: "STATISTIK PER KATEGORI PERILAKU",
      subtitle:
        "Breakdown perilaku santri berdasarkan kategori akhlaq, ibadah, akademik, sosial, disiplin, dan kepemimpinan",
      columns: [
        { key: "category", title: "KATEGORI", width: 20, type: "text" },
        {
          key: "categoryName",
          title: "NAMA KATEGORI",
          width: 25,
          type: "text",
        },
        { key: "count", title: "TOTAL RECORD", width: 15, type: "number" },
        {
          key: "positiveCount",
          title: "PERILAKU POSITIF",
          width: 18,
          type: "number",
        },
        {
          key: "negativeCount",
          title: "PERILAKU NEGATIF",
          width: 18,
          type: "number",
        },
        {
          key: "averagePoints",
          title: "RATA-RATA POIN",
          width: 18,
          type: "number",
        },
        {
          key: "positiveRate",
          title: "TINGKAT POSITIF",
          width: 18,
          type: "text",
        },
        { key: "status", title: "STATUS KATEGORI", width: 18, type: "status" },
      ],
      data: analyticsData.categoryStats.map((cat: any) => {
        const positiveRate =
          cat.count > 0 ? Math.round((cat.positiveCount / cat.count) * 100) : 0;
        const categoryNames: { [key: string]: string } = {
          AKHLAQ: "Akhlaq & Moral",
          IBADAH: "Ibadah & Spiritual",
          ACADEMIC: "Akademik & Pembelajaran",
          SOCIAL: "Sosial & Interaksi",
          DISCIPLINE: "Disiplin & Tata Tertib",
          LEADERSHIP: "Kepemimpinan & Inisiatif",
        };

        return {
          category: cat.category,
          categoryName: categoryNames[cat.category] || cat.category,
          count: cat.count,
          positiveCount: cat.positiveCount,
          negativeCount: cat.negativeCount,
          averagePoints: cat.averagePoints,
          positiveRate: `${positiveRate}%`,
          status:
            positiveRate >= 80
              ? "EXCELLENT"
              : positiveRate >= 60
                ? "GOOD"
                : positiveRate >= 40
                  ? "NEEDS ATTENTION"
                  : "POOR",
        };
      }),
      summary: {
        title: "RINGKASAN KATEGORI",
        data: [
          {
            label: "Kategori Terbaik",
            value:
              analyticsData.categoryStats.reduce(
                (best: any, cat: any) =>
                  cat.averagePoints > (best?.averagePoints || -999)
                    ? cat
                    : best,
                null,
              )?.category || "N/A",
          },
          {
            label: "Kategori Perlu Perhatian",
            value:
              analyticsData.categoryStats.reduce(
                (worst: any, cat: any) =>
                  cat.averagePoints < (worst?.averagePoints || 999)
                    ? cat
                    : worst,
                null,
              )?.category || "N/A",
          },
          {
            label: "Total Perilaku Positif",
            value: analyticsData.categoryStats.reduce(
              (sum: number, cat: any) => sum + cat.positiveCount,
              0,
            ),
          },
          {
            label: "Total Perilaku Negatif",
            value: analyticsData.categoryStats.reduce(
              (sum: number, cat: any) => sum + cat.negativeCount,
              0,
            ),
          },
        ],
      },
    });
  }

  // Sheet 3: Top Performers
  if (analyticsData.topPerformers && analyticsData.topPerformers.length > 0) {
    sheets.push({
      name: "Top Performers",
      title: "SANTRI BERPRESTASI TERBAIK",
      subtitle:
        "Daftar santri dengan performa perilaku terbaik berdasarkan skor dan konsistensi",
      columns: [
        { key: "rank", title: "PERINGKAT", width: 12, type: "number" },
        { key: "santriName", title: "NAMA SANTRI", width: 25, type: "text" },
        {
          key: "totalRecords",
          title: "TOTAL RECORD",
          width: 15,
          type: "number",
        },
        {
          key: "positiveCount",
          title: "PERILAKU POSITIF",
          width: 18,
          type: "number",
        },
        {
          key: "negativeCount",
          title: "PERILAKU NEGATIF",
          width: 18,
          type: "number",
        },
        { key: "totalPoints", title: "TOTAL POIN", width: 15, type: "number" },
        {
          key: "averagePoints",
          title: "RATA-RATA POIN",
          width: 18,
          type: "number",
        },
        {
          key: "behaviorScore",
          title: "SKOR PERILAKU",
          width: 18,
          type: "number",
        },
        {
          key: "characterGrade",
          title: "GRADE KARAKTER",
          width: 18,
          type: "status",
        },
        { key: "trend", title: "TREN", width: 15, type: "status" },
        { key: "achievement", title: "PENCAPAIAN", width: 30, type: "text" },
      ],
      data: analyticsData.topPerformers.map((student: any, index: number) => ({
        rank: index + 1,
        santriName: student.santriName,
        totalRecords: student.totalRecords,
        positiveCount: student.positiveCount,
        negativeCount: student.negativeCount,
        totalPoints: student.totalPoints,
        averagePoints: student.averagePoints?.toFixed(2),
        behaviorScore: student.behaviorScore,
        characterGrade: student.characterGrade,
        trend: student.trend?.toUpperCase(),
        achievement:
          student.behaviorScore >= 90
            ? "Santri Teladan"
            : student.behaviorScore >= 80
              ? "Santri Berprestasi"
              : student.behaviorScore >= 70
                ? "Santri Baik"
                : "Santri Cukup",
      })),
      summary: {
        title: "ANALISIS TOP PERFORMERS",
        data: [
          {
            label: "Santri Terbaik",
            value: analyticsData.topPerformers[0]?.santriName || "N/A",
          },
          {
            label: "Skor Tertinggi",
            value: analyticsData.topPerformers[0]?.behaviorScore || 0,
          },
          {
            label: "Rata-rata Skor Top 5",
            value:
              Math.round(
                analyticsData.topPerformers
                  .slice(0, 5)
                  .reduce((sum: number, s: any) => sum + s.behaviorScore, 0) /
                  Math.min(5, analyticsData.topPerformers.length),
              ) || 0,
          },
          {
            label: "Santri Grade A",
            value: analyticsData.topPerformers.filter(
              (s: any) => s.characterGrade === "A",
            ).length,
          },
        ],
      },
    });
  }

  // Sheet 4: Needs Attention
  if (analyticsData.needsAttention && analyticsData.needsAttention.length > 0) {
    sheets.push({
      name: "Needs Attention",
      title: "SANTRI YANG PERLU PERHATIAN KHUSUS",
      subtitle:
        "Daftar santri dengan skor perilaku rendah yang memerlukan bimbingan dan perhatian lebih",
      columns: [
        { key: "priority", title: "PRIORITAS", width: 12, type: "status" },
        { key: "santriName", title: "NAMA SANTRI", width: 25, type: "text" },
        {
          key: "behaviorScore",
          title: "SKOR PERILAKU",
          width: 18,
          type: "number",
        },
        {
          key: "characterGrade",
          title: "GRADE KARAKTER",
          width: 18,
          type: "status",
        },
        { key: "trend", title: "TREN", width: 15, type: "status" },
        { key: "mainIssues", title: "MASALAH UTAMA", width: 40, type: "text" },
        {
          key: "recommendation",
          title: "REKOMENDASI TINDAKAN",
          width: 40,
          type: "text",
        },
        { key: "urgency", title: "TINGKAT URGENSI", width: 18, type: "status" },
      ],
      data: analyticsData.needsAttention.map((student: any, index: number) => {
        const urgency =
          student.behaviorScore < 40
            ? "CRITICAL"
            : student.behaviorScore < 50
              ? "HIGH"
              : "MEDIUM";
        const priority = index < 3 ? "TINGGI" : index < 6 ? "SEDANG" : "RENDAH";

        return {
          priority,
          santriName: student.santriName,
          behaviorScore: student.behaviorScore,
          characterGrade: student.characterGrade,
          trend: student.trend?.toUpperCase(),
          mainIssues: Array.isArray(student.issues)
            ? student.issues.join(", ")
            : "Perlu evaluasi lebih lanjut",
          recommendation:
            student.behaviorScore < 40
              ? "Konseling intensif & monitoring harian"
              : student.behaviorScore < 50
                ? "Bimbingan khusus & evaluasi mingguan"
                : "Pendampingan & motivasi berkelanjutan",
          urgency,
        };
      }),
      summary: {
        title: "RENCANA TINDAK LANJUT",
        data: [
          {
            label: "Santri Prioritas Tinggi",
            value: analyticsData.needsAttention.filter(
              (s: any) => s.behaviorScore < 50,
            ).length,
          },
          {
            label: "Perlu Konseling Segera",
            value: analyticsData.needsAttention.filter(
              (s: any) => s.behaviorScore < 40,
            ).length,
          },
          {
            label: "Target Peningkatan",
            value: "Minimal 10 poin dalam 1 bulan",
          },
          {
            label: "Frekuensi Evaluasi",
            value: "Mingguan untuk prioritas tinggi",
          },
        ],
      },
    });
  }

  // Sheet 5: Halaqah Comparison
  if (
    analyticsData.halaqahComparison &&
    analyticsData.halaqahComparison.length > 0
  ) {
    sheets.push({
      name: "Halaqah Comparison",
      title: "PERBANDINGAN PERFORMA ANTAR HALAQAH",
      subtitle:
        "Analisis komparatif kinerja perilaku santri di setiap halaqah untuk evaluasi efektivitas pembinaan",
      columns: [
        { key: "rank", title: "PERINGKAT", width: 12, type: "number" },
        { key: "halaqahName", title: "NAMA HALAQAH", width: 20, type: "text" },
        { key: "musyrifName", title: "NAMA MUSYRIF", width: 25, type: "text" },
        {
          key: "studentCount",
          title: "JUMLAH SANTRI",
          width: 18,
          type: "number",
        },
        {
          key: "averageScore",
          title: "RATA-RATA SKOR",
          width: 18,
          type: "number",
        },
        {
          key: "positiveRate",
          title: "TINGKAT POSITIF",
          width: 18,
          type: "text",
        },
        {
          key: "performance",
          title: "KATEGORI PERFORMA",
          width: 20,
          type: "status",
        },
        {
          key: "recommendation",
          title: "REKOMENDASI",
          width: 35,
          type: "text",
        },
      ],
      data: analyticsData.halaqahComparison
        .sort((a: any, b: any) => b.averageScore - a.averageScore)
        .map((halaqah: any, index: number) => {
          const performance =
            halaqah.averageScore >= 85
              ? "EXCELLENT"
              : halaqah.averageScore >= 75
                ? "GOOD"
                : halaqah.averageScore >= 65
                  ? "NEEDS ATTENTION"
                  : "POOR";

          const recommendation =
            performance === "EXCELLENT"
              ? "Pertahankan kualitas & jadikan role model"
              : performance === "GOOD"
                ? "Tingkatkan konsistensi pembinaan"
                : performance === "NEEDS ATTENTION"
                  ? "Evaluasi metode & intensifkan bimbingan"
                  : "Perlu intervensi segera & pelatihan musyrif";

          return {
            rank: index + 1,
            halaqahName: halaqah.halaqahName,
            musyrifName: halaqah.musyrifName || "Belum ditentukan",
            studentCount: halaqah.studentCount,
            averageScore: halaqah.averageScore,
            positiveRate: `${halaqah.positiveRate}%`,
            performance,
            recommendation,
          };
        }),
      summary: {
        title: "ANALISIS PERBANDINGAN HALAQAH",
        data: [
          {
            label: "Halaqah Terbaik",
            value:
              analyticsData.halaqahComparison.reduce(
                (best: any, h: any) =>
                  h.averageScore > (best?.averageScore || 0) ? h : best,
                {},
              )?.halaqahName || "N/A",
          },
          {
            label: "Skor Tertinggi",
            value: Math.max(
              ...analyticsData.halaqahComparison.map(
                (h: any) => h.averageScore,
              ),
            ),
          },
          {
            label: "Rata-rata Semua Halaqah",
            value: Math.round(
              analyticsData.halaqahComparison.reduce(
                (sum: number, h: any) => sum + h.averageScore,
                0,
              ) / analyticsData.halaqahComparison.length,
            ),
          },
          {
            label: "Halaqah Perlu Perhatian",
            value: analyticsData.halaqahComparison.filter(
              (h: any) => h.averageScore < 70,
            ).length,
          },
        ],
      },
    });
  }

  return {
    filename: `behavior-analytics-${filters.period?.toLowerCase() || "monthly"}-${filters.halaqah === "all" ? "semua-halaqah" : `halaqah-${filters.halaqah}`}-${filters.category === "all" ? "semua-kategori" : filters.category?.toLowerCase()}`,
    title: "LAPORAN ANALYTICS PERILAKU SANTRI",
    subtitle: `TPQ Baitus Shuffah - Sistem Monitoring & Evaluasi Akhlaq`,
    sheets,
    includeTimestamp: true,
    includeSummary: true,
  };
};

// Template untuk Behavior Records - Laporan Lengkap dan Detail
export const createBehaviorRecordsTemplate = (
  behaviorData: any[],
): ModernExcelExportOptions => {
  // Ensure we have valid data
  const validData = behaviorData || [];

  // Calculate comprehensive statistics with safe data access
  const stats = {
    total: validData.length,
    positive: validData.filter((r) => r?.type === "POSITIVE").length,
    negative: validData.filter((r) => r?.type === "NEGATIVE").length,
    neutral: validData.filter((r) => r?.type === "NEUTRAL").length,
    followUp: validData.filter(
      (r) => r?.followUpRequired === true || r?.follow_up_required === true,
    ).length,
    parentNotified: validData.filter(
      (r) => r?.parentNotified === true || r?.parent_notified === true,
    ).length,
    avgPoints:
      validData.length > 0
        ? Math.round(
            validData.reduce((sum, r) => sum + (r?.points || 0), 0) /
              validData.length,
          )
        : 0,
    bySeverity: {
      low: validData.filter((r) => r?.severity === "LOW").length,
      medium: validData.filter((r) => r?.severity === "MEDIUM").length,
      high: validData.filter((r) => r?.severity === "HIGH").length,
      critical: validData.filter((r) => r?.severity === "CRITICAL").length,
    },
    byCategory: {
      akhlaq: validData.filter((r) => r?.category === "AKHLAQ").length,
      ibadah: validData.filter((r) => r?.category === "IBADAH").length,
      academic: validData.filter((r) => r?.category === "ACADEMIC").length,
      social: validData.filter((r) => r?.category === "SOCIAL").length,
      discipline: validData.filter((r) => r?.category === "DISCIPLINE").length,
      leadership: validData.filter((r) => r?.category === "LEADERSHIP").length,
    },
    byStatus: {
      active: validData.filter((r) => r?.status === "ACTIVE").length,
      resolved: validData.filter((r) => r?.status === "RESOLVED").length,
      followUp: validData.filter((r) => r?.status === "FOLLOW_UP").length,
      escalated: validData.filter((r) => r?.status === "ESCALATED").length,
    },
  };

  return {
    filename: "laporan-perilaku-santri-tpq-baitus-shuffah",
    title: "LAPORAN PERILAKU SANTRI TPQ BAITUS SHUFFAH",
    subtitle: "Sistem Monitoring & Evaluasi Akhlaq - Catatan Perilaku Lengkap",
    sheets: [
      // Sheet 1: Data Detail Lengkap
      {
        name: "Data Perilaku Lengkap",
        title: "CATATAN PERILAKU SANTRI - DATA LENGKAP",
        subtitle: `Total: ${stats.total} catatan | Positif: ${stats.positive} | Negatif: ${stats.negative} | Netral: ${stats.neutral} | Tindak Lanjut: ${stats.followUp}`,
        columns: [
          { key: "no", title: "NO", width: 5, type: "text" },
          { key: "id", title: "ID RECORD", width: 15, type: "text" },
          { key: "date", title: "TANGGAL", width: 12, type: "date" },
          { key: "time", title: "WAKTU", width: 10, type: "text" },
          { key: "santriName", title: "NAMA SANTRI", width: 20, type: "text" },
          { key: "santriNis", title: "NIS", width: 12, type: "text" },
          { key: "santriId", title: "ID SANTRI", width: 15, type: "text" },
          { key: "halaqahName", title: "HALAQAH", width: 15, type: "text" },
          {
            key: "halaqahLevel",
            title: "LEVEL HALAQAH",
            width: 12,
            type: "text",
          },
          { key: "halaqahId", title: "ID HALAQAH", width: 15, type: "text" },
          { key: "category", title: "KATEGORI", width: 15, type: "text" },
          { key: "type", title: "TIPE", width: 12, type: "status" },
          {
            key: "severity",
            title: "TINGKAT KEPARAHAN",
            width: 15,
            type: "status",
          },
          { key: "criteriaName", title: "KRITERIA", width: 20, type: "text" },
          { key: "criteriaId", title: "ID KRITERIA", width: 15, type: "text" },
          {
            key: "description",
            title: "DESKRIPSI LENGKAP",
            width: 40,
            type: "text",
          },
          { key: "context", title: "KONTEKS SITUASI", width: 30, type: "text" },
          { key: "witnesses", title: "SAKSI", width: 25, type: "text" },
          { key: "location", title: "LOKASI", width: 15, type: "text" },
          { key: "points", title: "POIN", width: 8, type: "number" },
          { key: "status", title: "STATUS", width: 12, type: "status" },
          {
            key: "followUpRequired",
            title: "PERLU TINDAK LANJUT",
            width: 15,
            type: "text",
          },
          {
            key: "followUpDate",
            title: "TANGGAL TINDAK LANJUT",
            width: 18,
            type: "date",
          },
          {
            key: "followUpNotes",
            title: "CATATAN TINDAK LANJUT",
            width: 30,
            type: "text",
          },
          {
            key: "parentNotified",
            title: "ORTU DIBERITAHU",
            width: 15,
            type: "text",
          },
          {
            key: "parentNotifiedAt",
            title: "WAKTU PEMBERITAHUAN ORTU",
            width: 20,
            type: "datetime",
          },
          {
            key: "recordedByName",
            title: "DICATAT OLEH",
            width: 20,
            type: "text",
          },
          { key: "recordedBy", title: "ID PENCATAT", width: 15, type: "text" },
          {
            key: "recordedAt",
            title: "WAKTU PENCATATAN",
            width: 20,
            type: "datetime",
          },
          { key: "resolution", title: "RESOLUSI", width: 30, type: "text" },
          { key: "attachments", title: "LAMPIRAN", width: 25, type: "text" },
          { key: "metadata", title: "METADATA", width: 25, type: "text" },
          {
            key: "createdAt",
            title: "DIBUAT PADA",
            width: 20,
            type: "datetime",
          },
          {
            key: "updatedAt",
            title: "DIUPDATE PADA",
            width: 20,
            type: "datetime",
          },
        ],
        data: validData.map((record, index) => {
          // Handle different data structures (API response vs mock data)
          const santriName =
            record?.santri?.name ||
            record?.santriName ||
            record?.santri_name ||
            "";
          const santriNis =
            record?.santri?.nis ||
            record?.santriNis ||
            record?.santri_nis ||
            "";
          const santriId =
            record?.santriId || record?.santri?.id || record?.santri_id || "";
          const halaqahName =
            record?.halaqah?.name ||
            record?.halaqahName ||
            record?.halaqah_name ||
            "";
          const halaqahLevel =
            record?.halaqah?.level ||
            record?.halaqahLevel ||
            record?.halaqah_level ||
            "";
          const halaqahId =
            record?.halaqahId ||
            record?.halaqah?.id ||
            record?.halaqah_id ||
            "";

          return {
            no: index + 1,
            id: record.id || "",
            date: record.date || new Date().toISOString().split("T")[0],
            time: record.time || "",
            santriName,
            santriNis,
            santriId,
            halaqahName,
            halaqahLevel,
            halaqahId,
            category: record.category || "",
            type: record.type || "",
            severity: record.severity || "LOW",
            criteriaName: record.criteriaName || "",
            criteriaId: record.criteriaId || "",
            description: record.description || "",
            context: record.context || "",
            witnesses: (() => {
              if (!record.witnesses) return "";
              try {
                const witnessData =
                  typeof record.witnesses === "string"
                    ? JSON.parse(record.witnesses)
                    : record.witnesses;
                return Array.isArray(witnessData)
                  ? witnessData.join(", ")
                  : String(witnessData);
              } catch {
                return String(record.witnesses);
              }
            })(),
            location: record.location || "",
            points: record.points || 0,
            status: record.status || "ACTIVE",
            followUpRequired: record.followUpRequired ? "Ya" : "Tidak",
            followUpDate: record.followUpDate || "",
            followUpNotes: record.followUpNotes || "",
            parentNotified: record.parentNotified ? "Ya" : "Tidak",
            parentNotifiedAt: record.parentNotifiedAt || "",
            recordedByName:
              record.recordedByUser?.name ||
              record.recordedByName ||
              record.recorded_by ||
              "",
            recordedBy: record.recordedBy || record.recorded_by || "",
            recordedAt:
              record.recordedAt || record.createdAt || record.created_at || "",
            resolution: (() => {
              if (!record.resolution) return "";
              try {
                const resolutionData =
                  typeof record.resolution === "string"
                    ? JSON.parse(record.resolution)
                    : record.resolution;
                return typeof resolutionData === "object"
                  ? JSON.stringify(resolutionData)
                  : String(resolutionData);
              } catch {
                return String(record.resolution);
              }
            })(),
            attachments: Array.isArray(record.attachments)
              ? record.attachments.join(", ")
              : typeof record.attachments === "object"
                ? JSON.stringify(record.attachments)
                : record.attachments || "",
            metadata:
              typeof record.metadata === "object"
                ? JSON.stringify(record.metadata)
                : record.metadata || "",
            createdAt: record.createdAt || record.created_at || "",
            updatedAt: record.updatedAt || record.updated_at || "",
          };
        }),
        summary: {
          title: "RINGKASAN STATISTIK LENGKAP",
          data: [
            { label: "Total Catatan", value: stats.total },
            {
              label: "Perilaku Positif",
              value: `${stats.positive} (${stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%)`,
            },
            {
              label: "Perlu Perhatian",
              value: `${stats.negative} (${stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%)`,
            },
            {
              label: "Perilaku Netral",
              value: `${stats.neutral} (${stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0}%)`,
            },
            {
              label: "Memerlukan Tindak Lanjut",
              value: `${stats.followUp} catatan`,
            },
            {
              label: "Orang Tua Sudah Diberitahu",
              value: `${stats.parentNotified} catatan`,
            },
            { label: "Rata-rata Poin", value: `${stats.avgPoints} poin` },
            {
              label: "Status Keseluruhan",
              value:
                stats.positive > stats.negative
                  ? "BAIK"
                  : stats.positive === stats.negative
                    ? "CUKUP"
                    : "PERLU PERBAIKAN",
            },
          ],
        },
      },
      // Sheet 2: Analisis per Kategori
      {
        name: "Analisis Kategori",
        title: "ANALISIS PERILAKU PER KATEGORI",
        subtitle:
          "Breakdown detail perilaku santri berdasarkan kategori akhlaq, ibadah, akademik, sosial, disiplin, dan kepemimpinan",
        columns: [
          { key: "category", title: "KATEGORI", width: 20, type: "text" },
          { key: "total", title: "TOTAL CATATAN", width: 15, type: "number" },
          { key: "percentage", title: "PERSENTASE", width: 12, type: "text" },
          { key: "positive", title: "POSITIF", width: 12, type: "number" },
          { key: "negative", title: "NEGATIF", width: 12, type: "number" },
          { key: "neutral", title: "NETRAL", width: 12, type: "number" },
          {
            key: "avgPoints",
            title: "RATA-RATA POIN",
            width: 15,
            type: "number",
          },
          {
            key: "status",
            title: "STATUS KATEGORI",
            width: 15,
            type: "status",
          },
        ],
        data: [
          {
            category: "AKHLAQ",
            total: stats.byCategory.akhlaq,
            percentage: `${stats.total > 0 ? Math.round((stats.byCategory.akhlaq / stats.total) * 100) : 0}%`,
            positive: validData.filter(
              (r) => r?.category === "AKHLAQ" && r?.type === "POSITIVE",
            ).length,
            negative: validData.filter(
              (r) => r?.category === "AKHLAQ" && r?.type === "NEGATIVE",
            ).length,
            neutral: validData.filter(
              (r) => r?.category === "AKHLAQ" && r?.type === "NEUTRAL",
            ).length,
            avgPoints:
              stats.byCategory.akhlaq > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.category === "AKHLAQ")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.byCategory.akhlaq,
                  )
                : 0,
            status: stats.byCategory.akhlaq > 0 ? "AKTIF" : "TIDAK ADA DATA",
          },
          {
            category: "IBADAH",
            total: stats.byCategory.ibadah,
            percentage: `${stats.total > 0 ? Math.round((stats.byCategory.ibadah / stats.total) * 100) : 0}%`,
            positive: validData.filter(
              (r) => r?.category === "IBADAH" && r?.type === "POSITIVE",
            ).length,
            negative: validData.filter(
              (r) => r?.category === "IBADAH" && r?.type === "NEGATIVE",
            ).length,
            neutral: validData.filter(
              (r) => r?.category === "IBADAH" && r?.type === "NEUTRAL",
            ).length,
            avgPoints:
              stats.byCategory.ibadah > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.category === "IBADAH")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.byCategory.ibadah,
                  )
                : 0,
            status: stats.byCategory.ibadah > 0 ? "AKTIF" : "TIDAK ADA DATA",
          },
          {
            category: "ACADEMIC",
            total: stats.byCategory.academic,
            percentage: `${stats.total > 0 ? Math.round((stats.byCategory.academic / stats.total) * 100) : 0}%`,
            positive: validData.filter(
              (r) => r?.category === "ACADEMIC" && r?.type === "POSITIVE",
            ).length,
            negative: validData.filter(
              (r) => r?.category === "ACADEMIC" && r?.type === "NEGATIVE",
            ).length,
            neutral: validData.filter(
              (r) => r?.category === "ACADEMIC" && r?.type === "NEUTRAL",
            ).length,
            avgPoints:
              stats.byCategory.academic > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.category === "ACADEMIC")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.byCategory.academic,
                  )
                : 0,
            status: stats.byCategory.academic > 0 ? "AKTIF" : "TIDAK ADA DATA",
          },
          {
            category: "SOCIAL",
            total: stats.byCategory.social,
            percentage: `${stats.total > 0 ? Math.round((stats.byCategory.social / stats.total) * 100) : 0}%`,
            positive: validData.filter(
              (r) => r?.category === "SOCIAL" && r?.type === "POSITIVE",
            ).length,
            negative: validData.filter(
              (r) => r?.category === "SOCIAL" && r?.type === "NEGATIVE",
            ).length,
            neutral: validData.filter(
              (r) => r?.category === "SOCIAL" && r?.type === "NEUTRAL",
            ).length,
            avgPoints:
              stats.byCategory.social > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.category === "SOCIAL")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.byCategory.social,
                  )
                : 0,
            status: stats.byCategory.social > 0 ? "AKTIF" : "TIDAK ADA DATA",
          },
          {
            category: "DISCIPLINE",
            total: stats.byCategory.discipline,
            percentage: `${stats.total > 0 ? Math.round((stats.byCategory.discipline / stats.total) * 100) : 0}%`,
            positive: validData.filter(
              (r) => r?.category === "DISCIPLINE" && r?.type === "POSITIVE",
            ).length,
            negative: validData.filter(
              (r) => r?.category === "DISCIPLINE" && r?.type === "NEGATIVE",
            ).length,
            neutral: validData.filter(
              (r) => r?.category === "DISCIPLINE" && r?.type === "NEUTRAL",
            ).length,
            avgPoints:
              stats.byCategory.discipline > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.category === "DISCIPLINE")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.byCategory.discipline,
                  )
                : 0,
            status:
              stats.byCategory.discipline > 0 ? "AKTIF" : "TIDAK ADA DATA",
          },
          {
            category: "LEADERSHIP",
            total: stats.byCategory.leadership,
            percentage: `${stats.total > 0 ? Math.round((stats.byCategory.leadership / stats.total) * 100) : 0}%`,
            positive: validData.filter(
              (r) => r?.category === "LEADERSHIP" && r?.type === "POSITIVE",
            ).length,
            negative: validData.filter(
              (r) => r?.category === "LEADERSHIP" && r?.type === "NEGATIVE",
            ).length,
            neutral: validData.filter(
              (r) => r?.category === "LEADERSHIP" && r?.type === "NEUTRAL",
            ).length,
            avgPoints:
              stats.byCategory.leadership > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.category === "LEADERSHIP")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.byCategory.leadership,
                  )
                : 0,
            status:
              stats.byCategory.leadership > 0 ? "AKTIF" : "TIDAK ADA DATA",
          },
        ],
      },
      // Sheet 3: Analisis Tingkat Keparahan
      {
        name: "Analisis Severity",
        title: "ANALISIS TINGKAT KEPARAHAN PERILAKU",
        subtitle:
          "Breakdown perilaku berdasarkan tingkat keparahan: Low, Medium, High, Critical",
        columns: [
          {
            key: "severity",
            title: "TINGKAT KEPARAHAN",
            width: 20,
            type: "text",
          },
          { key: "total", title: "TOTAL CATATAN", width: 15, type: "number" },
          { key: "percentage", title: "PERSENTASE", width: 12, type: "text" },
          {
            key: "avgPoints",
            title: "RATA-RATA POIN",
            width: 15,
            type: "number",
          },
          { key: "description", title: "DESKRIPSI", width: 40, type: "text" },
        ],
        data: [
          {
            severity: "LOW",
            total: stats.bySeverity.low,
            percentage: `${stats.total > 0 ? Math.round((stats.bySeverity.low / stats.total) * 100) : 0}%`,
            avgPoints:
              stats.bySeverity.low > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.severity === "LOW")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.bySeverity.low,
                  )
                : 0,
            description:
              "Perilaku ringan yang tidak memerlukan tindakan khusus",
          },
          {
            severity: "MEDIUM",
            total: stats.bySeverity.medium,
            percentage: `${stats.total > 0 ? Math.round((stats.bySeverity.medium / stats.total) * 100) : 0}%`,
            avgPoints:
              stats.bySeverity.medium > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.severity === "MEDIUM")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.bySeverity.medium,
                  )
                : 0,
            description:
              "Perilaku sedang yang memerlukan perhatian dan bimbingan",
          },
          {
            severity: "HIGH",
            total: stats.bySeverity.high,
            percentage: `${stats.total > 0 ? Math.round((stats.bySeverity.high / stats.total) * 100) : 0}%`,
            avgPoints:
              stats.bySeverity.high > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.severity === "HIGH")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.bySeverity.high,
                  )
                : 0,
            description:
              "Perilaku serius yang memerlukan tindakan segera dan monitoring ketat",
          },
          {
            severity: "CRITICAL",
            total: stats.bySeverity.critical,
            percentage: `${stats.total > 0 ? Math.round((stats.bySeverity.critical / stats.total) * 100) : 0}%`,
            avgPoints:
              stats.bySeverity.critical > 0
                ? Math.round(
                    validData
                      .filter((r) => r?.severity === "CRITICAL")
                      .reduce((sum, r) => sum + (r?.points || 0), 0) /
                      stats.bySeverity.critical,
                  )
                : 0,
            description:
              "Perilaku kritis yang memerlukan eskalasi dan intervensi khusus",
          },
        ],
      },
      // Sheet 4: Status dan Tindak Lanjut
      {
        name: "Status & Tindak Lanjut",
        title: "ANALISIS STATUS DAN TINDAK LANJUT",
        subtitle:
          "Monitoring status penanganan dan tindak lanjut perilaku santri",
        columns: [
          { key: "status", title: "STATUS", width: 15, type: "text" },
          { key: "total", title: "TOTAL CATATAN", width: 15, type: "number" },
          { key: "percentage", title: "PERSENTASE", width: 12, type: "text" },
          {
            key: "description",
            title: "DESKRIPSI STATUS",
            width: 40,
            type: "text",
          },
        ],
        data: [
          {
            status: "ACTIVE",
            total: stats.byStatus.active,
            percentage: `${stats.total > 0 ? Math.round((stats.byStatus.active / stats.total) * 100) : 0}%`,
            description:
              "Catatan perilaku yang masih aktif dan memerlukan monitoring",
          },
          {
            status: "RESOLVED",
            total: stats.byStatus.resolved,
            percentage: `${stats.total > 0 ? Math.round((stats.byStatus.resolved / stats.total) * 100) : 0}%`,
            description: "Catatan perilaku yang sudah diselesaikan dengan baik",
          },
          {
            status: "FOLLOW_UP",
            total: stats.byStatus.followUp,
            percentage: `${stats.total > 0 ? Math.round((stats.byStatus.followUp / stats.total) * 100) : 0}%`,
            description:
              "Catatan perilaku yang memerlukan tindak lanjut khusus",
          },
          {
            status: "ESCALATED",
            total: stats.byStatus.escalated,
            percentage: `${stats.total > 0 ? Math.round((stats.byStatus.escalated / stats.total) * 100) : 0}%`,
            description:
              "Catatan perilaku yang sudah dieskalasi ke level yang lebih tinggi",
          },
        ],
      },
      // Sheet 5: Laporan Ringkas (untuk tampilan yang lebih sederhana)
      {
        name: "Laporan Ringkas",
        title: "LAPORAN PERILAKU SANTRI - RINGKAS",
        subtitle: "Tampilan ringkas untuk review cepat dan presentasi",
        columns: [
          { key: "no", title: "NO", width: 5, type: "text" },
          { key: "date", title: "TANGGAL", width: 12, type: "date" },
          { key: "santriName", title: "NAMA SANTRI", width: 20, type: "text" },
          { key: "santriNis", title: "NIS", width: 12, type: "text" },
          { key: "halaqahName", title: "HALAQAH", width: 15, type: "text" },
          { key: "category", title: "KATEGORI", width: 15, type: "text" },
          { key: "type", title: "TIPE", width: 12, type: "status" },
          { key: "criteriaName", title: "KRITERIA", width: 20, type: "text" },
          { key: "description", title: "DESKRIPSI", width: 35, type: "text" },
          { key: "points", title: "POIN", width: 8, type: "number" },
          { key: "status", title: "STATUS", width: 10, type: "status" },
          {
            key: "followUpRequired",
            title: "TINDAK LANJUT",
            width: 12,
            type: "text",
          },
          {
            key: "recordedByName",
            title: "DICATAT OLEH",
            width: 20,
            type: "text",
          },
        ],
        data: validData.map((record, index) => {
          // Handle different data structures consistently
          const santriName =
            record?.santri?.name ||
            record?.santriName ||
            record?.santri_name ||
            "";
          const santriNis =
            record?.santri?.nis ||
            record?.santriNis ||
            record?.santri_nis ||
            "";
          const halaqahName =
            record?.halaqah?.name ||
            record?.halaqahName ||
            record?.halaqah_name ||
            "";
          const recordedByName =
            record?.recordedByUser?.name ||
            record?.recordedByName ||
            record?.recorded_by ||
            "";

          return {
            no: index + 1,
            date: record.date || new Date().toISOString().split("T")[0],
            santriName,
            santriNis,
            halaqahName,
            category: record.category || "",
            type: record.type || "",
            criteriaName: record.criteriaName || "",
            description: record.description || "",
            points: record.points || 0,
            status: record.status || "ACTIVE",
            followUpRequired: record.followUpRequired ? "Ya" : "Tidak",
            recordedByName,
          };
        }),
        summary: {
          title: "RINGKASAN EKSEKUTIF",
          data: [
            { label: "Total Catatan Perilaku", value: stats.total },
            {
              label: "Perilaku Positif",
              value: `${stats.positive} (${stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%)`,
            },
            {
              label: "Perlu Perhatian",
              value: `${stats.negative} (${stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%)`,
            },
            {
              label: "Memerlukan Tindak Lanjut",
              value: `${stats.followUp} catatan`,
            },
            {
              label: "Orang Tua Sudah Diberitahu",
              value: `${stats.parentNotified} catatan`,
            },
            {
              label: "Evaluasi Keseluruhan",
              value:
                stats.positive > stats.negative
                  ? "SANGAT BAIK"
                  : stats.positive === stats.negative
                    ? "CUKUP BAIK"
                    : "PERLU PERBAIKAN",
            },
            {
              label: "Rekomendasi",
              value:
                stats.negative > stats.positive
                  ? "Tingkatkan bimbingan dan monitoring"
                  : "Pertahankan dan tingkatkan prestasi",
            },
          ],
        },
      },
    ],
    includeTimestamp: true,
    includeSummary: true,
  };
};

// Template untuk Data Santri
export const createSantriTemplate = (
  santriData: any[],
): ModernExcelExportOptions => {
  return {
    filename: "data-santri-tpq-baitus-shuffah",
    title: "DATA SANTRI TPQ BAITUS SHUFFAH",
    subtitle:
      "Database lengkap santri dengan informasi pribadi, wali, dan status pendaftaran",
    sheets: [
      {
        name: "Data Santri",
        title: "DATA LENGKAP SANTRI",
        subtitle: `Total: ${santriData.length} santri terdaftar`,
        columns: [
          { key: "nis", title: "NIS", width: 12, type: "text" },
          { key: "name", title: "NAMA LENGKAP", width: 25, type: "text" },
          { key: "gender", title: "JENIS KELAMIN", width: 15, type: "text" },
          { key: "birthPlace", title: "TEMPAT LAHIR", width: 20, type: "text" },
          { key: "birthDate", title: "TANGGAL LAHIR", width: 15, type: "date" },
          { key: "age", title: "USIA", width: 8, type: "number" },
          { key: "address", title: "ALAMAT LENGKAP", width: 35, type: "text" },
          { key: "phone", title: "NO. TELEPON", width: 15, type: "text" },
          { key: "email", title: "EMAIL", width: 25, type: "text" },
          { key: "waliName", title: "NAMA WALI", width: 25, type: "text" },
          { key: "waliPhone", title: "TELEPON WALI", width: 15, type: "text" },
          {
            key: "waliRelation",
            title: "HUBUNGAN WALI",
            width: 15,
            type: "text",
          },
          { key: "halaqahName", title: "HALAQAH", width: 20, type: "text" },
          { key: "level", title: "LEVEL", width: 12, type: "text" },
          { key: "status", title: "STATUS", width: 12, type: "status" },
          {
            key: "enrollmentDate",
            title: "TANGGAL MASUK",
            width: 15,
            type: "date",
          },
        ],
        data: santriData.map((santri) => ({
          ...santri,
          age: santri.birthDate
            ? Math.floor(
                (Date.now() - new Date(santri.birthDate).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000),
              )
            : "",
          waliName: santri.wali?.name || "",
          waliPhone: santri.wali?.phone || "",
          waliRelation: santri.wali?.relation || "",
          halaqahName: santri.halaqah?.name || "",
          level: santri.halaqah?.level || "",
        })),
        summary: {
          title: "RINGKASAN DATA SANTRI",
          data: [
            { label: "Total Santri", value: santriData.length },
            {
              label: "Santri Aktif",
              value: santriData.filter((s) => s.status === "ACTIVE").length,
            },
            {
              label: "Santri Laki-laki",
              value: santriData.filter((s) => s.gender === "MALE").length,
            },
            {
              label: "Santri Perempuan",
              value: santriData.filter((s) => s.gender === "FEMALE").length,
            },
          ],
        },
      },
    ],
    includeTimestamp: true,
    includeSummary: true,
  };
};

// Template untuk Data Halaqah
export const createHalaqahTemplate = (
  halaqahData: any[],
): ModernExcelExportOptions => {
  return {
    filename: "data-halaqah-tpq-baitus-shuffah",
    title: "DATA HALAQAH TPQ BAITUS SHUFFAH",
    subtitle: "Informasi lengkap halaqah, musyrif, dan kapasitas santri",
    sheets: [
      {
        name: "Data Halaqah",
        title: "DATA LENGKAP HALAQAH",
        subtitle: `Total: ${halaqahData.length} halaqah tersedia`,
        columns: [
          { key: "name", title: "NAMA HALAQAH", width: 25, type: "text" },
          { key: "description", title: "DESKRIPSI", width: 40, type: "text" },
          { key: "level", title: "LEVEL", width: 15, type: "text" },
          { key: "capacity", title: "KAPASITAS", width: 12, type: "number" },
          {
            key: "currentStudents",
            title: "SANTRI SAAT INI",
            width: 15,
            type: "number",
          },
          {
            key: "occupancyRate",
            title: "TINGKAT OKUPANSI",
            width: 18,
            type: "text",
          },
          {
            key: "musyrifName",
            title: "NAMA MUSYRIF",
            width: 25,
            type: "text",
          },
          {
            key: "musyrifPhone",
            title: "TELEPON MUSYRIF",
            width: 15,
            type: "text",
          },
          { key: "status", title: "STATUS", width: 12, type: "status" },
          {
            key: "createdAt",
            title: "TANGGAL DIBUAT",
            width: 15,
            type: "date",
          },
        ],
        data: halaqahData.map((halaqah) => {
          const occupancyRate =
            halaqah.capacity > 0
              ? Math.round((halaqah.currentStudents / halaqah.capacity) * 100)
              : 0;
          return {
            ...halaqah,
            occupancyRate: `${occupancyRate}%`,
            musyrifName: halaqah.musyrif?.name || "Belum ditentukan",
            musyrifPhone: halaqah.musyrif?.phone || "",
          };
        }),
        summary: {
          title: "RINGKASAN DATA HALAQAH",
          data: [
            { label: "Total Halaqah", value: halaqahData.length },
            {
              label: "Halaqah Aktif",
              value: halaqahData.filter((h) => h.status === "ACTIVE").length,
            },
            {
              label: "Total Kapasitas",
              value: halaqahData.reduce((sum, h) => sum + (h.capacity || 0), 0),
            },
            {
              label: "Total Santri Terdaftar",
              value: halaqahData.reduce(
                (sum, h) => sum + (h.currentStudents || 0),
                0,
              ),
            },
          ],
        },
      },
    ],
    includeTimestamp: true,
    includeSummary: true,
  };
};

// Template untuk Laporan Keuangan
export const createFinancialTemplate = (
  financialData: any,
  period: string,
): ModernExcelExportOptions => {
  return {
    filename: `laporan-keuangan-${period.toLowerCase()}`,
    title: "LAPORAN KEUANGAN TPQ BAITUS SHUFFAH",
    subtitle: `Periode: ${period} - Laporan pemasukan, pengeluaran, dan saldo`,
    sheets: [
      {
        name: "Summary",
        title: "RINGKASAN KEUANGAN",
        subtitle: `Periode ${period}`,
        columns: [
          { key: "category", title: "KATEGORI", width: 25, type: "text" },
          { key: "amount", title: "JUMLAH", width: 20, type: "currency" },
          { key: "percentage", title: "PERSENTASE", width: 15, type: "text" },
          { key: "status", title: "STATUS", width: 15, type: "status" },
        ],
        data: [
          {
            category: "Total Pemasukan",
            amount: financialData.totalIncome || 0,
            percentage: "100%",
            status: "EXCELLENT",
          },
          {
            category: "Total Pengeluaran",
            amount: financialData.totalExpense || 0,
            percentage: `${Math.round(((financialData.totalExpense || 0) / (financialData.totalIncome || 1)) * 100)}%`,
            status:
              (financialData.totalExpense || 0) <
              (financialData.totalIncome || 0)
                ? "GOOD"
                : "NEEDS ATTENTION",
          },
          {
            category: "Saldo Bersih",
            amount:
              (financialData.totalIncome || 0) -
              (financialData.totalExpense || 0),
            percentage: `${Math.round((((financialData.totalIncome || 0) - (financialData.totalExpense || 0)) / (financialData.totalIncome || 1)) * 100)}%`,
            status:
              (financialData.totalIncome || 0) >
              (financialData.totalExpense || 0)
                ? "EXCELLENT"
                : "POOR",
          },
        ],
        summary: {
          title: "ANALISIS KEUANGAN",
          data: [
            {
              label: "Rasio Pengeluaran",
              value: `${Math.round(((financialData.totalExpense || 0) / (financialData.totalIncome || 1)) * 100)}%`,
            },
            {
              label: "Margin Keuntungan",
              value: `${Math.round((((financialData.totalIncome || 0) - (financialData.totalExpense || 0)) / (financialData.totalIncome || 1)) * 100)}%`,
            },
            {
              label: "Status Keuangan",
              value:
                (financialData.totalIncome || 0) >
                (financialData.totalExpense || 0)
                  ? "SEHAT"
                  : "PERLU PERHATIAN",
            },
          ],
        },
      },
    ],
    includeTimestamp: true,
    includeSummary: true,
  };
};

// Template untuk Laporan Kehadiran
export const createAttendanceTemplate = (
  attendanceData: any[],
  period: string,
): ModernExcelExportOptions => {
  return {
    filename: `laporan-kehadiran-${period.toLowerCase()}`,
    title: "LAPORAN KEHADIRAN SANTRI",
    subtitle: `Periode: ${period} - Monitoring kehadiran dan ketidakhadiran santri`,
    sheets: [
      {
        name: "Attendance Report",
        title: "LAPORAN KEHADIRAN SANTRI",
        subtitle: `Periode ${period}`,
        columns: [
          { key: "santriName", title: "NAMA SANTRI", width: 25, type: "text" },
          { key: "halaqahName", title: "HALAQAH", width: 20, type: "text" },
          { key: "totalDays", title: "TOTAL HARI", width: 12, type: "number" },
          { key: "presentDays", title: "HADIR", width: 12, type: "number" },
          {
            key: "absentDays",
            title: "TIDAK HADIR",
            width: 12,
            type: "number",
          },
          { key: "lateDays", title: "TERLAMBAT", width: 12, type: "number" },
          {
            key: "attendanceRate",
            title: "TINGKAT KEHADIRAN",
            width: 18,
            type: "text",
          },
          {
            key: "status",
            title: "STATUS KEHADIRAN",
            width: 18,
            type: "status",
          },
        ],
        data: attendanceData.map((attendance) => {
          const rate =
            attendance.totalDays > 0
              ? Math.round(
                  (attendance.presentDays / attendance.totalDays) * 100,
                )
              : 0;
          return {
            ...attendance,
            attendanceRate: `${rate}%`,
            status:
              rate >= 90
                ? "EXCELLENT"
                : rate >= 80
                  ? "GOOD"
                  : rate >= 70
                    ? "NEEDS ATTENTION"
                    : "POOR",
          };
        }),
        summary: {
          title: "RINGKASAN KEHADIRAN",
          data: [
            {
              label: "Rata-rata Kehadiran",
              value: `${Math.round(attendanceData.reduce((sum, a) => sum + (a.presentDays / a.totalDays) * 100, 0) / attendanceData.length)}%`,
            },
            {
              label: "Santri Kehadiran Excellent",
              value: attendanceData.filter(
                (a) => (a.presentDays / a.totalDays) * 100 >= 90,
              ).length,
            },
            {
              label: "Santri Perlu Perhatian",
              value: attendanceData.filter(
                (a) => (a.presentDays / a.totalDays) * 100 < 70,
              ).length,
            },
          ],
        },
      },
    ],
    includeTimestamp: true,
    includeSummary: true,
  };
};

// Template untuk Data Santri
export const exportSantriData = (data: any[]) => {
  const columns: ExcelColumn[] = [
    { key: "nis", title: "NIS", width: 12, type: "text" },
    { key: "name", title: "Nama Lengkap", width: 25, type: "text" },
    { key: "gender", title: "Jenis Kelamin", width: 15, type: "text" },
    { key: "birthPlace", title: "Tempat Lahir", width: 20, type: "text" },
    { key: "birthDate", title: "Tanggal Lahir", width: 15, type: "date" },
    { key: "address", title: "Alamat", width: 30, type: "text" },
    { key: "phone", title: "No. Telepon", width: 15, type: "text" },
    { key: "email", title: "Email", width: 25, type: "text" },
    { key: "wali.name", title: "Nama Wali", width: 25, type: "text" },
    { key: "wali.phone", title: "Telepon Wali", width: 15, type: "text" },
    { key: "halaqah.name", title: "Halaqah", width: 20, type: "text" },
    { key: "halaqah.level", title: "Level", width: 12, type: "text" },
    { key: "status", title: "Status", width: 12, type: "status" },
    { key: "enrollmentDate", title: "Tanggal Masuk", width: 15, type: "date" },
  ];

  const options: ExcelExportOptions = {
    title: "DATA SANTRI TPQ BAITUS SHUFFAH",
    subtitle: "Laporan Data Santri Lengkap",
    filename: "data-santri-tpq",
    sheetName: "Data Santri",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
  };

  exportToExcel(options);
};

// Template untuk Data Halaqah
export const exportHalaqahData = (data: any[]) => {
  const columns: ExcelColumn[] = [
    { key: "name", title: "Nama Halaqah", width: 25, type: "text" },
    { key: "level", title: "Level", width: 15, type: "text" },
    { key: "musyrif.name", title: "Nama Musyrif", width: 25, type: "text" },
    { key: "musyrif.phone", title: "Telepon Musyrif", width: 15, type: "text" },
    {
      key: "currentCapacity",
      title: "Kapasitas Saat Ini",
      width: 18,
      type: "number",
    },
    {
      key: "maxCapacity",
      title: "Kapasitas Maksimal",
      width: 18,
      type: "number",
    },
    { key: "schedule", title: "Jadwal", width: 20, type: "text" },
    { key: "room", title: "Ruangan", width: 15, type: "text" },
    { key: "status", title: "Status", width: 12, type: "status" },
    { key: "createdAt", title: "Tanggal Dibuat", width: 15, type: "date" },
  ];

  const options: ExcelExportOptions = {
    title: "DATA HALAQAH TPQ BAITUS SHUFFAH",
    subtitle: "Laporan Data Halaqah dan Musyrif",
    filename: "data-halaqah-tpq",
    sheetName: "Data Halaqah",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
  };

  exportToExcel(options);
};

// Template untuk Data Hafalan
export const exportHafalanData = (data: any[]) => {
  const columns: ExcelColumn[] = [
    { key: "santri.nis", title: "NIS", width: 12, type: "text" },
    { key: "santri.name", title: "Nama Santri", width: 25, type: "text" },
    { key: "halaqah.name", title: "Halaqah", width: 20, type: "text" },
    { key: "surahName", title: "Nama Surah", width: 20, type: "text" },
    { key: "ayahStart", title: "Ayat Mulai", width: 12, type: "number" },
    { key: "ayahEnd", title: "Ayat Selesai", width: 12, type: "number" },
    { key: "type", title: "Jenis", width: 15, type: "text" },
    { key: "grade", title: "Nilai", width: 10, type: "number" },
    { key: "status", title: "Status", width: 12, type: "status" },
    { key: "recordedAt", title: "Tanggal Setoran", width: 15, type: "date" },
    { key: "notes", title: "Catatan", width: 30, type: "text" },
  ];

  const options: ExcelExportOptions = {
    title: "DATA HAFALAN SANTRI TPQ BAITUS SHUFFAH",
    subtitle: "Laporan Progress Hafalan Al-Quran",
    filename: "data-hafalan-tpq",
    sheetName: "Data Hafalan",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
  };

  exportToExcel(options);
};

// Template untuk Data Absensi
export const exportAbsensiData = (data: any[]) => {
  const columns: ExcelColumn[] = [
    { key: "date", title: "Tanggal", width: 15, type: "date" },
    { key: "santri.nis", title: "NIS", width: 12, type: "text" },
    { key: "santri.name", title: "Nama Santri", width: 25, type: "text" },
    { key: "halaqah.name", title: "Halaqah", width: 20, type: "text" },
    { key: "status", title: "Status Kehadiran", width: 15, type: "status" },
    { key: "timeIn", title: "Waktu Masuk", width: 12, type: "text" },
    { key: "timeOut", title: "Waktu Keluar", width: 12, type: "text" },
    { key: "notes", title: "Keterangan", width: 30, type: "text" },
    { key: "recordedBy", title: "Dicatat Oleh", width: 20, type: "text" },
  ];

  const options: ExcelExportOptions = {
    title: "DATA ABSENSI SANTRI TPQ BAITUS SHUFFAH",
    subtitle: "Laporan Kehadiran Santri",
    filename: "data-absensi-tpq",
    sheetName: "Data Absensi",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
  };

  exportToExcel(options);
};

// Template untuk Data Pembayaran
export const exportPembayaranData = (data: any[]) => {
  const columns: ExcelColumn[] = [
    { key: "date", title: "Tanggal", width: 15, type: "date" },
    { key: "invoiceNumber", title: "No. Invoice", width: 15, type: "text" },
    { key: "santri.nis", title: "NIS", width: 12, type: "text" },
    { key: "santri.name", title: "Nama Santri", width: 25, type: "text" },
    { key: "paymentType", title: "Jenis Pembayaran", width: 18, type: "text" },
    { key: "amount", title: "Jumlah", width: 15, type: "currency" },
    { key: "method", title: "Metode Bayar", width: 15, type: "text" },
    { key: "status", title: "Status", width: 12, type: "status" },
    { key: "dueDate", title: "Jatuh Tempo", width: 15, type: "date" },
    { key: "paidDate", title: "Tanggal Bayar", width: 15, type: "date" },
    { key: "description", title: "Keterangan", width: 30, type: "text" },
  ];

  const options: ExcelExportOptions = {
    title: "DATA PEMBAYARAN TPQ BAITUS SHUFFAH",
    subtitle: "Laporan Keuangan dan Pembayaran",
    filename: "data-pembayaran-tpq",
    sheetName: "Data Pembayaran",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
    customFooter: `Total Pembayaran: ${data.length} transaksi | Total Nominal: Rp ${data.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString("id-ID")}`,
  };

  exportToExcel(options);
};

// Template untuk Laporan Keuangan
export const exportLaporanKeuangan = (data: any[], periode: string) => {
  const columns: ExcelColumn[] = [
    { key: "date", title: "Tanggal", width: 15, type: "date" },
    { key: "description", title: "Keterangan", width: 30, type: "text" },
    { key: "category", title: "Kategori", width: 20, type: "text" },
    { key: "debit", title: "Pemasukan", width: 15, type: "currency" },
    { key: "credit", title: "Pengeluaran", width: 15, type: "currency" },
    { key: "balance", title: "Saldo", width: 15, type: "currency" },
    { key: "reference", title: "Referensi", width: 20, type: "text" },
    { key: "notes", title: "Catatan", width: 25, type: "text" },
  ];

  const totalDebit = data.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredit = data.reduce((sum, item) => sum + (item.credit || 0), 0);
  const netBalance = totalDebit - totalCredit;

  const options: ExcelExportOptions = {
    title: "LAPORAN KEUANGAN TPQ BAITUS SHUFFAH",
    subtitle: `Periode: ${periode}`,
    filename: "laporan-keuangan-tpq",
    sheetName: "Laporan Keuangan",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
    customFooter: `Total Pemasukan: Rp ${totalDebit.toLocaleString("id-ID")} | Total Pengeluaran: Rp ${totalCredit.toLocaleString("id-ID")} | Saldo Bersih: Rp ${netBalance.toLocaleString("id-ID")}`,
  };

  exportToExcel(options);
};

// Template untuk Data Prestasi/Achievement
export const exportPrestasiData = (data: any[]) => {
  const columns: ExcelColumn[] = [
    { key: "santri.nis", title: "NIS", width: 12, type: "text" },
    { key: "santri.name", title: "Nama Santri", width: 25, type: "text" },
    { key: "halaqah.name", title: "Halaqah", width: 20, type: "text" },
    {
      key: "achievementType",
      title: "Jenis Prestasi",
      width: 20,
      type: "text",
    },
    { key: "title", title: "Judul Prestasi", width: 30, type: "text" },
    { key: "level", title: "Tingkat", width: 15, type: "text" },
    { key: "rank", title: "Peringkat", width: 12, type: "text" },
    { key: "date", title: "Tanggal", width: 15, type: "date" },
    { key: "organizer", title: "Penyelenggara", width: 25, type: "text" },
    { key: "description", title: "Deskripsi", width: 35, type: "text" },
  ];

  const options: ExcelExportOptions = {
    title: "DATA PRESTASI SANTRI TPQ BAITUS SHUFFAH",
    subtitle: "Laporan Pencapaian dan Prestasi",
    filename: "data-prestasi-tpq",
    sheetName: "Data Prestasi",
    columns,
    data,
    includeTimestamp: true,
    includeFooter: true,
  };

  exportToExcel(options);
};

// Template untuk Laporan Komprehensif
export const exportLaporanKomprehensif = (
  data: {
    santri: any[];
    halaqah: any[];
    hafalan: any[];
    absensi: any[];
    pembayaran: any[];
  },
  periode: string,
) => {
  // Create multiple sheets in one workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ["LAPORAN KOMPREHENSIF TPQ BAITUS SHUFFAH"],
    [`Periode: ${periode}`],
    [`Diekspor pada: ${new Date().toLocaleString("id-ID")}`],
    [],
    ["RINGKASAN DATA:"],
    [`Total Santri: ${data.santri.length}`],
    [`Total Halaqah: ${data.halaqah.length}`],
    [`Total Hafalan: ${data.hafalan.length}`],
    [`Total Absensi: ${data.absensi.length}`],
    [`Total Pembayaran: ${data.pembayaran.length}`],
    [],
    ["STATISTIK SANTRI:"],
    [
      `Santri Aktif: ${data.santri.filter((s) => s.status === "ACTIVE").length}`,
    ],
    [
      `Santri Lulus: ${data.santri.filter((s) => s.status === "GRADUATED").length}`,
    ],
    [],
    ["STATISTIK KEUANGAN:"],
    [
      `Total Pemasukan: Rp ${data.pembayaran
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + p.amount, 0)
        .toLocaleString("id-ID")}`,
    ],
    [
      `Pembayaran Pending: Rp ${data.pembayaran
        .filter((p) => p.status === "PENDING")
        .reduce((sum, p) => sum + p.amount, 0)
        .toLocaleString("id-ID")}`,
    ],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWs, "Ringkasan");

  // Export the comprehensive report with proper MIME type
  try {
    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });

    // Use correct MIME type for Excel files
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan-komprehensif-tpq-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log("✅ Comprehensive report downloaded successfully");
  } catch (error) {
    console.error("❌ Error downloading comprehensive report:", error);
    throw error;
  }
};

// Template untuk Behavior Records menggunakan sistem modern
export const exportBehaviorRecordsData = (data: any[]) => {
  try {
    // Validate data
    if (!data || !Array.isArray(data)) {
      console.warn(
        "⚠️ Invalid data for behavior records export, using empty array",
      );
      data = [];
    }

    // Clean and validate each record - handle both API response and mock data structures
    const cleanData = data.map((record, index) => {
      // Handle different data structures
      const santriName =
        record?.santri?.name ||
        record?.santriName ||
        record?.santri_name ||
        "Unknown";
      const santriNis =
        record?.santri?.nis || record?.santriNis || record?.santri_nis || "";
      const halaqahName =
        record?.halaqah?.name ||
        record?.halaqahName ||
        record?.halaqah_name ||
        "Unknown";
      const recordedByName =
        record?.recordedByUser?.name ||
        record?.recordedByName ||
        record?.recorded_by ||
        "System";

      return {
        no: index + 1,
        id: record?.id || "",
        date: record?.date || new Date().toISOString().split("T")[0],
        time: record?.time || "",
        santri_name: santriName,
        santri_nis: santriNis,
        halaqah_name: halaqahName,
        category: record?.category || "Unknown",
        type: record?.type || "Unknown",
        severity: record?.severity || "LOW",
        description: record?.description || "",
        points: record?.points || 0,
        status: record?.status || "ACTIVE",
        recorded_by: recordedByName,
        created_at:
          record?.created_at || record?.createdAt || new Date().toISOString(),
      };
    });

    console.log("📊 Exporting behavior records:", cleanData.length, "records");

    // Use the full comprehensive template with all sheets
    const templateOptions = createBehaviorRecordsTemplate(cleanData);
    exportModernExcel(templateOptions);

    console.log("✅ Behavior records export completed successfully");
  } catch (error) {
    console.error("❌ Error exporting behavior records:", error);
    throw error;
  }
};

// Simple template for behavior records to avoid complexity issues
export const createSimpleBehaviorRecordsTemplate = (
  behaviorData: any[],
): ModernExcelExportOptions => {
  // Calculate basic statistics
  const stats = {
    total: behaviorData.length,
    positive: behaviorData.filter((r) => r.type === "POSITIVE").length,
    negative: behaviorData.filter((r) => r.type === "NEGATIVE").length,
    neutral: behaviorData.filter((r) => r.type === "NEUTRAL").length,
    avgPoints:
      behaviorData.length > 0
        ? Math.round(
            behaviorData.reduce((sum, r) => sum + (r.points || 0), 0) /
              behaviorData.length,
          )
        : 0,
  };

  return {
    filename: "laporan-perilaku-santri-tpq-baitus-shuffah",
    title: "LAPORAN PERILAKU SANTRI TPQ BAITUS SHUFFAH",
    subtitle: "Sistem Monitoring & Evaluasi Akhlaq - Catatan Perilaku Lengkap",
    includeTimestamp: true,
    includeSummary: true,
    sheets: [
      {
        name: "Data Perilaku Lengkap",
        title: "CATATAN PERILAKU SANTRI - DATA LENGKAP",
        subtitle: `Total ${behaviorData.length} catatan perilaku`,
        columns: [
          { key: "no", title: "No", width: 5, type: "number" },
          { key: "date", title: "Tanggal", width: 12, type: "date" },
          { key: "time", title: "Waktu", width: 10, type: "text" },
          { key: "santri_name", title: "Nama Santri", width: 25, type: "text" },
          { key: "santri_nis", title: "NIS", width: 12, type: "text" },
          { key: "halaqah_name", title: "Halaqah", width: 20, type: "text" },
          { key: "category", title: "Kategori", width: 15, type: "text" },
          { key: "type", title: "Jenis", width: 12, type: "status" },
          { key: "severity", title: "Tingkat", width: 12, type: "text" },
          { key: "description", title: "Deskripsi", width: 35, type: "text" },
          { key: "points", title: "Poin", width: 8, type: "number" },
          { key: "status", title: "Status", width: 12, type: "status" },
          {
            key: "recorded_by",
            title: "Dicatat Oleh",
            width: 20,
            type: "text",
          },
        ],
        data: behaviorData,
        summary: {
          title: "RINGKASAN LAPORAN",
          data: [
            { label: "Total Catatan", value: stats.total, type: "number" },
            {
              label: "Perilaku Positif",
              value: stats.positive,
              type: "number",
            },
            {
              label: "Perilaku Negatif",
              value: stats.negative,
              type: "number",
            },
            { label: "Perilaku Netral", value: stats.neutral, type: "number" },
            { label: "Rata-rata Poin", value: stats.avgPoints, type: "number" },
            {
              label: "Periode Laporan",
              value: `${new Date().toLocaleDateString("id-ID")}`,
              type: "text",
            },
          ],
        },
      },
    ],
  };
};

import * as XLSX from "xlsx";

// Color scheme untuk template Excel
export const EXCEL_COLORS = {
  primary: "FF2563EB", // Blue
  secondary: "FF64748B", // Slate
  success: "FF10B981", // Green
  warning: "FFF59E0B", // Amber
  danger: "FFEF4444", // Red
  info: "FF06B6D4", // Cyan
  light: "FFF8FAFC", // Very light gray
  dark: "FF1E293B", // Dark slate
  white: "FFFFFFFF",
  border: "FFE2E8F0", // Light border
};

// Style definitions untuk Excel
export const EXCEL_STYLES = {
  header: {
    font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 12 },
    fill: { fgColor: { rgb: EXCEL_COLORS.primary } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  subHeader: {
    font: { bold: true, color: { rgb: EXCEL_COLORS.dark }, size: 11 },
    fill: { fgColor: { rgb: EXCEL_COLORS.light } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  data: {
    font: { color: { rgb: EXCEL_COLORS.dark }, size: 10 },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  dataCenter: {
    font: { color: { rgb: EXCEL_COLORS.dark }, size: 10 },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  dataNumber: {
    font: { color: { rgb: EXCEL_COLORS.dark }, size: 10 },
    alignment: { horizontal: "right", vertical: "center" },
    numFmt: "#,##0",
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  dataCurrency: {
    font: { color: { rgb: EXCEL_COLORS.dark }, size: 10 },
    alignment: { horizontal: "right", vertical: "center" },
    numFmt: "Rp #,##0",
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  dataDate: {
    font: { color: { rgb: EXCEL_COLORS.dark }, size: 10 },
    alignment: { horizontal: "center", vertical: "center" },
    numFmt: "dd/mm/yyyy",
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  title: {
    font: { bold: true, color: { rgb: EXCEL_COLORS.primary }, size: 16 },
    alignment: { horizontal: "center", vertical: "center" },
  },
  subtitle: {
    font: { color: { rgb: EXCEL_COLORS.secondary }, size: 12 },
    alignment: { horizontal: "center", vertical: "center" },
  },
  statusActive: {
    font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 10 },
    fill: { fgColor: { rgb: EXCEL_COLORS.success } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  statusInactive: {
    font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 10 },
    fill: { fgColor: { rgb: EXCEL_COLORS.danger } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
  statusPending: {
    font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 10 },
    fill: { fgColor: { rgb: EXCEL_COLORS.warning } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      bottom: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      left: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
      right: { style: "thin", color: { rgb: EXCEL_COLORS.border } },
    },
  },
};

export interface ExcelColumn {
  key: string;
  title: string;
  width?: number;
  type?: "text" | "number" | "currency" | "date" | "status";
  statusColors?: {
    [key: string]: string;
  };
}

export interface ExcelExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  sheetName: string;
  columns: ExcelColumn[];
  data: any[];
  includeTimestamp?: boolean;
  includeFooter?: boolean;
  customFooter?: string;
}

export class ExcelExporter {
  private workbook: XLSX.WorkBook;
  private worksheet: XLSX.WorkSheet;

  constructor() {
    this.workbook = XLSX.utils.book_new();
    this.worksheet = {};
  }

  public exportData(options: ExcelExportOptions): void {
    this.createWorksheet(options);
    this.downloadFile(options.filename);
  }

  private createWorksheet(options: ExcelExportOptions): void {
    const {
      title,
      subtitle,
      sheetName,
      columns,
      data,
      includeTimestamp = true,
      includeFooter = true,
      customFooter,
    } = options;

    // Create worksheet data array
    const wsData: any[][] = [];
    let currentRow = 0;

    // Add title
    wsData.push([title]);
    currentRow++;

    // Add subtitle if provided
    if (subtitle) {
      wsData.push([subtitle]);
      currentRow++;
    }

    // Add timestamp if enabled
    if (includeTimestamp) {
      wsData.push([`Diekspor pada: ${new Date().toLocaleString("id-ID")}`]);
      currentRow++;
    }

    // Add empty row
    wsData.push([]);
    currentRow++;

    // Add headers
    const headers = columns.map((col) => col.title);
    wsData.push(headers);
    const headerRow = currentRow;
    currentRow++;

    // Add data rows
    data.forEach((item) => {
      const row = columns.map((col) => {
        const value = this.getNestedValue(item, col.key);
        return this.formatCellValue(value, col.type);
      });
      wsData.push(row);
      currentRow++;
    });

    // Add footer if enabled
    if (includeFooter) {
      wsData.push([]);
      wsData.push([customFooter || `Total: ${data.length} data`]);
      currentRow += 2;
    }

    // Create worksheet
    this.worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles and formatting
    this.applyStyles(options, headerRow, currentRow);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(this.workbook, this.worksheet, sheetName);
  }

  private applyStyles(
    options: ExcelExportOptions,
    headerRow: number,
    totalRows: number,
  ): void {
    const { columns, data } = options;

    // Set column widths
    const colWidths = columns.map((col) => ({ wch: col.width || 15 }));
    this.worksheet["!cols"] = colWidths;

    // Apply title style
    if (this.worksheet["A1"]) {
      this.worksheet["A1"].s = EXCEL_STYLES.title;
    }

    // Apply subtitle style
    if (this.worksheet["A2"]) {
      this.worksheet["A2"].s = EXCEL_STYLES.subtitle;
    }

    // Apply header styles
    columns.forEach((col, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
      if (this.worksheet[cellRef]) {
        this.worksheet[cellRef].s = EXCEL_STYLES.header;
      }
    });

    // Apply data styles
    data.forEach((item, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({
          r: headerRow + 1 + rowIndex,
          c: colIndex,
        });
        if (this.worksheet[cellRef]) {
          this.worksheet[cellRef].s = this.getCellStyle(col, item[col.key]);
        }
      });
    });

    // Set print area and page setup
    this.worksheet["!printHeader"] = [headerRow, headerRow];
    this.worksheet["!margins"] = {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };
  }

  private getCellStyle(column: ExcelColumn, value: any): any {
    switch (column.type) {
      case "number":
        return EXCEL_STYLES.dataNumber;
      case "currency":
        return EXCEL_STYLES.dataCurrency;
      case "date":
        return EXCEL_STYLES.dataDate;
      case "status":
        return this.getStatusStyle(value);
      default:
        return EXCEL_STYLES.data;
    }
  }

  private getStatusStyle(status: string): any {
    const statusLower = status?.toLowerCase();
    if (
      ["active", "aktif", "paid", "lunas", "approved", "disetujui"].includes(
        statusLower,
      )
    ) {
      return EXCEL_STYLES.statusActive;
    } else if (
      [
        "inactive",
        "nonaktif",
        "unpaid",
        "belum lunas",
        "rejected",
        "ditolak",
      ].includes(statusLower)
    ) {
      return EXCEL_STYLES.statusInactive;
    } else if (
      ["pending", "menunggu", "review", "proses"].includes(statusLower)
    ) {
      return EXCEL_STYLES.statusPending;
    }
    return EXCEL_STYLES.dataCenter;
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

// Helper function untuk export cepat
export const exportToExcel = (options: ExcelExportOptions): void => {
  const exporter = new ExcelExporter();
  exporter.exportData(options);
};

// Interface untuk multi-sheet export
export interface MultiSheetExportOptions {
  filename: string;
  sheets: {
    name: string;
    data: any[];
  }[];
}

// Function untuk export multi-sheet (untuk analytics)
export const exportMultiSheetToExcel = (
  options: MultiSheetExportOptions,
): void => {
  const workbook = XLSX.utils.book_new();

  options.sheets.forEach((sheet) => {
    // Ensure data is an array
    if (!Array.isArray(sheet.data)) {
      console.warn(`Sheet "${sheet.name}" data is not an array:`, sheet.data);
      return;
    }

    // Skip empty sheets
    if (sheet.data.length === 0) {
      console.warn(`Sheet "${sheet.name}" has no data, skipping`);
      return;
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  // Download file with proper MIME type
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
      `${options.filename}-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log("✅ Excel file downloaded successfully:", options.filename);
  } catch (error) {
    console.error("❌ Error downloading Excel file:", error);
    throw error;
  }
};

import * as XLSX from "xlsx";

// Simple test function to verify Excel export works
export const testExcelExport = () => {
  try {
    console.log("🧪 Testing Excel export functionality...");

    // Create simple test data
    const testData = [
      {
        no: 1,
        name: "Test Santri 1",
        category: "AKHLAQ",
        type: "POSITIVE",
        points: 5,
      },
      {
        no: 2,
        name: "Test Santri 2",
        category: "IBADAH",
        type: "NEGATIVE",
        points: -3,
      },
      {
        no: 3,
        name: "Test Santri 3",
        category: "ACADEMIC",
        type: "NEUTRAL",
        points: 0,
      },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(testData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Data");

    // Write workbook
    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });

    // Create blob with correct MIME type
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download file
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `test-excel-export-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log("✅ Excel test export completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Excel test export failed:", error);
    return false;
  }
};

// Test function for behavior records specifically
export const testBehaviorExport = () => {
  try {
    console.log("🧪 Testing behavior records export...");

    // Mock behavior data that matches expected structure
    const mockBehaviorData = [
      {
        id: "test-1",
        date: "2025-01-25",
        time: "10:30",
        santri: { name: "Ahmad Fauzi", nis: "2024001" },
        halaqah: { name: "Halaqah A" },
        category: "AKHLAQ",
        type: "POSITIVE",
        severity: "LOW",
        description: "Menunjukkan sikap jujur",
        points: 5,
        status: "ACTIVE",
        recordedByUser: { name: "Ustadz Ali" },
        created_at: new Date().toISOString(),
      },
      {
        id: "test-2",
        date: "2025-01-25",
        time: "11:00",
        santri: { name: "Fatimah Zahra", nis: "2024002" },
        halaqah: { name: "Halaqah B" },
        category: "IBADAH",
        type: "NEGATIVE",
        severity: "MEDIUM",
        description: "Terlambat sholat berjamaah",
        points: -3,
        status: "FOLLOW_UP",
        recordedByUser: { name: "Ustadzah Siti" },
        created_at: new Date().toISOString(),
      },
    ];

    // Import and test the export function
    import("@/lib/excel-templates")
      .then(({ exportBehaviorRecordsData }) => {
        exportBehaviorRecordsData(mockBehaviorData);
        console.log("✅ Behavior records test export completed");
      })
      .catch((error) => {
        console.error("❌ Behavior records test export failed:", error);
      });

    return true;
  } catch (error) {
    console.error("❌ Behavior test export failed:", error);
    return false;
  }
};

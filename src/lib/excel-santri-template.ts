import * as XLSX from "xlsx";

export interface SantriTemplateData {
  NIS: string;
  "Nama Lengkap": string;
  "Tanggal Lahir": string;
  "Tempat Lahir": string;
  "Jenis Kelamin": "MALE" | "FEMALE";
  Alamat: string;
  "Nama Orang Tua": string;
  "No. HP Orang Tua": string;
  "Email Orang Tua"?: string;
  "Tanggal Masuk": string;
  Status: "ACTIVE" | "INACTIVE";
  Catatan?: string;
}

export function generateSantriTemplate(): void {
  // Sample data for template
  const templateData: SantriTemplateData[] = [
    {
      NIS: "STR001",
      "Nama Lengkap": "Ahmad Fauzi",
      "Tanggal Lahir": "2010-01-15",
      "Tempat Lahir": "Jakarta",
      "Jenis Kelamin": "MALE",
      Alamat: "Jl. Masjid No. 123, Jakarta Selatan",
      "Nama Orang Tua": "Budi Santoso",
      "No. HP Orang Tua": "081234567890",
      "Email Orang Tua": "budi@email.com",
      "Tanggal Masuk": "2024-01-15",
      Status: "ACTIVE",
      Catatan: "Santri baru",
    },
    {
      NIS: "STR002",
      "Nama Lengkap": "Siti Aisyah",
      "Tanggal Lahir": "2011-03-20",
      "Tempat Lahir": "Bogor",
      "Jenis Kelamin": "FEMALE",
      Alamat: "Jl. Pesantren No. 456, Bogor",
      "Nama Orang Tua": "Siti Aminah",
      "No. HP Orang Tua": "082345678901",
      "Email Orang Tua": "aminah@email.com",
      "Tanggal Masuk": "2024-01-15",
      Status: "ACTIVE",
      Catatan: "Santri pindahan",
    },
    {
      NIS: "STR003",
      "Nama Lengkap": "Muhammad Ali",
      "Tanggal Lahir": "2009-12-10",
      "Tempat Lahir": "Depok",
      "Jenis Kelamin": "MALE",
      Alamat: "Jl. Tahfidz No. 789, Depok",
      "Nama Orang Tua": "Ali Rahman",
      "No. HP Orang Tua": "083456789012",
      "Email Orang Tua": "",
      "Tanggal Masuk": "2024-02-01",
      Status: "ACTIVE",
      Catatan: "",
    },
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create main data sheet
  const ws = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // NIS
    { wch: 25 }, // Nama Lengkap
    { wch: 15 }, // Tanggal Lahir
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Jenis Kelamin
    { wch: 35 }, // Alamat
    { wch: 25 }, // Nama Orang Tua
    { wch: 18 }, // No. HP Orang Tua
    { wch: 25 }, // Email Orang Tua
    { wch: 15 }, // Tanggal Masuk
    { wch: 12 }, // Status
    { wch: 25 }, // Catatan
  ];
  ws["!cols"] = colWidths;

  // Add header styling
  const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1:L1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;

    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
  }

  // Add data validation for gender column (column E)
  ws["!dataValidation"] = [
    {
      sqref: "E:E",
      type: "list",
      formula1: '"MALE,FEMALE"',
      showDropDown: true,
      promptTitle: "Jenis Kelamin",
      prompt: "Pilih MALE atau FEMALE",
      errorTitle: "Input Tidak Valid",
      error: "Hanya MALE atau FEMALE yang diperbolehkan",
    },
    {
      sqref: "K:K",
      type: "list",
      formula1: '"ACTIVE,INACTIVE"',
      showDropDown: true,
      promptTitle: "Status",
      prompt: "Pilih ACTIVE atau INACTIVE",
      errorTitle: "Input Tidak Valid",
      error: "Hanya ACTIVE atau INACTIVE yang diperbolehkan",
    },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Data Santri");

  // Create instruction sheet
  const instructionData = [
    ["PETUNJUK PENGGUNAAN TEMPLATE IMPORT DATA SANTRI"],
    [""],
    ["1. KOLOM WAJIB DIISI:"],
    ["   - NIS: Nomor Induk Santri (harus unik)"],
    ["   - Nama Lengkap: Nama lengkap santri"],
    ["   - Tanggal Lahir: Format YYYY-MM-DD (contoh: 2010-01-15)"],
    ["   - Jenis Kelamin: MALE atau FEMALE"],
    ["   - Nama Orang Tua: Nama orang tua/wali"],
    ["   - No. HP Orang Tua: Nomor HP yang bisa dihubungi"],
    [""],
    ["2. KOLOM OPSIONAL:"],
    ["   - Tempat Lahir: Tempat lahir santri"],
    ["   - Alamat: Alamat lengkap santri"],
    ["   - Email Orang Tua: Email orang tua (jika ada)"],
    ["   - Tanggal Masuk: Tanggal masuk TPQ (default: hari ini)"],
    ["   - Status: ACTIVE atau INACTIVE (default: ACTIVE)"],
    ["   - Catatan: Catatan tambahan"],
    [""],
    ["3. FORMAT DATA:"],
    ["   - Tanggal: Gunakan format YYYY-MM-DD"],
    ["   - Nomor HP: Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxx"],
    ["   - Email: Gunakan format email yang valid"],
    ["   - NIS: Harus unik, tidak boleh sama dengan santri lain"],
    [""],
    ["4. TIPS:"],
    ["   - Hapus baris contoh sebelum mengisi data asli"],
    ["   - Pastikan tidak ada baris kosong di tengah data"],
    ["   - Periksa kembali data sebelum upload"],
    ["   - Maksimal 1000 data per upload"],
    [""],
    ["5. CONTOH FORMAT TANGGAL:"],
    ["   - Benar: 2010-01-15, 2011-12-25"],
    ["   - Salah: 15/01/2010, 25-12-2011"],
    [""],
    ["6. CONTOH FORMAT NOMOR HP:"],
    ["   - Benar: 081234567890, +6281234567890"],
    ["   - Salah: 0812-3456-7890, (0812) 3456 7890"],
  ];

  const instructionWs = XLSX.utils.aoa_to_sheet(instructionData);

  // Set column width for instruction sheet
  instructionWs["!cols"] = [{ wch: 60 }];

  // Style the title
  if (instructionWs["A1"]) {
    instructionWs["A1"].s = {
      font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2F5597" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Style section headers
  const sectionHeaders = ["A3", "A11", "A19", "A27", "A33", "A37"];
  sectionHeaders.forEach((cell) => {
    if (instructionWs[cell]) {
      instructionWs[cell].s = {
        font: { bold: true, color: { rgb: "2F5597" } },
        alignment: { horizontal: "left", vertical: "center" },
      };
    }
  });

  XLSX.utils.book_append_sheet(wb, instructionWs, "Petunjuk");

  // Create validation reference sheet
  const validationData = [
    ["REFERENSI VALIDASI"],
    [""],
    ["Jenis Kelamin yang Valid:"],
    ["MALE"],
    ["FEMALE"],
    [""],
    ["Status yang Valid:"],
    ["ACTIVE"],
    ["INACTIVE"],
    [""],
    ["Format Tanggal:"],
    ["YYYY-MM-DD"],
    ["Contoh: 2010-01-15"],
    [""],
    ["Format Nomor HP:"],
    ["08xxxxxxxxxx"],
    ["+62xxxxxxxxx"],
    ["Contoh: 081234567890"],
    ["Contoh: +6281234567890"],
  ];

  const validationWs = XLSX.utils.aoa_to_sheet(validationData);
  validationWs["!cols"] = [{ wch: 30 }];

  // Style validation sheet title
  if (validationWs["A1"]) {
    validationWs["A1"].s = {
      font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "70AD47" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  XLSX.utils.book_append_sheet(wb, validationWs, "Referensi");

  // Generate filename with timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "");
  const filename = `Template_Import_Santri_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, filename);
}

export function generateSantriTemplateBlob(): Blob {
  // Create a simpler version for API response
  const templateData: SantriTemplateData[] = [
    {
      NIS: "STR001",
      "Nama Lengkap": "Ahmad Fauzi",
      "Tanggal Lahir": "2010-01-15",
      "Tempat Lahir": "Jakarta",
      "Jenis Kelamin": "MALE",
      Alamat: "Jl. Masjid No. 123, Jakarta Selatan",
      "Nama Orang Tua": "Budi Santoso",
      "No. HP Orang Tua": "081234567890",
      "Email Orang Tua": "budi@email.com",
      "Tanggal Masuk": "2024-01-15",
      Status: "ACTIVE",
      Catatan: "Santri baru",
    },
    {
      NIS: "STR002",
      "Nama Lengkap": "Siti Aisyah",
      "Tanggal Lahir": "2011-03-20",
      "Tempat Lahir": "Bogor",
      "Jenis Kelamin": "FEMALE",
      Alamat: "Jl. Pesantren No. 456, Bogor",
      "Nama Orang Tua": "Siti Aminah",
      "No. HP Orang Tua": "082345678901",
      "Email Orang Tua": "aminah@email.com",
      "Tanggal Masuk": "2024-01-15",
      Status: "ACTIVE",
      Catatan: "Santri pindahan",
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  const colWidths = [
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 35 },
    { wch: 25 },
    { wch: 18 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
  ];
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Template Santri");

  // Convert to blob
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function validateSantriExcelData(data: any[]): {
  valid: boolean;
  errors: string[];
  processedData: SantriTemplateData[];
} {
  const errors: string[] = [];
  const processedData: SantriTemplateData[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // Excel row number (header is row 1)

    // Required field validation
    if (!row["NIS"]) {
      errors.push(`Baris ${rowNumber}: NIS wajib diisi`);
    }
    if (!row["Nama Lengkap"]) {
      errors.push(`Baris ${rowNumber}: Nama Lengkap wajib diisi`);
    }
    if (!row["Tanggal Lahir"]) {
      errors.push(`Baris ${rowNumber}: Tanggal Lahir wajib diisi`);
    }
    if (
      !row["Jenis Kelamin"] ||
      !["MALE", "FEMALE"].includes(row["Jenis Kelamin"])
    ) {
      errors.push(`Baris ${rowNumber}: Jenis Kelamin harus MALE atau FEMALE`);
    }
    if (!row["Nama Orang Tua"]) {
      errors.push(`Baris ${rowNumber}: Nama Orang Tua wajib diisi`);
    }
    if (!row["No. HP Orang Tua"]) {
      errors.push(`Baris ${rowNumber}: No. HP Orang Tua wajib diisi`);
    }

    // Date format validation
    if (row["Tanggal Lahir"] && !isValidDate(row["Tanggal Lahir"])) {
      errors.push(
        `Baris ${rowNumber}: Format Tanggal Lahir tidak valid (gunakan YYYY-MM-DD)`,
      );
    }
    if (row["Tanggal Masuk"] && !isValidDate(row["Tanggal Masuk"])) {
      errors.push(
        `Baris ${rowNumber}: Format Tanggal Masuk tidak valid (gunakan YYYY-MM-DD)`,
      );
    }

    // Phone number validation
    if (row["No. HP Orang Tua"] && !isValidPhone(row["No. HP Orang Tua"])) {
      errors.push(`Baris ${rowNumber}: Format No. HP Orang Tua tidak valid`);
    }

    // Email validation
    if (
      row["Email Orang Tua"] &&
      row["Email Orang Tua"].trim() &&
      !isValidEmail(row["Email Orang Tua"])
    ) {
      errors.push(`Baris ${rowNumber}: Format Email Orang Tua tidak valid`);
    }

    // Status validation
    if (row["Status"] && !["ACTIVE", "INACTIVE"].includes(row["Status"])) {
      errors.push(`Baris ${rowNumber}: Status harus ACTIVE atau INACTIVE`);
    }

    // If no critical errors, add to processed data
    if (row["NIS"] && row["Nama Lengkap"]) {
      processedData.push({
        NIS: row["NIS"].toString().trim(),
        "Nama Lengkap": row["Nama Lengkap"].toString().trim(),
        "Tanggal Lahir": formatDate(row["Tanggal Lahir"]),
        "Tempat Lahir": row["Tempat Lahir"]?.toString().trim() || "",
        "Jenis Kelamin": row["Jenis Kelamin"] as "MALE" | "FEMALE",
        Alamat: row["Alamat"]?.toString().trim() || "",
        "Nama Orang Tua": row["Nama Orang Tua"].toString().trim(),
        "No. HP Orang Tua": row["No. HP Orang Tua"].toString().trim(),
        "Email Orang Tua": row["Email Orang Tua"]?.toString().trim(),
        "Tanggal Masuk":
          formatDate(row["Tanggal Masuk"]) ||
          new Date().toISOString().split("T")[0],
        Status: (row["Status"] || "ACTIVE") as "ACTIVE" | "INACTIVE",
        Catatan: row["Catatan"]?.toString().trim(),
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    processedData,
  };
}

function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

function formatDate(dateValue: any): string {
  if (!dateValue) return "";

  try {
    let date: Date;

    if (typeof dateValue === "number") {
      // Excel date serial number
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      return "";
    }

    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

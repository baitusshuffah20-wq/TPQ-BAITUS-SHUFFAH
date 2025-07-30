import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can export salary reports." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const musyrifId = searchParams.get("musyrifId");
    const format = searchParams.get("format") || "excel"; // excel or csv

    console.log(`🔌 Exporting salary reports - Format: ${format}, Start: ${startDate}, End: ${endDate}`);

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Build musyrif filter
    const musyrifFilter: any = {};
    if (musyrifId) {
      musyrifFilter.musyrifId = musyrifId;
    }

    // Get earnings data
    const earnings = await prisma.musyrifEarning.findMany({
      where: {
        status: "APPROVED",
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...musyrifFilter,
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
        attendance: {
          select: {
            date: true,
            sessionType: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get withdrawals data
    const withdrawals = await prisma.musyrifWithdrawal.findMany({
      where: {
        status: "COMPLETED",
        completedAt: Object.keys(dateFilter).length > 0 ? {
          gte: dateFilter.gte,
          lte: dateFilter.lte,
        } : undefined,
        ...musyrifFilter,
      },
      include: {
        musyrif: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Format data for export
    const earningsData = earnings.map(earning => ({
      'Tanggal': earning.attendance.date.toLocaleDateString("id-ID"),
      'Nama Musyrif': earning.musyrif.name,
      'Jenis Sesi': earning.attendance.sessionType,
      'Tipe Perhitungan': earning.calculationType === 'PER_SESSION' ? 'Per Sesi' : 'Per Jam',
      'Durasi (Menit)': earning.sessionDuration || 0,
      'Rate': Number(earning.rate),
      'Jumlah Penghasilan': Number(earning.amount),
      'Check In': earning.attendance.checkInTime ? 
        new Date(earning.attendance.checkInTime).toLocaleTimeString("id-ID") : '-',
      'Check Out': earning.attendance.checkOutTime ? 
        new Date(earning.attendance.checkOutTime).toLocaleTimeString("id-ID") : '-',
      'Tanggal Dibuat': earning.createdAt.toLocaleDateString("id-ID"),
    }));

    const withdrawalsData = withdrawals.map(withdrawal => ({
      'Tanggal Penarikan': withdrawal.completedAt ? 
        new Date(withdrawal.completedAt).toLocaleDateString("id-ID") : '-',
      'Nama Musyrif': withdrawal.musyrif.name,
      'Jumlah Penarikan': Number(withdrawal.amount),
      'Bank': withdrawal.bankName,
      'Nomor Rekening': withdrawal.bankAccount,
      'Nama Pemilik': withdrawal.accountHolder,
      'Tanggal Request': withdrawal.requestedAt.toLocaleDateString("id-ID"),
    }));

    // Calculate summary
    const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
    
    const summaryData = [{
      'Metrik': 'Total Penghasilan',
      'Nilai': totalEarnings,
      'Jumlah Record': earnings.length,
    }, {
      'Metrik': 'Total Penarikan',
      'Nilai': totalWithdrawals,
      'Jumlah Record': withdrawals.length,
    }, {
      'Metrik': 'Saldo Bersih',
      'Nilai': totalEarnings - totalWithdrawals,
      'Jumlah Record': '-',
    }];

    if (format === "excel") {
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      
      // Add summary sheet
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");
      
      // Add earnings sheet
      const earningsSheet = XLSX.utils.json_to_sheet(earningsData);
      XLSX.utils.book_append_sheet(workbook, earningsSheet, "Penghasilan");
      
      // Add withdrawals sheet
      const withdrawalsSheet = XLSX.utils.json_to_sheet(withdrawalsData);
      XLSX.utils.book_append_sheet(workbook, withdrawalsSheet, "Penarikan");
      
      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Laporan_Salary_${dateStr}.xlsx`;
      
      console.log(`✅ Excel report generated: ${filename}`);
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
      
    } else if (format === "csv") {
      // Create CSV for earnings
      const earningsCSV = XLSX.utils.json_to_sheet(earningsData);
      const csvContent = XLSX.utils.sheet_to_csv(earningsCSV);
      
      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Laporan_Penghasilan_${dateStr}.csv`;
      
      console.log(`✅ CSV report generated: ${filename}`);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid format. Use 'excel' or 'csv'" },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Error exporting salary reports:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat export reports",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can export salary reports." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startDate, endDate, musyrifId, format = "excel", includeDetails = true } = body;

    console.log(`🔌 Custom export request - Format: ${format}`);

    // Build filters
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const musyrifFilter: any = {};
    if (musyrifId) musyrifFilter.musyrifId = musyrifId;

    // Get data based on requirements
    const earnings = await prisma.musyrifEarning.findMany({
      where: {
        status: "APPROVED",
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...musyrifFilter,
      },
      include: {
        musyrif: { select: { id: true, name: true } },
        attendance: includeDetails ? {
          select: {
            date: true,
            sessionType: true,
            checkInTime: true,
            checkOutTime: true,
          },
        } : false,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for export
    const exportData = earnings.map(earning => {
      const baseData = {
        'Nama Musyrif': earning.musyrif.name,
        'Jumlah': Number(earning.amount),
        'Tipe': earning.calculationType === 'PER_SESSION' ? 'Per Sesi' : 'Per Jam',
        'Rate': Number(earning.rate),
        'Tanggal Dibuat': earning.createdAt.toLocaleDateString("id-ID"),
      };

      if (includeDetails && earning.attendance) {
        return {
          ...baseData,
          'Tanggal Sesi': earning.attendance.date.toLocaleDateString("id-ID"),
          'Jenis Sesi': earning.attendance.sessionType,
          'Durasi (Menit)': earning.sessionDuration || 0,
          'Check In': earning.attendance.checkInTime ? 
            new Date(earning.attendance.checkInTime).toLocaleTimeString("id-ID") : '-',
          'Check Out': earning.attendance.checkOutTime ? 
            new Date(earning.attendance.checkOutTime).toLocaleTimeString("id-ID") : '-',
        };
      }

      return baseData;
    });

    // Generate file
    if (format === "excel") {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penghasilan");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const filename = `Custom_Salary_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      const filename = `Custom_Salary_Report_${new Date().toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

  } catch (error) {
    console.error("❌ Error in custom export:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat custom export",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

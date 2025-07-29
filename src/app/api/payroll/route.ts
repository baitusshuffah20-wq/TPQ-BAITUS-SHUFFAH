import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to get status text
function getStatusText(status: string): string {
  switch (status) {
    case "PAID":
      return "Sudah Dibayar";
    case "APPROVED":
      return "Disetujui";
    case "DRAFT":
      return "Draft";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status;
  }
}

// GET - Ambil data payroll dengan filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const employeeId = searchParams.get("employee_id");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    if (month) {
      where.periodMonth = parseInt(month);
    }

    if (year) {
      where.periodYear = parseInt(year);
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [payrollRecords, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: [
          { periodYear: "desc" },
          { periodMonth: "desc" },
          { employee: { name: "asc" } },
        ],
        skip,
        take: limit,
      }),
      prisma.payroll.count({ where }),
    ]);

    // Calculate summary
    const summary = await prisma.payroll.aggregate({
      where,
      _sum: {
        baseSalary: true,
        grossSalary: true,
        netSalary: true,
        allowances: true,
        deductions: true,
      },
      _count: {
        _all: true,
      },
    });

    // Transform data for response
    const payrolls = payrollRecords.map((payroll) => ({
      id: payroll.id,
      employee_id: payroll.employeeId,
      employee_name: payroll.employee?.name || "Unknown",
      employee_email: payroll.employee?.email,
      employee_position: payroll.employee?.role || "Staff",
      period_month: payroll.periodMonth,
      period_year: payroll.periodYear,
      period_display: `${payroll.periodMonth}/${payroll.periodYear}`,
      total_sessions: payroll.totalSessions,
      attended_sessions: payroll.attendedSessions,
      absent_sessions: payroll.absentSessions,
      late_sessions: payroll.lateSessions,
      base_salary: payroll.baseSalary,
      session_rate: payroll.sessionRate,
      attendance_bonus: payroll.attendanceBonus,
      overtime_pay: payroll.overtimePay,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      gross_salary: payroll.grossSalary,
      net_salary: payroll.netSalary,
      status: payroll.status,
      status_text: getStatusText(payroll.status),
      attendance_percentage:
        payroll.totalSessions > 0
          ? Math.round(
              (payroll.attendedSessions / payroll.totalSessions) * 100 * 100,
            ) / 100
          : 0,
      generated_at: payroll.createdAt.toISOString(),
      approved_at: payroll.approvedAt?.toISOString(),
      paid_at: payroll.paidAt?.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      payrolls,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        totalBaseSalary: summary._sum.baseSalary || 0,
        totalGrossSalary: summary._sum.grossSalary || 0,
        totalNetSalary: summary._sum.netSalary || 0,
        totalAllowances: summary._sum.allowances || 0,
        totalDeductions: summary._sum.deductions || 0,
        totalRecords: summary._count._all,
      },
      message: "Data payroll berhasil dimuat",
    });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data payroll",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT - Update status payroll (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approved_by, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "ID dan status wajib diisi",
        },
        { status: 400 },
      );
    }

    if (!["APPROVED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status harus APPROVED atau CANCELLED",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `
      UPDATE payroll SET
        status = ?,
        approved_by = ?,
        approved_at = CASE WHEN ? = 'APPROVED' THEN CURRENT_TIMESTAMP ELSE NULL END,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [status, approved_by, status, notes, id],
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data payroll tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payroll berhasil ${status === "APPROVED" ? "disetujui" : "dibatalkan"}`,
    });
  } catch (error) {
    console.error("Error updating payroll status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengupdate status payroll",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE - Hapus payroll (hanya yang masih draft)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID payroll wajib diisi",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if payroll is still in draft status
    const [payroll] = await connection.execute(
      "SELECT status FROM payroll WHERE id = ?",
      [id],
    );

    if ((payroll as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          message: "Data payroll tidak ditemukan",
        },
        { status: 404 },
      );
    }

    if ((payroll as any[])[0].status !== "DRAFT") {
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          message: "Hanya payroll dengan status DRAFT yang dapat dihapus",
        },
        { status: 400 },
      );
    }

    const [result] = await connection.execute(
      "DELETE FROM payroll WHERE id = ?",
      [id],
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Data payroll berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus data payroll",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

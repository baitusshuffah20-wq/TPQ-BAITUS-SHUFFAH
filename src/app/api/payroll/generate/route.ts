import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// POST - Generate payroll untuk periode tertentu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year, employee_ids = [], generated_by } = body;

    // Validasi input
    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          message: "Bulan dan tahun wajib diisi",
        },
        { status: 400 },
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          message: "Bulan harus antara 1-12",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      await connection.beginTransaction();

      // Get employees (musyrif dan staff)
      let employeeQuery = `
        SELECT DISTINCT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.role as position
        FROM users u
        WHERE u.role IN ('MUSYRIF', 'ADMIN', 'STAFF')
        AND u.status = 'ACTIVE'
      `;

      let queryParams: any[] = [];

      if (employee_ids.length > 0) {
        employeeQuery += ` AND u.id IN (${employee_ids.map(() => "?").join(",")})`;
        queryParams = employee_ids;
      }

      const [employees] = await connection.execute(employeeQuery, queryParams);

      const results = [];

      for (const employee of employees as any[]) {
        // Check if payroll already exists
        const [existing] = await connection.execute(
          `SELECT id FROM payroll 
           WHERE employee_id = ? AND period_month = ? AND period_year = ?`,
          [employee.id, month, year],
        );

        if ((existing as any[]).length > 0) {
          results.push({
            employee_id: employee.id,
            employee_name: employee.name,
            status: "skipped",
            message: "Payroll sudah ada untuk periode ini",
          });
          continue;
        }

        // Get salary settings for this position
        const [salarySettings] = await connection.execute(
          `SELECT * FROM salary_settings 
           WHERE position = ? AND is_active = TRUE`,
          [employee.position],
        );

        if ((salarySettings as any[]).length === 0) {
          results.push({
            employee_id: employee.id,
            employee_name: employee.name,
            status: "error",
            message: "Pengaturan gaji tidak ditemukan untuk posisi ini",
          });
          continue;
        }

        const setting = (salarySettings as any[])[0];
        const allowances = setting.allowances
          ? JSON.parse(setting.allowances)
          : {};
        const deductions = setting.deductions
          ? JSON.parse(setting.deductions)
          : {};

        let payrollData;

        if (employee.position === "MUSYRIF") {
          // Calculate based on attendance for MUSYRIF
          payrollData = await calculateMusyrifPayroll(
            connection,
            employee,
            setting,
            month,
            year,
            allowances,
            deductions,
          );
        } else {
          // Fixed salary for ADMIN/STAFF
          payrollData = await calculateFixedPayroll(
            connection,
            employee,
            setting,
            month,
            year,
            allowances,
            deductions,
          );
        }

        // Insert payroll record
        const [insertResult] = await connection.execute(
          `
          INSERT INTO payroll (
            employee_id, employee_name, employee_position,
            period_month, period_year,
            total_sessions, attended_sessions, absent_sessions, late_sessions,
            base_salary, session_rate, attendance_bonus, overtime_pay,
            allowances, deductions, gross_salary, net_salary,
            status, calculation_details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            employee.id,
            employee.name,
            employee.position,
            month,
            year,
            payrollData.total_sessions,
            payrollData.attended_sessions,
            payrollData.absent_sessions,
            payrollData.late_sessions,
            payrollData.base_salary,
            payrollData.session_rate,
            payrollData.attendance_bonus,
            payrollData.overtime_pay,
            payrollData.allowances_total,
            payrollData.deductions_total,
            payrollData.gross_salary,
            payrollData.net_salary,
            "DRAFT",
            JSON.stringify(payrollData.calculation_details),
          ],
        );

        results.push({
          employee_id: employee.id,
          employee_name: employee.name,
          status: "success",
          payroll_id: (insertResult as any).insertId,
          net_salary: payrollData.net_salary,
        });
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: `Payroll berhasil digenerate untuk ${results.filter((r) => r.status === "success").length} karyawan`,
        results,
        period: `${month}/${year}`,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error generating payroll:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal generate payroll",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Function to calculate musyrif payroll based on attendance
async function calculateMusyrifPayroll(
  connection: mysql.Connection,
  employee: any,
  setting: any,
  month: number,
  year: number,
  allowances: any,
  deductions: any,
) {
  // Get attendance data for musyrif
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Get halaqah schedules for this musyrif
  const [schedules] = await connection.execute(
    `
    SELECT COUNT(*) as total_sessions
    FROM halaqah h
    WHERE h.musyrif_id = ?
    AND h.status = 'ACTIVE'
  `,
    [employee.id],
  );

  // Estimate total sessions in a month (assuming 4 weeks)
  const sessionsPerWeek = (schedules as any[])[0]?.total_sessions || 0;
  const totalSessions = sessionsPerWeek * 4; // 4 weeks per month

  // Get actual attendance from attendance table
  const [attendance] = await connection.execute(
    `
    SELECT 
      COUNT(*) as attended_sessions,
      SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_sessions,
      SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late_sessions
    FROM attendance a
    JOIN halaqah h ON a.halaqah_id = h.id
    WHERE h.musyrif_id = ?
    AND DATE(a.date) BETWEEN ? AND ?
  `,
    [
      employee.id,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ],
  );

  const attendanceData = (attendance as any[])[0] || {
    attended_sessions: 0,
    absent_sessions: 0,
    late_sessions: 0,
  };

  // Calculate salary
  const sessionRate = parseFloat(setting.base_amount);
  const baseSalary = attendanceData.attended_sessions * sessionRate;

  // Calculate allowances
  let allowancesTotal = 0;
  Object.values(allowances).forEach((amount: any) => {
    allowancesTotal += parseFloat(amount) || 0;
  });

  // Calculate deductions (including late penalty)
  let deductionsTotal = 0;
  Object.values(deductions).forEach((amount: any) => {
    deductionsTotal += parseFloat(amount) || 0;
  });

  // Late penalty
  const latePenalty =
    attendanceData.late_sessions * (deductions.late_penalty || 0);
  deductionsTotal += latePenalty;

  // Attendance bonus (if attendance > 90%)
  const attendancePercentage =
    totalSessions > 0
      ? (attendanceData.attended_sessions / totalSessions) * 100
      : 0;
  const attendanceBonus = attendancePercentage >= 90 ? sessionRate * 2 : 0; // 2x session rate as bonus

  const grossSalary = baseSalary + allowancesTotal + attendanceBonus;
  const netSalary = grossSalary - deductionsTotal;

  return {
    total_sessions: totalSessions,
    attended_sessions: attendanceData.attended_sessions,
    absent_sessions: attendanceData.absent_sessions,
    late_sessions: attendanceData.late_sessions,
    base_salary: baseSalary,
    session_rate: sessionRate,
    attendance_bonus: attendanceBonus,
    overtime_pay: 0,
    allowances_total: allowancesTotal,
    deductions_total: deductionsTotal,
    gross_salary: grossSalary,
    net_salary: netSalary,
    calculation_details: {
      session_rate: sessionRate,
      attendance_percentage: attendancePercentage,
      late_penalty: latePenalty,
      allowances_breakdown: allowances,
      deductions_breakdown: { ...deductions, late_penalty: latePenalty },
    },
  };
}

// Function to calculate fixed salary for admin/staff
async function calculateFixedPayroll(
  connection: mysql.Connection,
  employee: any,
  setting: any,
  month: number,
  year: number,
  allowances: any,
  deductions: any,
) {
  const baseSalary = parseFloat(setting.base_amount);

  // Get attendance data for fixed salary employees (for bonus calculation)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const workingDays = getWorkingDaysInMonth(year, month);

  // Check attendance if available
  const [attendance] = await connection.execute(
    `
    SELECT COUNT(DISTINCT DATE(created_at)) as days_present
    FROM attendance a
    WHERE a.recorded_by = ?
    AND DATE(a.created_at) BETWEEN ? AND ?
  `,
    [
      employee.id,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ],
  );

  const daysPresent = (attendance as any[])[0]?.days_present || workingDays;
  const attendancePercentage = (daysPresent / workingDays) * 100;

  // Calculate allowances
  let allowancesTotal = 0;
  Object.values(allowances).forEach((amount: any) => {
    allowancesTotal += parseFloat(amount) || 0;
  });

  // Calculate deductions
  let deductionsTotal = 0;
  Object.values(deductions).forEach((amount: any) => {
    deductionsTotal += parseFloat(amount) || 0;
  });

  // Attendance bonus for fixed salary employees
  const attendanceBonus = attendancePercentage >= 95 ? baseSalary * 0.05 : 0; // 5% bonus

  const grossSalary = baseSalary + allowancesTotal + attendanceBonus;
  const netSalary = grossSalary - deductionsTotal;

  return {
    total_sessions: workingDays,
    attended_sessions: daysPresent,
    absent_sessions: workingDays - daysPresent,
    late_sessions: 0,
    base_salary: baseSalary,
    session_rate: 0,
    attendance_bonus: attendanceBonus,
    overtime_pay: 0,
    allowances_total: allowancesTotal,
    deductions_total: deductionsTotal,
    gross_salary: grossSalary,
    net_salary: netSalary,
    calculation_details: {
      salary_type: "FIXED",
      working_days: workingDays,
      days_present: daysPresent,
      attendance_percentage: attendancePercentage,
      allowances_breakdown: allowances,
      deductions_breakdown: deductions,
    },
  };
}

// Helper function to get working days in a month
function getWorkingDaysInMonth(year: number, month: number): number {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  let workingDays = 0;

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getDay();
    // Exclude Sunday (0) - assuming Sunday is off day
    if (dayOfWeek !== 0) {
      workingDays++;
    }
  }

  return workingDays;
}

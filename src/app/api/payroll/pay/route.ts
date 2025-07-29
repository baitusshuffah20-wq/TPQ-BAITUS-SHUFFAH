import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// POST - Bayar gaji karyawan dan catat ke keuangan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      payroll_id,
      payment_method = "CASH",
      payment_date,
      reference_number,
      paid_by,
      notes,
    } = body;

    // Validasi input
    if (!payroll_id || !payment_date || !paid_by) {
      return NextResponse.json(
        {
          success: false,
          message: "Payroll ID, tanggal pembayaran, dan pembayar wajib diisi",
        },
        { status: 400 },
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      await connection.beginTransaction();

      // Get payroll data
      const [payrollData] = await connection.execute(
        `
        SELECT 
          p.*,
          u.name as employee_full_name,
          u.email as employee_email
        FROM payroll p
        LEFT JOIN users u ON p.employee_id = u.id
        WHERE p.id = ?
      `,
        [payroll_id],
      );

      if ((payrollData as any[]).length === 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Data payroll tidak ditemukan",
          },
          { status: 404 },
        );
      }

      const payroll = (payrollData as any[])[0];

      // Check if payroll is approved
      if (payroll.status !== "APPROVED") {
        await connection.rollback();
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Payroll harus disetujui terlebih dahulu sebelum dibayar",
          },
          { status: 400 },
        );
      }

      // Check if already paid
      const [existingPayment] = await connection.execute(
        "SELECT id FROM salary_payments WHERE payroll_id = ?",
        [payroll_id],
      );

      if ((existingPayment as any[]).length > 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Gaji untuk payroll ini sudah dibayar",
          },
          { status: 400 },
        );
      }

      // Insert salary payment record
      const [paymentResult] = await connection.execute(
        `
        INSERT INTO salary_payments (
          payroll_id, employee_id, employee_name, amount,
          payment_method, payment_date, reference_number,
          paid_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          payroll_id,
          payroll.employee_id,
          payroll.employee_name,
          payroll.net_salary,
          payment_method,
          payment_date,
          reference_number,
          paid_by,
          notes,
        ],
      );

      const paymentId = (paymentResult as any).insertId;

      // Create finance transaction record
      const financeTransactionId = await createFinanceTransaction(connection, {
        type: "EXPENSE",
        category: "SALARY",
        description: `Pembayaran gaji ${payroll.employee_name} - ${payroll.period_month}/${payroll.period_year}`,
        amount: parseFloat(payroll.net_salary),
        date: payment_date,
        reference: `SALARY-${payroll_id}`,
        payment_method,
        reference_number,
        created_by: paid_by,
        metadata: {
          payroll_id,
          employee_id: payroll.employee_id,
          employee_name: payroll.employee_name,
          period: `${payroll.period_month}/${payroll.period_year}`,
          gross_salary: parseFloat(payroll.gross_salary),
          deductions: parseFloat(payroll.deductions),
          net_salary: parseFloat(payroll.net_salary),
        },
      });

      // Update salary payment with finance transaction ID
      await connection.execute(
        `
        UPDATE salary_payments SET
          finance_transaction_id = ?,
          is_recorded_in_finance = TRUE
        WHERE id = ?
      `,
        [financeTransactionId, paymentId],
      );

      // Update payroll status to PAID
      await connection.execute(
        `
        UPDATE payroll SET
          status = 'PAID',
          paid_at = CURRENT_TIMESTAMP,
          paid_by = ?
        WHERE id = ?
      `,
        [paid_by, payroll_id],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Gaji berhasil dibayar dan dicatat ke keuangan",
        payment_id: paymentId,
        finance_transaction_id: financeTransactionId,
        amount: parseFloat(payroll.net_salary),
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error processing salary payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses pembayaran gaji",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Function to create finance transaction
async function createFinanceTransaction(
  connection: mysql.Connection,
  transactionData: {
    type: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    reference: string;
    payment_method: string;
    reference_number?: string;
    created_by: string;
    metadata: any;
  },
) {
  // Check if finance_transactions table exists, if not create a simple version
  try {
    const [result] = await connection.execute(
      `
      INSERT INTO finance_transactions (
        type, category, description, amount, date,
        reference, payment_method, reference_number,
        created_by, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        transactionData.type,
        transactionData.category,
        transactionData.description,
        transactionData.amount,
        transactionData.date,
        transactionData.reference,
        transactionData.payment_method,
        transactionData.reference_number,
        transactionData.created_by,
        JSON.stringify(transactionData.metadata),
      ],
    );

    return (result as any).insertId;
  } catch (error) {
    // If table doesn't exist, create it first
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        type ENUM('INCOME', 'EXPENSE') NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        date DATE NOT NULL,
        reference VARCHAR(100),
        payment_method VARCHAR(20),
        reference_number VARCHAR(50),
        created_by VARCHAR(36),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_date (date),
        INDEX idx_reference (reference)
      )
    `);

    // Try insert again
    const [result] = await connection.execute(
      `
      INSERT INTO finance_transactions (
        type, category, description, amount, date,
        reference, payment_method, reference_number,
        created_by, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        transactionData.type,
        transactionData.category,
        transactionData.description,
        transactionData.amount,
        transactionData.date,
        transactionData.reference,
        transactionData.payment_method,
        transactionData.reference_number,
        transactionData.created_by,
        JSON.stringify(transactionData.metadata),
      ],
    );

    return (result as any).insertId;
  }
}

// GET - Ambil riwayat pembayaran gaji
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get("employee_id");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const connection = await mysql.createConnection(dbConfig);

    const whereConditions = [];
    const queryParams: any[] = [];

    if (employee_id) {
      whereConditions.push("sp.employee_id = ?");
      queryParams.push(employee_id);
    }

    if (month && year) {
      whereConditions.push("p.period_month = ? AND p.period_year = ?");
      queryParams.push(parseInt(month), parseInt(year));
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const [rows] = await connection.execute(
      `
      SELECT 
        sp.*,
        p.period_month,
        p.period_year,
        p.gross_salary,
        p.deductions,
        CONCAT(p.period_month, '/', p.period_year) as period_display,
        ft.id as finance_transaction_exists
      FROM salary_payments sp
      JOIN payroll p ON sp.payroll_id = p.id
      LEFT JOIN finance_transactions ft ON sp.finance_transaction_id = ft.id
      ${whereClause}
      ORDER BY sp.payment_date DESC, sp.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await connection.execute(
      `
      SELECT COUNT(*) as total
      FROM salary_payments sp
      JOIN payroll p ON sp.payroll_id = p.id
      ${whereClause}
    `,
      queryParams,
    );

    await connection.end();

    const payments = (rows as any[]).map((payment) => ({
      ...payment,
      amount: parseFloat(payment.amount),
      gross_salary: parseFloat(payment.gross_salary),
      deductions: parseFloat(payment.deductions),
    }));

    const total = (countResult as any[])[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      message: "Riwayat pembayaran gaji berhasil dimuat",
    });
  } catch (error) {
    console.error("Error fetching salary payments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat riwayat pembayaran gaji",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

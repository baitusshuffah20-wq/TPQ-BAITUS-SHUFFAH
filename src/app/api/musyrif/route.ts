import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

export async function GET(req: NextRequest) {
  let connection;
  try {
    console.log("🔌 Connecting to database for Musyrif API...");
    connection = await mysql.createConnection(dbConfig);

    const url = new URL(req.url);
    const halaqahId = url.searchParams.get("halaqahId");
    const status = url.searchParams.get("status");

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (halaqahId) {
      whereClause += " AND u.halaqahId = ?";
      params.push(halaqahId);
    }

    if (status) {
      whereClause += " AND u.status = ?";
      params.push(status);
    }

    // Get musyrif data from users table (users with role MUSYRIF)
    const [musyrifResult] = await connection.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.avatar,
        u.status,
        u.createdAt,
        h.name as halaqahName,
        h.id as halaqahId,
        m.photo as musyrifPhoto,
        COUNT(s.id) as totalSantri
       FROM users u
       LEFT JOIN musyrif m ON u.id = m.userId
       LEFT JOIN halaqah h ON u.halaqahId = h.id
       LEFT JOIN santri s ON h.id = s.halaqahId AND s.status = 'ACTIVE'
       ${whereClause} AND u.role = 'MUSYRIF'
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar, u.status, u.createdAt, h.name, h.id, m.photo
       ORDER BY u.name ASC`,
      params,
    );

    const musyrif = (musyrifResult as any[]).map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      photo: m.musyrifPhoto || m.avatar, // Use musyrif photo first, fallback to user avatar
      status: m.status,
      createdAt: m.createdAt,
      halaqah: m.halaqahId
        ? {
            id: m.halaqahId,
            name: m.halaqahName,
          }
        : null,
      totalSantri: m.totalSantri || 0,
      education: [], // Can be extended later
      experience: [], // Can be extended later
      certificates: [], // Can be extended later
    }));

    console.log(`✅ Found ${musyrif.length} musyrif`);

    return NextResponse.json({
      success: true,
      musyrif,
      total: musyrif.length,
    });
  } catch (err) {
    console.error("❌ Error fetching musyrif:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!validateMusyrifData(data)) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    let userId = data.userId;

    if (data.createAccount && !userId) {
      if (!data.password) {
        return NextResponse.json(
          { success: false, message: "Password diperlukan" },
          { status: 400 },
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email sudah terdaftar" },
          { status: 400 },
        );
      }

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "MUSYRIF",
        },
      });
      userId = newUser.id;
    }

    const musyrif = await prisma.musyrif.create({
      data: {
        name: data.name,
        gender: data.gender,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        address: data.address,
        phone: data.phone,
        email: data.email,
        specialization: data.specialization,
        joinDate: new Date(data.joinDate),
        status: data.status,
        photo: data.photo,
        halaqah: data.halaqahId
          ? { connect: { id: data.halaqahId } }
          : undefined,
        userId: userId || null,
        educationData: data.education ? JSON.stringify(data.education) : null,
        experienceData: data.experience
          ? JSON.stringify(data.experience)
          : null,
        certificatesData: data.certificates
          ? JSON.stringify(data.certificates)
          : null,
      },
      include: {
        halaqah: true,
        user: true,
      },
    });

    return NextResponse.json({ success: true, musyrif });
  } catch (err) {
    console.error("Error creating musyrif:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

function validateMusyrifData(data: any): boolean {
  return !!(
    data.name &&
    data.gender &&
    data.birthPlace &&
    data.birthDate &&
    data.address &&
    data.phone &&
    data.email
  );
}

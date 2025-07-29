import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// GET /api/halaqah/resources - Get available musyrif and santri for halaqah assignment
export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log("🔌 Connecting to database for Halaqah Resources...");
    connection = await mysql.createConnection(dbConfig);

    // Get available musyrif (not assigned to any halaqah or specifically requested)
    const [musyrifResult] = await connection.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.isActive,
        u.createdAt,
        h.name as currentHalaqahName,
        h.id as currentHalaqahId
       FROM users u
       LEFT JOIN halaqah h ON u.halaqahId = h.id
       WHERE u.role = 'MUSYRIF' AND u.isActive = 1
       ORDER BY u.name ASC`,
    );

    // Get available santri (not assigned to any halaqah or specifically requested)
    const [santriResult] = await connection.execute(
      `SELECT 
        s.id,
        s.nis,
        s.name,
        s.gender,
        s.birthDate,
        s.phone,
        s.address,
        s.status,
        s.enrollmentDate,
        h.name as currentHalaqahName,
        h.id as currentHalaqahId,
        AVG(hf.grade) as averageGrade,
        COUNT(hf.id) as totalHafalan
       FROM santri s
       LEFT JOIN halaqah h ON s.halaqahId = h.id
       LEFT JOIN hafalan hf ON s.id = hf.santriId
       WHERE s.status = 'ACTIVE'
       GROUP BY s.id, s.nis, s.name, s.gender, s.birthDate, s.phone, s.address, s.status, s.enrollmentDate, h.name, h.id
       ORDER BY s.name ASC`,
    );

    // Get room/location suggestions
    const [roomResult] = await connection.execute(
      `SELECT DISTINCT room 
       FROM halaqah 
       WHERE room IS NOT NULL AND room != ''
       ORDER BY room ASC`,
    );

    // Get schedule patterns
    const schedulePatterns = [
      {
        id: "senin-rabu-jumat",
        name: "Senin, Rabu, Jumat",
        days: ["Senin", "Rabu", "Jumat"],
        time: "16:00-17:30",
      },
      {
        id: "selasa-kamis-sabtu",
        name: "Selasa, Kamis, Sabtu",
        days: ["Selasa", "Kamis", "Sabtu"],
        time: "16:00-17:30",
      },
      {
        id: "sabtu-minggu",
        name: "Sabtu, Minggu",
        days: ["Sabtu", "Minggu"],
        time: "08:00-10:00",
      },
      {
        id: "harian",
        name: "Setiap Hari",
        days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
        time: "16:00-17:30",
      },
    ];

    // Categorize musyrif
    const availableMusyrif = (musyrifResult as any[]).filter(
      (m) => !m.currentHalaqahId,
    );
    const assignedMusyrif = (musyrifResult as any[]).filter(
      (m) => m.currentHalaqahId,
    );

    // Categorize santri
    const availableSantri = (santriResult as any[]).filter(
      (s) => !s.currentHalaqahId,
    );
    const assignedSantri = (santriResult as any[]).filter(
      (s) => s.currentHalaqahId,
    );

    // Format santri data
    const formatSantri = (santri: any[]) =>
      santri.map((s) => ({
        id: s.id,
        nis: s.nis,
        name: s.name,
        gender: s.gender,
        birthDate: s.birthDate,
        age: s.birthDate
          ? Math.floor(
              (Date.now() - new Date(s.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000),
            )
          : null,
        phone: s.phone,
        address: s.address,
        status: s.status,
        enrollmentDate: s.enrollmentDate,
        currentHalaqah: s.currentHalaqahId
          ? {
              id: s.currentHalaqahId,
              name: s.currentHalaqahName,
            }
          : null,
        averageGrade: s.averageGrade
          ? Math.round(parseFloat(s.averageGrade) * 10) / 10
          : 0,
        totalHafalan: s.totalHafalan || 0,
      }));

    // Get capacity recommendations based on existing halaqah
    const [capacityResult] = await connection.execute(
      `SELECT 
        AVG(capacity) as avgCapacity,
        MIN(capacity) as minCapacity,
        MAX(capacity) as maxCapacity,
        COUNT(*) as totalHalaqah
       FROM halaqah 
       WHERE status = 'ACTIVE' AND capacity > 0`,
    );

    const capacityStats = (capacityResult as any)[0];
    const recommendedCapacities = [
      {
        value: 10,
        label: "10 santri (Kecil)",
        description: "Ideal untuk pembelajaran intensif",
      },
      {
        value: 15,
        label: "15 santri (Sedang)",
        description: "Standar untuk halaqah reguler",
      },
      {
        value: 20,
        label: "20 santri (Besar)",
        description: "Untuk halaqah dengan banyak peserta",
      },
      {
        value: Math.round(capacityStats?.avgCapacity || 15),
        label: `${Math.round(capacityStats?.avgCapacity || 15)} santri (Rata-rata TPQ)`,
        description: "Berdasarkan rata-rata halaqah yang ada",
      },
    ];

    console.log(
      `✅ Found ${availableMusyrif.length} available musyrif and ${availableSantri.length} available santri`,
    );

    return NextResponse.json({
      success: true,
      data: {
        musyrif: {
          available: musyrifResult as any[],
          availableCount: availableMusyrif.length,
          assignedCount: assignedMusyrif.length,
          total: (musyrifResult as any[]).length,
        },
        santri: {
          available: formatSantri(availableSantri),
          assigned: formatSantri(assignedSantri),
          availableCount: availableSantri.length,
          assignedCount: assignedSantri.length,
          total: (santriResult as any[]).length,
        },
        rooms: (roomResult as any[]).map((r) => r.room),
        schedulePatterns,
        capacityRecommendations: recommendedCapacities,
        statistics: {
          totalMusyrif: (musyrifResult as any[]).length,
          totalSantri: (santriResult as any[]).length,
          availableMusyrif: availableMusyrif.length,
          availableSantri: availableSantri.length,
          averageCapacity: Math.round(capacityStats?.avgCapacity || 15),
          capacityRange: {
            min: capacityStats?.minCapacity || 10,
            max: capacityStats?.maxCapacity || 20,
          },
        },
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching halaqah resources:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch halaqah resources" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// POST /api/halaqah/resources/assign - Assign musyrif or santri to halaqah
export async function POST(request: NextRequest) {
  let connection;
  try {
    console.log("🔌 Assigning resources to halaqah...");
    connection = await mysql.createConnection(dbConfig);

    const body = await request.json();
    const { halaqahId, musyrifId, santriIds, action } = body;

    if (!halaqahId || !action) {
      return NextResponse.json(
        { success: false, error: "Halaqah ID and action are required" },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    try {
      let result = {};

      if (action === "assign_musyrif" && musyrifId) {
        // Assign musyrif to halaqah
        await connection.execute(
          `UPDATE users SET halaqahId = ? WHERE id = ? AND role = 'MUSYRIF'`,
          [halaqahId, musyrifId],
        );
        result = { musyrifAssigned: musyrifId };
      }

      if (action === "assign_santri" && santriIds && Array.isArray(santriIds)) {
        // Assign santri to halaqah
        for (const santriId of santriIds) {
          await connection.execute(
            `UPDATE santri SET halaqahId = ? WHERE id = ?`,
            [halaqahId, santriId],
          );
        }
        result = { santriAssigned: santriIds.length };
      }

      if (action === "remove_musyrif" && musyrifId) {
        // Remove musyrif from halaqah
        await connection.execute(
          `UPDATE users SET halaqahId = NULL WHERE id = ? AND role = 'MUSYRIF'`,
          [musyrifId],
        );
        result = { musyrifRemoved: musyrifId };
      }

      if (action === "remove_santri" && santriIds && Array.isArray(santriIds)) {
        // Remove santri from halaqah
        for (const santriId of santriIds) {
          await connection.execute(
            `UPDATE santri SET halaqahId = NULL WHERE id = ?`,
            [santriId],
          );
        }
        result = { santriRemoved: santriIds.length };
      }

      await connection.commit();

      console.log(`✅ Resource assignment completed:`, result);

      return NextResponse.json({
        success: true,
        data: result,
        message: "Penugasan berhasil diperbarui",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Error assigning resources:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign resources" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

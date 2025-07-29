import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// GET /api/achievements - Get all achievements
export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Check if database exists
    try {
      await connection.query(`USE ${dbConfig.database}`);
    } catch (dbError) {
      console.log(
        `Database ${dbConfig.database} does not exist, creating it...`,
      );
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`,
      );
      await connection.query(`USE ${dbConfig.database}`);
    }

    // Check if achievement_badges table exists
    let badgesTableExists = true;
    try {
      await connection.execute("SELECT 1 FROM achievement_badges LIMIT 1");
      console.log("Table achievement_badges exists");
    } catch (error) {
      console.log("Table achievement_badges does not exist, creating it...");
      badgesTableExists = false;

      // Create achievement_badges table
      await connection.execute(`
        CREATE TABLE achievement_badges (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          nameArabic VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          icon VARCHAR(50) NOT NULL,
          color VARCHAR(20) NOT NULL,
          category ENUM('HAFALAN', 'ATTENDANCE', 'BEHAVIOR', 'ACADEMIC', 'SPECIAL') NOT NULL,
          criteriaType ENUM('SURAH_COUNT', 'AYAH_COUNT', 'PERFECT_SCORE', 'STREAK', 'TIME_BASED', 'CUSTOM') NOT NULL,
          criteriaValue INT NOT NULL,
          criteriaCondition ENUM('GREATER_THAN', 'EQUAL', 'LESS_THAN', 'BETWEEN') NOT NULL,
          timeframe ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ALL_TIME'),
          rarity ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL,
          points INT NOT NULL,
          isActive BOOLEAN NOT NULL DEFAULT TRUE,
          unlockMessage TEXT NOT NULL,
          shareMessage TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("Table achievement_badges created successfully");

      // Insert sample achievement badges
      await connection.execute(`
        INSERT INTO achievement_badges (
          id, name, nameArabic, description, icon, color, category,
          criteriaType, criteriaValue, criteriaCondition, rarity, points,
          unlockMessage, shareMessage
        ) VALUES
        ('badge_first_surah', 'Surah Pertama', 'السورة الأولى', 'Menghafal surah pertama', 'book', 'green', 'HAFALAN', 'SURAH_COUNT', 1, 'GREATER_THAN', 'COMMON', 10, 'Selamat! Anda telah menghafal surah pertama!', 'Alhamdulillah, saya telah menghafal surah pertama!'),
        ('badge_10_surah', '10 Surah', 'عشر سور', 'Menghafal 10 surah', 'award', 'blue', 'HAFALAN', 'SURAH_COUNT', 10, 'GREATER_THAN', 'UNCOMMON', 50, 'Masya Allah! Anda telah menghafal 10 surah!', 'Alhamdulillah, saya telah menghafal 10 surah!'),
        ('badge_perfect_score', 'Nilai Sempurna', 'الدرجة الكاملة', 'Mendapat nilai sempurna dalam ujian', 'star', 'gold', 'ACADEMIC', 'PERFECT_SCORE', 1, 'GREATER_THAN', 'RARE', 25, 'Excellent! Nilai sempurna!', 'Alhamdulillah, saya mendapat nilai sempurna!'),
        ('badge_attendance', 'Rajin Hadir', 'المواظبة', 'Hadir setiap hari selama sebulan', 'calendar', 'purple', 'ATTENDANCE', 'STREAK', 30, 'GREATER_THAN', 'COMMON', 15, 'Bagus! Anda rajin hadir!', 'Alhamdulillah, saya rajin hadir di TPQ!')
      `);
      console.log("Sample achievement badges inserted");
    }

    // Check if badges table is empty and insert sample data if table exists but is empty
    if (badgesTableExists) {
      const [badgeCount] = await connection.execute(
        "SELECT COUNT(*) as count FROM achievement_badges",
      );
      const count = (badgeCount as any[])[0]?.count || 0;

      if (count === 0) {
        console.log("Badges table is empty, inserting sample data...");
        await connection.execute(`
          INSERT INTO achievement_badges (
            id, name, nameArabic, description, icon, color, category,
            criteriaType, criteriaValue, criteriaCondition, rarity, points,
            unlockMessage, shareMessage
          ) VALUES
          ('badge_first_surah', 'Surah Pertama', 'السورة الأولى', 'Menghafal surah pertama', 'book', 'green', 'HAFALAN', 'SURAH_COUNT', 1, 'GREATER_THAN', 'COMMON', 10, 'Selamat! Anda telah menghafal surah pertama!', 'Alhamdulillah, saya telah menghafal surah pertama!'),
          ('badge_10_surah', '10 Surah', 'عشر سور', 'Menghafal 10 surah', 'award', 'blue', 'HAFALAN', 'SURAH_COUNT', 10, 'GREATER_THAN', 'UNCOMMON', 50, 'Masya Allah! Anda telah menghafal 10 surah!', 'Alhamdulillah, saya telah menghafal 10 surah!'),
          ('badge_perfect_score', 'Nilai Sempurna', 'الدرجة الكاملة', 'Mendapat nilai sempurna dalam ujian', 'star', 'gold', 'ACADEMIC', 'PERFECT_SCORE', 1, 'GREATER_THAN', 'RARE', 25, 'Excellent! Nilai sempurna!', 'Alhamdulillah, saya mendapat nilai sempurna!'),
          ('badge_attendance', 'Rajin Hadir', 'المواظبة', 'Hadir setiap hari selama sebulan', 'calendar', 'purple', 'ATTENDANCE', 'STREAK', 30, 'GREATER_THAN', 'COMMON', 15, 'Bagus! Anda rajin hadir!', 'Alhamdulillah, saya rajin hadir di TPQ!')
        `);
        console.log("Sample achievement badges inserted to existing table");
      }
    }

    // Check if santri_achievements table exists
    let achievementsTableExists = true;
    try {
      await connection.execute("SELECT 1 FROM santri_achievements LIMIT 1");
      console.log("Table santri_achievements exists");
    } catch (error) {
      console.log("Table santri_achievements does not exist, creating it...");
      achievementsTableExists = false;

      // Create santri_achievements table
      await connection.execute(`
        CREATE TABLE santri_achievements (
          id VARCHAR(50) PRIMARY KEY,
          santriId VARCHAR(50) NOT NULL,
          badgeId VARCHAR(50) NOT NULL,
          achievedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          progress INT NOT NULL DEFAULT 100,
          isUnlocked BOOLEAN NOT NULL DEFAULT TRUE,
          notificationSent BOOLEAN NOT NULL DEFAULT FALSE,
          certificateGenerated BOOLEAN NOT NULL DEFAULT FALSE,
          certificateUrl VARCHAR(255),
          sharedAt DATETIME,
          metadata JSON,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY (santriId, badgeId)
        )
      `);
      console.log("Table santri_achievements created successfully");
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const rarity = searchParams.get("rarity");
    const santriId = searchParams.get("santriId");
    const isActive = searchParams.get("isActive");

    // Build query for achievement badges
    let badgesQuery = "SELECT * FROM achievement_badges";
    const badgesParams: any[] = [];

    if (category || rarity || isActive) {
      badgesQuery += " WHERE";

      if (category) {
        badgesQuery += " category = ?";
        badgesParams.push(category);
      }

      if (rarity) {
        if (badgesParams.length > 0) badgesQuery += " AND";
        badgesQuery += " rarity = ?";
        badgesParams.push(rarity);
      }

      if (isActive) {
        if (badgesParams.length > 0) badgesQuery += " AND";
        badgesQuery += " isActive = ?";
        badgesParams.push(isActive === "true" ? 1 : 0);
      }
    }

    badgesQuery += " ORDER BY rarity, name";

    // Execute query for badges
    const [badgesRows] = await connection.execute(badgesQuery, badgesParams);

    // Build query for santri achievements with error handling for missing santri table
    let achievementsQuery = `
      SELECT sa.*,
             COALESCE(s.name, 'Unknown Santri') as santriName,
             COALESCE(s.nis, 'N/A') as santriNis,
             COALESCE(h.name, 'N/A') as halaqahName,
             ab.name as badgeName
      FROM santri_achievements sa
      LEFT JOIN santri s ON sa.santriId = s.id
      LEFT JOIN halaqah h ON s.halaqahId = h.id
      JOIN achievement_badges ab ON sa.badgeId = ab.id
    `;
    const achievementsParams: any[] = [];

    if (santriId) {
      achievementsQuery += " WHERE sa.santriId = ?";
      achievementsParams.push(santriId);
    }

    achievementsQuery += " ORDER BY sa.awardedAt DESC";

    // Execute query for achievements with error handling
    let achievementsRows: any[] = [];
    try {
      const [rows] = await connection.execute(
        achievementsQuery,
        achievementsParams,
      );
      achievementsRows = rows as any[];
    } catch (error) {
      console.log("Error fetching achievements, trying fallback query:", error);
      // Fallback query without joins if santri table doesn't exist
      const fallbackQuery = `
        SELECT sa.*,
               'Unknown Santri' as santriName,
               'N/A' as santriNis,
               'N/A' as halaqahName,
               ab.name as badgeName
        FROM santri_achievements sa
        JOIN achievement_badges ab ON sa.badgeId = ab.id
        ${santriId ? "WHERE sa.santriId = ?" : ""}
        ORDER BY sa.awardedAt DESC
      `;
      const [fallbackRows] = await connection.execute(
        fallbackQuery,
        santriId ? [santriId] : [],
      );
      achievementsRows = fallbackRows as any[];
    }

    // Return response
    return NextResponse.json({
      success: true,
      badges: badgesRows,
      achievements: achievementsRows,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data achievements",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST /api/achievements - Create a new achievement
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.santriId || !body.badgeId) {
      return NextResponse.json(
        { success: false, message: "santriId dan badgeId wajib diisi" },
        { status: 400 },
      );
    }

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Check if achievement already exists
    const [existingRows] = await connection.execute(
      "SELECT * FROM santri_achievements WHERE santriId = ? AND badgeId = ?",
      [body.santriId, body.badgeId],
    );

    if ((existingRows as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: "Achievement sudah ada untuk santri ini" },
        { status: 400 },
      );
    }

    // Generate ID
    const id = `ach_${Date.now()}`;

    // Prepare data
    const achievementData = {
      id,
      santriId: body.santriId,
      badgeId: body.badgeId,
      achievedAt: body.achievedAt || new Date(),
      progress: body.progress || 100,
      isUnlocked: body.isUnlocked !== undefined ? body.isUnlocked : true,
      notificationSent: body.notificationSent || false,
      certificateGenerated: body.certificateGenerated || false,
      certificateUrl: body.certificateUrl || null,
      sharedAt: body.sharedAt || null,
      metadata: body.metadata ? JSON.stringify(body.metadata) : null,
    };

    // Insert achievement (using existing table structure)
    await connection.execute(
      `INSERT INTO santri_achievements (
        id, santriId, badgeId
      ) VALUES (?, ?, ?)`,
      [achievementData.id, achievementData.santriId, achievementData.badgeId],
    );

    // Get santri and badge details with error handling
    let santriName = "Unknown Santri";
    let badgeName = "Unknown Badge";

    try {
      const [santriRows] = await connection.execute(
        "SELECT name FROM santri WHERE id = ?",
        [achievementData.santriId],
      );
      santriName = (santriRows as any[])[0]?.name || "Unknown Santri";
    } catch (error) {
      console.log("Could not fetch santri name:", error);
    }

    try {
      const [badgeRows] = await connection.execute(
        "SELECT name FROM achievement_badges WHERE id = ?",
        [achievementData.badgeId],
      );
      badgeName = (badgeRows as any[])[0]?.name || "Unknown Badge";
    } catch (error) {
      console.log("Could not fetch badge name:", error);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Achievement berhasil dibuat",
      achievement: {
        ...achievementData,
        santriName,
        badgeName,
      },
    });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat achievement",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'tpq_baitus_shuffah_new'
};

// Helper function to determine the correct table name
async function getTableName(connection: mysql.Connection): Promise<string> {
  try {
    // Check if database exists
    try {
      await connection.query(`USE ${dbConfig.database}`);
    } catch (dbError) {
      console.log(`Database ${dbConfig.database} does not exist, creating it...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
      await connection.query(`USE ${dbConfig.database}`);
    }

    // Try to query hafalan_targets
    try {
      await connection.execute('SELECT 1 FROM hafalan_targets LIMIT 1');
      console.log('Table hafalan_targets exists');
      return 'hafalan_targets';
    } catch (error) {
      console.log('Table hafalan_targets does not exist, checking alternatives...');
    }

    // Try to query hafalan_target
    try {
      await connection.execute('SELECT 1 FROM hafalan_target LIMIT 1');
      console.log('Table hafalan_target exists');
      return 'hafalan_target';
    } catch (error) {
      console.log('Table hafalan_target does not exist, checking alternatives...');
    }

    // Try to query HafalanTarget
    try {
      await connection.execute('SELECT 1 FROM HafalanTarget LIMIT 1');
      console.log('Table HafalanTarget exists');
      return 'HafalanTarget';
    } catch (error) {
      console.log('No existing target table found, creating new one...');
    }

    // Create the table if it doesn't exist
    console.log('Creating table hafalan_targets...');
    await connection.execute(`
      CREATE TABLE hafalan_targets (
        id VARCHAR(50) PRIMARY KEY,
        santriId VARCHAR(50) NOT NULL,
        santriName VARCHAR(100) NOT NULL,
        surahId INT NOT NULL,
        surahName VARCHAR(50) NOT NULL,
        targetType ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL,
        targetAyahs INT NOT NULL,
        completedAyahs INT NOT NULL DEFAULT 0,
        targetDate DATETIME NOT NULL,
        startDate DATETIME NOT NULL,
        createdBy VARCHAR(50) NOT NULL,
        createdByName VARCHAR(100) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('ACTIVE', 'COMPLETED', 'OVERDUE', 'CANCELLED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
        progress INT NOT NULL DEFAULT 0,
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
        description TEXT,
        notes TEXT,
        reminders JSON,
        milestones JSON,
        INDEX (santriId),
        INDEX (status),
        INDEX (targetDate)
      )
    `);
    console.log('Table hafalan_targets created successfully');
    return 'hafalan_targets';
  } catch (error) {
    console.error('Error in getTableName:', error);
    throw error;
  }
}

// GET /api/hafalan-targets - Get all hafalan targets
export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const targetType = searchParams.get('targetType');
    const search = searchParams.get('search');

    console.log('GET /api/hafalan-targets - Query params:', { santriId, status, priority, targetType, search });  

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Ensure connection is not null
    if (!connection) {
      throw new Error('Failed to create database connection');
    }

    // Get the correct table name
    const tableName = await getTableName(connection);
    console.log(`Using table name: ${tableName}`);

    // Check if santri table exists
    let santriTableExists = true;
    try {
      await connection.execute('SELECT 1 FROM santri LIMIT 1');
      console.log('Table santri exists');
    } catch (error) {
      console.log('Table santri does not exist, using simplified query');
      santriTableExists = false;
    }

    // Check if halaqah table exists
    let halaqahTableExists = true;
    try {
      await connection.execute('SELECT 1 FROM halaqah LIMIT 1');
      console.log('Table halaqah exists');
    } catch (error) {
      console.log('Table halaqah does not exist, using simplified query');
      halaqahTableExists = false;
    }

    // Build query based on available tables
    let query = '';

    if (santriTableExists && halaqahTableExists) {
      query = `
        SELECT
          ht.*,
          s.name as santriName,
          s.nis as santriNis,
          s.photo as santriPhoto,
          h.id as halaqahId,
          h.name as halaqahName,
          h.level as halaqahLevel
        FROM
          ${tableName} ht
        JOIN
          santri s ON ht.santriId = s.id COLLATE utf8mb4_general_ci
        LEFT JOIN
          halaqah h ON s.halaqahId = h.id COLLATE utf8mb4_general_ci
        WHERE 1=1
      `;
    } else if (santriTableExists) {
      query = `
        SELECT
          ht.*,
          s.name as santriName,
          s.nis as santriNis,
          s.photo as santriPhoto
        FROM
          ${tableName} ht
        JOIN
          santri s ON ht.santriId = s.id COLLATE utf8mb4_general_ci
        WHERE 1=1
      `;
    } else {
      query = `
        SELECT
          ht.*
        FROM
          ${tableName} ht
        WHERE 1=1
      `;
    }

    const params = [];

    if (santriId) {
      query += ` AND ht.santriId = ?`;
      params.push(santriId);
    }

    if (status && status !== 'all') {
      query += ` AND ht.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ` AND ht.priority = ?`;
      params.push(priority);
    }

    if (targetType && targetType !== 'all') {
      query += ` AND ht.targetType = ?`;
      params.push(targetType);
    }

    if (search) {
      query += ` AND (ht.surahName LIKE ? OR s.name LIKE ? OR ht.description LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY ht.updatedAt DESC`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    // Execute query
    const [rows] = await connection.execute(query, params);
    console.log(`Found ${(rows as any[]).length} target records`);

    // Format data
    const targets = (rows as any[]).map(row => {
      const formattedTarget: any = {
        id: row.id,
        santriId: row.santriId,
        santriName: row.santriName || 'Santri',
        surahId: row.surahId,
        surahName: row.surahName,
        targetType: row.targetType,
        targetAyahs: row.targetAyahs,
        completedAyahs: row.completedAyahs,
        targetDate: row.targetDate,
        startDate: row.startDate,
        createdBy: row.createdBy,
        createdByName: row.createdByName,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        status: row.status,
        progress: row.progress,
        priority: row.priority,
        description: row.description,
        notes: row.notes,
        reminders: row.reminders ? (typeof row.reminders === 'string' ? JSON.parse(row.reminders) : row.reminders) : null,
        milestones: row.milestones ? (typeof row.milestones === 'string' ? JSON.parse(row.milestones) : row.milestones) : null
      };

      // Add santri info if available
      if (row.santriNis) {
        formattedTarget.santriNis = row.santriNis;
        formattedTarget.santriPhoto = row.santriPhoto;
      }

      // Add halaqah info if available
      if (row.halaqahId) {
        formattedTarget.halaqah = {
          id: row.halaqahId,
          name: row.halaqahName,
          level: row.halaqahLevel
        };
      }

      return formattedTarget;
    });

    console.log(`Returning ${targets.length} formatted target records`);

    return NextResponse.json({
      success: true,
      targets,
      total: targets.length
    });

  } catch (error) {
    console.error('Error fetching hafalan targets:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data target hafalan',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST /api/hafalan-targets - Create new hafalan target
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    const body = await request.json();
    const {
      santriId,
      santriName,
      surahId,
      surahName,
      targetType,
      targetAyahs,
      targetDate,
      startDate,
      priority,
      description,
      notes,
      reminders
    } = body;

    console.log('POST /api/hafalan-targets - Request body:', body);

    // Validation
    if (!santriId || !surahId || !targetType || !targetAyahs || !targetDate) {
      return NextResponse.json(
        { success: false, message: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Ensure connection is not null
    if (!connection) {
      throw new Error('Failed to create database connection');
    }

    // Get the correct table name
    const tableName = await getTableName(connection);
    console.log(`Using table name: ${tableName}`);

    // Check if santri exists
    let santriExists = true;
    let santriName_db = santriName;
    try {
      const [santriRows] = await connection.execute(
        'SELECT name FROM santri WHERE id = ?',
        [santriId]
      );

      if ((santriRows as any[]).length === 0) {
        console.log(`Santri with ID ${santriId} not found in database, using provided name`);
      } else {
        santriName_db = (santriRows as any[])[0].name;
        console.log(`Found santri name in database: ${santriName_db}`);
      }
    } catch (error) {
      console.log('Error checking santri or santri table does not exist, using provided name');
    }

    // Create target
    const targetId = `target_${Date.now()}`;
    const targetDateObj = new Date(targetDate);
    const startDateObj = startDate ? new Date(startDate) : new Date();
    const remindersJson = reminders ? JSON.stringify(reminders) : JSON.stringify({
      enabled: true,
      frequency: 'WEEKLY'
    });
    const milestonesJson = JSON.stringify([
      { percentage: 25, reward: 'Sticker Bintang' },
      { percentage: 50, reward: 'Sertifikat Progress' },
      { percentage: 75, reward: 'Hadiah Kecil' },
      { percentage: 100, reward: 'Sertifikat Completion' }
    ]);

    await connection.execute(
      `INSERT INTO ${tableName} (
        id, santriId, santriName, surahId, surahName, targetType, targetAyahs, completedAyahs,
        targetDate, startDate, createdBy, createdByName, status, progress, priority,
        description, notes, reminders, milestones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    , [
      targetId,
      santriId,
      santriName_db,
      surahId,
      surahName,
      targetType,
      targetAyahs,
      0, // completedAyahs
      targetDateObj,
      startDateObj,
      'admin', // createdBy
      'Admin TPQ', // createdByName
      'ACTIVE', // status
      0, // progress
      priority || 'MEDIUM',
      description || '',
      notes || '',
      remindersJson,
      milestonesJson
    ]);

    // Get the created target
    const [targetRows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [targetId]
    );

    if ((targetRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gagal membuat target hafalan' },
        { status: 500 }
      );
    }

    const createdTarget = (targetRows as any[])[0];

    // Format response
    const formattedTarget = {
      ...createdTarget,
      reminders: createdTarget.reminders ? JSON.parse(createdTarget.reminders) : null,
      milestones: createdTarget.milestones ? JSON.parse(createdTarget.milestones) : null
    };

    console.log('Returning created target:', formattedTarget);

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil dibuat',
      target: formattedTarget
    });

  } catch (error) {
    console.error('Error creating hafalan target:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal membuat target hafalan',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
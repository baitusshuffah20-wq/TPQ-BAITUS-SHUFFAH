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
    // Try to query hafalan_progress
    await connection.execute('SELECT 1 FROM hafalan_progress LIMIT 1');
    return 'hafalan_progress';
  } catch (error) {
    try {
      // Try to query hafalan_progresses
      await connection.execute('SELECT 1 FROM hafalan_progresses LIMIT 1');
      return 'hafalan_progresses';
    } catch (error) {
      try {
        // Try to query HafalanProgress
        await connection.execute('SELECT 1 FROM HafalanProgress LIMIT 1');
        return 'HafalanProgress';
      } catch (error) {
        throw new Error('Could not determine the correct table name for hafalan progress');
      }
    }
  }
}

// GET /api/hafalan-progress - Get all hafalan progress
export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    const status = searchParams.get('status');
    const surahId = searchParams.get('surahId');
    const search = searchParams.get('search');
    
    console.log('GET /api/hafalan-progress - Query params:', { santriId, status, surahId, search });

    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Ensure connection is not null
    if (!connection) {
      throw new Error('Failed to create database connection');
    }
    
    // Get the correct table name
    const tableName = await getTableName(connection);
    console.log(`Using table name: ${tableName}`);
    
    // Build query
    let query = `
      SELECT 
        hp.id, 
        hp.santriId, 
        s.name as santriName,
        s.nis as santriNis,
        hp.surahId,
        hp.surahName,
        hp.totalAyah,
        hp.memorized,
        hp.inProgress,
        hp.lastAyah,
        hp.startDate,
        hp.targetDate,
        hp.completedAt,
        hp.status,
        hp.notes,
        hp.createdAt,
        hp.updatedAt,
        s.photo as santriPhoto,
        h.id as halaqahId,
        h.name as halaqahName,
        h.level as halaqahLevel
      FROM 
        ${tableName} hp
      JOIN 
        santri s ON hp.santriId = s.id
      LEFT JOIN
        halaqah h ON s.halaqahId = h.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (santriId) {
      query += ` AND hp.santriId = ?`;
      params.push(santriId);
    }
    
    if (status && status !== 'ALL') {
      query += ` AND hp.status = ?`;
      params.push(status);
    }
    
    if (surahId) {
      query += ` AND hp.surahId = ?`;
      params.push(parseInt(surahId));
    }
    
    if (search) {
      query += ` AND (hp.surahName LIKE ? OR s.name LIKE ? OR s.nis LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY hp.updatedAt DESC`;
    
    console.log('Executing query:', query);
    console.log('With params:', params);
    
    // Execute query
    const [rows] = await connection.execute(query, params);
    console.log(`Found ${(rows as any[]).length} progress records`);
    
    // Format data to match Prisma structure
    const progress = (rows as any[]).map(row => ({
      id: row.id,
      santriId: row.santriId,
      surahId: row.surahId,
      surahName: row.surahName,
      totalAyah: row.totalAyah,
      memorized: row.memorized,
      inProgress: row.inProgress,
      lastAyah: row.lastAyah,
      startDate: row.startDate,
      targetDate: row.targetDate,
      completedAt: row.completedAt,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      santri: {
        id: row.santriId,
        name: row.santriName,
        nis: row.santriNis,
        status: 'ACTIVE', // Assuming active since we're joining
        photo: row.santriPhoto,
        halaqah: row.halaqahId ? {
          id: row.halaqahId,
          name: row.halaqahName,
          level: row.halaqahLevel
        } : null
      }
    }));
    
    console.log(`Returning ${progress.length} formatted progress records`);

    return NextResponse.json({
      success: true,
      progress,
      total: progress.length
    });

  } catch (error) {
    console.error('Error fetching hafalan progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengambil data progress hafalan',
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

// POST /api/hafalan-progress - Create new hafalan progress
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { 
      santriId, 
      surahId, 
      surahName, 
      totalAyah,
      memorized = 0,
      inProgress = 0,
      lastAyah = 0,
      targetDate,
      status = 'IN_PROGRESS',
      notes
    } = body;
    
    console.log('POST /api/hafalan-progress - Request body:', body);

    // Validation
    if (!santriId || !surahId || !surahName || !totalAyah) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi' },
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
    const [santriRows] = await connection.execute(
      `SELECT id, name, nis FROM santri WHERE id = ?`,
      [santriId]
    );
    
    if ((santriRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 400 }
      );
    }
    
    const santri = (santriRows as any[])[0];

    // Check if progress for this surah already exists
    const [existingRows] = await connection.execute(
      `SELECT id FROM ${tableName} WHERE santriId = ? AND surahId = ?`,
      [santriId, parseInt(surahId.toString())]
    );
    
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Progress hafalan untuk surah ini sudah ada' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = `hp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create hafalan progress
    try {
      await connection.execute(
        `INSERT INTO ${tableName} (
          id, santriId, surahId, surahName, totalAyah,
          memorized, inProgress, lastAyah,
          targetDate, status, notes, startDate
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?
        )`,
        [
          id,
          santriId,
          parseInt(surahId.toString()),
          surahName,
          parseInt(totalAyah.toString()),
          parseInt(memorized.toString()),
          parseInt(inProgress.toString()),
          parseInt(lastAyah.toString()),
          targetDate ? new Date(targetDate) : null,
          status,
          notes,
          new Date() // startDate is now
        ]
      );
      console.log('Insert successful');
    } catch (error) {
      console.error('Error executing insert query:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal menyimpan progress hafalan',
          error: String(error)
        },
        { status: 500 }
      );
    }
    
    // Get halaqah info
    const [halaqahRows] = await connection.execute(
      `SELECT h.id, h.name, h.level 
       FROM halaqah h 
       JOIN santri s ON s.halaqahId = h.id 
       WHERE s.id = ?`,
      [santriId]
    );
    
    const halaqah = (halaqahRows as any[]).length > 0 ? (halaqahRows as any[])[0] : null;
    
    // Get the created record
    const [progressRows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );
    
    if ((progressRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gagal mendapatkan data yang baru dibuat' },
        { status: 500 }
      );
    }
    
    const progress = (progressRows as any[])[0];
    
    // Format response to match Prisma structure
    const formattedProgress = {
      ...progress,
      santri: {
        id: santri.id,
        name: santri.name,
        nis: santri.nis,
        status: 'ACTIVE',
        photo: null,
        halaqah: halaqah ? {
          id: halaqah.id,
          name: halaqah.name,
          level: halaqah.level
        } : null
      }
    };
    
    console.log('Returning created progress:', formattedProgress);

    return NextResponse.json({
      success: true,
      message: 'Progress hafalan berhasil dibuat',
      progress: formattedProgress
    });

  } catch (error) {
    console.error('Error creating hafalan progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat progress hafalan',
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

// PUT /api/hafalan-progress - Update hafalan progress
export async function PUT(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const body = await request.json();
    const { 
      id,
      memorized = 0,
      inProgress = 0,
      lastAyah = 0,
      targetDate,
      status,
      notes
    } = body;
    
    console.log('PUT /api/hafalan-progress - Request body:', body);

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID progress hafalan wajib diisi' },
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
    
    // Check if progress exists
    const [progressRows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );
    
    if ((progressRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Progress hafalan tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const existingProgress = (progressRows as any[])[0];
    
    // Prepare update data
    const updateData: any = {};
    const params: any[] = [];
    
    if (memorized !== undefined) {
      updateData.memorized = parseInt(memorized.toString());
    }
    
    if (inProgress !== undefined) {
      updateData.inProgress = parseInt(inProgress.toString());
    }
    
    if (lastAyah !== undefined) {
      updateData.lastAyah = parseInt(lastAyah.toString());
    }
    
    if (targetDate !== undefined) {
      updateData.targetDate = targetDate ? new Date(targetDate) : null;
    }
    
    if (status !== undefined) {
      updateData.status = status;
      
      // If status is COMPLETED, set completedAt
      if (status === 'COMPLETED' && !existingProgress.completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'COMPLETED') {
        updateData.completedAt = null;
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    // Add updatedAt
    updateData.updatedAt = new Date();
    
    // Build update query
    let query = `UPDATE ${tableName} SET `;
    const setClauses = [];
    
    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }
    
    for (const [key, value] of Object.entries(updateData)) {
      setClauses.push(`${key} = ?`);
      params.push(value);
    }
    
    query += setClauses.join(', ');
    query += ` WHERE id = ?`;
    params.push(id);
    
    console.log('Executing update query:', query);
    console.log('With params:', params);
    
    try {
      // Execute update
      await connection.execute(query, params);
      console.log('Update executed successfully');
    } catch (error) {
      console.error('Error executing update query:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal mengeksekusi query update',
          error: String(error)
        },
        { status: 500 }
      );
    }
    
    // Get updated record with santri info
    const [updatedRows] = await connection.execute(`
      SELECT 
        hp.*,
        s.name as santriName,
        s.nis as santriNis,
        s.photo as santriPhoto,
        h.id as halaqahId,
        h.name as halaqahName,
        h.level as halaqahLevel
      FROM 
        ${tableName} hp
      JOIN 
        santri s ON hp.santriId = s.id
      LEFT JOIN
        halaqah h ON s.halaqahId = h.id
      WHERE 
        hp.id = ?
    `, [id]);
    
    if ((updatedRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gagal mendapatkan data yang diperbarui' },
        { status: 500 }
      );
    }
    
    const updatedProgress = (updatedRows as any[])[0];
    
    // Format response
    const formattedProgress = {
      id: updatedProgress.id,
      santriId: updatedProgress.santriId,
      surahId: updatedProgress.surahId,
      surahName: updatedProgress.surahName,
      totalAyah: updatedProgress.totalAyah,
      memorized: updatedProgress.memorized,
      inProgress: updatedProgress.inProgress,
      lastAyah: updatedProgress.lastAyah,
      startDate: updatedProgress.startDate,
      targetDate: updatedProgress.targetDate,
      completedAt: updatedProgress.completedAt,
      status: updatedProgress.status,
      notes: updatedProgress.notes,
      createdAt: updatedProgress.createdAt,
      updatedAt: updatedProgress.updatedAt,
      santri: {
        id: updatedProgress.santriId,
        name: updatedProgress.santriName,
        nis: updatedProgress.santriNis,
        status: 'ACTIVE',
        photo: updatedProgress.santriPhoto,
        halaqah: updatedProgress.halaqahId ? {
          id: updatedProgress.halaqahId,
          name: updatedProgress.halaqahName,
          level: updatedProgress.halaqahLevel
        } : null
      }
    };
    
    console.log('Update successful, returning updated data');

    return NextResponse.json({
      success: true,
      message: 'Progress hafalan berhasil diperbarui',
      progress: formattedProgress
    });

  } catch (error) {
    console.error('Error updating hafalan progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal memperbarui progress hafalan',
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

// DELETE /api/hafalan-progress - Delete hafalan progress
export async function DELETE(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('DELETE /api/hafalan-progress - Query params:', { id });
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID progress hafalan wajib diisi' },
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
    
    // Check if progress exists
    const [progressRows] = await connection.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );
    
    if ((progressRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Progress hafalan tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Delete progress
    try {
      await connection.execute(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [id]
      );
      console.log('Delete executed successfully');
    } catch (error) {
      console.error('Error executing delete query:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal mengeksekusi query delete',
          error: String(error)
        },
        { status: 500 }
      );
    }
    
    console.log('Delete successful');

    return NextResponse.json({
      success: true,
      message: 'Progress hafalan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting hafalan progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal menghapus progress hafalan',
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


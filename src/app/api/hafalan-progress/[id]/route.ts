import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tpq_baitus_shuffah'
};

// GET /api/hafalan-progress/[id] - Get hafalan progress by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;
  
  try {
    const id = params.id;
    console.log(`GET /api/hafalan-progress/${id} - Fetching progress`);
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Ensure connection is not null
    if (!connection) {
      throw new Error('Failed to create database connection');
    }
    
    // Get progress with santri info
    const [rows] = await connection.execute(`
      SELECT 
        hp.*,
        s.name as santriName,
        s.nis as santriNis,
        s.photo as santriPhoto,
        h.id as halaqahId,
        h.name as halaqahName,
        h.level as halaqahLevel
      FROM 
        hafalan_progress hp
      JOIN 
        santri s ON hp.santriId = s.id
      LEFT JOIN
        halaqah h ON s.halaqahId = h.id
      WHERE 
        hp.id = ?
    `, [id]);
    
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Progress hafalan tidak ditemukan' },
        { status: 404 }
      );
    }
    
    const progress = (rows as any[])[0];
    
    // Format response
    const formattedProgress = {
      id: progress.id,
      santriId: progress.santriId,
      surahId: progress.surahId,
      surahName: progress.surahName,
      totalAyah: progress.totalAyah,
      memorized: progress.memorized,
      inProgress: progress.inProgress,
      lastAyah: progress.lastAyah,
      startDate: progress.startDate,
      targetDate: progress.targetDate,
      completedAt: progress.completedAt,
      status: progress.status,
      notes: progress.notes,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
      santri: {
        id: progress.santriId,
        name: progress.santriName,
        nis: progress.santriNis,
        status: 'ACTIVE',
        photo: progress.santriPhoto,
        halaqah: progress.halaqahId ? {
          id: progress.halaqahId,
          name: progress.halaqahName,
          level: progress.halaqahLevel
        } : null
      }
    };
    
    return NextResponse.json({
      success: true,
      progress: formattedProgress
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

// PUT /api/hafalan-progress/[id] - Update hafalan progress
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;
  
  try {
    const id = params.id;
    console.log(`PUT /api/hafalan-progress/${id} - Updating progress`);
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID progress hafalan wajib diisi' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      memorized,
      inProgress,
      lastAyah,
      targetDate,
      status,
      notes,
      completedAt
    } = body;
    
    console.log('Update data:', body);
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Ensure connection is not null
    if (!connection) {
      throw new Error('Failed to create database connection');
    }
    
    // Check if progress exists
    const [progressRows] = await connection.execute(
      `SELECT * FROM hafalan_progress WHERE id = ?`,
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
    const queryParams: any[] = [];
    
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
    
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }
    
    // Add updatedAt
    updateData.updatedAt = new Date();
    
    // Build update query
    let query = `UPDATE hafalan_progress SET `;
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
      queryParams.push(value);
    }
    
    query += setClauses.join(', ');
    query += ` WHERE id = ?`;
    queryParams.push(id);
    
    console.log('Executing update query:', query);
    console.log('With params:', queryParams);
    
    try {
      // Execute update
      await connection.execute(query, queryParams);
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
        hafalan_progress hp
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

// DELETE /api/hafalan-progress/[id] - Delete hafalan progress
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: mysql.Connection | null = null;
  
  try {
    const id = params.id;
    console.log(`DELETE /api/hafalan-progress/${id} - Deleting progress`);
    
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
    
    // Check if progress exists
    const [progressRows] = await connection.execute(
      `SELECT * FROM hafalan_progress WHERE id = ?`,
      [id]
    );
    
    if ((progressRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Progress hafalan tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Delete progress
    await connection.execute(
      `DELETE FROM hafalan_progress WHERE id = ?`,
      [id]
    );
    
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
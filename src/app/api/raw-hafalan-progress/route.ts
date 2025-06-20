import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'tpq_baitus_shuffah_new'
};

// GET /api/raw-hafalan-progress - Check hafalan progress data
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Query to get all hafalan progress with santri information
    const [rows] = await connection.execute(`
      SELECT 
        hp.id, 
        hp.santriId AS santriId, 
        s.name AS santriName,
        s.nis AS santriNis,
        hp.surahId AS surahId,
        hp.surahName AS surahName,
        hp.totalAyah AS totalAyah,
        hp.memorized,
        hp.inProgress AS inProgress,
        hp.lastAyah AS lastAyah,
        hp.startDate AS startDate,
        hp.targetDate AS targetDate,
        hp.completedAt AS completedAt,
        hp.status,
        hp.notes,
        hp.createdAt AS createdAt,
        hp.updatedAt AS updatedAt
      FROM 
        hafalan_progress hp
      JOIN 
        santri s ON hp.santriId = s.id
      ORDER BY 
        hp.updatedAt DESC
    `);
    
    return NextResponse.json({
      success: true,
      records: rows,
      count: (rows as any[]).length
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

// POST /api/raw-hafalan-progress - Seed hafalan progress data
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Get all santri
    const [santri] = await connection.execute(`
      SELECT id, name, nis FROM santri WHERE status = 'ACTIVE' LIMIT 10
    `);
    
    const santriList = santri as any[];
    
    if (santriList.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No santri found in the database'
      });
    }
    
    // Clear existing data
    await connection.execute(`DELETE FROM hafalan_progress`);
    
    // Define some surahs
    const surahs = [
      { id: 1, name: 'Al-Fatihah', totalAyah: 7 },
      { id: 2, name: 'Al-Baqarah', totalAyah: 286 },
      { id: 36, name: 'Ya-Sin', totalAyah: 83 },
      { id: 55, name: 'Ar-Rahman', totalAyah: 78 },
      { id: 56, name: 'Al-Waqi\'ah', totalAyah: 96 },
      { id: 67, name: 'Al-Mulk', totalAyah: 30 },
      { id: 78, name: 'An-Naba', totalAyah: 40 },
      { id: 93, name: 'Ad-Duha', totalAyah: 11 },
      { id: 112, name: 'Al-Ikhlas', totalAyah: 4 },
      { id: 114, name: 'An-Nas', totalAyah: 6 }
    ];
    
    // Generate random progress data
    const progressData = [];
    
    for (const s of santriList) {
      // Assign 1-3 random surahs to each santri
      const numSurahs = Math.floor(Math.random() * 3) + 1;
      const selectedSurahs = [...surahs].sort(() => 0.5 - Math.random()).slice(0, numSurahs);
      
      for (const surah of selectedSurahs) {
        // Generate random progress
        const memorized = Math.floor(Math.random() * (surah.totalAyah + 1));
        const inProgress = Math.min(
          Math.floor(Math.random() * 10), 
          surah.totalAyah - memorized
        );
        const lastAyah = Math.min(memorized + inProgress, surah.totalAyah);
        
        // Determine status
        let status = 'IN_PROGRESS';
        let completedAt = null;
        
        if (memorized === surah.totalAyah) {
          status = 'COMPLETED';
          completedAt = new Date();
        } else if (Math.random() > 0.8) {
          status = 'ON_HOLD';
        }
        
        // Generate target date (1-3 months from now)
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + Math.floor(Math.random() * 3) + 1);
        
        // Generate unique ID
        const id = 'hp_' + Math.random().toString(36).substring(2, 15);
        
        progressData.push({
          id,
          santriId: s.id,
          surahId: surah.id,
          surahName: surah.name,
          totalAyah: surah.totalAyah,
          memorized,
          inProgress,
          lastAyah,
          status,
          targetDate: status === 'COMPLETED' ? null : targetDate,
          completedAt: completedAt ? completedAt : null,
          notes: getRandomNote(status)
        });
      }
    }
    
    // Insert data
    let insertedCount = 0;
    
    for (const data of progressData) {
      try {
        await connection.execute(`
          INSERT INTO hafalan_progress (
            id, santriId, surahId, surahName, totalAyah, 
            memorized, inProgress, lastAyah, status, 
            targetDate, completedAt, notes
          ) VALUES (
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, 
            ?, ?, ?
          )
        `, [
          data.id, data.santriId, data.surahId, data.surahName, data.totalAyah,
          data.memorized, data.inProgress, data.lastAyah, data.status,
          data.targetDate, data.completedAt, data.notes
        ]);
        
        insertedCount++;
      } catch (error) {
        console.error(`Error inserting progress for santri ${data.santriId}, surah ${data.surahId}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded hafalan progress data`,
      count: insertedCount
    });
    
  } catch (error) {
    console.error('Error seeding hafalan progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat data progress hafalan',
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

// Helper function to generate random notes
function getRandomNote(status: string): string {
  const inProgressNotes = [
    'Perlu lebih banyak latihan pada ayat-ayat panjang',
    'Tajwid sudah bagus, perlu perbaikan pada makhraj',
    'Hafalan lancar tetapi perlu peningkatan pada kelancaran',
    'Sudah ada kemajuan dari minggu lalu',
    'Perlu fokus pada ayat 5-10'
  ];
  
  const completedNotes = [
    'Hafalan sangat lancar dan tajwid baik',
    'Selesai dengan nilai mumtaz',
    'Hafalan sempurna, lanjutkan ke surah berikutnya',
    'Excellent! Tajwid dan makhraj sangat baik'
  ];
  
  const onHoldNotes = [
    'Ditunda karena fokus pada ujian sekolah',
    'Perlu mengulang dari awal karena terlalu lama tidak muraja\'ah',
    'Ditunda sementara, akan dilanjutkan bulan depan',
    'Perlu perbaikan pada beberapa ayat sebelum melanjutkan'
  ];
  
  if (status === 'COMPLETED') {
    return completedNotes[Math.floor(Math.random() * completedNotes.length)];
  } else if (status === 'ON_HOLD') {
    return onHoldNotes[Math.floor(Math.random() * onHoldNotes.length)];
  } else {
    return inProgressNotes[Math.floor(Math.random() * inProgressNotes.length)];
  }
}

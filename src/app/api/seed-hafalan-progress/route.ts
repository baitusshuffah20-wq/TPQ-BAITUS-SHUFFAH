import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/seed-hafalan-progress - Seed hafalan progress data
export async function POST(request: NextRequest) {
  try {
    console.log('Starting hafalan progress seeding...');
    
    // Get all santri
    const santri = await prisma.santri.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    console.log(`Found ${santri.length} active santri`);

    if (santri.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No santri found for seeding'
      });
    }

    // First, check if there are existing records and delete them to avoid conflicts
    try {
      const existingRecords = await prisma.hafalanProgress.count();
      console.log(`Found ${existingRecords} existing records`);
      
      if (existingRecords > 0) {
        console.log('Deleting existing records...');
        await prisma.hafalanProgress.deleteMany({});
        console.log('Existing records deleted');
      }
    } catch (error) {
      console.error('Error checking/deleting existing records:', error);
      // Continue even if this fails
    }

    // Surah data - using simple surah data for testing
    const surahs = [
      { id: 1, name: 'Al-Fatihah', totalAyah: 7 },
      { id: 2, name: 'Al-Baqarah', totalAyah: 286 },
      { id: 36, name: 'Ya-Sin', totalAyah: 83 },
      { id: 55, name: 'Ar-Rahman', totalAyah: 78 },
      { id: 112, name: 'Al-Ikhlas', totalAyah: 4 }
    ];

    // Create progress records
    const progressRecords = [];

    // Create a simple record for each santri
    for (let i = 0; i < Math.min(santri.length, 3); i++) {
      const s = santri[i];
      
      // Assign 1-2 surahs to each santri
      const numSurahs = Math.min(2, surahs.length);
      const selectedSurahs = surahs.slice(0, numSurahs);
      
      for (let j = 0; j < selectedSurahs.length; j++) {
        const surah = selectedSurahs[j];
        
        // Simple progress data
        const memorized = Math.floor(surah.totalAyah * 0.7); // 70% memorized
        const inProgress = Math.floor(surah.totalAyah * 0.1); // 10% in progress
        const status = j === 0 ? 'IN_PROGRESS' : 'COMPLETED';
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Started 30 days ago
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 60); // Target 60 days from now
        
        const completedAt = status === 'COMPLETED' ? new Date() : null;
        
        console.log(`Creating progress for santri ${s.name}, surah ${surah.name}`);
        
        try {
          const progress = await prisma.hafalanProgress.create({
            data: {
              santriId: s.id,
              surahId: surah.id,
              surahName: surah.name,
              totalAyah: surah.totalAyah,
              memorized: memorized,
              inProgress: inProgress,
              lastAyah: memorized,
              startDate: startDate,
              targetDate: status !== 'COMPLETED' ? targetDate : null,
              completedAt: completedAt,
              status: status,
              notes: `Progress hafalan ${surah.name} untuk ${s.name}`
            }
          });
          
          console.log(`Created progress record with ID: ${progress.id}`);
          progressRecords.push(progress);
        } catch (error) {
          console.error(`Error creating progress for santri ${s.id}, surah ${surah.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${progressRecords.length} hafalan progress records`,
      count: progressRecords.length
    });

  } catch (error) {
    console.error('Error seeding hafalan progress:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed hafalan progress data', error: String(error) },
      { status: 500 }
    );
  }
}
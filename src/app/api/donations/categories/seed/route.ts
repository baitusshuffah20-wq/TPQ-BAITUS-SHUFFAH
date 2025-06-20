import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if categories already exist in SiteSettings
    const existingSetting = await prisma.siteSetting.findUnique({
      where: { key: 'donation_categories' }
    });
    
    if (existingSetting) {
      const categories = JSON.parse(existingSetting.value);
      return NextResponse.json({
        success: true,
        message: `${categories.length} donation categories already exist. No seeding needed.`,
        categories
      });
    }
    
    // Create donation categories
    const categories = [
      {
        id: 'general',
        title: 'Donasi Umum',
        description: 'Untuk operasional sehari-hari rumah tahfidz',
        target: 100000000,
        collected: 75000000,
        icon: 'Heart',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        urgent: false,
        isActive: true,
        order: 1
      },
      {
        id: 'building',
        title: 'Pembangunan Gedung',
        description: 'Renovasi dan pembangunan fasilitas baru',
        target: 500000000,
        collected: 320000000,
        icon: 'Building',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        urgent: true,
        isActive: true,
        order: 2
      },
      {
        id: 'scholarship',
        title: 'Beasiswa Santri',
        description: 'Bantuan biaya pendidikan untuk santri kurang mampu',
        target: 200000000,
        collected: 150000000,
        icon: 'GraduationCap',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        urgent: false,
        isActive: true,
        order: 3
      },
      {
        id: 'books',
        title: 'Buku & Alat Tulis',
        description: 'Pengadaan Al-Quran dan buku pembelajaran',
        target: 50000000,
        collected: 35000000,
        icon: 'BookOpen',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        urgent: false,
        isActive: true,
        order: 4
      },
      {
        id: 'meals',
        title: 'Konsumsi Santri',
        description: 'Biaya makan dan snack untuk santri',
        target: 80000000,
        collected: 60000000,
        icon: 'Utensils',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        urgent: false,
        isActive: true,
        order: 5
      }
    ];

    // Save categories to SiteSettings
    await prisma.siteSetting.create({
      data: {
        key: 'donation_categories',
        value: JSON.stringify(categories),
        type: 'json',
        category: 'donations',
        label: 'Donation Categories',
        isPublic: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `${categories.length} donation categories seeded successfully`,
      categories
    });
  } catch (error) {
    console.error('Error seeding donation categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed donation categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
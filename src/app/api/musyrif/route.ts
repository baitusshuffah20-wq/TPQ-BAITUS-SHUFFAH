import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';
// Use the shared Prisma instance instead of creating a new one
// const prisma = new PrismaClient();

// GET /api/musyrif - Get all musyrif
export async function GET(req: NextRequest) {
  try {
    // Temporarily disable authentication check for development
    // const session = await getServerSession(authOptions);
    
    // if (!session) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    // Parse query parameters
    const url = new URL(req.url);
    const halaqahId = url.searchParams.get('halaqahId');
    const status = url.searchParams.get('status');
    
    // Build filter conditions
    const where: any = {};
    
    if (halaqahId) {
      where.halaqahId = halaqahId;
    }
    
    if (status) {
      where.status = status;
    }

    console.log('Fetching musyrif with filter:', where);
    
    const musyrifData = await prisma.musyrif.findMany({
      where,
      include: {
        halaqah: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('Musyrif data found:', musyrifData.length);

    // Transform the data to include parsed JSON fields
    const musyrif = musyrifData.map(m => {
      try {
        // Check if educationData is complete JSON
        let education = [];
        if (m.educationData) {
          try {
            education = JSON.parse(m.educationData as string);
          } catch (e) {
            console.error('Error parsing educationData for musyrif:', m.id, e);
            // Try to fix truncated JSON
            if (typeof m.educationData === 'string' && m.educationData.includes('id')) {
              const match = m.educationData.match(/\[\{.*?\}\]/);
              if (match) {
                try {
                  education = JSON.parse(match[0]);
                } catch (e2) {
                  console.error('Failed to fix educationData JSON:', e2);
                }
              }
            }
          }
        }
        
        // Check if experienceData is complete JSON
        let experience = [];
        if (m.experienceData) {
          try {
            experience = JSON.parse(m.experienceData as string);
          } catch (e) {
            console.error('Error parsing experienceData for musyrif:', m.id, e);
            // Try to fix truncated JSON
            if (typeof m.experienceData === 'string' && m.experienceData.includes('id')) {
              const match = m.experienceData.match(/\[\{.*?\}\]/);
              if (match) {
                try {
                  experience = JSON.parse(match[0]);
                } catch (e2) {
                  console.error('Failed to fix experienceData JSON:', e2);
                }
              }
            }
          }
        }
        
        // Check if certificatesData is complete JSON
        let certificates = [];
        if (m.certificatesData) {
          try {
            certificates = JSON.parse(m.certificatesData as string);
          } catch (e) {
            console.error('Error parsing certificatesData for musyrif:', m.id, e);
            // Try to fix truncated JSON
            if (typeof m.certificatesData === 'string' && m.certificatesData.includes('id')) {
              const match = m.certificatesData.match(/\[\{.*?\}\]/);
              if (match) {
                try {
                  certificates = JSON.parse(match[0]);
                } catch (e2) {
                  console.error('Failed to fix certificatesData JSON:', e2);
                }
              }
            }
          }
        }
        
        return {
          ...m,
          education,
          experience,
          certificates
        };
      } catch (error) {
        console.error('Error processing data for musyrif:', m.id, error);
        return {
          ...m,
          education: [],
          experience: [],
          certificates: []
        };
      }
    });

    return NextResponse.json({ success: true, musyrif });
  } catch (error) {
    console.error('Error fetching musyrif:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch musyrif' },
      { status: 500 }
    );
  }
}

// POST /api/musyrif - Create a new musyrif
export async function POST(req: NextRequest) {
  try {
    // Temporarily disable authentication check for development
    // const session = await getServerSession(authOptions);
    
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.gender || !data.birthPlace || !data.birthDate || !data.address || !data.phone || !data.email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle user account creation or connection
    let userId = data.userId;
    
    if (data.createAccount && !userId) {
      if (!data.password) {
        return NextResponse.json(
          { success: false, message: 'Password is required when creating a new account' },
          { status: 400 }
        );
      }
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }
      
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password, // In a real app, hash this password
          role: 'MUSYRIF'
        }
      });
      
      userId = newUser.id;
    }

    // Create musyrif
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
        halaqahId: data.halaqahId || null,
        userId: userId || null,
        
        // Store education, experience, and certificates as JSON
        educationData: data.education ? JSON.stringify(data.education) : null,
        experienceData: data.experience ? JSON.stringify(data.experience) : null,
        certificatesData: data.certificates ? JSON.stringify(data.certificates) : null
      },
      include: {
        halaqah: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Transform the data to include parsed JSON fields
    const transformedMusyrif = {
      ...musyrif,
      education: musyrif.educationData ? JSON.parse(musyrif.educationData as string) : [],
      experience: musyrif.experienceData ? JSON.parse(musyrif.experienceData as string) : [],
      certificates: musyrif.certificatesData ? JSON.parse(musyrif.certificatesData as string) : []
    };

    return NextResponse.json({ success: true, musyrif: transformedMusyrif });
  } catch (error) {
    console.error('Error creating musyrif:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create musyrif' },
      { status: 500 }
    );
  }
}
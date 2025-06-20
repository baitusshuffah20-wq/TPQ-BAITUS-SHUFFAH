import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';
// Use the shared Prisma instance instead of creating a new one
// const prisma = new PrismaClient();

// GET /api/musyrif/[id] - Get a specific musyrif
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily disable authentication check for development
    // const session = await getServerSession(authOptions);
    
    // if (!session) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    const musyrifData = await prisma.musyrif.findUnique({
      where: { id: params.id },
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

    if (!musyrifData) {
      return NextResponse.json(
        { success: false, message: 'Musyrif not found' },
        { status: 404 }
      );
    }

    // Transform the data to include parsed JSON fields
    const musyrif = {
      ...musyrifData,
      education: musyrifData.educationData ? JSON.parse(musyrifData.educationData as string) : [],
      experience: musyrifData.experienceData ? JSON.parse(musyrifData.experienceData as string) : [],
      certificates: musyrifData.certificatesData ? JSON.parse(musyrifData.certificatesData as string) : []
    };

    return NextResponse.json({ success: true, musyrif });
  } catch (error) {
    console.error('Error fetching musyrif:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch musyrif' },
      { status: 500 }
    );
  }
}

// PUT /api/musyrif/[id] - Update a musyrif
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if musyrif exists
    const existingMusyrif = await prisma.musyrif.findUnique({
      where: { id: params.id }
    });

    if (!existingMusyrif) {
      return NextResponse.json(
        { success: false, message: 'Musyrif not found' },
        { status: 404 }
      );
    }

    // Update musyrif
    const musyrif = await prisma.musyrif.update({
      where: { id: params.id },
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
        userId: data.userId || null,
        
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
    console.error('Error updating musyrif:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update musyrif' },
      { status: 500 }
    );
  }
}

// DELETE /api/musyrif/[id] - Delete a musyrif
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily disable authentication check for development
    // const session = await getServerSession(authOptions);
    
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    // Check if musyrif exists
    const existingMusyrif = await prisma.musyrif.findUnique({
      where: { id: params.id }
    });

    if (!existingMusyrif) {
      return NextResponse.json(
        { success: false, message: 'Musyrif not found' },
        { status: 404 }
      );
    }

    // Check if musyrif is assigned to a halaqah
    if (existingMusyrif.halaqahId) {
      // Update halaqah to remove musyrif
      await prisma.halaqah.update({
        where: { id: existingMusyrif.halaqahId },
        data: { musyrifId: null }
      });
    }

    // Delete musyrif
    await prisma.musyrif.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Musyrif deleted successfully' });
  } catch (error) {
    console.error('Error deleting musyrif:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete musyrif' },
      { status: 500 }
    );
  }
}
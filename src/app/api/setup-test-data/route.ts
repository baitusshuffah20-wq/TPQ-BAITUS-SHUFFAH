import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Create test musyrif user
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Create or update musyrif user
    const musyrifUser = await prisma.user.upsert({
      where: { email: "musyrif@test.com" },
      update: {
        role: "MUSYRIF",
        isActive: true,
        status: "ACTIVE",
      },
      create: {
        email: "musyrif@test.com",
        name: "Test Musyrif",
        phone: "081234567890",
        role: "MUSYRIF",
        password: hashedPassword,
        isActive: true,
        status: "ACTIVE",
      },
    });

    // Create test halaqah if not exists
    const testHalaqah = await prisma.halaqah.upsert({
      where: { id: "test-halaqah-001" },
      update: {
        name: "Halaqah Test",
        description: "Halaqah untuk testing",
        capacity: 20,
        level: "BEGINNER",
        room: "Ruang A",
        status: "ACTIVE",
      },
      create: {
        id: "test-halaqah-001",
        name: "Halaqah Test",
        description: "Halaqah untuk testing",
        capacity: 20,
        level: "BEGINNER",
        room: "Ruang A",
        status: "ACTIVE",
      },
    });

    // Create musyrif profile
    const musyrifProfile = await prisma.musyrif.upsert({
      where: { halaqahId: testHalaqah.id },
      update: {
        userId: musyrifUser.id,
        name: "Test Musyrif",
        gender: "MALE",
        birthDate: new Date("1990-01-01"),
        birthPlace: "Jakarta",
        address: "Jl. Test No. 123",
        phone: "081234567890",
        email: "musyrif@test.com",
        specialization: "Tahfidz",
        joinDate: new Date(),
        status: "ACTIVE",
      },
      create: {
        userId: musyrifUser.id,
        name: "Test Musyrif",
        gender: "MALE",
        birthDate: new Date("1990-01-01"),
        birthPlace: "Jakarta",
        address: "Jl. Test No. 123",
        phone: "081234567890",
        email: "musyrif@test.com",
        specialization: "Tahfidz",
        joinDate: new Date(),
        status: "ACTIVE",
        halaqahId: testHalaqah.id,
      },
    });

    // Update user halaqahId
    await prisma.user.update({
      where: { id: musyrifUser.id },
      data: { halaqahId: testHalaqah.id },
    });

    // Create halaqah schedules (dayOfWeek: 1=Monday, 3=Wednesday, 5=Friday)
    const schedules = [
      { dayOfWeek: 1, day: "Senin" },
      { dayOfWeek: 3, day: "Rabu" },
      { dayOfWeek: 5, day: "Jumat" }
    ];

    for (const schedule of schedules) {
      await prisma.halaqahSchedule.create({
        data: {
          halaqahId: testHalaqah.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: "08:00",
          endTime: "10:00",
          room: "Ruang A",
        },
      }).catch(() => {
        // Ignore if already exists
        console.log(`Schedule for ${schedule.day} already exists`);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: musyrifUser.id,
          email: musyrifUser.email,
          name: musyrifUser.name,
          role: musyrifUser.role,
        },
        musyrif: {
          id: musyrifProfile.id,
          name: musyrifProfile.name,
          halaqahId: musyrifProfile.halaqahId,
        },
        halaqah: {
          id: testHalaqah.id,
          name: testHalaqah.name,
          room: testHalaqah.room,
        },
        credentials: {
          email: "musyrif@test.com",
          password: "password123",
        },
      },
      message: "Data testing berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat data testing",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

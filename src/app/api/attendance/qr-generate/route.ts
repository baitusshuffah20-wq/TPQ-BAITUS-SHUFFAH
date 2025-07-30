import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Generate QR Code untuk sesi halaqah
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { halaqahId, sessionDate, sessionType = "REGULAR" } = body;

    if (!halaqahId || !sessionDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Halaqah ID dan tanggal sesi wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi halaqah exists
    const halaqah = await prisma.halaqah.findUnique({
      where: { id: halaqahId },
      include: {
        musyrif: {
          include: {
            user: true,
          },
        },
        schedules: true,
      },
    });

    if (!halaqah) {
      return NextResponse.json(
        {
          success: false,
          message: "Halaqah tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (!halaqah.musyrif) {
      return NextResponse.json(
        {
          success: false,
          message: "Halaqah belum memiliki musyrif",
        },
        { status: 400 }
      );
    }

    // Check if QR code already exists for this session
    const existingQR = await prisma.qRCodeSession.findFirst({
      where: {
        halaqahId,
        sessionDate: new Date(sessionDate),
        isActive: true,
      },
    });

    if (existingQR) {
      return NextResponse.json({
        success: true,
        qrSession: existingQR,
        message: "QR Code sudah ada untuk sesi ini",
      });
    }

    // Generate unique QR code
    const qrData = {
      halaqahId,
      sessionDate,
      sessionType,
      timestamp: Date.now(),
      musyrifId: halaqah.musyrif.id,
    };

    const qrCode = crypto
      .createHash("sha256")
      .update(JSON.stringify(qrData))
      .digest("hex")
      .substring(0, 16);

    // Create QR session
    const qrSession = await prisma.qRCodeSession.create({
      data: {
        halaqahId,
        sessionDate: new Date(sessionDate),
        sessionType,
        qrCode,
        isActive: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        createdBy: halaqah.musyrif.userId || "system",
        maxUsage: 1, // Only musyrif can scan once
        usageCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      qrSession: {
        ...qrSession,
        halaqah: {
          id: halaqah.id,
          name: halaqah.name,
          musyrif: {
            id: halaqah.musyrif.id,
            name: halaqah.musyrif.name,
            user: halaqah.musyrif.user,
          },
        },
      },
      message: "QR Code berhasil dibuat",
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat QR Code",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get active QR sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get("halaqahId");
    const date = searchParams.get("date");

    const where: any = {
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    };

    if (halaqahId) {
      where.halaqahId = halaqahId;
    }

    if (date) {
      const sessionDate = new Date(date);
      where.sessionDate = {
        gte: new Date(sessionDate.setHours(0, 0, 0, 0)),
        lt: new Date(sessionDate.setHours(23, 59, 59, 999)),
      };
    }

    const qrSessions = await prisma.qRCodeSession.findMany({
      where,
      include: {
        halaqah: {
          include: {
            musyrif: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      qrSessions,
      message: "QR Sessions berhasil dimuat",
    });
  } catch (error) {
    console.error("Error fetching QR sessions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat QR Sessions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/santri/[id] - Get santri by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // First, try to get basic santri data without includes to check for datetime issues
    let santri;
    try {
      santri = await prisma.santri.findUnique({
        where: { id },
        select: {
          id: true,
          nis: true,
          name: true,
          birthDate: true,
          birthPlace: true,
          gender: true,
          address: true,
          phone: true,
          email: true,
          photo: true,
          status: true,
          enrollmentDate: true,
          graduationDate: true,
          waliId: true,
          halaqahId: true,
          // Skip createdAt and updatedAt for now due to potential datetime issues
        },
      });
    } catch (dateError) {
      console.error("Datetime error, trying to fix:", dateError);

      // Try to fix the datetime issue by updating the record
      try {
        await prisma.$executeRaw`
          UPDATE santri
          SET updatedAt = NOW(), createdAt = COALESCE(NULLIF(createdAt, '0000-00-00 00:00:00'), NOW())
          WHERE id = ${id} AND (
            updatedAt = '0000-00-00 00:00:00' OR
            createdAt = '0000-00-00 00:00:00' OR
            MONTH(updatedAt) = 0 OR
            DAY(updatedAt) = 0 OR
            MONTH(createdAt) = 0 OR
            DAY(createdAt) = 0
          )
        `;

        // Try again after fixing
        santri = await prisma.santri.findUnique({
          where: { id },
          select: {
            id: true,
            nis: true,
            name: true,
            birthDate: true,
            birthPlace: true,
            gender: true,
            address: true,
            phone: true,
            email: true,
            photo: true,
            status: true,
            enrollmentDate: true,
            graduationDate: true,
            waliId: true,
            halaqahId: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } catch (fixError) {
        console.error("Failed to fix datetime issue:", fixError);
        throw new Error(
          "Data santri memiliki masalah format tanggal yang tidak dapat diperbaiki",
        );
      }
    }

    if (!santri) {
      return NextResponse.json(
        { success: false, message: "Santri tidak ditemukan" },
        { status: 404 },
      );
    }

    // Now get related data separately to avoid datetime issues
    const [wali, halaqah, hafalan, attendance, payments] = await Promise.all([
      // Get wali data
      santri.waliId
        ? prisma.user.findUnique({
            where: { id: santri.waliId },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          })
        : null,

      // Get halaqah data
      santri.halaqahId
        ? prisma.halaqah.findUnique({
            where: { id: santri.halaqahId },
            select: {
              id: true,
              name: true,
              level: true,
              musyrif: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : null,

      // Get hafalan data
      prisma.hafalan
        .findMany({
          where: { santriId: id },
          include: {
            musyrif: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Limit to avoid performance issues
        })
        .catch(() => []), // Return empty array if error

      // Get attendance data
      prisma.attendance
        .findMany({
          where: { santriId: id },
          include: {
            musyrif: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 10, // Limit to avoid performance issues
        })
        .catch(() => []), // Return empty array if error

      // Get payments data
      prisma.$queryRaw`
        SELECT id, amount, status, dueDate, paidDate, paidAmount, method, notes
        FROM spp_records
        WHERE santriId = ${id}
        ORDER BY dueDate DESC
        LIMIT 10
      `.catch(() => []), // Return empty array if error
    ]);

    // Combine all data
    const fullSantriData = {
      ...santri,
      wali,
      halaqah,
      hafalan,
      attendance,
      payments,
    };

    return NextResponse.json({
      success: true,
      santri: fullSantriData,
    });
  } catch (error) {
    console.error("Error fetching santri:", error);

    // Provide more specific error messages
    let errorMessage = "Gagal mengambil data santri";
    if (error instanceof Error) {
      if (error.message.includes("datetime")) {
        errorMessage =
          "Data santri memiliki masalah format tanggal. Silakan hubungi administrator.";
      } else if (error.message.includes("format tanggal")) {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}

// PUT /api/santri/[id] - Update santri
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      nis,
      name,
      birthDate,
      birthPlace,
      gender,
      address,
      phone,
      email,
      photo,
      status,
      waliId,
      halaqahId,
      enrollmentDate,
      graduationDate,
    } = body;

    // Check if santri exists
    const existingSantri = await prisma.santri.findUnique({
      where: { id },
    });

    if (!existingSantri) {
      return NextResponse.json(
        { success: false, message: "Santri tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if NIS is already used by another santri
    if (nis !== existingSantri.nis) {
      const nisExists = await prisma.santri.findUnique({
        where: { nis },
      });

      if (nisExists) {
        return NextResponse.json(
          { success: false, message: "NIS sudah digunakan" },
          { status: 400 },
        );
      }
    }

    // Check if wali exists
    const wali = await prisma.user.findUnique({
      where: { id: waliId, role: "WALI" },
    });

    if (!wali) {
      return NextResponse.json(
        { success: false, message: "Wali tidak ditemukan" },
        { status: 400 },
      );
    }

    // Check if halaqah exists (if provided)
    if (halaqahId) {
      const halaqah = await prisma.halaqah.findUnique({
        where: { id: halaqahId },
      });

      if (!halaqah) {
        return NextResponse.json(
          { success: false, message: "Halaqah tidak ditemukan" },
          { status: 400 },
        );
      }
    }

    // Update santri
    const santri = await prisma.santri.update({
      where: { id },
      data: {
        nis,
        name,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        address,
        phone: phone || null,
        email: email || null,
        photo: photo || null,
        status,
        waliId,
        halaqahId: halaqahId || null,
        enrollmentDate: new Date(enrollmentDate),
        graduationDate: graduationDate ? new Date(graduationDate) : null,
      },
      include: {
        wali: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Santri berhasil diupdate",
      santri,
    });
  } catch (error) {
    console.error("Error updating santri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate santri" },
      { status: 500 },
    );
  }
}

// DELETE /api/santri/[id] - Delete santri
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Check if santri exists
    const existingSantri = await prisma.santri.findUnique({
      where: { id },
      include: {
        hafalan: true,
        attendance: true,
        payments: true,
      },
    });

    if (!existingSantri) {
      return NextResponse.json(
        { success: false, message: "Santri tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if santri has related data
    const hasRelatedData =
      existingSantri.hafalan.length > 0 ||
      existingSantri.attendance.length > 0 ||
      existingSantri.payments.length > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Santri tidak dapat dihapus karena masih memiliki data hafalan, absensi, atau pembayaran",
        },
        { status: 400 },
      );
    }

    // Delete santri
    await prisma.santri.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Santri berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting santri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus santri" },
      { status: 500 },
    );
  }
}

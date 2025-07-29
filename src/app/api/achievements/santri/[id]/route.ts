import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-log";

// Schema for santri achievement update validation
const santriAchievementUpdateSchema = z.object({
  achievedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  isUnlocked: z.boolean().optional(),
  notificationSent: z.boolean().optional(),
  certificateGenerated: z.boolean().optional(),
  certificateUrl: z.string().optional(),
  sharedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  metadata: z.string().optional(),
});

// GET handler - Get a specific santri achievement
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    const achievement = await prisma.santriAchievement.findUnique({
      where: { id },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            nis: true,
            halaqah: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        badge: true,
      },
    });

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Error fetching santri achievement:", error);
    return NextResponse.json(
      { error: "Failed to fetch santri achievement" },
      { status: 500 },
    );
  }
}

// PUT handler - Update a santri achievement
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !["ADMIN", "MUSYRIF"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const data = await req.json();

    // Validate achievement data
    const validationResult = santriAchievementUpdateSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    // Get the existing achievement for audit log
    const existingAchievement = await prisma.santriAchievement.findUnique({
      where: { id },
    });

    if (!existingAchievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 },
      );
    }

    // Update achievement in database
    const updatedAchievement = await prisma.santriAchievement.update({
      where: { id },
      data: {
        achievedAt: data.achievedAt,
        progress: data.progress,
        isUnlocked: data.isUnlocked,
        notificationSent: data.notificationSent,
        certificateGenerated: data.certificateGenerated,
        certificateUrl: data.certificateUrl,
        sharedAt: data.sharedAt,
        metadata: data.metadata,
      },
      include: {
        santri: {
          select: {
            name: true,
          },
        },
        badge: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      action: "UPDATE",
      entity: "SANTRI_ACHIEVEMENT",
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(existingAchievement),
      newData: JSON.stringify(updatedAchievement),
    });

    return NextResponse.json(updatedAchievement);
  } catch (error) {
    console.error("Error updating santri achievement:", error);
    return NextResponse.json(
      { error: "Failed to update santri achievement" },
      { status: 500 },
    );
  }
}

// DELETE handler - Delete a santri achievement
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Check if achievement exists
    const achievement = await prisma.santriAchievement.findUnique({
      where: { id },
      include: {
        santri: {
          select: {
            name: true,
          },
        },
        badge: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 },
      );
    }

    // Delete achievement from database
    await prisma.santriAchievement.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      entity: "SANTRI_ACHIEVEMENT",
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(achievement),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting santri achievement:", error);
    return NextResponse.json(
      { error: "Failed to delete santri achievement" },
      { status: 500 },
    );
  }
}

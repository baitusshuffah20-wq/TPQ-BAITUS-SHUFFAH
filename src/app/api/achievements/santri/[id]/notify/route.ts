import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";

// POST handler - Send notification for an achievement
export async function POST(
  _req: NextRequest,
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

    // Get the achievement
    const achievement = await prisma.santriAchievement.findUnique({
      where: { id },
      include: {
        santri: {
          select: {
            id: true,
            name: true,
            waliId: true,
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

    if (!achievement.isUnlocked) {
      return NextResponse.json(
        { error: "Cannot send notification for locked achievement" },
        { status: 400 },
      );
    }

    if (achievement.notificationSent) {
      return NextResponse.json(
        { error: "Notification already sent" },
        { status: 400 },
      );
    }

    // In a real implementation, you would send a notification to the santri and/or wali
    // For example, using WhatsApp API or email

    // Create a notification in the database
    const notification = await prisma.notification.create({
      data: {
        title: `Pencapaian Baru: ${achievement.badge.name}`,
        message: achievement.badge.unlockMessage,
        type: "ACHIEVEMENT",
        priority: "NORMAL",
        status: "PENDING",
        channels: "APP,WHATSAPP",
        recipientId: achievement.santri.waliId,
        recipientType: "WALI",
        metadata: JSON.stringify({
          achievementId: achievement.id,
          badgeId: achievement.badge.id,
          badgeName: achievement.badge.name,
          badgeIcon: achievement.badge.icon,
        }),
        createdBy: session.user.id,
      },
    });

    // Update the achievement to mark notification as sent
    const updatedAchievement = await prisma.santriAchievement.update({
      where: { id },
      data: {
        notificationSent: true,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "NOTIFY",
      entity: "SANTRI_ACHIEVEMENT",
      entityId: id,
      userId: session.user.id,
      newData: JSON.stringify({ notificationId: notification.id }),
    });

    return NextResponse.json({
      success: true,
      achievement: updatedAchievement,
      notification,
    });
  } catch (error) {
    console.error("Error sending achievement notification:", error);
    return NextResponse.json(
      { error: "Failed to send achievement notification" },
      { status: 500 },
    );
  }
}

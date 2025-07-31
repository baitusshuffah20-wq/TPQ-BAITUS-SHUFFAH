import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is WALI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get wali's children
    const children = await prisma.santri.findMany({
      where: { waliId: session.user.id },
      select: {
        id: true,
        name: true,
        nis: true,
        halaqah: {
          select: {
            id: true,
            name: true,
            musyrif: {
              select: {
                id: true,
                name: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get unique musyrif list from children's halaqah
    const musyrifMap = new Map();
    children.forEach(child => {
      if (child.halaqah?.musyrif) {
        const musyrif = child.halaqah.musyrif;
        if (!musyrifMap.has(musyrif.id)) {
          musyrifMap.set(musyrif.id, {
            id: musyrif.id,
            name: musyrif.name,
            role: `Musyrif ${child.halaqah.name}`,
            avatar: musyrif.user?.avatar || null,
            email: musyrif.user?.email || null,
            phone: musyrif.user?.phone || null,
            isOnline: musyrif.user?.status === "ACTIVE",
            halaqah: child.halaqah.name,
            userId: musyrif.user?.id,
            children: []
          });
        }
        // Add child to musyrif's children list
        musyrifMap.get(musyrif.id).children.push({
          id: child.id,
          name: child.name,
          nis: child.nis
        });
      }
    });

    const musyrifList = Array.from(musyrifMap.values());

    // Get recent messages/communications
    // For now, we'll use notifications as communication history
    const recentCommunications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: { in: ["COMMUNICATION", "MESSAGE", "UPDATE"] }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        createdAt: true,
        isRead: true,
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    // Get communication statistics
    const totalMessages = recentCommunications.length;
    const unreadMessages = recentCommunications.filter(comm => !comm.isRead).length;
    const sentMessages = await prisma.notification.count({
      where: {
        createdBy: session.user.id,
        type: { in: ["COMMUNICATION", "MESSAGE", "UPDATE"] }
      }
    });

    // Calculate average response time (mock for now)
    const averageResponseTime = "2 jam";

    return NextResponse.json({
      success: true,
      data: {
        musyrifList,
        recentCommunications: recentCommunications.map(comm => ({
          id: comm.id,
          senderId: comm.creator?.id || "system",
          senderName: comm.creator?.name || "System",
          senderRole: comm.creator?.role || "SYSTEM",
          message: comm.message,
          title: comm.title,
          timestamp: comm.createdAt.toISOString(),
          isRead: comm.isRead,
          type: comm.type
        })),
        statistics: {
          totalMessages,
          unreadMessages,
          sentMessages,
          averageResponseTime
        },
        children
      }
    });

  } catch (error) {
    console.error("Error fetching communication data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is WALI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true }
    });

    if (user?.role !== "WALI") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { recipientId, message, type = "COMMUNICATION" } = body;

    if (!recipientId || !message) {
      return NextResponse.json(
        { error: "Recipient ID and message are required" },
        { status: 400 }
      );
    }

    // Verify recipient is a musyrif of wali's children
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        name: true,
        role: true,
        musyrif: {
          select: {
            halaqah: {
              select: {
                santri: {
                  where: { waliId: session.user.id },
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!recipient || recipient.role !== "MUSYRIF") {
      return NextResponse.json(
        { error: "Invalid recipient" },
        { status: 400 }
      );
    }

    // Check if recipient is musyrif of wali's children
    const hasChildren = recipient.musyrif?.some(m => 
      m.halaqah?.santri.length > 0
    );

    if (!hasChildren) {
      return NextResponse.json(
        { error: "You can only send messages to your children's musyrif" },
        { status: 403 }
      );
    }

    // Create notification as message
    const notification = await prisma.notification.create({
      data: {
        userId: recipientId,
        title: `Pesan dari ${user.name}`,
        message: message,
        type: type,
        priority: "NORMAL",
        status: "SENT",
        channels: "IN_APP",
        recipientType: "MUSYRIF",
        createdBy: session.user.id,
        sentAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        message: "Message sent successfully",
        notification: {
          id: notification.id,
          senderId: session.user.id,
          senderName: user.name,
          recipientId: recipientId,
          recipientName: recipient.name,
          message: notification.message,
          timestamp: notification.createdAt.toISOString(),
          status: notification.status
        }
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifySalaryRateUpdated } from "@/lib/salary-notifications";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can manage salary rates." },
        { status: 403 }
      );
    }

    console.log("🔌 Fetching salary rates...");

    // Get all musyrif with their current salary rates
    const musyrifList = await prisma.musyrif.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        salaryRates: {
          where: {
            isActive: true,
          },
          orderBy: {
            effectiveDate: "desc",
          },
          take: 1,
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const salaryRates = musyrifList.map(musyrif => ({
      musyrifId: musyrif.id,
      musyrifName: musyrif.name,
      userEmail: musyrif.user?.email || "",
      currentRate: musyrif.salaryRates[0] ? {
        id: musyrif.salaryRates[0].id,
        ratePerSession: Number(musyrif.salaryRates[0].ratePerSession),
        ratePerHour: Number(musyrif.salaryRates[0].ratePerHour),
        effectiveDate: musyrif.salaryRates[0].effectiveDate,
      } : null,
    }));

    console.log(`✅ Found ${salaryRates.length} musyrif salary rates`);

    return NextResponse.json({
      success: true,
      data: salaryRates,
    });

  } catch (error) {
    console.error("❌ Error fetching salary rates:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil data salary rates",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only admin can manage salary rates." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { musyrifId, ratePerSession, ratePerHour, effectiveDate } = body;

    // Validate required fields
    if (!musyrifId || !ratePerSession || !ratePerHour || !effectiveDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`🔌 Creating salary rate for musyrif: ${musyrifId}`);

    // Verify musyrif exists
    const musyrif = await prisma.musyrif.findUnique({
      where: { id: musyrifId },
    });

    if (!musyrif) {
      return NextResponse.json(
        { success: false, message: "Musyrif not found" },
        { status: 404 }
      );
    }

    // Deactivate previous rates
    await prisma.musyrifSalaryRate.updateMany({
      where: {
        musyrifId: musyrifId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new salary rate
    const newSalaryRate = await prisma.musyrifSalaryRate.create({
      data: {
        musyrifId,
        ratePerSession: parseFloat(ratePerSession),
        ratePerHour: parseFloat(ratePerHour),
        effectiveDate: new Date(effectiveDate),
        isActive: true,
      },
    });

    console.log(`✅ Salary rate created: ${newSalaryRate.id}`);

    // Send notification to musyrif
    if (musyrifRecord.user) {
      await notifySalaryRateUpdated(
        musyrifRecord.user.id,
        ratePerSession,
        ratePerHour,
        new Date(effectiveDate),
        newSalaryRate.id
      );
    }

    return NextResponse.json({
      success: true,
      message: "Salary rate berhasil dibuat",
      data: {
        id: newSalaryRate.id,
        musyrifId: newSalaryRate.musyrifId,
        ratePerSession: Number(newSalaryRate.ratePerSession),
        ratePerHour: Number(newSalaryRate.ratePerHour),
        effectiveDate: newSalaryRate.effectiveDate,
      },
    });

  } catch (error) {
    console.error("❌ Error creating salary rate:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat membuat salary rate",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

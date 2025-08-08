import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleDatabaseError } from "@/lib/errorHandler";

// POST - Bulk operations (activate, deactivate, delete, reorder)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, programIds, data } = body;

    if (!action || !programIds || !Array.isArray(programIds)) {
      return NextResponse.json(
        { error: "Missing required fields: action, programIds" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "activate":
        result = await prisma.program.updateMany({
          where: { id: { in: programIds } },
          data: { isActive: true },
        });
        break;

      case "deactivate":
        result = await prisma.program.updateMany({
          where: { id: { in: programIds } },
          data: { isActive: false },
        });
        break;

      case "delete":
        result = await prisma.program.deleteMany({
          where: { id: { in: programIds } },
        });
        break;

      case "reorder":
        // Bulk reorder programs
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { error: "Reorder data is required" },
            { status: 400 }
          );
        }

        // Update each program's order
        const updatePromises = data.map((item: { id: string; order: number }) =>
          prisma.program.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        );

        result = await Promise.all(updatePromises);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affected: result.count || result.length,
    });

  } catch (error) {
    console.error("Error in bulk operation:", error);
    return handleDatabaseError(error);
  }
}

// PUT - Bulk update programs
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { programs } = body;

    if (!programs || !Array.isArray(programs)) {
      return NextResponse.json(
        { error: "Programs array is required" },
        { status: 400 }
      );
    }

    // Update each program
    const updatePromises = programs.map((program: any) =>
      prisma.program.update({
        where: { id: program.id },
        data: {
          title: program.title,
          description: program.description,
          features: program.features,
          duration: program.duration,
          ageGroup: program.ageGroup,
          schedule: program.schedule,
          price: program.price,
          image: program.image,
          isActive: program.isActive,
          order: program.order,
        },
      })
    );

    const result = await Promise.all(updatePromises);

    return NextResponse.json({
      message: "Bulk update completed successfully",
      programs: result,
    });

  } catch (error) {
    console.error("Error in bulk update:", error);
    return handleDatabaseError(error);
  }
}

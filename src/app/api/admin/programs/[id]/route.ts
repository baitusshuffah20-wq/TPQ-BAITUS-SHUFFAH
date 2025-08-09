import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleDatabaseError } from "@/lib/errorHandler";

// GET - Fetch single program
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id: params.id },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Parse features JSON string back to array for frontend
    const programWithParsedFeatures = {
      ...program,
      features: (() => {
        try {
          return typeof program.features === 'string'
            ? JSON.parse(program.features)
            : program.features;
        } catch {
          return [];
        }
      })()
    };

    return NextResponse.json({ program: programWithParsedFeatures });

  } catch (error) {
    console.error("Error fetching program:", error);
    return handleDatabaseError(error);
  }
}

// PUT - Update program
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      features,
      duration,
      ageGroup,
      schedule,
      price,
      image,
      isActive,
      order,
    } = body;

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Update program
    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        title,
        description,
        features: JSON.stringify(features), // Convert array to JSON string
        duration,
        ageGroup,
        schedule,
        price,
        image,
        isActive,
        order,
      },
    });

    // Parse features JSON string back to array for frontend response
    const programWithParsedFeatures = {
      ...program,
      features: (() => {
        try {
          return typeof program.features === 'string'
            ? JSON.parse(program.features)
            : program.features;
        } catch {
          return [];
        }
      })()
    };

    return NextResponse.json({
      message: "Program updated successfully",
      program: programWithParsedFeatures,
    });

  } catch (error) {
    console.error("Error updating program:", error);
    return handleDatabaseError(error);
  }
}

// DELETE - Delete program
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Delete program
    await prisma.program.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Program deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting program:", error);
    return handleDatabaseError(error);
  }
}

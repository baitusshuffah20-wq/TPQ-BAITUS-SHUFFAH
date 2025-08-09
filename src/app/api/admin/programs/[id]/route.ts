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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

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

    // Validate required fields
    if (!title || !description || !features || !duration || !ageGroup) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, features, duration, ageGroup" },
        { status: 400 }
      );
    }

    // Validate features is an array
    if (!Array.isArray(features)) {
      return NextResponse.json(
        { error: "Features must be an array" },
        { status: 400 }
      );
    }

    // Check if program exists
    let existingProgram;
    try {
      existingProgram = await prisma.program.findUnique({
        where: { id: params.id },
      });
    } catch (error) {
      console.error("Error finding program:", error);
      return NextResponse.json(
        { error: "Database error while finding program" },
        { status: 500 }
      );
    }

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Update program
    let program;
    try {
      program = await prisma.program.update({
        where: { id: params.id },
        data: {
          title,
          description,
          features: JSON.stringify(features), // Convert array to JSON string
          duration,
          ageGroup,
          schedule: schedule || existingProgram.schedule,
          price: price || existingProgram.price,
          image: image || existingProgram.image,
          isActive: isActive !== undefined ? isActive : existingProgram.isActive,
          order: order || existingProgram.order,
        },
      });
    } catch (error) {
      console.error("Error updating program:", error);
      return NextResponse.json(
        { error: "Database error while updating program" },
        { status: 500 }
      );
    }

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

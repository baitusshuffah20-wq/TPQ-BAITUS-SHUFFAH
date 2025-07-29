import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";
import { z } from "zod";

// Schema for theme validation
const themeSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    success: z.string(),
    warning: z.string(),
    error: z.string(),
  }),
  buttons: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    danger: z.string(),
    info: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    arabic: z.string(),
  }),
  layout: z.object({
    borderRadius: z.string(),
    containerWidth: z.string(),
    sidebarStyle: z.enum(["default", "compact", "expanded"]),
  }),
  logo: z.object({
    main: z.string(),
    alt: z.string(),
    favicon: z.string(),
  }),
  isActive: z.boolean().optional(),
  name: z.string(),
});

// GET handler - Get a specific theme
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch theme",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT handler - Update a theme
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const id = params.id;
    const data = await req.json();

    // Validate theme data
    const validationResult = themeSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    // Get the existing theme for audit log
    const existingTheme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!existingTheme) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme not found",
        },
        { status: 404 },
      );
    }

    // If this is set as active, deactivate all other themes
    if (data.isActive) {
      await prisma.theme.updateMany({
        where: {
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    // Update theme in database
    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: {
        name: data.name,
        colors: data.colors,
        buttons: data.buttons,
        fonts: data.fonts,
        layout: data.layout,
        logo: data.logo,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await createAuditLog({
      action: "UPDATE",
      entity: "THEME",
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(existingTheme),
      newData: JSON.stringify(updatedTheme),
    });

    return NextResponse.json({
      success: true,
      theme: updatedTheme,
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update theme",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE handler - Delete a theme
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const id = params.id;

    // Check if theme exists
    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme not found",
        },
        { status: 404 },
      );
    }

    // Don't allow deleting the active theme
    if (theme.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete the active theme. Please activate another theme first.",
        },
        { status: 400 },
      );
    }

    // Delete theme from database
    await prisma.theme.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      entity: "THEME",
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(theme),
    });

    return NextResponse.json({
      success: true,
      message: "Theme deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting theme:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete theme",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

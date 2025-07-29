import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit-log";
import { getAuthUser, isAdmin } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get auth token from cookies or request headers
    const authToken =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    // For demo purposes, check if auth_user cookie exists
    const userCookie = request.cookies.get("auth_user")?.value;
    let userId = "unknown";

    if (!authToken || !userCookie) {
      console.log("No auth token or user cookie found");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    try {
      // Parse user data from cookie
      const userData = JSON.parse(decodeURIComponent(userCookie));
      userId = userData.id || "unknown";

      // Check if user is admin
      if (userData.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Only administrators can activate themes" },
          { status: 403 },
        );
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      return NextResponse.json(
        { success: false, error: "Invalid user data" },
        { status: 401 },
      );
    }

    try {
      // Validate theme exists first
      const existingTheme = await prisma.theme.findUnique({
        where: { id: params.id },
      });

      if (!existingTheme) {
        return NextResponse.json(
          { success: false, error: "Theme not found" },
          { status: 404 },
        );
      } // Deactivate all themes first
      await prisma.theme.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Then activate the selected theme
      const updatedTheme = await prisma.theme.update({
        where: { id: params.id },
        data: { isActive: true },
      });

      // Parse JSON fields for the response
      const themeWithParsedFields = {
        ...updatedTheme,
        colors: JSON.parse(updatedTheme.colors as string),
        buttons: JSON.parse(updatedTheme.buttons as string),
        fonts: JSON.parse(updatedTheme.fonts as string),
        layout: JSON.parse(updatedTheme.layout as string),
        logo: JSON.parse(updatedTheme.logo as string),
      };

      // userId is already defined and parsed above

      // Create audit log
      await createAuditLog({
        action: "ACTIVATE",
        entity: "Theme",
        entityId: updatedTheme.id,
        userId: userId,
        newData: JSON.stringify({ isActive: true }),
      });

      return NextResponse.json({
        success: true,
        theme: themeWithParsedFields,
      });
    } catch (error) {
      console.error("Database error:", error);

      // Check if it's a Prisma error by checking error properties
      const errorCode = (error as any)?.code;
      if (errorCode === "P2025") {
        return NextResponse.json(
          { success: false, error: "Theme not found" },
          { status: 404 },
        );
      }

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Error activating theme:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate theme" },
      { status: 500 },
    );
  }
}

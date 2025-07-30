import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { testConnection } from "@/lib/db-test";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow ADMIN role to access database test
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { status: "error", message: "Access denied. Only administrators can access database test." },
        { status: 403 }
      );
    }

    const result = await testConnection();

    if (result.success) {
      return NextResponse.json({
        status: "success",
        message: result.message,
        database: result.dbInfo,
      });
    } else {
      return NextResponse.json(
        { status: "error", message: result.message, error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error testing database connection:", error);
    return NextResponse.json(
      { status: "error", message: "Error testing database connection", error },
      { status: 500 },
    );
  }
}

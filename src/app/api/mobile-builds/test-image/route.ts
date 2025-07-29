import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import path from "path";
import { constants } from "fs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get("path");
    
    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: "No image path provided" },
        { status: 400 }
      );
    }

    // Construct full path
    const fullPath = path.join(process.cwd(), "public", imagePath);
    console.log("Testing image access:", fullPath);

    try {
      // Check if file exists and is readable
      await access(fullPath, constants.F_OK | constants.R_OK);
      console.log("File exists and is readable");

      // Try to read file stats
      const stats = await readFile(fullPath);
      console.log("File size:", stats.length);

      return NextResponse.json({
        success: true,
        path: imagePath,
        fullPath,
        size: stats.length,
        exists: true,
        readable: true
      });
    } catch (fileError) {
      console.log("File access error:", fileError);
      return NextResponse.json({
        success: false,
        path: imagePath,
        fullPath,
        exists: false,
        error: fileError.message
      });
    }
  } catch (error) {
    console.error("Test image error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test image access" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { appType, fileType } = await request.json();
    
    if (!appType || !fileType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Resetting config for:", { appType, fileType });

    // Get the directory path
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "mobile-assets",
      appType
    );

    // Remove all files of the specified type
    if (existsSync(uploadDir)) {
      const fs = require('fs');
      const files = fs.readdirSync(uploadDir);
      
      for (const file of files) {
        if (file.startsWith(fileType)) {
          const filePath = path.join(uploadDir, file);
          try {
            await unlink(filePath);
            console.log("Deleted file:", filePath);
          } catch (error) {
            console.error("Error deleting file:", filePath, error);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${fileType} files cleared for ${appType}`,
    });
  } catch (error) {
    console.error("Reset config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset config" },
      { status: 500 }
    );
  }
}

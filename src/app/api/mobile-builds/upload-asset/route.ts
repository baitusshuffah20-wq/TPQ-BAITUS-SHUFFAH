import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload asset request received");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const appType = formData.get("appType") as string;
    const fileType = formData.get("fileType") as string;

    console.log("Upload params:", {
      fileName: file?.name,
      fileSize: file?.size,
      appType,
      fileType
    });

    if (!file || !appType || !fileType) {
      console.log("Missing required fields:", { file: !!file, appType, fileType });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    // Create upload directory
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "mobile-assets",
      appType,
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${fileType}-${timestamp}${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image based on file type
    let processedBuffer = buffer;

    if (fileType === "icon") {
      // Resize icon to required sizes
      processedBuffer = await sharp(buffer)
        .resize(1024, 1024, {
          fit: "cover",
          position: "center",
        })
        .png()
        .toBuffer();
    } else if (fileType === "splashScreen") {
      // Resize splash screen
      processedBuffer = await sharp(buffer)
        .resize(1284, 2778, {
          fit: "cover",
          position: "center",
        })
        .png()
        .toBuffer();
    }

    // Save processed image
    console.log("Saving file to:", filePath);
    await writeFile(filePath, processedBuffer);
    console.log("File saved successfully");

    // Generate additional sizes for icons
    if (fileType === "icon") {
      console.log("Generating additional icon sizes");
      await generateIconSizes(processedBuffer, uploadDir, timestamp);
    }

    const publicPath = `/api/mobile-builds/assets/${appType}/${filename}`;
    console.log("Public path:", publicPath);

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      filename,
      size: processedBuffer.length,
      type: file.type,
    });
  } catch (error) {
    console.error("Asset upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload asset" },
      { status: 500 },
    );
  }
}

async function generateIconSizes(
  buffer: Buffer,
  uploadDir: string,
  timestamp: number,
) {
  const iconSizes = [
    { size: 48, name: `icon-48-${timestamp}.png` },
    { size: 72, name: `icon-72-${timestamp}.png` },
    { size: 96, name: `icon-96-${timestamp}.png` },
    { size: 144, name: `icon-144-${timestamp}.png` },
    { size: 192, name: `icon-192-${timestamp}.png` },
    { size: 512, name: `icon-512-${timestamp}.png` },
  ];

  for (const iconSize of iconSizes) {
    const resizedBuffer = await sharp(buffer)
      .resize(iconSize.size, iconSize.size, {
        fit: "cover",
        position: "center",
      })
      .png()
      .toBuffer();

    await writeFile(path.join(uploadDir, iconSize.name), resizedBuffer);
  }
}

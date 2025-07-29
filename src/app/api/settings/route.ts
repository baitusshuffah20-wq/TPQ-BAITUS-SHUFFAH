import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch all settings from the key-value table
    const allSettings = await prisma.siteSetting.findMany();

    // Convert to object format expected by frontend
    const settingsObject: { [key: string]: any } = {};

    allSettings.forEach((setting) => {
      settingsObject[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        label: setting.label,
        description: setting.description,
        isPublic: setting.isPublic,
      };
    });

    return NextResponse.json({
      success: true,
      settings: settingsObject,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settings",
        error: String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { key, value, type, category, label, description, isPublic } = data;

    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Key and value are required",
        },
        { status: 400 },
      );
    }

    // Update or create setting
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        type: type || "STRING",
        category: category || "GENERAL",
        label: label || key,
        description: description || "",
        isPublic: isPublic !== undefined ? isPublic : true,
      },
      create: {
        key,
        value: String(value),
        type: type || "STRING",
        category: category || "GENERAL",
        label: label || key,
        description: description || "",
        isPublic: isPublic !== undefined ? isPublic : true,
      },
    });

    return NextResponse.json({
      success: true,
      data: setting,
      message: "Setting updated successfully",
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update setting",
        error: String(error),
      },
      { status: 500 },
    );
  }
}

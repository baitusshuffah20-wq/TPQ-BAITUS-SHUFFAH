import { NextRequest, NextResponse } from "next/server";
import { generateSantriTemplateBlob } from "@/lib/excel-santri-template";

// GET /api/santri/template - Download Excel template for santri import
export async function GET(request: NextRequest) {
  try {
    console.log("📥 Generating santri Excel template...");

    // Generate Excel template blob
    const templateBlob = generateSantriTemplateBlob();

    // Create response with Excel file
    const response = new NextResponse(templateBlob);

    // Set headers for file download
    response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="Template_Import_Santri_${new Date().toISOString().split("T")[0]}.xlsx"`,
    );
    response.headers.set("Cache-Control", "no-cache");

    console.log("✅ Template generated successfully");
    return response;
  } catch (error) {
    console.error("❌ Error generating template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat template Excel",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

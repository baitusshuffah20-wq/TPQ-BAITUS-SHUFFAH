import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    // Check if the ID is a Midtrans order ID
    if (id.startsWith("donation_")) {
      // Try to find donation by reference field
      const donationByReference = await prisma.donation.findFirst({
        where: { reference: id },
        include: {
          category: true,
        },
      });

      if (donationByReference) {
        // Prepare response data with category info
        const responseData = {
          ...donationByReference,
          // If donation has a category, include the category name in the type field
          type: donationByReference.category
            ? `${donationByReference.type}:${donationByReference.category.title}`
            : donationByReference.type,
        };

        return NextResponse.json({
          success: true,
          donation: responseData,
        });
      }
    }

    // Try to find by ID
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 },
      );
    }

    // Prepare response data with category info
    const responseData = {
      ...donation,
      // If donation has a category, include the category name in the type field
      type: donation.category
        ? `${donation.type}:${donation.category.title}`
        : donation.type,
    };

    return NextResponse.json({
      success: true,
      donation: responseData,
    });
  } catch (error) {
    console.error("Error fetching donation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch donation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

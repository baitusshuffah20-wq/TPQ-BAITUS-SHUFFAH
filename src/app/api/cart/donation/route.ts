import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/lib/cart-service";
import { prisma } from "@/lib/prisma";

// POST /api/cart/donation - Add donation to cart
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("Error parsing request body as JSON:", jsonError);
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { cartId, donationType, amount, message, userId } = body;

    // Validation
    if (!cartId || !donationType || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart ID, donation type, and amount are required",
        },
        { status: 400 },
      );
    }

    if (amount < 10000) {
      return NextResponse.json(
        { success: false, message: "Minimum donation amount is Rp 10,000" },
        { status: 400 },
      );
    }

    // The logic for finding the donation category is now centralized in CartService.
    // We can directly call the service with the provided donationType.
    console.log("Adding donation to cart with type:", donationType);

    const cartItem = await CartService.addDonationToCart(
      cartId,
      donationType,
      amount,
      message,
      userId,
    );

    return NextResponse.json({
      success: true,
      message: "Donation added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    console.error("Error adding donation to cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add donation to cart",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET /api/cart/donation - Get donation types
export async function GET(request: NextRequest) {
  try {
    // Get donation categories from SiteSettings
    let donationTypes: any[] = [];

    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "donation_categories" },
      });

      if (setting) {
        const categories = JSON.parse(setting.value);

        // Filter active categories
        const activeCategories = categories.filter(
          (cat: any) => cat.isActive !== false,
        );

        // Map categories to donation types format
        donationTypes = activeCategories.map((category: any) => ({
          id: category.id,
          name: category.title,
          description: category.description,
          icon: category.icon,
          suggestedAmounts: [25000, 50000, 100000, 250000, 500000],
          minAmount: 10000,
          target: category.target,
          collected: category.collected,
          urgent: category.urgent,
        }));
      }
    } catch (err) {
      console.error("Error fetching donation categories:", err);
    }

    // If no categories found, provide default ones
    if (donationTypes.length === 0) {
      donationTypes.push({
        id: "general",
        name: "Donasi Umum",
        description: "Donasi untuk kebutuhan operasional sehari-hari TPQ",
        icon: "Heart",
        suggestedAmounts: [25000, 50000, 100000, 250000, 500000],
        minAmount: 10000,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        donationTypes,
        totalTypes: donationTypes.length,
      },
    });
  } catch (error) {
    console.error("Error getting donation types:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get donation types",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

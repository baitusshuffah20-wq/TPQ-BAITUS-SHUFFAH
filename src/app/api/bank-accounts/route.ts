import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bank-accounts - Get all bank accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (isActive && isActive !== "ALL") {
      where.isActive = isActive === "true";
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where,
      orderBy: [
        { isDefault: "desc" }, // Default account first
        { sortOrder: "asc" },
        { bankName: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      bankAccounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank accounts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/bank-accounts - Create new bank account
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.bankName || !data.accountNumber || !data.accountName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: bankName, accountNumber, accountName",
        },
        { status: 400 },
      );
    }

    // Check if account number already exists
    const existingAccount = await prisma.bankAccount.findFirst({
      where: { 
        accountNumber: data.accountNumber,
        bankName: data.bankName 
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account with this number already exists for this bank",
        },
        { status: 400 },
      );
    }

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        branch: data.branch || null,
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
        description: data.description || null,
        logo: data.logo || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({
      success: true,
      bankAccount,
      message: "Bank account created successfully",
    });
  } catch (error) {
    console.error("Error creating bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bank account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

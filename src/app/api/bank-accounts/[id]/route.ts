import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bank-accounts/[id] - Get specific bank account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: params.id },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { success: false, error: "Bank account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bankAccount,
    });
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/bank-accounts/[id] - Update bank account
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Check if bank account exists
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { id: params.id },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, error: "Bank account not found" },
        { status: 404 }
      );
    }

    // If this is set as default, unset other defaults
    if (data.isDefault && !existingAccount.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { 
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false },
      });
    }

    // Update bank account
    const updatedAccount = await prisma.bankAccount.update({
      where: { id: params.id },
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        branch: data.branch,
        isActive: data.isActive,
        isDefault: data.isDefault,
        description: data.description,
        logo: data.logo,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      bankAccount: updatedAccount,
      message: "Bank account updated successfully",
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update bank account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bank-accounts/[id] - Delete bank account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if bank account exists
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { id: params.id },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, error: "Bank account not found" },
        { status: 404 }
      );
    }

    // Check if account is being used in transactions
    const transactionCount = await prisma.transaction.count({
      where: { bankAccountId: params.id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete bank account that has been used in transactions",
        },
        { status: 400 }
      );
    }

    // Delete bank account
    await prisma.bankAccount.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete bank account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

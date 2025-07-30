import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment-methods - Get all active payment methods (gateways + bank accounts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'gateway', 'bank', or 'all'

    const paymentMethods: any[] = [];

    // Get active payment gateways
    if (type === "gateway" || type === "all" || !type) {
      try {
        const gateways = await prisma.paymentGateway.findMany({
          where: { isActive: true },
          orderBy: [
            { sortOrder: "asc" },
            { name: "asc" },
          ],
        });

        const gatewayMethods = gateways.map((gateway) => ({
          id: gateway.id,
          name: gateway.name,
          type: "GATEWAY",
          paymentType: gateway.type,
          provider: gateway.provider,
          description: gateway.description,
          logo: gateway.logo,
          fees: gateway.fees,
          config: gateway.config,
          sortOrder: gateway.sortOrder,
        }));

        paymentMethods.push(...gatewayMethods);
      } catch (error) {
        console.log("Payment gateways not available:", error);
      }
    }

    // Get active bank accounts
    if (type === "bank" || type === "all" || !type) {
      try {
        const bankAccounts = await prisma.bankAccount.findMany({
          where: { isActive: true },
          orderBy: [
            { isDefault: "desc" },
            { sortOrder: "asc" },
            { bankName: "asc" },
          ],
        });

        const bankMethods = bankAccounts.map((bank) => ({
          id: bank.id,
          name: `${bank.bankName} - ${bank.accountName}`,
          type: "BANK_TRANSFER",
          paymentType: "BANK_TRANSFER",
          provider: "MANUAL",
          description: bank.description || `Transfer ke rekening ${bank.bankName}`,
          logo: bank.logo,
          fees: {
            fixedFee: 0,
            percentageFee: 0,
            minFee: 0,
            maxFee: 0,
          },
          bankDetails: {
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            accountName: bank.accountName,
            branch: bank.branch,
          },
          isDefault: bank.isDefault,
          sortOrder: bank.sortOrder,
        }));

        paymentMethods.push(...bankMethods);
      } catch (error) {
        console.log("Bank accounts not available:", error);
      }
    }

    // Sort by sortOrder and name
    paymentMethods.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      paymentMethods,
      count: paymentMethods.length,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment methods",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

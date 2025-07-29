import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, PAYMENT_STATUS } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    console.log("Midtrans webhook received:", JSON.stringify(body, null, 2));

    // Extract data from the webhook
    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      payment_type: paymentType,
      gross_amount: grossAmount,
      transaction_time: transactionTime,
      signature_key: signatureKey,
    } = body;

    // Verify the webhook signature if available
    if (signatureKey && process.env.MIDTRANS_SERVER_KEY) {
      const isValid = verifyWebhookSignature(
        orderId,
        transactionStatus,
        grossAmount,
        process.env.MIDTRANS_SERVER_KEY,
        signatureKey,
      );

      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { success: false, error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    // Check if this is a donation payment
    if (orderId.startsWith("donation_")) {
      // Find the donation by reference
      const donation = await prisma.donation.findFirst({
        where: { reference: orderId },
      });

      if (!donation) {
        console.error(`Donation not found for order ID: ${orderId}`);
        return NextResponse.json(
          { success: false, error: "Donation not found" },
          { status: 404 },
        );
      }

      // Map transaction status to donation status
      let donationStatus = "PENDING";

      if (transactionStatus === PAYMENT_STATUS.SUCCESS) {
        donationStatus = "COMPLETED";
      } else if (transactionStatus === PAYMENT_STATUS.FAILED) {
        donationStatus = "FAILED";
      } else if (transactionStatus === PAYMENT_STATUS.CANCELLED) {
        donationStatus = "CANCELLED";
      } else if (transactionStatus === PAYMENT_STATUS.EXPIRED) {
        donationStatus = "EXPIRED";
      } else if (transactionStatus === PAYMENT_STATUS.PENDING) {
        donationStatus = "PENDING";
      }

      // Update the donation status
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: donationStatus,
          paymentMethod: paymentType || donation.paymentMethod,
          method: paymentType || donation.method || "MIDTRANS",
          // If payment is completed, set confirmedAt
          ...(donationStatus === "COMPLETED"
            ? { confirmedAt: new Date() }
            : {}),
        },
      });

      // If donation has a category and payment is completed, update the collected amount
      if (donation.categoryId && donationStatus === "COMPLETED") {
        await prisma.donationCategory.update({
          where: { id: donation.categoryId },
          data: {
            collected: {
              increment: donation.amount,
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Donation status updated to ${donationStatus}`,
      });
    }

    // Check if this is an SPP payment
    if (orderId.startsWith("spp_")) {
      // Find the payment by reference
      const payment = await prisma.payment.findFirst({
        where: { reference: orderId },
      });

      if (!payment) {
        console.error(`Payment not found for order ID: ${orderId}`);
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 },
        );
      }

      // Map transaction status to payment status
      let paymentStatus = "PENDING";

      if (transactionStatus === PAYMENT_STATUS.SUCCESS) {
        paymentStatus = "PAID";
      } else if (transactionStatus === PAYMENT_STATUS.FAILED) {
        paymentStatus = "FAILED";
      } else if (transactionStatus === PAYMENT_STATUS.CANCELLED) {
        paymentStatus = "CANCELLED";
      } else if (transactionStatus === PAYMENT_STATUS.EXPIRED) {
        paymentStatus = "EXPIRED";
      } else if (transactionStatus === PAYMENT_STATUS.PENDING) {
        paymentStatus = "PENDING";
      }

      // Update the payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          method: paymentType || payment.method,
          // If payment is paid, set paidDate
          ...(paymentStatus === "PAID" ? { paidDate: new Date() } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`,
      });
    }

    // If we reach here, the order ID format is not recognized
    console.warn(`Unrecognized order ID format: ${orderId}`);
    return NextResponse.json(
      {
        success: false,
        error: "Unrecognized order ID format",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

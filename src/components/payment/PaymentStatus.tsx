"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import useFetch from "@/hooks/useFetch";
import errorHandler from "@/lib/errorHandler";
import { formatCurrency } from "@/lib/utils";

interface PaymentStatusProps {
  type?: "donation" | "spp";
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ type = "donation" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status");
  const [pollingCount, setPollingCount] = useState(0);
  const [manualRefresh, setManualRefresh] = useState(false);

  const {
    data: paymentData,
    isLoading,
    error,
    get: fetchPaymentStatus,
  } = useFetch<{
    success: boolean;
    payment?: {
      id: string;
      status: string;
      amount: number;
      method: string;
      paidAt?: string;
      reference: string;
      type: string;
    };
    donation?: {
      id: string;
      status: string;
      amount: number;
      donorName: string;
      isAnonymous: boolean;
      type: string;
      categoryName?: string;
      paymentMethod?: string;
      confirmedAt?: string;
      reference: string;
    };
  }>();

  // Fetch payment status on load and when polling
  useEffect(() => {
    if (!orderId) return;

    const endpoint =
      type === "donation"
        ? `/api/donations/${orderId}`
        : `/api/payments/${orderId}`;

    fetchPaymentStatus(endpoint);

    // Reset manual refresh flag
    if (manualRefresh) {
      setManualRefresh(false);
    }
  }, [orderId, fetchPaymentStatus, type, manualRefresh]);

  // Poll for status updates if payment is pending
  useEffect(() => {
    if (!paymentData || isLoading) return;

    const payment =
      type === "donation" ? paymentData.donation : paymentData.payment;

    if (!payment) return;

    // If payment is still pending, poll for updates (max 10 times)
    if (payment.status === "PENDING" && pollingCount < 10) {
      const timer = setTimeout(() => {
        setPollingCount((prev) => prev + 1);
        setManualRefresh(true);
      }, 5000); // Poll every 5 seconds

      return () => clearTimeout(timer);
    }
  }, [paymentData, isLoading, pollingCount, type]);

  const handleRefresh = () => {
    setManualRefresh(true);
  };

  const getStatusDisplay = () => {
    if (error) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Checking Payment
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleRefresh} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-8">
          <PageLoading text="Checking payment status..." />
        </div>
      );
    }

    if (!paymentData || (!paymentData.payment && !paymentData.donation)) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't find any payment with the provided reference.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    const payment =
      type === "donation" ? paymentData.donation : paymentData.payment;

    if (payment.status === "PAID") {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Successful
          </h2>
          <p className="text-gray-600 mb-4">
            Your {type === "donation" ? "donation" : "payment"} of{" "}
            {formatCurrency(payment.amount)} has been received.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500 text-left">Reference:</div>
              <div className="text-gray-900 text-right font-medium">
                {payment.reference}
              </div>

              <div className="text-gray-500 text-left">Amount:</div>
              <div className="text-gray-900 text-right font-medium">
                {formatCurrency(payment.amount)}
              </div>

              <div className="text-gray-500 text-left">Status:</div>
              <div className="text-green-600 text-right font-medium">Paid</div>

              <div className="text-gray-500 text-left">Date:</div>
              <div className="text-gray-900 text-right font-medium">
                {payment.paidAt || payment.confirmedAt
                  ? new Date(
                      payment.paidAt || payment.confirmedAt!,
                    ).toLocaleString()
                  : "N/A"}
              </div>

              <div className="text-gray-500 text-left">Method:</div>
              <div className="text-gray-900 text-right font-medium">
                {payment.method || payment.paymentMethod || "Online Payment"}
              </div>

              {type === "donation" && "donorName" in payment && (
                <>
                  <div className="text-gray-500 text-left">Donor:</div>
                  <div className="text-gray-900 text-right font-medium">
                    {payment.isAnonymous ? "Anonymous" : payment.donorName}
                  </div>

                  {payment.categoryName && (
                    <>
                      <div className="text-gray-500 text-left">Category:</div>
                      <div className="text-gray-900 text-right font-medium">
                        {payment.categoryName}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            {type === "donation" && (
              <Link href="/donate">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Make Another Donation
                </Button>
              </Link>
            )}
          </div>
        </div>
      );
    } else if (payment.status === "PENDING") {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Pending
          </h2>
          <p className="text-gray-600 mb-4">
            Your {type === "donation" ? "donation" : "payment"} of{" "}
            {formatCurrency(payment.amount)} is being processed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500 text-left">Reference:</div>
              <div className="text-gray-900 text-right font-medium">
                {payment.reference}
              </div>

              <div className="text-gray-500 text-left">Amount:</div>
              <div className="text-gray-900 text-right font-medium">
                {formatCurrency(payment.amount)}
              </div>

              <div className="text-gray-500 text-left">Status:</div>
              <div className="text-yellow-600 text-right font-medium">
                Pending
              </div>

              {type === "donation" && "donorName" in payment && (
                <>
                  <div className="text-gray-500 text-left">Donor:</div>
                  <div className="text-gray-900 text-right font-medium">
                    {payment.isAnonymous ? "Anonymous" : payment.donorName}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleRefresh} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            This page will automatically refresh to check for updates.
            <br />
            Refreshed {pollingCount} times.
          </p>
        </div>
      );
    } else {
      // Failed, cancelled, or other status
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-4">
            Your {type === "donation" ? "donation" : "payment"} of{" "}
            {formatCurrency(payment.amount)} was not completed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500 text-left">Reference:</div>
              <div className="text-gray-900 text-right font-medium">
                {payment.reference}
              </div>

              <div className="text-gray-500 text-left">Amount:</div>
              <div className="text-gray-900 text-right font-medium">
                {formatCurrency(payment.amount)}
              </div>

              <div className="text-gray-500 text-left">Status:</div>
              <div className="text-red-600 text-right font-medium">
                {payment.status}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {type === "donation" ? (
              <Link href="/donate">
                <Button className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>
          {type === "donation" ? "Donation Status" : "Payment Status"}
        </CardTitle>
      </CardHeader>
      <CardContent>{getStatusDisplay()}</CardContent>
    </Card>
  );
};

export default PaymentStatus;

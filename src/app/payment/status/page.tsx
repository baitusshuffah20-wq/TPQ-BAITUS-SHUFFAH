"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PaymentStatus from "@/components/payment/PaymentStatus";
import PublicLayout from "@/components/layouts/PublicLayout";

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "donation" | "spp") || "donation";

  return (
    <PublicLayout>
      <div className="container mx-auto py-12 px-4">
        <PaymentStatus type={type} />
      </div>
    </PublicLayout>
  );
}

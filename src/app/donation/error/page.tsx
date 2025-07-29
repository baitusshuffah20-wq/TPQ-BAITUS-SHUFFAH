"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DonationErrorPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const errorMessage =
    searchParams.get("message") ||
    "Terjadi kesalahan saat memproses donasi Anda.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Donasi Gagal</h2>
          <p className="text-center text-gray-600">{errorMessage}</p>
          {orderId && (
            <p className="text-sm text-gray-500">ID Transaksi: {orderId}</p>
          )}
        </div>

        <div className="flex flex-col space-y-3 mt-6">
          <Link href="/donation" passHref>
            <Button variant="primary" className="w-full">
              Coba Lagi
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

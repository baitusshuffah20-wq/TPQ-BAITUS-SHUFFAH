"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DonationPendingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Donasi Dalam Proses
          </h2>
          <p className="text-center text-gray-600">
            Pembayaran Anda sedang diproses. Mohon tunggu konfirmasi dari bank
            atau penyedia pembayaran Anda.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">ID Transaksi: {orderId}</p>
          )}
        </div>

        <div className="p-4 mt-4 text-sm bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            <strong>Catatan:</strong> Jika Anda telah melakukan pembayaran,
            namun status masih menunggu setelah 1x24 jam, silakan hubungi kami
            melalui WhatsApp atau email dengan menyertakan ID transaksi Anda.
          </p>
        </div>

        <div className="flex flex-col space-y-3 mt-6">
          <Link href="/" passHref>
            <Button variant="primary" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/contact" passHref>
            <Button variant="outline" className="w-full">
              Hubungi Kami
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard Pengguna</h1>

          {session?.user ? (
            <div className="mb-6">
              <p className="text-lg">
                Selamat datang,{" "}
                <span className="font-semibold">{session.user.name}</span>!
              </p>
              <p className="text-gray-600">Email: {session.user.email}</p>
              <p className="text-gray-600">Role: {session.user.role}</p>
            </div>
          ) : (
            <p className="text-gray-600">Loading user information...</p>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Menu Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/profile"
                className="bg-teal-50 hover:bg-teal-100 p-4 rounded-lg border border-teal-200 transition-colors"
              >
                <h3 className="font-medium text-teal-700">Profil Saya</h3>
                <p className="text-sm text-gray-600">
                  Lihat dan edit informasi profil Anda
                </p>
              </Link>

              <Link
                href="/"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 transition-colors"
              >
                <h3 className="font-medium text-blue-700">
                  Kembali ke Beranda
                </h3>
                <p className="text-sm text-gray-600">
                  Kembali ke halaman utama website
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

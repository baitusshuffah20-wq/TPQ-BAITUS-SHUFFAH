"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { User } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>

          {session?.user ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <UserAvatar
                  name={session.user.name || "User"}
                  photo={session.user.avatar}
                  size="2xl"
                />
              </div>

              <div className="flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama</p>
                    <p className="font-medium">{session.user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{session.user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{session.user.role}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">ID Pengguna</p>
                    <p className="font-medium">{session.user.id}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Kembali ke Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading user information...</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Redirect based on user role
      if (session.user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (session.user.role === "MUSYRIF") {
        router.push("/dashboard/musyrif");
      } else if (session.user.role === "WALI") {
        router.push("/dashboard/wali");
      } else {
        // Default dashboard
        router.push("/dashboard/user");
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Redirecting to your dashboard...
        </h1>
        <p className="text-gray-600">
          Please wait while we redirect you to the appropriate dashboard.
        </p>
      </div>
    </div>
  );
}

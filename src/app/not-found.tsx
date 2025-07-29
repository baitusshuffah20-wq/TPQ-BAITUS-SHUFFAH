"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const pathname = usePathname();

  // Log 404 error for tracking
  React.useEffect(() => {
    // Only log in production to avoid filling logs during development
    if (process.env.NODE_ENV === "production") {
      try {
        fetch("/api/error-logger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `404 Page Not Found: ${pathname}`,
            severity: "WARNING",
            context: "Navigation",
            metadata: {
              url: pathname,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
            },
          }),
          // Use keepalive to ensure the request completes even if the page is unloading
          keepalive: true,
        }).catch(() => {
          // Ignore errors from the error logger
        });
      } catch (error) {
        console.error("Failed to log 404 error:", error);
      }
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <span className="text-red-600 text-5xl font-bold">404</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the page you're looking for.
          </p>
          <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-md">
            <p>URL: {pathname}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

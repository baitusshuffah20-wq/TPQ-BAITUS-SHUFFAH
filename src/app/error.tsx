"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const pathname = usePathname();

  // Log error for tracking
  React.useEffect(() => {
    // Log error to server
    try {
      fetch("/api/error-logger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Client-side error: ${error.message}`,
          stack: error.stack,
          severity: "ERROR",
          context: "Client Rendering",
          metadata: {
            url: pathname,
            digest: error.digest,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        }),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true,
      }).catch(() => {
        // Ignore errors from the error logger
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }, [error, pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We're sorry, but an error occurred while processing your request.
          </p>
          <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-md text-left">
            <p className="font-medium">Error: {error.message}</p>
            {error.digest && <p className="mt-1">Reference: {error.digest}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="w-full flex items-center justify-center"
              onClick={reset}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SessionDebug() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch("/api/debug/session");
        const data = await response.json();
        setDebugInfo(data);
      } catch (error) {
        console.error("Failed to fetch debug info:", error);
      }
    };

    fetchDebugInfo();
  }, [session, status]);

  const handleManualRedirect = async () => {
    try {
      // Try API-based redirect first
      const response = await fetch("/api/debug/force-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackUrl })
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        console.log("🚀 API redirect successful:", data.redirectUrl);
        window.location.replace(data.redirectUrl);
      } else {
        throw new Error(data.error || "API redirect failed");
      }
    } catch (error) {
      console.error("❌ API redirect failed, using fallback:", error);

      // Fallback to manual redirect
      if (callbackUrl) {
        window.location.href = decodeURIComponent(callbackUrl);
      } else if (session?.user?.role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">
          🐛 Session Debug Info (Development Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Session Status */}
        <div className="flex justify-between">
          <span>Session Status:</span>
          <Badge variant={status === "authenticated" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>User Email:</span>
              <span className="font-mono text-xs">{session.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>User Role:</span>
              <Badge variant="outline">{session.user.role}</Badge>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-xs">{session.user.id}</span>
            </div>
          </div>
        )}

        {/* URL Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Current URL:</span>
            <span className="font-mono text-xs">{window.location.href}</span>
          </div>
          {callbackUrl && (
            <div className="flex justify-between">
              <span>Callback URL:</span>
              <span className="font-mono text-xs">{callbackUrl}</span>
            </div>
          )}
        </div>

        {/* Debug API Info */}
        {debugInfo && (
          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between">
              <span>API Session:</span>
              <Badge variant={debugInfo.session ? "default" : "secondary"}>
                {debugInfo.session ? "Found" : "Not Found"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>API Token:</span>
              <Badge variant={debugInfo.token ? "default" : "secondary"}>
                {debugInfo.token ? "Found" : "Not Found"}
              </Badge>
            </div>
            {debugInfo.redirectLogic && (
              <div className="flex justify-between">
                <span>Suggested Redirect:</span>
                <span className="font-mono text-xs">
                  {debugInfo.redirectLogic.suggestedRedirect}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Manual Redirect Button */}
        {status === "authenticated" && (
          <div className="pt-2 border-t">
            <Button
              onClick={handleManualRedirect}
              size="sm"
              className="w-full"
            >
              🚀 Manual Redirect to Dashboard
            </Button>
          </div>
        )}

        {/* Error Info */}
        {debugInfo?.error && (
          <div className="text-red-600 text-xs border-t pt-2">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleLoginPage() {
  const [email, setEmail] = useState("admin@tpqbaitusshuffah.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Simple login attempt:", { email });

      // Try NextAuth first
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("🔍 NextAuth result:", result);

      if (result?.ok) {
        console.log("✅ NextAuth login successful, redirecting...");
        window.location.href = "/dashboard/admin";
        return;
      }

      // If NextAuth fails, try force login API
      console.log("⚠️ NextAuth failed, trying force login API...");
      const forceResponse = await fetch("/api/debug/force-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const forceResult = await forceResponse.json();
      console.log("🔍 Force login result:", forceResult);

      if (forceResult.success) {
        console.log("✅ Force login successful, redirecting...");
        window.location.href = forceResult.redirectUrl || "/dashboard/admin";
      } else {
        setError("Login failed: " + (forceResult.error || "Unknown error"));
        setLoading(false);
      }

    } catch (err) {
      console.error("💥 Login error:", err);
      setError("Network error");
      setLoading(false);
    }
  };

  const handleDirectRedirect = () => {
    console.log("🚀 Direct redirect to dashboard");
    window.location.href = "/dashboard/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🚨 Emergency Login</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Simple login page for debugging
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tpqbaitusshuffah.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t space-y-2">
            <Button 
              onClick={handleDirectRedirect}
              variant="outline"
              className="w-full"
            >
              🚀 Direct to Dashboard (Skip Auth)
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/login"}
              variant="ghost"
              className="w-full"
            >
              ← Back to Normal Login
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Default credentials:</p>
            <p>Email: admin@tpqbaitusshuffah.com</p>
            <p>Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export default function TestLoginPage() {
  const [email, setEmail] = useState("musyrif@test.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login berhasil!");
        
        // Store user data in localStorage for testing
        localStorage.setItem("test-user", JSON.stringify(data.data));
        
        // Redirect to musyrif attendance page
        router.push("/dashboard/musyrif/attendance");
      } else {
        toast.error(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Test Login - Musyrif</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Login untuk testing sistem absensi QR Code
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="musyrif@test.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Kredensial Test:</h3>
            <p className="text-xs text-gray-600">
              <strong>Email:</strong> musyrif@test.com<br />
              <strong>Password:</strong> password123<br />
              <strong>Role:</strong> MUSYRIF<br />
              <strong>Halaqah:</strong> Halaqah Test
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/musyrif/attendance")}
              className="text-sm"
            >
              Langsung ke Dashboard Musyrif
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

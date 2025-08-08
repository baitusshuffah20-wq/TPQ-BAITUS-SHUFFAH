"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Database, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Key
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface DebugResponse {
  success: boolean;
  database?: string;
  totalUsers?: number;
  adminUsers?: AdminUser[];
  message?: string;
  error?: string;
  details?: string;
  admin?: AdminUser;
  credentials?: {
    email: string;
    password: string;
  };
}

export default function DebugAdminPage() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [data, setData] = useState<DebugResponse | null>(null);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/create-admin");
      const result = await response.json();
      setData(result);
      
      if (result.success) {
        toast.success("Database check completed");
      } else {
        toast.error(result.error || "Database check failed");
      }
    } catch (error) {
      console.error("Error checking database:", error);
      toast.error("Failed to check database");
      setData({
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/debug/create-admin", {
        method: "POST",
      });
      const result = await response.json();
      setData(result);
      
      if (result.success) {
        toast.success("Admin user ready!");
      } else {
        toast.error(result.error || "Failed to create admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin");
      setData({
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Debug Admin Access</h1>
          <p className="text-gray-600 mt-2">
            Debug dashboard access issues on Vercel
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={checkDatabase}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Check Database
          </Button>

          <Button
            onClick={createAdmin}
            disabled={creating}
          >
            {creating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Create Admin User
          </Button>
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-4">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {data.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <Badge variant={data.success ? "default" : "destructive"}>
                      {data.database || (data.success ? "Connected" : "Failed")}
                    </Badge>
                  </div>
                  {data.totalUsers !== undefined && (
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <Badge variant="outline">{data.totalUsers}</Badge>
                    </div>
                  )}
                  {data.message && (
                    <div className="text-sm text-gray-600 mt-2">
                      {data.message}
                    </div>
                  )}
                  {data.error && (
                    <div className="text-sm text-red-600 mt-2">
                      <strong>Error:</strong> {data.error}
                      {data.details && (
                        <div className="text-xs mt-1 opacity-75">
                          {data.details}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Admin Users */}
            {data.adminUsers && data.adminUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Admin Users ({data.adminUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{admin.name}</div>
                          <div className="text-sm text-gray-600">{admin.email}</div>
                          <div className="text-xs text-gray-500">
                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{admin.role}</Badge>
                          <Badge variant={admin.isActive ? "default" : "secondary"}>
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* New Admin Credentials */}
            {data.credentials && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Key className="h-5 w-5" />
                    New Admin Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-green-800">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <code className="bg-green-100 px-2 py-1 rounded">
                        {data.credentials.email}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span>Password:</span>
                      <code className="bg-green-100 px-2 py-1 rounded">
                        {data.credentials.password}
                      </code>
                    </div>
                    <div className="text-sm mt-3 p-3 bg-green-100 rounded">
                      <strong>Next Steps:</strong>
                      <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Go to <a href="/login" className="underline">/login</a></li>
                        <li>Use the credentials above</li>
                        <li>Access <a href="/dashboard/admin" className="underline">/dashboard/admin</a></li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/login"
                className="p-3 border rounded-lg hover:bg-gray-50 text-center"
              >
                Login Page
              </a>
              <a
                href="/dashboard/admin"
                className="p-3 border rounded-lg hover:bg-gray-50 text-center"
              >
                Admin Dashboard
              </a>
              <a
                href="/api/debug/create-admin"
                target="_blank"
                className="p-3 border rounded-lg hover:bg-gray-50 text-center"
              >
                API Endpoint
              </a>
              <a
                href="/register"
                className="p-3 border rounded-lg hover:bg-gray-50 text-center"
              >
                Register Page
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

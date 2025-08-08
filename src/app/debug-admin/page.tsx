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
  const [checking, setChecking] = useState(false);
  const [testing, setTesting] = useState(false);
  const [data, setData] = useState<DebugResponse | null>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [loginTest, setLoginTest] = useState<any>(null);

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

  const checkUsers = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/debug/check-users");
      const result = await response.json();
      setUsersData(result);

      if (result.success) {
        toast.success(`Found ${result.totalUsers} users`);
      } else {
        toast.error(result.error || "Failed to check users");
      }
    } catch (error) {
      console.error("Error checking users:", error);
      toast.error("Failed to check users");
      setUsersData({
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setChecking(false);
    }
  };

  const testLogin = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/debug/check-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@tpqbaitusshuffah.com",
          password: "admin123"
        })
      });
      const result = await response.json();
      setLoginTest(result);

      if (result.success && result.passwordCheck?.isValid) {
        toast.success("Login credentials are valid!");
      } else if (result.success && !result.passwordCheck?.isValid) {
        toast.error("Password is incorrect");
      } else {
        toast.error(result.error || "Login test failed");
      }
    } catch (error) {
      console.error("Error testing login:", error);
      toast.error("Failed to test login");
      setLoginTest({
        success: false,
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setTesting(false);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-center">
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
            onClick={checkUsers}
            disabled={checking}
            variant="outline"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <User className="h-4 w-4 mr-2" />
            )}
            Check Users
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
            Create Admin
          </Button>

          <Button
            onClick={testLogin}
            disabled={testing}
            variant="secondary"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Key className="h-4 w-4 mr-2" />
            )}
            Test Login
          </Button>

          <Button
            onClick={async () => {
              setChecking(true);
              try {
                const response = await fetch("/api/debug/env-check");
                const envData = await response.json();
                setData(prevData => ({ ...prevData, environment: envData }));
                if (!envData.success) {
                  toast.error("Environment issues detected!");
                } else {
                  toast.success("Environment configuration OK");
                }
              } catch (error) {
                toast.error("Failed to check environment");
              } finally {
                setChecking(false);
              }
            }}
            disabled={checking}
            variant="outline"
            className="bg-purple-50 hover:bg-purple-100"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Check Environment
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

        {/* Users Data */}
        {usersData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                All Users ({usersData.totalUsers || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersData.success ? (
                <div className="space-y-4">
                  {/* Role Summary */}
                  {usersData.roleCounts && (
                    <div className="grid grid-cols-3 gap-4">
                      {usersData.roleCounts.map((roleCount: any) => (
                        <div key={roleCount.role} className="text-center p-3 border rounded">
                          <div className="font-medium">{roleCount.role}</div>
                          <div className="text-2xl font-bold text-blue-600">{roleCount._count.role}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Users List */}
                  {usersData.users && usersData.users.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Users:</h4>
                      {usersData.users.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{user.name || 'No Name'}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {user.emailVerified && (
                              <Badge variant="default" className="bg-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <strong>Error:</strong> {usersData.error}
                  {usersData.details && (
                    <div className="text-xs mt-1 opacity-75">{usersData.details}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Login Test Results */}
        {loginTest && (
          <Card className={loginTest.success && loginTest.passwordCheck?.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Login Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loginTest.success ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Email:</strong> admin@tpqbaitusshuffah.com
                    </div>
                    <div>
                      <strong>Password:</strong> admin123
                    </div>
                  </div>

                  {loginTest.user && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium mb-2">User Found:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Name:</strong> {loginTest.user.name}</div>
                        <div><strong>Role:</strong> {loginTest.user.role}</div>
                        <div><strong>Active:</strong> {loginTest.user.isActive ? 'Yes' : 'No'}</div>
                        <div><strong>Verified:</strong> {loginTest.user.emailVerified ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  )}

                  {loginTest.passwordCheck && (
                    <div className={`p-3 rounded ${loginTest.passwordCheck.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <strong>Password Check:</strong> {loginTest.passwordCheck.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <strong>Error:</strong> {loginTest.error}
                  {loginTest.suggestion && (
                    <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
                      <strong>Suggestion:</strong> {loginTest.suggestion}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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

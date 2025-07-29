"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Loader2,
} from "lucide-react";

interface TestResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: any;
  duration?: number;
}

export default function TestDatabasePage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;

      return {
        name: testName,
        status: "success" as const,
        message: "Test berhasil",
        details: result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: testName,
        status: "error" as const,
        message: error instanceof Error ? error.message : "Test gagal",
        details: error,
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      {
        name: "Database Connection",
        fn: async () => {
          const response = await fetch("/api/test/db");
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
      },
      {
        name: "Halaqah API",
        fn: async () => {
          const response = await fetch("/api/halaqah?type=QURAN");
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
      },
      {
        name: "Users API",
        fn: async () => {
          const response = await fetch("/api/users");
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
      },
      {
        name: "Santri API",
        fn: async () => {
          const response = await fetch("/api/santri");
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
      },
      {
        name: "Health Check",
        fn: async () => {
          const response = await fetch("/api/health");
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
      },
    ];

    const testResults: TestResult[] = [];

    for (const test of tests) {
      const result = await runTest(test.name, test.fn);
      testResults.push(result);
      setResults([...testResults]);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database & API Testing
          </h1>
          <p className="text-gray-600">
            Test koneksi database dan endpoint API untuk memastikan sistem
            berfungsi dengan baik.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                variant="primary"
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {isRunning ? "Running Tests..." : "Run All Tests"}
              </Button>

              <Button
                onClick={() => setResults([])}
                variant="outline"
                disabled={isRunning}
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-semibold">{result.name}</h3>
                      </div>
                      {result.duration && (
                        <span className="text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {result.message}
                    </p>

                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                          Show Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              {results.length > 0 && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.filter((r) => r.status === "success").length}
                      </div>
                      <div className="text-gray-600">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {results.filter((r) => r.status === "error").length}
                      </div>
                      <div className="text-gray-600">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.filter((r) => r.status === "warning").length}
                      </div>
                      <div className="text-gray-600">Warnings</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isRunning && results.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
                <p className="text-gray-600">Initializing tests...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

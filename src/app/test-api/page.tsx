"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestAPIPage() {
  const [santriData, setSantriData] = useState<any>(null);
  const [halaqahData, setHalaqahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSantriAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("?? Testing Santri API...");

      const response = await fetch("/api/santri");
      console.log("?? Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("?? Response data:", data);
      setSantriData(data);
    } catch (err) {
      console.error("? Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testHalaqahAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("?? Testing Halaqah API...");

      const response = await fetch("/api/halaqah");
      console.log("?? Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("?? Response data:", data);
      setHalaqahData(data);
    } catch (err) {
      console.error("? Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test API Endpoints</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Santri API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSantriAPI} disabled={loading}>
              {loading ? "Testing..." : "Test /api/santri"}
            </Button>

            {santriData && (
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-medium text-green-800">Success!</h4>
                <p className="text-sm text-green-600">
                  Found {santriData.santri?.length || 0} santri records
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-600">
                    View Raw Data
                  </summary>
                  <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(santriData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Halaqah API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testHalaqahAPI} disabled={loading}>
              {loading ? "Testing..." : "Test /api/halaqah"}
            </Button>

            {halaqahData && (
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-medium text-green-800">Success!</h4>
                <p className="text-sm text-green-600">
                  Found {halaqahData.halaqah?.length || 0} halaqah records
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-600">
                    View Raw Data
                  </summary>
                  <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(halaqahData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card>
          <CardContent className="bg-red-50 p-4">
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestSeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignResult, setCampaignResult] = useState<any>(null);

  const seedCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/donations/categories/seed-db", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error seeding categories:", error);
      setResult({ success: false, error: "Failed to seed categories" });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/donations/categories/seed-db", {
        method: "DELETE",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error deleting categories:", error);
      setResult({ success: false, error: "Failed to delete categories" });
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/donations/categories/seed-db");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error getting categories:", error);
      setResult({ success: false, error: "Failed to get categories" });
    } finally {
      setLoading(false);
    }
  };

  const seedCampaigns = async () => {
    try {
      setCampaignLoading(true);
      const response = await fetch("/api/donations/campaigns/seed", {
        method: "POST",
      });
      const data = await response.json();
      setCampaignResult(data);
    } catch (error) {
      console.error("Error seeding campaigns:", error);
      setCampaignResult({ success: false, error: "Failed to seed campaigns" });
    } finally {
      setCampaignLoading(false);
    }
  };

  const deleteCampaigns = async () => {
    try {
      setCampaignLoading(true);
      const response = await fetch("/api/donations/campaigns/seed", {
        method: "DELETE",
      });
      const data = await response.json();
      setCampaignResult(data);
    } catch (error) {
      console.error("Error deleting campaigns:", error);
      setCampaignResult({ success: false, error: "Failed to delete campaigns" });
    } finally {
      setCampaignLoading(false);
    }
  };

  const getCampaigns = async () => {
    try {
      setCampaignLoading(true);
      const response = await fetch("/api/donations/campaigns/seed");
      const data = await response.json();
      setCampaignResult(data);
    } catch (error) {
      console.error("Error getting campaigns:", error);
      setCampaignResult({ success: false, error: "Failed to get campaigns" });
    } finally {
      setCampaignLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Seed Donation Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={seedCategories} disabled={loading}>
              {loading ? "Loading..." : "Seed Categories"}
            </Button>
            <Button onClick={deleteCategories} disabled={loading} variant="destructive">
              {loading ? "Loading..." : "Delete All Categories"}
            </Button>
            <Button onClick={getCategories} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Get Categories"}
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Categories Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaigns Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Seed Donation Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={seedCampaigns} disabled={campaignLoading}>
              {campaignLoading ? "Loading..." : "Seed Campaigns"}
            </Button>
            <Button onClick={deleteCampaigns} disabled={campaignLoading} variant="destructive">
              {campaignLoading ? "Loading..." : "Delete All Campaigns"}
            </Button>
            <Button onClick={getCampaigns} disabled={campaignLoading} variant="outline">
              {campaignLoading ? "Loading..." : "Get Campaigns"}
            </Button>
          </div>

          {campaignResult && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Campaigns Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(campaignResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

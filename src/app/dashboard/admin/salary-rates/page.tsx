"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  Clock, 
  Calendar,
  User,
  Edit,
  Plus,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SalaryRate {
  musyrifId: string;
  musyrifName: string;
  userEmail: string;
  currentRate: {
    id: string;
    ratePerSession: number;
    ratePerHour: number;
    effectiveDate: string;
  } | null;
}

interface NewRateForm {
  musyrifId: string;
  ratePerSession: string;
  ratePerHour: string;
  effectiveDate: string;
}

export default function AdminSalaryRatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salaryRates, setSalaryRates] = useState<SalaryRate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [newRateForm, setNewRateForm] = useState<NewRateForm>({
    musyrifId: "",
    ratePerSession: "",
    ratePerHour: "",
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  // Check if user has admin role
  if (!user || user.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600">
              Hanya administrator yang dapat mengakses halaman ini.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    fetchSalaryRates();
  }, []);

  const fetchSalaryRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/salary-rates");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch salary rates");
      }

      if (result.success) {
        setSalaryRates(result.data);
      } else {
        setError(result.message || "Failed to load salary rates");
      }
    } catch (error) {
      console.error("Error fetching salary rates:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRateForm.musyrifId || !newRateForm.ratePerSession || !newRateForm.ratePerHour) {
      setError("Semua field harus diisi");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/salary-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          musyrifId: newRateForm.musyrifId,
          ratePerSession: parseFloat(newRateForm.ratePerSession),
          ratePerHour: parseFloat(newRateForm.ratePerHour),
          effectiveDate: newRateForm.effectiveDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create salary rate");
      }

      if (result.success) {
        setSuccess("Salary rate berhasil dibuat!");
        setNewRateForm({
          musyrifId: "",
          ratePerSession: "",
          ratePerHour: "",
          effectiveDate: new Date().toISOString().split('T')[0],
        });
        setEditingId(null);
        fetchSalaryRates();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "Failed to create salary rate");
      }
    } catch (error) {
      console.error("Error creating salary rate:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startEditing = (musyrif: SalaryRate) => {
    setEditingId(musyrif.musyrifId);
    setNewRateForm({
      musyrifId: musyrif.musyrifId,
      ratePerSession: musyrif.currentRate?.ratePerSession.toString() || "",
      ratePerHour: musyrif.currentRate?.ratePerHour.toString() || "",
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setError(null);
    setSuccess(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewRateForm({
      musyrifId: "",
      ratePerSession: "",
      ratePerHour: "",
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setError(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data salary rates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Salary Rates</h1>
            <p className="text-gray-600">Atur rate gaji per sesi dan per jam untuk setiap musyrif</p>
          </div>
          <Button onClick={fetchSalaryRates} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Salary Rates List */}
        <div className="grid gap-6">
          {salaryRates.map((musyrif) => (
            <Card key={musyrif.musyrifId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">{musyrif.musyrifName}</h3>
                      <p className="text-sm text-gray-500 font-normal">{musyrif.userEmail}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(musyrif)}
                    disabled={editingId === musyrif.musyrifId}
                  >
                    {editingId === musyrif.musyrifId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        {musyrif.currentRate ? "Update" : "Set Rate"}
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingId === musyrif.musyrifId ? (
                  /* Edit Form */
                  <form onSubmit={handleSubmitNewRate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ratePerSession" className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Rate Per Sesi
                        </Label>
                        <Input
                          id="ratePerSession"
                          type="number"
                          placeholder="Contoh: 50000"
                          value={newRateForm.ratePerSession}
                          onChange={(e) => setNewRateForm(prev => ({
                            ...prev,
                            ratePerSession: e.target.value
                          }))}
                          min="0"
                          step="1000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ratePerHour" className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Rate Per Jam
                        </Label>
                        <Input
                          id="ratePerHour"
                          type="number"
                          placeholder="Contoh: 25000"
                          value={newRateForm.ratePerHour}
                          onChange={(e) => setNewRateForm(prev => ({
                            ...prev,
                            ratePerHour: e.target.value
                          }))}
                          min="0"
                          step="1000"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effectiveDate" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Tanggal Berlaku
                      </Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={newRateForm.effectiveDate}
                        onChange={(e) => setNewRateForm(prev => ({
                          ...prev,
                          effectiveDate: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Simpan Rate
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelEditing}>
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Display Current Rate */
                  <div>
                    {musyrif.currentRate ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center text-green-700 mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Per Sesi</span>
                          </div>
                          <p className="text-lg font-bold text-green-900">
                            {formatCurrency(musyrif.currentRate.ratePerSession)}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center text-blue-700 mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Per Jam</span>
                          </div>
                          <p className="text-lg font-bold text-blue-900">
                            {formatCurrency(musyrif.currentRate.ratePerHour)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center text-purple-700 mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Berlaku Sejak</span>
                          </div>
                          <p className="text-lg font-bold text-purple-900">
                            {formatDate(musyrif.currentRate.effectiveDate)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada rate yang ditetapkan</p>
                        <p className="text-sm text-gray-400">Klik "Set Rate" untuk menetapkan rate gaji</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {salaryRates.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada data musyrif</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

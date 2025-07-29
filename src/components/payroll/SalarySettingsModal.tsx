"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Settings, Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface SalarySetting {
  id: string;
  position: string;
  salary_type: "FIXED" | "PER_SESSION" | "HOURLY";
  base_amount: number;
  overtime_rate: number;
  allowances: any;
  deductions: any;
  is_active: boolean;
}

interface SalarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const SalarySettingsModal: React.FC<SalarySettingsModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [settings, setSettings] = useState<SalarySetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SalarySetting | null>(
    null,
  );

  // Form states
  const [position, setPosition] = useState("");
  const [salaryType, setSalaryType] = useState<
    "FIXED" | "PER_SESSION" | "HOURLY"
  >("PER_SESSION");
  const [baseAmount, setBaseAmount] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [allowances, setAllowances] = useState<{ [key: string]: number }>({});
  const [deductions, setDeductions] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/salary-settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error loading salary settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPosition("");
    setSalaryType("PER_SESSION");
    setBaseAmount("");
    setOvertimeRate("");
    setAllowances({});
    setDeductions({});
    setEditingSetting(null);
  };

  const handleEdit = (setting: SalarySetting) => {
    setEditingSetting(setting);
    setPosition(setting.position);
    setSalaryType(setting.salary_type);
    setBaseAmount(setting.base_amount.toString());
    setOvertimeRate(setting.overtime_rate.toString());
    setAllowances(setting.allowances || {});
    setDeductions(setting.deductions || {});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSetting
        ? "/api/salary-settings"
        : "/api/salary-settings";
      const method = editingSetting ? "PUT" : "POST";

      const payload = {
        ...(editingSetting && { id: editingSetting.id }),
        position,
        salary_type: salaryType,
        base_amount: parseFloat(baseAmount),
        overtime_rate: parseFloat(overtimeRate) || 0,
        allowances,
        deductions,
        created_by: "current-user-id", // Replace with actual user ID
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          editingSetting
            ? "Pengaturan gaji berhasil diupdate"
            : "Pengaturan gaji berhasil ditambahkan",
        );
        setShowForm(false);
        resetForm();
        loadSettings();
        onRefresh();
      } else {
        alert("Gagal menyimpan pengaturan gaji: " + data.message);
      }
    } catch (error) {
      console.error("Error saving salary setting:", error);
      alert("Gagal menyimpan pengaturan gaji");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengaturan gaji ini?"))
      return;

    try {
      const response = await fetch(`/api/salary-settings?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Pengaturan gaji berhasil dihapus");
        loadSettings();
        onRefresh();
      } else {
        alert("Gagal menghapus pengaturan gaji: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting salary setting:", error);
      alert("Gagal menghapus pengaturan gaji");
    }
  };

  const addAllowanceDeduction = (
    type: "allowances" | "deductions",
    key: string,
    value: number,
  ) => {
    if (type === "allowances") {
      setAllowances((prev) => ({ ...prev, [key]: value }));
    } else {
      setDeductions((prev) => ({ ...prev, [key]: value }));
    }
  };

  const removeAllowanceDeduction = (
    type: "allowances" | "deductions",
    key: string,
  ) => {
    if (type === "allowances") {
      setAllowances((prev) => {
        const newAllowances = { ...prev };
        delete newAllowances[key];
        return newAllowances;
      });
    } else {
      setDeductions((prev) => {
        const newDeductions = { ...prev };
        delete newDeductions[key];
        return newDeductions;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pengaturan Gaji
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Kelola pengaturan gaji untuk setiap posisi
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Daftar Pengaturan Gaji</h3>
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Pengaturan
                </Button>
              </div>

              {/* Settings List */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {settings.map((setting) => (
                    <Card key={setting.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {setting.position}
                              </h4>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  setting.salary_type === "FIXED"
                                    ? "bg-blue-100 text-blue-800"
                                    : setting.salary_type === "PER_SESSION"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {setting.salary_type === "FIXED"
                                  ? "Gaji Tetap"
                                  : setting.salary_type === "PER_SESSION"
                                    ? "Per Sesi"
                                    : "Per Jam"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Gaji Pokok</p>
                                <p className="font-medium">
                                  Rp{" "}
                                  {setting.base_amount.toLocaleString("id-ID")}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Tunjangan</p>
                                <p className="font-medium">
                                  Rp{" "}
                                  {Object.values(setting.allowances || {})
                                    .reduce(
                                      (sum: number, val: any) =>
                                        sum + (parseFloat(val) || 0),
                                      0,
                                    )
                                    .toLocaleString("id-ID")}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Potongan</p>
                                <p className="font-medium text-red-600">
                                  Rp{" "}
                                  {Object.values(setting.deductions || {})
                                    .reduce(
                                      (sum: number, val: any) =>
                                        sum + (parseFloat(val) || 0),
                                      0,
                                    )
                                    .toLocaleString("id-ID")}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Rate Lembur</p>
                                <p className="font-medium">
                                  {setting.overtime_rate}x
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(setting)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(setting.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {settings.length === 0 && (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Belum ada pengaturan gaji</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">
                  {editingSetting
                    ? "Edit Pengaturan Gaji"
                    : "Tambah Pengaturan Gaji"}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Kembali
                </Button>
              </div>

              <div className="grid gap-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Dasar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posisi *
                        </label>
                        <select
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        >
                          <option value="">Pilih Posisi</option>
                          <option value="MUSYRIF">Musyrif</option>
                          <option value="ADMIN">Admin</option>
                          <option value="CLEANING">Cleaning Service</option>
                          <option value="SECURITY">Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipe Gaji *
                        </label>
                        <select
                          value={salaryType}
                          onChange={(e) => setSalaryType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        >
                          <option value="PER_SESSION">Per Sesi</option>
                          <option value="FIXED">Gaji Tetap</option>
                          <option value="HOURLY">Per Jam</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {salaryType === "PER_SESSION"
                            ? "Tarif per Sesi *"
                            : salaryType === "HOURLY"
                              ? "Tarif per Jam *"
                              : "Gaji Pokok *"}
                        </label>
                        <Input
                          type="number"
                          value={baseAmount}
                          onChange={(e) => setBaseAmount(e.target.value)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate Lembur (multiplier)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={overtimeRate}
                          onChange={(e) => setOvertimeRate(e.target.value)}
                          placeholder="1.5"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {editingSetting ? "Update Pengaturan" : "Simpan Pengaturan"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalarySettingsModal;

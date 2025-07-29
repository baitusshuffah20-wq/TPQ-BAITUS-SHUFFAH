"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Users, Calendar, Settings, AlertCircle } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: {
    month: number;
    year: number;
    employee_ids: string[];
  }) => void;
  loading?: boolean;
}

const GeneratePayrollModal: React.FC<GeneratePayrollModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  loading = false,
}) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      // Get employees with role MUSYRIF, ADMIN, STAFF
      const response = await fetch(
        "/api/users?roles=MUSYRIF,ADMIN,STAFF&status=ACTIVE",
      );
      const data = await response.json();

      if (data.success) {
        setEmployees(data.users || []);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployees(employees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
      setSelectAll(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      alert("Pilih minimal satu karyawan");
      return;
    }

    onGenerate({
      month,
      year,
      employee_ids: selectedEmployees,
    });
  };

  if (!isOpen) return null;

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Generate Payroll
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Buat payroll berdasarkan kehadiran dan pengaturan gaji
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Period Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Periode Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulan
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    {monthNames.map((name, index) => (
                      <option key={index + 1} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const yearOption = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pilih Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmployees ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="select-all"
                      className="font-medium text-gray-900"
                    >
                      Pilih Semua Karyawan ({employees.length})
                    </label>
                  </div>

                  {/* Employee List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) =>
                            handleEmployeeSelect(employee.id, e.target.checked)
                          }
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`employee-${employee.id}`}
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {employee.name}
                          </label>
                          <p className="text-sm text-gray-500">
                            {employee.role} • {employee.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {employees.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Tidak ada karyawan aktif</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Perhatian</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>
                      • Payroll akan digenerate berdasarkan data kehadiran
                      periode yang dipilih
                    </li>
                    <li>
                      • Pastikan pengaturan gaji sudah dikonfigurasi dengan
                      benar
                    </li>
                    <li>
                      • Payroll yang sudah ada untuk periode ini akan dilewati
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedEmployees.length === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Generate Payroll ({selectedEmployees.length})
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePayrollModal;

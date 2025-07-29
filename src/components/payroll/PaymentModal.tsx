"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";

interface PayrollData {
  id: string;
  employee_name: string;
  employee_position: string;
  period_display: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  calculation_details: any;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollData | null;
  onPay: (paymentData: {
    payroll_id: string;
    payment_method: string;
    payment_date: string;
    reference_number?: string;
    notes?: string;
  }) => void;
  loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  payroll,
  onPay,
  loading = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!payroll) return;

    onPay({
      payroll_id: payroll.id,
      payment_method: paymentMethod,
      payment_date: paymentDate,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
    });
  };

  const resetForm = () => {
    setPaymentMethod("CASH");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setReferenceNumber("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !payroll) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bayar Gaji</h2>
            <p className="text-sm text-gray-600 mt-1">
              Proses pembayaran gaji karyawan
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Employee Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Detail Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Karyawan</p>
                  <p className="font-medium text-gray-900">
                    {payroll.employee_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Posisi</p>
                  <p className="font-medium text-gray-900">
                    {payroll.employee_position}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Periode</p>
                  <p className="font-medium text-gray-900">
                    {payroll.period_display}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Disetujui
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rincian Gaji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gaji Kotor</span>
                  <span className="font-medium">
                    Rp {payroll.gross_salary.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Potongan</span>
                  <span className="font-medium text-red-600">
                    - Rp {payroll.deductions.toLocaleString("id-ID")}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Gaji Bersih
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    Rp {payroll.net_salary.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Calculation Details */}
              {payroll.calculation_details && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Detail Perhitungan:
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    {payroll.calculation_details.session_rate && (
                      <p>
                        • Tarif per sesi: Rp{" "}
                        {payroll.calculation_details.session_rate.toLocaleString(
                          "id-ID",
                        )}
                      </p>
                    )}
                    {payroll.calculation_details.attendance_percentage && (
                      <p>
                        • Persentase kehadiran:{" "}
                        {payroll.calculation_details.attendance_percentage.toFixed(
                          1,
                        )}
                        %
                      </p>
                    )}
                    {payroll.calculation_details.late_penalty && (
                      <p>
                        • Denda keterlambatan: Rp{" "}
                        {payroll.calculation_details.late_penalty.toLocaleString(
                          "id-ID",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Detail Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metode Pembayaran *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="CASH">Tunai</option>
                      <option value="TRANSFER">Transfer Bank</option>
                      <option value="CHECK">Cek</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Pembayaran *
                    </label>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {paymentMethod !== "CASH" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Referensi
                    </label>
                    <Input
                      type="text"
                      placeholder={
                        paymentMethod === "TRANSFER"
                          ? "Nomor transaksi transfer"
                          : "Nomor cek"
                      }
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    placeholder="Catatan tambahan (opsional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Informasi
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • Pembayaran akan otomatis dicatat ke modul keuangan
                      </li>
                      <li>
                        • Status payroll akan berubah menjadi "Sudah Dibayar"
                      </li>
                      <li>
                        • Transaksi ini tidak dapat dibatalkan setelah disimpan
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
                onClick={handleClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Bayar Gaji (Rp {payroll.net_salary.toLocaleString("id-ID")})
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

"use client";

import React, { useState } from "react";
import { CreditCard, DollarSign, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const PaymentSettings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    currency: "IDR",
    currencySymbol: "Rp",
    decimalSeparator: ",",
    thousandSeparator: ".",
    decimalPlaces: "0",

    // SPP Settings
    sppAmount: "150000",
    sppDueDay: "10",
    sppLateFee: "10000",
    sppLateFeeDays: "5",

    // Payment Methods
    paymentMethods: [
      {
        id: "1",
        name: "Transfer Bank",
        enabled: true,
        fee: "0",
        feeType: "fixed",
      },
      {
        id: "2",
        name: "QRIS",
        enabled: true,
        fee: "0.7",
        feeType: "percentage",
      },
      {
        id: "3",
        name: "E-Wallet",
        enabled: true,
        fee: "1",
        feeType: "percentage",
      },
      {
        id: "4",
        name: "Kartu Kredit",
        enabled: true,
        fee: "2.5",
        feeType: "percentage",
      },
      { id: "5", name: "Tunai", enabled: true, fee: "0", feeType: "fixed" },
    ],

    // Bank Accounts
    bankAccounts: [
      {
        id: "1",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountName: "Yayasan TPQ Baitus Shuffah",
        branch: "Jakarta Pusat",
        enabled: true,
      },
      {
        id: "2",
        bankName: "Mandiri",
        accountNumber: "0987654321",
        accountName: "Yayasan TPQ Baitus Shuffah",
        branch: "Jakarta Pusat",
        enabled: true,
      },
    ],
  });

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentMethodToggle = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method,
      ),
    }));
  };

  const handlePaymentMethodChange = (id: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method) =>
        method.id === id ? { ...method, [field]: value } : method,
      ),
    }));
  };

  const handleBankAccountToggle = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((account) =>
        account.id === id ? { ...account, enabled: !account.enabled } : account,
      ),
    }));
  };

  const handleBankAccountChange = (id: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((account) =>
        account.id === id ? { ...account, [field]: value } : account,
      ),
    }));
  };

  const addBankAccount = () => {
    const newId = (
      Math.max(...settings.bankAccounts.map((a) => parseInt(a.id))) + 1
    ).toString();
    setSettings((prev) => ({
      ...prev,
      bankAccounts: [
        ...prev.bankAccounts,
        {
          id: newId,
          bankName: "",
          accountNumber: "",
          accountName: "",
          branch: "",
          enabled: true,
        },
      ],
    }));
  };

  const removeBankAccount = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((account) => account.id !== id),
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Simulasi delay untuk demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Pengaturan pembayaran berhasil disimpan!");
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast.error("Gagal menyimpan pengaturan pembayaran");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Currency Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-500" />
          Pengaturan Mata Uang
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mata Uang
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
            >
              <option value="IDR">Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="SGD">Singapore Dollar (SGD)</option>
              <option value="MYR">Malaysian Ringgit (MYR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Simbol Mata Uang
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.currencySymbol}
              onChange={(e) =>
                handleInputChange("currencySymbol", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pemisah Desimal
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.decimalSeparator}
              onChange={(e) =>
                handleInputChange("decimalSeparator", e.target.value)
              }
            >
              <option value=",">Koma (,)</option>
              <option value=".">Titik (.)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pemisah Ribuan
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.thousandSeparator}
              onChange={(e) =>
                handleInputChange("thousandSeparator", e.target.value)
              }
            >
              <option value=".">Titik (.)</option>
              <option value=",">Koma (,)</option>
              <option value=" ">Spasi ( )</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Desimal
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.decimalPlaces}
              onChange={(e) =>
                handleInputChange("decimalPlaces", e.target.value)
              }
            >
              <option value="0">0</option>
              <option value="2">2</option>
            </select>
          </div>
        </div>
      </div>

      {/* SPP Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
          Pengaturan SPP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nominal SPP Default
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{settings.currencySymbol}</span>
              </div>
              <input
                type="text"
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.sppAmount}
                onChange={(e) => handleInputChange("sppAmount", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Jatuh Tempo (Hari ke-)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.sppDueDay}
              onChange={(e) => handleInputChange("sppDueDay", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denda Keterlambatan
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{settings.currencySymbol}</span>
              </div>
              <input
                type="text"
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={settings.sppLateFee}
                onChange={(e) =>
                  handleInputChange("sppLateFee", e.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masa Tenggang (Hari)
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={settings.sppLateFeeDays}
              onChange={(e) =>
                handleInputChange("sppLateFeeDays", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Metode Pembayaran
        </h3>
        <div className="space-y-4">
          {settings.paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`method-${method.id}`}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  checked={method.enabled}
                  onChange={() => handlePaymentMethodToggle(method.id)}
                />
                <label
                  htmlFor={`method-${method.id}`}
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  {method.name}
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-32">
                  <input
                    type="text"
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    value={method.fee}
                    onChange={(e) =>
                      handlePaymentMethodChange(
                        method.id,
                        "fee",
                        e.target.value,
                      )
                    }
                    disabled={!method.enabled}
                  />
                </div>

                <select
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  value={method.feeType}
                  onChange={(e) =>
                    handlePaymentMethodChange(
                      method.id,
                      "feeType",
                      e.target.value,
                    )
                  }
                  disabled={!method.enabled}
                >
                  <option value="fixed">Tetap</option>
                  <option value="percentage">Persentase</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Rekening Bank</h3>
          <Button variant="outline" size="sm" onClick={addBankAccount}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Rekening
          </Button>
        </div>

        <div className="space-y-4">
          {settings.bankAccounts.map((account) => (
            <div
              key={account.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`account-${account.id}`}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    checked={account.enabled}
                    onChange={() => handleBankAccountToggle(account.id)}
                  />
                  <label
                    htmlFor={`account-${account.id}`}
                    className="ml-2 block text-sm font-medium text-gray-700"
                  >
                    {account.bankName || "Rekening Baru"}
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeBankAccount(account.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={account.bankName}
                    onChange={(e) =>
                      handleBankAccountChange(
                        account.id,
                        "bankName",
                        e.target.value,
                      )
                    }
                    disabled={!account.enabled}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={account.accountNumber}
                    onChange={(e) =>
                      handleBankAccountChange(
                        account.id,
                        "accountNumber",
                        e.target.value,
                      )
                    }
                    disabled={!account.enabled}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Atas Nama
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={account.accountName}
                    onChange={(e) =>
                      handleBankAccountChange(
                        account.id,
                        "accountName",
                        e.target.value,
                      )
                    }
                    disabled={!account.enabled}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cabang
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={account.branch}
                    onChange={(e) =>
                      handleBankAccountChange(
                        account.id,
                        "branch",
                        e.target.value,
                      )
                    }
                    disabled={!account.enabled}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Pembayaran
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettings;

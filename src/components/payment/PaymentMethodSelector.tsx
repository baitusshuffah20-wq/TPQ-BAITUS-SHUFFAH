"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  Building2,
  Smartphone,
  QrCode,
  Wallet,
  CheckCircle,
  Clock,
  Info,
  ArrowRight,
  Shield,
  Zap,
  Copy,
  ExternalLink,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: "GATEWAY" | "BANK_TRANSFER";
  paymentType: string;
  provider: string;
  description?: string;
  logo?: string;
  fees: {
    fixedFee: number;
    percentageFee: number;
    minFee: number;
    maxFee: number;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
  };
  isDefault?: boolean;
  sortOrder: number;
}

interface PaymentMethodSelectorProps {
  amount: number;
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethodId?: string;
  className?: string;
}

export default function PaymentMethodSelector({
  amount,
  onMethodSelect,
  selectedMethodId,
  className = "",
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment-methods");
      const data = await response.json();

      if (data.success) {
        setPaymentMethods(data.paymentMethods || []);
      } else {
        console.error("Failed to load payment methods:", data.error);
        toast.error("Gagal memuat metode pembayaran");
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast.error("Terjadi kesalahan saat memuat metode pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case "CREDIT_CARD":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "E_WALLET":
        return <Smartphone className="h-5 w-5 text-green-600" />;
      case "QRIS":
        return <QrCode className="h-5 w-5 text-purple-600" />;
      case "BANK_TRANSFER":
        return <Building2 className="h-5 w-5 text-orange-600" />;
      case "VIRTUAL_ACCOUNT":
        return <Building2 className="h-5 w-5 text-indigo-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateFee = (method: PaymentMethod) => {
    const { fixedFee, percentageFee } = method.fees;
    const percentageFeeAmount = (amount * percentageFee) / 100;
    return fixedFee + percentageFeeAmount;
  };

  const getTotalAmount = (method: PaymentMethod) => {
    return amount + calculateFee(method);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard");
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium">Pilih Metode Pembayaran</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }



  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Pilih Metode Pembayaran</h3>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const fee = calculateFee(method);
          const total = getTotalAmount(method);

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onMethodSelect(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPaymentIcon(method.paymentType)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{method.name}</h4>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                      {method.provider !== "MANUAL" && (
                        <p className="text-xs text-gray-500">
                          via {method.provider}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {fee > 0 && (
                      <p className="text-sm text-gray-600">
                        Biaya: Rp {fee.toLocaleString()}
                      </p>
                    )}
                    <p className="font-medium">
                      Total: Rp {total.toLocaleString()}
                    </p>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto mt-1" />
                    )}
                  </div>
                </div>

                {/* Bank Transfer Details */}
                {isSelected && method.type === "BANK_TRANSFER" && method.bankDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium mb-3">Detail Transfer</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{method.bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">No. Rekening:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-medium">
                            {method.bankDetails.accountNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(method.bankDetails!.accountNumber);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Atas Nama:</span>
                        <span className="font-medium">{method.bankDetails.accountName}</span>
                      </div>
                      {method.bankDetails.branch && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Cabang:</span>
                          <span className="font-medium">{method.bankDetails.branch}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-medium text-lg border-t pt-2">
                        <span>Jumlah Transfer:</span>
                        <div className="flex items-center space-x-2">
                          <span>Rp {total.toLocaleString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(total.toString());
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gateway Payment Info */}
                {isSelected && method.type === "GATEWAY" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Anda akan diarahkan ke halaman pembayaran {method.provider}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
          })}
      </div>

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              Tidak ada metode pembayaran yang tersedia saat ini.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

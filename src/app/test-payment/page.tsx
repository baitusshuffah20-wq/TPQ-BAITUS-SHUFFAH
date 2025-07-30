"use client";

import { useState } from "react";
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const amount = 150000; // Test amount

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Test Payment Method Selector</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PaymentMethodSelector
            amount={amount}
            onMethodSelect={setSelectedMethod}
            selectedMethodId={selectedMethod?.id}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Selected Method</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMethod ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedMethod.name}</p>
                  <p><strong>Type:</strong> {selectedMethod.type}</p>
                  <p><strong>Provider:</strong> {selectedMethod.provider}</p>
                  <p><strong>Description:</strong> {selectedMethod.description}</p>
                  {selectedMethod.bankDetails && (
                    <div className="mt-4">
                      <h4 className="font-medium">Bank Details:</h4>
                      <p>Bank: {selectedMethod.bankDetails.bankName}</p>
                      <p>Account: {selectedMethod.bankDetails.accountNumber}</p>
                      <p>Name: {selectedMethod.bankDetails.accountName}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No method selected</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

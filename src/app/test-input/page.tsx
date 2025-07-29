"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";

export default function TestInputPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Test Input Component
          </h1>

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={emailError}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <button
              onClick={() => {
                if (!email) {
                  setEmailError("Email is required");
                } else {
                  setEmailError("");
                  alert(`Email: ${email}, Password: ${password}`);
                }
              }}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
            >
              Test Submit
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

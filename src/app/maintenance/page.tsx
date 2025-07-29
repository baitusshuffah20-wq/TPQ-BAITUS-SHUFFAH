"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export default function MaintenancePage() {
  const [settings, setSettings] = useState({
    siteName: "TPQ Baitus Shuffah",
    logo: "",
    email: "contact@tpqbaitusshuffah.com",
  });

  useEffect(() => {
    // Fetch settings
    fetch("/api/settings?public=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const newSettings = {
            siteName: data.settings["site.name"]?.value || "TPQ Baitus Shuffah",
            logo: data.settings["site.logo"]?.value || "",
            email:
              data.settings["contact.email"]?.value ||
              "contact@tpqbaitusshuffah.com",
          };
          setSettings(newSettings);
        }
      })
      .catch((err) => {
        console.error("Error fetching settings:", err);
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          {settings.logo ? (
            <Image
              src={settings.logo}
              alt={settings.siteName}
              width={150}
              height={150}
              className="h-auto"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-teal-600">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-center text-teal-600 mb-4">
          Sedang Dalam Pemeliharaan
        </h1>

        <div className="h-1 w-20 bg-teal-500 mx-auto mb-6"></div>

        <p className="text-lg text-center text-gray-700 mb-6">
          Mohon maaf atas ketidaknyamanannya. Saat ini kami sedang melakukan
          pemeliharaan sistem untuk meningkatkan layanan kami.
        </p>

        <p className="text-center text-gray-600 mb-8">
          Silakan kembali beberapa saat lagi. Terima kasih atas pengertian Anda.
        </p>

        <div className="text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {settings.siteName}
          </p>
          {settings.email && <p className="mt-1">Kontak: {settings.email}</p>}
        </div>
      </div>
    </div>
  );
}

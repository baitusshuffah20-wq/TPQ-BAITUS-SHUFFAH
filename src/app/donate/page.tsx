"use client";

import React from "react";
import Link from "next/link";
import PublicLayout from "@/components/layout/PublicLayout";
import DonationSection from "@/components/sections/DonationSection";

export default function DonatePage() {

  return (
    <PublicLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Donasi untuk TPQ Baitus Shuffah
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                Bersama membangun generasi Qur'ani yang bertaqwa dan berakhlakul
                karimah
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-teal-600 hover:text-teal-700">
                Beranda
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Donasi</span>
            </nav>
          </div>
        </div>

        {/* Donation Section */}
        <DonationSection />
      </div>
    </PublicLayout>
  );
}
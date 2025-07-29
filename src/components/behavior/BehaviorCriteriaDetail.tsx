"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Star,
  Award,
  BookOpen,
  Users,
  Shield,
  Crown,
  AlertCircle,
} from "lucide-react";

interface BehaviorCriteria {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  category:
    | "AKHLAQ"
    | "IBADAH"
    | "ACADEMIC"
    | "SOCIAL"
    | "DISCIPLINE"
    | "LEADERSHIP";
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  points: number;
  isActive: boolean;
  ageGroup: string;
  examples: string[];
  consequences?: string[];
  rewards?: string[];
  islamicReference?: {
    quranVerse?: string;
    hadith?: string;
    explanation?: string;
  };
  usage?: {
    total: number;
    recent: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface BehaviorCriteriaDetailProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: BehaviorCriteria | null;
}

export default function BehaviorCriteriaDetail({
  isOpen,
  onClose,
  criteria,
}: BehaviorCriteriaDetailProps) {
  if (!isOpen || !criteria) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AKHLAQ":
        return <Star className="h-5 w-5" />;
      case "IBADAH":
        return <Award className="h-5 w-5" />;
      case "ACADEMIC":
        return <BookOpen className="h-5 w-5" />;
      case "SOCIAL":
        return <Users className="h-5 w-5" />;
      case "DISCIPLINE":
        return <Shield className="h-5 w-5" />;
      case "LEADERSHIP":
        return <Crown className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AKHLAQ":
        return "text-green-600 bg-green-100";
      case "IBADAH":
        return "text-blue-600 bg-blue-100";
      case "ACADEMIC":
        return "text-purple-600 bg-purple-100";
      case "SOCIAL":
        return "text-orange-600 bg-orange-100";
      case "DISCIPLINE":
        return "text-red-600 bg-red-100";
      case "LEADERSHIP":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "text-green-600 bg-green-100";
      case "NEGATIVE":
        return "text-red-600 bg-red-100";
      case "NEUTRAL":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Detail Kriteria Perilaku
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Informasi Dasar
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Kriteria
                  </label>
                  <p className="text-gray-900">{criteria.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Arab
                  </label>
                  <p className="text-gray-900" dir="rtl">
                    {criteria.nameArabic}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <p className="text-gray-900">{criteria.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kelompok Usia
                  </label>
                  <p className="text-gray-900">{criteria.ageGroup}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Klasifikasi
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(criteria.category)}`}
                  >
                    {getCategoryIcon(criteria.category)}
                    <span className="ml-2">{criteria.category}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe
                  </label>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getTypeColor(criteria.type)}`}
                  >
                    {criteria.type === "POSITIVE"
                      ? "✅"
                      : criteria.type === "NEGATIVE"
                        ? "⚠️"
                        : "➖"}
                    <span className="ml-2">{criteria.type}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tingkat
                  </label>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getSeverityColor(criteria.severity)}`}
                  >
                    {criteria.severity}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Poin
                  </label>
                  <span
                    className={`text-lg font-bold ${criteria.points > 0 ? "text-green-600" : criteria.points < 0 ? "text-red-600" : "text-gray-600"}`}
                  >
                    {criteria.points > 0 ? "+" : ""}
                    {criteria.points}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      criteria.isActive
                        ? "text-green-600 bg-green-100"
                        : "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {criteria.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Contoh Perilaku
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {criteria.examples.map((example, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span className="text-gray-700">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consequences (for negative behaviors) */}
          {criteria.type === "NEGATIVE" &&
            criteria.consequences &&
            criteria.consequences.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Konsekuensi
                </h4>
                <div className="bg-red-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {criteria.consequences.map((consequence, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span className="text-gray-700">{consequence}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          {/* Rewards (for positive behaviors) */}
          {criteria.type === "POSITIVE" &&
            criteria.rewards &&
            criteria.rewards.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Penghargaan
                </h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {criteria.rewards.map((reward, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span className="text-gray-700">{reward}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          {/* Islamic Reference */}
          {criteria.islamicReference &&
            (criteria.islamicReference.quranVerse ||
              criteria.islamicReference.hadith ||
              criteria.islamicReference.explanation) && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Referensi Islam
                </h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  {criteria.islamicReference.quranVerse && (
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Ayat Al-Qur'an
                      </label>
                      <p className="text-blue-700">
                        {criteria.islamicReference.quranVerse}
                      </p>
                    </div>
                  )}
                  {criteria.islamicReference.hadith && (
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Hadits
                      </label>
                      <p className="text-blue-700" dir="rtl">
                        {criteria.islamicReference.hadith}
                      </p>
                    </div>
                  )}
                  {criteria.islamicReference.explanation && (
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Penjelasan
                      </label>
                      <p className="text-blue-700">
                        {criteria.islamicReference.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Usage Statistics */}
          {criteria.usage && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Statistik Penggunaan
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {criteria.usage.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Penggunaan</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {criteria.usage.recent}
                  </div>
                  <div className="text-sm text-gray-600">Bulan Ini</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Informasi Sistem
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <label className="block font-medium">ID Kriteria</label>
                <p className="font-mono">{criteria.id}</p>
              </div>
              <div>
                <label className="block font-medium">Dibuat</label>
                <p>{formatDate(criteria.createdAt)}</p>
              </div>
              <div>
                <label className="block font-medium">Terakhir Diperbarui</label>
                <p>{formatDate(criteria.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
}

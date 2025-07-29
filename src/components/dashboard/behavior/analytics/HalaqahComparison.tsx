import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HalaqahComparisonProps {
  data: {
    halaqahId: string;
    halaqahName: string;
    studentCount: number;
    averageScore: number;
    positiveRate: number;
  }[];
}

const HalaqahComparison: React.FC<HalaqahComparisonProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perbandingan Antar Halaqah</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((halaqah) => (
            <div
              key={halaqah.halaqahId}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {halaqah.halaqahName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {halaqah.studentCount} santri
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {halaqah.averageScore}
                    </p>
                    <p className="text-xs text-gray-600">Rata-rata Skor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {halaqah.positiveRate}%
                    </p>
                    <p className="text-xs text-gray-600">Tingkat Positif</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full"
                  style={{ width: `${halaqah.positiveRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HalaqahComparison;

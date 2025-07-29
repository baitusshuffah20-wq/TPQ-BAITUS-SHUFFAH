import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
} from "@/lib/behavior-data";

interface CategoryBreakdownProps {
  data: {
    category: any;
    count: number;
    positiveCount: number;
    negativeCount: number;
    averagePoints: number;
  }[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik per Kategori Perilaku</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((category) => (
            <div
              key={category.category}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getBehaviorCategoryColor(
                    category.category,
                  )}`}
                >
                  {getBehaviorCategoryText(category.category)}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {category.count}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Positif:</span>
                  <span className="font-medium">{category.positiveCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Negatif:</span>
                  <span className="font-medium">{category.negativeCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rata-rata Poin:</span>
                  <span
                    className={`font-medium ${
                      category.averagePoints > 0
                        ? "text-green-600"
                        : category.averagePoints < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {category.averagePoints > 0 ? "+" : ""}
                    {category.averagePoints}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (category.positiveCount / category.count) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;

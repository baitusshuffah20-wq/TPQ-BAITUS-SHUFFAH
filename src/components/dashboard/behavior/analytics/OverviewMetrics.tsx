import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  BarChart3,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
} from "lucide-react";

interface OverviewMetricsProps {
  data: {
    totalStudents: number;
    totalRecords: number;
    averageScore: number;
    improvingStudents: number;
    needsAttention: number;
    perfectBehavior: number;
  };
}

const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ data }) => {
  const metrics = [
    {
      icon: Users,
      label: "Total Santri",
      value: data.totalStudents,
      color: "blue",
    },
    {
      icon: BarChart3,
      label: "Total Catatan",
      value: data.totalRecords,
      color: "purple",
    },
    {
      icon: Target,
      label: "Rata-rata Skor",
      value: data.averageScore,
      color: "teal",
    },
    {
      icon: TrendingUp,
      label: "Berkembang",
      value: data.improvingStudents,
      color: "green",
    },
    {
      icon: AlertTriangle,
      label: "Perlu Perhatian",
      value: data.needsAttention,
      color: "red",
    },
    {
      icon: Award,
      label: "Perilaku Sempurna",
      value: data.perfectBehavior,
      color: "yellow",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "teal":
        return "bg-teal-100 text-teal-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}
              >
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OverviewMetrics;

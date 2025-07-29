import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  AlertTriangle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { getGradeColor } from "@/lib/behavior-data";

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "improving":
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    case "declining":
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    case "stable":
      return <Minus className="h-4 w-4 text-gray-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-600" />;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "improving":
      return "text-green-600 bg-green-100";
    case "declining":
      return "text-red-600 bg-red-100";
    case "stable":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

interface StudentRankingsProps {
  topPerformers: any[];
  needsAttention: any[];
}

const StudentRankings: React.FC<StudentRankingsProps> = ({
  topPerformers,
  needsAttention,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Santri Berprestasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((student: any, index: number) => (
              <div
                key={student.santriId}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {student.santriName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total Poin: {student.totalPoints}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {student.score}
                    </p>
                    <p className="text-xs text-gray-600">Skor</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(
                      student.grade,
                    )}`}
                  >
                    {student.grade}
                  </span>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendColor(
                      student.trend,
                    )}`}
                  >
                    {getTrendIcon(student.trend)}
                    <span className="text-xs font-medium capitalize">
                      {student.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Santri yang Memerlukan Perhatian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {needsAttention.map((student: any) => (
              <div
                key={student.santriId}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {student.santriName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total Poin: {student.totalPoints}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-600">
                        {student.score}
                      </p>
                      <p className="text-xs text-gray-600">Skor</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(
                        student.grade,
                      )}`}
                    >
                      {student.grade}
                    </span>
                    <div
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendColor(
                        student.trend,
                      )}`}
                    >
                      {getTrendIcon(student.trend)}
                      <span className="text-xs font-medium capitalize">
                        {student.trend}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Area yang perlu diperbaiki:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {student.issues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <XCircle className="h-3 w-3" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRankings;

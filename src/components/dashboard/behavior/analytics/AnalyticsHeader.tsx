import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, FileSpreadsheet } from "lucide-react";

interface AnalyticsHeaderProps {
  analyticsData?: any;
  selectedPeriod?: string;
  selectedHalaqah?: string;
  selectedCategory?: string;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  analyticsData,
  selectedPeriod = "MONTHLY",
  selectedHalaqah = "all",
  selectedCategory = "all",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleExportReport = async () => {
    if (!analyticsData) {
      alert("Data analytics belum tersedia untuk di-export");
      return;
    }

    setIsExporting(true);
    try {
      // Import modern Excel template
      const { exportModernExcel, createBehaviorAnalyticsTemplate } =
        await import("@/lib/excel-templates");

      // Create modern template with analytics data
      const templateOptions = createBehaviorAnalyticsTemplate(analyticsData, {
        period: selectedPeriod,
        halaqah: selectedHalaqah,
        category: selectedCategory,
      });

      console.log("Modern Excel template prepared:", templateOptions);

      // Export using modern template
      exportModernExcel(templateOptions);

      alert(
        "📊 Report Analytics Perilaku berhasil di-export dengan template modern!",
      );
    } catch (error) {
      console.error("Error exporting modern report:", error);
      alert("Gagal export report. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetails = () => {
    setShowDetailModal(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Perilaku Santri
          </h1>
          <p className="text-gray-600">
            Analisis mendalam perkembangan karakter dan akhlaq santri
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={isExporting || !analyticsData}
          >
            {isExporting ? (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleViewDetails}
            disabled={!analyticsData}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Detail Analytics Perilaku
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {analyticsData && (
              <div className="space-y-6">
                {/* Overview Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Overview Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm text-blue-600">Total Santri</div>
                      <div className="text-xl font-bold text-blue-800">
                        {analyticsData.overview?.totalStudents || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-green-600">
                        Total Records
                      </div>
                      <div className="text-xl font-bold text-green-800">
                        {analyticsData.overview?.totalRecords || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-sm text-purple-600">
                        Average Score
                      </div>
                      <div className="text-xl font-bold text-purple-800">
                        {analyticsData.overview?.averageScore || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-sm text-yellow-600">Improving</div>
                      <div className="text-xl font-bold text-yellow-800">
                        {analyticsData.overview?.improvingStudents || 0}
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-sm text-red-600">
                        Needs Attention
                      </div>
                      <div className="text-xl font-bold text-red-800">
                        {analyticsData.overview?.needsAttention || 0}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded">
                      <div className="text-sm text-emerald-600">
                        Perfect Behavior
                      </div>
                      <div className="text-xl font-bold text-emerald-800">
                        {analyticsData.overview?.perfectBehavior || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Statistics */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Category Statistics
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Category
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Total
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Positive
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Negative
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                            Avg Points
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.categoryStats?.map(
                          (cat: any, index: number) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {cat.category}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {cat.count}
                              </td>
                              <td className="px-4 py-2 text-sm text-green-600">
                                {cat.positiveCount}
                              </td>
                              <td className="px-4 py-2 text-sm text-red-600">
                                {cat.negativeCount}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {cat.averagePoints}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Performers */}
                {analyticsData.topPerformers?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Top Performers
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.topPerformers.map(
                        (student: any, index: number) => (
                          <div
                            key={index}
                            className="bg-green-50 p-3 rounded flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium text-green-800">
                                {student.santriName}
                              </div>
                              <div className="text-sm text-green-600">
                                Score: {student.behaviorScore} | Grade:{" "}
                                {student.characterGrade} | Trend:{" "}
                                {student.trend}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {student.positiveCount} positive,{" "}
                                {student.negativeCount} negative
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Needs Attention */}
                {analyticsData.needsAttention?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Needs Attention
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.needsAttention.map(
                        (student: any, index: number) => (
                          <div key={index} className="bg-red-50 p-3 rounded">
                            <div className="font-medium text-red-800">
                              {student.santriName}
                            </div>
                            <div className="text-sm text-red-600">
                              Score: {student.behaviorScore} | Grade:{" "}
                              {student.characterGrade} | Trend: {student.trend}
                            </div>
                            {student.issues?.length > 0 && (
                              <div className="text-sm text-gray-600 mt-1">
                                Issues: {student.issues.join(", ")}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsHeader;

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface FilterControlsProps {
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  selectedHalaqah: string;
  setSelectedHalaqah: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  halaqahList: { id: string; name: string }[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedPeriod,
  setSelectedPeriod,
  selectedHalaqah,
  setSelectedHalaqah,
  selectedCategory,
  setSelectedCategory,
  halaqahList,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Period:</label>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="WEEKLY">Mingguan</option>
            <option value="MONTHLY">Bulanan</option>
            <option value="QUARTERLY">Triwulan</option>
            <option value="YEARLY">Tahunan</option>
          </select>
          <select
            value={selectedHalaqah}
            onChange={(e) => setSelectedHalaqah(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Semua Halaqah</option>
            {halaqahList && halaqahList.length > 0 ? (
              halaqahList.map((halaqah) => (
                <option key={halaqah.id} value={halaqah.id}>
                  {halaqah.name}
                </option>
              ))
            ) : (
              <option disabled>Loading halaqah...</option>
            )}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Semua Kategori</option>
            <option value="AKHLAQ">Akhlaq</option>
            <option value="IBADAH">Ibadah</option>
            <option value="ACADEMIC">Akademik</option>
            <option value="SOCIAL">Sosial</option>
            <option value="DISCIPLINE">Disiplin</option>
            <option value="LEADERSHIP">Kepemimpinan</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterControls;

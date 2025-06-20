'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Plus,
  Edit,
  Eye,
  MapPin,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

const MusyrifHalaqahPage = () => {
  const { user } = useAuth();
  const [selectedHalaqah, setSelectedHalaqah] = useState<string | null>(null);

  // Mock data for halaqah managed by this musyrif
  const halaqahList = [
    {
      id: '1',
      name: 'Halaqah Al-Fatihah',
      level: 'Pemula',
      schedule: 'Senin, Rabu, Jumat',
      time: '08:00 - 09:30',
      location: 'Ruang A',
      capacity: 15,
      currentStudents: 12,
      targetSurah: 'Al-Fatihah - Al-Baqarah',
      description: 'Halaqah untuk santri pemula yang baru memulai hafalan',
      students: [
        { id: '1', name: 'Ahmad Fauzi', progress: 75 },
        { id: '2', name: 'Siti Aisyah', progress: 60 },
        { id: '3', name: 'Muhammad Ali', progress: 80 }
      ]
    },
    {
      id: '2',
      name: 'Halaqah Al-Baqarah',
      level: 'Menengah',
      schedule: 'Selasa, Kamis, Sabtu',
      time: '10:00 - 11:30',
      location: 'Ruang B',
      capacity: 12,
      currentStudents: 10,
      targetSurah: 'Al-Baqarah - Ali Imran',
      description: 'Halaqah untuk santri yang sudah menguasai juz pertama',
      students: [
        { id: '4', name: 'Muhammad Rizki', progress: 85 },
        { id: '5', name: 'Fatimah Zahra', progress: 70 },
        { id: '6', name: 'Abdullah Rahman', progress: 90 }
      ]
    },
    {
      id: '3',
      name: 'Halaqah Ali Imran',
      level: 'Lanjutan',
      schedule: 'Senin, Rabu, Jumat',
      time: '14:00 - 15:30',
      location: 'Ruang C',
      capacity: 10,
      currentStudents: 8,
      targetSurah: 'Ali Imran - An-Nisa',
      description: 'Halaqah untuk santri tingkat lanjutan',
      students: [
        { id: '7', name: 'Umar Faruq', progress: 95 },
        { id: '8', name: 'Khadijah Binti', progress: 88 }
      ]
    }
  ];

  const totalStudents = halaqahList.reduce((acc, h) => acc + h.currentStudents, 0);
  const totalCapacity = halaqahList.reduce((acc, h) => acc + h.capacity, 0);
  const averageProgress = halaqahList.reduce((acc, h) => {
    const halaqahAvg = h.students.reduce((sum, s) => sum + s.progress, 0) / h.students.length;
    return acc + halaqahAvg;
  }, 0) / halaqahList.length;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Pemula': return 'bg-blue-100 text-blue-800';
      case 'Menengah': return 'bg-yellow-100 text-yellow-800';
      case 'Lanjutan': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCapacityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Halaqah</h1>
            <p className="text-gray-600">Kelola halaqah dan jadwal pembelajaran</p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Buat Halaqah Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Halaqah</p>
                  <p className="text-2xl font-bold text-gray-900">{halaqahList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Santri</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                  <p className="text-xs text-gray-500">dari {totalCapacity} kapasitas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rata-rata Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(averageProgress)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sesi Minggu Ini</p>
                  <p className="text-2xl font-bold text-gray-900">18</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Halaqah List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {halaqahList.map((halaqah) => (
            <Card key={halaqah.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{halaqah.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(halaqah.level)}`}>
                    {halaqah.level}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {halaqah.schedule}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {halaqah.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {halaqah.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Target className="h-4 w-4 mr-2" />
                      {halaqah.targetSurah}
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Kapasitas</span>
                      <span className={`text-sm font-semibold ${getCapacityColor(halaqah.currentStudents, halaqah.capacity)}`}>
                        {halaqah.currentStudents}/{halaqah.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full" 
                        style={{ width: `${(halaqah.currentStudents / halaqah.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600">{halaqah.description}</p>

                  {/* Top Students */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Santri Terbaik</h4>
                    <div className="space-y-2">
                      {halaqah.students.slice(0, 3).map((student) => (
                        <div key={student.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{student.name}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="bg-teal-600 h-1.5 rounded-full" 
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-600 text-xs">{student.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Detail
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Jadwal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Buat Halaqah</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Atur Jadwal</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Kelola Santri</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Award className="h-6 w-6 mb-2" />
                <span className="text-sm">Evaluasi</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MusyrifHalaqahPage;

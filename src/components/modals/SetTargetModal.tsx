'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  Target,
  Calendar,
  BookOpen,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Users,
  Zap,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  QURAN_SURAHS,
  HafalanTarget,
  TargetTemplate,
  TARGET_TEMPLATES,
  getSurahById,
  getTargetTypeText,
  getPriorityText
} from '@/lib/quran-data';

interface SetTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriId?: string;
  santriName?: string;
  onSuccess: (target: HafalanTarget) => void;
  existingTarget?: HafalanTarget;
}

export default function SetTargetModal({
  isOpen,
  onClose,
  santriId,
  santriName,
  onSuccess,
  existingTarget
}: SetTargetModalProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TargetTemplate | null>(null);
  const [customTarget, setCustomTarget] = useState(false);
  const [formData, setFormData] = useState({
    santriId: santriId || '',
    santriName: santriName || '',
    surahId: 0,
    targetType: 'MONTHLY' as HafalanTarget['targetType'],
    targetAyahs: 0,
    targetDate: '',
    startDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM' as HafalanTarget['priority'],
    description: '',
    notes: '',
    reminders: {
      enabled: true,
      frequency: 'WEEKLY' as HafalanTarget['reminders']['frequency']
    }
  });
  
  const [santriList, setSantriList] = useState<{ id: string; name: string; nis: string }[]>([]);

  useEffect(() => {
    if (existingTarget) {
      setFormData({
        santriId: existingTarget.santriId,
        santriName: existingTarget.santriName,
        surahId: existingTarget.surahId,
        targetType: existingTarget.targetType,
        targetAyahs: existingTarget.targetAyahs,
        targetDate: existingTarget.targetDate.split('T')[0],
        startDate: existingTarget.startDate.split('T')[0],
        priority: existingTarget.priority,
        description: existingTarget.description || '',
        notes: existingTarget.notes || '',
        reminders: existingTarget.reminders
      });
      setCustomTarget(true);
      setStep(2);
    }
  }, [existingTarget]);
  
  // Load santri list
  useEffect(() => {
    const loadSantriList = async () => {
      try {
        console.log('Memuat daftar santri...');
        
        // Gunakan data contoh terlebih dahulu untuk menghindari UI kosong
        const mockSantriList = [
          { id: 'santri_001', name: 'Ahmad Fauzi', nis: 'S001' },
          { id: 'santri_002', name: 'Fatimah Azzahra', nis: 'S002' },
          { id: 'santri_003', name: 'Muhammad Rizki', nis: 'S003' },
          { id: 'santri_004', name: 'Aisyah Putri', nis: 'S004' },
          { id: 'santri_005', name: 'Abdullah Zaki', nis: 'S005' }
        ];
        
        // Set data contoh terlebih dahulu
        setSantriList(mockSantriList);
        
        // Coba ambil data dari API
        try {
          // Tambahkan parameter simple=true untuk mendapatkan data santri yang lebih sederhana
          const response = await fetch('/api/santri?simple=true');
          
          if (!response.ok) {
            console.error(`API responded with status: ${response.status}`);
            return; // Gunakan data contoh yang sudah di-set
          }
          
          const data = await response.json();
          
          if (data.success && data.santri && data.santri.length > 0) {
            const apiSantriList = data.santri.map((s: any) => ({
              id: s.id,
              name: s.name,
              nis: s.nis || '-'
            }));
            
            console.log('Berhasil memuat daftar santri dari API:', apiSantriList.length);
            setSantriList(apiSantriList);
          } else {
            console.log('API berhasil tetapi tidak ada data santri, tetap menggunakan data contoh');
          }
        } catch (apiError) {
          console.error('Error saat mengambil data dari API:', apiError);
          // Tetap menggunakan data contoh yang sudah di-set
        }
      } catch (error) {
        console.error('Error umum saat memuat daftar santri:', error);
      }
    };
    
    // Hanya muat daftar santri jika tidak ada santriId yang diberikan
    if (!santriId) {
      loadSantriList();
    }
  }, [santriId]);

  const handleTemplateSelect = (template: TargetTemplate) => {
    setSelectedTemplate(template);
    const surahId = template.surahIds[0] || 0;
    const surah = getSurahById(surahId);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + template.duration);

    setFormData(prev => ({
      ...prev,
      surahId,
      targetType: template.targetType,
      targetAyahs: surah?.totalAyahs || 0,
      targetDate: targetDate.toISOString().split('T')[0],
      description: template.description,
      priority: template.difficulty === 'BEGINNER' ? 'LOW' : 
                template.difficulty === 'INTERMEDIATE' ? 'MEDIUM' : 'HIGH'
    }));
    setStep(2);
  };

  const handleCustomTarget = () => {
    setCustomTarget(true);
    setSelectedTemplate(null);
    setStep(2);
  };

  const handleSurahChange = (surahId: number) => {
    const surah = getSurahById(surahId);
    setFormData(prev => ({
      ...prev,
      surahId,
      targetAyahs: surah?.totalAyahs || 0
    }));
  };

  const calculateEstimatedDuration = () => {
    const surah = getSurahById(formData.surahId);
    if (!surah) return 0;
    
    // Estimate based on surah difficulty and length
    const baseHours = surah.totalAyahs * 0.5; // 30 minutes per ayah average
    const difficultyMultiplier = surah.difficulty === 'EASY' ? 0.7 : 
                                surah.difficulty === 'MEDIUM' ? 1.0 : 1.5;
    return Math.ceil(baseHours * difficultyMultiplier);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.santriId || !formData.surahId || !formData.targetDate) {
        toast.error('Mohon lengkapi semua field yang diperlukan');
        return;
      }

      const surah = getSurahById(formData.surahId);
      if (!surah) {
        toast.error('Surah tidak ditemukan');
        return;
      }

      const newTarget: HafalanTarget = {
        id: existingTarget?.id || `target_${Date.now()}`,
        santriId: formData.santriId,
        santriName: formData.santriName,
        surahId: formData.surahId,
        surahName: surah.name,
        targetType: formData.targetType,
        targetAyahs: formData.targetAyahs,
        completedAyahs: existingTarget?.completedAyahs || 0,
        targetDate: new Date(formData.targetDate).toISOString(),
        startDate: new Date(formData.startDate).toISOString(),
        createdBy: 'current_user_id',
        createdByName: 'Admin TPQ',
        createdAt: existingTarget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: existingTarget?.status || 'ACTIVE',
        progress: existingTarget?.progress || 0,
        priority: formData.priority,
        description: formData.description,
        notes: formData.notes,
        reminders: formData.reminders,
        milestones: [
          { percentage: 25, reward: 'Sticker Bintang' },
          { percentage: 50, reward: 'Sertifikat Progress' },
          { percentage: 75, reward: 'Hadiah Kecil' },
          { percentage: 100, reward: 'Sertifikat Completion' }
        ]
      };

      onSuccess(newTarget);
      toast.success(existingTarget ? 'Target berhasil diperbarui!' : 'Target berhasil dibuat!');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving target:', error);
      toast.error('Gagal menyimpan target');
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTemplate(null);
    setCustomTarget(false);
    setFormData({
      santriId: santriId || '',
      santriName: santriName || '',
      surahId: 0,
      targetType: 'MONTHLY',
      targetAyahs: 0,
      targetDate: '',
      startDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      description: '',
      notes: '',
      reminders: {
        enabled: true,
        frequency: 'WEEKLY' as HafalanTarget['reminders']['frequency']
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Target className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {existingTarget ? 'Edit Target Hafalan' : 'Set Target Hafalan'}
              </h2>
              <p className="text-sm text-gray-600">
                {santriName && `Untuk: ${santriName}`}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && !existingTarget && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Template Target</h3>
                <p className="text-gray-600 mb-6">
                  Pilih template yang sesuai dengan level santri atau buat target kustom
                </p>
              </div>

              {/* Template Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TARGET_TEMPLATES.filter(t => t.isActive).map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-teal-300"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </CardTitle>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                          template.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.difficulty === 'BEGINNER' ? 'Pemula' :
                           template.difficulty === 'INTERMEDIATE' ? 'Menengah' : 'Lanjutan'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{getTargetTypeText(template.targetType)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{template.duration} hari</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{template.recommendedAge}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-gray-400" />
                          <span>~{template.estimatedHours} jam</span>
                        </div>
                      </div>
                      {template.surahIds.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Surah yang akan dipelajari:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.surahIds.slice(0, 3).map(surahId => {
                              const surah = getSurahById(surahId);
                              return surah ? (
                                <span key={surahId} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                                  {surah.name}
                                </span>
                              ) : null;
                            })}
                            {template.surahIds.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{template.surahIds.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Custom Target Option */}
              <div className="pt-6 border-t border-gray-200">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-dashed border-gray-300 hover:border-teal-300"
                  onClick={handleCustomTarget}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Zap className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Target Kustom</h3>
                        <p className="text-sm text-gray-600">
                          Buat target hafalan sesuai kebutuhan spesifik santri
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTemplate ? `Konfigurasi: ${selectedTemplate.name}` : 'Target Kustom'}
                </h3>
                <p className="text-gray-600">
                  Sesuaikan detail target hafalan sesuai kebutuhan
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {!santriId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Santri *
                      </label>
                      <select
                        value={formData.santriId}
                        onChange={(e) => {
                          const selectedSantri = santriList.find(s => s.id === e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            santriId: e.target.value,
                            santriName: selectedSantri ? selectedSantri.name : ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Santri</option>
                        {santriList.map(santri => (
                          <option key={santri.id} value={santri.id}>
                            {santri.name} ({santri.nis})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Surah *
                    </label>
                    <select
                      value={formData.surahId}
                      onChange={(e) => handleSurahChange(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Pilih Surah</option>
                      {QURAN_SURAHS.map(surah => (
                        <option key={surah.id} value={surah.id}>
                          {surah.id}. {surah.name} ({surah.totalAyahs} ayat)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Target
                    </label>
                    <select
                      value={formData.targetType}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as HafalanTarget['targetType'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="DAILY">Harian</option>
                      <option value="WEEKLY">Mingguan</option>
                      <option value="MONTHLY">Bulanan</option>
                      <option value="YEARLY">Tahunan</option>
                      <option value="CUSTOM">Kustom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Ayat
                    </label>
                    <input
                      type="number"
                      value={formData.targetAyahs}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAyahs: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                      max={getSurahById(formData.surahId)?.totalAyahs || 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioritas
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as HafalanTarget['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="LOW">Rendah</option>
                      <option value="MEDIUM">Sedang</option>
                      <option value="HIGH">Tinggi</option>
                      <option value="URGENT">Mendesak</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Selesai *
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min={formData.startDate}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Deskripsi target hafalan..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={2}
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Pengaturan Pengingat</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="reminders-enabled"
                      checked={formData.reminders.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        reminders: { ...prev.reminders, enabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reminders-enabled" className="text-sm text-gray-700">
                      Aktifkan pengingat otomatis
                    </label>
                  </div>
                  {formData.reminders.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frekuensi Pengingat
                      </label>
                      <select
                        value={formData.reminders.frequency}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          reminders: { ...prev.reminders, frequency: e.target.value as any }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="DAILY">Harian</option>
                        <option value="WEEKLY">Mingguan</option>
                        <option value="BEFORE_DEADLINE">Sebelum Deadline</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Summary */}
              {formData.surahId > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-teal-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ringkasan Target
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-teal-700">Surah:</span>
                      <div className="font-medium text-teal-900">{getSurahById(formData.surahId)?.name}</div>
                    </div>
                    <div>
                      <span className="text-teal-700">Estimasi Durasi:</span>
                      <div className="font-medium text-teal-900">~{calculateEstimatedDuration()} jam</div>
                    </div>
                    <div>
                      <span className="text-teal-700">Target Ayat:</span>
                      <div className="font-medium text-teal-900">{formData.targetAyahs} ayat</div>
                    </div>
                    <div>
                      <span className="text-teal-700">Prioritas:</span>
                      <div className="font-medium text-teal-900">{getPriorityText(formData.priority)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {step === 2 && !existingTarget && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Kembali
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            {step === 2 && (
              <Button onClick={handleSubmit}>
                <Target className="h-4 w-4 mr-2" />
                {existingTarget ? 'Update Target' : 'Buat Target'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

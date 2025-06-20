'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Target,
  Plus,
  X,
  Save,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  BookOpen,
  Heart,
  Award,
  Clock,
  User,
  FileText,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  CharacterGoal,
  BehaviorCategory,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  formatBehaviorDate
} from '@/lib/behavior-data';

interface CharacterGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Partial<CharacterGoal>) => void;
  editData?: CharacterGoal | null;
}

export default function CharacterGoalForm({
  isOpen,
  onClose,
  onSave,
  editData
}: CharacterGoalFormProps) {
  const [formData, setFormData] = useState<Partial<CharacterGoal>>({
    santriId: editData?.santriId || '',
    santriName: editData?.santriName || '',
    title: editData?.title || '',
    description: editData?.description || '',
    category: editData?.category || 'AKHLAQ',
    targetBehaviors: editData?.targetBehaviors || [''],
    targetDate: editData?.targetDate || '',
    startDate: editData?.startDate || new Date().toISOString().split('T')[0],
    status: editData?.status || 'ACTIVE',
    progress: editData?.progress || 0,
    milestones: editData?.milestones || [
      {
        id: `milestone_${Date.now()}`,
        title: '',
        description: '',
        targetDate: '',
        isCompleted: false
      }
    ],
    parentInvolved: editData?.parentInvolved || false,
    musyrifNotes: editData?.musyrifNotes || '',
    parentFeedback: editData?.parentFeedback || ''
  });

  // Mock data for santri
  const mockSantri = [
    { id: 'santri_1', name: 'Ahmad Fauzi', nis: 'TPQ001', halaqahId: 'halaqah_1', halaqahName: 'Halaqah Al-Fatihah' },
    { id: 'santri_2', name: 'Siti Aisyah', nis: 'TPQ002', halaqahId: 'halaqah_1', halaqahName: 'Halaqah Al-Fatihah' },
    { id: 'santri_3', name: 'Muhammad Rizki', nis: 'TPQ003', halaqahId: 'halaqah_2', halaqahName: 'Halaqah Al-Baqarah' },
    { id: 'santri_4', name: 'Fatimah Zahra', nis: 'TPQ004', halaqahId: 'halaqah_1', halaqahName: 'Halaqah Al-Fatihah' },
    { id: 'santri_5', name: 'Abdullah Rahman', nis: 'TPQ005', halaqahId: 'halaqah_2', halaqahName: 'Halaqah Al-Baqarah' }
  ];

  const handleSantriChange = (santriId: string) => {
    const santri = mockSantri.find(s => s.id === santriId);
    if (santri) {
      setFormData(prev => ({
        ...prev,
        santriId: santri.id,
        santriName: santri.name
      }));
    }
  };

  const addTargetBehavior = () => {
    setFormData(prev => ({
      ...prev,
      targetBehaviors: [...(prev.targetBehaviors || []), '']
    }));
  };

  const removeTargetBehavior = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetBehaviors: prev.targetBehaviors?.filter((_, i) => i !== index) || []
    }));
  };

  const updateTargetBehavior = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      targetBehaviors: prev.targetBehaviors?.map((behavior, i) => 
        i === index ? value : behavior
      ) || []
    }));
  };

  const addMilestone = () => {
    const newMilestone = {
      id: `milestone_${Date.now()}`,
      title: '',
      description: '',
      targetDate: '',
      isCompleted: false
    };
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMilestone]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.filter((_, i) => i !== index) || []
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      ) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.santriId || !formData.title || !formData.description || !formData.targetDate) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (!formData.targetBehaviors?.some(behavior => behavior.trim())) {
      toast.error('Mohon tambahkan minimal satu target perilaku');
      return;
    }

    if (!formData.milestones?.some(milestone => milestone.title.trim())) {
      toast.error('Mohon tambahkan minimal satu milestone');
      return;
    }

    const goalData: Partial<CharacterGoal> = {
      ...formData,
      targetBehaviors: formData.targetBehaviors?.filter(behavior => behavior.trim()) || [],
      milestones: formData.milestones?.filter(milestone => milestone.title.trim()) || [],
      createdBy: 'current_user_id', // Should be from auth context
      createdAt: editData ? editData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(goalData);
    toast.success(editData ? 'Goal karakter berhasil diperbarui!' : 'Goal karakter berhasil dibuat!');
    onClose();
  };

  const handleReset = () => {
    setFormData({
      santriId: '',
      santriName: '',
      title: '',
      description: '',
      category: 'AKHLAQ',
      targetBehaviors: [''],
      targetDate: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      progress: 0,
      milestones: [
        {
          id: `milestone_${Date.now()}`,
          title: '',
          description: '',
          targetDate: '',
          isCompleted: false
        }
      ],
      parentInvolved: false,
      musyrifNotes: '',
      parentFeedback: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-teal-600" />
                <span>{editData ? 'Edit Goal Karakter' : 'Buat Goal Karakter Baru'}</span>
              </CardTitle>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Santri <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.santriId}
                  onChange={(e) => handleSantriChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Santri</option>
                  {mockSantri.map(santri => (
                    <option key={santri.id} value={santri.id}>
                      {santri.name} ({santri.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as BehaviorCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="AKHLAQ">Akhlaq</option>
                  <option value="IBADAH">Ibadah</option>
                  <option value="ACADEMIC">Akademik</option>
                  <option value="SOCIAL">Sosial</option>
                  <option value="DISCIPLINE">Disiplin</option>
                  <option value="LEADERSHIP">Kepemimpinan</option>
                </select>
              </div>
            </div>

            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Goal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Meningkatkan Kedisiplinan Waktu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Jelaskan secara detail goal yang ingin dicapai..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Target Behaviors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Target Perilaku <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTargetBehavior}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
              <div className="space-y-3">
                {formData.targetBehaviors?.map((behavior, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={behavior}
                      onChange={(e) => updateTargetBehavior(index, e.target.value)}
                      placeholder={`Target perilaku ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {formData.targetBehaviors && formData.targetBehaviors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTargetBehavior(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Milestone <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMilestone}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Milestone
                </Button>
              </div>
              <div className="space-y-4">
                {formData.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Milestone {index + 1}</h4>
                      {formData.milestones && formData.milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Judul</label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder="Judul milestone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Target Tanggal</label>
                        <input
                          type="date"
                          value={milestone.targetDate}
                          onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Deskripsi milestone"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Involvement */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="parentInvolved"
                checked={formData.parentInvolved}
                onChange={(e) => setFormData(prev => ({ ...prev, parentInvolved: e.target.checked }))}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="parentInvolved" className="text-sm font-medium text-gray-700">
                Libatkan orang tua dalam goal ini
              </label>
            </div>

            {/* Musyrif Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Musyrif
              </label>
              <textarea
                value={formData.musyrifNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, musyrifNotes: e.target.value }))}
                placeholder="Catatan dan strategi dari musyrif..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Reset Form
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Batal
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editData ? 'Update Goal' : 'Buat Goal'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

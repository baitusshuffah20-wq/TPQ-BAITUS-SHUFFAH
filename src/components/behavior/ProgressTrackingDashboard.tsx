'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Award,
  Calendar,
  Users,
  BarChart3,
  Eye,
  Edit,
  Plus,
  MessageSquare,
  Bell,
  Camera,
  FileText,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  CharacterGoal,
  BehaviorRecord,
  getBehaviorCategoryColor,
  getBehaviorCategoryText,
  formatBehaviorDate,
  formatBehaviorTime
} from '@/lib/behavior-data';

interface ProgressTrackingDashboardProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProgressTrackingDashboard({
  goalId,
  isOpen,
  onClose
}: ProgressTrackingDashboardProps) {
  const [goal, setGoal] = useState<CharacterGoal | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMilestoneEvidence, setNewMilestoneEvidence] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  // Mock goal data
  const mockGoal: CharacterGoal = {
    id: 'goal_1',
    santriId: 'santri_3',
    santriName: 'Muhammad Rizki',
    title: 'Meningkatkan Kedisiplinan',
    description: 'Program khusus untuk meningkatkan kedisiplinan waktu dan perilaku di kelas',
    category: 'DISCIPLINE',
    targetBehaviors: ['Datang tepat waktu', 'Tidak mengganggu kelas', 'Mengikuti aturan TPQ'],
    targetDate: '2024-03-31',
    startDate: '2024-02-01',
    status: 'ACTIVE',
    progress: 35,
    milestones: [
      {
        id: 'milestone_1',
        title: 'Tidak terlambat selama 1 minggu',
        description: 'Datang tepat waktu setiap hari selama 1 minggu berturut-turut',
        targetDate: '2024-02-07',
        isCompleted: true,
        completedAt: '2024-02-07T08:00:00Z',
        evidence: 'Catatan kehadiran menunjukkan tidak ada keterlambatan'
      },
      {
        id: 'milestone_2',
        title: 'Tidak mengganggu kelas selama 2 minggu',
        description: 'Mengikuti pembelajaran dengan tenang tanpa mengganggu teman',
        targetDate: '2024-02-21',
        isCompleted: false
      },
      {
        id: 'milestone_3',
        title: 'Membantu teman dalam pembelajaran',
        description: 'Aktif membantu teman yang kesulitan belajar',
        targetDate: '2024-03-15',
        isCompleted: false
      }
    ],
    createdBy: 'musyrif_2',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T10:30:00Z',
    parentInvolved: true,
    musyrifNotes: 'Rizki menunjukkan perbaikan dalam kedisiplinan. Perlu konsistensi dan dukungan orang tua.',
    parentFeedback: 'Di rumah juga sudah mulai lebih disiplin. Terima kasih atas bimbingannya.'
  };

  // Mock recent activities
  const mockActivities = [
    {
      id: 'activity_1',
      type: 'MILESTONE_COMPLETED',
      title: 'Milestone Selesai',
      description: 'Milestone "Tidak terlambat selama 1 minggu" berhasil diselesaikan',
      date: '2024-02-07',
      time: '08:00:00',
      actor: 'Ustadz Ahmad',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'activity_2',
      type: 'BEHAVIOR_POSITIVE',
      title: 'Perilaku Positif',
      description: 'Rizki datang tepat waktu dan membantu teman mengatur Al-Quran',
      date: '2024-02-06',
      time: '07:30:00',
      actor: 'Ustadz Ahmad',
      icon: Star,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 'activity_3',
      type: 'PARENT_FEEDBACK',
      title: 'Feedback Orang Tua',
      description: 'Orang tua memberikan feedback positif tentang perkembangan di rumah',
      date: '2024-02-05',
      time: '19:30:00',
      actor: 'Orang Tua Rizki',
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'activity_4',
      type: 'MUSYRIF_NOTE',
      title: 'Catatan Musyrif',
      description: 'Musyrif menambahkan catatan progress dan strategi lanjutan',
      date: '2024-02-04',
      time: '15:45:00',
      actor: 'Ustadzah Fatimah',
      icon: FileText,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'activity_5',
      type: 'GOAL_UPDATED',
      title: 'Goal Diperbarui',
      description: 'Target date milestone kedua disesuaikan berdasarkan progress',
      date: '2024-02-03',
      time: '10:15:00',
      actor: 'Ustadzah Fatimah',
      icon: Edit,
      color: 'text-gray-600 bg-gray-100'
    }
  ];

  useEffect(() => {
    if (isOpen && goalId) {
      loadGoalData();
    }
  }, [isOpen, goalId]);

  const loadGoalData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoal(mockGoal);
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Error loading goal data:', error);
      toast.error('Gagal memuat data goal');
    } finally {
      setLoading(false);
    }
  };

  const completeMilestone = (milestoneId: string, evidence: string) => {
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(milestone =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            isCompleted: true,
            completedAt: new Date().toISOString(),
            evidence
          }
        : milestone
    );

    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    setGoal(prev => prev ? {
      ...prev,
      milestones: updatedMilestones,
      progress: newProgress
    } : null);

    setSelectedMilestone(null);
    setNewMilestoneEvidence('');
    toast.success('Milestone berhasil diselesaikan!');
  };

  const addParentFeedback = (feedback: string) => {
    if (!goal) return;

    setGoal(prev => prev ? {
      ...prev,
      parentFeedback: feedback,
      updatedAt: new Date().toISOString()
    } : null);

    toast.success('Feedback orang tua berhasil ditambahkan!');
  };

  const addMusyrifNote = (note: string) => {
    if (!goal) return;

    setGoal(prev => prev ? {
      ...prev,
      musyrifNotes: note,
      updatedAt: new Date().toISOString()
    } : null);

    toast.success('Catatan musyrif berhasil ditambahkan!');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 60) return 'bg-blue-600';
    if (progress >= 40) return 'bg-yellow-600';
    if (progress >= 20) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-teal-600" />
                <span>Progress Tracking: {goal.title}</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {goal.santriName} • {getBehaviorCategoryText(goal.category)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Progress Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overall Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-teal-600" />
                      <span>Progress Keseluruhan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">Progress Goal</span>
                      <span className="text-2xl font-bold text-teal-600">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {goal.milestones.filter(m => m.isCompleted).length}
                        </div>
                        <div className="text-sm text-gray-600">Milestone Selesai</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {goal.milestones.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Milestone</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {getDaysRemaining(goal.targetDate)}
                        </div>
                        <div className="text-sm text-gray-600">Hari Tersisa</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Milestone Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {goal.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className={`p-4 border rounded-lg ${
                            milestone.isCompleted
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-full ${
                                milestone.isCompleted
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {milestone.isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Target: {formatBehaviorDate(milestone.targetDate)}</span>
                                  {milestone.isCompleted && milestone.completedAt && (
                                    <span className="text-green-600">
                                      Selesai: {formatBehaviorDate(milestone.completedAt.split('T')[0])}
                                    </span>
                                  )}
                                </div>
                                {milestone.evidence && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                    <strong>Bukti:</strong> {milestone.evidence}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!milestone.isCompleted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedMilestone(milestone.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Selesaikan
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Detail
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span>Aktivitas Terbaru</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${activity.color}`}>
                            <activity.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <span>{formatBehaviorDate(activity.date)}</span>
                              <span>•</span>
                              <span>{formatBehaviorTime(activity.time)}</span>
                              <span>•</span>
                              <span>{activity.actor}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Goal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-teal-600" />
                      <span>Info Goal</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Kategori</label>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getBehaviorCategoryColor(goal.category)}`}>
                        {getBehaviorCategoryText(goal.category)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mulai</label>
                      <p className="text-sm text-gray-900">{formatBehaviorDate(goal.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Target Selesai</label>
                      <p className="text-sm text-gray-900">{formatBehaviorDate(goal.targetDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                        {goal.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Target Behaviors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span>Target Perilaku</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {goal.targetBehaviors.map((behavior, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{behavior}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Musyrif Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Catatan Musyrif</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{goal.musyrifNotes}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Catatan
                    </Button>
                  </CardContent>
                </Card>

                {/* Parent Feedback */}
                {goal.parentInvolved && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>Feedback Orang Tua</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{goal.parentFeedback}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Kirim Update
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Milestone Completion Modal */}
        {selectedMilestone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Selesaikan Milestone</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bukti Penyelesaian
                    </label>
                    <textarea
                      value={newMilestoneEvidence}
                      onChange={(e) => setNewMilestoneEvidence(e.target.value)}
                      placeholder="Jelaskan bukti bahwa milestone ini telah diselesaikan..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedMilestone(null);
                        setNewMilestoneEvidence('');
                      }}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={() => completeMilestone(selectedMilestone, newMilestoneEvidence)}
                      disabled={!newMilestoneEvidence.trim()}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selesaikan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

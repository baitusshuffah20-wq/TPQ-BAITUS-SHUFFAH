'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  Edit,
  Trash2,
  Download,
  GraduationCap,
  Briefcase,
  FileText,
  ExternalLink
} from 'lucide-react';

interface MusyrifDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  musyrif: any;
}

const MusyrifDetailModal: React.FC<MusyrifDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  musyrif
}) => {
  if (!isOpen || !musyrif) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Tidak Aktif';
      case 'ON_LEAVE': return 'Cuti';
      default: return status;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Musyrif</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                  {musyrif.photo ? (
                    <img src={musyrif.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-teal-600">
                      {musyrif.name?.charAt(0) || 'M'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{musyrif.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(musyrif.status)}`}>
                      {getStatusText(musyrif.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {musyrif.specialization || 'Umum'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {musyrif.birthDate ? `${calculateAge(musyrif.birthDate)} tahun` : '-'}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {musyrif.halaqah?.name || 'Belum ada halaqah'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Bergabung: {formatDate(musyrif.joinDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nama Lengkap
                    </label>
                    <p className="text-gray-900">{musyrif.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Jenis Kelamin
                    </label>
                    <p className="text-gray-900">{musyrif.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Tempat, Tanggal Lahir
                    </label>
                    <p className="text-gray-900">
                      {musyrif.birthPlace && musyrif.birthDate 
                        ? `${musyrif.birthPlace}, ${formatDate(musyrif.birthDate)}`
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nomor Telepon
                    </label>
                    <p className="text-gray-900">{musyrif.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{musyrif.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(musyrif.status)}`}>
                      {getStatusText(musyrif.status)}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Alamat
                    </label>
                    <p className="text-gray-900">{musyrif.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Informasi Akademik
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Spesialisasi
                    </label>
                    <p className="text-gray-900">{musyrif.specialization || 'Umum'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Halaqah
                    </label>
                    <p className="text-gray-900">{musyrif.halaqah?.name || 'Belum ada halaqah'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Tanggal Bergabung
                    </label>
                    <p className="text-gray-900">{formatDate(musyrif.joinDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Akun Terhubung
                    </label>
                    <p className="text-gray-900">
                      {musyrif.userId ? (
                        <span className="inline-flex items-center">
                          <Users className="h-4 w-4 mr-1 text-teal-600" />
                          ID: {musyrif.userId}
                        </span>
                      ) : 'Belum ada akun terhubung'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Education */}
              {musyrif.education && musyrif.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Riwayat Pendidikan
                  </h3>
                  <div className="space-y-4">
                    {musyrif.education.map((edu: any, index: number) => (
                      <div key={edu.id || index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <div className="font-medium text-gray-900">{edu.institution}</div>
                          <div className="text-gray-600">{edu.year}</div>
                        </div>
                        <div className="text-gray-700 mt-1">{edu.degree}</div>
                        {edu.description && (
                          <div className="text-gray-600 text-sm mt-2">{edu.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {musyrif.experience && musyrif.experience.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Pengalaman Kerja
                  </h3>
                  <div className="space-y-4">
                    {musyrif.experience.map((exp: any, index: number) => (
                      <div key={exp.id || index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <div className="font-medium text-gray-900">{exp.position}</div>
                          <div className="text-gray-600">
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Sekarang'}
                          </div>
                        </div>
                        <div className="text-gray-700 mt-1">{exp.organization}</div>
                        {exp.description && (
                          <div className="text-gray-600 text-sm mt-2">{exp.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {musyrif.certificates && musyrif.certificates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Sertifikat & Dokumen
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {musyrif.certificates.map((cert: any, index: number) => (
                      <div key={cert.id || index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <div className="font-medium text-gray-900">{cert.name}</div>
                          <div className="text-gray-600">{formatDate(cert.issueDate)}</div>
                        </div>
                        <div className="text-gray-700 mt-1">{cert.issuer}</div>
                        {cert.description && (
                          <div className="text-gray-600 text-sm mt-2">{cert.description}</div>
                        )}
                        {cert.documentUrl && (
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-3 text-sm text-teal-600 hover:text-teal-800"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Lihat Dokumen
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={onDelete}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Musyrif
                </Button>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>
                  <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Data
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MusyrifDetailModal;
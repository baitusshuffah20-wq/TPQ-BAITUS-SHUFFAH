import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, NotificationType, NotificationChannel } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

// POST /api/notifications/setup - Create default notification templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { createdBy } = body;

    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: 'createdBy is required' },
        { status: 400 }
      );
    }

    const defaultTemplates = [
      {
        name: 'spp_payment_reminder',
        title: 'Pengingat Pembayaran SPP',
        message: 'Assalamu\'alaikum {waliName},\n\nKami mengingatkan bahwa pembayaran SPP untuk {santriName} bulan {month} {year} sebesar {amount} akan jatuh tempo pada {dueDate}.\n\nMohon untuk segera melakukan pembayaran. Terima kasih.\n\nBarakallahu fiikum.',
        type: NotificationType.PAYMENT_REMINDER,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
        variables: {
          waliName: 'Nama Wali',
          santriName: 'Nama Santri',
          month: 'Bulan',
          year: 'Tahun',
          amount: 'Jumlah SPP',
          dueDate: 'Tanggal Jatuh Tempo'
        }
      },
      {
        name: 'spp_payment_confirmation',
        title: 'Konfirmasi Pembayaran SPP',
        message: 'Assalamu\'alaikum {waliName},\n\nTerima kasih atas pembayaran SPP {santriName} bulan {month} {year} sebesar {amount}.\n\nNomor Kwitansi: {receiptNumber}\nTanggal Pembayaran: {paymentDate}\n\nBarakallahu fiikum.',
        type: NotificationType.PAYMENT_CONFIRMATION,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
        variables: {
          waliName: 'Nama Wali',
          santriName: 'Nama Santri',
          month: 'Bulan',
          year: 'Tahun',
          amount: 'Jumlah Pembayaran',
          receiptNumber: 'Nomor Kwitansi',
          paymentDate: 'Tanggal Pembayaran'
        }
      },
      {
        name: 'spp_overdue_alert',
        title: 'Peringatan SPP Terlambat',
        message: 'Assalamu\'alaikum {waliName},\n\nKami informasikan bahwa pembayaran SPP {santriName} bulan {month} {year} sebesar {amount} telah melewati batas waktu pembayaran.\n\nMohon segera melakukan pembayaran untuk menghindari denda keterlambatan.\n\nBarakallahu fiikum.',
        type: NotificationType.SPP_OVERDUE,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
        variables: {
          waliName: 'Nama Wali',
          santriName: 'Nama Santri',
          month: 'Bulan',
          year: 'Tahun',
          amount: 'Jumlah SPP'
        }
      },
      {
        name: 'attendance_alert',
        title: 'Pemberitahuan Absensi',
        message: 'Assalamu\'alaikum {waliName},\n\n{santriName} {status} pada kegiatan {activity} hari {date}.\n\nCatatan: {notes}\n\nBarakallahu fiikum.',
        type: NotificationType.ATTENDANCE_ALERT,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
        variables: {
          waliName: 'Nama Wali',
          santriName: 'Nama Santri',
          status: 'Status Kehadiran',
          activity: 'Nama Kegiatan',
          date: 'Tanggal',
          notes: 'Catatan'
        }
      },
      {
        name: 'hafalan_progress',
        title: 'Update Progress Hafalan',
        message: 'Assalamu\'alaikum {waliName},\n\n{santriName} telah menyelesaikan hafalan {surahName} ayat {ayahStart}-{ayahEnd} dengan nilai {grade}.\n\nJenis: {type}\nCatatan Musyrif: {notes}\n\nBarakallahu fiikum.',
        type: NotificationType.HAFALAN_PROGRESS,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
        variables: {
          waliName: 'Nama Wali',
          santriName: 'Nama Santri',
          surahName: 'Nama Surah',
          ayahStart: 'Ayat Mulai',
          ayahEnd: 'Ayat Selesai',
          grade: 'Nilai',
          type: 'Jenis Hafalan',
          notes: 'Catatan'
        }
      },
      {
        name: 'system_announcement',
        title: 'Pengumuman Sistem',
        message: 'Assalamu\'alaikum,\n\n{title}\n\n{content}\n\nBarakallahu fiikum.',
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
        variables: {
          title: 'Judul Pengumuman',
          content: 'Isi Pengumuman'
        }
      },
      {
        name: 'account_update',
        title: 'Update Akun',
        message: 'Assalamu\'alaikum {userName},\n\nAkun Anda telah diperbarui.\n\nPerubahan: {changes}\nWaktu: {timestamp}\n\nJika Anda tidak melakukan perubahan ini, mohon segera hubungi administrator.\n\nBarakallahu fiikum.',
        type: NotificationType.ACCOUNT_UPDATE,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        variables: {
          userName: 'Nama Pengguna',
          changes: 'Daftar Perubahan',
          timestamp: 'Waktu Perubahan'
        }
      },
      {
        name: 'report_ready',
        title: 'Laporan Siap',
        message: 'Assalamu\'alaikum,\n\nLaporan {reportType} untuk periode {period} telah siap dan dapat diunduh.\n\nSilakan akses melalui dashboard untuk melihat laporan.\n\nBarakallahu fiikum.',
        type: NotificationType.REPORT_READY,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        variables: {
          reportType: 'Jenis Laporan',
          period: 'Periode Laporan'
        }
      },
      {
        name: 'maintenance_notice',
        title: 'Pemberitahuan Maintenance',
        message: 'Assalamu\'alaikum,\n\nSistem akan menjalani maintenance pada {maintenanceDate} pukul {maintenanceTime}.\n\nEstimasi durasi: {duration}\n\nMohon maaf atas ketidaknyamanan yang mungkin terjadi.\n\nBarakallahu fiikum.',
        type: NotificationType.MAINTENANCE_NOTICE,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
        variables: {
          maintenanceDate: 'Tanggal Maintenance',
          maintenanceTime: 'Waktu Maintenance',
          duration: 'Durasi Maintenance'
        }
      },
      {
        name: 'emergency_alert',
        title: 'Peringatan Darurat',
        message: 'PERINGATAN DARURAT\n\n{alertMessage}\n\nMohon segera mengikuti instruksi yang diberikan.\n\nTetap tenang dan ikuti prosedur keamanan.',
        type: NotificationType.EMERGENCY_ALERT,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP, NotificationChannel.SMS],
        variables: {
          alertMessage: 'Pesan Peringatan'
        }
      }
    ];

    const createdTemplates = [];
    const errors = [];

    for (const template of defaultTemplates) {
      try {
        // Check if template already exists
        const existing = await prisma.notificationTemplate.findUnique({
          where: { name: template.name }
        });

        if (existing) {
          console.log(`Template ${template.name} already exists, skipping...`);
          continue;
        }

        const created = await NotificationService.createTemplate({
          ...template,
          createdBy
        });

        createdTemplates.push(created);
      } catch (error) {
        console.error(`Error creating template ${template.name}:`, error);
        errors.push({
          templateName: template.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdTemplates.length} notification templates`,
      results: {
        created: createdTemplates.length,
        skipped: defaultTemplates.length - createdTemplates.length - errors.length,
        errors: errors.length,
        templates: createdTemplates,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error setting up notification templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to setup notification templates' },
      { status: 500 }
    );
  }
}

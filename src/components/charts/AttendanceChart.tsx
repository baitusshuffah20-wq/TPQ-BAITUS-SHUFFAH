'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AttendanceChartProps {
  type: 'bar' | 'line' | 'doughnut';
  data: any;
  title?: string;
  height?: number;
}

export default function AttendanceChart({ type, data, title, height = 300 }: AttendanceChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (type === 'doughnut') {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed * 100) / total).toFixed(1);
              return `${context.label}: ${context.parsed} santri (${percentage}%)`;
            }
            return `${context.dataset.label}: ${context.parsed.y || context.parsed} santri`;
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return value + ' santri';
          }
        }
      }
    } : undefined,
  };

  const chartStyle = {
    height: `${height}px`,
  };

  switch (type) {
    case 'bar':
      return (
        <div style={chartStyle}>
          <Bar data={data} options={options} />
        </div>
      );
    case 'line':
      return (
        <div style={chartStyle}>
          <Line data={data} options={options} />
        </div>
      );
    case 'doughnut':
      return (
        <div style={chartStyle}>
          <Doughnut data={data} options={options} />
        </div>
      );
    default:
      return null;
  }
}

// Weekly Attendance Data Generator
export const generateWeeklyAttendanceData = (attendances: any[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const presentData = last7Days.map(date => {
    return attendances.filter(attendance => {
      const attendanceDate = new Date(attendance.date);
      return attendanceDate.toDateString() === date.toDateString() && attendance.status === 'PRESENT';
    }).length;
  });

  const absentData = last7Days.map(date => {
    return attendances.filter(attendance => {
      const attendanceDate = new Date(attendance.date);
      return attendanceDate.toDateString() === date.toDateString() && attendance.status === 'ABSENT';
    }).length;
  });

  const lateData = last7Days.map(date => {
    return attendances.filter(attendance => {
      const attendanceDate = new Date(attendance.date);
      return attendanceDate.toDateString() === date.toDateString() && attendance.status === 'LATE';
    }).length;
  });

  return {
    labels: last7Days.map(date => date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Hadir',
        data: presentData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Terlambat',
        data: lateData,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Tidak Hadir',
        data: absentData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };
};

// Monthly Attendance Trend Data Generator
export const generateMonthlyAttendanceTrend = (attendances: any[]) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const attendanceRates = months.map(month => {
    const monthAttendances = attendances.filter(attendance => {
      const attendanceMonth = new Date(attendance.date).toLocaleDateString('en-US', { month: 'short' });
      return attendanceMonth === month;
    });

    if (monthAttendances.length === 0) return 0;

    const presentCount = monthAttendances.filter(a => a.status === 'PRESENT').length;
    return (presentCount / monthAttendances.length) * 100;
  });

  return {
    labels: months,
    datasets: [
      {
        label: 'Tingkat Kehadiran (%)',
        data: attendanceRates,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };
};

// Attendance Status Distribution Data Generator
export const generateAttendanceStatusData = (attendances: any[]) => {
  const statusCounts = attendances.reduce((acc, attendance) => {
    acc[attendance.status] = (acc[attendance.status] || 0) + 1;
    return acc;
  }, {});

  const statusLabels = {
    'PRESENT': 'Hadir',
    'ABSENT': 'Tidak Hadir',
    'LATE': 'Terlambat',
    'SICK': 'Sakit',
    'PERMISSION': 'Izin'
  };

  const statusColors = {
    'PRESENT': '#10b981',
    'LATE': '#f59e0b',
    'ABSENT': '#ef4444',
    'SICK': '#8b5cf6',
    'PERMISSION': '#3b82f6'
  };

  return {
    labels: Object.keys(statusCounts).map(status => statusLabels[status as keyof typeof statusLabels] || status),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(status => statusColors[status as keyof typeof statusColors] || '#6b7280'),
        borderColor: '#ffffff',
        borderWidth: 2,
      }
    ]
  };
};

// Class Attendance Comparison Data Generator
export const generateClassAttendanceData = (attendances: any[], halaqahs: any[]) => {
  const classData = halaqahs.map(halaqah => {
    const classAttendances = attendances.filter(attendance => attendance.halaqahId === halaqah.id);
    const presentCount = classAttendances.filter(a => a.status === 'PRESENT').length;
    const totalCount = classAttendances.length;
    
    return {
      name: halaqah.name,
      rate: totalCount > 0 ? (presentCount / totalCount) * 100 : 0,
      present: presentCount,
      total: totalCount
    };
  });

  return {
    labels: classData.map(data => data.name),
    datasets: [
      {
        label: 'Tingkat Kehadiran (%)',
        data: classData.map(data => data.rate),
        backgroundColor: [
          'rgba(13, 148, 136, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(13, 148, 136, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };
};

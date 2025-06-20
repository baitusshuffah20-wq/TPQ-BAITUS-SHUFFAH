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

interface PaymentChartProps {
  type: 'bar' | 'line' | 'doughnut';
  data: any;
  title?: string;
  height?: number;
}

export default function PaymentChart({ type, data, title, height = 300 }: PaymentChartProps) {
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
        borderColor: '#0d9488',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (type === 'doughnut') {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed * 100) / total).toFixed(1);
              return `${context.label}: Rp ${context.parsed.toLocaleString('id-ID')} (${percentage}%)`;
            }
            return `${context.dataset.label}: Rp ${context.parsed.y?.toLocaleString('id-ID') || context.parsed.toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'Rp ' + value.toLocaleString('id-ID');
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

// Payment Revenue Chart Data Generator
export const generatePaymentRevenueData = (payments: any[]) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyData = months.map(month => {
    const monthPayments = payments.filter(payment => {
      const paymentMonth = new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short' });
      return paymentMonth === month && payment.status === 'PAID';
    });
    return monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  });

  return {
    labels: months,
    datasets: [
      {
        label: 'Pendapatan Bulanan',
        data: monthlyData,
        backgroundColor: 'rgba(13, 148, 136, 0.8)',
        borderColor: 'rgba(13, 148, 136, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };
};

// Payment Status Chart Data Generator
export const generatePaymentStatusData = (payments: any[]) => {
  const statusCounts = payments.reduce((acc, payment) => {
    acc[payment.status] = (acc[payment.status] || 0) + payment.amount;
    return acc;
  }, {});

  const statusLabels = {
    'PAID': 'Lunas',
    'PENDING': 'Menunggu',
    'OVERDUE': 'Terlambat'
  };

  const statusColors = {
    'PAID': '#10b981',
    'PENDING': '#f59e0b',
    'OVERDUE': '#ef4444'
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

// Payment Type Chart Data Generator
export const generatePaymentTypeData = (payments: any[]) => {
  const typeCounts = payments.reduce((acc, payment) => {
    acc[payment.paymentType] = (acc[payment.paymentType] || 0) + payment.amount;
    return acc;
  }, {});

  const typeLabels = {
    'SPP': 'SPP Bulanan',
    'DAFTAR_ULANG': 'Daftar Ulang',
    'SERAGAM': 'Seragam',
    'KEGIATAN': 'Kegiatan Khusus',
    'LAINNYA': 'Lainnya'
  };

  const typeColors = [
    '#0d9488',
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444'
  ];

  return {
    labels: Object.keys(typeCounts).map(type => typeLabels[type as keyof typeof typeLabels] || type),
    datasets: [
      {
        label: 'Pendapatan per Jenis',
        data: Object.values(typeCounts),
        backgroundColor: typeColors.slice(0, Object.keys(typeCounts).length),
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };
};

// Weekly Payment Trend Data Generator
export const generateWeeklyTrendData = (payments: any[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyData = last7Days.map(date => {
    const dayPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.toDateString() === date.toDateString() && payment.status === 'PAID';
    });
    return dayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  });

  return {
    labels: last7Days.map(date => date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Pendapatan Harian',
        data: dailyData,
        borderColor: 'rgba(13, 148, 136, 1)',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(13, 148, 136, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };
};

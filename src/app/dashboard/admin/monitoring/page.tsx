'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SystemMonitoring from '@/components/monitoring/SystemMonitoring';

export default function MonitoringPage() {
  return (
    <DashboardLayout>
      <SystemMonitoring />
    </DashboardLayout>
  );
}

'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AIInsightsDashboard from '@/components/insights/AIInsightsDashboard';

export default function InsightsPage() {
  return (
    <DashboardLayout>
      <AIInsightsDashboard />
    </DashboardLayout>
  );
}

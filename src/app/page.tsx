'use client';

import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import ProgramsSection from '@/components/sections/ProgramsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import NewsSection from '@/components/sections/NewsSection';
import DonationSection from '@/components/sections/DonationSection';

export default function Home() {
  return (
    <PublicLayout>
      <div className="bg-white">
        <HeroSection />
        <StatsSection />
        <ProgramsSection />
        <TestimonialsSection />
        <NewsSection />
        <DonationSection />
      </div>
    </PublicLayout>
  );
}
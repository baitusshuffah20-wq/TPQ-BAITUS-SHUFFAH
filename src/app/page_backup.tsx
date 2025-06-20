import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import ProgramsSection from '@/components/sections/ProgramsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import NewsSection from '@/components/sections/NewsSection';
import DonationSection from '@/components/sections/DonationSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <HeroSection />
        <StatsSection />
        <ProgramsSection />
        <TestimonialsSection />
        <NewsSection />
        <DonationSection />
      </main>

      <Footer />
    </div>
  );
}

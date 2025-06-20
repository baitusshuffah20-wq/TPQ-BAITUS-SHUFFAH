'use client';

import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <PublicNavbar />
      
      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;

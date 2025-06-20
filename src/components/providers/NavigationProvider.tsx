'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PageLoading } from '@/components/ui/LoadingSpinner';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

export default function NavigationProvider({ children }: NavigationProviderProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Auto-hide loading after timeout (fallback)
  useEffect(() => {
    if (isNavigating) {
      const timeout = setTimeout(() => {
        setIsNavigating(false);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isNavigating]);

  return (
    <NavigationContext.Provider value={{ isNavigating, setIsNavigating }}>
      {isNavigating && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
          <PageLoading text="Memuat halaman..." />
        </div>
      )}
      {children}
    </NavigationContext.Provider>
  );
}

// Custom Link component with loading state
interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
  const { setIsNavigating } = useNavigation();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    
    if (onClick) {
      onClick();
    }
    
    // Small delay to show loading state
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${className} cursor-pointer hover:cursor-pointer`}
    >
      {children}
    </a>
  );
}

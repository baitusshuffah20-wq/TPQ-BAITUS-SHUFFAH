'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      console.log('AuthWrapper: User is not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      console.log('AuthWrapper: User is not admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    console.log('AuthWrapper: User is authorized', session?.user);
    setIsAuthorized(true);
    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading || !isAuthorized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memverifikasi akses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
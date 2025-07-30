'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, hasAnyPermission, Permission } from '@/lib/permissions';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: ReactNode;
  role?: string; // Optional: check specific role instead of session role
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  role
}: PermissionGuardProps) {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return <>{fallback}</>;
  }

  const userRole = role || session.user.role;

  // Single permission check
  if (permission) {
    if (!hasPermission(userRole, permission)) {
      return <>{fallback}</>;
    }
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? permissions.every(p => hasPermission(userRole, p))
      : hasAnyPermission(userRole, permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Specific guards for common use cases
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'ADMIN') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function MusyrifOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'MUSYRIF' && session?.user?.role !== 'ADMIN') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function NotMusyrif({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { data: session } = useSession();
  
  if (session?.user?.role === 'MUSYRIF') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Hook for checking permissions in components
export function usePermissions() {
  const { data: session } = useSession();
  
  const checkPermission = (permission: Permission): boolean => {
    if (!session?.user?.role) return false;
    return hasPermission(session.user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!session?.user?.role) return false;
    return hasAnyPermission(session.user.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!session?.user?.role) return false;
    return permissions.every(p => hasPermission(session.user.role, p));
  };

  const isAdmin = (): boolean => {
    return session?.user?.role === 'ADMIN';
  };

  const isMusyrif = (): boolean => {
    return session?.user?.role === 'MUSYRIF';
  };

  const isSantri = (): boolean => {
    return session?.user?.role === 'SANTRI';
  };

  const isWali = (): boolean => {
    return session?.user?.role === 'WALI';
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isAdmin,
    isMusyrif,
    isSantri,
    isWali,
    userRole: session?.user?.role,
    userId: session?.user?.id
  };
}

// Component to show different content based on role
interface RoleBasedContentProps {
  admin?: ReactNode;
  musyrif?: ReactNode;
  santri?: ReactNode;
  wali?: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedContent({
  admin,
  musyrif,
  santri,
  wali,
  fallback = null
}: RoleBasedContentProps) {
  const { data: session } = useSession();
  
  if (!session?.user?.role) {
    return <>{fallback}</>;
  }

  switch (session.user.role) {
    case 'ADMIN':
      return <>{admin || fallback}</>;
    case 'MUSYRIF':
      return <>{musyrif || fallback}</>;
    case 'SANTRI':
      return <>{santri || fallback}</>;
    case 'WALI':
      return <>{wali || fallback}</>;
    default:
      return <>{fallback}</>;
  }
}

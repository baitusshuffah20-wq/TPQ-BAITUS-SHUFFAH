// Permission system for different user roles
export type Permission = 
  // Halaqah permissions
  | 'halaqah:view'
  | 'halaqah:create'
  | 'halaqah:edit'
  | 'halaqah:delete'
  | 'halaqah:view_all'
  
  // Santri permissions
  | 'santri:view'
  | 'santri:create'
  | 'santri:edit'
  | 'santri:delete'
  | 'santri:view_all'
  
  // Attendance permissions
  | 'attendance:view'
  | 'attendance:create'
  | 'attendance:edit'
  | 'attendance:delete'
  | 'attendance:scan_qr'
  
  // Musyrif permissions
  | 'musyrif:view'
  | 'musyrif:create'
  | 'musyrif:edit'
  | 'musyrif:delete'
  | 'musyrif:view_all'
  
  // Financial permissions
  | 'finance:view'
  | 'finance:create'
  | 'finance:edit'
  | 'finance:delete'
  | 'finance:reports'
  
  // Donation permissions
  | 'donation:view'
  | 'donation:create'
  | 'donation:edit'
  | 'donation:delete'
  | 'donation:manage'
  | 'donation:contribute' // Only for making donations
  
  // System permissions
  | 'system:settings'
  | 'system:integration'
  | 'system:backup'
  | 'system:logs'
  
  // User management permissions
  | 'user:view'
  | 'user:create'
  | 'user:edit'
  | 'user:delete'
  
  // Reports permissions
  | 'reports:view'
  | 'reports:create'
  | 'reports:export';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    // Full access to everything
    'halaqah:view', 'halaqah:create', 'halaqah:edit', 'halaqah:delete', 'halaqah:view_all',
    'santri:view', 'santri:create', 'santri:edit', 'santri:delete', 'santri:view_all',
    'attendance:view', 'attendance:create', 'attendance:edit', 'attendance:delete', 'attendance:scan_qr',
    'musyrif:view', 'musyrif:create', 'musyrif:edit', 'musyrif:delete', 'musyrif:view_all',
    'finance:view', 'finance:create', 'finance:edit', 'finance:delete', 'finance:reports',
    'donation:view', 'donation:create', 'donation:edit', 'donation:delete', 'donation:manage', 'donation:contribute',
    'system:settings', 'system:integration', 'system:backup', 'system:logs',
    'user:view', 'user:create', 'user:edit', 'user:delete',
    'reports:view', 'reports:create', 'reports:export'
  ],
  
  MUSYRIF: [
    // Halaqah - only view assigned halaqah (not all halaqah)
    'halaqah:view',

    // Santri - can ONLY view santri in their halaqah (NO CREATE/EDIT)
    'santri:view',
    // 'santri:create' - REMOVED: Cannot add new santri
    // 'santri:edit' - REMOVED: Cannot edit santri data

    // Hafalan - can give grades/scores to santri in their halaqah
    'hafalan:view', 'hafalan:create', 'hafalan:edit',

    // Attendance - can manage attendance for their santri and scan QR for themselves
    'attendance:view', 'attendance:create', 'attendance:edit', 'attendance:scan_qr',

    // Musyrif - can only view their own profile
    'musyrif:view',

    // Donation - can only contribute/make donations
    'donation:contribute',

    // Reports - can view reports related to their halaqah
    'reports:view'
  ],
  
  SANTRI: [
    // Very limited access - mainly for viewing their own data
    'attendance:view',
    'reports:view'
  ],
  
  WALI: [
    // Can view their child's data
    'santri:view',
    'attendance:view',
    'donation:contribute',
    'reports:view'
  ]
};

// Helper function to check if user has permission
export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Helper function to check multiple permissions (AND logic)
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Helper function to check if user has any of the permissions (OR logic)
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Helper function to get all permissions for a role
export function getRolePermissions(userRole: string): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

// Permission checker for API routes
export function checkApiPermission(userRole: string, permission: Permission) {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}

// Musyrif-specific permission helpers
export const MusyrifPermissions = {
  // Check if musyrif can view specific halaqah
  canViewHalaqah: (musyrifId: string, halaqahMusyrifId: string): boolean => {
    return musyrifId === halaqahMusyrifId;
  },
  
  // Check if musyrif can manage specific santri
  canManageSantri: (musyrifId: string, santriHalaqahMusyrifId: string): boolean => {
    return musyrifId === santriHalaqahMusyrifId;
  },
  
  // Check if musyrif can view attendance for specific santri
  canViewAttendance: (musyrifId: string, santriHalaqahMusyrifId: string): boolean => {
    return musyrifId === santriHalaqahMusyrifId;
  }
};

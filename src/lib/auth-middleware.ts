import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, Permission, checkApiPermission } from "@/lib/permissions";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Middleware to check authentication
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}

// Middleware to check both authentication and permission
export async function requirePermission(
  request: NextRequest, 
  permission: Permission
): Promise<AuthenticatedUser | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  try {
    checkApiPermission(authResult.role, permission);
    return authResult;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Access denied" },
      { status: 403 }
    );
  }
}

// Middleware specifically for musyrif routes
export async function requireMusyrifAuth(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Allow admin to access musyrif routes for management purposes
  if (authResult.role !== 'MUSYRIF' && authResult.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: "Musyrif access required" },
      { status: 403 }
    );
  }

  return authResult;
}

// Helper to check if user can access specific resource
export function canAccessResource(
  userRole: string,
  userId: string,
  resourceOwnerId: string,
  permission: Permission
): boolean {
  // Admin can access everything
  if (userRole === 'ADMIN') {
    return true;
  }

  // Check if user has the required permission
  if (!hasPermission(userRole, permission)) {
    return false;
  }

  // For non-admin users, they can only access their own resources
  return userId === resourceOwnerId;
}

// Musyrif-specific access control
export const MusyrifAccess = {
  // Check if musyrif can access halaqah data
  canAccessHalaqah: (musyrifId: string, halaqahMusyrifId: string): boolean => {
    return musyrifId === halaqahMusyrifId;
  },

  // Check if musyrif can access santri data
  canAccessSantri: (musyrifId: string, santriHalaqahMusyrifId: string): boolean => {
    return musyrifId === santriHalaqahMusyrifId;
  },

  // Check if musyrif can access attendance data
  canAccessAttendance: (musyrifId: string, attendanceMusyrifId: string): boolean => {
    return musyrifId === attendanceMusyrifId;
  }
};

// Response helpers
export const ApiResponse = {
  success: (data: any, message?: string) => {
    return NextResponse.json({
      success: true,
      message: message || "Operation successful",
      data
    });
  },

  error: (message: string, status: number = 400, details?: any) => {
    return NextResponse.json({
      success: false,
      message,
      ...(details && { details })
    }, { status });
  },

  unauthorized: (message: string = "Authentication required") => {
    return NextResponse.json({
      success: false,
      message
    }, { status: 401 });
  },

  forbidden: (message: string = "Access denied") => {
    return NextResponse.json({
      success: false,
      message
    }, { status: 403 });
  },

  notFound: (message: string = "Resource not found") => {
    return NextResponse.json({
      success: false,
      message
    }, { status: 404 });
  }
};

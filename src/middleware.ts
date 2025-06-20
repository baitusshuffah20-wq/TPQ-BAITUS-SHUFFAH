import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/login' || 
    path === '/register' || 
    path === '/' || 
    path.startsWith('/api/public') ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/api/settings') ||
    path.startsWith('/uploads') ||
    path === '/maintenance';
  
  // Check if path is for admin dashboard
  const isAdminPath = path.startsWith('/dashboard/admin');
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  try {
    // Check if maintenance mode is enabled
    const maintenanceSetting = await prisma.siteSetting.findUnique({
      where: {
        key: 'site.maintenanceMode'
      }
    });
    
    const isMaintenanceMode = maintenanceSetting?.value === 'true';
    
    // If maintenance mode is enabled and not an admin path and not a public path
    if (isMaintenanceMode && !isAdminPath && !isPublicPath) {
      // If user is not an admin, redirect to maintenance page
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.rewrite(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    console.error('Middleware maintenance check error:', error);
    // Continue with normal flow if there's an error checking maintenance mode
  }
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // If user is not logged in and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If user is logged in but trying to access admin path without admin role, redirect to dashboard
  if (token && isAdminPath && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access for all other cases
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (static font files)
     * 4. /images/* (static image files)
     * 5. /favicon.ico, /site.webmanifest (browser config files)
     */
    '/((?!api/auth|_next|fonts|images|favicon.ico|site.webmanifest).*)',
  ],
};
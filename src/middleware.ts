import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
// Removed Prisma import as it can't be used in middleware

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicPaths = [
    "/login",
    "/register",
    "/",
    "/about",
    "/contact",
    "/donate",
    "/news",
    "/programs",
    "/faq",
    "/privacy-policy",
    "/terms-and-condition",
    "/volunteer",
    "/volunteer-application",
    "/volunteer-success",
    "/volunteer-thank-you",
    "/volunteer-faq",
    "/volunteer-login",
    "/volunteer-register",
    "/maintenance",
  ];

  const publicPrefixes = [
    "/api/public",
    "/api/donations/categories/db",
    "/api/news",
    "/api/stats/homepage",
    "/api/programs",
    "/api/testimonials",
    "/_next",
    "/static",
    "/api/settings",
    "/api/theme",
    "/api/error-logger",
    "/api/halaqah",
    "/api/santri",
    "/api/attendance",
    "/api/hafalan",
    "/api/behavior",
    "/api/achievements",
    "/api/test",
    "/api/health",
    "/api/notifications", // Added for testing
    "/uploads",
  ];

  const isPublicPath =
    publicPaths.includes(path) ||
    publicPrefixes.some((prefix) => path.startsWith(prefix));

  // Check if path is for admin dashboard
  const isAdminPath = path.startsWith("/dashboard/admin");

  // Check if path is for musyrif dashboard
  const isMusyrifPath = path.startsWith("/dashboard/musyrif");

  // Check if path is for wali dashboard
  const isWaliPath = path.startsWith("/dashboard/wali");

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Debug logging for login issues
  if (path.startsWith("/login") || path.startsWith("/dashboard")) {
    console.log("🔍 Middleware Debug:", {
      path,
      hasToken: !!token,
      userRole: token?.role,
      userEmail: token?.email,
      isPublicPath,
      isAdminPath,
      isMusyrifPath,
      isWaliPath,
      timestamp: new Date().toISOString()
    });
  }

  // Maintenance mode check is now handled by a cookie or header instead of database
  // This avoids using Prisma in middleware which is not supported in Edge Runtime
  const maintenanceModeHeader = request.headers.get("x-maintenance-mode");
  const maintenanceModeCookie = request.cookies.get("maintenance_mode")?.value;

  const isMaintenanceMode =
    maintenanceModeHeader === "true" || maintenanceModeCookie === "true";

  // If maintenance mode is enabled and not an admin path and not a public path
  if (isMaintenanceMode && !isAdminPath && !isPublicPath) {
    // If user is not an admin, redirect to maintenance page
    if (!token || token.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  }

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    // Avoid redirect loop - don't redirect if already on login page
    if (path === "/login") {
      return NextResponse.next();
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    console.log("🔄 Redirecting to login:", { from: path, to: url.toString() });
    return NextResponse.redirect(url);
  }

  // If user is logged in but trying to access admin path without admin role, redirect to dashboard
  if (token && isAdminPath && token.role !== "ADMIN") {
    console.log("🚫 Access denied to admin path:", { path, userRole: token.role });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is logged in but trying to access musyrif path without musyrif role, redirect to dashboard
  if (token && isMusyrifPath && token.role !== "MUSYRIF") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Additional check for musyrif trying to access payment or settings
  if (token && token.role === "MUSYRIF") {
    if (
      path.startsWith("/dashboard/admin/payment") ||
      path.startsWith("/dashboard/admin/settings")
    ) {
      return NextResponse.redirect(new URL("/dashboard/musyrif", request.url));
    }
  }

  // If user is logged in but trying to access wali path without wali role, redirect to dashboard
  if (token && isWaliPath && token.role !== "WALI") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
    "/((?!api/auth|_next|fonts|images|favicon.ico|site.webmanifest).*)",
  ],
};

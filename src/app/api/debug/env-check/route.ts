import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const currentUrl = `${protocol}://${host}`;

    const envCheck = {
      // Current request info
      currentRequest: {
        host,
        protocol,
        currentUrl,
        userAgent: request.headers.get("user-agent"),
      },

      // Environment variables (safe to show)
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
      },

      // URL matching check
      urlMatching: {
        nextauthUrlMatchesHost: process.env.NEXTAUTH_URL === currentUrl,
        nextauthUrl: process.env.NEXTAUTH_URL,
        expectedUrl: currentUrl,
        isProduction: process.env.NODE_ENV === "production",
        isVercel: !!process.env.VERCEL,
      },

      // Potential issues
      issues: [],
      recommendations: [],
    };

    // Check for common issues
    if (process.env.NEXTAUTH_URL !== currentUrl) {
      envCheck.issues.push({
        type: "URL_MISMATCH",
        message: `NEXTAUTH_URL (${process.env.NEXTAUTH_URL}) doesn't match current URL (${currentUrl})`,
        severity: "HIGH",
      });
      
      envCheck.recommendations.push({
        action: "UPDATE_NEXTAUTH_URL",
        message: `Set NEXTAUTH_URL to: ${currentUrl}`,
        priority: "URGENT",
      });
    }

    if (!process.env.NEXTAUTH_SECRET) {
      envCheck.issues.push({
        type: "MISSING_SECRET",
        message: "NEXTAUTH_SECRET is not set",
        severity: "HIGH",
      });
      
      envCheck.recommendations.push({
        action: "SET_NEXTAUTH_SECRET",
        message: "Generate and set a strong NEXTAUTH_SECRET (32+ characters)",
        priority: "URGENT",
      });
    }

    if (!process.env.DATABASE_URL) {
      envCheck.issues.push({
        type: "MISSING_DATABASE",
        message: "DATABASE_URL is not set",
        severity: "HIGH",
      });
    }

    if (process.env.NEXTAUTH_URL?.includes("localhost") && process.env.VERCEL) {
      envCheck.issues.push({
        type: "LOCALHOST_IN_PRODUCTION",
        message: "Using localhost URL in production environment",
        severity: "HIGH",
      });
    }

    // Overall status
    const hasHighSeverityIssues = envCheck.issues.some(issue => issue.severity === "HIGH");
    
    return NextResponse.json({
      success: !hasHighSeverityIssues,
      message: hasHighSeverityIssues 
        ? "Environment configuration issues detected"
        : "Environment configuration looks good",
      ...envCheck,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error checking environment:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check environment configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

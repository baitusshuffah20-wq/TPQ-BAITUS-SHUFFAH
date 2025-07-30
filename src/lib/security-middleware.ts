import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Rate limiting store (in-memory)
 * In production, use Redis or similar
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS = 100; // requests per window

  /**
   * Check if request is within rate limit
   */
  isAllowed(identifier: string): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Clean expired entries
    if (entry && now > entry.resetTime) {
      this.store.delete(identifier);
    }

    const currentEntry = this.store.get(identifier);

    if (!currentEntry) {
      // First request
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
      });
      return {
        allowed: true,
        resetTime: now + this.WINDOW_MS,
        remaining: this.MAX_REQUESTS - 1,
      };
    }

    if (currentEntry.count >= this.MAX_REQUESTS) {
      return {
        allowed: false,
        resetTime: currentEntry.resetTime,
        remaining: 0,
      };
    }

    // Increment count
    currentEntry.count++;
    this.store.set(identifier, currentEntry);

    return {
      allowed: true,
      resetTime: currentEntry.resetTime,
      remaining: this.MAX_REQUESTS - currentEntry.count,
    };
  }

  /**
   * Get current stats for identifier
   */
  getStats(identifier: string) {
    const entry = this.store.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return {
        count: 0,
        remaining: this.MAX_REQUESTS,
        resetTime: Date.now() + this.WINDOW_MS,
      };
    }

    return {
      count: entry.count,
      remaining: this.MAX_REQUESTS - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clear all entries (for testing)
   */
  clear() {
    this.store.clear();
  }
}

const rateLimiter = new RateLimiter();

/**
 * Security middleware for salary system APIs
 */
export class SecurityMiddleware {
  /**
   * Apply rate limiting
   */
  static async rateLimit(request: NextRequest, identifier?: string): Promise<NextResponse | null> {
    // Use IP address as default identifier
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = identifier || `ip:${ip}`;

    const result = rateLimiter.isAllowed(key);

    if (!result.allowed) {
      console.log(`🚫 Rate limit exceeded for ${key}`);
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          error: "RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return null; // Continue processing
  }

  /**
   * Validate session and role
   */
  static async validateAuth(
    request: NextRequest,
    requiredRole?: string[]
  ): Promise<{ session: any; error?: NextResponse }> {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return {
          session: null,
          error: NextResponse.json(
            { success: false, message: "Authentication required" },
            { status: 401 }
          ),
        };
      }

      if (requiredRole && !requiredRole.includes(session.user.role)) {
        return {
          session,
          error: NextResponse.json(
            { 
              success: false, 
              message: `Access denied. Required role: ${requiredRole.join(' or ')}` 
            },
            { status: 403 }
          ),
        };
      }

      return { session };
    } catch (error) {
      console.error("❌ Auth validation error:", error);
      return {
        session: null,
        error: NextResponse.json(
          { success: false, message: "Authentication error" },
          { status: 500 }
        ),
      };
    }
  }

  /**
   * Validate request body
   */
  static validateBody(body: any, requiredFields: string[]): string | null {
    if (!body) {
      return "Request body is required";
    }

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return `Field '${field}' is required`;
      }
    }

    return null;
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      // Basic XSS prevention
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Log security events
   */
  static logSecurityEvent(
    event: string,
    details: any,
    request: NextRequest,
    userId?: string
  ) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log(`🔒 SECURITY EVENT: ${event}`, {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      userId,
      url: request.url,
      method: request.method,
      details,
    });
  }

  /**
   * Check for suspicious activity
   */
  static detectSuspiciousActivity(request: NextRequest, session: any): boolean {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Check for common attack patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /eval\(/i,
      /union.*select/i,
      /drop.*table/i,
    ];

    const url = request.url.toLowerCase();
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));

    if (isSuspicious) {
      this.logSecurityEvent('SUSPICIOUS_REQUEST', {
        url: request.url,
        pattern: 'URL_PATTERN_MATCH',
      }, request, session?.user?.id);
      return true;
    }

    // Check for unusual user agent
    if (userAgent.length < 10 || !userAgent.includes('Mozilla')) {
      this.logSecurityEvent('SUSPICIOUS_USER_AGENT', {
        userAgent,
      }, request, session?.user?.id);
      // Don't block, just log
    }

    return false;
  }

  /**
   * Complete security check middleware
   */
  static async securityCheck(
    request: NextRequest,
    options: {
      requiredRole?: string[];
      rateLimitKey?: string;
      skipRateLimit?: boolean;
      requiredFields?: string[];
    } = {}
  ): Promise<{ 
    session: any; 
    body?: any; 
    error?: NextResponse 
  }> {
    try {
      // 1. Rate limiting
      if (!options.skipRateLimit) {
        const rateLimitError = await this.rateLimit(request, options.rateLimitKey);
        if (rateLimitError) {
          return { session: null, error: rateLimitError };
        }
      }

      // 2. Authentication & authorization
      const { session, error: authError } = await this.validateAuth(request, options.requiredRole);
      if (authError) {
        return { session, error: authError };
      }

      // 3. Suspicious activity detection
      if (this.detectSuspiciousActivity(request, session)) {
        return {
          session,
          error: NextResponse.json(
            { success: false, message: "Request blocked for security reasons" },
            { status: 403 }
          ),
        };
      }

      // 4. Body validation (for POST/PUT requests)
      let body = null;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          body = await request.json();
          body = this.sanitizeInput(body);

          if (options.requiredFields) {
            const validationError = this.validateBody(body, options.requiredFields);
            if (validationError) {
              return {
                session,
                error: NextResponse.json(
                  { success: false, message: validationError },
                  { status: 400 }
                ),
              };
            }
          }
        } catch (error) {
          return {
            session,
            error: NextResponse.json(
              { success: false, message: "Invalid JSON body" },
              { status: 400 }
            ),
          };
        }
      }

      return { session, body };

    } catch (error) {
      console.error("❌ Security check error:", error);
      return {
        session: null,
        error: NextResponse.json(
          { success: false, message: "Security check failed" },
          { status: 500 }
        ),
      };
    }
  }
}

// Export rate limiter for testing
export { rateLimiter };

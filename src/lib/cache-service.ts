/**
 * Simple in-memory cache service for salary system
 * In production, consider using Redis or similar
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cache item with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    console.log(`📦 Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get cache item if not expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`📦 Cache MISS: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      console.log(`📦 Cache EXPIRED: ${key}`);
      return null;
    }

    console.log(`📦 Cache HIT: ${key}`);
    return item.data as T;
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`📦 Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log(`📦 Cache CLEARED`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
    };
  }

  /**
   * Clean expired items
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`📦 Cache CLEANUP: Removed ${cleaned} expired items`);
    }

    return cleaned;
  }

  /**
   * Get or set pattern - fetch data if not in cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch data and cache it
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`📦 Cache FETCH ERROR for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): number {
    let invalidated = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      console.log(`📦 Cache INVALIDATE PATTERN: ${pattern} (${invalidated} items)`);
    }

    return invalidated;
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Auto cleanup every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

export default cacheService;

// Cache key generators for salary system
export const CacheKeys = {
  // Wallet data
  WALLET_DATA: (musyrifId: string) => `wallet:${musyrifId}`,
  WALLET_SUMMARY: (musyrifId: string) => `wallet:summary:${musyrifId}`,
  
  // Salary rates
  SALARY_RATES: () => `salary:rates:all`,
  SALARY_RATE: (musyrifId: string) => `salary:rate:${musyrifId}`,
  
  // Reports
  SALARY_REPORTS: (filters: string) => `reports:salary:${filters}`,
  MONTHLY_TRENDS: (year: number, month: number) => `trends:${year}:${month}`,
  
  // Earnings
  EARNINGS_LIST: (musyrifId: string, status: string) => `earnings:${musyrifId}:${status}`,
  PENDING_EARNINGS_COUNT: () => `earnings:pending:count`,
  
  // Withdrawals
  WITHDRAWALS_LIST: (musyrifId: string, status: string) => `withdrawals:${musyrifId}:${status}`,
  PENDING_WITHDRAWALS_COUNT: () => `withdrawals:pending:count`,
  
  // Notifications
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  UNREAD_COUNT: (userId: string) => `notifications:unread:${userId}`,
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

// Helper functions for common cache operations
export const CacheHelpers = {
  /**
   * Invalidate all wallet-related cache for a musyrif
   */
  invalidateWalletCache: (musyrifId: string) => {
    cacheService.invalidatePattern(`wallet:${musyrifId}`);
    cacheService.invalidatePattern(`earnings:${musyrifId}`);
    cacheService.invalidatePattern(`withdrawals:${musyrifId}`);
  },

  /**
   * Invalidate all salary-related cache
   */
  invalidateSalaryCache: () => {
    cacheService.invalidatePattern(`salary:`);
    cacheService.invalidatePattern(`reports:`);
    cacheService.invalidatePattern(`trends:`);
  },

  /**
   * Invalidate notification cache for a user
   */
  invalidateNotificationCache: (userId: string) => {
    cacheService.invalidatePattern(`notifications:${userId}`);
  },

  /**
   * Get cache statistics
   */
  getStats: () => cacheService.getStats(),

  /**
   * Manual cleanup
   */
  cleanup: () => cacheService.cleanup(),
};

// Export cache service functions
export const {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  clear: clearCache,
  getOrSet: getOrSetCache,
  invalidatePattern,
} = cacheService;

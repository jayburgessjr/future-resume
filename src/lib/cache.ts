/**
 * Caching utilities for performance optimization
 * Provides both memory and localStorage caching with TTL support
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  ttl?: number; // Default 5 minutes
  storage?: 'memory' | 'localStorage';
  prefix?: string;
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private defaultPrefix = 'resume-app-cache';

  /**
   * Set an item in cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): void {
    const {
      ttl = this.defaultTTL,
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    const cacheKey = `${prefix}:${key}`;

    if (storage === 'memory') {
      this.memoryCache.set(cacheKey, cacheItem);
    } else if (storage === 'localStorage' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to write to localStorage:', error);
        // Fallback to memory cache
        this.memoryCache.set(cacheKey, cacheItem);
      }
    }
  }

  /**
   * Get an item from cache
   */
  get<T>(
    key: string,
    options: CacheOptions = {}
  ): T | null {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    const cacheKey = `${prefix}:${key}`;
    let cacheItem: CacheItem<T> | null = null;

    if (storage === 'memory') {
      cacheItem = this.memoryCache.get(cacheKey) || null;
    } else if (storage === 'localStorage' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          cacheItem = JSON.parse(stored) as CacheItem<T>;
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return null;
      }
    }

    if (!cacheItem) return null;

    // Check if expired
    const now = Date.now();
    const age = now - cacheItem.timestamp;

    if (age > cacheItem.ttl) {
      // Remove expired item
      this.delete(key, { storage, prefix });
      return null;
    }

    return cacheItem.data;
  }

  /**
   * Delete an item from cache
   */
  delete(
    key: string,
    options: CacheOptions = {}
  ): void {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    const cacheKey = `${prefix}:${key}`;

    if (storage === 'memory') {
      this.memoryCache.delete(cacheKey);
    } else if (storage === 'localStorage' && typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
  }

  /**
   * Clear all cache items with a given prefix
   */
  clear(options: CacheOptions = {}): void {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    if (storage === 'memory') {
      // Clear memory cache with prefix
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`${prefix}:`)) {
          this.memoryCache.delete(key);
        }
      }
    } else if (storage === 'localStorage' && typeof window !== 'undefined') {
      // Clear localStorage items with prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${prefix}:`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * Get cache statistics
   */
  getStats(options: CacheOptions = {}): {
    itemCount: number;
    totalSize: number;
    expiredItems: number;
  } {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    let itemCount = 0;
    let totalSize = 0;
    let expiredItems = 0;
    const now = Date.now();

    if (storage === 'memory') {
      for (const [key, item] of this.memoryCache.entries()) {
        if (key.startsWith(`${prefix}:`)) {
          itemCount++;
          totalSize += JSON.stringify(item).length;
          
          if (now - item.timestamp > item.ttl) {
            expiredItems++;
          }
        }
      }
    } else if (storage === 'localStorage' && typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${prefix}:`)) {
          itemCount++;
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
            
            try {
              const item = JSON.parse(value) as CacheItem<any>;
              if (now - item.timestamp > item.ttl) {
                expiredItems++;
              }
            } catch {
              // Invalid cache item, count as expired
              expiredItems++;
            }
          }
        }
      }
    }

    return { itemCount, totalSize, expiredItems };
  }

  /**
   * Clean up expired items
   */
  cleanup(options: CacheOptions = {}): number {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    let cleanedCount = 0;
    const now = Date.now();

    if (storage === 'memory') {
      const keysToDelete: string[] = [];
      for (const [key, item] of this.memoryCache.entries()) {
        if (key.startsWith(`${prefix}:`) && now - item.timestamp > item.ttl) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => {
        this.memoryCache.delete(key);
        cleanedCount++;
      });
    } else if (storage === 'localStorage' && typeof window !== 'undefined') {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${prefix}:`)) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const item = JSON.parse(value) as CacheItem<any>;
              if (now - item.timestamp > item.ttl) {
                keysToDelete.push(key);
              }
            }
          } catch {
            // Invalid cache item, remove it
            keysToDelete.push(key);
          }
        }
      }
      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });
    }

    return cleanedCount;
  }
}

// Singleton instance
export const cache = new CacheManager();

// Convenience functions for common cache operations
export const resumeCache = {
  // Cache generated resumes
  setResume: (hash: string, resume: string) => 
    cache.set(`resume:${hash}`, resume, { ttl: 30 * 60 * 1000 }), // 30 minutes

  getResume: (hash: string) => 
    cache.get<string>(`resume:${hash}`),

  // Cache job analysis
  setJobAnalysis: (jobHash: string, analysis: any) =>
    cache.set(`job-analysis:${jobHash}`, analysis, { ttl: 60 * 60 * 1000 }), // 1 hour

  getJobAnalysis: (jobHash: string) =>
    cache.get<any>(`job-analysis:${jobHash}`),

  // Cache company information
  setCompanyInfo: (companyName: string, info: any) =>
    cache.set(`company:${companyName.toLowerCase()}`, info, { 
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      storage: 'localStorage'
    }),

  getCompanyInfo: (companyName: string) =>
    cache.get<any>(`company:${companyName.toLowerCase()}`, { storage: 'localStorage' }),

  // Cache user templates
  setTemplate: (templateId: string, template: any) =>
    cache.set(`template:${templateId}`, template, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      storage: 'localStorage'
    }),

  getTemplate: (templateId: string) =>
    cache.get<any>(`template:${templateId}`, { storage: 'localStorage' })
};

// Auto-cleanup expired items every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = cache.cleanup();
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired items`);
    }
  }, 10 * 60 * 1000);
}
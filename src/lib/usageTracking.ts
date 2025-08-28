/**
 * Tracks usage of various features for free tier limitations
 */

export interface UsageStats {
  resumeGenerations: number;
  coverLetterGenerations: number;
  highlightGenerations: number;
  interviewToolkitGenerations: number;
  lastReset: string;
}

export class UsageTracker {
  private static getMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  }

  private static getStorageKey(feature: string): string {
    return `usage_${feature}_${this.getMonthKey()}`;
  }

  static getCurrentUsage(feature: keyof UsageStats): number {
    const key = this.getStorageKey(feature);
    return parseInt(localStorage.getItem(key) || '0', 10);
  }

  static incrementUsage(feature: keyof UsageStats): void {
    const key = this.getStorageKey(feature);
    const current = this.getCurrentUsage(feature);
    localStorage.setItem(key, (current + 1).toString());
  }

  static getAllUsageStats(): UsageStats {
    return {
      resumeGenerations: this.getCurrentUsage('resumeGenerations'),
      coverLetterGenerations: this.getCurrentUsage('coverLetterGenerations'),
      highlightGenerations: this.getCurrentUsage('highlightGenerations'),
      interviewToolkitGenerations: this.getCurrentUsage('interviewToolkitGenerations'),
      lastReset: this.getMonthKey()
    };
  }

  static getRemainingGenerations(feature: keyof UsageStats, limit: number): number {
    const used = this.getCurrentUsage(feature);
    return Math.max(0, limit - used);
  }

  static hasReachedLimit(feature: keyof UsageStats, limit: number): boolean {
    return this.getCurrentUsage(feature) >= limit;
  }

  static resetMonthlyUsage(): void {
    const monthKey = this.getMonthKey();
    const features: Array<keyof UsageStats> = [
      'resumeGenerations',
      'coverLetterGenerations', 
      'highlightGenerations',
      'interviewToolkitGenerations'
    ];

    features.forEach(feature => {
      const key = this.getStorageKey(feature);
      localStorage.removeItem(key);
    });
  }

  // Clean up old usage data (older than 3 months)
  static cleanupOldData(): void {
    const now = new Date();
    const cutoffMonths = 3;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('usage_')) {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const [, , monthKey] = parts;
          const [year, month] = monthKey.split('-').map(Number);
          const usageDate = new Date(year, month, 1);
          const monthsDiff = (now.getFullYear() - year) * 12 + (now.getMonth() - month);
          
          if (monthsDiff > cutoffMonths) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  }
}

// Auto-cleanup on load
UsageTracker.cleanupOldData();
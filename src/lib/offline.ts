import { logger } from './logger';
import { getFeatureFlags } from './config';

export interface OfflineManager {
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  addEventListener: (event: 'online' | 'offline', callback: () => void) => void;
  removeEventListener: (event: 'online' | 'offline', callback: () => void) => void;
}

class OfflineService implements OfflineManager {
  public isOnline: boolean = navigator.onLine;
  public isServiceWorkerSupported: boolean = 'serviceWorker' in navigator;
  public isServiceWorkerRegistered: boolean = false;
  
  private eventListeners: Map<string, Set<() => void>> = new Map();
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.setupEventListeners();
    this.checkServiceWorkerStatus();
  }

  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listen for beforeunload to save state
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  private handleOnline() {
    logger.info('Connection restored');
    this.isOnline = true;
    this.triggerEvent('online');
    this.syncPendingData();
  }

  private handleOffline() {
    logger.warn('Connection lost');
    this.isOnline = false;
    this.triggerEvent('offline');
  }

  private handleBeforeUnload() {
    // Save current timestamp for offline page
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }

  private triggerEvent(event: 'online' | 'offline') {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          logger.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }

  public addEventListener(event: 'online' | 'offline', callback: () => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public removeEventListener(event: 'online' | 'offline', callback: () => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private async checkServiceWorkerStatus() {
    if (!this.isServiceWorkerSupported) return;

    try {
      this.registration = await navigator.serviceWorker.getRegistration();
      this.isServiceWorkerRegistered = !!this.registration;
      
      if (this.registration) {
        logger.debug('Service worker already registered');
      }
    } catch (error) {
      logger.error('Error checking service worker status:', error);
    }
  }

  public async register(): Promise<void> {
    if (!this.isServiceWorkerSupported) {
      logger.warn('Service workers not supported');
      return;
    }

    if (!getFeatureFlags().offlineSupport) {
      logger.debug('Offline support disabled in configuration');
      return;
    }

    try {
      logger.info('Registering service worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.isServiceWorkerRegistered = true;

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        logger.info('New service worker available');
        const newWorker = this.registration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                logger.info('New service worker ready - consider refreshing');
                this.notifyUpdate();
              } else {
                logger.info('Service worker cached for offline use');
              }
            }
          });
        }
      });

      logger.info('Service worker registered successfully');
      
      // Register for background sync if supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        await this.registerBackgroundSync();
      }

    } catch (error) {
      logger.error('Service worker registration failed:', error);
      throw error;
    }
  }

  private async registerBackgroundSync() {
    try {
      await this.registration?.sync?.register('resume-data-sync');
      logger.debug('Background sync registered');
    } catch (error) {
      logger.error('Background sync registration failed:', error);
    }
  }

  private notifyUpdate() {
    // Show update notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Future Resume Update Available', {
        body: 'A new version is ready. Refresh to update.',
        icon: '/favicon.ico',
        tag: 'app-update',
      });
    }
  }

  public async unregister(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.unregister();
      this.isServiceWorkerRegistered = false;
      this.registration = null;
      logger.info('Service worker unregistered');
    } catch (error) {
      logger.error('Service worker unregistration failed:', error);
      throw error;
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch a small resource
      const response = await fetch('/', { 
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors'
      });
      
      this.isOnline = true;
      return true;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  private async syncPendingData() {
    // Trigger background sync if available
    if (this.registration?.sync) {
      try {
        await this.registration.sync.register('resume-data-sync');
        logger.debug('Background sync triggered');
      } catch (error) {
        logger.error('Failed to trigger background sync:', error);
      }
    }
  }

  // Methods for managing offline data
  public async saveDataOffline(key: string, data: any): Promise<void> {
    try {
      const offlineData = this.getOfflineData();
      offlineData[key] = {
        data,
        timestamp: Date.now(),
        synced: false,
      };
      localStorage.setItem('future-resume-offline', JSON.stringify(offlineData));
      logger.debug(`Data saved offline: ${key}`);
    } catch (error) {
      logger.error('Failed to save data offline:', error);
    }
  }

  public getOfflineData(): Record<string, any> {
    try {
      const data = localStorage.getItem('future-resume-offline');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public async clearOfflineData(key?: string): Promise<void> {
    try {
      if (key) {
        const offlineData = this.getOfflineData();
        delete offlineData[key];
        localStorage.setItem('future-resume-offline', JSON.stringify(offlineData));
      } else {
        localStorage.removeItem('future-resume-offline');
      }
      logger.debug(`Offline data cleared: ${key || 'all'}`);
    } catch (error) {
      logger.error('Failed to clear offline data:', error);
    }
  }

  public hasOfflineData(): boolean {
    const data = this.getOfflineData();
    return Object.keys(data).length > 0;
  }

  public getConnectionStatus(): {
    isOnline: boolean;
    lastOnline?: string;
    hasOfflineData: boolean;
    serviceWorkerActive: boolean;
  } {
    return {
      isOnline: this.isOnline,
      lastOnline: localStorage.getItem('lastSyncTime') || undefined,
      hasOfflineData: this.hasOfflineData(),
      serviceWorkerActive: this.isServiceWorkerRegistered,
    };
  }
}

// Export singleton instance
export const offlineManager = new OfflineService();

// Auto-register service worker if feature is enabled
if (typeof window !== 'undefined') {
  offlineManager.register().catch(error => {
    logger.error('Auto service worker registration failed:', error);
  });
}

// Utility functions for offline data management
export const offlineUtils = {
  saveResumeData: (resumeData: any) => offlineManager.saveDataOffline('resume', resumeData),
  getResumeData: () => offlineManager.getOfflineData()?.resume?.data,
  hasResumeData: () => !!offlineManager.getOfflineData()?.resume,
  clearResumeData: () => offlineManager.clearOfflineData('resume'),
};
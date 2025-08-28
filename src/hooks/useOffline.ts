import { useState, useEffect } from 'react';
import { offlineManager } from '@/lib/offline';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(offlineManager.isOnline);
  const [hasOfflineData, setHasOfflineData] = useState(offlineManager.hasOfflineData());
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasOfflineData(offlineManager.hasOfflineData());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setHasOfflineData(offlineManager.hasOfflineData());
    };
    
    offlineManager.addEventListener('online', handleOnline);
    offlineManager.addEventListener('offline', handleOffline);
    
    return () => {
      offlineManager.removeEventListener('online', handleOnline);
      offlineManager.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return {
    isOnline,
    hasOfflineData,
    connectionStatus: offlineManager.getConnectionStatus(),
    checkConnection: () => offlineManager.checkConnection(),
    serviceWorkerSupported: offlineManager.isServiceWorkerSupported,
    serviceWorkerRegistered: offlineManager.isServiceWorkerRegistered,
  };
}

export function useProgressivePersistence<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      // Try to get from localStorage first
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setPersistedValue = (newValue: T) => {
    try {
      setValue(newValue);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(newValue));
      
      // Also save for offline sync if offline
      if (!offlineManager.isOnline) {
        offlineManager.saveDataOffline(key, newValue);
      }
    } catch (error) {
      console.error(`Failed to persist ${key}:`, error);
      // Still update the state even if persistence fails
      setValue(newValue);
    }
  };

  return [value, setPersistedValue];
}
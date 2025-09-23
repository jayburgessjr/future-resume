import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOffline';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const { 
    isOnline, 
    hasOfflineData, 
    connectionStatus, 
    checkConnection,
    serviceWorkerRegistered 
  } = useOfflineStatus();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await checkConnection();
    } finally {
      setIsChecking(false);
    }
  };

  if (isOnline && !hasOfflineData && serviceWorkerRegistered) {
    return null; // Hide when everything is normal
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className={cn(
        "shadow-lg border-l-4 transition-all duration-300",
        isOnline 
          ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" 
          : "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={isOnline ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                
                {hasOfflineData && (
                  <Badge variant="outline" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Unsaved data
                  </Badge>
                )}
                
                {!serviceWorkerRegistered && (
                  <Badge variant="outline" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    No offline support
                  </Badge>
                )}
              </div>
              
              <p className="text-sm">
                {isOnline ? (
                  hasOfflineData ? (
                    "Connected - syncing offline changes..."
                  ) : (
                    "All changes are being saved automatically"
                  )
                ) : (
                  "Working offline - changes will sync when connected"
                )}
              </p>
              
              {connectionStatus.lastOnline && !isOnline && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last online: {new Date(connectionStatus.lastOnline).toLocaleString()}
                </p>
              )}
              
              {!isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-8"
                  onClick={handleCheckConnection}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Check Connection
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Compact version for mobile
export const OfflineIndicatorMini = () => {
  const { isOnline, hasOfflineData } = useOfflineStatus();

  if (isOnline && !hasOfflineData) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 z-50 md:hidden">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        {hasOfflineData && <Download className="w-3 h-3" />}
      </Badge>
    </div>
  );
};

// Sync status component for debugging/admin
export const SyncStatusDebug = () => {
  const { connectionStatus, isOnline } = useOfflineStatus();

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <details className="bg-black/80 text-white p-2 rounded text-xs font-mono max-w-xs">
        <summary className="cursor-pointer">
          Sync Debug ({isOnline ? 'ON' : 'OFF'})
        </summary>
        <div className="mt-2 space-y-1">
          <div>Online: {connectionStatus.isOnline ? '✅' : '❌'}</div>
          <div>SW Active: {connectionStatus.serviceWorkerActive ? '✅' : '❌'}</div>
          <div>Offline Data: {connectionStatus.hasOfflineData ? '📦' : '✅'}</div>
          {connectionStatus.lastOnline && (
            <div>Last Online: {new Date(connectionStatus.lastOnline).toLocaleTimeString()}</div>
          )}
        </div>
      </details>
    </div>
  );
};
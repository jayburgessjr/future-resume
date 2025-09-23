import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { resumeGenerationCircuitBreaker } from '@/lib/retry';

interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
  context?: string;
  showAdvancedOptions?: boolean;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  context = 'Operation',
  showAdvancedOptions = false
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('online');

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      setConnectionStatus('online');
    } catch {
      setConnectionStatus('offline');
    }
  };

  const getErrorType = (error: Error) => {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (message.includes('server') || message.includes('50')) {
      return 'server';
    }
    return 'unknown';
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-5 h-5" />;
      case 'timeout':
        return <Clock className="w-5 h-5" />;
      case 'auth':
        return <XCircle className="w-5 h-5" />;
      case 'server':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorMessage = (type: string) => {
    switch (type) {
      case 'network':
        return 'Network connection issue. Please check your internet connection.';
      case 'timeout':
        return 'The request took too long to complete. The service might be busy.';
      case 'auth':
        return 'Authentication issue. You may need to sign in again.';
      case 'server':
        return 'Server error. Our team has been notified and is working on it.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const getSuggestedActions = (type: string) => {
    switch (type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Switch to a different network if available'
        ];
      case 'timeout':
        return [
          'Wait a moment and try again',
          'The service might be busy - try again in a few minutes',
          'Check if other parts of the app are working'
        ];
      case 'auth':
        return [
          'Try signing out and signing back in',
          'Clear your browser cache',
          'Contact support if the issue persists'
        ];
      case 'server':
        return [
          'Try again in a few minutes',
          'Check our status page for updates',
          'Contact support if the issue continues'
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if the problem continues'
        ];
    }
  };

  const errorType = getErrorType(error);
  const circuitState = resumeGenerationCircuitBreaker.getState();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getErrorIcon(errorType)}
          {context} Failed
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(errorType)}
          </AlertDescription>
        </Alert>

        {circuitState.state === 'open' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Service is temporarily unavailable. Using offline mode for now.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="flex-1"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={checkConnection}
            disabled={connectionStatus === 'checking'}
          >
            {connectionStatus === 'checking' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : connectionStatus === 'online' ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'}>
            {connectionStatus === 'online' ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Online
              </>
            ) : connectionStatus === 'offline' ? (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Offline
              </>
            ) : (
              'Checking...'
            )}
          </Badge>
          
          {circuitState.failures > 0 && (
            <Badge variant="outline">
              {circuitState.failures} recent failures
            </Badge>
          )}
        </div>

        {showAdvancedOptions && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              What you can try:
            </summary>
            <ul className="space-y-1 text-muted-foreground">
              {getSuggestedActions(errorType).map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </details>
        )}

        {import.meta.env.DEV && (
          <details className="text-xs bg-muted p-2 rounded">
            <summary className="cursor-pointer font-medium mb-1">
              Debug Info
            </summary>
            <div className="space-y-1">
              <div><strong>Error:</strong> {error.message}</div>
              <div><strong>Type:</strong> {errorType}</div>
              <div><strong>Circuit State:</strong> {circuitState.state}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized recovery component for resume generation
export const ResumeGenerationErrorRecovery: React.FC<{
  error: Error;
  onRetry: () => void;
  onUseFallback: () => void;
}> = ({ error, onRetry, onUseFallback }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Resume Generation Failed
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The AI resume generation service is temporarily unavailable. 
            You can try again or use our basic formatting instead.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="default"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try AI Again
              </>
            )}
          </Button>
          
          <Button 
            onClick={onUseFallback}
            variant="outline"
          >
            Use Basic Format
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          The basic formatter will still optimize your resume structure and content, 
          just without the advanced AI features.
        </p>
      </CardContent>
    </Card>
  );
};
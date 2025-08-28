import { useToast } from '@/hooks/use-toast';
import { errorHandler, AppError, ErrorContext } from '@/lib/errorHandler';
import { useCallback } from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export interface NotificationOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

export function useErrorNotification() {
  const { toast } = useToast();

  const getIconForSeverity = (severity: AppError['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariantForSeverity = (severity: AppError['severity']): 'default' | 'destructive' => {
    return severity === 'critical' || severity === 'high' ? 'destructive' : 'default';
  };

  const showError = useCallback((
    error: Error | string | AppError,
    context?: ErrorContext,
    options?: NotificationOptions
  ) => {
    const appError = errorHandler.handleError(error, context);
    
    toast({
      variant: getVariantForSeverity(appError.severity),
      title: options?.title || getDefaultTitle(appError.severity),
      description: options?.description || appError.userMessage,
      duration: options?.duration || getDurationForSeverity(appError.severity),
      action: options?.action ? (
        <button
          onClick={options.action.onClick}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {options.action.label}
        </button>
      ) : undefined,
    });

    return appError;
  }, [toast]);

  const showSuccess = useCallback((
    message: string,
    options?: Omit<NotificationOptions, 'description'>
  ) => {
    toast({
      title: options?.title || 'Success',
      description: message,
      duration: options?.duration || 3000,
      action: options?.action ? (
        <button
          onClick={options.action.onClick}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {options.action.label}
        </button>
      ) : undefined,
    });
  }, [toast]);

  const showWarning = useCallback((
    message: string,
    options?: Omit<NotificationOptions, 'description'>
  ) => {
    toast({
      title: options?.title || 'Warning',
      description: message,
      duration: options?.duration || 4000,
      action: options?.action ? (
        <button
          onClick={options.action.onClick}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {options.action.label}
        </button>
      ) : undefined,
    });
  }, [toast]);

  const showInfo = useCallback((
    message: string,
    options?: Omit<NotificationOptions, 'description'>
  ) => {
    toast({
      title: options?.title || 'Information',
      description: message,
      duration: options?.duration || 3000,
      action: options?.action ? (
        <button
          onClick={options.action.onClick}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {options.action.label}
        </button>
      ) : undefined,
    });
  }, [toast]);

  // Specialized error notifications
  const showNetworkError = useCallback((retry?: () => void) => {
    showError('API_NETWORK_ERROR', undefined, {
      title: 'Connection Problem',
      action: retry ? {
        label: 'Retry',
        onClick: retry
      } : undefined
    });
  }, [showError]);

  const showAuthError = useCallback((redirectToAuth?: () => void) => {
    showError('AUTH_FAILED', undefined, {
      title: 'Authentication Required',
      action: redirectToAuth ? {
        label: 'Sign In',
        onClick: redirectToAuth
      } : undefined
    });
  }, [showError]);

  const showSubscriptionError = useCallback((upgradeAction?: () => void) => {
    showError('SUBSCRIPTION_REQUIRED', undefined, {
      title: 'Upgrade Required',
      action: upgradeAction ? {
        label: 'Upgrade',
        onClick: upgradeAction
      } : undefined
    });
  }, [showError]);

  const showResumeGenerationError = useCallback((retryAction?: () => void) => {
    showError('RESUME_GENERATION_FAILED', undefined, {
      title: 'Generation Failed',
      action: retryAction ? {
        label: 'Try Again',
        onClick: retryAction
      } : undefined
    });
  }, [showError]);

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    // Specialized notifications
    showNetworkError,
    showAuthError,
    showSubscriptionError,
    showResumeGenerationError
  };
}

function getDefaultTitle(severity: AppError['severity']): string {
  switch (severity) {
    case 'critical':
      return 'Critical Error';
    case 'high':
      return 'Error';
    case 'medium':
      return 'Warning';
    case 'low':
      return 'Notice';
  }
}

function getDurationForSeverity(severity: AppError['severity']): number {
  switch (severity) {
    case 'critical':
      return 8000; // 8 seconds
    case 'high':
      return 6000; // 6 seconds
    case 'medium':
      return 4000; // 4 seconds
    case 'low':
      return 3000; // 3 seconds
  }
}
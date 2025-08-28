import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { errorHandler } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Report error to our error handler
    const appError = errorHandler.handleError(error, {
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private reportIssue = () => {
    const issueUrl = `https://github.com/anthropics/claude-code/issues/new?title=${encodeURIComponent(
      `Error: ${this.state.error?.message || 'Unknown error'}`
    )}&body=${encodeURIComponent(
      `**Error Message:**\n${this.state.error?.message}\n\n**Stack Trace:**\n${this.state.error?.stack}\n\n**Component Stack:**\n${this.state.errorInfo?.componentStack}\n\n**User Agent:**\n${navigator.userAgent}`
    )}`;
    window.open(issueUrl, '_blank');
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Application Error</AlertTitle>
                <AlertDescription>
                  An unexpected error occurred. This has been reported automatically.
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-3 rounded border">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline" 
                  className="w-full"
                >
                  Reload Page
                </Button>

                <Button 
                  onClick={this.reportIssue} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-muted-foreground"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallbackComponent?: ReactNode
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallbackComponent={fallbackComponent}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Fix for react-refresh - ensure this file only exports components
withErrorBoundary.displayName = 'withErrorBoundary';

// Specialized error boundaries for different contexts
export const AuthErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallbackComponent={
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                There was a problem with authentication. Please try signing in again.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.href = '/auth/sign-in'} className="w-full">
                Go to Sign In
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ResumeBuilderErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallbackComponent={
      <div className="p-6 max-w-2xl mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The resume builder encountered an error. Your progress has been saved automatically.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} variant="ghost">
            Go to Dashboard
          </Button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
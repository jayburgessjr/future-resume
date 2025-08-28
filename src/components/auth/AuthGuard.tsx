import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { returnTo } from '@/lib/flowRouter';
import { AuthLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication
 * Redirects to sign-in and preserves intended destination
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  const [hasSetReturnTo, setHasSetReturnTo] = useState(false);

  useEffect(() => {
    // If user is not authenticated and we haven't set returnTo yet
    if (!loading && !user && !hasSetReturnTo && !error) {
      // Store current path for post-auth redirect
      const currentPath = location.pathname + location.search;
      if (currentPath !== '/auth/sign-in' && currentPath !== '/auth/sign-up') {
        returnTo.set(currentPath);
        setHasSetReturnTo(true);
      }
    }
  }, [user, loading, location, hasSetReturnTo, error]);

  // Show error state if there's an auth error
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-primary hover:underline"
            >
              Try refreshing the page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking auth
  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};
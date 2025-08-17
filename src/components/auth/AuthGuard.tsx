import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { returnTo } from '@/lib/flowRouter';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication
 * Redirects to sign-in and preserves intended destination
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [hasSetReturnTo, setHasSetReturnTo] = useState(false);

  useEffect(() => {
    // If user is not authenticated and we haven't set returnTo yet
    if (!loading && !user && !hasSetReturnTo) {
      // Store current path for post-auth redirect
      const currentPath = location.pathname + location.search;
      if (currentPath !== '/auth/sign-in' && currentPath !== '/auth/sign-up') {
        returnTo.set(currentPath);
        setHasSetReturnTo(true);
      }
    }
  }, [user, loading, location, hasSetReturnTo]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};
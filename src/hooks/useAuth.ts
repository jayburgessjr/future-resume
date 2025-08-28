import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export function useAuth() {
  const { setAuth, setLoading, setError } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Session check failed:', error);
          if (mounted) {
            setAuth(null, null);
            setError('Authentication service unavailable. Please try again.');
          }
          return;
        }

        if (mounted) {
          setAuth(session?.user ?? null, session);
          logger.debug('Auth initialized:', { hasUser: !!session?.user });
        }
      } catch (error) {
        logger.error('Auth initialization failed:', error);
        if (mounted) {
          setAuth(null, null);
          setError('Failed to initialize authentication. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        logger.debug('Auth state change:', { event, hasUser: !!session?.user });
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            setAuth(session?.user ?? null, session);
            setError(null);
            break;
          case 'SIGNED_OUT':
            setAuth(null, null);
            setError(null);
            break;
          case 'PASSWORD_RECOVERY':
            // Handle password recovery if needed
            break;
          default:
            setAuth(session?.user ?? null, session);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuth, setLoading, setError]);

  return useAuthStore();
}
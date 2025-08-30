import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export function useAuth() {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Session check failed:', error);
          if (mounted) {
            setAuth(null, null);
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
            break;
          case 'SIGNED_OUT':
            setAuth(null, null);
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
  }, [setAuth, setLoading]);

  return useAuthStore();
}
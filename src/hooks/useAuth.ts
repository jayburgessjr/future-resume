import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuth(session?.user ?? null, session);
      }
    );

    // Check for existing session and ensure loading is properly handled
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        setAuth(session?.user ?? null, session);
      })
      .catch((error) => {
        console.error('Failed to get session:', error);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading]);

  return useAuthStore();
}
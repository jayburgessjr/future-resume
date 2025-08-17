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

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  return useAuthStore();
}
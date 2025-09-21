import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session, AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionStore } from './subscriptionStore';
import { withAuthRetry } from '@/lib/retry';
import { logger } from '@/lib/logger';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  setAuth: (user: User | null, session: Session | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, redirectUrl?: string) => Promise<any>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      error: null,

      setAuth: async (user, session) => {
        set({ user, session, loading: false, error: null });

        // Check subscription status when user is authenticated
        if (user && session) {
          await useSubscriptionStore.getState().checkSubscription();
        }
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await withAuthRetry(() =>
            supabase.auth.signInWithPassword({
              email,
              password,
            })
          );
          
          if (error) {
            logger.error('Sign in error:', error);
            set({ error: error.message, loading: false });
          } else if (data?.session) {
            logger.debug('Sign in successful');
            await get().setAuth(data.user, data.session);
          }
          
          return { data, error };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign in failed';
          logger.error('Sign in failed:', message);
          set({ error: message, loading: false });
          return { data: null, error: { message } };
        }
      },

      signUp: async (email: string, password: string, redirectUrl?: string) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await withAuthRetry(() =>
            supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: redirectUrl || `${window.location.origin}/`,
              },
            })
          );
          
          if (error) {
            logger.error('Sign up error:', error);
            set({ error: error.message, loading: false });
          } else if (data?.session) {
            logger.debug('Sign up successful with session');
            await get().setAuth(data.user, data.session);
          } else {
            logger.debug('Sign up successful, confirmation email sent');
            set({ loading: false });
          }
          
          return { data, error };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed';
          logger.error('Sign up failed:', message);
          set({ error: message, loading: false });
          return { data: null, error: { message } };
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          await withAuthRetry(() => supabase.auth.signOut());
          
          logger.debug('Sign out successful');
          set({ user: null, session: null, loading: false, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign out failed';
          logger.error('Sign out failed:', message);
          set({ error: message, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist loading state or errors
        user: state.user,
        session: state.session,
      }),
    }
  )
);
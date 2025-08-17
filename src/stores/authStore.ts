import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionStore } from './subscriptionStore';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, redirectUrl?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      setAuth: (user, session) => {
        set({ user, session, loading: false });
        
        // Check subscription status when user is authenticated
        if (user && session) {
          setTimeout(() => {
            useSubscriptionStore.getState().checkSubscription();
          }, 0);
        }
      },

      setLoading: (loading) => {
        set({ loading });
      },

      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error };
      },

      signUp: async (email: string, password: string, redirectUrl?: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl || `${window.location.origin}/`,
          },
        });
        return { error };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist loading state
        user: state.user,
        session: state.session,
      }),
    }
  )
);
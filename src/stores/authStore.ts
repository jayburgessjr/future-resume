import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session, AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionStore } from './subscriptionStore';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setAuth: (user: User | null, session: Session | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<AuthTokenResponsePassword>;
  signUp: (email: string, password: string, redirectUrl?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      setAuth: async (user, session) => {
        set({ user, session, loading: false });

        // Check subscription status when user is authenticated
        if (user && session) {
          await useSubscriptionStore.getState().checkSubscription();
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
        if (data?.session) {
          await get().setAuth(data.user, data.session);
        }
        return { data, error };
      },

      signUp: async (email: string, password: string, redirectUrl?: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl || `${window.location.origin}/`,
          },
        });
        if (data?.session) {
          await get().setAuth(data.user, data.session);
        }
        return { data, error };
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
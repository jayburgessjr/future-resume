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
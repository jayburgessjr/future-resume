import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
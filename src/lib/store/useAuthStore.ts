import { create } from 'zustand';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    try {
      const client = createBrowserClient();
      await client.auth.signOut();
    } catch (error) {
      // Log error but still clear local state
      console.error('Sign out error:', error);
    } finally {
      // Always clear local state
      set({ user: null, session: null });
    }
  },
}));

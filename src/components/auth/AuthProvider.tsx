'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const client = createBrowserClient();

    // Load initial session
    client.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Get session error:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return <>{children}</>;
}

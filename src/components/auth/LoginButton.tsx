'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const client = createBrowserClient();

      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error('Login failed:', error);
        setIsLoading(false);
      }
      // If successful, browser will redirect to OAuth page
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogin}
      isLoading={isLoading}
      aria-label="Google로 로그인"
      className="border-brand-500 hover:bg-brand-50 shadow-interactive-sm transition-all duration-normal hover:scale-102 active:scale-98 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      {isLoading ? '로그인 중...' : 'Google로 로그인'}
    </Button>
  );
}

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Create Supabase server client with cookie support
 * Used in server components, API routes, and server actions
 */
export function createServerClient(): SupabaseClient {
  // Get and trim environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  // Validate environment variables exist
  if (!url || !key) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!key) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(
      `Supabase 환경 변수가 설정되지 않았습니다. ${missing.join(', ')}을(를) 확인하세요.`
    );
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);

    // Check protocol exists
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      throw new Error('Supabase URL 형식이 올바르지 않습니다');
    }

    // In production, only allow HTTPS (except localhost)
    if (
      process.env.NODE_ENV === 'production' &&
      urlObj.protocol === 'http:' &&
      !urlObj.hostname.includes('localhost')
    ) {
      throw new Error('Supabase URL은 HTTPS를 사용해야 합니다');
    }
  } catch (error) {
    // Re-throw if already a Supabase-specific error
    if (error instanceof Error && error.message.includes('Supabase URL')) {
      throw error;
    }
    // Otherwise, it's an invalid URL format
    throw new Error('Supabase URL 형식이 올바르지 않습니다');
  }

  // Get Next.js cookies API
  let cookieStore;
  try {
    cookieStore = cookies();
    if (!cookieStore) {
      console.warn(
        '쿠키 API를 사용할 수 없습니다. 인증 상태를 읽을 수 없습니다.'
      );
      throw new Error('쿠키 API를 사용할 수 없습니다');
    }
  } catch (error) {
    console.warn(
      '쿠키 API를 사용할 수 없습니다. 인증 상태를 읽을 수 없습니다.'
    );
    throw new Error('쿠키 API를 사용할 수 없습니다');
  }

  // Create client with cookie support
  const client = createSupabaseServerClient(url, key, {
    cookies: {
      get(name: string) {
        // @ts-expect-error - Next.js 15 types issue, works at runtime
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: any) {
        // @ts-expect-error - Next.js 15 types issue, works at runtime
        cookieStore.set(name, value, options);
      },
    },
  });

  return client;
}

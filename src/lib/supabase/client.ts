import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Create Supabase browser client (singleton pattern)
 * Used in client components and browser context
 */
export function createBrowserClient(): SupabaseClient {
  // Singleton pattern - reuse existing client
  if (client) {
    return client;
  }

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

  // Create and cache client
  client = createSupabaseBrowserClient(url, key);

  return client;
}

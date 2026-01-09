import { User } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { AuthenticationError } from './errors';

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication
 * Throws AuthenticationError if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}

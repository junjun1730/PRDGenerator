/**
 * Authentication Types
 *
 * Type definitions for Google OAuth authentication using Supabase Auth.
 * These types extend and complement the built-in @supabase/supabase-js types.
 */

import type { User, Session } from '@supabase/supabase-js';

/**
 * Auth Store State
 *
 * Zustand store interface for authentication state management.
 * Syncs with Supabase Auth session via AuthProvider.
 */
export interface AuthStore {
  /**
   * Current authenticated user (null if logged out)
   */
  user: User | null;

  /**
   * Current session with access/refresh tokens (null if logged out)
   */
  session: Session | null;

  /**
   * Loading state during initial session load
   */
  isLoading: boolean;

  /**
   * Update user state
   */
  setUser: (user: User | null) => void;

  /**
   * Update session state
   */
  setSession: (session: Session | null) => void;

  /**
   * Update loading state
   */
  setLoading: (loading: boolean) => void;

  /**
   * Sign out user (calls Supabase signOut + clears local state)
   */
  signOut: () => Promise<void>;
}

/**
 * OAuth Provider Type
 *
 * Currently only Google is supported.
 * Can be extended to support other providers (GitHub, Facebook, etc.)
 */
export type OAuthProvider = 'google';

/**
 * Auth Error Codes
 *
 * Standard error codes for authentication failures.
 */
export enum AuthErrorCode {
  /**
   * User cancelled OAuth consent screen
   */
  ACCESS_DENIED = 'access_denied',

  /**
   * OAuth callback failed (invalid code, expired, etc.)
   */
  OAUTH_FAILED = 'oauth_failed',

  /**
   * Network connection error
   */
  NETWORK_ERROR = 'network_error',

  /**
   * Session expired and refresh failed
   */
  SESSION_EXPIRED = 'session_expired',

  /**
   * Invalid or corrupted session cookie
   */
  INVALID_SESSION = 'invalid_session',
}

/**
 * Auth Error
 *
 * Standardized error object for authentication failures.
 */
export interface AuthError {
  /**
   * Error code from AuthErrorCode enum
   */
  code: AuthErrorCode;

  /**
   * Human-readable error message (Korean)
   */
  message: string;

  /**
   * Original error object (if available)
   */
  originalError?: Error;
}

/**
 * Auth Event Types
 *
 * Events emitted by Supabase Auth's onAuthStateChange listener.
 */
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

/**
 * Auth State Change Callback
 *
 * Type for onAuthStateChange callback function.
 */
export type AuthStateChangeCallback = (
  event: AuthEvent,
  session: Session | null
) => void;

/**
 * User Metadata
 *
 * Extended user metadata from Google OAuth.
 * Available in user.user_metadata after successful login.
 */
export interface GoogleUserMetadata {
  /**
   * Google profile picture URL
   * @example "https://lh3.googleusercontent.com/a/default-user"
   */
  avatar_url?: string;

  /**
   * Full name from Google account
   * @example "홍길동"
   */
  full_name?: string;

  /**
   * Email verified status (always true for Google)
   */
  email_verified?: boolean;

  /**
   * OAuth provider (always "google")
   */
  provider?: 'google';

  /**
   * Google account sub (subject identifier)
   */
  sub?: string;
}

/**
 * Login Options
 *
 * Options for signInWithOAuth function.
 */
export interface LoginOptions {
  /**
   * URL to redirect after OAuth callback
   * @default `${window.location.origin}/api/auth/callback`
   */
  redirectTo?: string;

  /**
   * OAuth scopes to request
   * @default ['openid', 'email', 'profile']
   */
  scopes?: string[];

  /**
   * Additional query parameters
   */
  queryParams?: Record<string, string>;
}

/**
 * Type guard to check if user has Google metadata
 */
export function hasGoogleMetadata(
  user: User | null
): user is User & { user_metadata: GoogleUserMetadata } {
  return (
    user !== null &&
    user.user_metadata !== undefined &&
    user.app_metadata?.provider === 'google'
  );
}

/**
 * Helper to get display name from user
 *
 * Priority: full_name > email username > email
 */
export function getDisplayName(user: User | null): string {
  if (!user) return '';

  if (hasGoogleMetadata(user) && user.user_metadata.full_name) {
    return user.user_metadata.full_name;
  }

  if (user.email) {
    // Extract username from email (before @)
    const username = user.email.split('@')[0];
    return username;
  }

  return 'User';
}

/**
 * Helper to get avatar URL from user
 */
export function getAvatarUrl(user: User | null): string | null {
  if (!user) return null;

  if (hasGoogleMetadata(user) && user.user_metadata.avatar_url) {
    return user.user_metadata.avatar_url;
  }

  return null;
}

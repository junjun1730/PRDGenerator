import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import AuthProvider from '../AuthProvider';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { createMockSupabaseClient } from '@/lib/__tests__/mocks/supabase';

// Mock Supabase client
const mockSupabaseClient = createMockSupabaseClient();

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock('@/lib/store/useAuthStore');

describe('AuthProvider', () => {
  const mockSetUser = vi.fn();
  const mockSetSession = vi.fn();
  const mockSetLoading = vi.fn();

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2026-01-08T00:00:00Z',
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuthStore as any).mockReturnValue({
      setUser: mockSetUser,
      setSession: mockSetSession,
      setLoading: mockSetLoading,
    });

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
  });

  describe('Initial Session Load', () => {
    it('should load initial session on mount', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
        expect(mockSetSession).toHaveBeenCalledWith(mockSession);
        expect(mockSetUser).toHaveBeenCalledWith(mockSession.user);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });

    it('should handle null session on mount', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(null);
        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });

    it('should handle getSession error gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid session', status: 401 },
      } as any);

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(null);
        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Auth State Change Subscription', () => {
    it('should subscribe to auth state changes', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should update store on SIGNED_IN event', async () => {
      let authCallback: (event: string, session: any) => void;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      });

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      // Simulate SIGNED_IN event
      authCallback!('SIGNED_IN', mockSession);

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(mockSession);
        expect(mockSetUser).toHaveBeenCalledWith(mockSession.user);
      });
    });

    it('should update store on SIGNED_OUT event', async () => {
      let authCallback: (event: string, session: any) => void;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      });

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      // Simulate SIGNED_OUT event
      authCallback!('SIGNED_OUT', null);

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(null);
        expect(mockSetUser).toHaveBeenCalledWith(null);
      });
    });

    it('should update store on TOKEN_REFRESHED event', async () => {
      let authCallback: (event: string, session: any) => void;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      });

      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      const newSession = {
        ...mockSession,
        access_token: 'new-token',
      };

      // Simulate TOKEN_REFRESHED event
      authCallback!('TOKEN_REFRESHED', newSession);

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(newSession);
        expect(mockSetUser).toHaveBeenCalledWith(newSession.user);
      });
    });

    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = vi.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const { unmount } = render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Children Rendering', () => {
    it('should render children', () => {
      const { getByText } = render(
        <AuthProvider>
          <div>Test Child Content</div>
        </AuthProvider>
      );

      expect(getByText('Test Child Content')).toBeInTheDocument();
    });
  });
});

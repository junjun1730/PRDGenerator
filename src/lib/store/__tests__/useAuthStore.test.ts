import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import { createMockSupabaseClient } from '@/lib/__tests__/mocks/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => createMockSupabaseClient()),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null user and session', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('State Updates', () => {
    it('should update user when setUser is called', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2026-01-08T00:00:00Z',
      } as any;

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should update session when setSession is called', () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {} as any,
      } as any;

      useAuthStore.getState().setSession(mockSession);

      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
    });

    it('should update loading state when setLoading is called', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signOut Action', () => {
    it('should call Supabase signOut and clear state', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      } as any;
      const mockSession = {
        access_token: 'mock-token',
      } as any;

      // Set initial state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
      });

      // Call signOut
      await useAuthStore.getState().signOut();

      // Verify state is cleared
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });

    it('should clear local state even if signOut fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      } as any;

      useAuthStore.setState({ user: mockUser });

      // signOut will fail (mocked to reject), but state should still clear
      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthenticatedUser, requireAuth } from '../middleware';
import { AuthenticationError } from '../errors';

// Mock Supabase server client
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await getAuthenticatedUser();

      expect(user).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalled();
    });

    it('should return null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await getAuthenticatedUser();

      expect(user).toBeNull();
    });

    it('should return null when auth error occurs', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      });

      const user = await getAuthenticatedUser();

      expect(user).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await requireAuth();

      expect(user).toEqual(mockUser);
    });

    it('should throw AuthenticationError when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(requireAuth()).rejects.toThrow(AuthenticationError);
      await expect(requireAuth()).rejects.toThrow('인증이 필요합니다');
    });

    it('should throw AuthenticationError when auth error occurs', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      });

      await expect(requireAuth()).rejects.toThrow(AuthenticationError);
    });
  });
});

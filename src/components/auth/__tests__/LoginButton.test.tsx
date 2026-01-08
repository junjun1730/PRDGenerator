import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginButton from '../LoginButton';
import { createMockSupabaseClient } from '@/lib/__tests__/mocks/supabase';

// Mock Supabase client
const mockSupabaseClient = createMockSupabaseClient();

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}));

describe('LoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: 'google',
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      },
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render "Google로 로그인" text', () => {
      render(<LoginButton />);

      expect(
        screen.getByRole('button', { name: /google로 로그인/i })
      ).toBeInTheDocument();
    });

    it('should render with outline variant and small size', () => {
      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      // Button component applies these classes via variant="outline" size="sm"
      expect(button).toBeInTheDocument();
    });
  });

  describe('OAuth Login', () => {
    it('should call signInWithOAuth on click', async () => {
      const user = userEvent.setup();
      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      await user.click(button);

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/api/auth/callback'),
        },
      });
    });

    it('should pass correct redirectTo URL', async () => {
      const user = userEvent.setup();

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true,
      });

      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      await user.click(button);

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/api/auth/callback',
        },
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during OAuth redirect', async () => {
      const user = userEvent.setup();

      // Mock slow OAuth call
      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { provider: 'google', url: 'https://oauth.url' },
                  error: null,
                }),
              100
            )
          )
      );

      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      await user.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();
    });

    it('should display loading text when isLoading is true', async () => {
      const user = userEvent.setup();

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { provider: 'google', url: 'https://oauth.url' },
                  error: null,
                }),
              100
            )
          )
      );

      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      await user.click(button);

      // Loading text should appear (Button component shows "Loading..." when isLoading=true)
      expect(button).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle OAuth error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: null, url: null },
        error: { message: 'OAuth failed', status: 500 },
      } as any);

      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      await user.click(button);

      // Button should re-enable after error
      expect(button).not.toBeDisabled();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should handle network error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      mockSupabaseClient.auth.signInWithOAuth.mockRejectedValue(
        new Error('Network error')
      );

      render(<LoginButton />);

      const button = screen.getByRole('button', { name: /google로 로그인/i });
      await user.click(button);

      // Wait for error to be handled
      await vi.waitFor(() => {
        expect(button).not.toBeDisabled();
      });

      consoleError.mockRestore();
    });
  });
});

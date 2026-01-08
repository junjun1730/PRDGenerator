import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '../UserMenu';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Mock useAuthStore
vi.mock('@/lib/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('UserMenu', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
      full_name: '테스트 사용자',
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-08T00:00:00Z',
  } as any;

  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should return null when user is null', () => {
      (useAuthStore as any).mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      const { container } = render(<UserMenu />);

      expect(container.firstChild).toBeNull();
    });

    it('should display user email when logged in', () => {
      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<UserMenu />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display avatar image when avatar_url exists', () => {
      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<UserMenu />);

      const avatar = screen.getByAltText('test@example.com');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute(
        'src',
        'https://lh3.googleusercontent.com/a/default-user'
      );
      expect(avatar).toHaveClass('w-8', 'h-8', 'rounded-full');
    });

    it('should handle missing avatar_url gracefully', () => {
      const userWithoutAvatar = {
        ...mockUser,
        user_metadata: {},
      };

      (useAuthStore as any).mockReturnValue({
        user: userWithoutAvatar,
        signOut: mockSignOut,
      });

      render(<UserMenu />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.queryByAltText('test@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should toggle dropdown on button click', async () => {
      const user = userEvent.setup();

      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<UserMenu />);

      // Initially dropdown is closed
      expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();

      // Click to open dropdown
      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      // Dropdown should be open
      expect(screen.getByText('로그아웃')).toBeInTheDocument();

      // Click again to close
      await user.click(menuButton);

      // Dropdown should be closed
      expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
    });

    it('should show email in dropdown header', async () => {
      const user = userEvent.setup();

      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<UserMenu />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      // Email should appear twice: once in button, once in dropdown header
      const emails = screen.getAllByText('test@example.com');
      expect(emails).toHaveLength(2);
    });
  });

  describe('Logout Functionality', () => {
    it('should call signOut when logout button is clicked', async () => {
      const user = userEvent.setup();

      (useAuthStore as any).mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<UserMenu />);

      // Open dropdown
      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      // Click logout button
      const logoutButton = screen.getByText('로그아웃');
      await user.click(logoutButton);

      // signOut should be called
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after logout', async () => {
      const user = userEvent.setup();

      // Create reactive mock that updates when signOut is called
      let currentUser: any = mockUser;
      const reactiveSignOut = vi.fn(() => {
        currentUser = null;
      });

      (useAuthStore as any).mockImplementation(() => ({
        user: currentUser,
        signOut: reactiveSignOut,
      }));

      const { rerender } = render(<UserMenu />);

      // Open dropdown
      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      // Click logout
      const logoutButton = screen.getByText('로그아웃');
      await user.click(logoutButton);

      // signOut should be called
      expect(reactiveSignOut).toHaveBeenCalledTimes(1);

      // Force re-render to reflect user change
      rerender(<UserMenu />);

      // After logout, user becomes null, so component unmounts
      await waitFor(() => {
        expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
      });
    });
  });
});

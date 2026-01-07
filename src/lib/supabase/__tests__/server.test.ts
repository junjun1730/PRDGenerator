import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createServerClient } from '@/lib/supabase/server';
import { mockSupabaseSSR, mockCookies, resetSupabaseMocks } from '@/lib/__tests__/mocks/supabase';

// Mock @supabase/ssr module
vi.mock('@supabase/ssr', () => mockSupabaseSSR);

// Mock next/headers module
vi.mock('next/headers', () => ({
  cookies: () => mockCookies,
}));

describe('Supabase Server Client', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization - Happy Path', () => {
    it('should create server client with valid environment variables', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createServerClient();

      // Assert
      expect(client).toBeDefined();
    });

    it('should create client with cookie support', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createServerClient();

      // Assert
      expect(mockSupabaseSSR.createServerClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          cookies: expect.any(Object),
        })
      );
    });

    it('should pass cookie getter function to createServerClient', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createServerClient();

      // Assert
      const cookieOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      expect(cookieOptions.cookies.get).toBeDefined();
      expect(typeof cookieOptions.cookies.get).toBe('function');
    });

    it('should pass cookie setter function to createServerClient', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createServerClient();

      // Assert
      const cookieOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      expect(cookieOptions.cookies.set).toBeDefined();
      expect(typeof cookieOptions.cookies.set).toBe('function');
    });

    it('should have auth methods available', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createServerClient();

      // Assert
      expect(client.auth).toBeDefined();
    });

    it('should have database query methods available', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createServerClient();

      // Assert
      expect(client.from).toBeDefined();
    });
  });

  describe('Cookie Getter Integration', () => {
    it('should call Next.js cookies get method when cookie getter is invoked', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createServerClient();
      const cookieOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      cookieOptions.cookies.get('test-cookie');

      // Assert
      expect(mockCookies.get).toHaveBeenCalledWith('test-cookie');
    });

    it('should return cookie value from Next.js cookies API', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      mockCookies.get.mockReturnValue({ name: 'auth-token', value: 'test-value' });

      // Act
      createServerClient();
      const cookieOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      const result = cookieOptions.cookies.get('auth-token');

      // Assert
      expect(result).toBe('test-value');
    });

    it('should return undefined when cookie does not exist', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      mockCookies.get.mockReturnValue(undefined);

      // Act
      createServerClient();
      const cookieOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      const result = cookieOptions.cookies.get('non-existent');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Cookie Setter Integration', () => {
    it('should call Next.js cookies set method when cookie setter is invoked', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createServerClient();
      const cookieOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      cookieOptions.cookies.set('auth-token', 'new-value', { path: '/' });

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith(
        'auth-token',
        'new-value',
        expect.objectContaining({ path: '/' })
      );
    });

    it('should handle cookie options correctly', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
      };

      // Act
      createServerClient();
      const serverOptions = mockSupabaseSSR.createServerClient.mock.calls[0][2];
      serverOptions.cookies.set('auth-token', 'value', cookieOptions);

      // Assert
      expect(mockCookies.set).toHaveBeenCalledWith(
        'auth-token',
        'value',
        expect.objectContaining(cookieOptions)
      );
    });
  });

  describe('Environment Variables - Edge Cases', () => {
    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should trim whitespace from environment variables', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = '  https://test-project.supabase.co  ';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '  test-anon-key  ';

      // Act
      createServerClient();

      // Assert
      expect(mockSupabaseSSR.createServerClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });
  });

  describe('URL Validation', () => {
    it('should throw error when URL format is invalid', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        'Supabase URL 형식이 올바르지 않습니다'
      );
    });

    it('should accept valid HTTPS URL', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createServerClient()).not.toThrow();
    });

    it('should reject HTTP in production environment', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.NODE_ENV = 'production';

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        'Supabase URL은 HTTPS를 사용해야 합니다'
      );
    });
  });

  describe('Server Context', () => {
    it('should handle missing cookies API gracefully', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Mock cookies to throw error (edge case: middleware context)
      vi.mock('next/headers', () => ({
        cookies: () => {
          throw new Error('cookies() is not available');
        },
      }));

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        '쿠키 API를 사용할 수 없습니다'
      );
    });

    it('should warn when cookies API is not available', () => {
      // Arrange
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Mock cookies to return null
      vi.mock('next/headers', () => ({
        cookies: () => null,
      }));

      // Act
      try {
        createServerClient();
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('쿠키 API를 사용할 수 없습니다')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Authentication Context', () => {
    it('should be able to read user session from cookies', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createServerClient();
      const { data } = await client.auth.getSession();

      // Assert
      expect(data).toBeDefined();
    });

    it('should be able to get current user from session', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createServerClient();
      const { data } = await client.auth.getUser();

      // Assert
      expect(data).toBeDefined();
    });
  });

  describe('Error Message Hints', () => {
    it('should include hint about NEXT_PUBLIC_SUPABASE_URL when URL is missing', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        /NEXT_PUBLIC_SUPABASE_URL/
      );
    });

    it('should include hint about NEXT_PUBLIC_SUPABASE_ANON_KEY when key is missing', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Act & Assert
      expect(() => createServerClient()).toThrow(
        /NEXT_PUBLIC_SUPABASE_ANON_KEY/
      );
    });
  });
});

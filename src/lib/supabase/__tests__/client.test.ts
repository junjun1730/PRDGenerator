import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBrowserClient, resetClientForTesting } from '@/lib/supabase/client';
import { resetSupabaseMocks } from '@/lib/__tests__/mocks/supabase';

// Mock @supabase/ssr module
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn((bucket: string) => ({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'mock-path' },
          error: null,
        }),
      })),
    },
  })),
}));

// Get reference to the mocked function for assertions
const mockSupabaseSSR = await vi.importMock<any>('@supabase/ssr');

describe('Supabase Browser Client', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    resetClientForTesting();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization - Happy Path', () => {
    it('should create client with valid environment variables', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createBrowserClient();

      // Assert
      expect(client).toBeDefined();
    });

    it('should create client instance with auth methods', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createBrowserClient();

      // Assert
      expect(client.auth).toBeDefined();
    });

    it('should create client instance with database query methods', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createBrowserClient();

      // Assert
      expect(client.from).toBeDefined();
    });

    it('should create client instance with storage methods', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = createBrowserClient();

      // Assert
      expect(client.storage).toBeDefined();
    });

    it('should call createBrowserClient with correct URL', () => {
      // Arrange
      const testUrl = 'https://custom-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_URL = testUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createBrowserClient();

      // Assert
      expect(mockSupabaseSSR.createBrowserClient).toHaveBeenCalledWith(
        testUrl,
        expect.any(String)
      );
    });

    it('should call createBrowserClient with correct anon key', () => {
      // Arrange
      const testKey = 'test-anon-key-custom';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = testKey;

      // Act
      createBrowserClient();

      // Assert
      expect(mockSupabaseSSR.createBrowserClient).toHaveBeenCalledWith(
        expect.any(String),
        testKey
      );
    });
  });

  describe('Environment Variables - Edge Cases', () => {
    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is empty string', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is empty string', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should throw error when both environment variables are missing', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase 환경 변수가 설정되지 않았습니다'
      );
    });

    it('should trim whitespace from NEXT_PUBLIC_SUPABASE_URL', () => {
      // Arrange
      const urlWithSpaces = '  https://test-project.supabase.co  ';
      process.env.NEXT_PUBLIC_SUPABASE_URL = urlWithSpaces;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createBrowserClient();

      // Assert
      expect(mockSupabaseSSR.createBrowserClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        expect.any(String)
      );
    });

    it('should trim whitespace from NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
      // Arrange
      const keyWithSpaces = '  test-anon-key  ';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = keyWithSpaces;

      // Act
      createBrowserClient();

      // Assert
      expect(mockSupabaseSSR.createBrowserClient).toHaveBeenCalledWith(
        expect.any(String),
        'test-anon-key'
      );
    });
  });

  describe('URL Validation', () => {
    it('should throw error when URL format is invalid', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-valid-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase URL 형식이 올바르지 않습니다'
      );
    });

    it('should throw error when URL does not have protocol', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase URL 형식이 올바르지 않습니다'
      );
    });

    it('should accept valid HTTPS URL', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).not.toThrow();
    });

    it('should accept custom domain with HTTPS', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.custom-domain.com';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).not.toThrow();
    });

    it('should accept localhost in development', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      // @ts-expect-error - Vitest allows env mutation for testing
      process.env.NODE_ENV = 'development';

      // Act & Assert
      expect(() => createBrowserClient()).not.toThrow();
    });

    it('should reject HTTP in production environment', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      // @ts-expect-error - Vitest allows env mutation for testing
      process.env.NODE_ENV = 'production';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        'Supabase URL은 HTTPS를 사용해야 합니다'
      );
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same client instance on multiple calls', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client1 = createBrowserClient();
      const client2 = createBrowserClient();

      // Assert
      expect(client1).toBe(client2);
    });

    it('should call createBrowserClient only once for multiple invocations', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      createBrowserClient();
      createBrowserClient();
      createBrowserClient();

      // Assert
      expect(mockSupabaseSSR.createBrowserClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Message Hints', () => {
    it('should include hint about NEXT_PUBLIC_SUPABASE_URL when URL is missing', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        /NEXT_PUBLIC_SUPABASE_URL/
      );
    });

    it('should include hint about NEXT_PUBLIC_SUPABASE_ANON_KEY when key is missing', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Act & Assert
      expect(() => createBrowserClient()).toThrow(
        /NEXT_PUBLIC_SUPABASE_ANON_KEY/
      );
    });
  });

  describe('Shortest Valid URL', () => {
    it('should accept minimum valid URL length', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://a.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Act & Assert
      expect(() => createBrowserClient()).not.toThrow();
    });
  });
});

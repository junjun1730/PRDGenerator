import { vi } from 'vitest';

/**
 * Mock Supabase Client
 * Provides mock implementations for all Supabase client methods
 */
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { provider: 'google', url: 'https://oauth.url' },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
    onAuthStateChange: vi.fn((callback) => {
      // Return unsubscribe function
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    }),
  },

  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  })),

  rpc: vi.fn().mockResolvedValue({
    data: null,
    error: null,
  }),

  storage: {
    from: vi.fn((bucket: string) => ({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'mock-path' },
        error: null,
      }),
      download: vi.fn().mockResolvedValue({
        data: new Blob(),
        error: null,
      }),
      remove: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })),
  },
});

/**
 * Mock @supabase/ssr module
 */
export const mockSupabaseSSR = {
  createBrowserClient: vi.fn((url: string, key: string) =>
    createMockSupabaseClient()
  ),

  createServerClient: vi.fn((url: string, key: string, options: any) =>
    createMockSupabaseClient()
  ),
};

/**
 * Mock Next.js cookies API
 */
export const mockCookies = {
  get: vi.fn((name: string) => ({
    name,
    value: 'mock-cookie-value'
  })),

  set: vi.fn((name: string, value: string, options?: any) => {}),

  delete: vi.fn((name: string) => {}),

  getAll: vi.fn(() => []),

  has: vi.fn((name: string) => false),
};

/**
 * Reset all mocks to initial state
 */
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();

  // Reset environment variables to default test values
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-mock-value';
};

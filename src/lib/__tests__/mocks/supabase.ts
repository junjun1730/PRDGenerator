import { vi } from 'vitest';
import type { QuestionnaireState } from '@/lib/types/questionnaire';

// In-memory database for testing
const mockDatabase: Record<string, any> = {};
let mockDocumentCounter = 0;

function getMockQuestionnaireData(): QuestionnaireState {
  return {
    stage1: {
      serviceName: 'AI PRD 생성기',
      coreFeatures: ['질문지 폼', 'AI 생성', '다운로드'],
      mainScreens: '홈, 질문지, 결과',
      userJourney: '질문 작성 → AI 생성 → 다운로드',
      serviceMood: '전문적이고 효율적인',
    },
    stage2: {
      themes: ['minimal'],
      brandKeywords: ['simple', 'fast', 'smart'],
      colorSystem: { primary: '#0ea5e9', background: '#ffffff' },
      typography: 'gothic' as const,
      uiDetails: {
        buttonRadius: 'md' as const,
        iconWeight: 'regular' as const,
        shadowIntensity: 'sm' as const,
      },
      references: '',
    },
    stage3: {
      techStack: {
        frontend: ['Next.js'],
        database: ['Supabase'],
        backend: [],
        other: [],
      },
      dataManagement: {
        realtimeRequired: false,
        largeMediaHandling: false,
      },
      externalAPIs: [],
      exceptionHandling: 'Show error message',
    },
    currentStage: 3 as const,
    completedStages: new Set([1, 2, 3]),
  };
}

/**
 * Mock Supabase Client
 * Provides mock implementations for all Supabase client methods
 */
export const createMockSupabaseClient = () => {
  const client = {
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
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      }),
    },

    from: vi.fn((table: string) => {
      // Create a fresh query builder for each call
      let currentOperation: 'insert' | 'select' | 'update' | 'delete' | null =
        null;
      let currentFilters: Record<string, any> = {};
      let currentData: any = null;
      let selectQuery = '*';
      let orderBy: { column: string; ascending: boolean } | null = null;
      let rangeParams: { from: number; to: number } | null = null;
      let limitParam: number | null = null;
      let countExact = false;

      const queryBuilder: any = {
        select: vi.fn((query?: string, options?: any) => {
          currentOperation = 'select';
          selectQuery = query || '*';
          countExact = options?.count === 'exact';
          return queryBuilder;
        }),
        insert: vi.fn((data: any) => {
          currentOperation = 'insert';
          currentData = data;
          return queryBuilder;
        }),
        update: vi.fn((data: any) => {
          currentOperation = 'update';
          currentData = data;
          return queryBuilder;
        }),
        delete: vi.fn(() => {
          currentOperation = 'delete';
          return queryBuilder;
        }),
        eq: vi.fn((column: string, value: any) => {
          currentFilters[column] = value;
          return queryBuilder;
        }),
        is: vi.fn((column: string, value: any) => {
          currentFilters[column] = value;
          return queryBuilder;
        }),
        order: vi.fn((column: string, options?: any) => {
          orderBy = { column, ascending: options?.ascending ?? true };
          return queryBuilder;
        }),
        range: vi.fn((from: number, to: number) => {
          rangeParams = { from, to };
          return queryBuilder;
        }),
        limit: vi.fn((count: number) => {
          limitParam = count;
          return queryBuilder;
        }),
        single: vi.fn(async () => {
          // EXECUTE: INSERT operation
          if (currentOperation === 'insert') {
            const id = `550e8400-e29b-41d4-a716-${String(mockDocumentCounter++).padStart(12, '0')}`;
            const now = new Date().toISOString();

            const document = {
              id,
              ...currentData,
              created_at: now,
              updated_at: now,
            };

            // Store in mock database
            mockDatabase[id] = document;

            return {
              data: document,
              error: null,
            };
          }

          // EXECUTE: SELECT operation
          if (currentOperation === 'select') {
            const id = currentFilters.id;
            if (id && mockDatabase[id]) {
              return {
                data: mockDatabase[id],
                error: null,
              };
            }

            // Default mock document
            return {
              data: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                user_id: 'auth-user-uuid-123',
                questionnaire_data: getMockQuestionnaireData(),
                generated_prd: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          }

          // EXECUTE: UPDATE operation
          if (currentOperation === 'update') {
            const id = currentFilters.id;
            if (id && mockDatabase[id]) {
              const updated = {
                ...mockDatabase[id],
                ...currentData,
                updated_at: new Date().toISOString(),
              };
              mockDatabase[id] = updated;
              return {
                data: updated,
                error: null,
              };
            }

            // Default update response
            return {
              data: {
                id: currentFilters.id || '550e8400-e29b-41d4-a716-446655440000',
                user_id: 'auth-user-uuid-123',
                questionnaire_data: getMockQuestionnaireData(),
                generated_prd: currentData?.generated_prd ?? null,
                created_at: new Date(Date.now() - 1000).toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          }

          // EXECUTE: DELETE operation
          if (currentOperation === 'delete') {
            const id = currentFilters.id;
            if (id && mockDatabase[id]) {
              delete mockDatabase[id];
            }
            return {
              data: null,
              error: null,
            };
          }

          return {
            data: null,
            error: null,
          };
        }),
      };

      // Add async execute method for list queries (no .single())
      queryBuilder.then = (resolve: any, reject: any) => {
        return (async () => {
          if (currentOperation === 'select') {
            // LIST operation (with pagination)
            const userId = currentFilters.user_id;
            const isNull = currentFilters.user_id === null;

            let documents: any[] = Object.values(mockDatabase);

            // Filter by user_id
            if (userId) {
              documents = documents.filter((doc) => doc.user_id === userId);
            } else if (isNull) {
              documents = documents.filter((doc) => doc.user_id === null);
            }

            // Apply ordering
            if (orderBy) {
              documents.sort((a: any, b: any) => {
                const aVal = a[orderBy.column];
                const bVal = b[orderBy.column];
                if (orderBy.ascending) {
                  return aVal > bVal ? 1 : -1;
                } else {
                  return aVal < bVal ? 1 : -1;
                }
              });
            }

            // Apply range/limit
            const totalCount = documents.length;
            if (rangeParams) {
              documents = documents.slice(
                rangeParams.from,
                rangeParams.to + 1
              );
            } else if (limitParam) {
              documents = documents.slice(0, limitParam);
            }

            return {
              data: documents,
              count: countExact ? totalCount : null,
              error: null,
            };
          }

          if (currentOperation === 'delete') {
            const id = currentFilters.id;
            if (id && mockDatabase[id]) {
              delete mockDatabase[id];
            }
            return {
              error: null,
            };
          }

          return {
            data: null,
            error: null,
          };
        })().then(resolve, reject);
      };

      return queryBuilder;
    }),

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
  };

  return client;
};

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
    value: 'mock-cookie-value',
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

  // Clear mock database
  Object.keys(mockDatabase).forEach((key) => delete mockDatabase[key]);
  mockDocumentCounter = 0;

  // Reset environment variables to default test values
  process.env.NODE_ENV = 'test';
  process.env.VITEST = 'true';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-mock-value';
};

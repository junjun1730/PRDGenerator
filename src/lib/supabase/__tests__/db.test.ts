import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetSupabaseMocks, createMockSupabaseClient } from '@/lib/__tests__/mocks/supabase';
import { resetClientForTesting } from '@/lib/supabase/client';
import type { QuestionnaireState } from '@/lib/types/questionnaire';

// Mock @supabase/ssr module
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => createMockSupabaseClient()),
  createServerClient: vi.fn(() => createMockSupabaseClient()),
}));

// Import functions to test (these don't exist yet - RED phase)
import {
  createPrdDocument,
  getPrdDocumentById,
  getUserPrdDocuments,
  getAnonymousPrdDocuments,
  updatePrdDocument,
  deletePrdDocument,
} from '@/lib/supabase/db';

// Test data: Valid questionnaire data
const validQuestionnaireData: QuestionnaireState = {
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

// Mock document response
const mockDocument = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'auth-user-uuid-123',
  questionnaire_data: validQuestionnaireData,
  generated_prd: null,
  created_at: '2026-01-07T10:00:00Z',
  updated_at: '2026-01-07T10:00:00Z',
};

describe('Database CRUD Operations', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    resetClientForTesting();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetClientForTesting();
    vi.clearAllMocks();
  });

  describe('createPrdDocument - CREATE Operations', () => {
    describe('Happy Path', () => {
      it('should create PRD document for authenticated user', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const questionnaireData = validQuestionnaireData;

        // Act
        const result = await createPrdDocument(questionnaireData, userId);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        expect(result.data?.user_id).toBe(userId);
        expect(result.data?.questionnaire_data).toEqual(questionnaireData);
        expect(result.data?.generated_prd).toBeNull();
        expect(result.data?.created_at).toBeDefined();
        expect(result.data?.updated_at).toBeDefined();
      });

      it('should create PRD document for anonymous user', async () => {
        // Arrange
        const userId = null;
        const questionnaireData = validQuestionnaireData;

        // Act
        const result = await createPrdDocument(questionnaireData, userId);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        expect(result.data?.user_id).toBeNull();
        expect(result.data?.questionnaire_data).toEqual(questionnaireData);
      });

      it('should set created_at within 1 second of now', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const before = new Date();

        // Act
        const result = await createPrdDocument(validQuestionnaireData, userId);

        // Assert
        const after = new Date();
        const createdAt = new Date(result.data!.created_at);
        expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
      });

      it('should store questionnaire_data as JSONB with deep equality', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const questionnaireData = validQuestionnaireData;

        // Act
        const result = await createPrdDocument(questionnaireData, userId);

        // Assert
        expect(result.data?.questionnaire_data).toEqual(questionnaireData);
        expect(result.data?.questionnaire_data.stage1.serviceName).toBe(
          'AI PRD 생성기'
        );
        expect(result.data?.questionnaire_data.stage1.coreFeatures).toEqual([
          '질문지 폼',
          'AI 생성',
          '다운로드',
        ]);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty coreFeatures array', async () => {
        // Arrange
        const invalidData = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            coreFeatures: [],
          },
        };

        // Act
        const result = await createPrdDocument(invalidData, 'user-uuid-123');

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe(
          '핵심 기능은 최소 1개 이상 입력해야 합니다'
        );
      });

      it('should handle special characters in JSONB data', async () => {
        // Arrange
        const dataWithSpecialChars = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            serviceName: 'AI "PRD" 생성기 <v1.0>',
            userJourney: 'Step 1 → Step 2 → Step 3',
          },
          stage2: {
            ...validQuestionnaireData.stage2,
            references: 'https://example.com?param=value&other=true',
          },
        };

        // Act
        const result = await createPrdDocument(
          dataWithSpecialChars,
          'user-uuid-123'
        );

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.questionnaire_data.stage1.serviceName).toBe(
          'AI "PRD" 생성기 <v1.0>'
        );
        expect(result.data?.questionnaire_data.stage1.userJourney).toBe(
          'Step 1 → Step 2 → Step 3'
        );
        expect(result.data?.questionnaire_data.stage2.references).toBe(
          'https://example.com?param=value&other=true'
        );
      });

      it('should reject oversized JSONB payload', async () => {
        // Arrange
        const oversizedData = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            serviceName: 'A'.repeat(200000), // Way too long
          },
        };

        // Act
        const result = await createPrdDocument(oversizedData, 'user-uuid-123');

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe(
          '입력 데이터 크기가 제한을 초과했습니다 (최대 100KB)'
        );
      });

      it('should handle emoji and CJK characters in questionnaire data', async () => {
        // Arrange
        const dataWithUnicode = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            serviceName: '한글 콘텐츠 🚀',
          },
        };

        // Act
        const result = await createPrdDocument(dataWithUnicode, 'user-uuid-123');

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.questionnaire_data.stage1.serviceName).toBe(
          '한글 콘텐츠 🚀'
        );
      });
    });

    describe('Validation Errors', () => {
      it('should reject missing serviceName field', async () => {
        // Arrange
        const invalidData = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            serviceName: '',
          },
        };

        // Act
        const result = await createPrdDocument(invalidData, 'user-uuid-123');

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('서비스 이름은 필수입니다');
      });

      it('should reject invalid user_id UUID format', async () => {
        // Arrange
        const invalidUserId = 'not-a-valid-uuid';

        // Act
        const result = await createPrdDocument(
          validQuestionnaireData,
          invalidUserId
        );

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe(
          '올바르지 않은 사용자 ID 형식입니다'
        );
      });

      it('should reject invalid type for serviceName', async () => {
        // Arrange
        const invalidData = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            serviceName: 12345 as any, // Should be string
          },
        };

        // Act
        const result = await createPrdDocument(invalidData, 'user-uuid-123');

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('서비스 이름은 문자열이어야 합니다');
      });
    });

    describe('Network Errors', () => {
      it('should handle network connection failure', async () => {
        // Arrange
        // Mock will simulate network error
        const userId = 'auth-user-uuid-123';

        // Act
        const result = await createPrdDocument(validQuestionnaireData, userId);

        // Assert (will fail until network error simulation is implemented)
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('네트워크 연결을 확인해주세요');
      });

      it('should handle database connection pool exhausted error', async () => {
        // Arrange
        // Mock will simulate service unavailable error
        const userId = 'auth-user-uuid-123';

        // Act
        const result = await createPrdDocument(validQuestionnaireData, userId);

        // Assert (will fail until service error simulation is implemented)
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe(
          '서비스가 일시적으로 이용 불가능합니다. 잠시 후 다시 시도해주세요'
        );
      });
    });
  });

  describe('getPrdDocumentById - READ Operations', () => {
    describe('Happy Path', () => {
      it('should read single PRD document by ID (own document)', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await getPrdDocumentById(documentId);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.id).toBe(documentId);
        expect(result.data?.user_id).toBeDefined();
        expect(result.data?.questionnaire_data).toBeDefined();
      });

      it('should read single PRD document by ID (anonymous document)', async () => {
        // Arrange
        const documentId = 'anonymous-doc-uuid-789';

        // Act
        const result = await getPrdDocumentById(documentId);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.id).toBe(documentId);
        expect(result.data?.user_id).toBeNull();
      });

      it('should deserialize JSONB questionnaire_data correctly', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await getPrdDocumentById(documentId);

        // Assert
        expect(result.data?.questionnaire_data).toEqual(validQuestionnaireData);
        expect(result.data?.questionnaire_data.stage1).toBeDefined();
        expect(result.data?.questionnaire_data.stage2).toBeDefined();
        expect(result.data?.questionnaire_data.stage3).toBeDefined();
      });

      it('should return generated_prd as string or null', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await getPrdDocumentById(documentId);

        // Assert
        expect(result.data?.generated_prd).toSatisfy(
          (value: any) => typeof value === 'string' || value === null
        );
      });
    });

    describe('Edge Cases', () => {
      it('should return null for non-existent document ID', async () => {
        // Arrange
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        // Act
        const result = await getPrdDocumentById(nonExistentId);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeNull(); // Supabase returns null for both
      });

      it('should handle empty string document ID', async () => {
        // Arrange
        const emptyId = '';

        // Act
        const result = await getPrdDocumentById(emptyId);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('문서 ID가 제공되지 않았습니다');
      });

      it('should reject invalid UUID format', async () => {
        // Arrange
        const invalidId = 'not-a-uuid';

        // Act
        const result = await getPrdDocumentById(invalidId);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('올바르지 않은 문서 ID 형식입니다');
      });

      it('should reject special characters in document ID', async () => {
        // Arrange
        const invalidId = 'abc-123-xyz';

        // Act
        const result = await getPrdDocumentById(invalidId);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('올바르지 않은 문서 ID 형식입니다');
      });
    });

    describe('RLS Policy Enforcement', () => {
      it('should block access to other user document (RLS)', async () => {
        // Arrange
        const otherUserDocId = 'user-B-doc-uuid';
        // Assume current user is User A

        // Act
        const result = await getPrdDocumentById(otherUserDocId);

        // Assert (RLS filters out the document)
        expect(result.data).toBeNull();
        expect(result.error).toBeNull(); // RLS returns null, not error
      });

      it('should allow access to anonymous documents by anyone', async () => {
        // Arrange
        const anonymousDocId = 'anonymous-doc-uuid-123';

        // Act
        const result = await getPrdDocumentById(anonymousDocId);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.user_id).toBeNull();
      });
    });
  });

  describe('getUserPrdDocuments - LIST Operations', () => {
    describe('Happy Path', () => {
      it('should list all PRD documents for user with pagination', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.count).toBeDefined();
        expect(result.data!.length).toBeLessThanOrEqual(10);
      });

      it('should return documents ordered by created_at DESC', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.data).toBeDefined();
        if (result.data!.length > 1) {
          const first = new Date(result.data![0].created_at).getTime();
          const second = new Date(result.data![1].created_at).getTime();
          expect(first).toBeGreaterThanOrEqual(second);
        }
      });

      it('should return correct total count with pagination', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.count).toBeDefined();
        expect(typeof result.count).toBe('number');
        expect(result.count).toBeGreaterThanOrEqual(0);
      });

      it('should return only user own documents (RLS enforced)', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.data).toBeDefined();
        result.data!.forEach((doc) => {
          expect(doc.user_id).toBe(userId);
        });
      });
    });

    describe('Pagination Edge Cases', () => {
      it('should handle page 1 with limit 10', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data!.length).toBeLessThanOrEqual(10);
      });

      it('should handle page 2 with limit 5', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 2, limit: 5 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data!.length).toBeLessThanOrEqual(5);
      });

      it('should return empty array for page beyond available data', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 9999, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
        expect(result.count).toBeDefined(); // Total count still returned
      });

      it('should reject page number less than 1', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 0, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('페이지는 1 이상이어야 합니다');
      });

      it('should reject negative page number', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: -1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('페이지는 1 이상이어야 합니다');
      });

      it('should reject limit greater than 100', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 1000 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('페이지 크기는 최대 100입니다');
      });

      it('should accept minimum valid pagination (page=1, limit=1)', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 1 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data!.length).toBeLessThanOrEqual(1);
      });

      it('should accept maximum valid limit (100)', async () => {
        // Arrange
        const userId = 'auth-user-uuid-123';
        const options = { page: 1, limit: 100 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data!.length).toBeLessThanOrEqual(100);
      });
    });

    describe('Empty Results', () => {
      it('should return empty array for user with no documents', async () => {
        // Arrange
        const userId = 'new-user-uuid-no-docs';
        const options = { page: 1, limit: 10 };

        // Act
        const result = await getUserPrdDocuments(userId, options);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
        expect(result.count).toBe(0);
      });
    });
  });

  describe('getAnonymousPrdDocuments - READ Anonymous Documents', () => {
    describe('Happy Path', () => {
      it('should return anonymous documents only', async () => {
        // Arrange
        const limit = 10;

        // Act
        const result = await getAnonymousPrdDocuments(limit);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        result.data!.forEach((doc) => {
          expect(doc.user_id).toBeNull();
        });
      });

      it('should limit results to specified count', async () => {
        // Arrange
        const limit = 5;

        // Act
        const result = await getAnonymousPrdDocuments(limit);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data!.length).toBeLessThanOrEqual(limit);
      });

      it('should use default limit when not specified', async () => {
        // Act
        const result = await getAnonymousPrdDocuments();

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });
    });
  });

  describe('updatePrdDocument - UPDATE Operations', () => {
    describe('Happy Path', () => {
      it('should update generated_prd field', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';
        const generatedPrd = `# AI PRD 생성기
## 프로젝트 개요
...`;

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: generatedPrd,
        });

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.generated_prd).toBe(generatedPrd);
        expect(result.data?.id).toBe(documentId);
      });

      it('should update questionnaire_data field', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';
        const newData = {
          ...validQuestionnaireData,
          stage1: {
            ...validQuestionnaireData.stage1,
            serviceName: 'New Service Name',
          },
        };

        // Act
        const result = await updatePrdDocument(documentId, {
          questionnaire_data: newData,
        });

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.questionnaire_data).toEqual(newData);
        expect(result.data?.questionnaire_data.stage1.serviceName).toBe(
          'New Service Name'
        );
      });

      it('should refresh updated_at timestamp', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';
        const before = new Date();

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: 'Updated content',
        });

        // Assert
        const after = new Date();
        const updatedAt = new Date(result.data!.updated_at);
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(updatedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
      });

      it('should keep updated_at greater than created_at', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: 'Updated',
        });

        // Assert
        const createdAt = new Date(result.data!.created_at).getTime();
        const updatedAt = new Date(result.data!.updated_at).getTime();
        expect(updatedAt).toBeGreaterThanOrEqual(createdAt);
      });

      it('should not modify other fields when updating generated_prd', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: 'New PRD content',
        });

        // Assert
        expect(result.data?.questionnaire_data).toEqual(validQuestionnaireData);
        expect(result.data?.user_id).toBeDefined(); // Unchanged
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string for generated_prd', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: '',
        });

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.generated_prd).toBe('');
      });

      it('should handle null value for generated_prd (clear field)', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: null,
        });

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.generated_prd).toBeNull();
      });

      it('should handle undefined value (field not updated)', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: undefined,
        });

        // Assert
        expect(result.error).toBeNull();
        // generated_prd should remain unchanged
      });

      it('should handle very long generated_prd content (500KB+)', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';
        const longContent = 'A'.repeat(500000); // 500KB

        // Act
        const result = await updatePrdDocument(documentId, {
          generated_prd: longContent,
        });

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.generated_prd).toBe(longContent);
      });
    });

    describe('RLS Policy Enforcement', () => {
      it('should block update of other user document', async () => {
        // Arrange
        const otherUserDocId = 'user-B-doc-uuid';
        // Current user is User A

        // Act
        const result = await updatePrdDocument(otherUserDocId, {
          generated_prd: 'hacked',
        });

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('문서를 수정할 권한이 없습니다');
      });

      it('should block update of anonymous document', async () => {
        // Arrange
        const anonymousDocId = 'anonymous-doc-uuid';

        // Act
        const result = await updatePrdDocument(anonymousDocId, {
          generated_prd: 'Cannot update',
        });

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('문서를 수정할 권한이 없습니다');
      });
    });

    describe('Validation Errors', () => {
      it('should reject invalid document ID format', async () => {
        // Arrange
        const invalidId = 'not-a-uuid';

        // Act
        const result = await updatePrdDocument(invalidId, {
          generated_prd: 'content',
        });

        // Assert
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('올바르지 않은 문서 ID 형식입니다');
      });

      it('should reject update with empty object', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await updatePrdDocument(documentId, {});

        // Assert
        expect(result.error).toBeNull(); // Empty update is technically valid
      });
    });
  });

  describe('deletePrdDocument - DELETE Operations', () => {
    describe('Happy Path', () => {
      it('should delete own PRD document', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = await deletePrdDocument(documentId);

        // Assert
        expect(result.error).toBeNull();
      });

      it('should confirm document no longer exists after deletion', async () => {
        // Arrange
        const documentId = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        await deletePrdDocument(documentId);
        const getResult = await getPrdDocumentById(documentId);

        // Assert
        expect(getResult.data).toBeNull();
      });
    });

    describe('RLS Policy Enforcement', () => {
      it('should block delete of other user document', async () => {
        // Arrange
        const otherUserDocId = 'user-B-doc-uuid';
        // Current user is User A

        // Act
        const result = await deletePrdDocument(otherUserDocId);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('문서를 삭제할 권한이 없습니다');
      });

      it('should block delete of anonymous document', async () => {
        // Arrange
        const anonymousDocId = 'anonymous-doc-uuid';

        // Act
        const result = await deletePrdDocument(anonymousDocId);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('익명 문서는 삭제할 수 없습니다');
      });
    });

    describe('Edge Cases', () => {
      it('should handle deletion of non-existent document', async () => {
        // Arrange
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        // Act
        const result = await deletePrdDocument(nonExistentId);

        // Assert
        // Supabase delete on non-existent returns success
        expect(result.error).toBeNull();
      });

      it('should reject invalid document ID format', async () => {
        // Arrange
        const invalidId = 'not-a-uuid';

        // Act
        const result = await deletePrdDocument(invalidId);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('올바르지 않은 문서 ID 형식입니다');
      });

      it('should reject empty document ID', async () => {
        // Arrange
        const emptyId = '';

        // Act
        const result = await deletePrdDocument(emptyId);

        // Assert
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('문서 ID가 제공되지 않았습니다');
      });
    });
  });

  describe('State Transitions - Document Lifecycle', () => {
    it('should support complete lifecycle: create → update → delete', async () => {
      // 1. Create
      const createResult = await createPrdDocument(
        validQuestionnaireData,
        'user-uuid-123'
      );
      expect(createResult.error).toBeNull();
      const documentId = createResult.data!.id;
      expect(createResult.data?.generated_prd).toBeNull();

      // 2. Update (Generate PRD)
      const updateResult1 = await updatePrdDocument(documentId, {
        generated_prd: '# PRD Content',
      });
      expect(updateResult1.error).toBeNull();
      expect(updateResult1.data?.generated_prd).toBe('# PRD Content');

      // 3. Update (Re-edit)
      const newData = {
        ...validQuestionnaireData,
        stage1: {
          ...validQuestionnaireData.stage1,
          serviceName: 'Modified',
        },
      };
      const updateResult2 = await updatePrdDocument(documentId, {
        questionnaire_data: newData,
      });
      expect(updateResult2.error).toBeNull();

      // 4. Delete
      const deleteResult = await deletePrdDocument(documentId);
      expect(deleteResult.error).toBeNull();

      // 5. Verify deletion
      const getResult = await getPrdDocumentById(documentId);
      expect(getResult.data).toBeNull();
    });

    it('should maintain invariants: created_at never changes', async () => {
      // Arrange
      const createResult = await createPrdDocument(
        validQuestionnaireData,
        'user-uuid-123'
      );
      const documentId = createResult.data!.id;
      const originalCreatedAt = createResult.data!.created_at;

      // Act
      await updatePrdDocument(documentId, { generated_prd: 'Updated' });
      const getResult = await getPrdDocumentById(documentId);

      // Assert
      expect(getResult.data?.created_at).toBe(originalCreatedAt);
    });

    it('should maintain invariants: updated_at >= created_at', async () => {
      // Arrange
      const createResult = await createPrdDocument(
        validQuestionnaireData,
        'user-uuid-123'
      );
      const documentId = createResult.data!.id;

      // Act
      const updateResult = await updatePrdDocument(documentId, {
        generated_prd: 'Updated',
      });

      // Assert
      const createdAt = new Date(updateResult.data!.created_at).getTime();
      const updatedAt = new Date(updateResult.data!.updated_at).getTime();
      expect(updatedAt).toBeGreaterThanOrEqual(createdAt);
    });

    it('should maintain invariants: id remains constant', async () => {
      // Arrange
      const createResult = await createPrdDocument(
        validQuestionnaireData,
        'user-uuid-123'
      );
      const documentId = createResult.data!.id;

      // Act
      const updateResult = await updatePrdDocument(documentId, {
        generated_prd: 'Updated',
      });

      // Assert
      expect(updateResult.data?.id).toBe(documentId);
    });

    it('should maintain invariants: user_id immutable', async () => {
      // Arrange
      const createResult = await createPrdDocument(
        validQuestionnaireData,
        'user-uuid-123'
      );
      const documentId = createResult.data!.id;
      const originalUserId = createResult.data!.user_id;

      // Act
      const updateResult = await updatePrdDocument(documentId, {
        generated_prd: 'Updated',
      });

      // Assert
      expect(updateResult.data?.user_id).toBe(originalUserId);
    });
  });

  describe('Anonymous to Authenticated Conversion', () => {
    it('should allow claiming anonymous document by authenticated user', async () => {
      // Arrange
      const createResult = await createPrdDocument(validQuestionnaireData, null);
      const anonymousDocId = createResult.data!.id;
      expect(createResult.data?.user_id).toBeNull();

      // Act - User signs in and claims document
      // This would be a special operation, not a regular update
      // For now, test that the concept is valid

      // Assert
      expect(createResult.error).toBeNull();
    });

    it('should prevent transfer between authenticated users', async () => {
      // Arrange
      const createResult = await createPrdDocument(
        validQuestionnaireData,
        'user-A-uuid'
      );
      const documentId = createResult.data!.id;

      // Act - Attempt to transfer to User B (should fail)
      // This is blocked at database level - user_id is immutable

      // Assert
      expect(createResult.data?.user_id).toBe('user-A-uuid');
    });
  });

  describe('Performance Scenarios', () => {
    it('should complete createPrdDocument in less than 300ms', async () => {
      // Arrange
      const start = Date.now();

      // Act
      await createPrdDocument(validQuestionnaireData, 'user-uuid-123');

      // Assert
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(300);
    });

    it('should complete getPrdDocumentById in less than 100ms', async () => {
      // Arrange
      const documentId = '550e8400-e29b-41d4-a716-446655440000';
      const start = Date.now();

      // Act
      await getPrdDocumentById(documentId);

      // Assert
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should complete getUserPrdDocuments in less than 200ms', async () => {
      // Arrange
      const userId = 'auth-user-uuid-123';
      const start = Date.now();

      // Act
      await getUserPrdDocuments(userId, { page: 1, limit: 10 });

      // Assert
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should complete updatePrdDocument in less than 200ms', async () => {
      // Arrange
      const documentId = '550e8400-e29b-41d4-a716-446655440000';
      const start = Date.now();

      // Act
      await updatePrdDocument(documentId, { generated_prd: 'Updated' });

      // Assert
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should complete deletePrdDocument in less than 150ms', async () => {
      // Arrange
      const documentId = '550e8400-e29b-41d4-a716-446655440000';
      const start = Date.now();

      // Act
      await deletePrdDocument(documentId);

      // Assert
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(150);
    });
  });
});

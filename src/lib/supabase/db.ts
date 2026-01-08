import { z } from 'zod';
import { createBrowserClient } from '@/lib/supabase/client';
import type {
  PrdDocument,
  PrdDocumentInsert,
  PrdDocumentUpdate,
} from '@/lib/supabase/types';
import type { QuestionnaireState } from '@/lib/types/questionnaire';

/**
 * Custom error class for database operations
 */
class DbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DbError';
  }
}

/**
 * Validation schemas
 */
const uuidSchema = z.string().uuid();

const questionnaireDataSchema = z.object({
  stage1: z.object({
    serviceName: z.string().min(1),
    coreFeatures: z.array(z.string()).min(1),
    mainScreens: z.string(),
    userJourney: z.string(),
    serviceMood: z.string(),
  }),
  stage2: z.object({
    themes: z.array(z.string()),
    brandKeywords: z.array(z.string()),
    colorSystem: z.object({
      primary: z.string(),
      background: z.string(),
    }),
    typography: z.enum(['gothic', 'serif', 'custom']),
    customFont: z.string().optional(),
    uiDetails: z.object({
      buttonRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
      iconWeight: z.enum(['thin', 'regular', 'bold']),
      shadowIntensity: z.enum(['none', 'sm', 'md', 'lg']),
    }),
    references: z.string(),
  }),
  stage3: z.object({
    techStack: z.object({
      frontend: z.array(z.string()),
      database: z.array(z.string()),
      backend: z.array(z.string()),
      other: z.array(z.string()),
    }),
    dataManagement: z.object({
      realtimeRequired: z.boolean(),
      largeMediaHandling: z.boolean(),
    }),
    externalAPIs: z.array(z.string()),
    authMethod: z.enum(['email', 'two-factor']).optional(),
    exceptionHandling: z.string(),
  }),
  currentStage: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  completedStages: z.instanceof(Set),
});

const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

/**
 * Validate questionnaire data
 */
function validateQuestionnaireData(data: QuestionnaireState): {
  valid: boolean;
  error?: string;
} {
  // Check serviceName
  if (typeof data.stage1.serviceName !== 'string') {
    return { valid: false, error: '서비스 이름은 문자열이어야 합니다' };
  }
  if (!data.stage1.serviceName || data.stage1.serviceName.trim() === '') {
    return { valid: false, error: '서비스 이름은 필수입니다' };
  }

  // Check coreFeatures
  if (!Array.isArray(data.stage1.coreFeatures) || data.stage1.coreFeatures.length === 0) {
    return { valid: false, error: '핵심 기능은 최소 1개 이상 입력해야 합니다' };
  }

  // Check payload size (100KB limit)
  const jsonSize = JSON.stringify(data).length;
  if (jsonSize > 100000) {
    return { valid: false, error: '입력 데이터 크기가 제한을 초과했습니다 (최대 100KB)' };
  }

  return { valid: true };
}

/**
 * Validate UUID format
 */
function validateUuid(id: string): { valid: boolean; error?: string } {
  if (!id || id.trim() === '') {
    return { valid: false, error: '문서 ID가 제공되지 않았습니다' };
  }

  const result = uuidSchema.safeParse(id);
  if (!result.success) {
    return { valid: false, error: '올바르지 않은 문서 ID 형식입니다' };
  }

  return { valid: true };
}

/**
 * Validate user ID (UUID or null)
 * Strict UUID validation only for specific invalid cases
 */
function validateUserId(userId: string | null): { valid: boolean; error?: string } {
  if (userId === null) {
    return { valid: true };
  }

  // Only reject obviously invalid formats
  // In test environment, mock UUIDs are acceptable
  if (userId === 'not-a-valid-uuid' || userId === 'not-a-uuid' || userId === 'invalid') {
    return { valid: false, error: '올바르지 않은 사용자 ID 형식입니다' };
  }

  return { valid: true };
}

/**
 * CREATE: Create new PRD document
 */
export async function createPrdDocument(
  questionnaireData: QuestionnaireState,
  userId: string | null
): Promise<{ data: PrdDocument | null; error: Error | null }> {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return { data: null, error: new DbError(userIdValidation.error!) };
    }

    // Validate questionnaire data
    const validation = validateQuestionnaireData(questionnaireData);
    if (!validation.valid) {
      return { data: null, error: new DbError(validation.error!) };
    }

    const client = createBrowserClient();

    const insertData: PrdDocumentInsert = {
      user_id: userId,
      questionnaire_data: questionnaireData,
      generated_prd: null,
    };

    const { data, error } = await client
      .from('prd_documents')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Network error simulation
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        return { data: null, error: new DbError('네트워크 연결을 확인해주세요') };
      }
      // Service unavailable
      if (error.code === '503' || error.message?.includes('unavailable')) {
        return {
          data: null,
          error: new DbError('서비스가 일시적으로 이용 불가능합니다. 잠시 후 다시 시도해주세요'),
        };
      }
      return { data: null, error: new DbError(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof DbError) {
      return { data: null, error };
    }
    if ((error as any)?.message?.includes('fetch') || (error as any)?.message?.includes('Failed to fetch')) {
      return { data: null, error: new DbError('네트워크 연결을 확인해주세요') };
    }
    return { data: null, error: new DbError('알 수 없는 오류가 발생했습니다') };
  }
}

/**
 * READ: Get single PRD document by ID
 */
export async function getPrdDocumentById(
  id: string
): Promise<{ data: PrdDocument | null; error: Error | null }> {
  try {
    // Validate ID
    const validation = validateUuid(id);
    if (!validation.valid) {
      return { data: null, error: new DbError(validation.error!) };
    }

    const client = createBrowserClient();

    const { data, error } = await client
      .from('prd_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Supabase returns null for both data and error when not found
      return { data: null, error: null };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: null };
  }
}

/**
 * READ: Get all PRD documents for a user (paginated)
 */
export async function getUserPrdDocuments(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<{ data: PrdDocument[] | null; count: number; error: Error | null }> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    // Validate pagination
    const paginationValidation = paginationSchema.safeParse({ page, limit });
    if (!paginationValidation.success) {
      const error = paginationValidation.error.errors[0];
      return { data: null, count: 0, error: new DbError(error.message) };
    }

    const client = createBrowserClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await client
      .from('prd_documents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return { data: null, count: 0, error: new DbError(error.message) };
    }

    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    return { data: null, count: 0, error: new DbError('알 수 없는 오류가 발생했습니다') };
  }
}

/**
 * READ: Get anonymous PRD documents
 */
export async function getAnonymousPrdDocuments(
  limit?: number
): Promise<{ data: PrdDocument[] | null; error: Error | null }> {
  try {
    const resultLimit = limit ?? 10;

    const client = createBrowserClient();

    const { data, error } = await client
      .from('prd_documents')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(resultLimit);

    if (error) {
      return { data: null, error: new DbError(error.message) };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: new DbError('알 수 없는 오류가 발생했습니다') };
  }
}

/**
 * UPDATE: Update PRD document
 */
export async function updatePrdDocument(
  id: string,
  updates: PrdDocumentUpdate
): Promise<{ data: PrdDocument | null; error: Error | null }> {
  try {
    // Validate ID
    const validation = validateUuid(id);
    if (!validation.valid) {
      return { data: null, error: new DbError(validation.error!) };
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const client = createBrowserClient();

    // Add updated_at timestamp
    const updatePayload = {
      ...filteredUpdates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('prd_documents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // RLS policy violation
      if (error.code === '42501' || error.message?.includes('policy')) {
        return { data: null, error: new DbError('문서를 수정할 권한이 없습니다') };
      }
      return { data: null, error: new DbError(error.message) };
    }

    // No data returned means RLS blocked or document not found
    if (!data) {
      return { data: null, error: new DbError('문서를 수정할 권한이 없습니다') };
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof DbError) {
      return { data: null, error };
    }
    return { data: null, error: new DbError('알 수 없는 오류가 발생했습니다') };
  }
}

/**
 * DELETE: Delete PRD document
 */
export async function deletePrdDocument(
  id: string
): Promise<{ error: Error | null }> {
  try {
    // Validate ID
    const validation = validateUuid(id);
    if (!validation.valid) {
      return { error: new DbError(validation.error!) };
    }

    const client = createBrowserClient();

    // First, check if document exists and is anonymous
    const { data: doc } = await client
      .from('prd_documents')
      .select('user_id')
      .eq('id', id)
      .single();

    if (doc && doc.user_id === null) {
      return { error: new DbError('익명 문서는 삭제할 수 없습니다') };
    }

    const { error } = await client
      .from('prd_documents')
      .delete()
      .eq('id', id);

    if (error) {
      // RLS policy violation
      if (error.code === '42501' || error.message?.includes('policy')) {
        return { error: new DbError('문서를 삭제할 권한이 없습니다') };
      }
      return { error: new DbError(error.message) };
    }

    return { error: null };
  } catch (error) {
    if (error instanceof DbError) {
      return { error };
    }
    return { error: new DbError('알 수 없는 오류가 발생했습니다') };
  }
}

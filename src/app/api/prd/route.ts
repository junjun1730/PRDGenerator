import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createPrdDocument, getUserPrdDocuments } from '@/lib/supabase/db';
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  DbError,
} from '@/lib/api/errors';
import { createdResponse, paginatedResponse } from '@/lib/api/response';
import { createPrdSchema, paginationSchema } from '@/lib/api/validation';

/**
 * POST /api/prd
 * Create a new PRD document
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new SyntaxError('Unexpected token in JSON');
    }

    // Validate request body
    const parsed = createPrdSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('입력 데이터가 유효하지 않습니다', {
        errors: parsed.error.issues,
      });
    }

    // Get authenticated user (optional for this endpoint)
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create document
    const { data, error } = await createPrdDocument(
      parsed.data.questionnaire_data,
      user?.id ?? null
    );

    if (error) {
      throw new DbError('문서 생성에 실패했습니다');
    }

    return createdResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/prd
 * List PRD documents for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AuthenticationError();
    }

    // Parse pagination from query params
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ?? '1';
    const limit = searchParams.get('limit') ?? '10';

    // Validate pagination
    const parsed = paginationSchema.safeParse({ page, limit });
    if (!parsed.success) {
      throw new ValidationError('페이지네이션 파라미터가 유효하지 않습니다', {
        errors: parsed.error.issues,
      });
    }

    // Get documents
    const { data, count, error } = await getUserPrdDocuments(
      user.id,
      parsed.data.page,
      parsed.data.limit
    );

    if (error) {
      throw new DbError('문서 목록 조회에 실패했습니다');
    }

    return paginatedResponse(data ?? [], {
      page: parsed.data.page,
      limit: parsed.data.limit,
      total: count ?? 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
